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
    totals = {domain: {"missed_weight": 0.0, "missed_count": 0, "unsure_count": 0, "answered_count": 0} for domain in configured_domains()}
    total = 0.0
    red_flag_ids = []
    risk_factor_ids = set()
    answered_domains = set()
    available_weight = sum(milestones[answer["milestone_id"]]["weight"] for answer in answers)
    for answer in answers:
        milestone = milestones[answer["milestone_id"]]; domain = milestone["domain"]
        bucket = totals[domain]
        answered_domains.add(domain)
        bucket["answered_count"] += 1
        if milestone.get("red_flag") is True and answer["response"] in {"NO", "UNSURE"}:
            red_flag_ids.append(milestone["id"])
        if answer["response"] in {"NO", "UNSURE"}:
            risk_factor_ids.update(milestone.get("risk_factor_ids", []))
        if answer["response"] == "NO": weight = milestone["weight"]; bucket["missed_count"] += 1
        elif answer["response"] == "UNSURE": weight = milestone["weight"] * config["unsure_weight_multiplier"]; bucket["unsure_count"] += 1
        else: continue
        bucket["missed_weight"] += weight; total += weight
    domains = {domain: DomainScore(**value, status="WATCH" if value["missed_weight"] >= config["domain_watch_weight"] else "OK") for domain, value in totals.items()}
    if red_flag_ids or total >= config["red_threshold"]: level, label = RiskLevel.RED, "HIGH"
    elif total >= config["yellow_threshold"]: level, label = RiskLevel.YELLOW, "MEDIUM"
    else: level, label = RiskLevel.GREEN, "LOW"
    findings = []
    if red_flag_ids:
        findings.append("Configured red-flag item response requires follow-up.")
    unreachable = [
        f"{name} ({threshold:g})"
        for name, threshold in (("YELLOW", config["yellow_threshold"]), ("RED", config["red_threshold"]))
        if available_weight < threshold
    ]
    if unreachable:
        findings.append(
            f"Technical scoring limitation: this checkpoint has {len(answers)} question(s) and a maximum numeric score of {available_weight:g}; configured threshold(s) {', '.join(unreachable)} cannot be reached by numeric scoring. Configured red-flag rules remain active. Risk indications are not comparable across checkpoints."
        )
    missing_domains = sorted(set(configured_domains()) - answered_domains)
    if missing_domains:
        findings.append(
            f"Technical coverage limitation: no questions were selected for {', '.join(missing_domains)} at this checkpoint; those domains were not assessed."
        )
    return {"risk_level": level, "risk_label": label, "total_missed_weight": total, "domain_scores": domains, "recommendation": config["recommendations"][level.value], "red_flag_ids": red_flag_ids, "risk_factor_ids": sorted(risk_factor_ids), "rule_findings": findings}

