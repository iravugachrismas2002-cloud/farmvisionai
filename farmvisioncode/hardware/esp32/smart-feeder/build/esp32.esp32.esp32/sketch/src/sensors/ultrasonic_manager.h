#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\sensors\\ultrasonic_manager.h"
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
