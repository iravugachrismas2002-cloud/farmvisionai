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
