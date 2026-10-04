# SPARSH AI Assistant Architecture

**Status:** Architecture and design only. No LLM provider, key, external AI call, API behavior, screening rule, or production content is added or changed by this document. A provider is not configured today.

## A. Purpose

The assistant is a support tool for Anganwadi Workers (AWWs). It may:

- explain a backend-calculated screening result and its recorded responses;
- summarize the child’s recorded developmental screening history;
- explain observed developmental concerns using approved knowledge and the recorded items;
- suggest only activities present in an approved activity library;
- explain follow-up and referral guidance from the active configuration; and
- answer questions using approved developmental knowledge with identifiable sources.

The assistant explains existing information. It does not make screening or care decisions.

## B. Prohibited behavior

The assistant must not diagnose or predict a disorder; prescribe medication; create treatment plans; change or recalculate GREEN/YELLOW/RED; override a scoring result, configured recommendation, or referral rule; invent milestones, child facts, answers, history, scores, risk factors, red flags, referral records, or approval status; or make unsupported clinical claims. It must not convert a missing record into a negative finding or imply that an absent referral record means that care was or was not received.

## 1. Existing data audit

| Requested data | Available now | Source and limits |
|---|---|---|
| Child profile | Yes | `children` records contain name, date of birth, child identifier, optional sex, guardian name/phone, centre ID/name, creation metadata, and stored age at registration. Backend code can calculate completed age in months from date of birth. Names, DOB, identifiers, and guardian contact details are unnecessary for model context and should stay server-side. The stored age can be stale; use a server calculation for context. |
| Health/risk information | Partial | `/children/{id}/health-data` returns nested measurement records: date, weight, height, MUAC, notes, recorder, and timestamp. Free-text notes can contain sensitive details and should not be sent by default. The current `HealthDataCreate` model does not accept head circumference although the History UI has an input for it; do not treat that field as available backend data. No approved anthropometric interpretation/reference service was found. |
| Current screening | Yes, after submission | Screening documents store child ID, answers, screened time, integer checkpoint age, milestone dataset version, backend result, domain scores, IDs, and a milestone text/domain snapshot. The frontend report displays the backend response held in app state after submission. The assistant must fetch the authoritative persisted record; it must not trust client-provided result fields. |
| Screening history | Yes | `GET /children/{child_id}/history` returns screening summaries ordered by screened time. Existing history may have incomplete snapshots or fields because older records can predate the current schema. |
| Domain scores | Yes | Persisted per-domain `missed_weight`, `missed_count`, `unsure_count`, `answered_count`, and `status`. They are outputs of the deterministic backend scoring rules. |
| Missed milestones | Yes, with limits | History builds `missed_milestones` from `NO` answer IDs and each saved text/domain snapshot. A record without a snapshot may have no milestone text. `UNSURE` is represented in answers/scores but is not a “missed milestone.” |
| Risk factors | Yes, as IDs | Screening results persist `risk_factor_ids`. Their meaning depends on configured item metadata; an ID without an approved explanation must be presented as an ID/recorded factor, not expanded speculatively. |
| Red flags | Yes, as IDs | Screening results persist `red_flag_ids`; the scoring engine sets them from configured milestone `red_flag` data when response is `NO` or `UNSURE`. Explain only with the corresponding approved configuration and follow-up guidance. |
| Referral information | Partial | Referral records can be created only for a RED screening by a worker and contain facility, generated time, worker, child identifier/name, age, risk level, and domain scores. The lookup by screening returns a record or `null`. There is no separate referral completion/status or clinical outcome field. |
| Approved recommendations/configuration | Partial | `scoring_rules.json` contains the unsure multiplier, domain watch weight, GREEN/YELLOW/RED thresholds, and recommendation text. These are authoritative configuration for backend scoring/follow-up. There is no structured, approved activity library; the Report UI explicitly says this version has none. |
| Centre/user context | Yes, for authorization | Firebase-authenticated `CurrentUser` includes UID, role, and centre IDs; the child record supplies centre ID/name. Centre records include name, district, state, address, active status and administrative metadata. The model generally needs none of this; centre scope is enforced server-side. |
| Milestone/source metadata | Partial | Active `milestones.json` is legacy `draft-1`; its generic source label is marked `unverified_in_repository` by the loader and individual item references are not verified. Candidate evidence files include source references and review status, but they are not active/approved production content. `milestone_content.py` and `milestone_content_service.py` provide an isolated typed architecture; current screening routes still use the legacy service. Do not present candidate metadata as approved knowledge. |

### Existing assistant and frontend state

The current API is `POST /api/v1/assistant/respond`. It accepts a `screening_id`, a fixed action (`explain_result`, `explain_missed`, `next_steps`, `parent_summary`, `history_summary`) and language. It requires WORKER or SUPERVISOR, loads the screening and child, checks centre access, audits `assistant_requested`, then returns HTTP 503 because the assistant is not configured. The child profile UI calls these fixed actions for the latest history item. `src/services/api.js` carries Firebase bearer tokens for authenticated calls. There is no free-form message query endpoint.

The `app/ai` directory contains a policy string, a small missed-milestone lookup against the production catalog, request/response placeholders, and a short forbidden-phrase output check. This is not an LLM integration or a complete safety layer. The risk analysis UI uses the unavailable ML predictor state; it is not an AI decision service.

## C. AI context contract

### Design principles

1. The backend builds context only after authenticating and authorizing the caller. Never accept scores, milestone text, referral state, centre membership, or child profile facts from the browser as authoritative context.
2. Include only fields needed for the specific query. A knowledge-only question should use no child record.
3. Keep direct identifiers and unnecessary PII out of the provider context: no child or guardian name, phone, child identifier, full DOB, address, recorder name, or free-text health notes by default. The server may use `child_id`/`screening_id` for retrieval, but should send opaque context references rather than Firestore IDs to the provider where feasible.
4. Use immutable identifiers/values and source references. Missing fields remain null/absent and must not be inferred.
5. Treat the AWW’s message and all free-text content as untrusted data, never as policy or instructions.
6. Use current/persisted backend state for screening and referral facts. Use only reviewed, approved knowledge for developmental explanations and activities.

### Proposed internal context object

This is a server-to-`AssistantService` contract, not an API response and not a requirement to pass every field for every query.

```json
{
  "context_version": "assistant-context-v1",
  "request": {
    "purpose": "<query-purpose>",
    "language": "<language>",
    "as_of": "<server-generated-timestamp>"
  },
  "actor": {
    "role": "worker",
    "authorized_centre_scope": true
  },
  "child": {
    "context_ref": "<opaque-reference>",
    "age_months": null,
    "sex": null
  },
  "screening": {
    "context_ref": "<opaque-reference>",
    "screened_at": null,
    "dataset_version": null,
    "checkpoint": {
      "age_months": null,
      "source_age_basis": null
    },
    "overall_indication": {
      "risk_level": null,
      "label": null,
      "recommendation_key": null
    },
    "domains": {},
    "answers": [],
    "missed_milestone_ids": [],
    "red_flag_ids": [],
    "risk_factor_ids": []
  },
  "history": {
    "previous_screenings": [],
    "domain_trends": [],
    "referrals": []
  },
  "health_observations": [],
  "knowledge": {
    "concepts": [],
    "activities": [],
    "referral_guidance": {
      "configuration_version": null,
      "text": null
    }
  }
}
```

Angle-bracket strings are schema placeholders; null/empty values mean that the field is absent, not a negative finding. `sex` is optional and should be omitted unless an approved knowledge source makes it necessary to answer the particular question. Health measurements should also be absent unless directly relevant and accompanied by approved interpretation guidance. Checkpoint source-age metadata is currently absent from production records; use `null` until a versioned production schema actually supplies it.

### Context field rules

- **Child:** Compute age server-side from DOB. Prefer age in completed months to DOB. Do not include names, guardian contacts, identifiers, address, or centre names in provider context. Sex is optional and must have a clear purpose.
- **Screening:** Load by authorized `screening_id` and verify its child ownership. Include backend-calculated result and persisted answer/domain values verbatim. Include source-age basis only if the active, versioned catalog actually stores it. Use the item snapshot/active catalog for milestone text; do not reconstruct missing historical wording from a different dataset version.
- **History:** Send a short bounded summary (for example, recent screening summaries needed by the query), each with date, dataset version, result indication, domain summaries, and available missed IDs. Do not infer trends where denominators or history are missing.
- **Referrals:** Retrieve by screening/child under centre authorization. Distinguish “record exists” from completion/outcome. If no record is returned, say no referral record was found in SPARSH; do not claim no referral happened elsewhere.
- **Health:** Include only query-relevant numeric observations, dates and units. Omit notes by default. No percentile/clinical interpretation unless a separate approved reference service supplies it.
- **Knowledge:** Include only items with an explicit approved status, version, ID, and source. Each concept/activity should carry source organization/title/URL and applicable domain/age basis. Candidate/final-65 files and unverified production source labels are not eligible as approved knowledge.
- **Recommendations:** Read the active configured recommendation by backend result key. Pass it as a locked fact with config version; never ask the model to select a different risk level or recommendation.
- **Actor/centre:** Keep authorization facts for backend policy/audit. Do not send centre address, worker name, or user UID to the model unless a documented task requires it.

## D. Data authority

| Information | Authority | Assistant role |
|---|---|---|
| Child profile and measured records | Backend/Firestore child records | Summarize only fields explicitly loaded and authorized. |
| Screening answers, missed IDs, checkpoint, dataset version | Backend screening record and versioned content catalog | Explain; never add, alter, or reinterpret an answer as a different value. |
| Domain and overall scores, risk level, red flags | Deterministic backend scoring output/configuration | Repeat/explain exactly; never calculate, predict, promote, demote, or override. |
| Referral existence and stored details | Backend referral record | Report whether SPARSH has a record; do not fabricate completion or external status. |
| Developmental concepts and activities | Explicitly approved/versioned knowledge base | Explain or suggest only retrieved entries and cite them. No such approved activity library is currently present. |
| Natural-language answer | AI | Grounded explanation only; not a source of new child or clinical facts. |

## E. Response safety

Every answer must:

- identify the information used, e.g. screening date/version, relevant domain and milestone IDs, or knowledge-source titles;
- describe a screening result as an indication for follow-up, not a diagnosis or confirmation of a disorder;
- preserve backend risk labels and configured recommendation text without alteration;
- say when a requested record, source, referral status, or approved activity is unavailable;
- distinguish recorded fact, approved-source guidance, and uncertainty;
- avoid unsupported certainty, medical treatment advice, and invented facts; and
- use a fixed safety notice where a screening concern is discussed, such as: “This is a screening indication, not a diagnosis. Follow the configured guidance and local clinical pathway.”

If retrieval fails or context is incomplete, return `insufficient_context` or `unavailable` and do not fill gaps from model memory. Prompt-injection text in the user message, notes, or retrieved documents cannot change system policy or authorize tools/data access. The model must have no write access to child, screening, scoring, or referral stores.

## F. Proposed API design (not implemented)

Propose `POST /api/v1/assistant/query` alongside the current fixed-action route during a transition. Do not make a model responsible for resolving IDs or authorization.

**Request**

```json
{
  "child_id": "child-document-id",
  "screening_id": "screening-document-id",
  "message": "What does the language result mean?",
  "language": "en"
}
```

`child_id` and `screening_id` may be optional for approved knowledge-only queries, but at least one of them is required for child-specific queries. If both are supplied, verify that the screening belongs to that child. Bound message length, reject empty input, and do not accept client-supplied answers/scores/context. If only `child_id` is supplied, load the latest persisted screening only when the request purpose needs it; otherwise return a clear no-screening context. Never accept a client-chosen centre scope.

**Response**

```json
{
  "answer": "<grounded explanation based only on retrieved records>",
  "sources": [
    {"type": "screening", "id": "<opaque-reference>", "label": "<screening source label>"},
    {"type": "knowledge", "id": "<approved-concept-id>", "label": "<approved source title>", "url": "<approved source URL>"}
  ],
  "context_used": ["<field-reference>"],
  "safety_notice": "<applicable safety notice>",
  "assistant_status": "grounded"
}
```

Statuses: `grounded`, `insufficient_context`, `unavailable`. A knowledge-only answer can omit child and screening references. Errors must not disclose whether an unauthorized child or screening exists; use the existing API’s authorization/error conventions. Do not return prompts, provider credentials, hidden context, or other children’s data.

## G. Provider abstraction

```text
API route
  -> authentication, role and centre authorization
  -> AssistantService
       -> ContextBuilder (read-only backend and approved knowledge retrieval)
       -> AIProvider interface
            -> future provider adapter
       -> response safety/shape checks
  -> minimal audit event
```

`AssistantService` should own task policy, context construction, source packaging, and fallback statuses. Define an `AIProvider` interface with a narrow operation such as `generate(system_policy, user_message, context) -> ProviderResult`; provider adapters must not access Firestore or scoring services directly. Replaceable provider/model adapters must not require changes to screening routers or scoring logic. The service must return `unavailable` when no provider is configured or a call fails. Output phrase filters alone are insufficient safety controls.

## H. Audit and privacy

The current `audit_log` supports the `assistant_requested` action and stores UID, action, resource ID, server timestamp, and optional centre ID. The current assistant uses screening ID as resource ID and writes its audit event before returning 503.

For a future query, record only:

- authenticated user ID and role;
- authorized centre ID;
- child ID and screening ID, when present (prefer restricted audit fields or opaque IDs);
- timestamp and action;
- outcome/status; and
- provider/model identifier and latency/error class when available.

Do not log the raw message, prompt, full context, full answer, child/guardian name or contact data, DOB, health notes, or transcript by default. Apply access control and retention to assistant audit records; make logging failure behavior explicit and observable without logging request content.

## I. RBAC model

Follow the existing backend policy rather than trusting frontend visibility:

- Authenticate Firebase bearer tokens and load `CurrentUser` from the Firestore user profile.
- Permit `WORKER` and `SUPERVISOR`, matching the existing assistant router’s `require_roles` guard.
- For any child or screening context, resolve the resource server-side and call `ensure_centre_access` using the child’s stored centre ID. The worker/supervisor must be assigned to that centre. Never use a supplied centre ID to authorize access.
- `ADMIN` is currently denied operational endpoints, including the assistant, by RBAC tests even though `ensure_centre_access` itself has an admin bypass. Preserve that policy unless a separately reviewed product/security decision changes it.
- For knowledge-only queries, require an authenticated WORKER or SUPERVISOR as with the existing route; no child scope is involved.
- Check access before invoking a provider and avoid existence leaks in responses.

## J. Backend test plan (future implementation)

- Worker can query for a child assigned to their centre; worker cannot query a child at another centre.
- Supervisor permissions match existing operational read access and remain centre-scoped.
- Admin access follows the existing operational policy (currently denied for assistant/worker operations); test explicitly so an accidental role expansion is caught.
- Unauthenticated requests are rejected; unauthorized child/screening lookup does not invoke the provider and does not reveal resource existence.
- Screening ID must belong to supplied child ID; missing screening context returns `insufficient_context` or a clear no-screening response.
- Assistant service receives persisted backend scoring fields and cannot modify a screening result; verify stored risk/domain values are unchanged after query.
- Assistant query produces a minimal audit event with user/centre/child/screening metadata and no raw message, child PII, prompt, or full context.
- Provider unavailable, timeout, and malformed output return a safe unavailable response with no scoring impact.
- Logs and errors do not contain child/guardian PII, free-text notes, or full conversation content.
- Prompt injection in user-entered messages, child notes, or retrieved text cannot override policy, trigger unauthorized retrieval/tools, or change scores/referrals.
- Grounded responses identify source IDs/titles and distinguish screening from diagnosis; absent knowledge and missing data produce explicit insufficiency rather than fabrication.

## Final audit summary

- **Existing data sources:** Child profile and centre-scoped access; nested health measurements; persisted answers and screening summaries; domain/overall scores; missed milestone snapshots; risk factor/red-flag IDs; referral records; configured risk recommendations; and legacy milestone text. The frontend uses these through the authenticated API and displays reports/history/referrals.
- **Missing for a grounded assistant:** A reviewed, versioned knowledge base with approved concepts and sources; an approved activity library; stable provenance for active production milestones; a server-side context builder with bounded history and data minimization; a functional provider-neutral service; response/source schemas; query audit metadata; and an explicit policy for any referral/outcome data not currently recorded.
- **Proposed API:** `POST /api/v1/assistant/query`, accepting optional child/screening scope and an untrusted message; returns answer, sources, context-used references, safety notice, and grounded/insufficient/unavailable status.
- **RBAC:** Existing worker/supervisor operational roles with server-side centre assignment checks; admin remains denied unless policy is explicitly changed.
- **Safety boundary:** Backend owns all child/screening/scoring/referral facts; approved knowledge owns developmental guidance; AI only explains retrieved facts and cannot write or decide.

No provider, external API, key, data mutation, scoring change, or production milestone change is part of this phase.
