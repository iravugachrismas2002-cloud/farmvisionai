#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\actuators\\buzzer_manager.h"
#pragma once

#include "Arduino.h"
#include "../config/pins.h"

class BuzzerManager {
public:
  BuzzerManager();
  void begin();
  void beep(int durationMs);
  void alarm();
private:
  bool active = false;
};
