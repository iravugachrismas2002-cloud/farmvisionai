#pragma once

#include "feeder_controller.h"
#include "../config/settings.h"
#include "../config/schedules.h"
#include "../time/rtc_manager.h"

FeederController::FeederController() : state(IDLE), stateStart(0) {}

void FeederController::begin() {
  hx711.begin();
  hx711.tare();
  feedLevel.begin(TRIG_FEED, ECHO_FEED);
  gateServo.begin(SERVO_FEED_GATE);
  plateServo.begin(SERVO_PLATE);
  gateServo.close();
  plateServo.close();
  state = IDLE;
}

void FeederController::update() {
  unsigned long now = millis();

  if (state == IDLE) {
    RTCManager rtc;
    struct tm local = rtc.getLocalTime();

    int currentHour = local.tm_hour;
    int currentMinute = local.tm_min;

    for (int i = 0; i < Schedule::FEEDING_COUNT; i++) {
      if (currentHour == Schedule::FEEDING_HOURS[i] &&
          currentMinute == Schedule::FEEDING_MINUTES[i]) {
        startFeeding();
        break;
      }
    }

    return;
  }

  if (state == FEEDING) {
    if (now - stateStart > 2000) {
      gateServo.open();
      state = DISPENSE;
      stateStart = now;
    }
    return;
  }

  if (state == DISPENSE) {
    float weight = hx711.readWeight();

    if (!isnan(weight) && weight >= Settings::FEED_TARGET_KG) {
      gateServo.close();
      state = RETURNING;
      stateStart = now;
    }

    if (now - stateStart > Settings::DISPENSE_TIME_MS) {
      gateServo.close();
      state = RETURNING;
      stateStart = now;
    }

    return;
  }

  if (state == RETURNING) {
    if (now - stateStart > 3000) {
      plateServo.open();
      delay(500);
      plateServo.close();
      state = IDLE;
    }
    return;
  }
}

void FeederController::startFeeding() {
  if (state != IDLE) {
    return;
  }
  state = FEEDING;
  stateStart = millis();
}

void FeederController::stopFeeding() {
  gateServo.close();
  plateServo.close();
  state = IDLE;
}
