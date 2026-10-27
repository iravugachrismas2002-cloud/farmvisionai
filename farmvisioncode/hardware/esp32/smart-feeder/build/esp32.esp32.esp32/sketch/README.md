#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\README.md"
#pragma once

# FarmVision Smart Feeder

Reference ESP32 firmware for the FarmVision AI Smart Feeder.

## Structure
- `config/` â€” pins, settings, schedules
- `sensors/` â€” HX711, ultrasonic, DHT22 managers
- `actuators/` â€” servo, relay, buzzer managers
- `control/` â€” feeder, watering, climate, safety controllers
- `communication/` â€” GSM, Wi-Fi, API client
- `display/` â€” LCD manager
- `time/` â€” RTC manager
- `diagnostics/` â€” system diagnostics

## Requirements
- ESP32 dev board
- Arduino IDE / PlatformIO
- Libraries: WiFi, HTTPClient, ArduinoJson, Preferences

## Safety
- ESP32 is the master controller
- Local operation must remain possible without cloud
- Validate all sensor readings before acting
