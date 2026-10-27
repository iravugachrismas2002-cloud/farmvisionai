#pragma once

#include "relay_manager.h"

RelayManager::RelayManager() : pin(0), activeLow(true), state(false) {}

void RelayManager::begin(int p, bool activeLow_) {
  pin = p;
  activeLow = activeLow_;
  pinMode(pin, OUTPUT);

  if (activeLow) {
    digitalWrite(pin, HIGH);
    state = false;
  } else {
    digitalWrite(pin, LOW);
    state = false;
  }
}

void RelayManager::on() {
  if (activeLow) {
    digitalWrite(pin, LOW);
  } else {
    digitalWrite(pin, HIGH);
  }
  state = true;
}

void RelayManager::off() {
  if (activeLow) {
    digitalWrite(pin, HIGH);
  } else {
    digitalWrite(pin, LOW);
  }
  state = false;
}

bool RelayManager::isOn() {
  return state;
}
