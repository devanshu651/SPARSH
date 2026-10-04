# SPARSH screening age-band draft review

**Manifest:** `sparsh_screening_questionnaire_draft.json`
**Age-band version:** `draft-age-bands-v1`
**Status:** pending professional review
**Clinical validation:** false
**Production activation:** not authorized

## Mapping rule and limits

This file creates age-banded **review forms** from the existing 50-item draft manifest. It does not modify or feed the production selector. An item is included as a candidate when its source point/mean age, or the lower bound of its preserved source attainment window, is no later than the band's upper bound. The per-domain cap is eight; nearest earlier source anchors/windows appear first. Every reference carries `age_applicability_review_required: true` and `pending_professional_review`.

The upper-bound rule prevents assigning a source anchor/window that is wholly later than a younger band. It does not establish applicability to every child in a broad band: for example, a 2-month CDC anchor appearing in the 0–5 month form still needs review before it could be asked of a younger infant. AAP values remain means, WHO ranges remain attainment windows, and neither is converted into an exact cutoff. These are draft forms for expert adjudication, not live age selection.

CDC source ages are monitoring checklist placements, not screening cutoffs or validation of SPARSH. AAP source ages are mean surveillance ages. WHO source intervals describe attainment windows. The WHO window lower bound is used only to identify whether a source interval begins before the band's upper bound; it is not rewritten as an item age. See [CDC guidance](https://www.cdc.gov/act-early/milestones/key-points.html), [AAP motor report](https://publications.aap.org/pediatrics/article/131/6/e2016/31072/Motor-Delays-Early-Identification-and-Evaluation), and [WHO motor window tables](https://www.who.int/tools/child-growth-standards/standards/motor-development-milestones).

## Coverage by age band

Counts are draft references, not approved or selectable screening questions. Target is up to 8 per domain (40 per band).

| Age band | GM | FM | Language | Cognitive | Social | Total |
|---|---:|---:|---:|---:|---:|---:|
| 0–5 | 5 | 1 | 2 | 2 | 3 | 13 |
| 6–11 | 8 | 5 | 5 | 6 | 5 | 29 |
| 12–17 | 8 | 8 | 6 | 7 | 6 | 35 |
| 18–23 | 8 | 8 | 7 | 8 | 7 | 38 |
| 24–35 | 8 | 8 | 8 | 8 | 8 | 40 |
| 36–47 | 8 | 8 | 8 | 8 | 8 | 40 |
| 48–59 | 8 | 8 | 8 | 8 | 8 | 40 |
| 60–72 | 8 | 8 | 8 | 8 | 8 | 40 |

All 50 source items remain pending professional review and rights review where indicated. The source-linked manifest is the authority for exact wording, source, source-age semantics, and rights status. The age-band file links every question using the stable manifest `item_id`.

## Below-target domains and item references

### 0–5 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 5 | `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine`, `gm_aap13_06_sit_unsupported`, `gm_aap13_02_head_lift` |
| Fine Motor | 1 | `fm_aap13_04_grasp` |
| Language | 2 | `la_4_02`, `la_2_02` |
| Cognitive | 2 | `co_2_01`, `co_2_02` |
| Social Emotional | 3 | `so_4_01`, `so_2_01`, `so_2_02` |

- **Gross Motor (5/8): Below target — professional review/source expansion required.** Available motor items use AAP mean-age surveillance anchors or WHO attainment windows. Those are preserved, but do not establish screening applicability; professional age review/source expansion is required.
- **Fine Motor (1/8): Below target — professional review/source expansion required.** Available motor items use AAP mean-age surveillance anchors or WHO attainment windows. Those are preserved, but do not establish screening applicability; professional age review/source expansion is required.
- **Language (2/8): Below target — professional review/source expansion required.** Only 2 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.
- **Cognitive (2/8): Below target — professional review/source expansion required.** Only 2 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.
- **Social Emotional (3/8): Below target — professional review/source expansion required.** Only 3 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.

### 6–11 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 8 | `gm_aap13_12_walk`, `gm_aap13_12_stand`, `gm_aap13_06_roll_supine_prone`, `gm_who06_walk_assisted`, `gm_aap13_09_crawl`, `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine` |
| Fine Motor | 5 | `fm_aap13_09_three_finger_pickup`, `fm_aap13_06_rake`, `fm_aap13_06_reach_cube`, `fm_aap13_06_transfer`, `fm_aap13_04_grasp` |
| Language | 5 | `la_9_01`, `la_6_01`, `la_6_02`, `la_4_02`, `la_2_02` |
| Cognitive | 6 | `co_9_01`, `co_6_01`, `co_6_02`, `co_6_03`, `co_2_01`, `co_2_02` |
| Social Emotional | 5 | `so_9_01`, `so_6_01`, `so_4_01`, `so_2_01`, `so_2_02` |

- **Fine Motor (5/8): Below target — professional review/source expansion required.** Available motor items use AAP mean-age surveillance anchors or WHO attainment windows. Those are preserved, but do not establish screening applicability; professional age review/source expansion is required.
- **Language (5/8): Below target — professional review/source expansion required.** Only 5 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.
- **Cognitive (6/8): Below target — professional review/source expansion required.** Only 6 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.
- **Social Emotional (5/8): Below target — professional review/source expansion required.** Only 5 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.

### 12–17 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 8 | `gm_aap13_12_walk`, `gm_aap13_12_stand`, `gm_aap13_06_roll_supine_prone`, `gm_who06_walk_assisted`, `gm_aap13_09_crawl`, `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine` |
| Fine Motor | 8 | `fm_aap13_15_scribble_imitation`, `fm_aap13_12_bang_objects`, `fm_aap13_12_pincer`, `fm_aap13_09_three_finger_pickup`, `fm_aap13_06_rake`, `fm_aap13_06_reach_cube`, `fm_aap13_06_transfer`, `fm_aap13_04_grasp` |
| Language | 6 | `la_12_01`, `la_9_01`, `la_6_01`, `la_6_02`, `la_4_02`, `la_2_02` |
| Cognitive | 7 | `co_12_02`, `co_9_01`, `co_6_01`, `co_6_02`, `co_6_03`, `co_2_01`, `co_2_02` |
| Social Emotional | 6 | `so_12_01`, `so_9_01`, `so_6_01`, `so_4_01`, `so_2_01`, `so_2_02` |

- **Language (6/8): Below target — professional review/source expansion required.** Only 6 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.
- **Cognitive (7/8): Below target — professional review/source expansion required.** Only 7 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.
- **Social Emotional (6/8): Below target — professional review/source expansion required.** Only 6 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.

### 18–23 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 8 | `gm_aap13_12_walk`, `gm_aap13_12_stand`, `gm_aap13_06_roll_supine_prone`, `gm_who06_walk_assisted`, `gm_aap13_09_crawl`, `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine` |
| Fine Motor | 8 | `fm_aap13_18_two_block_tower`, `fm_aap13_15_scribble_imitation`, `fm_aap13_12_bang_objects`, `fm_aap13_12_pincer`, `fm_aap13_09_three_finger_pickup`, `fm_aap13_06_rake`, `fm_aap13_06_reach_cube`, `fm_aap13_06_transfer` |
| Language | 7 | `la_18_02`, `la_12_01`, `la_9_01`, `la_6_01`, `la_6_02`, `la_4_02`, `la_2_02` |
| Cognitive | 8 | `co_18_01`, `co_12_02`, `co_9_01`, `co_6_01`, `co_6_02`, `co_6_03`, `co_2_01`, `co_2_02` |
| Social Emotional | 7 | `so_18_01`, `so_12_01`, `so_9_01`, `so_6_01`, `so_4_01`, `so_2_01`, `so_2_02` |

- **Language (7/8): Below target — professional review/source expansion required.** Only 7 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.
- **Social Emotional (7/8): Below target — professional review/source expansion required.** Only 7 distinct source-mapped candidates from the selected 50-item pool meet the conservative no-future-source-age draft mapping for this band. No extra milestones were invented or borrowed from another domain.

### 24–35 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 8 | `gm_aap13_12_walk`, `gm_aap13_12_stand`, `gm_aap13_06_roll_supine_prone`, `gm_who06_walk_assisted`, `gm_aap13_09_crawl`, `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine` |
| Fine Motor | 8 | `fm_aap13_18_two_block_tower`, `fm_aap13_15_scribble_imitation`, `fm_aap13_12_bang_objects`, `fm_aap13_12_pincer`, `fm_aap13_09_three_finger_pickup`, `fm_aap13_06_rake`, `fm_aap13_06_reach_cube`, `fm_aap13_06_transfer` |
| Language | 8 | `la_24_01`, `la_18_02`, `la_12_01`, `la_9_01`, `la_6_01`, `la_6_02`, `la_4_02`, `la_2_02` |
| Cognitive | 8 | `co_18_01`, `co_12_02`, `co_9_01`, `co_6_01`, `co_6_02`, `co_6_03`, `co_2_01`, `co_2_02` |
| Social Emotional | 8 | `so_24_01`, `so_18_01`, `so_12_01`, `so_9_01`, `so_6_01`, `so_4_01`, `so_2_01`, `so_2_02` |


### 36–47 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 8 | `gm_aap13_12_walk`, `gm_aap13_12_stand`, `gm_aap13_06_roll_supine_prone`, `gm_who06_walk_assisted`, `gm_aap13_09_crawl`, `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine` |
| Fine Motor | 8 | `fm_aap13_36_circle`, `fm_aap13_18_two_block_tower`, `fm_aap13_15_scribble_imitation`, `fm_aap13_12_bang_objects`, `fm_aap13_12_pincer`, `fm_aap13_09_three_finger_pickup`, `fm_aap13_06_rake`, `fm_aap13_06_reach_cube` |
| Language | 8 | `la_36_03`, `la_24_01`, `la_18_02`, `la_12_01`, `la_9_01`, `la_6_01`, `la_6_02`, `la_4_02` |
| Cognitive | 8 | `co_18_01`, `co_12_02`, `co_9_01`, `co_6_01`, `co_6_02`, `co_6_03`, `co_2_01`, `co_2_02` |
| Social Emotional | 8 | `so_36_03`, `so_24_01`, `so_18_01`, `so_12_01`, `so_9_01`, `so_6_01`, `so_4_01`, `so_2_01` |


### 48–59 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 8 | `gm_aap13_12_walk`, `gm_aap13_12_stand`, `gm_aap13_06_roll_supine_prone`, `gm_who06_walk_assisted`, `gm_aap13_09_crawl`, `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine` |
| Fine Motor | 8 | `fm_aap13_36_circle`, `fm_aap13_18_two_block_tower`, `fm_aap13_15_scribble_imitation`, `fm_aap13_12_bang_objects`, `fm_aap13_12_pincer`, `fm_aap13_09_three_finger_pickup`, `fm_aap13_06_rake`, `fm_aap13_06_reach_cube` |
| Language | 8 | `la_48_01`, `la_36_03`, `la_24_01`, `la_18_02`, `la_12_01`, `la_9_01`, `la_6_01`, `la_6_02` |
| Cognitive | 8 | `co_48_01`, `co_18_01`, `co_12_02`, `co_9_01`, `co_6_01`, `co_6_02`, `co_6_03`, `co_2_01` |
| Social Emotional | 8 | `so_36_03`, `so_24_01`, `so_18_01`, `so_12_01`, `so_9_01`, `so_6_01`, `so_4_01`, `so_2_01` |


### 60–72 months

| Domain | Draft question references | IDs |
|---|---:|---|
| Gross Motor | 8 | `gm_aap13_12_walk`, `gm_aap13_12_stand`, `gm_aap13_06_roll_supine_prone`, `gm_who06_walk_assisted`, `gm_aap13_09_crawl`, `gm_who06_stand_assisted`, `gm_aap13_04_prone_support`, `gm_aap13_04_roll_prone_supine` |
| Fine Motor | 8 | `fm_aap13_36_circle`, `fm_aap13_18_two_block_tower`, `fm_aap13_15_scribble_imitation`, `fm_aap13_12_bang_objects`, `fm_aap13_12_pincer`, `fm_aap13_09_three_finger_pickup`, `fm_aap13_06_rake`, `fm_aap13_06_reach_cube` |
| Language | 8 | `la_48_01`, `la_36_03`, `la_24_01`, `la_18_02`, `la_12_01`, `la_9_01`, `la_6_01`, `la_6_02` |
| Cognitive | 8 | `co_60_01`, `co_48_01`, `co_18_01`, `co_12_02`, `co_9_01`, `co_6_01`, `co_6_02`, `co_6_03` |
| Social Emotional | 8 | `so_60_01`, `so_36_03`, `so_24_01`, `so_18_01`, `so_12_01`, `so_9_01`, `so_6_01`, `so_4_01` |


## Activation boundary

Do not connect this file to the screening API until reviewers approve the intended age applicability for each item and band, resolve domain/wording/rights questions, and separately approve the screening instrument and scoring use. `clinical_validation` remains false. The production `milestones.json`, scoring rules, API, frontend, authentication, referral behavior, and deployment are outside this phase.
