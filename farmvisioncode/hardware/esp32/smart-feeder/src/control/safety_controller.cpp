#pragma once

#include "safety_controller.h"
#include "../sensors/hx711_manager.h"
#include "../sensors/ultrasonic_manager.h"
#include "../sensors/dht_manager.h"

SafetyController::SafetyController() : safe(true), lastCheck(0) {}

void SafetyController::begin() {
  safe = true;
  lastCheck = millis();
}

void SafetyController::check() {
  unsigned long now = millis();
  if (now - lastCheck < 1000) {
    return;
  }
  lastCheck = now;

  safe = true;

  if (!isnan(dht.readTemperature()) && dht.readTemperature() > 50.0) {
    safe = false;
  }
}

bool SafetyController::isSafe() {
  return safe;
}

void SafetyController::emergencyStop() {
  safe = false;
}
