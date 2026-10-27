#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\communication\\wifi_manager.h"
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
