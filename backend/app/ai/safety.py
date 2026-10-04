"""Minimal output guard for the deterministic, context-grounded assistant."""
FORBIDDEN_CLAIMS = ("diagnosed with", "has autism", "has adhd", "confirmed disorder")


def is_safe_text(text: str) -> bool:
    lowered = text.lower()
    return not any(claim in lowered for claim in FORBIDDEN_CLAIMS)
