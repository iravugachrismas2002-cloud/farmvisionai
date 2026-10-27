# FarmVision AI — Infrastructure Verification Checklist

**Date:** 2026-10-20  
**Target database:** existing `farmvision_dev` (do NOT recreate, reset, or drop)  
**Status key:** `PASS` = verified with evidence · `FAIL` = blocked · `NOT RUN` = requires local credential handoff

> Nothing on this checklist modifies `farmvision_dev`. Migration application and persistence writes are gated behind separate plans.

## A. PostgreSQL server and network

| # | Check | Status | Evidence / notes |
|---|-------|--------|------------------|
| A1 | PostgreSQL 18 installed | PASS | `C:\Program Files\PostgreSQL\18\bin\psql.exe` + server binaries present |
| A2 | Service `postgresql-x64-18` Running | PASS | `Get-Service` → Running |
| A3 | postgres processes running | PASS | 12 postgres processes observed |
| A4 | Listening on port 5432 | PASS | `netstat`: LISTENING on 127.0.0.1:5432 and [::1]:5432 (PID 8804) |
| A5 | `listen_addresses = 'localhost'` | PASS | `postgresql.conf` confirmed |
| A6 | Bound to 127.0.0.1 (IPv4 loopback) | PASS | `netstat` LISTENING entry |
| A7 | Bound to ::1 (IPv6 loopback) | PASS | `netstat` LISTENING entry |
| A8 | NOT bound to 0.0.0.0 / network | PASS | `listen_addresses = 'localhost'`; no external interface listener |
| A9 | TCP reachable from this environment | PASS | Node `pg` Client connect succeeded on 127.0.0.1, localhost, ::1 |
| A10 | Authentication mechanism | PASS | `pg_hba.conf`: scram-sha-256 for local/127.0.0.1/::1; auth works with correct password |
| A11 | `psql` client available | PASS | `C:\Program Files\PostgreSQL\18\bin\psql.exe` (not on PATH; use full path) |

## B. Application configuration

| # | Check | Status | Evidence / notes |
|---|-------|--------|------------------|
| B1 | `.env` exists locally | **FAIL** | Missing; only `.env.example` with placeholders |
| B2 | `DATABASE_URL` set | **FAIL** | `process.env.DATABASE_URL` undefined → Prisma datasource URL is `""` |
| B3 | `DATABASE_URL` syntax correct | NOT RUN | Template: `postgresql://USERNAME:PASSWORD@localhost:5432/DATABASE_NAME?schema=public`; developer supplies real values locally |
| B4 | Prisma client generation works | PASS | `npx prisma generate` → `./src/generated/prisma` (offline) |
| B5 | Prisma P1001 reproduced | PASS (root cause known) | P1001 occurs with empty/missing `DATABASE_URL`; network is not the cause |

## C. Build

| # | Check | Status | Evidence / notes |
|---|-------|--------|------------------|
| C1 | `prisma generate` succeeds | PASS | 478 ms |
| C2 | `next build` compiles | PASS | Compiled successfully; TypeScript finished |
| C3 | Static pages generate | PASS | 24/24 pages, all routes listed |
| C4 | `.next/` artifacts present | PASS | `BUILD_ID`, `build-manifest.json`, `server/`, `static/`, etc. |
| C5 | EPERM on `C:\Users\user\.git` | RESOLVED | `turbopack.root` added to `next.config.ts`; build completes repeatedly |

## D. Tests

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| D1 | Unit test suite | PASS | `npm test` → 19 files, 94 tests, all passing (offline; no DB connection) |

## E. Database (gated on local credentials)

| # | Check | Status | Evidence / notes |
|---|-------|--------|------------------|
| E1 | `farmvision_dev` catalog visible | NOT RUN | Requires `DATABASE_URL` with real password; user confirmed prior psql access from developer machine |
| E2 | Migrations applied status known | NOT RUN | `prisma migrate status` after `.env` is created |
| E3 | Tables present (users, farms, devices, ...) | NOT RUN | After migration deployment |
| E4 | Cross-account isolation enforced | NOT RUN | PostgreSQL-backed tests after DB reachable |

## F. Hardware (ESP32 Feeder)

| # | Check | Status | Evidence / notes |
|---|-------|--------|------------------|
| F1 | Hardware verification checklist created | PASS | `docs/hardware-verification-checklist.md` exists |
| F2 | Real-device telemetry end-to-end | NOT RUN | Requires physical ESP32 + firmware contract |
| F3 | Sensor calibration complete | NOT RUN | `docs/sensor-calibration-plan.md` exists; calibration report pending |

---

## Sign-off

- Infrastructure diagnostic report: `docs/infrastructure-diagnostic-report.md` — complete
- Migration deployment plan: `docs/migration-deployment-plan.md` — ready
- Database persistence verification plan: `docs/database-persistence-verification-plan.md` — ready
- Build verified: YES (after `turbopack.root` fix)
- Database verified: NO — pending local `DATABASE_URL` credential handoff and `prisma migrate status`
- Hardware verified: NO — pending real ESP32 sessions
