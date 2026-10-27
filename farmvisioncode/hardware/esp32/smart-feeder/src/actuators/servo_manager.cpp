#pragma once

#include "servo_manager.h"
#include <ESP32Servo.h>

ServoManager::ServoManager() : pin(0), openAngle(90), closeAngle(0) {}

void ServoManager::begin(int p) {
  pin = p;
}

void ServoManager::open() {
  Servo servo;
  servo.attach(pin);
  servo.write(openAngle);
  delay(500);
  servo.detach();
}

void ServoManager::close() {
  Servo servo;
  servo.attach(pin);
  servo.write(closeAngle);
  delay(500);
  servo.detach();
}

void ServoManager::setCalibration(int open, int close) {
  openAngle = open;
  closeAngle = close;
}
