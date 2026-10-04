"""Deterministic, versioned feature extraction for future validated models."""

FEATURE_SCHEMA_VERSION = "1"


def extract_features(*, checkpoint_age_months: int, answers: list[dict], milestones: dict[str, dict], domain_scores: dict, milestone_dataset_version: str | None = None, red_flag_ids: list[str] | None = None, risk_factor_ids: list[str] | None = None, previous_screenings: list[dict] | None = None) -> dict:
    responses = {"YES": 0, "NO": 0, "UNSURE": 0}
    for answer in answers:
        if answer.get("response") in responses:
            responses[answer["response"]] += 1
    return {
        "schema_version": FEATURE_SCHEMA_VERSION,
        "checkpoint_age_months": checkpoint_age_months,
        "milestone_dataset_version": milestone_dataset_version,
        "response_counts": responses,
        "milestone_responses": {answer["milestone_id"]: answer["response"] for answer in answers if answer.get("milestone_id") in milestones},
        "domain_scores": {key: value.model_dump() if hasattr(value, "model_dump") else dict(value) for key, value in domain_scores.items()},
        "red_flag_count": len(red_flag_ids or []),
        "risk_factor_ids": list(risk_factor_ids or []),
        "previous_screening_count": len(previous_screenings or []),
        "previous_risk_levels": [item.get("risk_level") for item in previous_screenings or [] if item.get("risk_level")],
        "milestone_count": sum(1 for item in answers if item.get("milestone_id") in milestones),
    }
