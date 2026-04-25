from app.arena_client import (
    ArenaUnavailableError,
    should_use_arena,
    start_arena_match_background,
)
from app.data import MATCH_RESULTS
from app.schemas import MatchCreateResponse, MatchResultResponse, StartMatchRequest
from app.simulator import build_match_id, normalize_players, run_local_match
from app.storage import load_match_result, save_match_result


def get_match_result_by_id(match_id: str) -> MatchResultResponse | None:
    result = MATCH_RESULTS.get(match_id)
    if result is None:
        result = load_match_result(match_id)
    return result


async def create_match(payload: StartMatchRequest) -> MatchCreateResponse:
    match_id = build_match_id(payload.game)
    players = normalize_players(payload)

    if should_use_arena(payload):
        try:
            result = await start_arena_match_background(
                payload,
                match_id,
                _store_match_result,
            )
        except ArenaUnavailableError as exc:
            result = run_local_match(
                payload,
                match_id,
                source="local-fallback",
                note=f"Arena was unavailable: {exc}",
            )
    else:
        result = run_local_match(payload, match_id)

    _store_match_result(result)

    return MatchCreateResponse(
        id=match_id,
        game=result.game,
        rounds=result.rounds,
        player_count=len(players),
        status=result.status,
        message=_create_message(result),
        source=result.source,
        result=result,
    )


def create_mock_match(payload: StartMatchRequest) -> MatchCreateResponse:
    result = run_local_match(payload, build_match_id(payload.game))
    _store_match_result(result)

    return MatchCreateResponse(
        id=result.match_id,
        game=result.game,
        rounds=result.rounds,
        player_count=len(result.players),
        status=result.status,
        message=_create_message(result),
        source=result.source,
        result=result,
    )


def _store_match_result(result: MatchResultResponse) -> None:
    MATCH_RESULTS[result.match_id] = result
    save_match_result(result)


def _create_message(result: MatchResultResponse) -> str:
    if result.status == "running":
        return "Arena match request was sent. Results are still running."
    if result.source == "local-fallback":
        return "Arena was unavailable, so a local simulation result was created."
    if result.source == "arena":
        return "Arena match completed successfully."
    return "Local match simulation completed successfully."
