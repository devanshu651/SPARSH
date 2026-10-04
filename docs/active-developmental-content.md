# Active Developmental Screening Content

## Active set

- Active catalog version: `phase5-expanded-v1`
- Retained prior fixed-set version: `phase5-final-65-v1`
- Active question count: 74
- Gross Motor: 13
- Fine Motor: 13
- Language: 14
- Cognitive: 13
- Social-Emotional: 21
- Dataset declares `clinical_validation: false`.

The 74-item catalog is the total content bank. The backend calculates completed age from DOB, selects the greatest explicit checkpoint at or below that age, and returns only items assigned to that exact checkpoint. There is no youngest-checkpoint fallback for ages below the first supported checkpoint. Each selected item retains age evidence in the API and history snapshot. The existing `checkpoint_age_months` field contains the selected checkpoint, while `current_age_months` contains the server-calculated age. Nine direct CDC source-listed checkpoint records were added from the reviewed Phase 5 candidate pool; clinical and wording review remain pending. No AAP mean-age or WHO range motor records were enabled.

## Age and provenance

- The 45 CDC items classified as checkpoint-supported retain exact source-listed ages as `checkpoint` metadata. These are source presentation ages only, not clinical screening cutoffs. At each supported checkpoint, only records assigned to that exact checkpoint are returned.
- The three WHO-backed motor items retain exact attainment ranges: 3.8–9.2, 6.9–16.9, and 8.2–17.6 months. Bounds are not rounded or converted to checkpoints.
- The remaining 23 AAP motor items retain their source surveillance mean in `source_age_months` and use `review_required` age metadata. The AAP mean is not treated as a SPARSH checkpoint.
- Source references, evidence status, mapping status, clinical review status, and wording review status are retained from the final candidate. The three WHO-backed IDs are `gm_aap13_06_sit_unsupported`, `gm_aap13_12_stand`, and `gm_aap13_12_walk`.
- WHO range items and review-required items remain in the 74-item catalog but are excluded from automatic checkpoint selection. The WHO bounds describe attainment evidence; no screening applicability policy is approved for selecting them. The 23 AAP means remain source metadata only.
- `co_12_01`, `co_36_01`, and `co_36_03` remain age/content review-required under the Phase 5 decision, which recommended holding them. They remain in the 74-item manifest to match the requested final set; their inclusion does not resolve the documented domain overlap or safety/content review.
- For `co_36_03`, the UI instructs workers to rely only on caregiver report or a past/natural observation. Never introduce a hot object or ask a child to touch or approach one.

### Automatic checkpoint distribution

The backend chooses the greatest checkpoint not greater than the child's completed age. Ages 0–1 months receive no questions; there is no fallback to a later checkpoint. Only checkpoint-typed content is selected. The WHO ranges and all review-required items stay excluded.

| Checkpoint | Questions | Domains with selected questions |
|---:|---:|---|
| 2 months | 6 | Language 1, Cognitive 2, Social-Emotional 3 |
| 4 months | 3 | Language 1, Social-Emotional 2 |
| 6 months | 9 | Language 3, Cognitive 3, Social-Emotional 3 |
| 9 months | 4 | Language 2, Cognitive 1, Social-Emotional 1 |
| 12 months | 5 | Language 3, Cognitive 1, Social-Emotional 1 |
| 15 months | 2 | Social-Emotional 2 |
| 18 months | 4 | Language 1, Cognitive 1, Social-Emotional 2 |
| 24 months | 3 | Language 1, Social-Emotional 2 |
| 36 months | 2 | Language 1, Social-Emotional 1 |
| 48 months | 4 | Language 1, Cognitive 1, Social-Emotional 2 |
| 60 months | 3 | Cognitive 1, Social-Emotional 2 |

The distribution follows the 45 checkpoint-typed records in the active catalog, including nine additional CDC source-age candidates. Their clinical and wording review remains pending. It is uneven: the currently checkpoint-selectable content has no Gross Motor or Fine Motor questions because those domain items have AAP mean or WHO range age evidence, and no checkpoint policy was approved for them. The full 74-item catalog remains intact.

## Strict age eligibility and coverage disclosure

The selector classifies catalog records before returning them. A checkpoint record is eligible only when its source reference is reviewed and its checkpoint equals the configured lower checkpoint selected for the child's completed age. It is not carried forward as a permanent minimum-age rule. A range record is eligible only when its age basis explicitly approves screening applicability and it has a reviewed source reference. The three current WHO records describe attainment windows only, so they remain ineligible for screening selection. `review_required` records and content explicitly held/rejected by review remain excluded.

When valid items are fewer than the product target of 13, the selector returns the full supported set without padding. `GET /api/v1/children/{child_id}/milestones` exposes `coverage.target_question_count`, `coverage.shortfall`, and `coverage.missing_domains`; the screening page displays that gap. Based on the current checkpoint table, shortfalls are 7, 10, 4, 9, 8, 11, 9, 10, 11, 9, and 10 questions respectively for 2, 4, 6, 9, 12, 15, 18, 24, 36, 48, and 60 months. The 13-question target is not a reason to assign an unsupported age or include an unresolved item.

## Scoring compatibility

Candidate records did not define numeric weights. To keep the production scoring engine operational without changing its rules, all 74 records use the existing catalog's unit weight of 1. YES contributes 0, NO contributes 1, and UNSURE contributes 0.5. The existing domain-watch weight (2), YELLOW threshold (3), RED threshold (6), recommendations, and red-flag handling are unchanged.

Question counts vary by checkpoint. The backend keeps configured thresholds and milestone-level red-flag behavior unchanged, and adds a technical `rule_findings` note when the maximum numeric score at a checkpoint cannot reach a configured threshold. It also flags domains with no selected questions as not assessed. These notices do not change the score or create clinical thresholds. Thresholds have not been recalibrated or clinically validated for these checkpoint sets. Candidate item-level `red_flag` values remain false; no new item flags were added. The prior top-level legacy `red_flags` descriptions are carried forward verbatim, but have no stable candidate IDs and are not automatically mapped onto new questions. The existing scoring engine consumes milestone-level `red_flag`; no unsafe text-based mapping was introduced.

## Review and intended use

The source/evidence references are recorded, but evidence review is not clinical validation. All 65 items still have pending clinical and wording review status in the source candidate. SPARSH provides screening and risk indication, not diagnosis. A clinician must interpret concerns and determine follow-up. No sensitivity, specificity, or diagnostic accuracy claim is made.

## Migration and history

The production catalog is the 74-item content bank with version `phase5-expanded-v1`. Version `phase5-final-65-v1` identifies prior fixed-set submissions and remains readable in history. The legacy 155-item catalog is archived in `milestones_legacy_155.json`. New submissions store the selected checkpoint, selected stable IDs, question text/domain/age snapshots, answers, and result. Existing screening documents are not rewritten.

The frontend continues to request questions from `GET /api/v1/children/{child_id}/milestones`. It does not contain a duplicate question list. Firebase authentication, role checks, centre access enforcement, answer completeness/duplicate validation, audit logging, idempotency, referrals, offline queueing, and history paths remain in place.
