#pragma once

#include "Arduino.h"
#include "../config/pins.h"

class RelayManager {
public:
  RelayManager();
  void begin(int pin, bool activeLow = true);
  void on();
  void off();
  bool isOn();
private:
  int pin;
  bool activeLow;
  bool state = false;
};
