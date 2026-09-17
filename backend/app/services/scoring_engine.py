import json
from functools import lru_cache
from pathlib import Path
from app.models.screening import DomainScore, RiskLevel
from app.services.milestone_service import configured_domains
RULES_PATH = Path(__file__).resolve().parents[1] / "config" / "scoring_rules.json"
@lru_cache
def rules() -> dict: return json.loads(RULES_PATH.read_text(encoding="utf-8-sig"))
def calculate_risk(answers: list[dict], milestones: dict[str, dict]) -> dict:
    config = rules()
    # Initialise all configured domains.  An all-YES screening is still a
    # complete profile, rather than an empty object that breaks reports.
    totals = {domain: {"missed_weight": 0.0, "missed_count": 0, "unsure_count": 0} for domain in configured_domains()}
    total = 0.0
    for answer in answers:
        milestone = milestones[answer["milestone_id"]]; domain = milestone["domain"]
        bucket = totals[domain]
        if answer["response"] == "NO": weight = milestone["weight"]; bucket["missed_count"] += 1
        elif answer["response"] == "UNSURE": weight = milestone["weight"] * config["unsure_weight_multiplier"]; bucket["unsure_count"] += 1
        else: continue
        bucket["missed_weight"] += weight; total += weight
    domains = {domain: DomainScore(**value, status="WATCH" if value["missed_weight"] >= config["domain_watch_weight"] else "OK") for domain, value in totals.items()}
    if total >= config["red_threshold"]: level, label = RiskLevel.RED, "HIGH"
    elif total >= config["yellow_threshold"]: level, label = RiskLevel.YELLOW, "MEDIUM"
    else: level, label = RiskLevel.GREEN, "LOW"
    return {"risk_level": level, "risk_label": label, "total_missed_weight": total, "domain_scores": domains, "recommendation": config["recommendations"][level.value]}

