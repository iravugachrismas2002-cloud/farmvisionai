#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\control\\watering_controller.cpp"
#pragma once

#include "watering_controller.h"
#include "../config/settings.h"
#include "../config/schedules.h"
#include "../config/pins.h"
#include "../time/rtc_manager.h"

WateringController::WateringController() : state(IDLE), stateStart(0) {}

void WateringController::begin() {
  waterLevel.begin(TRIG_WATER, ECHO_WATER);
  pumpRelay.begin(PUMP_RELAY, true);
  state = IDLE;
}

void WateringController::update() {
  unsigned long now = millis();

  if (state == IDLE) {
    RTCManager rtc;
    struct tm local = rtc.getLocalTime();

    int currentHour = local.tm_hour;
    int currentMinute = local.tm_min;

    for (int i = 0; i < Schedule::WATERING_COUNT; i++) {
      if (currentHour == Schedule::WATERING_HOURS[i] &&
          currentMinute == Schedule::WATERING_MINUTES[i]) {
        startWatering();
        break;
      }
    }

    return;
  }

  if (state == WATERING) {
    if (now - stateStart > Settings::MAX_PUMP_RUNTIME_MS) {
      stopWatering();
      return;
    }

    float distance = waterLevel.readDistanceCm();

    if (isnan(distance)) {
      stopWatering();
      return;
    }

    if (distance < FEED_MIN_DISTANCE_CM) {
      stopWatering();
      return;
    }

    return;
  }

  if (state == PAUSED) {
    if (now - stateStart > Settings::PUMP_INTERVAL_MS) {
      state = WATERING;
      stateStart = now;
      pumpRelay.on();
    }
    return;
  }
}

void WateringController::startWatering() {
  if (state != IDLE) {
    return;
  }

  float distance = waterLevel.readDistanceCm();

  if (isnan(distance)) {
    return;
  }

  state = WATERING;
  stateStart = millis();
  pumpRelay.on();
}

void WateringController::stopWatering() {
  pumpRelay.off();
  state = PAUSED;
  stateStart = millis();
}

float WateringController::calculateVolume(float distanceCm) {
  float heightCm = TANK_MAX_HEIGHT_CM - distanceCm;

  if (heightCm < 0.0) {
    heightCm = 0.0;
  }

  if (heightCm > TANK_MAX_HEIGHT_CM) {
    heightCm = TANK_MAX_HEIGHT_CM;
  }

  float volumeCm3 = PI * TANK_RADIUS_CM * TANK_RADIUS_CM * heightCm;
  float volumeLitres = volumeCm3 / 1000.0;

  return volumeLitres;
}
