#pragma once

#include "Arduino.h"
#include "../config/pins.h"

class DHTManager {
public:
  DHTManager();
  void begin();
  float readTemperature();
  float readHumidity();
  bool isValid();
private:
  float lastTemp = NAN;
  float lastHumidity = NAN;
};
