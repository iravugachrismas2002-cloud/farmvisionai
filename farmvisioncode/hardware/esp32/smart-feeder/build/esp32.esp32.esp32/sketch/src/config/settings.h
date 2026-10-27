#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\config\\settings.h"
#pragma once

namespace Settings {
  const float FEED_TARGET_KG = 0.5;
  const int DISPENSE_TIME_MS = 3000;
  const int MAX_PUMP_RUNTIME_MS = 60000;
  const int PUMP_INTERVAL_MS = 3600000;
  const int SENSOR_READ_INTERVAL_MS = 5000;
  const int WIFI_RECONNECT_INTERVAL_MS = 30000;
  const int CLOUD_RETRY_INTERVAL_MS = 60000;
  const float DEFAULT_HX711_CAL_FACTOR = 220470.0;
  const float HX711_TARE_THRESHOLD = 10.0;
  const int FEED_TIMEOUT_MS = 120000;
  const int GSM_RETRY_DELAY_MS = 5000;
  const int WIFI_CONNECT_TIMEOUT_MS = 20000;

  // `inline constexpr` (not bare `const char*`) so these have a single
  // definition shared by every translation unit. A bare `const char*` has
  // external linkage in C++ and causes multiple-definition link errors.
  inline constexpr const char* CLOUD_API_HOST = "farmvision-ai.example.com";
  const int CLOUD_API_PORT = 443;
  inline constexpr const char* CLOUD_API_PATH = "/api/telemetry";
  inline constexpr const char* CLOUD_STATUS_PATH = "/api/status";

  // Device identity + provisioning. DEVICE_ID must be the public id returned
  // by the backend when this device was registered (POST /api/devices) and
  // DEVICE_TOKEN the one-time bearer token from the same response.
  // The device id must match /^fv_[A-Za-z0-9_-]+$/.
  // Never commit a real token to Git.
  inline constexpr const char* DEVICE_ID = "fv_REPLACE_WITH_REGISTERED_DEVICE_ID";
  inline constexpr const char* DEVICE_TOKEN = "REPLACE_WITH_REGISTERED_DEVICE_API_KEY";
}
