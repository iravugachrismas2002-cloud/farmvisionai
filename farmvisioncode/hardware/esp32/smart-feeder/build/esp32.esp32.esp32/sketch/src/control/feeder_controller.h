#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\control\\feeder_controller.h"
#pragma once

#include "Arduino.h"
#include "../config/pins.h"
#include "../sensors/hx711_manager.h"
#include "../sensors/ultrasonic_manager.h"
#include "../actuators/servo_manager.h"
#include "../actuators/relay_manager.h"

class FeederController {
public:
  FeederController();
  void begin();
  void update();
  void startFeeding();
  void stopFeeding();
private:
  enum State { IDLE, FEEDING, DISPENSE, RETURNING };
  State state = IDLE;
  HX711Manager hx711;
  UltrasonicManager feedLevel;
  ServoManager gateServo;
  ServoManager plateServo;
  unsigned long stateStart = 0;
};
