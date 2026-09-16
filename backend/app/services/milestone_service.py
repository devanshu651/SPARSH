import json
from functools import lru_cache
from pathlib import Path
CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "milestones.json"
@lru_cache
def load_milestone_config() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
def milestones_for_age(age_months: int) -> tuple[int, list[dict]]:
    milestones = load_milestone_config()["milestones"]
    checkpoints = sorted({item["age_months"] for item in milestones})
    checkpoint = max((item for item in checkpoints if item <= age_months), default=checkpoints[0])
    return checkpoint, [item for item in milestones if item["age_months"] == checkpoint]
def milestones_by_id() -> dict[str, dict]:
    return {item["id"]: item for item in load_milestone_config()["milestones"]}


def configured_domains() -> list[str]:
    """Return the domain identifiers represented by the configured dataset."""
    return list(dict.fromkeys(item["domain"] for item in load_milestone_config()["milestones"]))


def validate_checkpoint_answers(expected: list[dict], submitted_ids: list[str]) -> None:
    """Validate answer identity/completeness independently of the HTTP layer."""
    expected_ids = {item["id"] for item in expected}
    if len(submitted_ids) != len(set(submitted_ids)):
        raise ValueError("Each milestone may be answered once")
    invalid = set(submitted_ids) - expected_ids
    if invalid:
        raise ValueError(f"Milestones are not valid for the child's current checkpoint: {sorted(invalid)}")
    missing = expected_ids - set(submitted_ids)
    if missing:
        raise ValueError(f"Answer every screening question before submitting. Missing milestones: {sorted(missing)}")
