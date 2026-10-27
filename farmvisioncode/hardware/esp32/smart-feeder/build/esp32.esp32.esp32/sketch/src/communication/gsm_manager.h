#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\communication\\gsm_manager.h"
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
