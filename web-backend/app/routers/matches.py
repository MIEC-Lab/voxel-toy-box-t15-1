from fastapi import APIRouter, HTTPException

from app.schemas import MatchCreateResponse, MatchResultResponse, StartMatchRequest
from app.services import create_match as create_match_service, get_match_result_by_id


router = APIRouter(prefix="/api/matches", tags=["matches"])


@router.post("", response_model=MatchCreateResponse)
async def create_match(payload: StartMatchRequest) -> MatchCreateResponse:
    return await create_match_service(payload)


@router.get("/{match_id}", response_model=MatchResultResponse)
def get_match(match_id: str) -> MatchResultResponse:
    result = get_match_result_by_id(match_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Match result not found")
    return result
