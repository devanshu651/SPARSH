# SPARSH custom developmental screening instrument: commissioning brief

**Status:** for professional authoring and review. Nothing in this brief is approved screening content, and it does not authorize activation in the app.

## Commission

Commission qualified child-development professionals to author, review, and validate a SPARSH-specific, age-appropriate caregiver screening instrument. The product target is **eight approved questions in each of five domains for each professionally approved age form** (40 items per form):

1. Gross Motor
2. Fine Motor
3. Language and Communication
4. Cognitive / Problem Solving
5. Social-Emotional

Eight is a requested product coverage target, not an established clinical standard. The professional team must determine whether it is appropriate and sufficiently reliable for each age form. They may recommend more, fewer, or no items for a domain/form, with a documented rationale. Do not fill a numeric gap with unsupported, duplicated, or age-inappropriate content.

The deliverable is a custom instrument. Unless and until the team completes appropriate validation, it must not be described as validated, diagnostic, or equivalent to a standardized instrument. It must not be used to diagnose a developmental condition. The team must define what the result means, its limits, and the appropriate follow-up pathway before any user-facing use.

## Current evidence and product baseline

The repository's `phase5-expanded-v1` catalog currently contains 45 eligible items across the supported checkpoints, but no checkpoint reaches eight items in every domain. Gross Motor and Fine Motor each have zero eligible items at every listed checkpoint. Language, Cognitive, and Social-Emotional coverage is also below target. See [the Phase 5 coverage audit](phase5-expanded-coverage.md) for the item counts and existing age-selection constraints.

The current active checkpoint set represented in that audit is 2, 4, 6, 9, 12, 15, 18, 24, 36, 48, and 60 months. The historical/configured 30- and 72-month rows have no approved active point checkpoint. These values are a repository baseline, not a prescription for the new instrument. The commissioned team must recommend the age forms, coverage intervals, boundary behavior, and treatment of children outside the supported ages. In particular, 1 month is not currently supported and must not be enabled without an explicit professional age policy and appropriate content.

## Required authoring and approval team

The commissioning organization should assign named, qualified reviewers and document their credentials and responsibilities. The team should include:

- A developmental pediatrician or equivalent clinician with child-development screening expertise, accountable for clinical content and escalation guidance.
- Child-development professionals with expertise across motor, communication, cognitive, and social-emotional development.
- A measurement/psychometrics specialist to advise on item construction, form length, reliability, validity, thresholds, and pilot design.
- A local community/workflow specialist familiar with caregiver administration and the intended SPARSH setting.
- Hindi and English language/localization reviewers, plus additional language reviewers for each language offered.
- A copyright/licensing reviewer to clear source use, adaptations, translations, and electronic display.

One qualified clinical lead must be accountable for final clinical approval. Domain and language reviewers must sign off on their respective items. Record actual names, qualifications, roles, and dates; do not use placeholder approvals.

## Decisions the professional team must deliver

1. **Intended use and users:** target population, administrator, setting, screening purpose, exclusions, and limits of interpretation.
2. **Age forms:** exact supported ages or age intervals; age calculation and boundary rules; premature birth/corrected-age policy if applicable; and behavior below/above the supported range. Each item must have evidence and a clinical rationale for its applicability. Do not infer applicability from a milestone's mean age or from attainment windows alone.
3. **Item bank and blueprint:** approved item wording, domain mapping, age form, source/adaptation provenance, administration instructions, response options, and rationale for coverage. Explain any domain/form that does not meet the requested eight-item target.
4. **Scoring and interpretation:** response handling, missing/unsure responses, thresholds if any, referral or follow-up recommendations, safety language, and limitations. Scoring requires separate professional approval; item approval alone is not scoring approval.
5. **Validation plan and evidence:** cognitive interviews, accessibility and language review, field pilot, sample/population rationale, psychometric analysis, acceptance criteria, known limitations, and revalidation triggers.
6. **Rights and release package:** licenses/permissions, final source register, versioned approved item manifest, sign-offs, and a change-control plan.

## Age and source safeguards

- Preserve the existing strict age-selection behavior until a formally reviewed age policy is approved and implemented.
- Do not assign ages arbitrarily, extend an item across ages without evidence, or return the full catalog to every child.
- A source's average/mean age is not, by itself, a screening cutoff or an item applicability interval. Attainment windows describe attainment distributions and do not, by themselves, establish screening eligibility.
- CDC milestone materials are developmental monitoring resources; their use does not by itself validate a custom screening instrument. Any reuse, paraphrase, mapping, or translation needs clinical and rights review.
- Do not activate AAP- or WHO-derived candidates, legacy recovered content, or any newly authored item until its age, domain, wording, evidence, rights, and clinical status are all resolved and approved.
- Preserve source wording only where permitted. Record whether each item is original, adapted, translated, or reproduced and document the applicable permission.

## Approval gates before product activation

1. Clinical lead approves the intended use, age blueprint, domains, and safety/escalation plan.
2. Each item receives independent domain/clinical and wording review; disagreements are adjudicated and recorded.
3. Localization, accessibility, caregiver comprehension, and administration are reviewed for every offered language and setting.
4. Rights clearance is complete for every item and translation.
5. The professional team completes the agreed pilot and validation evidence, or explicitly limits the product claims and use pending that evidence.
6. Scoring and referral behavior are independently approved, with thresholds supported by the validation plan.
7. The release manifest has a unique version, exact age applicability, reviewer sign-offs, and a documented rollback/change process.
8. Engineering verifies deterministic age selection, no future-age or whole-catalog leakage, and correct out-of-range behavior against the approved manifest. Only then may a separate release decision activate the version.

## Acceptance package

The commission is complete when SPARSH receives:

- A signed intended-use and age-form specification.
- A complete item bank and source/rights register using the companion [item review template](sparsh-custom-screening-item-review-template.md).
- Reviewer names, credentials, dated approvals, and adjudication records.
- Pilot/validation protocol and results, or an explicit restricted-use plan identifying what remains unvalidated.
- Approved scoring, interpretation, referral, safety, and language materials.
- A versioned machine-readable item manifest and release notes.

No draft, candidate, or template row is production content. Items remain inactive until the acceptance package is reviewed and the release gate is explicitly completed.
