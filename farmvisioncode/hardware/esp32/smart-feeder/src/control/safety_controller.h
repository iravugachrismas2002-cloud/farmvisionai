#pragma once

#include "Arduino.h"
#include "../sensors/dht_manager.h"

class SafetyController {
public:
  SafetyController();
  void begin();
  void check();
  bool isSafe();
  void emergencyStop();
private:
  bool safe = true;
  unsigned long lastCheck = 0;
  DHTManager dht;
};
