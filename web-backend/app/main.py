from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.games import router as games_router
from app.routers.matches import router as matches_router
from app.routers.results import router as results_router
from app.schemas import HealthResponse


app = FastAPI(
    title="SocialCOMPACT Web Backend",
    description="Minimal backend API for the SocialCOMPACT web frontend.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {"message": "SocialCOMPACT backend is running"}


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok")


@app.get("/api/health", response_model=HealthResponse)
def api_health() -> HealthResponse:
    return HealthResponse(status="ok")


app.include_router(games_router)
app.include_router(matches_router)
app.include_router(results_router)
