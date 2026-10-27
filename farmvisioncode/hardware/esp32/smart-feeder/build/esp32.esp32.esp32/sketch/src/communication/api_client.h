#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\communication\\api_client.h"
#pragma once

#include "Arduino.h"
#include <WiFiClientSecure.h>

// One telemetry observation. Use NAN for a sensor that did not produce a
// valid reading; those fields are omitted from the payload.
struct TelemetrySample {
  float temperatureC = NAN;
  float humidityPercent = NAN;
  float feedLevelPercent = NAN;
  float waterLevelPercent = NAN;
  float feedWeightGrams = NAN;
};

class APIClient {
public:
  APIClient();
  void begin(const char* host, int port, const char* deviceId, const char* deviceToken);
  bool sendTelemetry(const char* endpoint, const char* payload);
  bool sendStatus(const char* endpoint, const char* payload);
  bool sendAlert(const char* endpoint, const char* payload);
  bool isProvisioned() const;
  // Builds a body matching the backend telemetry schema:
  // schemaVersion, deviceId, messageId, timestamp and the sensor fields.
  // NaN sample values are omitted so the payload never carries a bogus
  // reading; the backend requires at least one sensor value.
  String buildTelemetryPayload(const TelemetrySample& sample, const char* isoTimestamp);
private:
  // Unique-per-message id used by the backend for retry de-duplication.
  String buildMessageId() const;
  String host;
  int port;
  String deviceId;
  String deviceToken;
  WiFiClientSecure client;
};
