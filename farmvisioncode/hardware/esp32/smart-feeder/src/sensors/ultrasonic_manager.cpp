#pragma once

#include "ultrasonic_manager.h"

UltrasonicManager::UltrasonicManager() : trigPin(0), echoPin(0) {}

void UltrasonicManager::begin(int trig, int echo) {
  trigPin = trig;
  echoPin = echo;
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  digitalWrite(trigPin, LOW);
}

float UltrasonicManager::readDistanceCm() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);

  if (duration == 0) {
    return NAN;
  }

  float distance = duration * 0.0343 / 2.0;

  if (isnan(distance) || isinf(distance)) {
    return NAN;
  }

  if (distance < 0.0 || distance > 400.0) {
    return NAN;
  }

  return distance;
}

bool UltrasonicManager::isValid() {
  float dist = readDistanceCm();
  return !isnan(dist);
}
