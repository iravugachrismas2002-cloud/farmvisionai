# FarmVision AI — Database Persistence Verification Plan

**Date:** 2026-10-20  
**Target database:** existing `farmvision_dev`  
**Gate:** Run only after the Migration Deployment Plan has completed and `prisma migrate status` reports no pending migrations.  
**Constraint:** Read and write verification only; do NOT drop tables, truncate, or reset existing data. Test writes should use clearly identifiable test fixtures and be removable by the owner if desired.

## 1. Objectives

Prove that the FarmVision AI platform persists and reads data end-to-end through PostgreSQL with Prisma, and that multi-account farm/device isolation is enforced at the database/query layer.

## 2. Preconditions

| # | Item |
|---|------|
| C1 | `.env` configured locally with valid `DATABASE_URL` → `farmvision_dev` |
| C2 | All six migrations deployed; `prisma migrate status` clean |
| C3 | Prisma Client generated (`prisma generate`) |
| C4 | Application build passes (`npm run build` — verified after `turbopack.root` fix) |

## 3. Verification scenarios

### 3.1 Schema / catalog
- Connect via `psql` (full path) or Prisma and list tables in `farmvision_dev` public schema.
- Confirm expected tables exist: users, user_roles, farms, devices, sensor_readings, device_states, alerts, alert_events, recommendations, recommendation_reviews, recommendation_review_events, advisory notes/accesses, supplier_profiles, marketplace_products (matching deployed migrations).
- Confirm `_prisma_migrations` contains entries for all six migrations in order.

### 3.2 Accounts and farms (Phase 1)
- Create a test farm linked to a test user; read it back by ID and by owner.
- Assign multiple roles to one user; verify `user_roles` rows and the composite key `(userId, role)`.
- Confirm a second user cannot query the first user's farms through the application's owner-scoped service predicates.

### 3.3 Devices and telemetry (Phase 2)
- Register a device to a farm; verify the device credential hash is stored (plaintext never persisted).
- Insert a telemetry reading; confirm it lands in `sensor_readings` with event time, receipt time, deviceId, messageId.
- Send a duplicate `(deviceId, messageId)`; confirm de-duplication (no second history row).
- Confirm `device_state` latest projection advances only for a newer event time; an older reading stays in history but does not backdate state.

### 3.4 Alerts and recommendations (Phase 3)
- Submit readings crossing feed/water/temperature thresholds; confirm alert rows and linked recommendation rows are created in the same transaction.
- Acknowledge an alert; confirm `alert_events` and recommendation state transitions are recorded.
- Verify alert/recommendation rows carry farm ownership and are not readable across accounts.

### 3.5 Advisory and marketplace (Phases 7–8)
- Confirm advisory access requests, reviews, notes, supplier profiles, and marketplace products persist with owner-scoped writes.
- Confirm published catalog reads do not join or expose private farm data.

### 3.6 Multi-account isolation (security)
- With two accounts, verify account A cannot read/write account B's farms, devices, readings, alerts, recommendations, or advisory data via any API path.
- Verify role enforcement (e.g., non-owner roles cannot perform owner-scoped writes).

## 4. Evidence to capture

For each scenario: SQL or Prisma call used, input fixture, row count before/after, timestamps, and PASS/FAIL. Store screenshots/logs in the verification session record. Do not paste credentials into any document or chat.

## 5. Exit criteria

- All schema objects confirmed present.
- Write → read round-trip succeeds for farms, devices, telemetry, alerts, recommendations.
- De-duplication and latest-state ordering behave per schema design.
- Cross-account isolation holds for every object type.
- `prisma migrate status` remains clean after verification.

## 6. If a scenario fails

Stop, record the error (including any Prisma P-code), and do not proceed to Phase 9 work until the failure is resolved and re-verified. No destructive cleanup of `farmvision_dev` without database-owner approval.
