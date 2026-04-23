from app.data import MATCH_RESULTS
from app.schemas import MatchCreateResponse, MatchResultResponse, PlayerResult, StartMatchRequest
from app.storage import load_match_result, save_match_result


def get_match_result_by_id(match_id: str) -> MatchResultResponse | None:
    result = MATCH_RESULTS.get(match_id)
    if result is None:
        result = load_match_result(match_id)
    return result


def create_mock_match(payload: StartMatchRequest) -> MatchCreateResponse:
    match_id = f"mock-{payload.game.lower().replace(' ', '-')}-{len(MATCH_RESULTS) + 1:03d}"
    winner = payload.players[0] if payload.players else "TBD"
    players = [
        PlayerResult(
            name=player_name,
            score=max(len(payload.players) - index, 0) * 2,
            status="alive" if index == 0 else "eliminated",
        )
        for index, player_name in enumerate(payload.players)
    ]

    MATCH_RESULTS[match_id] = MatchResultResponse(
        match_id=match_id,
        game=payload.game,
        rounds=payload.rounds,
        winner=winner,
        players=players,
        summary="This is a placeholder match result generated for frontend integration.",
    )
    save_match_result(MATCH_RESULTS[match_id])

    return MatchCreateResponse(
        id=match_id,
        game=payload.game,
        rounds=payload.rounds,
        player_count=len(payload.players),
        status="created",
        message="Mock match created successfully.",
    )
