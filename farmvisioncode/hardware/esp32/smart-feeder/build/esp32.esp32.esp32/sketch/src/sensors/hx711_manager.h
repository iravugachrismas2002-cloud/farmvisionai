#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\sensors\\hx711_manager.h"
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
private:
  float calibration = Settings::DEFAULT_HX711_CAL_FACTOR;
};
