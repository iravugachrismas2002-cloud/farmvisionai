#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\actuators\\relay_manager.h"
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
