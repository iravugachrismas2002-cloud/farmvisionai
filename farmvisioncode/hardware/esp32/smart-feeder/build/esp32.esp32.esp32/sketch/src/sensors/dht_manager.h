#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\sensors\\dht_manager.h"
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
