# FarmVision AI — Project TODO

## [x] Foundation: approved Next.js architecture and scaffold
- [x] Create a Next.js App Router foundation with TypeScript while preserving `PROJECT_CONTEXT.md`.
- [x] Separate pages/APIs, shared UI, domain modules, server-only auth/database services, Prisma schema/migrations, and tests.
- [x] Keep PostgreSQL/Prisma selected and managed MySQL disabled.
- [x] Document authorization, telemetry safety, explainable intelligence, and labelled simulation boundaries.

## [~] Priority workstream: infrastructure and competition readiness
- [x] Review the complete ordered migration set against the existing `farmvision_dev` target; six ordered additive drafts are documented in `docs/verification-sprint.md`.
- [x] Confirm `farmvision_dev` exists and successful authentication/direct `psql` access outside the Manus execution environment.
- [x] Record that Database Connectivity From Manus Environment is `No`; this is an environment-access limitation, not evidence that the database is missing.
- [ ] Apply Phase 1, Phase 2, Phase 3 alerts, Phase 3 recommendations, and later additive Phase 7–8 migrations only after the target and rollback/backup plan are confirmed; never recreate the database.
- [ ] Verify persisted farms, devices, telemetry history/latest state, alerts, recommendations, advisory workflows, and marketplace records in `farmvision_dev` from a process with local PostgreSQL access.
- [ ] Verify multi-account ownership, consent, revocation, and marketplace/farm isolation with PostgreSQL-backed tests.
- [x] Reproduce the production build `EPERM` failure involving `C:\Users\user\.git`; resolution remains blocked at the host/repository boundary.
- [ ] Verify the ESP32 telemetry contract with real hardware: device identity, token provisioning, message IDs, timestamps/clocks, fields, units, ranges, retries, and source labeling.
- [ ] Perform sensor calibration validation for feed weight, feed/water levels, temperature, and humidity before treating thresholds or forecasts as operational.
- [ ] Keep marketplace expansion, commerce, messaging, reviews, inventory synchronization, supplier verification, and advanced veterinary workflows secondary and non-blocking for competition readiness.
- [x] Create the FarmVision Feeder hardware-verification checklist in `docs/hardware-verification-checklist.md`.
- [x] Create the sensor-calibration plan in `docs/sensor-calibration-plan.md`.
- [x] Track Code Complete, Database Verified, and Hardware Verified separately in `docs/verification-sprint.md`.

## [~] Phase 1: account and farm persistence (code ready; live database verification pending)
- [x] Add account identity, multi-role assignment, and owner-linked farm models.
- [x] Use Manus `openId` as immutable identity and assign the initial Farmer role server-side.
- [x] Add OAuth, expiring session, same-origin checks, farm APIs, input validation, and farmer UI.
- [x] Generate Prisma Client and an additive Phase 1 migration draft offline.
- [x] Manually confirm connectivity to the existing dedicated `farmvision_dev` PostgreSQL database through `psql`; do not recreate it.
- [ ] Keep credentials out of chat and rotate any credential previously pasted in chat by replacing it locally.
- [ ] Review/apply the Phase 1 migration only after target-database confirmation.
- [ ] Verify real sign-in, persistence, and cross-account farm isolation.

## [~] Phase 2: device management and telemetry (code ready; database/firmware verification pending)
- [x] Add device, immutable telemetry-history, and separate latest-state models plus an offline migration draft.
- [x] Add owner-scoped device registration/list/revocation; generate a one-time token and store only its hash.
- [x] Add bounded, versioned REST telemetry with registered-device authentication, validation, duplicate protection, and server receipt time.
- [x] Keep simulator/hardware source labels and event history separate from latest state.
- [ ] Confirm device/token provisioning, message IDs, fields/units/ranges, clocks, and retries with hardware.
- [ ] Review/apply Phase 2 migration after Phase 1 and database-target confirmation.
- [ ] Verify device ownership, token revocation, telemetry writes, de-duplication, and state ordering with PostgreSQL.
- Deferred: MQTT until the hardware/network/broker contract is approved.

## [~] Phase 3: alerts and recommendation framework (code ready; database/domain verification pending)
- [x] Add deterministic, configurable prototype feed-low, water-low, and high-temperature rules with severity and evidence.
- [x] Evaluate only present measurements from state-advancing, validated Phase 2 telemetry.
- [x] Persist one current alert per device/rule and append trigger, escalation, acknowledgement, and recovery events.
- [x] Generate one typed recommendation per active alert with reason, suggested action, observed value/threshold/unit, device event time, registered source, rule version, and server timestamps.
- [x] Synchronize recommendation lifecycle with its alert in the same transaction; reuse the alert event trail rather than creating a divergent duplicate history.
- [x] Add Farmer-only owner-scoped alert and recommendation GET APIs, alert acknowledgement, alert center, and recommendation dashboard.
- [x] Add no-provider SMS/email/push ports and human-approval automation proposals marked `NOT_EXECUTED`; no actuator command path exists.
- [x] Add rule-boundary/lifecycle/recommendation/evidence/automation/notification tests and document the API contracts.
- [ ] Review the illustrative thresholds and suggested actions with agricultural domain reviewers and sensor calibration evidence.
- [ ] Verify connectivity to the existing `farmvision_dev` database and review both Phase 3 migration drafts after Phase 1/2; do not recreate the database.
- [ ] Apply migrations in order: Phase 1, Phase 2, Phase 3 alerts, Phase 3 recommendations; do not apply until the target is confirmed.
- [ ] Verify persisted alert/recommendation create, escalation, acknowledgement, recovery, and owner isolation with PostgreSQL.
- Deferred: calibrated refill-date estimates (Phase 5 provides only an uncalibrated directional 0% crossing); actual notifications, actuator execution, command APIs, MQTT, and safety interlocks.

## [~] Phase 4: Historical Analytics (code complete; live database/hardware verification pending)
- [x] Query historical telemetry only for a Farmer's authorized farm and selected device; filter on `observedAt` and use UTC internally.
- [x] Support 24-hour, 7-day, 30-day, and custom ranges; validate timezone offsets/order, reject future ends, and cap custom ranges at 30 days.
- [x] Report pairwise observed feed-weight decreases in grams without claiming verified animal intake; keep feed-level percentage-point proxies separate.
- [x] Report water-level decreases as percentage-point proxies only; do not invent litres without a calibrated volume mapping.
- [x] Provide temperature °C, humidity %, feed level %, and water level % trends with labelled units, time buckets, source, and coverage.
- [x] Handle sparse/partial readings and refills/resets transparently; do not interpret missing samples or increasing levels as consumption.
- [x] Add Farmer-only, owner-scoped, no-store analytics API and authenticated dashboard with range/farm/device selectors, charts, and CSV report.
- [x] Add deterministic range/aggregation unit tests and document semantics/limits.
- [ ] Verify API ownership and analytics queries against PostgreSQL after Phase 1/2 migrations are reviewed/applied to the existing `farmvision_dev`; Phase 4 adds no migration.
- [ ] Verify observations and units against hardware/firmware after its contract is approved; distinguish simulator data.

## [~] Phase 5: Intelligence Foundations (code, tests, and docs complete; database, hardware, and domain-policy verification pending)
- [x] Implement deterministic Feed and Water Intelligence Engines over the existing historical telemetry contract; keep feed-weight grams distinct from feed-level and water-level percentage points.
- [x] Estimate a directional 0% crossing only with sufficient history; return explicit insufficient-data, no-decline, no-sustained-decline, reset-affected, and at-zero states otherwise.
- [x] Forecast resource trends from Phase 4 history, preserving event-time ordering, source labels, UTC timestamps, missing samples, evidence counts, and measurement units.
- [x] Establish versioned, configurable farm-performance scoring foundations; expose no production composite score until dimensions, weights, and domain thresholds are approved.
- [x] Expand on-demand review-prompt evidence with observations, calculation window, units, source, sample/interval/reset counts, formula version, uncalibrated confidence, limitations, and as-of time; keep prompts unpersisted and migration-free.
- [x] Add explainable risk-signal and policy-scoring foundations; the runtime remains unrated without a reviewed policy and preserves signal provenance.
- [x] Integrate with Phase 4 ranges/owner choices and provide a Farmer-only, owner-scoped API and farmer-facing view; add no unrelated role modules or direct actuator control.
- [x] Add unit tests for feed/water trends, forecast sufficiency, sparse/out-of-order data, refills/resets, source changes, evidence provenance, policy scoring, and unrated defaults (71 tests across 14 suites pass).
- [x] Document formulas, evidence, units, availability/confidence states, prototype limitations, API behavior, and the observation/forecast/recommendation boundary.
- [ ] When database integration resumes, verify connectivity to the existing `farmvision_dev` and review Phase 1–3 migration order/SQL; never recreate the database or apply migrations until the target is confirmed.
- [ ] Verify field meaning, calibration, clocks, and forecast behavior against the approved hardware/firmware contract; until then label hardware observations and directional forecasts as unverified.

## Later farmer monitoring
- [ ] Add polling refresh and stale-device reporting after a hardware reporting interval is agreed.

## [~] Phase 6: Digital Twin Prototype (code, tests, and docs complete; live database/hardware verification pending)
- [x] Define a farm-state baseline from existing analytics and intelligence results, retaining source, event time, units, and missing values.
- [x] Simulate feed availability from explicit scenario assumptions or eligible directional trends; keep feed-level percentages separate from feed-weight grams and clamp only simulated levels to 0–100%.
- [x] Simulate water availability from explicit assumptions or eligible directional trends; retain percentage-point units and do not convert to litres without calibration.
- [x] Simulate environmental horizon conditions and project explainable prototype risks without presenting them as observed conditions or validated veterinary/agronomic guidance.
- [x] Add deterministic baseline-versus-one-scenario comparison, repeatable from the same baseline, reporting assumptions, horizon, deltas, and projected risk signals.
- [x] Display baseline and simulated state side-by-side; label every scenario input, output, and projected risk as simulated while observed values retain source and event time.
- [x] Add the Farmer-only Digital Twin dashboard using existing owner-scoped analytics/intelligence APIs; keep scenarios ephemeral and prevent writes to telemetry, device state, alerts, or persisted recommendations.
- [x] Preserve clear module boundaries for future climate, agronomist, and veterinary policies without implementing those role-specific modules.
- [x] Add deterministic tests for state mapping, mismatch isolation, missing baselines, bounds, scenarios, comparisons, risks, units, and simulation/observation separation (8 new; 79 total across 15 suites pass).
- [x] Document the baseline contract, formulas, risk rules, limits, API/UI behavior, and verification boundaries.
- [ ] When database integration resumes, use the existing `farmvision_dev` only; do not recreate it or apply migrations unless an explicitly required change is reviewed and the existing target is verified.
- [ ] Verify scenario inputs and baseline observations against the approved hardware/firmware contract when available; simulation outputs are never evidence of hardware behavior.

## [ ] Phase 7: Agronomist Advisory Platform
- [x] Finalize the consent model, access-sharing rules, role responsibilities, authorization boundaries, and verification limits in `docs/phase7-agronomist-advisory-platform.md` before further schema work.
- [x] Preserve `UserRole` as a multi-role assignment model; keep `AGRONOMIST` server-assigned and do not let users self-assign it or activate future role modules.
- [x] Require both the Agronomist role and a farm-specific Farmer-approved active access grant for every Agronomist farm read or write; a role alone never reveals farm data.
- [x] Define the request, Farmer approval/decline, and owner-only revocation workflows with append-only access events and no observations for pending requests.
- [x] Define the advisory-note contract with server-verified same-farm telemetry/recommendation evidence and immutable provenance snapshots.
- [x] Define recommendation review transitions separately from Phase 3 alert/recommendation lifecycle; review actions never execute actuators or silently change recommendation status.
- [~] Implement the Phase 7 Route Handlers and dashboard around currently authorized farms only; the no-store Route Handler slice is complete, while the dashboard remains.
- [x] Add unit tests for role requirements, access-request state transitions, owner/assignee isolation, evidence validation, and recommendation review decisions.
- [x] Update `ARCHITECTURE.md`, `TODO.md`, and the Phase 7 contract document with role assignment, consent, data/evidence contracts, workflow transitions, and verification limits.
- [x] Add only additive Phase 7 schema and an unapplied migration draft; do not apply migrations or recreate the existing `farmvision_dev` database.
- [ ] Verify live PostgreSQL access, migrations, multi-account isolation, and persisted workflows only after the existing `farmvision_dev` target is confirmed; keep hardware behavior explicitly unverified.

## Security and demonstrability
- [ ] Run PostgreSQL-backed authorization tests with multiple accounts once the database is reachable.
- [ ] Add Playwright flows for sign-in, farms, devices, alerts, recommendations, analytics, intelligence, and failure states when an integration DB is available.
- [ ] Add Playwright flows for the simulation-only Digital Twin and its missing-baseline/owner-denied states when an integration DB is available.
- [ ] Report verification boundaries clearly; hardware, MQTT, notification delivery, and actuators are not claimed as operational.
- [ ] Resolve the Next.js production-build host `EPERM` involving `C:\Users\user\.git`; project-local Turbopack-root and Webpack fallback attempts did not resolve it.

## [~] Phase 8: Entrepreneur Marketplace Foundation
- [x] Define server-assigned `ENTREPRENEUR` role activation while preserving multi-role assignment and farm/advisory separation.
- [x] Define supplier profile ownership, catalog categories, product lifecycle, and marketplace authorization boundaries in `docs/phase8-entrepreneur-marketplace-foundation.md`.
- [x] Add additive supplier profile and marketplace product models; keep the migration draft unapplied.
- [x] Implement feed, veterinary medicine, seeds, fertilizer, and equipment catalog contracts.
- [x] Implement supplier profile and product management APIs with owner-scoped writes.
- [x] Implement published catalog reads without any farm-data joins or automatic farm access.
- [x] Add unit tests for role requirements, supplier ownership, category validation, lifecycle transitions, and multi-role isolation.
- [x] Update architecture and roadmap documentation with the marketplace boundaries and verification limits.
- [ ] Verify live PostgreSQL persistence and migration compatibility against the existing `farmvision_dev`; never recreate the database.
- [ ] Defer checkout, payments, orders, fulfillment, reviews, messaging, inventory synchronization, and regulated veterinary workflows until separately contracted.

## [~] Phase 9: Veterinary Services Platform preparation
- [x] Define the initial veterinary-services boundary without inventing clinical, legal, provider-verification, prescription, payment, or emergency workflows.
- [x] Preserve Farmer ownership, explicit consent, marketplace separation, and multi-role authorization boundaries.
- [x] Require the Verification Sprint to complete before Phase 9 models, migrations, or clinical services are treated as operational.
- [ ] Finalize provider, service, consent, appointment/consultation, evidence, retention, and compliance contracts with domain/legal review.
- [ ] Implement only the smallest approved non-clinical service foundation after the contracts and infrastructure gates are complete.
