# Milestone Content Architecture

**Status:** Technical architecture only. The production catalog and scoring behavior are unchanged. This schema does not activate or publish the final-65 candidate set and does not indicate clinical validation.

## Age representation

Age evidence is a discriminated model. A record must declare `age.type` and a nonblank `age.basis`; age forms are not coerced into each other.

### Exact source checkpoint

```json
{
  "type": "checkpoint",
  "months": 24,
  "basis": "CDC"
}
```

This records an explicit source-listed age. It does not imply that the content or its use in SPARSH has been clinically validated.

### Evidence-supported source range

```json
{
  "type": "range",
  "min_months": 18,
  "max_months": 24,
  "basis": "WHO"
}
```

Bounds are retained as source evidence. The schema validates that both bounds are nonnegative and `max_months` is greater than `min_months`. In the current decision, the WHO bounds describe attainment windows; they must not be used as a pass/fail interval, replaced by a midpoint, or automatically turned into a checkpoint or screening applicability rule.

### Professional review required

```json
{
  "type": "review_required",
  "months": null,
  "basis": "AAP"
}
```

An AAP mean surveillance age belongs in source provenance, not in the checkpoint `months` field. It cannot enter checkpoint selection until a separate reviewed dataset explicitly represents an approved age interpretation.

## Content record and provenance

`app/models/milestone_content.py` defines typed records for IDs, five SPARSH domains, text or localized questions, age, nullable weight, red-flag state, dataset version, and source references. Source-reference fields include organization, title, URL, source age/range, source domain, evidence status, and review note. Candidate records also retain mapping, clinical-review, and wording-review statuses. Source-specific extra fields are preserved.

IDs are treated as stable record keys. A dataset rejects duplicate IDs instead of renaming or deduplicating them. Dataset version is copied into records that omit an item-level version.

## Loading and selection behavior

`app/services/milestone_content_service.py` parses either:

- the new `version` + `items` content format, with explicit age types; or
- the existing `version` + `milestones` production format, in memory, for compatibility inspection.

Legacy `age_months` values normalize to checkpoint-shaped records with basis `legacy_unverified`. That marker preserves old behavior without claiming that the old file has verified source provenance. Original IDs, descriptions/questions, weights, red-flag values, versions, and legacy extra fields remain available. The production loader and routes continue reading the unchanged `milestones.json` through the existing service.

The new `checkpoint_items_for_age` helper selects only records whose age type is `checkpoint`. It excludes `range` and `review_required` records. New-format catalogs return no selected checkpoint when the child is younger than their first checkpoint; legacy catalogs retain their historical fallback to the youngest configured checkpoint. This helper is not wired into the screening routes in this phase.

Range records intentionally have no automatic screening selection yet. In particular, an attainment window is not enough evidence to determine whether a question should be presented to every child whose chronological age falls inside that interval. A future clinical/content policy must define that separately before range records can join a screening set.

## Phase 5G evidence mapping for later migration

The following values are the exact bounds recorded in the Phase 5G decision. This is a migration map only; it does not update `milestones_final_candidate.json` or create the final-65 production dataset.

| Candidate ID | Recommended age representation | Basis | Notes |
|---|---|---|---|
| `gm_aap13_06_sit_unsupported` | Range: 3.8 to 9.2 months | WHO | Attainment-window bounds; retain the AAP 6-month mean only as provenance. |
| `gm_aap13_12_stand` | Range: 6.9 to 16.9 months | WHO | Attainment-window bounds; retain the AAP 12-month mean only as provenance. |
| `gm_aap13_12_walk` | Range: 8.2 to 17.6 months | WHO | Attainment-window bounds; retain the AAP 12-month mean only as provenance. |
| 23 AAP-only motor candidates | `review_required`, months null | AAP | Their source table ages are surveillance means, not checkpoints. A reviewer must decide how, or whether, to assign an age for SPARSH. |
| CDC candidates retained after content decisions | Checkpoint at the exact CDC page age | CDC | Source age can be represented without rounding. It is not screening validation or a risk threshold. |
| `co_12_01`, `co_36_01`, `co_36_03` | Excluded pending content/safety decision | CDC | The overlap candidates and hot-object item are not to be automatically selected. |

The three records with WHO bounds also have AAP mean ages. The range representation is the age representation proposed for the selected hybrid architecture; the AAP mean must remain in source provenance and must not overwrite or narrow the range.

## Production boundary

No production data, route, API model, frontend behavior, scoring rule, weight, threshold, recommendation, or red-flag behavior is changed by this architecture. `milestones.json` remains in its current legacy format and continues to use its current selection and answer validation path. The final-65 file remains a review artifact and is not loaded by production code.

Any future activation requires a separately approved content migration, exact approved question sets, age-range selection policy, domain/wording decisions, scoring validation, history/version strategy, and professional approval. This architecture alone authorizes none of those steps.
