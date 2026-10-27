#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\time\\rtc_manager.cpp"
#pragma once

#include "rtc_manager.h"
#include <RTClib.h>
#include <WiFi.h>

static RTC_DS3231 rtc;

bool RTCManager::valid = false;

void RTCManager::begin() {
  if (!rtc.begin()) {
    valid = false;
    return;
  }

  if (rtc.lostPower()) {
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));
  }

  valid = true;
}

void RTCManager::syncFromNTP() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  configTime(TIMEZONE_OFFSET * 3600, 0, "pool.ntp.org", "time.nist.gov");
  struct tm timeinfo;
  // Qualify with :: so this resolves to the Arduino global helper rather
  // than this class's own getLocalTime() member.
  if (::getLocalTime(&timeinfo, 5000)) {
    rtc.adjust(DateTime(
      timeinfo.tm_year + 1900,
      timeinfo.tm_mon + 1,
      timeinfo.tm_mday,
      timeinfo.tm_hour,
      timeinfo.tm_min,
      timeinfo.tm_sec
    ));
  }
}

struct tm RTCManager::getLocalTime() {
  struct tm result;
  memset(&result, 0, sizeof(result));

  if (!valid) {
    return result;
  }

  DateTime now = rtc.now();
  result.tm_year = now.year() - 1900;
  result.tm_mon = now.month() - 1;
  result.tm_mday = now.day();
  result.tm_hour = now.hour();
  result.tm_min = now.minute();
  result.tm_sec = now.second();

  return result;
}

String RTCManager::getLocalTimeIso8601() {
  struct tm local = getLocalTime();
  int offsetMinutes = TIMEZONE_OFFSET * 60;
  char sign = offsetMinutes >= 0 ? '+' : '-';
  if (offsetMinutes < 0) {
    offsetMinutes = -offsetMinutes;
  }
  char buf[40];
  snprintf(buf, sizeof(buf), "%04d-%02d-%02dT%02d:%02d:%02d%c%02d:%02d",
           local.tm_year + 1900,
           local.tm_mon + 1,
           local.tm_mday,
           local.tm_hour,
           local.tm_min,
           local.tm_sec,
           sign,
           offsetMinutes / 60,
           offsetMinutes % 60);
  return String(buf);
}

void RTCManager::setTime(struct tm* time) {
  if (!valid || time == nullptr) {
    return;
  }

  rtc.adjust(DateTime(
    time->tm_year + 1900,
    time->tm_mon + 1,
    time->tm_mday,
    time->tm_hour,
    time->tm_min,
    time->tm_sec
  ));
}
