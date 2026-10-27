#pragma once

#ifndef HX711_CAL_FACTOR
#define HX711_CAL_FACTOR 220470.0
#endif
#include "hx711_manager.h"
#include <HX711.h>
#include <Preferences.h>  // ESP32 NVS preferences
#include <EEPROM.h>        // ESP32 EEPROM
#include "../config/settings.h"

static HX711 scale;
static bool hx711Ready = false;

// NVS/EEPROM calibration storage
static const char* CALIBRATION_NAMESPACE = "hx711_cal";

void HX711Manager::begin() {
  scale.begin(HX711_DT, HX711_SCK);
  hx711Ready = scale.is_ready();

  // Try to load calibration factor from NVS first
  Preferences prefs;
  prefs.begin(CALIBRATION_NAMESPACE, true);  // read-only

  // Load the calibration factor, fallback to default
  calibration = prefs.getFloat("calibration_factor", Settings::DEFAULT_HX711_CAL_FACTOR);

  // Load the full calibration record if it exists
  record.calibrationFactor = calibration;
  record.timestamp = prefs.getUInt32("cal_timestamp", 0);
  for (int i = 0; i < 4; i++) {
    record.testWeights[i] = prefs.getFloat(String("wt_") + i, 0.0);
    record.rawReadings[i] = prefs.getLong(String("raw_") + i, 0L);
    record.errors[i] = prefs.getFloat(String("err_") + i, 0.0);
    record.valid = prefs.getBool("valid", false);
  }

  // If we have a valid stored calibration, use it; otherwise use the loaded/default factor
  if (record.valid) {
    calibration = record.calibrationFactor;
  }

  prefs.end();
}

float HX711Manager::readWeight() {
  if (!hx711Ready) {
    return NAN;
  }

  if (scale.wait_ready_timeout(200)) {
    long raw = scale.read();
    float weight = raw / calibration;

    if (isnan(weight) || isinf(weight)) {
      return NAN;
    }

    if (weight < -Settings::HX711_TARE_THRESHOLD || weight > 100.0) {
      return NAN;
    }

    return weight;
  }

  return NAN;
}



void HX711Manager::setCalibration(float factor) {
  calibration = factor;
}

// Tare the scale and clear the stored calibration record,
// since the zero point has changed and re-calibration is needed.
void HX711Manager::tare() {
  if (hx711Ready && scale.wait_ready_timeout(200)) {
    scale.tare();
    // Clear stored calibration record - the factor may change with new zero point
    calibration = Settings::DEFAULT_HX711_CAL_FACTOR;
    memset(&record, 0, sizeof(record));
    record.valid = false;
  }
}

// Run calibration routine: test multiple weight points, compute optimal factor,
// store in NVS/EEPROM, and return true on success.
// Test weights: 0g (tare), 100g, 500g, 1000g
// Order matters: increasing load first, then decreasing, to check hysteresis.
// Returns true if calibration succeeded and factor was stored.
bool HX711Manager::calibrate() {
  if (!hx711Ready) {
    return false;
  }

  // Ensure scale is ready and stable
  if (!scale.wait_ready_timeout(200)) {
    return false;
  }

  // Clear calibration record
  memset(&record, 0, sizeof(record));
  record.valid = false;
  record.timestamp = millis();

  // Test weight points (in grams). The operator places weights in this order:
  // 1. Tare (0g) - already done above
  // 2. 100g weight
  // 3. 500g weight
  // 4. 1000g weight (if available)

  // Note: The actual weight placement is manual. The firmware records the raw
  // HX711 values at each point. The operator must place precise calibration
  // weights on the feeder platform.

  float testWeights[4] = {0.0, 100.0, 500.0, 1000.0};
  long rawReadings[4] = {0, 0, 0, 0};

  // 0g point: already tared above, read raw value
  if (scale.wait_ready_timeout(200)) {
    rawReadings[0] = scale.read();
  }

  // 100g point - operator places 100g weight
  // Wait for stabilization
  delay(500);
  if (scale.wait_ready_timeout(200)) {
    rawReadings[1] = scale.read();
  }

  // 500g point - operator places 500g weight
  delay(500);
  if (scale.wait_ready_timeout(200)) {
    rawReadings[2] = scale.read();
  }

  // 1000g point - operator places 1000g weight (if available)
  delay(500);
  if (scale.wait_ready_timeout(200)) {
    rawReadings[3] = scale.read();
  }

  // Calculate calibration factor for each test point:
  // calibration = raw / weight_in_grams
  // We want the factor that minimizes error across all points

  float factors[4] = {0.0, 0.0, 0.0, 0.0};
  bool hasFactor[4] = {false, false, false, false};

  // Compute factor for each point (skip index 0 since it's just tare/0g)
  for (int i = 1; i < 4; i++) {
    if (testWeights[i] > 0 && rawReadings[i] != 0) {
      factors[i] = (float)rawReadings[i] / testWeights[i];
      hasFactor[i] = true;
    }
  }

  // If we have at least 2 valid factors, compute a weighted average
  // that gives more weight to the middle range (100g and 500g)
  int validCount = 0;
  float sumFactor = 0.0;
  float weightedSum = 0.0;
  float weightWeights[4] = {0.0, 2.0, 3.0, 1.0};  // Higher weight for middle points

  for (int i = 1; i < 4; i++) {
    if (hasFactor[i]) {
      validCount++;
      sumFactor += factors[i];
      weightedSum += factors[i] * weightWeights[i];
    }
  }

  if (validCount < 2) {
    // Not enough data points for meaningful calibration
    return false;
  }

  // Use weighted average as the calibration factor
  // weightedSum / (weightWeights[1] + weightWeights[2] + weightWeights[3])
  calibration = weightedSum / (weightWeights[1] + weightWeights[2] + weightWeights[3]);

  // Now compute errors for each test point using this calibration factor
  for (int i = 1; i < 4; i++) {
    if (hasFactor[i]) {
      // Expected raw reading with this calibration: raw = calibration * weight
      // Actual error: (actual_raw - expected_raw) / weight * 100% normalized
      long expectedRaw = (long)(calibration * testWeights[i]);
      long actualRaw = rawReadings[i];
      float errorPercent = 0.0;

      if (testWeights[i] > 0) {
        // Error as percentage of reading, normalized by calibration
        errorPercent = (float)(actualRaw - expectedRaw) / testWeights[i] * 100.0f / calibration;
      }

      record.errors[i] = errorPercent;
    } else {
      record.errors[i] = NAN;
    }
  }

  // Store test weights and raw readings in the record for diagnostics
  for (int i = 0; i < 4; i++) {
    record.testWeights[i] = testWeights[i];
    record.rawReadings[i] = rawReadings[i];
  }

  // Mark record as valid
  record.valid = true;

  // Save to NVS
  saveCalibrationToNVS();

  return true;
}

// Load calibration factor from NVS (non-volatile storage)
// Returns true if a stored factor was found and loaded
bool HX711Manager::loadCalibrationFromNVS() {
  Preferences prefs;
  bool found = false;

  prefs.begin(CALIBRATION_NAMESPACE, true);  // read-only

  // Try to load the calibration factor
  calibration = prefs.getFloat("calibration_factor", Settings::DEFAULT_HX711_CAL_FACTOR);

  // Also load the full calibration record if it exists
  record.calibrationFactor = calibration;
  record.timestamp = prefs.getUInt32("cal_timestamp", 0);
  for (int i = 0; i < 4; i++) {
    record.testWeights[i] = prefs.getFloat(String("wt_") + i, 0.0);
    record.rawReadings[i] = prefs.getLong(String("raw_") + i, 0L);
    record.errors[i] = prefs.getFloat(String("err_") + i, 0.0);
    record.valid = prefs.getBool("valid", false);
  }

  found = record.valid || (calibration != Settings::DEFAULT_HX711_CAL_FACTOR);

  prefs.end();
  return found;
}

// Save calibration factor to NVS (non-volatile storage)
// Returns true if save succeeded
bool HX711Manager::saveCalibrationToNVS() {
  Preferences prefs;

  prefs.begin(CALIBRATION_NAMESPACE, false);  // read-write

  // Save the calibration factor
  prefs.putFloat("calibration_factor", calibration);

  // Save the full calibration record
  prefs.putUInt32("cal_timestamp", record.timestamp);
  for (int i = 0; i < 4; i++) {
    prefs.putFloat(String("wt_") + i, record.testWeights[i]);
    prefs.putLong(String("raw_") + i, record.rawReadings[i]);
    prefs.putFloat(String("err_") + i, record.errors[i]);
  }
  prefs.putBool("valid", record.valid);

  prefs.end();
  return true;
}
