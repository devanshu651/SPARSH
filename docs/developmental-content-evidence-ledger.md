# Developmental content evidence ledger

**Status:** evidence comparison for existing `draft-1` content; not clinical validation. Classifications are carried forward from the Phase 5B verification report. CDC milestone pages are monitoring resources and do not validate SPARSH questions, scoring, or screening performance.

## Classification definitions

- `SOURCE_SUPPORTED`: concept, source age, and source category match; not validation of a SPARSH instrument.
- `PARTIALLY_SUPPORTED`: related concept is supported but wording/details or the fine/gross motor split are not fully supported.
- `NOT_VERIFIED`: no sufficiently matching item/age evidence was identified.
- `DOMAIN_MISMATCH`: source category differs from the current SPARSH domain.
- `AGE_ASSIGNMENT_NEEDS_REVIEW`: related concept appears at another source age or current age is outside source coverage.
- `DUPLICATE_OR_NEAR_DUPLICATE`: current record overlaps another record.

## Source inventory

- CDC age-specific pages are linked in every record with exact title and URL. The pages cover 2 months through 5 years and use Social/Emotional, Language/Communication, Cognitive, and combined Movement/Physical Development categories. [CDC key points](https://www.cdc.gov/act-early/milestones/key-points.html) says checklist milestones are not screening/diagnostic tools and are placed by ages when at least 75% of children are expected to exhibit them.
- WHO/UNICEF, [Care for child development (2012)](https://www.who.int/publications/i/item/9789241548403): broad caregiver/development guidance, not an age-specific item crosswalk; CC BY-NC-SA 3.0 IGO.
- IAP, [2025 high-risk infant follow-up consensus guideline](https://www.indianpediatrics.net/aug2025/554.pdf): high-risk context and selected tools, not a general AWW milestone list.

## Phase 5D supplemental authoritative source inventory

These sources supplement, and do not change, the Phase 5B item classifications above. Their concepts are paraphrased in `milestones_candidate_v2.json`; the presence of a source is not clinical validation of SPARSH.

| Organization | Exact title and date | URL | Age range / domains | What it supports and reuse limits |
|---|---|---|---|---|
| World Health Organization (WHO) Multicentre Growth Reference Study Group | “WHO Motor Development Study: Windows of achievement for six gross motor development milestones,” *Acta Paediatrica* Supplement 450, pp. 86–95 (2006) | [WHO article PDF](https://www.who.int/docs/default-source/child-growth/child-growth-standards/indicators/motor-development-milestones/who-motor-development-study-windows-of-achievement-for-six-gross-motor-development-milestones.pdf); [WHO tables and graphs](https://www.who.int/tools/child-growth-standards/standards/motor-development-milestones) | Children studied from 4 to 24 months; attainment windows span 3.8–17.6 months. **Gross motor**: unsupported sitting, standing with assistance, hands-and-knees crawling, assisted walking, standing alone, walking alone. Gives windows, not discrete visit cutoffs. | Longitudinal attainment data for six explicitly gross-motor behaviors. The paper is publisher-copyrighted; no open adaptation license was identified. This work uses brief paraphrases and citations, not copied table text. The WHO study included an Indian site but is not an India-only norm. |
| American Academy of Pediatrics (AAP) | “Motor Delays: Early Identification and Evaluation,” *Pediatrics* 131(6):e2016–e2027 (June 2013; reaffirmed May 2017 and November 2022) | [AAP clinical report](https://publications.aap.org/pediatrics/article/131/6/e2016/31072/Motor-Delays-Early-Identification-and-Evaluation) | Surveillance examples at 2, 4, 6, 9, 12, 15, 18, 24, 30, 36, and 48 months; separate **Gross Motor Milestones** and **Fine Motor Milestones** columns. | Explicitly supports gross/fine categorization and age-associated examples. The report says these are mean ages for typically developing children; marked delay warrants attention but does not itself indicate disease. It is clinical surveillance guidance, not a SPARSH question bank or Indian population norm. AAP copyright applies; no blanket reuse license identified. Candidate wording is paraphrased. |
| Indian Academy of Pediatrics (IAP), Neurodevelopmental Pediatrics Chapter | “Consensus Guidelines of IAP Neurodevelopmental Pediatrics Chapter on Developmentally Supportive Follow-Up for High-Risk Infants” (2025), *Indian Pediatrics* 62:554–573 | [IAP guideline PDF](https://www.indianpediatrics.net/aug2025/554.pdf) | High-risk infants and selected follow-up observations/tools across infancy and early childhood; gross and fine motor are among broad developmental concerns. | Indian clinical context, follow-up and tool-selection guidance. It does not publish a complete, general-population, 13-per-domain item bank. The article is publisher-copyrighted; do not reproduce its forms/items without confirming permission. |
| Indian Journal of Pediatrics authors (Nair et al.) | “Development and validation of Trivandrum Development Screening Chart for children aged 0–6 years [TDSC (0–6)]” (2013), *The Indian Journal of Pediatrics* 80(Suppl 2):S248–S255 | [PubMed record](https://pubmed.ncbi.nlm.nih.gov/24014206/); [DOI](https://doi.org/10.1007/s12098-013-1144-2) | Birth to 6 years; a multi-domain Indian screening chart. | Abstract reports development and validation of a 51-item chart in a community sample against DDST. It supports the existence of an India-developed tool, not individual candidate wording in this ledger. The article/chart is copyrighted; item content is not reproduced or used as candidate records here. IAP 2025 describes TDSC as free for use, but the exact official version and license terms must be confirmed before reuse. |

### Motor mapping rule used for Phase 5D candidates

AAP explicitly labels its table columns gross and fine motor; candidates drawn from those columns are marked `DIRECT` because the source itself makes that distinction. WHO explicitly labels its six behaviors gross motor; those behaviors substantiate gross-motor concepts, but do not establish a separate fine-motor classification. CDC's `Movement/Physical Development` category remains combined and is not used by itself to justify either SPARSH motor subdomain. Every new candidate remains pending clinical and wording review. Source ages are reported as source associations, not thresholds or individual performance requirements.

## Item-by-item evidence

`Source age` identifies the age on a related source concept, not an assertion that a current item belongs at that checkpoint. For unverified items the linked CDC page is the page checked, not evidence supporting the record. Null means no matching source age was identified.

### `gr_2_01`

- Current age: 2 months
- Current domain: `gross_motor`
- Current description: Holds head up briefly when on tummy
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Holds head up briefly when on tummy
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_2_02`

- Current age: 2 months
- Current domain: `gross_motor`
- Current description: Moves both arms and legs, pushes up slightly during tummy time
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Moves both arms and legs, pushes up slightly during tummy time
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_2_01`

- Current age: 2 months
- Current domain: `fine_motor`
- Current description: Opens hands briefly
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Opens hands briefly
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_2_02`

- Current age: 2 months
- Current domain: `fine_motor`
- Current description: Reflexively grasps a finger placed in palm
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `la_2_01`

- Current age: 2 months
- Current domain: `language`
- Current description: Makes sounds other than crying (coos)
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Language/Communication
- Concise supported concept: Makes sounds other than crying (coos)
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `la_2_02`

- Current age: 2 months
- Current domain: `language`
- Current description: Reacts to loud sounds
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Language/Communication
- Concise supported concept: Reacts to loud sounds
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_2_01`

- Current age: 2 months
- Current domain: `social_emotional`
- Current description: Calms down when spoken to or picked up
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Social/Emotional
- Concise supported concept: Calms down when spoken to or picked up
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_2_02`

- Current age: 2 months
- Current domain: `social_emotional`
- Current description: Looks at your face
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Social/Emotional
- Concise supported concept: Looks at your face
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_2_03`

- Current age: 2 months
- Current domain: `social_emotional`
- Current description: Smiles when you talk to or smile at them
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Social/Emotional
- Concise supported concept: Smiles when you talk to or smile at them
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_2_01`

- Current age: 2 months
- Current domain: `cognitive`
- Current description: Watches you as you move
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Cognitive
- Concise supported concept: Watches you as you move
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_2_02`

- Current age: 2 months
- Current domain: `cognitive`
- Current description: Looks at a toy for several seconds
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Months](https://www.cdc.gov/act-early/milestones/2-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-months.html
- Source age: 2 months
- Source domain/category: Cognitive
- Concise supported concept: Looks at a toy for several seconds
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `gr_4_01`

- Current age: 4 months
- Current domain: `gross_motor`
- Current description: Holds head steady without support during tummy time
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Holds head steady without support during tummy time
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_4_02`

- Current age: 4 months
- Current domain: `gross_motor`
- Current description: Pushes up onto elbows or forearms when on tummy
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Pushes up onto elbows or forearms when on tummy
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_4_03`

- Current age: 4 months
- Current domain: `gross_motor`
- Current description: Holds a toy when placed in hand
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Holds a toy when placed in hand
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_4_01`

- Current age: 4 months
- Current domain: `fine_motor`
- Current description: Brings hands to mouth
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Brings hands to mouth
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_4_02`

- Current age: 4 months
- Current domain: `fine_motor`
- Current description: Reaches for and holds a toy briefly
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Reaches for and holds a toy briefly
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `la_4_01`

- Current age: 4 months
- Current domain: `language`
- Current description: Makes vowel sounds
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Language/Communication
- Concise supported concept: Makes vowel sounds
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `la_4_02`

- Current age: 4 months
- Current domain: `language`
- Current description: Turns head toward sound of your voice
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Language/Communication
- Concise supported concept: Turns head toward sound of your voice
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_4_01`

- Current age: 4 months
- Current domain: `social_emotional`
- Current description: Smiles on their own to get your attention
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Social/Emotional
- Concise supported concept: Smiles on their own to get your attention
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_4_02`

- Current age: 4 months
- Current domain: `social_emotional`
- Current description: Laughs or chuckles
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Social/Emotional
- Concise supported concept: Laughs or chuckles
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `so_4_03`

- Current age: 4 months
- Current domain: `social_emotional`
- Current description: Looks at you, moves, or makes sounds to get attention
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: 4 months
- Source domain/category: Social/Emotional
- Concise supported concept: Looks at you, moves, or makes sounds to get attention
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_4_01`

- Current age: 4 months
- Current domain: `cognitive`
- Current description: Follows objects with eyes side to side
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `co_4_02`

- Current age: 4 months
- Current domain: `cognitive`
- Current description: Watches faces closely
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Months](https://www.cdc.gov/act-early/milestones/4-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-months.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `gr_6_01`

- Current age: 6 months
- Current domain: `gross_motor`
- Current description: Rolls from tummy to back
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Rolls from tummy to back
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_6_02`

- Current age: 6 months
- Current domain: `gross_motor`
- Current description: Sits with support of hands
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Sits with support of hands
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_6_03`

- Current age: 6 months
- Current domain: `gross_motor`
- Current description: Bears weight on legs when held standing
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_6_01`

- Current age: 6 months
- Current domain: `fine_motor`
- Current description: Transfers a toy from one hand to another
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Transfers a toy from one hand to another
- Reason/limitation: A related source concept is listed at 9 months; this does not substantiate the current 6-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `fi_6_02`

- Current age: 6 months
- Current domain: `fine_motor`
- Current description: Brings objects to mouth
- Evidence classification: **DOMAIN_MISMATCH**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Cognitive
- Concise supported concept: Brings objects to mouth
- Reason/limitation: CDC places the corresponding concept under Cognitive, unlike current SPARSH domain fine_motor.
- Review status: Pending domain crosswalk review; exclude from verified candidates.

### `fi_6_03`

- Current age: 6 months
- Current domain: `fine_motor`
- Current description: Uses hands to explore or reach for toys
- Evidence classification: **DOMAIN_MISMATCH**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Cognitive
- Concise supported concept: Uses hands to explore or reach for toys
- Reason/limitation: CDC places the corresponding concept under Cognitive, unlike current SPARSH domain fine_motor.
- Review status: Pending domain crosswalk review; exclude from verified candidates.

### `la_6_01`

- Current age: 6 months
- Current domain: `language`
- Current description: Takes turns making sounds with you
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Language/Communication
- Concise supported concept: Takes turns making sounds with you
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `la_6_02`

- Current age: 6 months
- Current domain: `language`
- Current description: Blows raspberries
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Language/Communication
- Concise supported concept: Blows raspberries
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `la_6_03`

- Current age: 6 months
- Current domain: `language`
- Current description: Makes squealing noises
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Language/Communication
- Concise supported concept: Makes squealing noises
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_6_01`

- Current age: 6 months
- Current domain: `social_emotional`
- Current description: Knows familiar people
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Social/Emotional
- Concise supported concept: Knows familiar people
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_6_02`

- Current age: 6 months
- Current domain: `social_emotional`
- Current description: Likes to look at self in mirror
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Social/Emotional
- Concise supported concept: Likes to look at self in mirror
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_6_03`

- Current age: 6 months
- Current domain: `social_emotional`
- Current description: Laughs
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Social/Emotional
- Concise supported concept: Laughs
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_6_01`

- Current age: 6 months
- Current domain: `cognitive`
- Current description: Puts things in mouth to explore them
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Cognitive
- Concise supported concept: Puts things in mouth to explore them
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_6_02`

- Current age: 6 months
- Current domain: `cognitive`
- Current description: Reaches to grab a toy
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Cognitive
- Concise supported concept: Reaches to grab a toy
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_6_03`

- Current age: 6 months
- Current domain: `cognitive`
- Current description: Closes lips to show they do not want more food
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 6 Months](https://www.cdc.gov/act-early/milestones/6-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/6-months.html
- Source age: 6 months
- Source domain/category: Cognitive
- Concise supported concept: Closes lips to show they do not want more food
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `gr_9_01`

- Current age: 9 months
- Current domain: `gross_motor`
- Current description: Sits without support
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Sits without support
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_9_02`

- Current age: 9 months
- Current domain: `gross_motor`
- Current description: Pulls to stand while holding furniture
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Pulls to stand while holding furniture
- Reason/limitation: A related source concept is listed at 12 months; this does not substantiate the current 9-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `gr_9_03`

- Current age: 9 months
- Current domain: `gross_motor`
- Current description: Crawls
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_9_01`

- Current age: 9 months
- Current domain: `fine_motor`
- Current description: Uses fingers to rake food toward self
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Uses fingers to rake food toward self
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_9_02`

- Current age: 9 months
- Current domain: `fine_motor`
- Current description: Picks up small objects with thumb and fingers
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Picks up small objects with thumb and fingers
- Reason/limitation: A related source concept is listed at 12 months; this does not substantiate the current 9-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `fi_9_03`

- Current age: 9 months
- Current domain: `fine_motor`
- Current description: Bangs two objects together
- Evidence classification: **DOMAIN_MISMATCH**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Cognitive
- Concise supported concept: Bangs two objects together
- Reason/limitation: CDC places the corresponding concept under Cognitive, unlike current SPARSH domain fine_motor.
- Review status: Pending domain crosswalk review; exclude from verified candidates.

### `la_9_01`

- Current age: 9 months
- Current domain: `language`
- Current description: Babbles with strings of sounds
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Language/Communication
- Concise supported concept: Babbles with strings of sounds
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `la_9_02`

- Current age: 9 months
- Current domain: `language`
- Current description: Lifts arms to be picked up
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Language/Communication
- Concise supported concept: Lifts arms to be picked up
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_9_01`

- Current age: 9 months
- Current domain: `social_emotional`
- Current description: Is shy, clingy, or fearful around strangers
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Social/Emotional
- Concise supported concept: Is shy, clingy, or fearful around strangers
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_9_02`

- Current age: 9 months
- Current domain: `social_emotional`
- Current description: Has favorite toys
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `co_9_01`

- Current age: 9 months
- Current domain: `cognitive`
- Current description: Looks for objects when dropped out of sight
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Cognitive
- Concise supported concept: Looks for objects when dropped out of sight
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_9_02`

- Current age: 9 months
- Current domain: `cognitive`
- Current description: Plays peek-a-boo
- Evidence classification: **DOMAIN_MISMATCH**
- Source organization: CDC
- Exact source title: [Milestones by 9 Months](https://www.cdc.gov/act-early/milestones/9-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/9-months.html
- Source age: 9 months
- Source domain/category: Social/Emotional
- Concise supported concept: Plays peek-a-boo
- Reason/limitation: CDC places the corresponding concept under Social/Emotional, unlike current SPARSH domain cognitive.
- Review status: Pending domain crosswalk review; exclude from verified candidates.

### `gr_12_01`

- Current age: 12 months
- Current domain: `gross_motor`
- Current description: Pulls to stand
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Pulls to stand
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_12_02`

- Current age: 12 months
- Current domain: `gross_motor`
- Current description: Walks while holding onto furniture
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Walks while holding onto furniture
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_12_03`

- Current age: 12 months
- Current domain: `gross_motor`
- Current description: May take a few independent steps
- Evidence classification: **DUPLICATE_OR_NEAR_DUPLICATE**
- Source organization: CDC
- Exact source title: [Milestones by 15 Months](https://www.cdc.gov/act-early/milestones/15-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/15-months.html
- Source age: 15 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: May take a few independent steps
- Reason/limitation: Overlaps another current record; see duplicate summary. The source concept does not justify retaining both records.
- Review status: Pending duplicate resolution; exclude from verified candidates.

### `fi_12_01`

- Current age: 12 months
- Current domain: `fine_motor`
- Current description: Picks up small objects with pincer grasp
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Picks up small objects with pincer grasp
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_12_02`

- Current age: 12 months
- Current domain: `fine_motor`
- Current description: Drinks from a cup without a lid held by adult
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Drinks from a cup without a lid held by adult
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `la_12_01`

- Current age: 12 months
- Current domain: `language`
- Current description: Calls a parent mama, dada, or special name
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Language/Communication
- Concise supported concept: Calls a parent mama, dada, or special name
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `la_12_02`

- Current age: 12 months
- Current domain: `language`
- Current description: Understands no
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Language/Communication
- Concise supported concept: Understands no
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `la_12_03`

- Current age: 12 months
- Current domain: `language`
- Current description: Waves bye-bye
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Language/Communication
- Concise supported concept: Waves bye-bye
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_12_01`

- Current age: 12 months
- Current domain: `social_emotional`
- Current description: Plays games such as peek-a-boo and pat-a-cake
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Social/Emotional
- Concise supported concept: Plays games such as peek-a-boo and pat-a-cake
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_12_01`

- Current age: 12 months
- Current domain: `cognitive`
- Current description: Puts objects in a container
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Cognitive
- Concise supported concept: Puts objects in a container
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_12_02`

- Current age: 12 months
- Current domain: `cognitive`
- Current description: Looks for things they see you hide
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 1 Year](https://www.cdc.gov/act-early/milestones/1-year.html)
- Source URL: https://www.cdc.gov/act-early/milestones/1-year.html
- Source age: 12 months
- Source domain/category: Cognitive
- Concise supported concept: Looks for things they see you hide
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `gr_15_01`

- Current age: 15 months
- Current domain: `gross_motor`
- Current description: Takes a few independent steps
- Evidence classification: **DUPLICATE_OR_NEAR_DUPLICATE**
- Source organization: CDC
- Exact source title: [Milestones by 15 Months](https://www.cdc.gov/act-early/milestones/15-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/15-months.html
- Source age: 15 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Takes a few independent steps
- Reason/limitation: Overlaps another current record; see duplicate summary. The source concept does not justify retaining both records.
- Review status: Pending duplicate resolution; exclude from verified candidates.

### `gr_15_02`

- Current age: 15 months
- Current domain: `gross_motor`
- Current description: Stoops down to pick up an object
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 15 Months](https://www.cdc.gov/act-early/milestones/15-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/15-months.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_15_01`

- Current age: 15 months
- Current domain: `fine_motor`
- Current description: Tries to use a spoon
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Tries to use a spoon
- Reason/limitation: A related source concept is listed at 18 months; this does not substantiate the current 15-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `fi_15_02`

- Current age: 15 months
- Current domain: `fine_motor`
- Current description: Scribbles on paper
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Scribbles on paper
- Reason/limitation: A related source concept is listed at 18 months; this does not substantiate the current 15-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `la_15_01`

- Current age: 15 months
- Current domain: `language`
- Current description: Uses three or more words besides mama or dada
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Language/Communication
- Concise supported concept: Uses three or more words besides mama or dada
- Reason/limitation: A related source concept is listed at 18 months; this does not substantiate the current 15-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `la_15_02`

- Current age: 15 months
- Current domain: `language`
- Current description: Follows one-step directions with a gesture
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 15 Months](https://www.cdc.gov/act-early/milestones/15-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/15-months.html
- Source age: 15 months
- Source domain/category: Language/Communication
- Concise supported concept: Follows one-step directions with a gesture
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `so_15_01`

- Current age: 15 months
- Current domain: `social_emotional`
- Current description: Copies other children while playing
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 15 Months](https://www.cdc.gov/act-early/milestones/15-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/15-months.html
- Source age: 15 months
- Source domain/category: Social/Emotional
- Concise supported concept: Copies other children while playing
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_15_02`

- Current age: 15 months
- Current domain: `social_emotional`
- Current description: Shows you an object they like
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 15 Months](https://www.cdc.gov/act-early/milestones/15-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/15-months.html
- Source age: 15 months
- Source domain/category: Social/Emotional
- Concise supported concept: Shows you an object they like
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_15_01`

- Current age: 15 months
- Current domain: `cognitive`
- Current description: Tries to use switches, knobs, or buttons on a toy
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Cognitive
- Concise supported concept: Tries to use switches, knobs, or buttons on a toy
- Reason/limitation: A related source concept is listed at 24 months; this does not substantiate the current 15-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `gr_18_01`

- Current age: 18 months
- Current domain: `gross_motor`
- Current description: Walks independently without holding on
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Walks independently without holding on
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_18_02`

- Current age: 18 months
- Current domain: `gross_motor`
- Current description: Climbs onto and off a couch or chair without help
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Climbs onto and off a couch or chair without help
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_18_03`

- Current age: 18 months
- Current domain: `gross_motor`
- Current description: Kicks a ball
- Evidence classification: **DUPLICATE_OR_NEAR_DUPLICATE**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Kicks a ball
- Reason/limitation: Overlaps another current record; see duplicate summary. The source concept does not justify retaining both records.
- Review status: Pending duplicate resolution; exclude from verified candidates.

### `fi_18_01`

- Current age: 18 months
- Current domain: `fine_motor`
- Current description: Feeds self with fingers
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Feeds self with fingers
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_18_02`

- Current age: 18 months
- Current domain: `fine_motor`
- Current description: Stacks two or more objects or blocks
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 15 Months](https://www.cdc.gov/act-early/milestones/15-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/15-months.html
- Source age: 15 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Stacks two or more objects or blocks
- Reason/limitation: A related source concept is listed at 15 months; this does not substantiate the current 18-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `la_18_01`

- Current age: 18 months
- Current domain: `language`
- Current description: Says at least six words
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Language/Communication
- Concise supported concept: Says at least six words
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `la_18_02`

- Current age: 18 months
- Current domain: `language`
- Current description: Follows one-step directions without gestures
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Language/Communication
- Concise supported concept: Follows one-step directions without gestures
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_18_01`

- Current age: 18 months
- Current domain: `social_emotional`
- Current description: Moves away but looks back to ensure you are close
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Social/Emotional
- Concise supported concept: Moves away but looks back to ensure you are close
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_18_02`

- Current age: 18 months
- Current domain: `social_emotional`
- Current description: Points to show something interesting
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Social/Emotional
- Concise supported concept: Points to show something interesting
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_18_01`

- Current age: 18 months
- Current domain: `cognitive`
- Current description: Copies chores or tasks
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Cognitive
- Concise supported concept: Copies chores or tasks
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_18_02`

- Current age: 18 months
- Current domain: `cognitive`
- Current description: Points to at least one body part when asked
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Cognitive
- Concise supported concept: Points to at least one body part when asked
- Reason/limitation: A related source concept is listed at 24 months; this does not substantiate the current 18-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `gr_24_01`

- Current age: 24 months
- Current domain: `gross_motor`
- Current description: Runs
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Runs
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_24_02`

- Current age: 24 months
- Current domain: `gross_motor`
- Current description: Walks up and down stairs holding on
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Walks up and down stairs holding on
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_24_03`

- Current age: 24 months
- Current domain: `gross_motor`
- Current description: Kicks a ball
- Evidence classification: **DUPLICATE_OR_NEAR_DUPLICATE**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Kicks a ball
- Reason/limitation: Overlaps another current record; see duplicate summary. The source concept does not justify retaining both records.
- Review status: Pending duplicate resolution; exclude from verified candidates.

### `fi_24_01`

- Current age: 24 months
- Current domain: `fine_motor`
- Current description: Holds a crayon and scribbles
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 18 Months](https://www.cdc.gov/act-early/milestones/18-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/18-months.html
- Source age: 18 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Holds a crayon and scribbles
- Reason/limitation: A related source concept is listed at 18 months; this does not substantiate the current 24-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `fi_24_02`

- Current age: 24 months
- Current domain: `fine_motor`
- Current description: Eats with a spoon
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Eats with a spoon
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_24_03`

- Current age: 24 months
- Current domain: `fine_motor`
- Current description: Draws a vertical line when shown one
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `la_24_01`

- Current age: 24 months
- Current domain: `language`
- Current description: Speaks two-word phrases
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Language/Communication
- Concise supported concept: Speaks two-word phrases
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `la_24_02`

- Current age: 24 months
- Current domain: `language`
- Current description: Points to things in a book when named
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Language/Communication
- Concise supported concept: Points to things in a book when named
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `la_24_03`

- Current age: 24 months
- Current domain: `language`
- Current description: Says at least two words together
- Evidence classification: **DUPLICATE_OR_NEAR_DUPLICATE**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Language/Communication
- Concise supported concept: Says at least two words together
- Reason/limitation: Overlaps another current record; see duplicate summary. The source concept does not justify retaining both records.
- Review status: Pending duplicate resolution; exclude from verified candidates.

### `so_24_01`

- Current age: 24 months
- Current domain: `social_emotional`
- Current description: Notices when others are hurt or upset
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Social/Emotional
- Concise supported concept: Notices when others are hurt or upset
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_24_02`

- Current age: 24 months
- Current domain: `social_emotional`
- Current description: Looks at your face to see how to react
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Social/Emotional
- Concise supported concept: Looks at your face to see how to react
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_24_01`

- Current age: 24 months
- Current domain: `cognitive`
- Current description: Follows two-step instructions
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 30 Months](https://www.cdc.gov/act-early/milestones/30-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/30-months.html
- Source age: 30 months
- Source domain/category: Cognitive
- Concise supported concept: Follows two-step instructions
- Reason/limitation: A related source concept is listed at 30 months; this does not substantiate the current 24-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `co_24_02`

- Current age: 24 months
- Current domain: `cognitive`
- Current description: Points to at least two body parts when asked
- Evidence classification: **DOMAIN_MISMATCH**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: 24 months
- Source domain/category: Language/Communication
- Concise supported concept: Points to at least two body parts when asked
- Reason/limitation: CDC places the corresponding concept under Language/Communication, unlike current SPARSH domain cognitive.
- Review status: Pending domain crosswalk review; exclude from verified candidates.

### `co_24_03`

- Current age: 24 months
- Current domain: `cognitive`
- Current description: Sorts shapes or colors
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 2 Years](https://www.cdc.gov/act-early/milestones/2-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/2-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `gr_36_01`

- Current age: 36 months
- Current domain: `gross_motor`
- Current description: Climbs stairs alternating feet
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `gr_36_02`

- Current age: 36 months
- Current domain: `gross_motor`
- Current description: Jumps off the ground with both feet
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 30 Months](https://www.cdc.gov/act-early/milestones/30-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/30-months.html
- Source age: 30 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Jumps off the ground with both feet
- Reason/limitation: A related source concept is listed at 30 months; this does not substantiate the current 36-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `gr_36_03`

- Current age: 36 months
- Current domain: `gross_motor`
- Current description: Runs easily avoiding obstacles
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_36_01`

- Current age: 36 months
- Current domain: `fine_motor`
- Current description: Strings beads or large items
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Strings beads or large items
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_36_02`

- Current age: 36 months
- Current domain: `fine_motor`
- Current description: Puts on some clothing themself
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Puts on some clothing themself
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `fi_36_03`

- Current age: 36 months
- Current domain: `fine_motor`
- Current description: Uses a fork
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Uses a fork
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `la_36_01`

- Current age: 36 months
- Current domain: `language`
- Current description: Speaks in sentences of three or more words
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `la_36_02`

- Current age: 36 months
- Current domain: `language`
- Current description: Answers simple who, what, where questions
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `la_36_03`

- Current age: 36 months
- Current domain: `language`
- Current description: Is understood by strangers most of the time
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Language/Communication
- Concise supported concept: Is understood by strangers most of the time
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_36_01`

- Current age: 36 months
- Current domain: `social_emotional`
- Current description: Plays alongside other children
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 30 Months](https://www.cdc.gov/act-early/milestones/30-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/30-months.html
- Source age: 30 months
- Source domain/category: Social/Emotional
- Concise supported concept: Plays alongside other children
- Reason/limitation: A related source concept is listed at 30 months; this does not substantiate the current 36-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `so_36_02`

- Current age: 36 months
- Current domain: `social_emotional`
- Current description: Shows a wide range of emotions
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `so_36_03`

- Current age: 36 months
- Current domain: `social_emotional`
- Current description: Notices other children and joins them to play
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Social/Emotional
- Concise supported concept: Notices other children and joins them to play
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_36_01`

- Current age: 36 months
- Current domain: `cognitive`
- Current description: Draws a circle when shown how
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Cognitive
- Concise supported concept: Draws a circle when shown how
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_36_02`

- Current age: 36 months
- Current domain: `cognitive`
- Current description: Identifies at least two colors correctly
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 30 Months](https://www.cdc.gov/act-early/milestones/30-months.html)
- Source URL: https://www.cdc.gov/act-early/milestones/30-months.html
- Source age: 30 months
- Source domain/category: Cognitive
- Concise supported concept: Identifies at least two colors correctly
- Reason/limitation: A related source concept is listed at 30 months; this does not substantiate the current 36-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `co_36_03`

- Current age: 36 months
- Current domain: `cognitive`
- Current description: Avoids touching a hot object when warned
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Cognitive
- Concise supported concept: Avoids touching a hot object when warned
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `gr_48_01`

- Current age: 48 months
- Current domain: `gross_motor`
- Current description: Catches a large ball most of the time
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Catches a large ball most of the time
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_48_02`

- Current age: 48 months
- Current domain: `gross_motor`
- Current description: Hops on one foot
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Hops on one foot
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_48_03`

- Current age: 48 months
- Current domain: `gross_motor`
- Current description: Climbs stairs alternating feet without support
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_48_01`

- Current age: 48 months
- Current domain: `fine_motor`
- Current description: Draws a person with three or more body parts
- Evidence classification: **DOMAIN_MISMATCH**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Cognitive
- Concise supported concept: Draws a person with three or more body parts
- Reason/limitation: CDC places the corresponding concept under Cognitive, unlike current SPARSH domain fine_motor.
- Review status: Pending domain crosswalk review; exclude from verified candidates.

### `fi_48_02`

- Current age: 48 months
- Current domain: `fine_motor`
- Current description: Uses scissors
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_48_03`

- Current age: 48 months
- Current domain: `fine_motor`
- Current description: Copies a cross shape
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `la_48_01`

- Current age: 48 months
- Current domain: `language`
- Current description: Says sentences with four or more words
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Language/Communication
- Concise supported concept: Says sentences with four or more words
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `la_48_02`

- Current age: 48 months
- Current domain: `language`
- Current description: Tells a simple story
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Language/Communication
- Concise supported concept: Tells a simple story
- Reason/limitation: A related source concept is listed at 60 months; this does not substantiate the current 48-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `la_48_03`

- Current age: 48 months
- Current domain: `language`
- Current description: Answers simple questions about a story
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Language/Communication
- Concise supported concept: Answers simple questions about a story
- Reason/limitation: A related source concept is listed at 60 months; this does not substantiate the current 48-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `so_48_01`

- Current age: 48 months
- Current domain: `social_emotional`
- Current description: Pretends to be something else during play
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Social/Emotional
- Concise supported concept: Pretends to be something else during play
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_48_02`

- Current age: 48 months
- Current domain: `social_emotional`
- Current description: Comforts others who are hurt or sad
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Social/Emotional
- Concise supported concept: Comforts others who are hurt or sad
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_48_03`

- Current age: 48 months
- Current domain: `social_emotional`
- Current description: Prefers playing with other children
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Social/Emotional
- Concise supported concept: Prefers playing with other children
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `co_48_01`

- Current age: 48 months
- Current domain: `cognitive`
- Current description: Names a few colors
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Cognitive
- Concise supported concept: Names a few colors
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_48_02`

- Current age: 48 months
- Current domain: `cognitive`
- Current description: Understands same and different
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `co_48_03`

- Current age: 48 months
- Current domain: `cognitive`
- Current description: Follows three-step instructions
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `gr_60_01`

- Current age: 60 months
- Current domain: `gross_motor`
- Current description: Hops, skips, and may begin to somersault
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Hops, skips, and may begin to somersault
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `gr_60_02`

- Current age: 60 months
- Current domain: `gross_motor`
- Current description: Stands on one foot for 10 seconds
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `gr_60_03`

- Current age: 60 months
- Current domain: `gross_motor`
- Current description: Uses a fork and spoon well
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Uses a fork and spoon well
- Reason/limitation: A related source concept is listed at 36 months; this does not substantiate the current 60-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `fi_60_01`

- Current age: 60 months
- Current domain: `fine_motor`
- Current description: Draws a person with six or more body parts
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_60_02`

- Current age: 60 months
- Current domain: `fine_motor`
- Current description: Copies a triangle or other shapes
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_60_03`

- Current age: 60 months
- Current domain: `fine_motor`
- Current description: Buttons some buttons
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Movement/Physical Development
- Concise supported concept: Buttons some buttons
- Reason/limitation: Concept and age are supported, but CDC combines motor development and does not verify the SPARSH fine/gross split.
- Review status: Pending professional review; resolve limitations before use.

### `la_60_01`

- Current age: 60 months
- Current domain: `language`
- Current description: Speaks clearly to most listeners
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 3 Years](https://www.cdc.gov/act-early/milestones/3-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/3-years.html
- Source age: 36 months
- Source domain/category: Language/Communication
- Concise supported concept: Speaks clearly to most listeners
- Reason/limitation: A related source concept is listed at 36 months; this does not substantiate the current 60-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `la_60_02`

- Current age: 60 months
- Current domain: `language`
- Current description: Tells a simple story with full sentence structure
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Language/Communication
- Concise supported concept: Tells a simple story with full sentence structure
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `la_60_03`

- Current age: 60 months
- Current domain: `language`
- Current description: Uses future tense
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `so_60_01`

- Current age: 60 months
- Current domain: `social_emotional`
- Current description: Follows rules or takes turns in games
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Social/Emotional
- Concise supported concept: Follows rules or takes turns in games
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_60_02`

- Current age: 60 months
- Current domain: `social_emotional`
- Current description: Sings, dances, or acts for you
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Social/Emotional
- Concise supported concept: Sings, dances, or acts for you
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `so_60_03`

- Current age: 60 months
- Current domain: `social_emotional`
- Current description: Is aware of gender identity
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: null
- Source domain/category: No matching CDC item identified in reviewed category
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: No sufficiently matching concept and age assignment was identified in the reviewed authoritative item-level sources.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `co_60_01`

- Current age: 60 months
- Current domain: `cognitive`
- Current description: Counts to 10 or higher
- Evidence classification: **SOURCE_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Cognitive
- Concise supported concept: Counts to 10 or higher
- Reason/limitation: Concept, age, and CDC category match; this monitoring evidence does not validate SPARSH wording, scoring, or screening performance.
- Review status: Pending AWW wording and professional content review; not screening validation.

### `co_60_02`

- Current age: 60 months
- Current domain: `cognitive`
- Current description: Names at least four colors
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Milestones by 4 Years](https://www.cdc.gov/act-early/milestones/4-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/4-years.html
- Source age: 48 months
- Source domain/category: Cognitive
- Concise supported concept: Names at least four colors
- Reason/limitation: A related source concept is listed at 48 months; this does not substantiate the current 60-month assignment or every wording detail.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `co_60_03`

- Current age: 60 months
- Current domain: `cognitive`
- Current description: Understands basic concepts of time
- Evidence classification: **PARTIALLY_SUPPORTED**
- Source organization: CDC
- Exact source title: [Milestones by 5 Years](https://www.cdc.gov/act-early/milestones/5-years.html)
- Source URL: https://www.cdc.gov/act-early/milestones/5-years.html
- Source age: 60 months
- Source domain/category: Cognitive
- Concise supported concept: Understands basic concepts of time
- Reason/limitation: A related concept is supported, but current wording adds, combines, or narrows behavior beyond the source; screening validity is not established.
- Review status: Pending professional review; resolve limitations before use.

### `gr_72_01`

- Current age: 72 months
- Current domain: `gross_motor`
- Current description: Skips using alternating feet
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `gr_72_02`

- Current age: 72 months
- Current domain: `gross_motor`
- Current description: Rides a bicycle with or without training wheels
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `gr_72_03`

- Current age: 72 months
- Current domain: `gross_motor`
- Current description: Has good balance and catches a bounced ball reliably
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `fi_72_01`

- Current age: 72 months
- Current domain: `fine_motor`
- Current description: Ties basic knots and may begin learning shoelaces
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_72_02`

- Current age: 72 months
- Current domain: `fine_motor`
- Current description: Copies complex shapes
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `fi_72_03`

- Current age: 72 months
- Current domain: `fine_motor`
- Current description: Writes some letters or numbers
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `la_72_01`

- Current age: 72 months
- Current domain: `language`
- Current description: Uses complex sentences and correct grammar most of the time
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `la_72_02`

- Current age: 72 months
- Current domain: `language`
- Current description: Retells a short story in sequence
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `la_72_03`

- Current age: 72 months
- Current domain: `language`
- Current description: Has vocabulary of 2000 or more words
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `so_72_01`

- Current age: 72 months
- Current domain: `social_emotional`
- Current description: Understands rules and follows multi-step social games
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `so_72_02`

- Current age: 72 months
- Current domain: `social_emotional`
- Current description: Forms friendships and shows empathy consistently
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `so_72_03`

- Current age: 72 months
- Current domain: `social_emotional`
- Current description: Shows increasing independence from parents
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `co_72_01`

- Current age: 72 months
- Current domain: `cognitive`
- Current description: Understands days of the week roughly
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

### `co_72_02`

- Current age: 72 months
- Current domain: `cognitive`
- Current description: Has basic counting or early number sense to 20
- Evidence classification: **AGE_ASSIGNMENT_NEEDS_REVIEW**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Pending age/checkpoint review; exclude from verified candidates.

### `co_72_03`

- Current age: 72 months
- Current domain: `cognitive`
- Current description: Sorts objects by more than one feature
- Evidence classification: **NOT_VERIFIED**
- Source organization: CDC
- Exact source title: [Key Points about CDC's Developmental Milestone Checklists](https://www.cdc.gov/act-early/milestones/key-points.html)
- Source URL: https://www.cdc.gov/act-early/milestones/key-points.html
- Source age: null
- Source domain/category: No 72-month category; CDC age checklists end at 5 years
- Concise supported concept: No sufficiently matched source concept identified.
- Reason/limitation: The reviewed CDC age-specific set ends at 5 years; no age-six item evidence was identified.
- Review status: Unverified; exclude from verified candidates pending source evidence/review.

## Summary

- Total existing records: **155**.
- Currently `SOURCE_SUPPORTED` candidates: **48**.

### Count by classification

- `SOURCE_SUPPORTED`: **48**
- `PARTIALLY_SUPPORTED`: **38**
- `NOT_VERIFIED`: **34**
- `DOMAIN_MISMATCH`: **6**
- `AGE_ASSIGNMENT_NEEDS_REVIEW`: **24**
- `DUPLICATE_OR_NEAR_DUPLICATE`: **5**

### Candidate count by SPARSH domain

- `gross_motor`: **0**
- `fine_motor`: **0**
- `language`: **14**
- `cognitive`: **13**
- `social_emotional`: **21**

### Candidate count by source age

- 2 months: **6**
- 4 months: **3**
- 6 months: **9**
- 9 months: **4**
- 12 months: **6**
- 15 months: **2**
- 18 months: **4**
- 24 months: **3**
- 36 months: **4**
- 48 months: **4**
- 60 months: **3**

### Duplicate/near-duplicate IDs

- `gr_18_03` and `gr_24_03`: identical ?Kicks a ball? records.
- `gr_12_03` and `gr_15_01`: near-duplicate independent-steps records.
- `la_24_01` and `la_24_03`: near-duplicate two-word-language records.

### Domain mismatch IDs

`co_24_02`, `co_9_02`, `fi_48_01`, `fi_6_02`, `fi_6_03`, `fi_9_03`

### Age-review IDs

`co_15_01`, `co_18_02`, `co_24_01`, `co_36_02`, `co_60_02`, `co_72_02`, `fi_15_01`, `fi_15_02`, `fi_18_02`, `fi_24_01`, `fi_6_01`, `fi_72_03`, `fi_9_02`, `gr_36_02`, `gr_60_03`, `gr_72_03`, `gr_9_02`, `la_15_01`, `la_48_02`, `la_48_03`, `la_60_01`, `la_72_02`, `so_36_01`, `so_72_01`

### Unverified IDs

`co_24_03`, `co_48_02`, `co_48_03`, `co_4_01`, `co_4_02`, `co_72_01`, `co_72_03`, `fi_24_03`, `fi_2_02`, `fi_48_02`, `fi_48_03`, `fi_60_01`, `fi_60_02`, `fi_72_01`, `fi_72_02`, `gr_15_02`, `gr_36_01`, `gr_36_03`, `gr_48_03`, `gr_60_02`, `gr_6_03`, `gr_72_01`, `gr_72_02`, `gr_9_03`, `la_36_01`, `la_36_02`, `la_60_03`, `la_72_01`, `la_72_03`, `so_36_02`, `so_60_03`, `so_72_02`, `so_72_03`, `so_9_02`

### Current evidence gaps

- CDC combines Fine Motor and Gross Motor and has no 72-month checklist.
- Reviewed evidence does not establish a five-domain crosswalk for every record.
- The 23 current top-level red flags are not linked to answerable items and are not individually verified here.
- CDC monitoring milestones do not validate SPARSH scoring, weights, referrals, or screening performance.
- WHO/UNICEF is broad guidance, not a comparable age-by-age item bank. IAP concerns high-risk follow-up and selected tools, not the whole general AWW population.
- Source matching does not establish local cultural/language validity, administration reliability, sensitivity/specificity, or clinical utility.
