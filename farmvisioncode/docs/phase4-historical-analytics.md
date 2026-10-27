# Phase 4 — Historical Analytics

## Scope and boundaries

Phase 4 adds read-only, historical queries over the Phase 2 `SensorReading` history. It uses the existing Farmer account, farm ownership, device registration, event timestamps, and hardware/simulator source fields. The feature adds no Prisma models, schema edits, or migrations. It does not create telemetry, estimated litres, animal intake, machine-learning predictions, or hardware behavior that has not been verified.

The analytics code is divided into:

- `backend/src/modules/analytics/schema.ts`: strict query parameter validation.
- `backend/src/modules/analytics/range.ts`: UTC range resolution, maximum-range checks, and deterministic bucket sizing.
- `backend/src/modules/analytics/aggregation.ts`: pure aggregation logic with no database or UI dependencies.
- `backend/src/modules/analytics/service.ts`: Farmer-role checks, owner-scoped farm/device choices, and bounded database reads.
- `frontend/src/app/api/analytics/route.ts`: authenticated, no-store HTTP boundary.
- `frontend/src/components/analytics/analytics-dashboard.tsx`: range/farm/device controls, Recharts charts, source labels, and CSV export.

## API contract

### `GET /api/analytics`

Requires a signed-in user with the server-assigned `FARMER` role. All farm and device options are scoped to `Farm.ownerId = user.id`; the telemetry query is then scoped to the selected, owner-visible device. Requests and responses use `Cache-Control: no-store`.

Supported query parameters:

| Parameter | Meaning |
| --- | --- |
| `range` | `24h` (default), `7d`, `30d`, or `custom` |
| `farmId` | Optional UUID for an owned farm |
| `deviceId` | Optional UUID for a device on the selected owned farm; one device is analyzed per response |
| `start`, `end` | Required only for `custom`; ISO timestamps with an explicit timezone offset |

The selected interval is start-inclusive and end-exclusive, and filters on `SensorReading.observedAt` (event time). Custom ranges require `end > start`, cannot end in the future, and cannot exceed 30 days. Duplicate/unknown parameters are rejected. For a custom range, the final bucket may be partial.

Bucket duration is one hour for intervals up to 24 hours, six hours for intervals over 24 hours through seven days, and one day for longer intervals through 30 days. Presets end at the request's current UTC time. Bucket timestamps are ISO UTC; the browser formats chart labels in the viewer's local timezone.

The response includes the chosen window, owned farm/device options, the selected device and its registered source, reading count, and a dense series of bucket records. Empty values are `null`, not zero. If no device is chosen, the response contains options and no series so the dashboard can request an explicit selection. More than 20,000 readings for one device/window returns HTTP 422 with a request to narrow the range; records are not silently truncated.

Example request:

```text
GET /api/analytics?range=7d&farmId=<owned-farm-uuid>&deviceId=<owned-device-uuid>
```

Example custom request:

```text
GET /api/analytics?range=custom&farmId=<owned-farm-uuid>&deviceId=<owned-device-uuid>&start=2026-10-18T08%3A00%3A00%2B02%3A00&end=2026-10-20T08%3A00%3A00%2B02%3A00
```

## Aggregation semantics

- Temperature is summarized as mean/minimum/maximum in °C, with a sample count. Humidity is summarized as mean/minimum/maximum in percent, with its own count. Feed and water levels are reported in percent.
- Feed-weight change compares a reading only with the immediately preceding in-range reading when both measurements are present and event times increase. A decrease is reported in grams and assigned to the later reading's bucket. A rise is a restock/reset interval, contributes no negative consumption, and is counted separately. The first in-range reading establishes a baseline; no pre-range value is pulled in.
- A sensor's `feedWeightGrams` meaning/calibration has not been confirmed with firmware. The chart therefore says “observed feed-weight decrease”; it is not certified animal intake or a validated consumption rate.
- Feed-level and water-level declines are separate percentage-point proxies. An increase is treated as a refill/restock/reset interval. No conversion to grams or litres is attempted without calibration and container geometry.
- Missing values break the corresponding adjacent-reading pair. Gaps are not interpolated, and an empty bucket is not interpreted as zero. Counts in the CSV show sample/pair coverage.
- Only one device is charted at a time. This avoids blending sensors, source types, and farms with different physical contexts. Its registered `HARDWARE` or `SIMULATOR` source is displayed from the database; source is not accepted from a telemetry request parameter.

## Dashboard and report

`/analytics` is a Farmer-only page. It provides farm and device selectors, the four supported ranges, seven historical chart views, and a CSV export containing bucket timestamps, environmental mean/min/max/sample counts, and feed/water measured decrease and pair/reset counts. The dashboard states the units, source, UTC query window, local chart-label timezone, and measurement limitations. It shows an explicit empty state rather than generating demo readings.

## Verification and pending dependencies

Unit tests cover preset/custom range behavior, range bounds, bucket sizing, event ordering, environmental statistics, missing readings, end-boundary exclusion, decline calculations, and refill/reset behavior. These tests do not prove live Prisma query behavior, database ownership isolation, chart rendering in a real browser, or hardware calibration.

The PostgreSQL service can be running while TCP port `127.0.0.1:5432` is unreachable. No database was contacted successfully during Phase 4, no `farmvision_dev` database was confirmed, and no migration was applied. Live API authorization and aggregation remain pending the confirmed development database and ordered migrations. Firmware units and the meaning of feed weight remain pending hardware-contract review.
