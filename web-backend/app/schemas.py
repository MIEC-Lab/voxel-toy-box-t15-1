from pydantic import BaseModel


class GameListResponse(BaseModel):
    games: list[str]


class PlayerResult(BaseModel):
    name: str
    score: int
    status: str


class MatchResultResponse(BaseModel):
    match_id: str
    game: str
    rounds: int
    winner: str
    players: list[PlayerResult]
    summary: str


class StartMatchRequest(BaseModel):
    game: str
    players: list[str]
    rounds: int = 3


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


class MatchCreateResponse(BaseModel):
    id: str
    game: str
    rounds: int
    player_count: int
    status: str
    message: str
