# Phase 3 — Alerts and recommendation framework

## Flow and boundaries

Validated telemetry enters through the existing Phase 2 REST contract. After the per-device transaction writes history and advances latest state, deterministic alert rules evaluate only measurements present in that accepted message. The same transaction synchronizes the alert and its recommendation. If the transaction fails, neither partial alert nor partial recommendation is committed. Events older than the latest projection remain in history but do not rewrite current alert/recommendation state.

The alert and recommendation rule modules are pure TypeScript. They have no database, external service, notification, or actuator side effects. They are deterministic rules—not machine learning, predictions, or universal agricultural advice.

## Prototype thresholds

The current configurable defaults are illustrative and need review against the relevant species, sensors, calibration, and local operating procedures:

| Rule | Warning | Critical | Condition |
| --- | ---: | ---: | --- |
| Feed low | `feedLevelPercent <= 20%` | `<= 10%` | Lower is more severe |
| Water low | `waterLevelPercent <= 20%` | `<= 10%` | Lower is more severe |
| High temperature | `temperatureC >= 32 °C` | `>= 35 °C` | Higher is more severe |

Boundaries are inclusive. 32 °C creates a prototype warning, matching the brief's example. Humidity is accepted by Phase 2 telemetry but currently does not alter the temperature rule. Only a present sensor measurement participates in an evaluation; omission does not mean zero and does not clear an existing condition. Normal values do not create an active Info alert; Info is used for recovery history.

## Alert lifecycle and recommendation lifecycle

There is one current `Alert` per `(deviceId, rule type)` and one linked `Recommendation` per alert. Alert status is `OPEN`, `ACKNOWLEDGED`, or `RESOLVED`. `AlertEvent` is the append-only audit history for trigger, escalation/severity change, owner acknowledgement, and recovery; recommendations reuse this alert audit trail instead of duplicating it.

A recommendation is derived from an active alert and keeps an explicit type, severity, title, reason, suggested action, observed value, threshold, unit, device event timestamp, registered device source, rule version, server creation time, and last generation time. Device source is never trusted from the incoming payload. `createdAt`/`lastGeneratedAt` are server times; `observedAt` is the timestamp supplied by the validated device message.

Repeated readings at unchanged severity refresh the current evidence without flooding the audit log. An escalation reopens the alert and recommendation and resets prior acknowledgement. An acknowledgement marks both in the same transaction but does not silence, suppress, or clear the underlying measurement. A subsequent in-range measurement resolves both and adds an Info-level alert recovery event. A later recurrence reopens the same current rows and adds a new trigger event; previous alert events remain available as history.

Recommendations are cautious review prompts:

| Alert | Recommendation type | Suggested action intent |
| --- | --- | --- |
| `FEED_LOW` | `FEED_CHECK` | Verify the measurement, inspect feeder, then follow the farm feeding plan if confirmed. |
| `WATER_LOW` | `WATER_CHECK` | Verify the measurement, inspect supply, then follow the farm water plan if confirmed. |
| `HIGH_TEMPERATURE` | `HEAT_RESPONSE` | Verify temperature; review shade/airflow/water access and follow the farm's approved heat plan. |

The heat prompt explicitly does not activate equipment. No consumption history is used to estimate refill dates; that feature remains deferred until sufficient historical data exists.

## API contracts

### `GET /api/alerts?status=OPEN&limit=100`

Requires a signed-in Farmer session. Optional `status` is `OPEN`, `ACKNOWLEDGED`, or `RESOLVED`; `limit` is an integer 1–100 (default 100). Queries are scoped through the device's farm owner. Each alert includes source and farm/device labels and up to 20 newest lifecycle events. Responses are `Cache-Control: no-store`.

### `POST /api/alerts/{alertId}/acknowledge`

Requires the signed-in Farmer, an allowlisted browser `Origin`, and an alert belonging to that farmer's farm. No body is accepted. First acknowledgement returns `alreadyAcknowledged: false`, a timestamp, and audit event; a repeated acknowledgement is idempotent. Not-found/not-owned is 404; already resolved is 409. This action also updates the linked recommendation in the same transaction.

### `GET /api/recommendations?status=OPEN&limit=100`

Requires a signed-in Farmer session. Optional status and limit use the same values/bounds as the alert API. Rows are scoped through `recommendation.alert.device.farm.ownerId`; response contains recommendation fields and alert/device/farm references, with `Cache-Control: no-store`. There is no separate recommendation acknowledgement endpoint: review/acknowledgement happens through the linked alert endpoint, preventing two competing acknowledgement records.

Example response shape:

```json
{
  "recommendations": [
    {
      "id": "...",
      "type": "FEED_CHECK",
      "severity": "WARNING",
      "status": "OPEN",
      "title": "Check feed availability",
      "reason": "Feed level is 18%, at or below the configured warning threshold of 20%.",
      "suggestedAction": "Verify the sensor reading and inspect the feeder. If the low level is confirmed, replenish according to the farm's established feeding plan.",
      "observedValue": 18,
      "thresholdValue": 20,
      "unit": "%",
      "observedAt": "2026-10-20T09:30:00.000Z",
      "deviceSource": "SIMULATOR",
      "ruleVersion": "recommendation-v1",
      "createdAt": "2026-10-20T09:30:02.000Z",
      "lastGeneratedAt": "2026-10-20T09:30:02.000Z",
      "alert": { "id": "...", "type": "FEED_LOW", "device": { "name": "Feeder 1", "farm": { "name": "North field" } } }
    }
  ]
}
```

### Telemetry side effect

`POST /api/telemetry` retains `schemaVersion: 1`, registered device token, payload validation, and deduplication from Phase 2. This milestone adds no device command field, firmware change, or MQTT dependency.

## Notification and automation boundary

`NotificationDispatcher` defines injectable SMS, email, and push ports. No providers, secrets, recipients, consent/preferences, retry worker, or delivery policy are configured. Missing providers return `NOT_CONFIGURED`; nothing is sent.

The typed automation evaluator creates approval-required proposals with `executionStatus: NOT_EXECUTED`. There is no actuator adapter, command API, MQTT publisher, scheduler, relay operation, or execution path. Any future actuation needs a separate review of firmware protocol, authorization, interlocks/failsafe, audit, timeout and human approval.

## Database and verification boundary

The alert lifecycle migration and the later recommendation migration are separate offline SQL drafts. The recommendation migration depends on Phase 1 accounts, Phase 2 devices, and the Phase 3 alert migration. Required order is Phase 1, Phase 2, alerts, recommendations. None has been applied by this work; no database connectivity is assumed or tested. Both drafts are additive and have no `DROP` statements.

Prisma validation/generation, lint, TypeScript, and unit tests can be run without PostgreSQL. Current tests exercise alert thresholds/lifecycle, recommendation rule mapping, automation safety, and notification ports. They do not prove database transactions, owner isolation, API behavior against a live database, firmware compatibility, or actuator behavior. The alert and recommendation pages show a safe unavailable state until the database and reviewed migrations are available.
