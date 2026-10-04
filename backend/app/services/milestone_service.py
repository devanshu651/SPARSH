import json
from functools import lru_cache
from pathlib import Path
from app.services.milestone_content_service import parse_milestone_content
CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "milestones.json"
@lru_cache
def load_milestone_config() -> dict:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    if "items" in config:
        # Validate the active age-aware catalog before exposing its records to
        # the existing scoring and API contracts.
        dataset = parse_milestone_content(config)
        projected = []
        for typed_item in dataset.items:
            item = typed_item.model_dump(mode="json")
            question = item["question"]
            if isinstance(question, dict):
                question = question.get("en", "")
            item["question"] = question
            item["description"] = question
            item["age_metadata"] = item["age"]
            projected.append(item)
        config["milestones"] = projected
    # Preserve the source data verbatim while exposing an explicit extension
    # contract. The referenced source document is not present in this repo, so
    # provenance is intentionally marked unverified rather than asserted.
    source = config.get("source", "Unspecified legacy source")
    for item in config["milestones"]:
        item.setdefault("question", item.get("description", ""))
        item.setdefault("response_type", "YES_NO_UNSURE")
        item.setdefault("dataset_version", config.get("version", "unknown"))
        if not item.get("source_references"):
            item.setdefault("source_reference", {"label": source, "status": "unverified_in_repository"})
        item.setdefault("red_flag", False)
        item.setdefault("risk_factor_ids", [])
        item.setdefault("explanation", None)
        item.setdefault("activity_ids", [])
        # Age evidence is carried with each active Phase 5 item. It is not
        # collapsed into the legacy integer checkpoint selector.
        item.setdefault("age_metadata", item.get("age"))
    config.setdefault("schema_version", 2)
    return config
def milestones_for_age(age_months: int) -> tuple[int, list[dict]]:
    config = load_milestone_config()
    milestones = config["milestones"]
    if config.get("selection_policy") == "all_items_as_one_versioned_65_question_set":
        # The active manifest is a fixed 65-item set with mixed age evidence.
        # Return the whole manifest while retaining the child's authoritative
        # completed age as the screening age captured by the legacy wire field.
        return age_months, milestones
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
