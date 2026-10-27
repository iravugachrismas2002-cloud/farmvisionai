#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\communication\\gsm_manager.cpp"
#pragma once

#include "gsm_manager.h"
#include <HardwareSerial.h>
#include "../config/pins.h"

GSMManager::GSMManager() : ready(false), lastError(0) {}

void GSMManager::begin() {
  Serial2.begin(9600, SERIAL_8N1, GSM_RX, GSM_TX);
  delay(1000);
  ready = true;
}

void GSMManager::sendSMS(const char* number, const char* message) {
  if (!ready) {
    return;
  }

  String cmd = "AT+CMGS=\"";
  cmd += String(number);
  cmd += "\"\r\n";

  Serial2.print(cmd);
  delay(500);
  Serial2.print(message);
  delay(100);
  Serial2.write(26);
}

bool GSMManager::isReady() {
  if (!ready) {
    return false;
  }

  Serial2.println("AT");
  delay(500);

  if (Serial2.find("OK")) {
    return true;
  }

  return false;
}
