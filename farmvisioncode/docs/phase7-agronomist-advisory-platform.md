# Phase 7 — Agronomist Advisory Platform Contracts

## Purpose and non-goals

Phase 7 adds a consent-based advisory layer to the existing farmer-owned FarmVision data model. It does not change telemetry, alert, recommendation, device, or Digital Twin behavior. It does not execute actuators, publish commands, expose public farm discovery, or grant access through marketplace activity.

All private responses use `Cache-Control: no-store`. PostgreSQL remains an integration dependency: this milestone is validated offline with Prisma generation/type checks/unit tests only. No migration is applied and no database connection is required by the contract tests.

## Consent and access model

- A `Farm` has exactly one owner. The owner remains the Farmer who created it; ownership is not transferred by an advisory relationship.
- `UserRole` remains a multi-role assignment. The `AGRONOMIST` role is assigned by a trusted server-side/admin process, never by a client request or self-service form.
- A role is not consent. An Agronomist role alone reveals no farm, device, reading, alert, recommendation, note, or review.
- Consent is represented by one farm-specific `FarmAdvisorAccess` relationship per `(farmId, agronomistId)` and an append-only event trail.
- Only the farm owner, while holding the Farmer role, may approve, decline, or revoke that relationship.
- Only the Agronomist named by the relationship, while holding the Agronomist role, may request access and use the farm after approval.
- `PENDING`, `DECLINED`, and `REVOKED` relationships reveal no farm observations. An Agronomist may see only the request's non-sensitive status and a farm label where explicitly needed for workflow UX; a pending request must not include observations.
- Revocation takes effect for every subsequent read/write authorization check. Existing notes and audit events remain historical records; revocation does not erase the farmer's data.
- A user with both Farmer and Agronomist roles must satisfy the rule for the operation being performed. Being an Agronomist does not expand the user's owner scope, and being a Farmer does not permit advisor actions on farms they do not own.

## Role responsibilities and authorization boundaries

| Capability | Farmer owner | Agronomist with active grant | Other role / marketplace user |
| --- | --- | --- | --- |
| Read own farm data | Yes | No, unless active grant exists | No |
| Request access to a farm | No | Yes, for a different farm | No |
| Approve/decline/revoke access | Yes, for owned farm | No | No |
| Read an approved farm review | Yes | Yes, only for assigned active grant | No |
| Create advisory note | No | Yes, only for assigned active grant | No |
| Request review of a recommendation | Yes, for own farm | No | No |
| Review recommendation | Yes, final accept/decline only | Yes, assigned active grant | No |
| Change Phase 3 recommendation/alert lifecycle | Existing Farmer owner rules only | No | No |
| Execute commands or actuators | No Phase 7 path | No Phase 7 path | No |

The server must scope queries by owner or active grant in the database predicate. Filtering an already broad result in the UI is not authorization.

## Workflow contracts

### 1. Agronomist access request

`POST /api/advisory/access` accepts `{ farmId }`. The signed-in actor must have `AGRONOMIST`, must not be the farm owner, and must not already have `PENDING` or `ACTIVE` access. The service creates or reopens a farm-specific request as `PENDING` and appends `REQUESTED`.

`GET /api/advisory/access` returns owner-visible requests for farms owned by a Farmer actor and the actor's own Agronomist requests. Own pending/declined/revoked requests must not contain observations or review data.

### 2. Farmer approval workflow

`POST /api/advisory/access/{accessId}/decision` accepts `{ action: "APPROVE" | "DECLINE" | "REVOKE", message? }`. Only the Farmer owner may decide. `PENDING → ACTIVE` on approval, `PENDING → DECLINED` on decline, and `ACTIVE → REVOKED` on revocation. Every transition appends an event and is concurrency-checked. Invalid or repeated transitions return `409`; unknown/non-owned access returns `404`.

### 3. Access revocation workflow

Revocation is explicit and owner-only. The authorization predicate for every Agronomist farm read/write requires `status = ACTIVE` at request time. A revoked Agronomist receives no farm observations and cannot create notes or act on reviews. Revocation does not rewrite historical note evidence or delete audit events.

### 4. Advisory-note workflow

`POST /api/advisory/notes` accepts `{ farmId, title, body, readingIds[], recommendationIds[] }`. Only the assigned Agronomist with active access may write. At least one evidence identifier is required. The service re-queries every reading and recommendation with the same `farmId` predicate inside the transaction; client-supplied evidence values are never trusted. It stores an immutable evidence snapshot containing source, event time, fields, units, recommendation rule version, and server capture time.

`GET /api/advisory/notes?farmId=...` is available only to the farm owner or an Agronomist with active access and returns notes for that farm. No write changes telemetry, device state, alerts, or the Phase 3 recommendation lifecycle.

### 5. Evidence and recommendation review workflow

`POST /api/advisory/reviews` is Farmer-owner-only and accepts `{ recommendationId, agronomistId, submissionNote? }`. The recommendation must belong to the owner's farm and the named user must hold `AGRONOMIST` plus an `ACTIVE` grant for that farm. It creates one unresolved `PENDING` review for that recommendation/Agronomist pair.

`POST /api/advisory/reviews/{reviewId}/decision` accepts one of:

- Assigned active Agronomist: `APPROVE`, `REQUEST_CHANGES`, or `NOT_RECOMMENDED` while status is `PENDING`.
- Farmer owner: `ACCEPT` or `DECLINE` while status is `APPROVED`.

Review status is separate from `RecommendationStatus`; no review action acknowledges, resolves, changes, or executes a recommendation. Every transition appends an event. A later farmer submission may create a new review after a prior review reaches a terminal state.

`GET /api/advisory/reviews` returns only reviews scoped to the Farmer owner or the assigned Agronomist with an active grant. A revoked Agronomist cannot read the farm review.

## State transitions

```text
Access:    (none | DECLINED | REVOKED) --Agronomist request--> PENDING
           PENDING --owner approve--> ACTIVE
           PENDING --owner decline--> DECLINED
           ACTIVE  --owner revoke--> REVOKED

Review:    (none | terminal) --farmer submit--> PENDING
           PENDING --assigned Agronomist--> APPROVED | CHANGES_REQUESTED | NOT_RECOMMENDED
           APPROVED --farmer owner--> ACCEPTED_BY_FARMER | DECLINED_BY_FARMER
```

## Verification boundary

Offline checks cover pure authorization/state transitions, input validation, evidence contract shape, Prisma client generation, TypeScript, lint, and unit tests. They do not prove live transaction isolation, migration compatibility, OAuth behavior, browser rendering, hardware calibration, or PostgreSQL connectivity. The Phase 7 schema is additive and remains an unapplied draft until the existing `farmvision_dev` target is independently confirmed and the ordered migration plan is reviewed.
