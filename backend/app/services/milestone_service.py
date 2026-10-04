import json
from functools import lru_cache
from pathlib import Path
CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "milestones.json"
@lru_cache
def load_milestone_config() -> dict:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    # Preserve the source data verbatim while exposing an explicit extension
    # contract. The referenced source document is not present in this repo, so
    # provenance is intentionally marked unverified rather than asserted.
    source = config.get("source", "Unspecified legacy source")
    for item in config["milestones"]:
        item.setdefault("question", item.get("description", ""))
        item.setdefault("response_type", "YES_NO_UNSURE")
        item.setdefault("dataset_version", config.get("version", "unknown"))
        item.setdefault("source_reference", {"label": source, "status": "unverified_in_repository"})
        item.setdefault("red_flag", False)
        item.setdefault("risk_factor_ids", [])
        item.setdefault("explanation", None)
        item.setdefault("activity_ids", [])
    config.setdefault("schema_version", 2)
    return config
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
