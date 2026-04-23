from app.schemas import MatchResultResponse, PlayerResult


MATCH_RESULTS: dict[str, MatchResultResponse] = {
    "mock-match-001": MatchResultResponse(
        match_id="mock-match-001",
        game="Survivor",
        rounds=3,
        winner="Alice",
        players=[
            PlayerResult(name="Alice", score=10, status="alive"),
            PlayerResult(name="Bob", score=8, status="eliminated"),
            PlayerResult(name="Carol", score=6, status="eliminated"),
        ],
        summary="Alice survives to the end and wins the mock match.",
    )
}
