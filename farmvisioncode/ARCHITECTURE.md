# FarmVision AI Architecture

`PROJECT_CONTEXT.md` remains the primary product and engineering brief. This document records implementation choices and verification boundaries.

## Current milestone status

Foundation and Phase 1–8 source implementations are present at code level. Phases 4–6 add no database models or migrations. Phase 7 advisory and Phase 8 marketplace model changes remain additive offline drafts; migration verification remains pending. The user reports that the existing `farmvision_dev` database exists and PostgreSQL connectivity was manually confirmed through `psql`; do not recreate it. Live persistence, migration compatibility, and cross-account integration tests remain unverified. Infrastructure verification is now the blocking priority: review and apply the ordered migrations, verify persistence/isolation, resolve the build host issue, then verify ESP32 telemetry and sensor calibration before expanding marketplace commerce.

On 2026-10-20, the user manually confirmed PostgreSQL connectivity through `psql`. The current migration directory contains only Phase 1–3 drafts; the Phase 1 `FarmVisionRole` enum predates the Phase 7 `AGRONOMIST` and Phase 8 `ENTREPRENEUR` values, so migration SQL must be reviewed/reconciled before deployment. An offline `prisma migrate diff` review also requires a configured shadow database when diffing from the migrations directory; no shadow database was configured and no diff was applied. `npm.cmd run build` still stops before compilation with `EPERM` while statting `C:\Users\user\.git`; no access-control or file changes were attempted outside the project workspace.

## Application shape

FarmVision remains a TypeScript modular monolith: one Next.js App Router application, Route Handlers, and server-only application services. Farmer pages are `/farms`, `/devices`, `/alerts`, `/recommendations`, `/analytics`, `/intelligence`, and `/digital-twin`. APIs include `/api/telemetry`, `/api/devices`, `/api/alerts`, `/api/alerts/[alertId]/acknowledge`, `/api/recommendations`, `/api/analytics`, and `/api/intelligence`; the Twin adds no write or simulation API. Domain rules, persistence, and UI remain separate.

REST is still the provisional telemetry ingress. MQTT waits for a confirmed hardware/network contract. Alert and recommendation evaluation runs in the existing per-device telemetry transaction; no worker, broker, queue, or microservice is added. Historical analytics and intelligence read the append-only `SensorReading` history; Phase 5 reuses Phase 4 range and owner-choice services and analyzes one selected device. Phase 6 combines the existing owner-scoped analytics and intelligence responses for a same-device baseline and computes a scenario in browser memory. Polling refresh and stale-device reporting remain future work.

## Existing Phase 1/2 model

- `User` has immutable Manus `openId` and server-assigned `UserRole`; each `Farm` belongs to one owner.
- `Device` belongs to a farm. Its 256-bit bearer credential is shown once and only its SHA-256 hash is stored.
- `SensorReading` stores append-only history and de-duplicates on `(deviceId, messageId)`, with event time and receipt time.
- `DeviceState` is a separate latest projection and advances only for a non-older reading.

Phase 1 adds users/roles/farms; Phase 2 incrementally adds device, reading, and state models. Both SQL drafts remain unapplied.

## Phase 3 alerts and recommendations

The pure alert rules are in `backend/src/modules/alerts/rules.ts`; configurable prototype defaults are feed `<=20%` Warning/`<=10%` Critical, water `<=20%` Warning/`<=10%` Critical, and temperature `>=32°C` Warning/`>=35°C` Critical. Boundaries are inclusive. These values are not validated agricultural thresholds. Temperature does not currently combine humidity. Omitted sensor fields do not create or clear alerts.

After accepted telemetry advances the latest state, the telemetry transaction writes alert changes and recommendation changes together. Out-of-order events stay in immutable history but do not backdate the current alert/recommendation. If the transaction rolls back, neither side is committed.

`Alert` stores one current lifecycle per `(deviceId, type)`; `AlertEvent` is its append-only audit history. Identical readings update evidence without an event for every sample. Escalation reopens and resets acknowledgement; recovery resolves the alert and adds an Info event; recurrence reopens the current row while preserving prior events. Farmer acknowledgement only records that the alert was seen; it never clears the condition.

`Recommendation` has a unique link to its alert and stores type, severity, status, explanation, suggested action, observed value/threshold/unit, device event time, registered hardware/simulator source, rule version, creation/generation times, and acknowledgement provenance. Each active alert maps to a cautious `FEED_CHECK`, `WATER_CHECK`, or `HEAT_RESPONSE` prompt. Recommendation state mirrors alert creation, escalation, acknowledgement, and recovery in the same transaction. Its history reuses `AlertEvent` so audit events do not diverge across duplicated tables.

`GET /api/alerts` and `GET /api/recommendations` are Farmer-only and scope through farm ownership. `POST /api/alerts/{alertId}/acknowledge` is same-origin, owner-scoped, idempotent, and updates its linked recommendation in one transaction. `/alerts` and `/recommendations` are their respective pages. See [`docs/phase3-alerts-automation.md`](docs/phase3-alerts-automation.md) for request bounds, response shapes, threshold details, and manual checks.

## Recommendation limits and safety

Persisted Phase 3 recommendations explain observed values and thresholds and preserve device source. Feed/water/heat prompts ask the farmer to verify observations and follow established farm procedures; they are not universal veterinary guidance or automated decisions. Phase 3 itself does not estimate a refill date. Phase 5 adds an on-demand directional 0% crossing only when minimum history is present; it is not a calibrated refill schedule. Persisted rules remain `recommendation-v1` and need domain/sensor-calibration review.

`NotificationDispatcher` defines SMS/email/push ports but no provider or secret is configured; absent providers return `NOT_CONFIGURED`. The automation evaluator produces human-approval proposals marked `NOT_EXECUTED`. There is no command endpoint, actuator executor, MQTT publisher, relay control, or direct device effect.

## Phase 8 Entrepreneur Marketplace Foundation

The marketplace is a separate bounded module for supplier profiles and catalog products. `ENTREPRENEUR` is a server-side/admin-assigned value in the existing multi-role `UserRole` model; no marketplace endpoint self-assigns it. Multi-role users still satisfy the authorization rule for the operation being performed.

The additive marketplace model draft contains one supplier profile per entrepreneur and products owned by that profile. Products support `FEED`, `VETERINARY_MEDICINE`, `SEEDS`, `FERTILIZER`, and `EQUIPMENT` categories with `DRAFT`, `PUBLISHED`, and `ARCHIVED` lifecycle. Supplier owners may manage only their own profile/products. Catalog reads expose published product and public supplier fields; draft/archived rows remain owner-scoped.

Marketplace authorization never joins through Farm, Device, telemetry, recommendation, or advisory relationships. A marketplace role or catalog interaction grants no farm-data access, does not change Farmer ownership, and does not satisfy Agronomist consent. Veterinary products are catalog entries only, not prescriptions or treatment advice. Checkout, payment, fulfillment, reviews, inventory synchronization, and regulated supplier verification are deferred. See [`docs/phase8-entrepreneur-marketplace-foundation.md`](docs/phase8-entrepreneur-marketplace-foundation.md).

## Verification Sprint and Phase 9 veterinary preparation

Verification is tracked independently: code may be complete while database and hardware remain unverified. The current matrix and blockers are recorded in [`docs/verification-sprint.md`](docs/verification-sprint.md). The six migration drafts are ordered Phase 1, Phase 2, Phase 3 alerts, Phase 3 recommendations, Phase 7 advisory, and Phase 8 marketplace; all are additive and contain no destructive statements. `DATABASE_URL` is not present in the current process, so migration status, deployment, persistence, and PostgreSQL-backed isolation tests remain pending. The latest production build reproduces `EPERM` while statting `C:\Users\user\.git`, a host/repository boundary outside the project workspace.

Real hardware verification is a separate gate. The ESP32 identity, credential, message IDs, clock behavior, retries, source labeling, fields, units, and ranges must be checked using [`docs/hardware-verification-checklist.md`](docs/hardware-verification-checklist.md). Feed weight, feed/water levels, temperature, and humidity require the controlled calibration procedure in [`docs/sensor-calibration-plan.md`](docs/sensor-calibration-plan.md) before thresholds or forecasts are treated as operational.

Phase 9 is currently preparation-only. [`docs/phase9-veterinary-services-platform.md`](docs/phase9-veterinary-services-platform.md) preserves Farmer ownership, explicit consent, marketplace separation, and multi-role authorization while deferring provider verification, clinical decisions, prescriptions, emergency handling, payments, retention, and jurisdictional compliance until domain/legal contracts are approved and the Verification Sprint gates are complete.

## Phase 4 historical analytics

`GET /api/analytics` and `/analytics` require a signed-in Farmer. Queries scope farm/device choices through `Farm.ownerId`, then read one selected device's immutable history by `observedAt` (start-inclusive/end-exclusive). The strict API supports 24-hour, 7-day, 30-day, and custom offset-aware ranges capped at 30 days. Buckets are hourly, six-hourly, or daily according to range. Responses are `no-store`; each selected-device query is capped at 20,000 readings and returns HTTP 422 instead of silently truncating.

`backend/src/modules/analytics/aggregation.ts` is a pure reducer: it calculates environmental mean/min/max and sample counts, measured feed-weight decreases, and distinct feed/water level percentage-point drops. It compares adjacent in-range readings only, assigns a decrease to the later reading's bucket, treats increases as reset/refill intervals, and leaves missing buckets null. Feed-weight changes are not verified animal intake; water-level percentages are not litres. A single device and its registered hardware/simulator source are shown at a time. `/analytics` uses Recharts and exports the aggregated bucket table as CSV. See [`docs/phase4-historical-analytics.md`](docs/phase4-historical-analytics.md) for the request contract, bucket semantics, units, edge cases, and verification boundaries.

## Phase 5 intelligence foundations

`GET /api/intelligence` and `/intelligence` require the Farmer role. The API reuses Phase 4's owner-scoped choices and UTC range resolver for a selected device over 7 or 30 days. Reads are bounded at 20,000 records and do not write telemetry or state.

`directional-depletion-v1` splits observations at missing/invalid values, source changes, and possible refill/reset increases. It uses only the latest segment, includes stable intervals as zero, and takes a median per-interval percentage-point rate. At least four observations, three declines, and 24 hours of coverage are required. The 0% crossing is directional and `NOT_CALIBRATED`; feed-weight grams remain separate observed changes, not confirmed intake. See [`docs/phase5-intelligence-foundations.md`](docs/phase5-intelligence-foundations.md) for formulas and status meanings.

The risk view lists persisted Phase 3 alerts. The scoring functions require an explicitly supplied versioned policy; no production risk or farm-performance score is configured, so composite scores remain null. Evidence-linked trend prompts are on-demand, marked `persisted: false`, and do not change the existing recommendation schema or lifecycle. No role modules, migration, notification, or actuator command is added.

## Phase 6 Digital Twin prototype

`/digital-twin` is a Farmer-only page. It fetches the selected 7-day or 30-day observation/intelligence and analytics summaries from their existing owner-scoped APIs; it does not introduce a separate scenario API. `buildDigitalTwinBaseline` requires matching farm, device, and range selections. A mismatch yields an empty `INPUT_MISMATCH` baseline rather than combining unrelated data. Phase 5 now includes the latest in-range reading's timestamp, source, and nullable sensor values; Phase 4 provides coverage counts, environmental aggregates, and separate resource interval totals.

`simulateDigitalTwin` is a pure deterministic calculation for one scenario at a time. Horizons are bounded to 1–30 days; explicit resource levels/rates and environmental horizon values are validated. A blank feed/water start uses the latest observation; a blank rate uses only an eligible Phase 5 directional estimate. Missing inputs remain unavailable rather than becoming zero. Simulated levels use `clamp(start - rate × days, 0, 100)` in percentage units. Unset climate values are held at the observed baseline; feed-weight grams are not simulated. Deltas are exposed only when observed and simulated values both exist.

The baseline and scenario risk projections reuse Phase 3 pure prototype rules for feed/water low level and high temperature. Missing risk inputs are `UNAVAILABLE`. Baseline/scenario comparisons are derived display data; they cannot create, resolve, acknowledge, or persist alerts or recommendations. The current temperature/level thresholds are not calibrated or species-specific, and humidity has no risk rule. Scenario state exists only in the browser; no database model, migration, telemetry/state write, notification, or actuator effect is added. See [`docs/phase6-digital-twin.md`](docs/phase6-digital-twin.md) for the route inputs, formulas, user-facing semantics, and test limits.

## Phase 7 Agronomist advisory platform contracts

Phase 7 preserves the existing ownership model: every farm has one Farmer owner, and Farmer access remains limited to owned farms. `UserRole` is still a multi-role assignment table. `AGRONOMIST` is a trusted server-side role assignment, not a user-selectable capability; a user having the role does not reveal any farm.

Consent is farm-specific and explicit. `FarmAdvisorAccess` identifies one Agronomist and one farm, while its event rows record request, approval, decline, and revocation. An Agronomist may request access to a different farm, but only the Farmer owner may approve, decline, or revoke. Every advisor farm read or write requires both the Agronomist role and `status = ACTIVE` for that exact farm. `PENDING`, `DECLINED`, and `REVOKED` access never authorizes observations. Revocation is checked on each request and leaves historical notes/events intact. Marketplace users and other roles receive no automatic farm access. Dual-role users obey the same owner-versus-consent boundary for each operation.

The five workflow contracts are documented in [`docs/phase7-agronomist-advisory-platform.md`](docs/phase7-agronomist-advisory-platform.md): Agronomist access request, Farmer approval/decline, owner-only revocation, advisory-note creation with server-verified evidence, and recommendation review separated from Phase 3 recommendation lifecycle. Advisory notes retain author, farm, server capture time, and immutable reading/recommendation evidence snapshots with source, event time, fields, units, and rule version. Review transitions are `PENDING → APPROVED | CHANGES_REQUESTED | NOT_RECOMMENDED`, followed by the Farmer's `ACCEPTED_BY_FARMER | DECLINED_BY_FARMER` decision. No review action acknowledges, resolves, changes, or executes a recommendation.

Private Phase 7 responses are `no-store`, and authorization is enforced in service/database predicates rather than only in UI visibility. The additive offline Prisma model draft, pure policy/services, and the first Route Handler slice are now present for access, farm review, notes, and recommendation reviews. The dashboard remains pending. No PostgreSQL connection, migration application, or database recreation is part of this phase preparation or implementation.

## Migrations and verification

The alert migration adds alert enums, `Alert`, and `AlertEvent`. A separate recommendation migration adds recommendation enums, `Recommendation`, indexes, and foreign keys. Both are generated offline; the recommendation draft depends on Phase 1 accounts, Phase 2 devices, and the Phase 3 alert migration. Phase 7–8 require later additive migrations after their SQL is reviewed. No SQL or data has been applied by this workstream. PostgreSQL remains selected; managed MySQL remains disabled. The user confirms `farmvision_dev` already exists and connectivity was manually confirmed through `psql`; never recreate it. The required order is Phase 1, Phase 2, Phase 3 alerts, Phase 3 recommendations, then reviewed Phase 7–8 additions.

Prisma generation, TypeScript, ESLint, and unit tests pass offline. These checks do not verify live database transactions/ownership, migrations, browser rendering, firmware compatibility/calibration, forecast accuracy, notifications, or actuators. The existing `farmvision_dev` is not recreated and all migration drafts remain unapplied. The latest production-build attempt fails before compilation with host `EPERM` on `C:\Users\user\.git`; the application is not claimed production-built until that host issue is resolved.

## Delivery sequence

1. Foundation: complete.
2. **Infrastructure verification: migrations, `farmvision_dev` persistence/isolation, build recovery, ESP32 telemetry, and sensor calibration.**
3. Accounts/farms: code complete; live OAuth/database verification follows infrastructure readiness.
4. Device management and telemetry: code complete; real ESP32 and firmware-contract verification pending.
5. Alerts/recommendations: code and unit tests present; ordered migrations and persisted lifecycle verification pending.
6. Historical analytics, intelligence, and Digital Twin: code complete; persisted and calibrated observation verification pending.
7. Agronomist advisory platform: contracts and backend code present; live authorization verification pending.
8. Entrepreneur marketplace foundation: contracts and catalog APIs present; live persistence pending and commerce explicitly secondary.
9. Verification Sprint: deploy/reconcile migrations, verify persistence/isolation, resolve build host issue, verify ESP32 telemetry, and complete sensor calibration.
10. Veterinary Services Platform: preparation only until verification, domain, legal, and clinical contracts are approved.
11. Farmer monitoring, polling refresh, and stale-device reporting.
12. Validated consumption/refill planning only after calibrated hardware semantics and sufficient history exist.
13. Live cross-account, failure-mode, hardware-contract, and end-to-end competition demonstration tests.

A code milestone is not an operational integration claim until external/database dependencies have been exercised.
