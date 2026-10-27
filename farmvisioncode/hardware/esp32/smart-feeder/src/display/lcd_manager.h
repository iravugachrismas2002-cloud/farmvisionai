#pragma once

#include "Arduino.h"
#include "../config/pins.h"
#include <Wire.h>

class LCDManager {
public:
  void begin();
  void clear();
  void printLine(int line, const char* text);
private:
  uint8_t address = 0x27;
  void scanI2C();
};
