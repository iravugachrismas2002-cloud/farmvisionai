#pragma once

#include "Arduino.h"
#include "../config/pins.h"
#include "../config/settings.h"

class HX711Manager {
public:
  void begin();
  float readWeight();
  void tare();
  void setCalibration(float factor);
  // Calibration routine: runs once to determine optimal calibration factor
  // Tests multiple weight points and stores the result in NVS/EEPROM.
  bool calibrate();
  // Load calibration factor from persistent storage (NVS/EEPROM)
  // Returns true if a stored factor was found and loaded
  bool loadCalibrationFromNVS();
  // Save calibration factor to persistent storage
  // Returns true if save succeeded
  bool saveCalibrationToNVS();
  // Structure for calibration record
  struct CalibrationRecord {
    float calibrationFactor;  // The calibration factor (raw/grams)
    uint32_t timestamp;       // When calibration was performed
    float testWeights[4];     // Test weights used (g): {0, 100, 500, 1000}
    long rawReadings[4];      // Raw HX711 readings at each test weight
    float errors[4];          // Error percentage at each test point
    bool valid;               // Whether calibration record is valid
  };
  // Access the calibration record (for diagnostics/inspection)
  const CalibrationRecord& getCalibrationRecord() const { return record; }
private:
  float calibration = Settings::DEFAULT_HX711_CAL_FACTOR;
  CalibrationRecord record;
};
