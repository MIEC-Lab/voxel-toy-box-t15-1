import json
import os
from typing import Any
from uuid import uuid4
from urllib.parse import urljoin

from app.schemas import MatchResultResponse, PlayerResult, RoundLog, StartMatchRequest
from app.simulator import normalize_players


class ArenaUnavailableError(RuntimeError):
    """Raised when the external Arena stack is not ready for a real match."""


def should_use_arena(payload: StartMatchRequest) -> bool:
    env_value = os.getenv("SOCIALCOMPACT_USE_ARENA", "").lower()
    return payload.use_arena or env_value in {"1", "true", "yes", "on"}


async def start_arena_match(
    payload: StartMatchRequest,
    match_id: str,
) -> MatchResultResponse:
    arena_url = os.getenv("SOCIALCOMPACT_ARENA_URL", "http://127.0.0.1:9009")
    player_urls = _configured_player_urls(payload)
    players = normalize_players(payload)

    if len(player_urls) < 2:
        raise ArenaUnavailableError(
            "Arena mode needs at least two player agent URLs."
        )

    participants = {
        players[index] if index < len(players) else f"Player{index + 1}": url
        for index, url in enumerate(player_urls)
    }

    await _check_agent_card("Arena", arena_url)
    for name, url in participants.items():
        await _check_agent_card(name, url)

    try:
        import httpx
        from a2a.client import A2AClient
        from a2a.client.errors import A2AClientTimeoutError
        from a2a.types import MessageSendParams, SendMessageRequest
    except ImportError as exc:
        raise ArenaUnavailableError(
            "Install a2a-sdk and httpx to enable Arena mode."
        ) from exc

    json_message = {
        "participants": participants,
        "config": {
            "games": [payload.game],
            "scenarios": [1],
            "min_size": len(participants),
            "max_size": len(participants),
            "max_runs": 1,
            "max_turns": max(payload.rounds, 1),
        },
    }
    send_message_payload = {
        "message": {
            "role": "user",
            "parts": [{"kind": "text", "text": json.dumps(json_message)}],
            "messageId": uuid4().hex,
        }
    }
    request = SendMessageRequest(
        id=str(uuid4()),
        params=MessageSendParams(**send_message_payload),
    )

    try:
        async with httpx.AsyncClient(timeout=20) as httpx_client:
            a2a_client = A2AClient(httpx_client=httpx_client, url=arena_url)
            response = await a2a_client.send_message(request)
    except A2AClientTimeoutError:
        return _pending_arena_result(payload, match_id, participants)
    except Exception as exc:
        raise ArenaUnavailableError(f"Arena request failed: {exc}") from exc

    response_data = response.model_dump(mode="json", exclude_none=True)
    result = _convert_arena_response(payload, match_id, response_data)
    if result is not None:
        return result
    return _pending_arena_result(payload, match_id, participants)


def _configured_player_urls(payload: StartMatchRequest) -> list[str]:
    if payload.player_urls:
        return [url.strip() for url in payload.player_urls if url.strip()]

    env_urls = os.getenv("SOCIALCOMPACT_PLAYER_URLS", "")
    return [url.strip() for url in env_urls.split(",") if url.strip()]


async def _check_agent_card(name: str, address: str) -> None:
    try:
        import httpx
    except ImportError as exc:
        raise ArenaUnavailableError("Install httpx to check Arena services.") from exc

    try:
        async with httpx.AsyncClient(timeout=4) as client:
            response = await client.get(urljoin(address, "/.well-known/agent-card.json"))
            response.raise_for_status()
    except Exception as exc:
        raise ArenaUnavailableError(f"{name} is not reachable at {address}.") from exc


def _pending_arena_result(
    payload: StartMatchRequest,
    match_id: str,
    participants: dict[str, str],
) -> MatchResultResponse:
    players = [
        PlayerResult(name=name, score=0, status="running")
        for name in participants.keys()
    ]
    return MatchResultResponse(
        match_id=match_id,
        game=payload.game,
        rounds=0,
        winner="Pending",
        players=players,
        summary="Arena accepted the match request, but final artifacts were not returned synchronously.",
        source="arena",
        status="running",
        round_logs=[],
    )


def _convert_arena_response(
    payload: StartMatchRequest,
    match_id: str,
    response_data: dict[str, Any],
) -> MatchResultResponse | None:
    game_log = _find_game_log(response_data)
    if game_log is not None:
        return _convert_game_log(payload, match_id, game_log)

    results = _find_key(response_data, "results")
    if isinstance(results, list) and results:
        return _convert_results_table(payload, match_id, results)

    return None


def _convert_game_log(
    payload: StartMatchRequest,
    match_id: str,
    game_log: dict[str, Any],
) -> MatchResultResponse:
    scores = game_log.get("Scores") or {}
    participants = game_log.get("Participants") or {}
    winner_agent = max(scores, key=scores.get) if scores else None
    winner = participants.get(winner_agent, winner_agent or "Unknown")

    players = [
        PlayerResult(
            name=participants.get(agent, agent),
            score=int(score),
            status="winner" if agent == winner_agent else "finished",
        )
        for agent, score in sorted(scores.items(), key=lambda item: (-item[1], item[0]))
    ]
    round_logs = _convert_round_logs(game_log.get("Rounds") or [])

    return MatchResultResponse(
        match_id=match_id,
        game=str(game_log.get("Game") or payload.game),
        rounds=len(round_logs),
        winner=str(winner),
        players=players,
        summary=f"{winner} wins the Arena match.",
        source="arena",
        status="completed" if game_log.get("Completed") else "running",
        round_logs=round_logs,
    )


def _convert_results_table(
    payload: StartMatchRequest,
    match_id: str,
    results: list[dict[str, Any]],
) -> MatchResultResponse:
    sorted_rows = sorted(results, key=lambda row: row.get("score", 0), reverse=True)
    winner_row = sorted_rows[0]
    players = [
        PlayerResult(
            name=str(row.get("name") or row.get("agent") or "Unknown"),
            score=int(row.get("score") or 0),
            status="winner" if row is winner_row else "finished",
        )
        for row in sorted_rows
    ]
    winner = players[0].name

    return MatchResultResponse(
        match_id=match_id,
        game=str(winner_row.get("game") or payload.game),
        rounds=max(payload.rounds, 1),
        winner=winner,
        players=players,
        summary=f"{winner} wins the Arena match.",
        source="arena",
        status="completed",
        round_logs=[],
    )


def _convert_round_logs(rounds: list[Any]) -> list[RoundLog]:
    round_logs: list[RoundLog] = []
    for index, item in enumerate(rounds, start=1):
        if not isinstance(item, dict):
            continue
        observations = item.get("Observations") or {}
        events = []
        if isinstance(observations, dict):
            events = [str(value) for value in observations.values() if value]
        elif observations:
            events = [str(observations)]

        states = item.get("NewStates")
        remaining = []
        if isinstance(states, dict):
            remaining = list(states.keys())

        round_logs.append(
            RoundLog(
                round=int(item.get("Round") or index),
                events=events,
                remaining_players=remaining,
            )
        )
    return round_logs


def _find_game_log(data: Any) -> dict[str, Any] | None:
    if isinstance(data, dict):
        if {"Game", "Scores", "Participants"}.issubset(data.keys()):
            return data
        for value in data.values():
            found = _find_game_log(value)
            if found is not None:
                return found
    elif isinstance(data, list):
        for item in data:
            found = _find_game_log(item)
            if found is not None:
                return found
    return None


def _find_key(data: Any, target_key: str) -> Any:
    if isinstance(data, dict):
        if target_key in data:
            return data[target_key]
        for value in data.values():
            found = _find_key(value, target_key)
            if found is not None:
                return found
    elif isinstance(data, list):
        for item in data:
            found = _find_key(item, target_key)
            if found is not None:
                return found
    return None
