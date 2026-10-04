import json
from functools import lru_cache
from pathlib import Path
from app.services.milestone_content_service import checkpoint_items_for_age, parse_milestone_content
CONFIG_PATH = Path(__file__).resolve().parents[1] / "config" / "milestones.json"
DRAFT_QUESTIONNAIRE_PATH = Path(__file__).resolve().parents[1] / "config" / "sparsh_screening_questionnaire_draft.json"
DRAFT_AGE_BANDS_PATH = Path(__file__).resolve().parents[1] / "config" / "sparsh_screening_age_bands_draft.json"
PROTOTYPE_DISCLAIMER = "Prototype screening questionnaire. Content is based on referenced developmental milestone sources and is pending professional review. This is not a diagnostic assessment."
PROTOTYPE_DOMAINS = ("gross_motor", "fine_motor", "language", "cognitive", "social_emotional")


@lru_cache
def load_prototype_age_bands() -> tuple[dict, dict[str, dict]]:
    """Load the unvalidated questionnaire draft and its review-ready age mapping."""
    bands = json.loads(DRAFT_AGE_BANDS_PATH.read_text(encoding="utf-8"))
    questionnaire = json.loads(DRAFT_QUESTIONNAIRE_PATH.read_text(encoding="utf-8"))
    return bands, {item["id"]: item for item in questionnaire["items"]}


def prototype_milestones_for_age(age_months: int) -> tuple[int | None, list[dict], dict | None]:
    """Return references in the age band's draft, excluding future source ages."""
    if age_months < 0:
        raise ValueError("age_months must be non-negative")
    bands, questions_by_id = load_prototype_age_bands()
    band = next((candidate for candidate in bands["age_bands"] if candidate["min_months"] <= age_months <= candidate["max_months"]), None)
    if band is None:
        return None, [], None
    selected = []
    for domain in PROTOTYPE_DOMAINS:
        for ref in band["questions"].get(domain, []):
            source_floor = ref.get("source_age_months")
            source_range = ref.get("source_age_range_months")
            if source_floor is None and source_range:
                source_floor = source_range[0]
            if source_floor is not None and float(source_floor) > age_months:
                continue
            item = dict(questions_by_id[ref["item_id"]])
            item.update({
                "domain": domain,
                "description": item["question"],
                "weight": 1,
                "response_type": "YES_NO_UNSURE",
                "red_flag": False,
                "risk_factor_ids": [],
                "dataset_version": bands["version"],
                "age_metadata": {
                    "source_age_months": ref.get("source_age_months"),
                    "source_age_range_months": source_range,
                    "source_age_semantics": ref["source_age_semantics"],
                    "age_applicability_review_required": True,
                    "rights_status": ref["rights_status"],
                },
                "age_applicability_review_required": True,
                "clinical_validation": False,
                "review_status": bands["review_status"],
            })
            selected.append(item)
    band_metadata = {"min_months": band["min_months"], "max_months": band["max_months"], "label": f"{band['min_months']}–{band['max_months']} months"}
    return band["min_months"], selected, band_metadata


def prototype_milestones_by_id() -> dict[str, dict]:
    _, questions_by_id = load_prototype_age_bands()
    return {item_id: dict(item, weight=1, red_flag=False, risk_factor_ids=[]) for item_id, item in questions_by_id.items()}
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
    if "items" in config:
        # Only explicit source checkpoints participate in automatic selection.
        # WHO attainment ranges and review-required items remain in the active
        # catalog but cannot become age cutoffs or join a set by fallback.
        dataset = parse_milestone_content(config)
        checkpoint, selected_content = checkpoint_items_for_age(dataset, age_months)
        by_id = {item["id"]: item for item in milestones}
        return checkpoint, [by_id[item.id] for item in selected_content]
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
