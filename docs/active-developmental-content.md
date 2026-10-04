# Active Developmental Screening Content

## Active set

- Dataset version: `phase5-final-65-v1`
- Active question count: 65
- Gross Motor: 13
- Fine Motor: 13
- Language: 13
- Cognitive: 13
- Social-Emotional: 13
- Dataset declares `clinical_validation: false`.

The backend serves this fixed 65-item set for every child. It does not filter or relabel items based on age. Each item's age evidence remains attached to the item and is included in the screening history snapshot. The existing `checkpoint_age_months` API/storage field carries the server-calculated completed age in months for this version; the UI labels it as the child's age at screening.

## Age and provenance

- The 36 CDC items classified as checkpoint-supported retain exact source-listed ages as `checkpoint` metadata. These are source presentation ages only, not clinical screening cutoffs.
- The three WHO-backed motor items retain exact attainment ranges: 3.8–9.2, 6.9–16.9, and 8.2–17.6 months. Bounds are not rounded or converted to checkpoints.
- The remaining 23 AAP motor items retain their source surveillance mean in `source_age_months` and use `review_required` age metadata. The AAP mean is not treated as a SPARSH checkpoint.
- Source references, evidence status, mapping status, clinical review status, and wording review status are retained from the final candidate. The three WHO-backed IDs are `gm_aap13_06_sit_unsupported`, `gm_aap13_12_stand`, and `gm_aap13_12_walk`.
- The full set is an explicit versioned manifest. Review-required items are included intentionally as part of that manifest, not through an age-selector fallback.
- `co_12_01`, `co_36_01`, and `co_36_03` remain age/content review-required under the Phase 5 decision, which recommended holding them. They remain in the 65-item manifest to match the requested final set; their inclusion does not resolve the documented domain overlap or safety/content review.
- For `co_36_03`, the UI instructs workers to rely only on caregiver report or a past/natural observation. Never introduce a hot object or ask a child to touch or approach one.

## Scoring compatibility

Candidate records did not define numeric weights. To keep the production scoring engine operational without changing its rules, all 65 records use the existing catalog's unit weight of 1. YES contributes 0, NO contributes 1, and UNSURE contributes 0.5. The existing domain-watch weight (2), YELLOW threshold (3), RED threshold (6), recommendations, and red-flag handling are unchanged.

Because each submission now contains 65 questions instead of one age-checkpoint subset, the unchanged thresholds operate over a larger answer set. Six NO-equivalent missed weights can reach RED. This is a mathematical change in the screening distribution; the thresholds have not been recalibrated or clinically validated for the 65-item set. Candidate item-level `red_flag` values remain false, so RED can still result from the configured total-score threshold; no new red flags were added.

## Review and intended use

The source/evidence references are recorded, but evidence review is not clinical validation. All 65 items still have pending clinical and wording review status in the source candidate. SPARSH provides screening and risk indication, not diagnosis. A clinician must interpret concerns and determine follow-up. No sensitivity, specificity, or diagnostic accuracy claim is made.

## Migration and history

The production catalog changed from the legacy 155-item `draft-1` dataset to `phase5-final-65-v1`. New submissions use the new version and snapshot each question's stable ID, text, domain, and age metadata. Existing screening documents and their stored answers, dataset versions, and snapshots are not rewritten. History continues to read stored snapshots; `milestones_legacy_155.json` preserves the old catalog for compatibility and audit reference.

The frontend continues to request questions from `GET /api/v1/children/{child_id}/milestones`. It does not contain a duplicate question list. Firebase authentication, role checks, centre access enforcement, answer completeness/duplicate validation, audit logging, idempotency, referrals, offline queueing, and history paths remain in place.
