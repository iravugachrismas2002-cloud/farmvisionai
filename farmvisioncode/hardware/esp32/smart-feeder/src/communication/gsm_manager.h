#pragma once

#include "Arduino.h"

class GSMManager {
public:
  GSMManager();
  void begin();
  void sendSMS(const char* number, const char* message);
  bool isReady();
private:
  bool ready = false;
  int lastError = 0;
};
