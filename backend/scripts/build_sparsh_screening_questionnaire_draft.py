"""Build a reviewable, non-production questionnaire from audited candidates."""

from __future__ import annotations

import json
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SOURCE_PATH = ROOT / "backend/app/config/milestones_expansion_candidate.json"
MANIFEST_PATH = ROOT / "backend/app/config/sparsh_screening_questionnaire_draft.json"
DOC_PATH = ROOT / "docs/sparsh-screening-questionnaire-draft.md"

SELECTION = {
    "gross_motor": [
        "gm_aap13_02_head_lift",
        "gm_aap13_04_roll_prone_supine",
        "gm_aap13_04_prone_support",
        "gm_aap13_06_roll_supine_prone",
        "gm_aap13_06_sit_unsupported",
        "gm_aap13_09_crawl",
        "gm_aap13_12_stand",
        "gm_aap13_12_walk",
        "gm_who06_stand_assisted",
        "gm_who06_walk_assisted",
    ],
    "fine_motor": [
        "fm_aap13_04_grasp",
        "fm_aap13_06_reach_cube",
        "fm_aap13_06_transfer",
        "fm_aap13_06_rake",
        "fm_aap13_09_three_finger_pickup",
        "fm_aap13_12_pincer",
        "fm_aap13_12_bang_objects",
        "fm_aap13_15_scribble_imitation",
        "fm_aap13_18_two_block_tower",
        "fm_aap13_36_circle",
    ],
    "language": [
        "la_2_02",
        "la_4_02",
        "la_6_01",
        "la_6_02",
        "la_9_01",
        "la_12_01",
        "la_18_02",
        "la_24_01",
        "la_36_03",
        "la_48_01",
    ],
    "cognitive": [
        "co_2_01",
        "co_2_02",
        "co_6_01",
        "co_6_02",
        "co_6_03",
        "co_9_01",
        "co_12_02",
        "co_18_01",
        "co_48_01",
        "co_60_01",
    ],
    "social_emotional": [
        "so_2_01",
        "so_2_02",
        "so_4_01",
        "so_6_01",
        "so_9_01",
        "so_12_01",
        "so_18_01",
        "so_24_01",
        "so_36_03",
        "so_60_01",
    ],
}

AGE_FORMS = [2, 4, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60]
DOMAIN_LABELS = {
    "gross_motor": "Gross Motor",
    "fine_motor": "Fine Motor",
    "language": "Language & Communication",
    "cognitive": "Cognitive / Problem Solving",
    "social_emotional": "Social & Emotional",
}


def question_text(value: str | dict) -> str:
    if isinstance(value, str):
        return value.strip()
    return str(value.get("en") or "").strip()


def choose_source(item: dict) -> dict:
    refs = item.get("source_references") or []
    if item.get("age", {}).get("type") == "range":
        for ref in refs:
            if "who" in str(ref.get("organization", "")).casefold():
                return ref
    if refs:
        return refs[0]
    raise ValueError(f"No source reference for {item.get('id')}")


def draft_item(item: dict) -> dict:
    source = choose_source(item)
    age = item.get("age", {})
    age_type = age.get("type")
    source_age = item.get("source_age_months")
    source_range = None
    min_age = max_age = None

    if age_type == "checkpoint":
        source_age = age["months"]
        min_age = max_age = age["months"]
        age_status = "source_checkpoint_anchor_pending_professional_review"
        age_semantics = "Source-listed CDC checklist age anchor; monitoring placement, not a validated screening applicability interval."
    elif age_type == "range":
        source_range = [age["min_months"], age["max_months"]]
        age_status = "attainment_window_reference_only"
        age_semantics = "WHO attainment window; preserve as source evidence only, not an age-selection or pass/fail interval."
    else:
        age_status = "source_age_requires_professional_review"
        age_semantics = "AAP mean age for developmental surveillance; not a screening cutoff or applicability interval."

    org = str(source.get("organization") or "").strip()
    if org.casefold() == "cdc":
        rights = "requires_attribution_non_endorsement_disclaimer_and_india_rights_review"
    else:
        rights = "requires_publisher_rights_review_before_reuse"

    return {
        "id": item["id"],
        "source_item_id": item["id"],
        "domain": item["domain"],
        "question": question_text(item.get("question", "")),
        "applicable_age_min_months": min_age,
        "applicable_age_max_months": max_age,
        "age_applicability_status": age_status,
        "source_age_months": source_age,
        "source_age_range_months": source_range,
        "basis": str(age.get("basis") or age_semantics),
        "source": {
            "organization": org,
            "title": str(source.get("title") or "").strip(),
            "source_domain": str(source.get("source_domain") or "").strip(),
            "url": str(source.get("url") or "").strip(),
            "source_item_id": item["id"],
            "age_semantics": age_semantics,
        },
        "rights_status": rights,
        "review_status": "pending_professional_review",
        "clinical_validation": False,
        "activation_eligible": False,
    }


def render_doc(manifest: dict) -> str:
    items = manifest["items"]
    ages: dict[int, Counter] = {age: Counter() for age in AGE_FORMS}
    for item in items:
        if item["age_applicability_status"] == "source_checkpoint_anchor_pending_professional_review":
            age = int(item["applicable_age_min_months"])
            if age in ages:
                ages[age][item["domain"]] += 1

    counts = Counter(item["domain"] for item in items)
    sources = Counter(item["source"]["organization"] for item in items)
    lines = [
        "# SPARSH screening questionnaire draft manifest",
        "",
        f"**Version:** `{manifest['version']}`",
        "**Status:** draft; pending professional review",
        "**Clinical validation:** false",
        "**Production activation:** prohibited for this draft",
        "",
        "## Purpose and use boundary",
        "",
        "This 50-item draft is assembled from source-mapped records already present in `milestones_expansion_candidate.json`. It is for professional content review only. It is not an active questionnaire, validated screening tool, diagnostic instrument, or scoring specification. Every row is pending professional review, marked not clinically validated, and ineligible for activation.",
        "",
        "The CDC source ages below are monitoring checklist anchors (CDC places listed milestones at ages by which about 75% or more of children are expected to show them). They are not validated SPARSH applicability intervals or cutoffs. AAP ages are mean surveillance ages and therefore have null applicability bounds. WHO values are attainment windows preserved in source fields only; they are not screening intervals. A qualified review must establish whether and how any of these can be used in age forms. No cumulative selector is authorized by this draft.",
        "",
        "## Domain counts and source distribution",
        "",
        "| Domain | Draft items |",
        "|---|---:|",
    ]
    for domain, label in DOMAIN_LABELS.items():
        lines.append(f"| {label} | {counts[domain]} |")
    lines += ["", "| Source organization | Draft items |", "|---|---:|"]
    for source, count in sorted(sources.items()):
        lines.append(f"| {source} | {count} |")
    lines += [
        "",
        "All 50 items require professional content review. All 50 require rights review: CDC-derived rows need attribution, a non-endorsement disclaimer, and confirmation for use in India; AAP/WHO rows need publisher rights review. No TDSC questionnaire items are copied: the repository identifies the validated 51-item TDSC study, but the actual licensed item chart is not present and its reuse rights are unresolved.",
        "",
        "## Age-anchor coverage matrix",
        "",
        "Counts below are **draft source-age anchors only**, not eligible or approved questions for a live screening. CDC checkpoint rows are counted at their exact listed source age. AAP mean ages and WHO attainment windows are not counted as applicable ages. In particular, zero motor counts in this matrix mean no motor source-checkpoint anchor is approved for selection; motor draft concepts remain available for age-policy review.",
        "",
        "| Age band (months) | Gross Motor | Fine Motor | Language | Cognitive | Social-Emotional | Total anchors |",
        "|---:|---:|---:|---:|---:|---:|---:|",
    ]
    domains = ["gross_motor", "fine_motor", "language", "cognitive", "social_emotional"]
    for age in AGE_FORMS:
        row = [ages[age][domain] for domain in domains]
        lines.append(f"| {age} | " + " | ".join(str(value) for value in row) + f" | {sum(row)} |")

    lines += [
        "",
        "## Item-level review table",
        "",
        "Question wording below is carried from the audited candidate record; it is not newly claimed to be a validated caregiver item. Source links identify the evidence record. Review each wording, domain, age, local-language rendering, administration, and rights status before use.",
        "",
        "| ID | Domain | Question | Age applicability | Source | Rights | Review status |",
        "|---|---|---|---|---|---|---|",
    ]
    for item in items:
        if item["age_applicability_status"] == "source_checkpoint_anchor_pending_professional_review":
            age_label = f"Source anchor: {item['source_age_months']}m; professional applicability review pending"
        elif item["age_applicability_status"] == "attainment_window_reference_only":
            low, high = item["source_age_range_months"]
            age_label = f"WHO window {low}–{high}m; not a selection range"
        else:
            age_label = f"AAP mean {item['source_age_months']}m; applicability unresolved"
        source = item["source"]
        source_label = f"{source['organization']}: [{source['title']}]({source['url']})"
        question = item["question"].replace("|", "\\|").replace("\n", " ")
        lines.append(
            f"| `{item['id']}` | {DOMAIN_LABELS[item['domain']]} | {question} | {age_label} | {source_label} | {item['rights_status']} | pending professional review |"
        )

    lines += [
        "",
        "## Source and age limitations",
        "",
        "- **CDC:** The CDC milestone checklists are communication/monitoring resources, not screening or diagnostic tools. Their placement ages use a roughly 75%-by-age criterion and do not validate SPARSH. CDC motor category is combined movement/physical development; the motor items in this draft therefore come from AAP/WHO rather than an unsupported CDC gross/fine split.",
        "- **AAP:** The 2013 motor-delay clinical report labels separate gross- and fine-motor columns, but the displayed ages are means for surveillance. Each AAP-only item's applicability bounds remain null pending professional review. The questions are paraphrases; rights must be checked before reuse.",
        "- **WHO:** The source provides six gross-motor attainment windows. The draft retains selected original bounds in `source_age_range_months`, but leaves applicability bounds null and blocks selection. The reported windows are not screening cutoffs.",
        "- **TDSC (0–6):** The PubMed record describes a 51-item Indian community screening chart validated in a sample of 1,183 children. The questionnaire itself is not in the repository; no items were copied. Obtain the official instrument and confirm rights before considering any reuse.",
        "",
        "## Remaining gaps and activation gate",
        "",
        "Although this review bank has 10 draft concepts per domain, it does **not** provide 8–10 eligible items per age form. The anchor matrix shows the current age-specific shortfall; Gross Motor and Fine Motor have no approved age anchors, and Language, Cognitive, and Social-Emotional are sparse at many forms. No 1-month items are represented. Age anchors are not cumulative eligibility.",
        "",
        "Before activation, professionals must decide item/domain fit, applicability age or range, source interpretation, duplicates, local comprehension, rights, intended use, and any necessary validation. Scoring and referral policy require separate approval. This file must remain separate from the production catalog until those gates are completed.",
        "",
        "## Key references",
        "",
        "- [CDC key points on developmental milestone checklists](https://www.cdc.gov/act-early/milestones/key-points.html)",
        "- [CDC use of agency materials](https://www.cdc.gov/other/agencymaterials.html)",
        "- [AAP Motor Delays: Early Identification and Evaluation](https://publications.aap.org/pediatrics/article/131/6/e2016/31072/Motor-Delays-Early-Identification-and-Evaluation)",
        "- [WHO gross-motor attainment-window table](https://www.who.int/tools/child-growth-standards/standards/motor-development-milestones)",
        "- [TDSC (0–6) development and validation abstract](https://pubmed.ncbi.nlm.nih.gov/24014206/)",
        "",
    ]
    return "\n".join(lines)


def main() -> None:
    source_data = json.loads(SOURCE_PATH.read_text(encoding="utf-8"))
    source_items = {item["id"]: item for item in source_data["items"]}
    draft_items = []
    for domain, ids in SELECTION.items():
        for item_id in ids:
            item = source_items[item_id]
            if item["domain"] != domain:
                raise ValueError(f"Domain mismatch for {item_id}: {item['domain']} != {domain}")
            draft_items.append(draft_item(item))

    manifest = {
        "version": "sparsh-screening-draft-1",
        "status": "draft_pending_professional_review",
        "clinical_validation": False,
        "items": draft_items,
    }
    MANIFEST_PATH.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    DOC_PATH.write_text(render_doc(manifest), encoding="utf-8")
    print(f"Wrote {len(draft_items)} draft items to {MANIFEST_PATH}")
    print(f"Wrote review and age-coverage report to {DOC_PATH}")


if __name__ == "__main__":
    main()
