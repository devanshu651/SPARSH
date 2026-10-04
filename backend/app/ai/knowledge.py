"""Small, approved-in-repository knowledge lookup; no generated clinical text."""
from app.services.milestone_service import milestones_by_id


def missed_milestone_text(answers: list[dict]) -> list[dict]:
    catalog = milestones_by_id()
    return [
        {"text": catalog[item_id].get("question", catalog[item_id].get("description", "")), "domain": catalog[item_id]["domain"]}
        for answer in answers
        if answer.get("response") == "NO"
        and (item_id := answer.get("milestone_id")) in catalog
    ]
