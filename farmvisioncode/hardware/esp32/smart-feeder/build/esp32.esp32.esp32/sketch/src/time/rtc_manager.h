#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\time\\rtc_manager.h"
#pragma once

#include "Arduino.h"
#include "../config/pins.h"

class RTCManager {
public:
  void begin();
  void syncFromNTP();
  struct tm getLocalTime();
  void setTime(struct tm* time);
  // ISO-8601 with an explicit UTC offset, e.g. "2026-10-21T09:30:00+02:00".
  // The backend telemetry schema requires a timestamp with an offset.
  String getLocalTimeIso8601();
private:
  // Shared across instances: the DS3231 is a single bus device, so the
  // "clock is usable" flag must not be per-instance.
  static bool valid;
};
