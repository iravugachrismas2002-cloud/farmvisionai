#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\actuators\\buzzer_manager.cpp"
#pragma once

#include "buzzer_manager.h"

BuzzerManager::BuzzerManager() : active(false) {}

void BuzzerManager::begin() {
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
}

void BuzzerManager::beep(int durationMs) {
  active = true;
  digitalWrite(BUZZER_PIN, HIGH);
  delay(durationMs);
  digitalWrite(BUZZER_PIN, LOW);
  active = false;
}

void BuzzerManager::alarm() {
  for (int i = 0; i < 3; i++) {
    beep(200);
    delay(100);
  }
}
