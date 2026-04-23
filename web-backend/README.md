# web-backend

FastAPI backend for the SocialCOMPACT web demo.

The default path runs a local Survivor simulation and saves the result to
`sample-data/`. If Arena and player agents are running, the same endpoint can
try the real A2A Arena flow.

## Setup

```powershell
cd web-backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## Start The Backend

```powershell
uvicorn app.main:app --reload
```

Default URL: `http://127.0.0.1:8000`

## Main Endpoints

- `GET /health`
- `GET /api/health`
- `GET /api/games`
- `POST /api/matches`
- `GET /api/matches/{match_id}`
- `GET /api/results/{match_id}`
- `GET /api/results/source/files`

## Start A Local Simulation

```powershell
curl -X POST http://127.0.0.1:8000/api/matches `
  -H "Content-Type: application/json" `
  -d "{\"game\":\"Survivor\",\"players\":[\"Alice\",\"Bob\",\"Carol\"],\"rounds\":3}"
```

The response includes a `match_id`. Open:

```text
http://127.0.0.1:8000/api/results/{match_id}
```

## Optional Arena Mode

Copy `.env.example` values into your shell or deployment environment:

```powershell
$env:SOCIALCOMPACT_ARENA_URL="http://127.0.0.1:9009"
$env:SOCIALCOMPACT_PLAYER_URLS="http://127.0.0.1:9018,http://127.0.0.1:9019"
$env:SOCIALCOMPACT_USE_ARENA="true"
```

Then start the Arena and player agent services from `agentbeats/`.

When Arena mode is requested but unavailable, the backend falls back to the
local simulation and marks the result source as `local-fallback`.
