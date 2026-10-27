# Phase 2 implementation design note

## Scope

This phase adds farmer-owned device registration/association, one-time device credential provisioning and revocation, a device-authenticated REST telemetry endpoint, immutable timestamped readings, and a separate latest-state projection. MQTT is not implemented because broker/network and firmware details are not confirmed.

## Proposed API contract (requires hardware teammate review)

- Register a device through the authenticated Farmer app. The server generates a public id (`fv_…`) and a 256-bit bearer token; it returns the token once and persists only a SHA-256 hash. The farmer associates the device with one of their farms and chooses `HARDWARE` or `SIMULATOR` at registration.
- POST telemetry to `/api/telemetry` with `Authorization: Bearer <token>` over HTTPS. The JSON body includes `schemaVersion: 1`, `deviceId`, unique-per-device `messageId`, ISO-8601 `timestamp` with timezone, and one or more of `temperatureC`, `humidityPercent`, `feedLevelPercent`, `waterLevelPercent`, or `feedWeightGrams`.
- The registered device, rather than an untrusted body property, determines source (`HARDWARE` or `SIMULATOR`). Unknown payload keys are rejected; no commands/actuator fields are accepted.
- `messageId` plus device id provides retry de-duplication. The HTTP API acknowledges an identical repeated id with the existing reading and does not create another row. The database enforces the uniqueness.
- `observedAt` is device event time; `receivedAt` is set by PostgreSQL at ingestion. Readings are append-only. `DeviceState` only advances for an event whose timestamp is not older than its current projection.
- The prototype currently uses basic input bounds: temperature -40..85 °C, humidity/levels 0..100%, feed weight 0..5,000,000 g, and timestamp no more than five minutes ahead of server time. These are engineering guardrails, not certified sensor limits or agricultural thresholds; hardware calibration, sensor models, and allowed delayed/offline message age must be agreed before production use.

## Security boundary and current blockers

All management queries scope device/farm ownership through the signed-in owner's database id. Device token is shown only once; storing it is the user's responsibility. Revoking a device disables its token. A database connection is unavailable at `127.0.0.1:5432` at implementation time, so schema/client/migration/test checks are offline; no migration is applied and no end-to-end database test is claimed.

The hardware contract still needs message-id generation, public-id and token configuration, sensor units/calibration/ranges, time synchronization/clock drift, offline retry policy, and transport choice. Prefer MQTT after those are agreed; until then REST provides a small testable ingestion boundary.
