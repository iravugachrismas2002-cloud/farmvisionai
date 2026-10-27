# FarmVision AI — Migration Deployment Plan

**Date:** 2026-10-20  
**Target database:** existing `farmvision_dev` (do NOT recreate, reset, drop, or modify data outside migrations)  
**Tooling:** Prisma 7.10.1 (`prisma migrate deploy`, `prisma migrate status`)  
**Gate:** Deployment runs ONLY after `.env` is created locally with a valid `DATABASE_URL` and `prisma migrate status` confirms connectivity without applying changes.

## 1. Prerequisites (must all hold)

| # | Requirement |
|---|-------------|
| P1 | `.env` exists at project root with real `DATABASE_URL` (never committed; never pasted into chat) |
| P2 | `DATABASE_URL` targets `127.0.0.1:5432` database `farmvision_dev`, schema `public` |
| P3 | PostgreSQL service `postgresql-x64-18` is Running |
| P4 | TCP connectivity to `127.0.0.1:5432` confirmed (this report, Step 5) |
| P5 | Migration drafts reviewed: additive only, no `DROP`/`TRUNCATE`/`DELETE FROM`/`ALTER TABLE ... DROP` |
| P6 | A backup/restore plan for `farmvision_dev` is confirmed by the database owner before deployment |

## 2. Ordered migrations (apply in this exact order)

| Order | Migration directory | Phase |
|-------|--------------------|-------|
| 1 | `backend/prisma/migrations/20261019224600_phase1_accounts_farms` | Phase 1: accounts, roles, farms |
| 2 | `backend/prisma/migrations/20261020105600_devices_telemetry` | Phase 2: devices, telemetry history, device state |
| 3 | `backend/prisma/migrations/20261020112600_alert_history` | Phase 3: alerts |
| 4 | `backend/prisma/migrations/20261020115000_recommendations` | Phase 3: recommendations |
| 5 | `backend/prisma/migrations/20261020160000_phase7_advisory` | Phase 7: agronomist advisory (additive; adds `AGRONOMIST` to role enum) |
| 6 | `backend/prisma/migrations/20261020161000_phase8_marketplace` | Phase 8: entrepreneur marketplace (additive; adds `ENTREPRENEUR` to role enum) |

Review finding: all drafts are additive and preserve foreign-key ordering. Phase 7 and Phase 8 extend the Phase 1 role enum intentionally; they must be deployed after Phase 1 in the order above.

## 3. Deployment commands (run locally after prerequisites)

```powershell
# 1. Confirm connectivity without making changes
npx prisma migrate status

# 2. Deploy all pending migrations in order
npx prisma migrate deploy

# 3. Re-confirm status (should report no pending migrations)
npx prisma migrate status
```

`prisma migrate deploy` applies migrations in filesystem order and records them in the `_prisma_migrations` table. It does not recreate `farmvision_dev` and does not drop data.

## 4. Rollback / abort criteria

- Abort if `prisma migrate status` fails with P1001 or any authentication error → fix `.env` first; do not force deployment.
- Abort if any migration SQL contains destructive statements (none found in review; re-verify before running).
- If a migration fails mid-deployment, `prisma migrate deploy` stops at the failing migration. Do not manually edit `_prisma_migrations` or skip migrations. Resolve the SQL, then re-run.
- Restore from the pre-deployment backup only if the database owner directs it.

## 5. Post-deployment verification

Hand off to the Database Persistence Verification Plan (`docs/database-persistence-verification-plan.md`): confirm tables, ownership, and isolation in `farmvision_dev`.

## 6. What is explicitly NOT authorized

- Recreating `farmvision_dev`
- Generating a new database
- Dropping tables or resetting data
- Running `prisma migrate reset`, `prisma db push` without review, or any `DROP`/`TRUNCATE`/`DELETE` SQL
- Applying migrations out of order
