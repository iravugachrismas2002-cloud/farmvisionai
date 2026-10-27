#pragma once

#include "Arduino.h"
#include "../config/pins.h"

class UltrasonicManager {
public:
  UltrasonicManager();
  void begin(int trigPin, int echoPin);
  float readDistanceCm();
  bool isValid();
private:
  int trigPin;
  int echoPin;
};
