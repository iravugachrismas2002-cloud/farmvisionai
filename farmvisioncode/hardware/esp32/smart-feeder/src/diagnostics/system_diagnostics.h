#pragma once

#include "Arduino.h"

class SystemDiagnostics {
public:
  SystemDiagnostics();
  void begin();
  void update();
  float getUptimeHours();
  int getWifiRSSI();
  bool hasErrors();
  String getErrorSummary();
private:
  unsigned long startMillis = 0;
  int errorCount = 0;
};
