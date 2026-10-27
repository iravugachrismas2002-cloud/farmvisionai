#pragma once

#include "climate_controller.h"
#include "../config/settings.h"

ClimateController::ClimateController() {}

void ClimateController::begin() {
  dht.begin();
  fanRelay.begin(FAN_RELAY, true);
  lampRelay.begin(LAMP_RELAY, true);
  fanRelay.off();
  lampRelay.off();
}

void ClimateController::update() {
  float temp = dht.readTemperature();

  if (isnan(temp)) {
    return;
  }

  applyHysteresis(temp);
}

void ClimateController::applyHysteresis(float temp) {
  if (isnan(temp)) {
    return;
  }

  if (temp >= 30.0) {
    fanRelay.on();
  } else if (temp <= 28.0) {
    fanRelay.off();
  }

  if (temp <= 18.0) {
    lampRelay.on();
  } else if (temp >= 20.0) {
    lampRelay.off();
  }
}
