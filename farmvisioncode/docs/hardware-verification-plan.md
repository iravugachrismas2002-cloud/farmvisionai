# FarmVision AI — Hardware Verification Plan

**Date:** 2026-10-20  
**Target:** FarmVision Feeder prototype (ESP32 + sensors/actuators)  
**Reference:** `docs/hardware-verification-checklist.md` (existing checklist, created 2026-10-20)  
**Rule:** A simulator result must NOT be marked as hardware verification. Real-device sessions only.

## 1. Objectives

Prove the real ESP32-to-FarmVision contract end-to-end: device identity, transport, telemetry ingestion, clock behavior, sensor units, persistence, and dashboard display — with farm ownership boundaries enforced.

## 2. Preconditions

| # | Item |
|---|------|
| C1 | Database verification complete (Migration Deployment Plan + Database Persistence Verification Plan passed) |
| C2 | Physical ESP32 Feeder available, powered, and on the intended network (Wi-Fi/GSM as configured) |
| C3 | Device registered to the intended farm in `farmvision_dev`; one-time credential provisioned through a secure channel |
| C4 | API version and transport (REST provisional; MQTT pending hardware/network contract) confirmed |

## 3. Verification areas (per checklist)

| Area | Key checks |
|------|------------|
| 1. Device identity and provisioning | Serial ↔ `publicId` mapping; farm assignment; cross-account invisibility; credential hash-only storage; revoked device cannot submit telemetry; `deviceSource = HARDWARE` |
| 2. Transport and request contract | Endpoint/topic, TLS, network/GSM conditions; payload schema version accepted; unique stable message IDs; duplicate message de-duplication; invalid identity / malformed timestamp / out-of-range value / unknown field rejected without mutation; safe retries |
| 3. Clock and ordering | ESP32 RTC vs server receipt time vs reference clock; UTC behavior; max clock drift; older valid event after newer event stays in history without backdating `DeviceState`; offline buffering preserves IDs/timestamps |
| 4. Sensor fields and units | Temperature (°C), humidity (%), feed/water level (%), feed weight (grams with tare/calibration); raw→API conversion recorded; omitted fields stay null (not zero) |
| 5. End-to-end persistence and UI | Known hardware reading → immutable history row; latest state advances only for newer event time; dashboard labels `HARDWARE`; event time vs receipt time displayed; controlled boundary readings only after calibration review; alerts/recommendations preserve evidence and ownership; cross-account read blocked |

## 4. Evidence to capture

Firmware version, API version, device identifier, timestamps, raw samples, transformed samples, network conditions, screenshots/logs, rejected-payload results, duplicate-behavior results, operator and date. Mark each checklist item `PASS`, `FAIL`, or `NOT RUN`. Unresolved failures block **Hardware Verified**.

## 5. Related plans

- Sensor calibration: `docs/sensor-calibration-plan.md` (must be reviewed before thresholds/depletion rates are treated as operational)
- Telemetry contract: MQTT topics and JSON payload schemas to be defined with the hardware team before MQTT integration

## 6. Exit criteria

- Every checklist item in `docs/hardware-verification-checklist.md` executed against real hardware and marked PASS.
- Calibration report accepted for feed weight, feed/water level, temperature, and humidity.
- **Hardware Verified** status can then be set to YES.
