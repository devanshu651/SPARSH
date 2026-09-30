from typing import Protocol

from app.ai.schemas import AssistantRequest
from app.ai.safety import is_safe_text


class AssistantProvider(Protocol):
    def respond(self, request: AssistantRequest, screening: dict, history: list[dict]) -> str: ...


def respond(request: AssistantRequest, screening: dict, history: list[dict]) -> str:
    level = screening.get("risk_level", "unknown")
    if request.action == "explain_missed":
        items = screening.get("missed_milestones", [])
        descriptions = "; ".join(item["text"] for item in items if item.get("text"))
        text = "Responses marked No: " + (descriptions or "none in this screening summary") + ". These responses alone do not establish a diagnosis."
    elif request.action == "next_steps":
        text = screening.get("recommendation", "Review the screening with the appropriate supervisor or clinician.")
    elif request.action in {"history_summary", "parent_summary"}:
        text = f"There are {len(history)} recorded screenings. The latest screening indication is {level}. Please discuss any concerns with the appropriate health professional."
    else:
        text = f"The screening indication is {level}. {screening.get('recommendation', '')} This is a screening result and does not provide a diagnosis."
    if request.language == "hi":
        if request.action == "explain_missed":
            items = screening.get("missed_milestones", [])
            descriptions = "; ".join(item["text"] for item in items if item.get("text"))
            text = "जिन प्रश्नों का उत्तर ‘नहीं’ दर्ज हुआ: " + (descriptions or "इस स्क्रीनिंग सारांश में कोई नहीं") + "। प्रश्नों की सामग्री मूल रूप से अंग्रेज़ी में है; यह स्क्रीनिंग संकेत है, निदान नहीं।"
        elif request.action == "next_steps":
            text = screening.get("recommendation_hi", "परिणाम की समीक्षा करें और आवश्यकतानुसार उपयुक्त स्वास्थ्य पेशेवर से चर्चा करें।")
        elif request.action in {"history_summary", "parent_summary"}:
            text = f"कुल {len(history)} स्क्रीनिंग दर्ज हैं। नवीनतम स्क्रीनिंग संकेत {level} है। किसी चिंता पर उपयुक्त स्वास्थ्य पेशेवर से चर्चा करें।"
        else:
            text = f"स्क्रीनिंग संकेत {level} है। यह परिणाम निदान नहीं है।"
    if not is_safe_text(text):
        return "This screening result needs human review. It cannot provide a diagnosis."
    return text


class LocalGroundedProvider:
    """Safe built-in provider; future providers must preserve this interface."""

    def respond(self, request: AssistantRequest, screening: dict, history: list[dict]) -> str:
        return respond(request, screening, history)
