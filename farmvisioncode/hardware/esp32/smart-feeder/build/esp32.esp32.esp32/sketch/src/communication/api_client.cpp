#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\communication\\api_client.cpp"
#pragma once

#include "api_client.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

APIClient::APIClient() : host(""), port(443), deviceId(""), deviceToken("") {}

void APIClient::begin(const char* host_, int port_, const char* deviceId_, const char* deviceToken_) {
  host = String(host_);
  port = port_;
  deviceId = String(deviceId_);
  deviceToken = String(deviceToken_);
}

bool APIClient::isProvisioned() const {
  return host.length() > 0
      && host.indexOf("example.com") == -1
      && deviceId.length() > 0
      && deviceId.indexOf("REPLACE_WITH") == -1
      && deviceToken.length() > 0
      && deviceToken.indexOf("REPLACE_WITH") == -1;
}

String APIClient::buildMessageId() const {
  // The backend de-duplicates on (deviceId, messageId), so the id only has
  // to be unique per device. Combine the millisecond clock with a counter so
  // two sends inside the same millisecond cannot collide.
  static uint32_t counter = 0;
  counter++;
  return "fv-" + String((uint32_t)millis(), 10) + "-" + String(counter, 10);
}

String APIClient::buildTelemetryPayload(const TelemetrySample& sample, const char* isoTimestamp) {
  // The backend rejects unknown keys, so each sensor field is only emitted
  // when the sensor actually produced a usable value.
  String body = "{\"schemaVersion\":1";
  body += ",\"deviceId\":\"" + deviceId + "\"";
  body += ",\"messageId\":\"" + buildMessageId() + "\"";
  body += ",\"timestamp\":\"" + String(isoTimestamp) + "\"";

  bool any = false;

  if (!isnan(sample.temperatureC)) {
    body += ",\"temperatureC\":" + String(sample.temperatureC, 1);
    any = true;
  }
  if (!isnan(sample.humidityPercent)) {
    body += ",\"humidityPercent\":" + String(sample.humidityPercent, 1);
    any = true;
  }
  if (!isnan(sample.feedLevelPercent)) {
    body += ",\"feedLevelPercent\":" + String(sample.feedLevelPercent, 1);
    any = true;
  }
  if (!isnan(sample.waterLevelPercent)) {
    body += ",\"waterLevelPercent\":" + String(sample.waterLevelPercent, 1);
    any = true;
  }
  if (!isnan(sample.feedWeightGrams)) {
    body += ",\"feedWeightGrams\":" + String(sample.feedWeightGrams, 1);
    any = true;
  }

  body += "}";

  if (!any) {
    return String("");
  }

  return body;
}

bool APIClient::sendTelemetry(const char* endpoint, const char* payload) {
  if (WiFi.status() != WL_CONNECTED || !isProvisioned()) {
    return false;
  }

  WiFiClientSecure client;
  // TODO: replace setInsecure() with a pinned CA certificate for production.
  client.setInsecure();

  HTTPClient https;
  String url = "https://" + host + ":" + String(port) + String(endpoint);

  if (!https.begin(client, url)) {
    return false;
  }

  https.addHeader("Content-Type", "application/json");
  // The backend authenticates devices with a bearer token, not a custom header.
  https.addHeader("Authorization", "Bearer " + deviceToken);

  int httpCode = https.POST(String(payload));

  bool ok = (httpCode >= 200 && httpCode < 300);
  https.end();
  return ok;
}

bool APIClient::sendStatus(const char* endpoint, const char* payload) {
  return sendTelemetry(endpoint, payload);
}

bool APIClient::sendAlert(const char* endpoint, const char* payload) {
  return sendTelemetry(endpoint, payload);
}
