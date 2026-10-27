# Phase 5 — Intelligence Foundations

## Scope and boundaries

Phase 5 adds deterministic feed and water intelligence over the existing Phase 2 `SensorReading` history and Phase 4 time-range/owner-choice logic. It adds no Prisma model, schema edit, migration, telemetry write, machine-learning model, notification, or actuator path. The Farmer remains the only role with a Phase 5 view; no future role-specific modules are introduced.

The purpose is to turn recorded observations into transparent trend evidence. A forecast is not a measured fact, a calibrated physical quantity, a guaranteed refill schedule, or a veterinary/agronomic instruction.

## API and access

### `GET /api/intelligence`

The API requires a signed-in user with the server-assigned `FARMER` role. Farm and device options come from the Phase 4 choices service, which checks the Farmer assignment and scopes records through `Farm.ownerId`. A requested device must belong to the selected owned farm. The API and telemetry query are `no-store`.

Supported query parameters:

| Parameter | Meaning |
| --- | --- |
| `range` | `7d` or `30d`; defaults to `30d` |
| `farmId` | Optional UUID for an owned farm |
| `deviceId` | Optional device UUID; requires `farmId` and must belong to that owned farm |

Unknown/duplicate parameters and invalid selections are rejected. The time window is resolved by the Phase 4 UTC range service and filters on `SensorReading.observedAt` (event time), start-inclusive and end-exclusive. One device is analyzed per response. The selected-device read uses the existing `[deviceId, observedAt]` index and is capped at 20,000 observations; denser windows receive HTTP 422 rather than silent truncation.

An unselected device returns the owned farm/device choices and `analysis: null`, allowing the page to request an explicit selection. The API returns 401 for no session, 403 for missing Farmer role, 400 for invalid query, 404 for an unavailable farm/device, 422 for a dense window, and 503 when the backing service is unavailable.

## Feed and water engines

`backend/src/modules/intelligence/feed-engine.ts` and `water-engine.ts` are thin domain-specific engines over pure calculations in `forecast.ts`. Each range is chronological by event time (with receipt time as a tie-breaker). Samples outside the percentage domain, missing values, source changes, and level increases are never interpolated across.

An increase in a percentage level is treated as a possible refill/reset boundary. A missing or invalid value and a hardware/simulator source change also start a new segment. The rate uses only the most recent segment, so earlier refill/reset periods do not contaminate the current estimate.

For each adjacent, time-increasing interval in that segment, the estimator calculates a non-negative rate in percentage points per day. Stable intervals contribute zero, so isolated declines do not dominate a mostly flat period. The estimate is available only when the current segment contains at least four readings, spans at least 24 hours, and includes at least three declining intervals. These are conservative data-availability gates for the prototype, not agricultural thresholds or a validated confidence test.

The estimator takes the median of the per-interval rates, then calculates:

```text
median rate = median((previous level % - current level %) / elapsed days)
days to 0% = latest observed level % / median rate
estimated 0% crossing = latest observed timestamp + days to 0%
```

If the median is zero or non-positive, no date is produced. The output explicitly distinguishes `INSUFFICIENT_DATA`, `NO_DECLINE`, `NO_SUSTAINED_DECLINE`, `RESET_AFFECTED`, `AT_ZERO`, and `ESTIMATED`. Results include the calculation-segment start, as-of event time, source, sample/decline/reset counts, coverage hours, formula version (`directional-depletion-v1`), and `confidence: NOT_CALIBRATED`.

The UI calls the output a **directional 0% crossing**, not a confirmed refill date. A reported level of 0% may not correspond to a physically empty container. The model does not use container geometry, feed/water capacity, livestock count, weather, schedules, or a farm-specific replenishment lead time. It is not a prediction interval and is not calibrated against outcomes. Irregular sample spacing can still affect a median-of-interval-slopes estimate.

`feedWeightGrams` is handled separately: the Feed Engine can summarize pairwise observed decreases and possible increase/reset intervals in grams. It does not convert feed-level percentage to grams, forecast from feed weight, or label a decrease as confirmed animal intake. Water-level percentages are not converted to litres.

## Risk and farm-performance foundations

The `risk` section of the response reports active persisted Phase 3 alerts for the selected device, with severity, status, observed value, threshold, event time, device source, and a note that the current `Alert` model does not store the originating rule version. The service does not infer new risk from a forecast.

`scoreRiskSignals` accepts an explicitly supplied, versioned policy that maps `INFO`, `WARNING`, and `CRITICAL` signals to 0–100 points. If no policy is supplied, as in the Phase 5 API, the risk result is `NOT_CONFIGURED` and its numeric score is `null`; the alerts remain visible as explainable signals. A configured score is a policy-based summary, not a probability of harm.

`scoreFarmPerformance` accepts versioned dimension weights, per-dimension scores, and a minimum evidence-coverage threshold. It reports `NOT_CONFIGURED`, `INSUFFICIENT_COVERAGE`, `PARTIAL`, or `RATED`. The Phase 5 API supplies no production policy and analyzes one selected device, not every dimension of a farm, so the farmer sees **Not rated** rather than an arbitrary composite. A future farm-wide score requires approved dimensions, weights, evidence coverage, and agricultural review.

## Recommendation evidence

When a feed- or water-level forecast meets its evidence gates, the API may return an on-demand review prompt marked `status: PROPOSED` and `persisted: false`. Its evidence contains the current level and unit, median rate and unit, actual calculation segment, as-of time, hardware/simulator source, sample/interval/reset counts, formula version, uncalibrated-confidence flag, and limitations. If the estimate is unavailable, no prompt is generated.

These are not persisted Phase 3 `Recommendation` rows, do not replace alert-driven recommendations, and do not execute any action. No database field was added. Persisting these evidence objects would require a separately reviewed schema migration and is outside this phase.

## Farmer page

`/intelligence` provides farm, device, and 7-day/30-day selectors, feed/water estimate cards, a separate observed feed-weight summary, active-alert signals, farm-performance readiness, and evidence-linked review prompts. Hardware-reported values and estimates are explicitly marked unverified; simulator data is labelled. The page does not replace unavailable database values with demo readings.

## Unit tests and verification limits

The pure tests cover event ordering, hourly/date calculations, percentage units, stable intervals, sufficient/insufficient history, missing values, reset/refill boundaries, source changes, feed-weight separation, evidence provenance, query validation, and configured/unconfigured scoring policies. They do not prove live database ownership isolation, migration compatibility, browser rendering, hardware calibration, or forecast accuracy.

The project owner has confirmed that `farmvision_dev` already exists. Do not recreate it. Phase 1–3 migrations remain unapplied; Phase 5 made no migration changes and did not connect to PostgreSQL. Live persistence and role/ownership checks remain pending the later database verification step. Hardware meaning, calibration, clock behavior, and refill interpretation remain pending the approved firmware contract.
