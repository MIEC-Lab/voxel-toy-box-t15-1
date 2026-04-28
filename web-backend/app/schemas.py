from pydantic import BaseModel, Field


class GameListResponse(BaseModel):
    games: list[str]


class PlayerResult(BaseModel):
    name: str
    score: int
    status: str


class RoundLog(BaseModel):
    round: int
    events: list[str] = Field(default_factory=list)
    remaining_players: list[str] = Field(default_factory=list)


class MatchResultResponse(BaseModel):
    match_id: str
    game: str
    rounds: int
    winner: str
    players: list[PlayerResult]
    summary: str
    source: str = "sample-data"
    status: str = "completed"
    round_logs: list[RoundLog] = Field(default_factory=list)


class StartMatchRequest(BaseModel):
    game: str = "Survivor"
    players: list[str] = Field(default_factory=list)
    rounds: int = 3
    player_urls: list[str] = Field(default_factory=list)
    use_arena: bool = False


class StartMatchResponse(BaseModel):
    match_id: str
    game: str
    rounds: int
    player_count: int
    status: str
    message: str


class DataSourceResponse(BaseModel):
    source: str
    match_count: int
    matches: list[str]


class HealthResponse(BaseModel):
    status: str
    service: str = "web-backend"
    version: str = "1.0.0"


class MatchCreateResponse(BaseModel):
    id: str
    game: str
    rounds: int
    player_count: int
    status: str
    message: str
    source: str = "local-simulation"
    result: MatchResultResponse | None = None
