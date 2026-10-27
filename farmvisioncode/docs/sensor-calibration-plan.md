# FarmVision Feeder Sensor Calibration Plan

Calibration results are required before hardware readings, thresholds, depletion rates, or recommendations are described as operational. Until then, retain `HARDWARE` provenance but label values and derived outputs as unverified.

## General controls

- Record device, sensor, firmware, container geometry, date, operator, ambient conditions, and reference instruments.
- Use a traceable or documented reference instrument where practical.
- Record raw readings before conversion, rounding, clamping, or smoothing.
- Use UTC timestamps and repeat measurements after warm-up and after reconnect.
- Keep calibration data separate from production telemetry; do not rewrite historical observations.
- Document uncertainty, repeatability, outliers, and the valid operating range.

## Feed weight calibration

1. Inspect load-cell mounting, platform stability, wiring, and HX711 configuration.
2. Tare the empty feeder and record zero drift over time.
3. Use multiple known test masses spanning the expected operating range.
4. Fit and record the conversion from raw counts to grams.
5. Repeat each mass at least three times, including increasing and decreasing loads.
6. Test hysteresis, vibration sensitivity, feeder movement, and power-cycle recovery.
7. Define acceptable error and the minimum reportable change before using feed-weight trends.

## Feed and water level calibration

1. Define the physical container geometry and the intended percentage meaning.
2. Measure known fill levels across empty, low, mid, and full states.
3. Test the ultrasonic/level sensor at each point with stable and disturbed surfaces.
4. Record dead zones, obstruction effects, foam/splash behavior, refill/reset behavior, and sensor angle.
5. Map raw distance to percentage only within the validated container and mounting setup.
6. Define acceptable percentage-point error and mark levels outside the calibrated range unavailable.
7. Do not convert percentage points to litres without an independently approved volume mapping.

## Temperature and humidity validation

1. Place the DHT22 beside a reference thermometer/hygrometer.
2. Record readings after stabilization across representative cool, normal, warm, and humid conditions.
3. Measure response delay, drift, condensation sensitivity, airflow effects, and enclosure effects.
4. Record bias and uncertainty for temperature and relative humidity separately.
5. Review whether the Phase 3 temperature thresholds are appropriate for the species, housing, and local operating procedure; current values are prototype defaults only.

## Acceptance and change control

- A calibration report must identify passed ranges and failed ranges.
- Thresholds may be reviewed only with the calibration report and agricultural domain input.
- Firmware, sensor placement, container geometry, or conversion changes invalidate the affected calibration and require a new report.
- Until accepted, analytics remain descriptive, forecasts remain directional/uncalibrated, and recommendations remain cautious review prompts.
