#pragma once

#include "dht_manager.h"
#include <DHT.h>

static DHT dht(DHT_PIN, DHT22);

DHTManager::DHTManager() : lastTemp(NAN), lastHumidity(NAN) {}

void DHTManager::begin() {
  dht.begin();
}

float DHTManager::readTemperature() {
  float temp = dht.readTemperature();

  if (isnan(temp) || isinf(temp)) {
    lastTemp = NAN;
    return NAN;
  }

  lastTemp = temp;
  return temp;
}

float DHTManager::readHumidity() {
  float humidity = dht.readHumidity();

  if (isnan(humidity) || isinf(humidity)) {
    lastHumidity = NAN;
    return NAN;
  }

  lastHumidity = humidity;
  return humidity;
}

bool DHTManager::isValid() {
  return !isnan(lastTemp) && !isnan(lastHumidity);
}
