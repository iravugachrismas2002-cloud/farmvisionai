# Phase 6 — Digital Twin Prototype

## Scope and safety boundary

Phase 6 adds an explainable, deterministic what-if layer to the Farmer prototype. It compares a selected farm device's recorded baseline with one in-memory scenario at a time. Every projected value and risk is labelled **SIMULATION**. A scenario is never presented as a new observation, calibrated forecast, veterinary/agronomic recommendation, or instruction to act.

The Twin is deliberately ephemeral and client-side. There is no scenario-save API, database model, telemetry write, device-state update, persisted-alert mutation, or persisted-recommendation mutation. The page is Farmer-only and uses the existing owner-scoped Phase 4 analytics and Phase 5 intelligence APIs. No new user role or future ecosystem module is introduced.

## Routes and inputs

`/digital-twin` is an authenticated Farmer page. It loads farm/device choices server-side through the Phase 4 owner-scoped choices service. The browser then requests both:

- `GET /api/intelligence?range=7d|30d&farmId=...&deviceId=...`
- `GET /api/analytics?range=7d|30d&farmId=...&deviceId=...`

Both existing APIs independently enforce the signed-in Farmer role, farm ownership, device/farm pairing, bounded ranges, and `no-store` responses. The Twin accepts only the same device and farm from both responses; a mismatch produces an empty `INPUT_MISMATCH` baseline rather than combining values from different selections. No new `/api/digital-twin` route is needed because scenario calculation does not require server persistence.

### Observed baseline

Phase 5 `IntelligenceResponse.latestObservation` carries the latest in-range telemetry row's event time, receipt time, reading source, and nullable temperature, humidity, feed-level, water-level, and feed-weight values. It does not fill a missing field from an older row. The selected range remains 7 or 30 days, and all stored timestamps remain UTC; the browser localizes display only.

Phase 4 bucket summaries supply history context: temperature/humidity means are weighted by their sample counts, min/max and coverage counts are retained, and feed-weight/feed-level/water-level decreases remain separate interval totals with increase/reset counts. These interval totals are contextual measured changes, not validated intake or calibrated consumption. If the two API selections do not match, the Twin drops the history context instead of exposing the other response's values.

### Scenario inputs and formulas

The bounded scenario form accepts a horizon of 1–30 days; optional starting feed/water level assumptions (0–100%); optional daily drawdown assumptions (0–100 percentage points/day); and optional temperature/humidity values at the horizon (temperature −40 to 85 °C, humidity 0–100%). Empty fields are not silently converted to zero.

For feed and water independently:

```text
start level = explicit user assumption, otherwise latest recorded level
rate = explicit user assumption, otherwise Phase 5 directional rate only when status is ESTIMATED
simulated level = clamp(start level - rate × horizon days, 0%, 100%)
```

If either the start level or rate is unavailable, the simulated end level remains unavailable. A rate override is labelled a user assumption; a reused Phase 5 rate is labelled a directional trend. The delta from baseline is shown only when both the observation and simulated level exist. The projected end timestamp is `latest observation time + horizon`; it remains unavailable when there is no observed time to anchor it.

When no climate value is entered, the scenario holds the latest observation constant; this is a scenario assumption, not a climate forecast. An entered temperature or humidity is an assumed horizon value. Feed-weight grams are shown only as observed context and are **not simulated**, because the prototype has no calibrated mass-depletion model. Water percentages are never converted to litres.

## Risk projection

The Twin evaluates the latest observed snapshot and the simulated snapshot with the existing Phase 3 pure `evaluateSensorAlerts` function. It compares feed-low, water-low, and high-temperature threshold states for the same baseline and scenario. Missing metrics produce `UNAVAILABLE` comparisons, not a no-risk result. Scenario results are displayed as projected risk signals only and do not create, resolve, acknowledge, or persist alerts.

The reused Phase 3 prototype defaults are feed/water Warning at or below 20% and Critical at or below 10%, plus temperature Warning at or above 32 °C and Critical at or above 35 °C. They are not validated for a species, farm, or sensor calibration. Humidity is shown as an environmental scenario condition, but no humidity risk rule exists in the current prototype. No heat-index or species-specific climate model is inferred.

## Dashboard behavior

The dashboard provides farm/device and 7-day/30-day selectors, observed baseline values with source and event time, Phase 4 historical context, bounded what-if inputs, and side-by-side observed-versus-simulated state. It shows resource/climate differences, baseline and projected risk checks, risk-state changes, existing persisted Phase 3 alerts as read-only context, and the simulation limitations. There is no save, run-actuator, or alert-generation control.

When PostgreSQL or the owner-scoped APIs are unavailable, the page shows an unavailable/error state; it does not populate a demo baseline. A user may still enter explicit assumptions, but the UI keeps the observed comparison unavailable rather than treating an assumption as a measurement.

## Tests and verification boundaries

Pure unit tests cover Phase 4/5 response matching, sample-count-weighted historical means, interval-unit preservation, mismatched-selection isolation, trend-based projections, explicit assumptions, level bounds, missing baselines/rates, reset-affected forecast exclusion, risk changes, environment bounds, and feed-weight separation. They do not prove browser rendering, live owner isolation, database connectivity, migration compatibility, hardware behavior, or the accuracy of any projection.

No Prisma schema, SQL migration, or database contents were changed. The user has confirmed that `farmvision_dev` already exists; do not recreate it. Live PostgreSQL verification and the Phase 1–3 migration review/application remain pending. Hardware telemetry meaning, calibration, clocks, and environmental response remain unverified until the firmware contract is approved.
