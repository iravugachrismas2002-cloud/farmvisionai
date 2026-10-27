#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\sensors\\hx711_manager.cpp"
#pragma once

#ifndef HX711_CAL_FACTOR
#define HX711_CAL_FACTOR 220470.0
#endif
#include "hx711_manager.h"
#include <HX711.h>
#include "../config/settings.h"

static HX711 scale;
static bool hx711Ready = false;

void HX711Manager::begin() {
  scale.begin(HX711_DT, HX711_SCK);
  hx711Ready = scale.is_ready();
}

float HX711Manager::readWeight() {
  if (!hx711Ready) {
    return NAN;
  }

  if (scale.wait_ready_timeout(200)) {
    long raw = scale.read();
    float weight = raw / calibration;

    if (isnan(weight) || isinf(weight)) {
      return NAN;
    }

    if (weight < -Settings::HX711_TARE_THRESHOLD || weight > 100.0) {
      return NAN;
    }

    return weight;
  }

  return NAN;
}

void HX711Manager::tare() {
  if (hx711Ready && scale.wait_ready_timeout(200)) {
    scale.tare();
  }
}

void HX711Manager::setCalibration(float factor) {
  calibration = factor;
}
