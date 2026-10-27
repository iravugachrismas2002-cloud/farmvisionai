#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\control\\climate_controller.h"
#pragma once

#include "Arduino.h"
#include "../config/pins.h"
#include "../sensors/dht_manager.h"
#include "../actuators/relay_manager.h"

class ClimateController {
public:
  ClimateController();
  void begin();
  void update();
private:
  DHTManager dht;
  RelayManager fanRelay;
  RelayManager lampRelay;
  void applyHysteresis(float temp);
};
