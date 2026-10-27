#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\communication\\wifi_manager.cpp"
#pragma once

#include "wifi_manager.h"
#include <WiFi.h>
#include "../config/settings.h"

WiFiManager::WiFiManager() : ssid(""), password(""), lastReconnect(0) {}

void WiFiManager::begin(const char* ssid_, const char* password_) {
  ssid = String(ssid_);
  password = String(password_);
  WiFi.begin(ssid.c_str(), password.c_str());
  lastReconnect = millis();
}

void WiFiManager::reconnect() {
  unsigned long now = millis();
  if (now - lastReconnect < Settings::WIFI_RECONNECT_INTERVAL_MS) {
    return;
  }
  lastReconnect = now;

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.disconnect();
    WiFi.begin(ssid.c_str(), password.c_str());
  }
}

bool WiFiManager::isConnected() {
  return WiFi.status() == WL_CONNECTED;
}

String WiFiManager::getIP() {
  if (isConnected()) {
    return WiFi.localIP().toString();
  }
  return String("");
}
