#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\smart-feeder.ino"
#pragma once

#include "Arduino.h"
#include <cstdio>
#include "src/config/pins.h"
#include "src/config/settings.h"
#include "src/config/schedules.h"
#include "src/sensors/hx711_manager.h"
#include "src/sensors/ultrasonic_manager.h"
#include "src/sensors/dht_manager.h"
#include "src/actuators/servo_manager.h"
#include "src/actuators/relay_manager.h"
#include "src/actuators/buzzer_manager.h"
#include "src/control/feeder_controller.h"
#include "src/control/watering_controller.h"
#include "src/control/climate_controller.h"
#include "src/control/safety_controller.h"
#include "src/communication/wifi_manager.h"
#include "src/communication/gsm_manager.h"
#include "src/communication/api_client.h"
#include "src/display/lcd_manager.h"
#include "src/time/rtc_manager.h"
#include "src/diagnostics/system_diagnostics.h"

HX711Manager hx711;
UltrasonicManager feedLevel;
UltrasonicManager waterLevel;
DHTManager dht;
ServoManager gateServo;
ServoManager plateServo;
RelayManager fanRelay;
RelayManager lampRelay;
RelayManager pumpRelay;
BuzzerManager buzzer;
FeederController feeder;
WateringController watering;
ClimateController climate;
SafetyController safety;
WiFiManager wifi;
GSMManager gsm;
APIClient api;
LCDManager lcd;
RTCManager rtc;
SystemDiagnostics diagnostics;

#line 46 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\smart-feeder.ino"
void setup();
#line 91 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\smart-feeder.ino"
void loop();
#line 46 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\smart-feeder.ino"
void setup() {
  Serial.begin(115200);
  delay(1000);

  lcd.begin();
  lcd.printLine(0, "FarmVision Smart Feeder");
  lcd.printLine(1, "Booting...");

  rtc.begin();

  wifi.begin("FarmVision_AP", "FarmVision_Pass");

  hx711.begin();
  hx711.tare();
  feedLevel.begin(TRIG_FEED, ECHO_FEED);
  waterLevel.begin(TRIG_WATER, ECHO_WATER);
  dht.begin();

  gateServo.begin(SERVO_FEED_GATE);
  plateServo.begin(SERVO_PLATE);
  gateServo.close();
  plateServo.close();

  fanRelay.begin(FAN_RELAY, true);
  lampRelay.begin(LAMP_RELAY, true);
  pumpRelay.begin(PUMP_RELAY, true);

  buzzer.begin();

  feeder.begin();
  watering.begin();
  climate.begin();
  safety.begin();
  gsm.begin();
  api.begin(Settings::CLOUD_API_HOST, Settings::CLOUD_API_PORT, Settings::DEVICE_ID, Settings::DEVICE_TOKEN);

  diagnostics.begin();

  buzzer.beep(200);

  lcd.clear();
  lcd.printLine(0, "System Ready");
  lcd.printLine(1, "Local mode active");
}

void loop() {
  safety.check();

  if (!safety.isSafe()) {
    pumpRelay.off();
    fanRelay.off();
    lampRelay.off();
    lcd.clear();
    lcd.printLine(0, "SAFETY STOP");
    lcd.printLine(1, "Check system");
    buzzer.alarm();
    delay(1000);
    return;
  }

  feeder.update();
  watering.update();
  climate.update();

  diagnostics.update();

  static unsigned long lastSensorRead = 0;
  static unsigned long lastCloudSync = 0;
  static unsigned long lastWifiCheck = 0;
  static int displayState = 0;

  unsigned long now = millis();

  if (now - lastSensorRead > Settings::SENSOR_READ_INTERVAL_MS) {
    lastSensorRead = now;

    float weight = hx711.readWeight();
    float feedDist = feedLevel.readDistanceCm();
    float waterDist = waterLevel.readDistanceCm();
    float temp = dht.readTemperature();
    float humidity = dht.readHumidity();

    float feedLevelPct = 0.0;
    if (!isnan(feedDist)) {
      if (feedDist <= FEED_MIN_DISTANCE_CM) {
        feedLevelPct = 100.0;
      } else if (feedDist >= FEED_MAX_DISTANCE_CM) {
        feedLevelPct = 0.0;
      } else {
        feedLevelPct = ((FEED_MAX_DISTANCE_CM - feedDist) / (FEED_MAX_DISTANCE_CM - FEED_MIN_DISTANCE_CM)) * 100.0;
      }
    }

    lcd.clear();

    if (displayState == 0) {
      char line0[17];
      char line1[17];
      snprintf(line0, sizeof(line0), "T:%.1fC H:%.1f%%", temp, humidity);
      snprintf(line1, sizeof(line1), "W:%.1fkg", weight);
      lcd.printLine(0, line0);
      lcd.printLine(1, line1);
    } else if (displayState == 1) {
      char line0[17];
      char line1[17];
      snprintf(line0, sizeof(line0), "Feed:%.0f%%", feedLevelPct);
      snprintf(line1, sizeof(line1), "Water:%.0fcm", waterDist);
      lcd.printLine(0, line0);
      lcd.printLine(1, line1);
    } else {
      struct tm local = rtc.getLocalTime();
      char line0[17];
      char line1[17];
      snprintf(line0, sizeof(line0), "%02d:%02d:%02d", local.tm_hour, local.tm_min, local.tm_sec);
      snprintf(line1, sizeof(line1), "Up:%.1fh", diagnostics.getUptimeHours());
      lcd.printLine(0, line0);
      lcd.printLine(1, line1);
    }

    displayState = (displayState + 1) % 3;
  }

  if (now - lastCloudSync > Settings::CLOUD_RETRY_INTERVAL_MS) {
    lastCloudSync = now;

    if (wifi.isConnected()) {
      rtc.syncFromNTP();

      float weight = hx711.readWeight();
      float temp = dht.readTemperature();
      float humidity = dht.readHumidity();

      char payload[256];
      snprintf(payload, sizeof(payload),
        "{\"weight\":%.2f,\"temp\":%.1f,\"humidity\":%.1f}",
        weight, temp, humidity);

      if (api.sendTelemetry(Settings::CLOUD_API_PATH, payload)) {
        char statusPayload[48];
        snprintf(statusPayload, sizeof(statusPayload), "{\"status\":\"online\"}");
        api.sendStatus(Settings::CLOUD_STATUS_PATH, statusPayload);
      }
    }
  }

  if (now - lastWifiCheck > Settings::WIFI_RECONNECT_INTERVAL_MS) {
    lastWifiCheck = now;
    wifi.reconnect();
  }

  delay(100);
}

