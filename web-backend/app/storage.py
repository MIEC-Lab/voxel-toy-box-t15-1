import json
from pathlib import Path

from app.schemas import MatchResultResponse


BASE_DIR = Path(__file__).resolve().parent.parent
SAMPLE_DATA_DIR = BASE_DIR / "sample-data"


def ensure_sample_data_dir() -> None:
    SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_sample_result_path(match_id: str) -> Path:
    return SAMPLE_DATA_DIR / f"{match_id}.json"


def save_match_result(result: MatchResultResponse) -> None:
    ensure_sample_data_dir()
    path = get_sample_result_path(result.match_id)
    path.write_text(result.model_dump_json(indent=2), encoding="utf-8")


def load_match_result(match_id: str) -> MatchResultResponse | None:
    path = get_sample_result_path(match_id)
    if not path.exists():
        return None
    return MatchResultResponse.model_validate(json.loads(path.read_text(encoding="utf-8")))


def list_saved_match_ids() -> list[str]:
    ensure_sample_data_dir()
    return sorted(path.stem for path in SAMPLE_DATA_DIR.glob("*.json"))
