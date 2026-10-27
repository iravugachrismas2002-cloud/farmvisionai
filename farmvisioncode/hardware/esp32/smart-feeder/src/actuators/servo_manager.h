#pragma once

#include "Arduino.h"
#include "../config/pins.h"

class ServoManager {
public:
  ServoManager();
  void begin(int pin);
  void open();
  void close();
  void setCalibration(int openAngle, int closeAngle);
private:
  int pin;
  int openAngle = 90;
  int closeAngle = 0;
};
