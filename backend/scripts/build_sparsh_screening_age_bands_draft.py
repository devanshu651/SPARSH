"""Generate age-banded draft forms without touching production screening data."""

from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.models.sparsh_age_band_draft import build_age_band_draft
from app.models.sparsh_screening_draft import DraftQuestionnaireManifest


ROOT = Path(__file__).resolve().parents[2]
MANIFEST_PATH = ROOT / "backend/app/config/sparsh_screening_questionnaire_draft.json"
OUTPUT_PATH = ROOT / "backend/app/config/sparsh_screening_age_bands_draft.json"
REPORT_PATH = ROOT / "docs/sparsh-screening-age-band-review.md"
DOMAIN_ORDER = ["gross_motor", "fine_motor", "language", "cognitive", "social_emotional"]
DOMAIN_LABELS = {
    "gross_motor": "Gross Motor",
    "fine_motor": "Fine Motor",
    "language": "Language",
    "cognitive": "Cognitive",
    "social_emotional": "Social Emotional",
}


def render_report(data: dict) -> str:
    rows = []
    details = []
    for band in data["age_bands"]:
        counts = {domain: len(band["questions"][domain]) for domain in DOMAIN_ORDER}
        total = sum(counts.values())
        rows.append(
            f"| {band['min_months']}–{band['max_months']} | "
            + " | ".join(str(counts[domain]) for domain in DOMAIN_ORDER)
            + f" | {total} |"
        )
        details.extend(
            [
                f"### {band['min_months']}–{band['max_months']} months",
                "",
                "| Domain | Draft question references | IDs |",
                "|---|---:|---|",
            ]
        )
        for domain in DOMAIN_ORDER:
            refs = band["questions"][domain]
            ids = ", ".join(f"`{ref['item_id']}`" for ref in refs) or "None"
            details.append(f"| {DOMAIN_LABELS[domain]} | {len(refs)} | {ids} |")
        details.append("")
        for domain in DOMAIN_ORDER:
            count = counts[domain]
            if count >= 8:
                continue
            if domain in {"gross_motor", "fine_motor"}:
                reason = (
                    "Available motor items use AAP mean-age surveillance anchors or WHO "
                    "attainment windows. Those are preserved, but do not establish screening "
                    "applicability; professional age review/source expansion is required."
                )
            else:
                reason = (
                    f"Only {count} distinct source-mapped candidates from the selected 50-item "
                    "pool meet the conservative no-future-source-age draft mapping for this band. "
                    "No extra milestones were invented or borrowed from another domain."
                )
            details.append(
                f"- **{DOMAIN_LABELS[domain]} ({count}/8): Below target — professional "
                f"review/source expansion required.** {reason}"
            )
        details.append("")

    return "\n".join(
        [
            "# SPARSH screening age-band draft review",
            "",
            "**Manifest:** `sparsh_screening_questionnaire_draft.json`",
            "**Age-band version:** `draft-age-bands-v1`",
            "**Status:** pending professional review",
            "**Clinical validation:** false",
            "**Production activation:** not authorized",
            "",
            "## Mapping rule and limits",
            "",
            "This file creates age-banded **review forms** from the existing 50-item draft manifest. It does not modify or feed the production selector. An item is included as a candidate when its source point/mean age, or the lower bound of its preserved source attainment window, is no later than the band's upper bound. The per-domain cap is eight; nearest earlier source anchors/windows appear first. Every reference carries `age_applicability_review_required: true` and `pending_professional_review`.",
            "",
            "The upper-bound rule prevents assigning a source anchor/window that is wholly later than a younger band. It does not establish applicability to every child in a broad band: for example, a 2-month CDC anchor appearing in the 0–5 month form still needs review before it could be asked of a younger infant. AAP values remain means, WHO ranges remain attainment windows, and neither is converted into an exact cutoff. These are draft forms for expert adjudication, not live age selection.",
            "",
            "CDC source ages are monitoring checklist placements, not screening cutoffs or validation of SPARSH. AAP source ages are mean surveillance ages. WHO source intervals describe attainment windows. The WHO window lower bound is used only to identify whether a source interval begins before the band's upper bound; it is not rewritten as an item age. See [CDC guidance](https://www.cdc.gov/act-early/milestones/key-points.html), [AAP motor report](https://publications.aap.org/pediatrics/article/131/6/e2016/31072/Motor-Delays-Early-Identification-and-Evaluation), and [WHO motor window tables](https://www.who.int/tools/child-growth-standards/standards/motor-development-milestones).",
            "",
            "## Coverage by age band",
            "",
            "Counts are draft references, not approved or selectable screening questions. Target is up to 8 per domain (40 per band).",
            "",
            "| Age band | GM | FM | Language | Cognitive | Social | Total |",
            "|---|---:|---:|---:|---:|---:|---:|",
            *rows,
            "",
            "All 50 source items remain pending professional review and rights review where indicated. The source-linked manifest is the authority for exact wording, source, source-age semantics, and rights status. The age-band file links every question using the stable manifest `item_id`.",
            "",
            "## Below-target domains and item references",
            "",
            *details,
            "## Activation boundary",
            "",
            "Do not connect this file to the screening API until reviewers approve the intended age applicability for each item and band, resolve domain/wording/rights questions, and separately approve the screening instrument and scoring use. `clinical_validation` remains false. The production `milestones.json`, scoring rules, API, frontend, authentication, referral behavior, and deployment are outside this phase.",
            "",
        ]
    )


def main() -> None:
    raw = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    manifest = DraftQuestionnaireManifest.model_validate(raw)
    data = build_age_band_draft(manifest)
    OUTPUT_PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    REPORT_PATH.write_text(render_report(data), encoding="utf-8")
    print(f"Wrote {len(data['age_bands'])} draft age bands to {OUTPUT_PATH}")
    for band in data["age_bands"]:
        counts = Counter(
            domain
            for domain, refs in band["questions"].items()
            for _ in refs
        )
        total = sum(counts.values())
        print(
            f"{band['min_months']}-{band['max_months']}: "
            + ", ".join(f"{domain}={counts[domain]}" for domain in DOMAIN_ORDER)
            + f", total={total}"
        )


if __name__ == "__main__":
    main()
