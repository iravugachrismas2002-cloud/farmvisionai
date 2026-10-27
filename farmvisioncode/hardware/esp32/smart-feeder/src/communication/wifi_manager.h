#pragma once

#include "Arduino.h"

class WiFiManager {
public:
  WiFiManager();
  void begin(const char* ssid, const char* password);
  void reconnect();
  bool isConnected();
  String getIP();
private:
  String ssid;
  String password;
  unsigned long lastReconnect = 0;
};
