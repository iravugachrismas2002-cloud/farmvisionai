#pragma once

#include "system_diagnostics.h"
#include <WiFi.h>

SystemDiagnostics::SystemDiagnostics() : startMillis(0), errorCount(0) {}

void SystemDiagnostics::begin() {
  startMillis = millis();
  errorCount = 0;
}

void SystemDiagnostics::update() {
}

float SystemDiagnostics::getUptimeHours() {
  unsigned long uptimeMs = millis() - startMillis;
  return uptimeMs / 3600000.0;
}

int SystemDiagnostics::getWifiRSSI() {
  if (WiFi.status() == WL_CONNECTED) {
    return WiFi.RSSI();
  }
  return 0;
}

bool SystemDiagnostics::hasErrors() {
  return errorCount > 0;
}

String SystemDiagnostics::getErrorSummary() {
  String summary = "Errors: ";
  summary += String(errorCount);
  return summary;
}
