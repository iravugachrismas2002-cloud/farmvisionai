# FarmVision Feeder Hardware Verification Checklist

This checklist verifies the real ESP32-to-FarmVision contract. A simulator result must not be marked as hardware verification.

## 1. Device identity and provisioning

- Record the physical device serial/identifier and the FarmVision `publicId`.
- Confirm the device is registered to the intended farm and is not visible to another farmer.
- Provision the one-time device credential through a secure channel; confirm only its hash is persisted.
- Verify a revoked/disabled device cannot submit telemetry.
- Confirm the device source is recorded as `HARDWARE`, never inferred from an untrusted payload.

## 2. Transport and request contract

- Record transport, endpoint/topic, TLS behavior, and network/GSM conditions.
- Confirm the payload schema version is accepted by the deployed API.
- Confirm message IDs are unique per device and remain stable across retries.
- Send a duplicate message and verify it is de-duplicated.
- Send an invalid identity, malformed timestamp, out-of-range value, and unknown field; verify rejection without state mutation.
- Verify retry behavior is safe and does not duplicate readings, alerts, or recommendations.

## 3. Clock and ordering behavior

- Compare ESP32 RTC time, server receipt time, and a trusted reference clock.
- Record timezone/UTC behavior and maximum observed clock drift.
- Send an older valid event after a newer event; verify it remains in history but does not backdate `DeviceState`.
- Confirm reconnect/offline buffering preserves message IDs and event timestamps.

## 4. Sensor fields and units

For each field, record the raw hardware value, API value, unit, expected range, and conversion:

- Temperature: °C
- Humidity: % relative humidity
- Feed level: % of the calibrated container range
- Water level: % of the calibrated container range
- Feed weight: grams, with tare and calibration status

Confirm omitted fields remain null/missing rather than becoming zero.

## 5. End-to-end persistence and UI

- Submit a known hardware reading and locate the immutable history row.
- Verify latest state advances only for newer event time.
- Confirm the dashboard labels the observation `HARDWARE` and displays event time separately from receipt time.
- Trigger controlled low-feed, low-water, and temperature boundary readings only after calibration review.
- Confirm alerts/recommendations preserve evidence and farm ownership.
- Confirm another farmer cannot read the device, history, analytics, intelligence, or recommendations.

## 6. Evidence to capture

Record firmware version, API version, device identifier, timestamps, raw samples, transformed samples, network conditions, screenshots/logs, rejected payload results, duplicate behavior, and operator/date. Mark each item `PASS`, `FAIL`, or `NOT RUN`; unresolved failures block Hardware Verified.
