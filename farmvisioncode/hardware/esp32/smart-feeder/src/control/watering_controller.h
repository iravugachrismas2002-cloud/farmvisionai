#pragma once

#include "Arduino.h"
#include "../config/pins.h"
#include "../sensors/ultrasonic_manager.h"
#include "../actuators/relay_manager.h"

class WateringController {
public:
  WateringController();
  void begin();
  void update();
  void startWatering();
  void stopWatering();
private:
  enum State { IDLE, WATERING, PAUSED };
  State state = IDLE;
  UltrasonicManager waterLevel;
  RelayManager pumpRelay;
  unsigned long stateStart = 0;
  float calculateVolume(float distanceCm);
};
