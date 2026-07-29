#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <RTClib.h>
#include "HX711.h"
#include <ESP32Servo.h>
#include <DHT.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ================= PINS =================
#define SDA 21
#define SCL 22

// Servos
#define SERVO1_PIN 19   // GATE
#define SERVO2_PIN 18   // PLATE

// Sensors & Actuators
#define BUZZER 25
#define HX_DT 32        // HX711 DOUT pin
#define HX_SCK 33       // HX711 SCK pin

// Ultrasonic 1 - Feed Tank Level
#define TRIG_FEED 4
#define ECHO_FEED 35

// Ultrasonic 2 - Water Tank Level
#define TRIG_WATER 5
#define ECHO_WATER 26

// DHT
#define DHT_PIN 14
#define DHT_TYPE DHT22

// Relays
#define FAN_RELAY 13
#define LAMP_RELAY 27
#define PUMP_RELAY 23

// GSM
#define GSM_RX 16
#define GSM_TX 17

// ================= SETTINGS =================
#define TIMEZONE_OFFSET 0  // Rwanda = +2
#define FEEDING_WINDOW_DURATION_MIN 5
#define WATERING_WINDOW_DURATION_MIN 5
#define FEED_INTERVAL_SEC 20
#define TARGET_WEIGHT 0.5
#define MAX_FEED_TIME 15
#define DISPENSE_TIME 3000
#define RETURN_TIME 3000
#define FEED_EMPTY_LEVEL_CM 20
#define FEED_LOW_LEVEL_CM 10
#define WATER_EMPTY_LEVEL_CM 15
#define WATER_LOW_LEVEL_CM 8
#define PUMP_INTERVAL_SEC 30
#define DROP_CM_TARGET 0.5
#define MAX_RUN_TIME_MS 15000
#define TEMP_HIGH 30
#define TEMP_LOW 18
#define ULTRASONIC_FAIL_LIMIT 5
#define SERVO_OPEN 90
#define SERVO_CLOSE 0
#define HX711_CAL_FACTOR 220470.0

// ================= SCHEDULES =================
const int FEEDING_SCHEDULE[4][2] = {
  {10, 58},
  {13, 30},
  {18, 0},
  {21, 0}
};
const String FEEDING_NAMES[4] = {"Morning Feed", "Afternoon Feed", "Evening Feed", "Night Feed"};

const int WATERING_SCHEDULE[3][2] = {
  {11, 5},
  {11, 0},
  {15, 0}
};
const String WATERING_NAMES[3] = {"Morning Water", "Midday Water", "Afternoon Water"};

// ===== WiFi & Backend Configuration =====
const char* ssid     = "ITGroup";                 // change to your WiFi SSID
const char* password = "1234567890";              // change to your WiFi password
const char* serverUrl = "http://192.168.1.100:3000/api/sensors/receive"; // change IP to your backend IP
const char* apiKey    = "AGROFEEDER_ESP32_API_KEY_9876543210_CHANGE_THIS"; // must match backend .env

unsigned long lastSendTime = 0;
const unsigned long SEND_INTERVAL_MS = 10000; // send every 10 seconds

// ================= OBJECTS =================
LiquidCrystal_I2C lcd(0x27, 20, 4);
RTC_DS3231 rtc;
HX711 scale;
Servo s1, s2;
DHT dht(DHT_PIN, DHT_TYPE);

// ================= STATE MACHINE =================
enum FeederState { IDLE, FEEDING, DISPENSE, RETURNING };
FeederState feederState = IDLE;

// ================= STATE VARIABLES =================
unsigned long lastFeedTime = 0;
unsigned long feedStartTime = 0;
unsigned long actionStart = 0;
float startWeight = 0;
float currentWeight = 0;
long hx711Offset = 0;
bool hxValid = true;

int feedUltraFails = 0;
int waterUltraFails = 0;

bool pumpOn = false;
float startCM = 0;
float totalUsedCM = 0;
unsigned long pumpStartTime = 0;
unsigned long lastPumpTime = 0;

float temperature = 0;
float humidity = 0;
bool fanState = false;
bool lampState = false;

// FIX: these were previously declared only as LOCAL variables inside loop(),
// so sendSensorData() (a separate function) could not see them. They are now
// globals, updated every loop() iteration, and read by sendSensorData().
float feedLevel = -1;
float waterLevel = -1;

bool gsmInitialized = false;

bool feedingWindowActive = false;
bool wateringWindowActive = false;
bool feedingWindowJustOpened = false;
bool wateringWindowJustOpened = false;

// ================= FUNCTION DECLARATIONS =================
float readWeight();
bool checkHX(float w);
float readFeedLevel();
float readWaterLevel();
int getFeedTankState(float cm);
int getWaterTankState(float cm);
DateTime getLocalTime(DateTime utc);
int getFeedingWindowIndex(DateTime nowUTC);
bool isFeedingWindowActive(DateTime now);
int getFeedingWindowRemainingMinutes(DateTime nowUTC);
int getWateringWindowIndex(DateTime nowUTC);
bool isWateringWindowActive(DateTime now);
int getWateringWindowRemainingMinutes(DateTime nowUTC);
void gateOpen();
void gateClose();
void plateOpen();
void plateClose();
void controlRelay(int pin, bool on);
void startPump(float cm);
void stopPump(const char* reason);
void initGSM();
void sendSMSAlert(String message);
void updateDisplay(float feedLevel, float waterLevel, int feedState, int waterState);
void sendSensorData();

// ================= IMPLEMENTATIONS =================
float readWeight() {
  long raw = scale.read();
  float kg = (raw - hx711Offset) / HX711_CAL_FACTOR;
  return kg;
}

bool checkHX(float w) {
  if (isnan(w)) return false;
  if (w < -0.1 || w > 50) return false;
  return true;
}

float readFeedLevel() {
  float sum = 0;
  int count = 0;
  for (int i = 0; i < 5; i++) {
    digitalWrite(TRIG_FEED, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_FEED, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_FEED, LOW);
    long t = pulseIn(ECHO_FEED, HIGH, 30000);
    if (t > 0) {
      sum += t * 0.034 / 2;
      count++;
    }
    delay(10);
  }
  if (count >= 3) {
    feedUltraFails = 0;
    return sum / count;
  }
  feedUltraFails++;
  return -1;
}

float readWaterLevel() {
  float sum = 0;
  int valid = 0;
  for (int i = 0; i < 5; i++) {
    digitalWrite(TRIG_WATER, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_WATER, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_WATER, LOW);
    long t = pulseIn(ECHO_WATER, HIGH, 30000);
    if (t > 0) {
      float cm = t * 0.034 / 2.0;
      sum += cm;
      valid++;
    }
    delay(10);
  }
  if (valid >= 3) {
    waterUltraFails = 0;
    return sum / valid;
  }
  waterUltraFails++;
  return -1;
}

int getFeedTankState(float cm) {
  if (cm < 0) return -1;
  if (cm > FEED_EMPTY_LEVEL_CM) return 0;   // EMPTY
  if (cm > FEED_LOW_LEVEL_CM) return 1;     // LOW
  return 2;                                  // OK
}

int getWaterTankState(float cm) {
  if (cm < 0) return -1;
  if (cm > WATER_EMPTY_LEVEL_CM) return 0;  // EMPTY
  if (cm > WATER_LOW_LEVEL_CM) return 1;    // LOW
  return 2;
}

DateTime getLocalTime(DateTime utc) {
  int localHour = utc.hour() + TIMEZONE_OFFSET;
  int localMin = utc.minute();
  if (localHour >= 24) localHour -= 24;
  else if (localHour < 0) localHour += 24;
  return DateTime(utc.year(), utc.month(), utc.day(), localHour, localMin, utc.second());
}

int getFeedingWindowIndex(DateTime nowUTC) {
  DateTime now = getLocalTime(nowUTC);
  int currentMinutes = now.hour() * 60 + now.minute();
  for (int i = 0; i < 4; i++) {
    int windowStartMin = FEEDING_SCHEDULE[i][0] * 60 + FEEDING_SCHEDULE[i][1];
    int windowEndMin = windowStartMin + FEEDING_WINDOW_DURATION_MIN;
    if (windowEndMin >= 1440) {
      windowEndMin -= 1440;
      if (currentMinutes >= windowStartMin || currentMinutes < windowEndMin) return i;
    } else {
      if (currentMinutes >= windowStartMin && currentMinutes < windowEndMin) return i;
    }
  }
  return -1;
}

bool isFeedingWindowActive(DateTime now) {
  return getFeedingWindowIndex(now) >= 0;
}

int getFeedingWindowRemainingMinutes(DateTime nowUTC) {
  int index = getFeedingWindowIndex(nowUTC);
  if (index < 0) return 0;
  DateTime now = getLocalTime(nowUTC);
  int currentMinutes = now.hour() * 60 + now.minute();
  int windowStartMin = FEEDING_SCHEDULE[index][0] * 60 + FEEDING_SCHEDULE[index][1];
  int windowEndMin = windowStartMin + FEEDING_WINDOW_DURATION_MIN;
  if (windowEndMin >= 1440) {
    windowEndMin -= 1440;
    if (currentMinutes < windowEndMin) currentMinutes += 1440;
  }
  return windowEndMin - currentMinutes;
}

int getWateringWindowIndex(DateTime nowUTC) {
  DateTime now = getLocalTime(nowUTC);
  int currentMinutes = now.hour() * 60 + now.minute();
  for (int i = 0; i < 3; i++) {
    int windowStartMin = WATERING_SCHEDULE[i][0] * 60 + WATERING_SCHEDULE[i][1];
    int windowEndMin = windowStartMin + WATERING_WINDOW_DURATION_MIN;
    if (windowEndMin >= 1440) {
      windowEndMin -= 1440;
      if (currentMinutes >= windowStartMin || currentMinutes < windowEndMin) return i;
    } else {
      if (currentMinutes >= windowStartMin && currentMinutes < windowEndMin) return i;
    }
  }
  return -1;
}

bool isWateringWindowActive(DateTime now) {
  return getWateringWindowIndex(now) >= 0;
}

int getWateringWindowRemainingMinutes(DateTime nowUTC) {
  int index = getWateringWindowIndex(nowUTC);
  if (index < 0) return 0;
  DateTime now = getLocalTime(nowUTC);
  int currentMinutes = now.hour() * 60 + now.minute();
  int windowStartMin = WATERING_SCHEDULE[index][0] * 60 + WATERING_SCHEDULE[index][1];
  int windowEndMin = windowStartMin + WATERING_WINDOW_DURATION_MIN;
  if (windowEndMin >= 1440) {
    windowEndMin -= 1440;
    if (currentMinutes < windowEndMin) currentMinutes += 1440;
  }
  return windowEndMin - currentMinutes;
}

void gateOpen() { s1.write(SERVO_OPEN); }
void gateClose() { s1.write(SERVO_CLOSE); }
void plateOpen() { s2.write(SERVO_OPEN); }
void plateClose() { s2.write(SERVO_CLOSE); }

void controlRelay(int pin, bool on) {
  digitalWrite(pin, on ? LOW : HIGH);
}

void startPump(float cm) {
  pumpOn = true;
  startCM = cm;
  pumpStartTime = millis();
  controlRelay(PUMP_RELAY, true);
  tone(BUZZER, 2000, 100);
  Serial.println("💧 PUMP ON");
  sendSMSAlert("Water pump started");
}

void stopPump(const char* reason) {
  pumpOn = false;
  controlRelay(PUMP_RELAY, false);
  tone(BUZZER, 1000, 200);
  Serial.print("💧 PUMP OFF: ");
  Serial.println(reason);
}

void initGSM() {
  Serial2.begin(9600, SERIAL_8N1, GSM_RX, GSM_TX);
  delay(2000);
  Serial2.println("AT");
  delay(1000);
  Serial2.println("AT+CMGF=1");
  delay(1000);
  gsmInitialized = true;
  Serial.println("GSM Initialized");
}

void sendSMSAlert(String message) {
  if (!gsmInitialized) return;
  Serial2.println("AT+CMGS=\"+250726173472\"");
  delay(1000);
  Serial2.print("FARM ALERT: " + message);
  delay(500);
  Serial2.write((char)26);
  delay(1000);
  Serial.println("SMS Sent: " + message);
}

void updateDisplay(float feedLevel, float waterLevel, int feedState, int waterState) {
  lcd.clear();
  DateTime nowUTC = rtc.now();
  DateTime now = getLocalTime(nowUTC);

  lcd.setCursor(0,0);
  if (now.hour() < 10) lcd.print(" ");
  lcd.print(now.hour());
  lcd.print(":");
  if (now.minute() < 10) lcd.print("0");
  lcd.print(now.minute());
  lcd.print(" ");

  if (feedingWindowActive && wateringWindowActive) {
    lcd.print("F+W ACT");
  } else if (feedingWindowActive) {
    lcd.print("FEED ACT");
    lcd.print(getFeedingWindowRemainingMinutes(nowUTC));
    lcd.print("m");
  } else if (wateringWindowActive) {
    lcd.print("WATER ACT");
    lcd.print(getWateringWindowRemainingMinutes(nowUTC));
    lcd.print("m");
  } else {
    lcd.print("SLEEPING");
  }

  lcd.setCursor(0,1);
  lcd.print("W:");
  lcd.print(currentWeight, 3);
  lcd.print("kg ");
  switch(feederState) {
    case IDLE: lcd.print("IDLE"); break;
    case FEEDING: lcd.print("FEED"); break;
    case DISPENSE: lcd.print("DISP"); break;
    case RETURNING: lcd.print("RET "); break;
  }

  lcd.setCursor(0,2);
  lcd.print("F:");
  lcd.print(feedLevel, 1);
  if (feedState == 0) lcd.print("E");
  else if (feedState == 1) lcd.print("L");
  else lcd.print("K");

  lcd.setCursor(10,2);
  lcd.print("W:");
  lcd.print(waterLevel, 1);
  if (waterState == 0) lcd.print("E");
  else if (waterState == 1) lcd.print("L");
  else lcd.print("K");

  lcd.setCursor(0,3);
  lcd.print("T:");
  lcd.print(temperature, 1);
  lcd.print(" ");
  lcd.print(fanState ? "FAN" : "fan");
  lcd.print(" ");
  lcd.print(lampState ? "LMP" : "lmp");
  lcd.print(" P:");
  lcd.print(pumpOn ? "ON" : "OF");
}

// ===== NEW: Send sensor data to backend =====
void sendSensorData() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi not connected, cannot send data");
    return;
  }

  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-esp32-key", apiKey);

  // Use the global sensor values (they are updated in loop)
  float feed = (feedLevel >= 0) ? feedLevel : 0;
  float water = (waterLevel >= 0) ? waterLevel : 0;

  StaticJsonDocument<256> doc;
  doc["feedLevel"] = feed;
  doc["waterLevel"] = water;
  doc["temperature"] = temperature;
  doc["humidity"] = humidity;
  doc["pumpStatus"] = pumpOn;
  doc["fanStatus"] = fanState;
  doc["lampStatus"] = lampState;
  doc["source"] = "esp32";

  String requestBody;
  serializeJson(doc, requestBody);

  int httpCode = http.POST(requestBody);
  if (httpCode == 200) {
    Serial.println("✅ Data sent to backend");
  } else {
    Serial.printf("❌ HTTP POST error: %d\n", httpCode);
  }
  http.end();
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Wire.begin(SDA, SCL);

  lcd.init();
  lcd.backlight();
  lcd.print("SYSTEM STARTING...");

  if (!rtc.begin()) {
    lcd.clear();
    lcd.print("RTC ERROR!");
    while(1);
  }

  pinMode(TRIG_FEED, OUTPUT);
  pinMode(ECHO_FEED, INPUT);
  pinMode(TRIG_WATER, OUTPUT);
  pinMode(ECHO_WATER, INPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(FAN_RELAY, OUTPUT);
  pinMode(LAMP_RELAY, OUTPUT);
  pinMode(PUMP_RELAY, OUTPUT);

  digitalWrite(FAN_RELAY, HIGH);
  digitalWrite(LAMP_RELAY, HIGH);
  digitalWrite(PUMP_RELAY, HIGH);

  scale.begin(HX_DT, HX_SCK);
  scale.set_scale(HX711_CAL_FACTOR);
  scale.tare();
  hx711Offset = scale.read();

  s1.attach(SERVO1_PIN);
  s2.attach(SERVO2_PIN);
  gateClose();
  plateClose();

  dht.begin();

  initGSM();

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi connected, IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n⚠️ WiFi connection failed – will retry in loop");
  }

  DateTime nowUTC = rtc.now();
  lastFeedTime = nowUTC.unixtime();
  lastPumpTime = nowUTC.unixtime();

  lcd.clear();
  lcd.print("SYSTEM READY");
  tone(BUZZER, 1000, 200);

  // Print schedules (optional)
  DateTime nowLocal = getLocalTime(nowUTC);
  Serial.println("\n========================================");
  Serial.println("   SMART HYBRID AGRO FEEDER");
  Serial.println("   SEPARATE FEEDING & WATERING");
  Serial.println("========================================");
  Serial.print("Local Time: ");
  Serial.print(nowLocal.hour()); Serial.print(":");
  if (nowLocal.minute() < 10) Serial.print("0");
  Serial.println(nowLocal.minute());

  Serial.println("\n🍽️  FEEDING SCHEDULE:");
  for (int i = 0; i < 4; i++) {
    Serial.print("  ");
    Serial.print(FEEDING_NAMES[i]);
    Serial.print(": ");
    if (FEEDING_SCHEDULE[i][0] < 10) Serial.print("0");
    Serial.print(FEEDING_SCHEDULE[i][0]);
    Serial.print(":");
    if (FEEDING_SCHEDULE[i][1] < 10) Serial.print("0");
    Serial.print(FEEDING_SCHEDULE[i][1]);
    Serial.print(" - ");
    int endMin = FEEDING_SCHEDULE[i][0] * 60 + FEEDING_SCHEDULE[i][1] + FEEDING_WINDOW_DURATION_MIN;
    int endH = (endMin / 60) % 24;
    int endM = endMin % 60;
    if (endH < 10) Serial.print("0");
    Serial.print(endH);
    Serial.print(":");
    if (endM < 10) Serial.print("0");
    Serial.print(endM);
    Serial.print(" (");
    Serial.print(FEEDING_WINDOW_DURATION_MIN);
    Serial.println(" min)");
  }

  Serial.println("\n💧 WATERING SCHEDULE:");
  for (int i = 0; i < 3; i++) {
    Serial.print("  ");
    Serial.print(WATERING_NAMES[i]);
    Serial.print(": ");
    if (WATERING_SCHEDULE[i][0] < 10) Serial.print("0");
    Serial.print(WATERING_SCHEDULE[i][0]);
    Serial.print(":");
    if (WATERING_SCHEDULE[i][1] < 10) Serial.print("0");
    Serial.print(WATERING_SCHEDULE[i][1]);
    Serial.print(" - ");
    int endMin = WATERING_SCHEDULE[i][0] * 60 + WATERING_SCHEDULE[i][1] + WATERING_WINDOW_DURATION_MIN;
    int endH = (endMin / 60) % 24;
    int endM = endMin % 60;
    if (endH < 10) Serial.print("0");
    Serial.print(endH);
    Serial.print(":");
    if (endM < 10) Serial.print("0");
    Serial.print(endM);
    Serial.print(" (");
    Serial.print(WATERING_WINDOW_DURATION_MIN);
    Serial.println(" min)");
  }
  Serial.println("========================================\n");

  delay(2000);
}

// ================= MAIN LOOP =================
void loop() {
  DateTime nowUTC = rtc.now();
  DateTime nowLocal = getLocalTime(nowUTC);
  unsigned long nowSec = nowUTC.unixtime();
  unsigned long nowMs = millis();

  bool wasFeedingActive = feedingWindowActive;
  bool wasWateringActive = wateringWindowActive;

  feedingWindowActive = isFeedingWindowActive(nowUTC);
  wateringWindowActive = isWateringWindowActive(nowUTC);

  // ===== FEEDING WINDOW OPENED =====
  if (feedingWindowActive && !wasFeedingActive) {
    feedingWindowJustOpened = true;
    lastFeedTime = nowSec;
    int windowIndex = getFeedingWindowIndex(nowUTC);
    Serial.println("======================================");
    Serial.print("  🍽️  ");
    Serial.print(FEEDING_NAMES[windowIndex]);
    Serial.print(" (Local: ");
    Serial.print(nowLocal.hour());
    Serial.print(":");
    if (nowLocal.minute() < 10) Serial.print("0");
    Serial.print(nowLocal.minute());
    Serial.println(")");
    Serial.println("======================================");
    tone(BUZZER, 1500, 300);
    sendSMSAlert(FEEDING_NAMES[windowIndex] + " started");
  }
  if (!feedingWindowActive && wasFeedingActive) {
    Serial.println("--- FEEDING WINDOW CLOSED ---\n");
  }

  // ===== WATERING WINDOW OPENED =====
  if (wateringWindowActive && !wasWateringActive) {
    wateringWindowJustOpened = true;
    lastPumpTime = nowSec;
    int windowIndex = getWateringWindowIndex(nowUTC);
    Serial.println("======================================");
    Serial.print("  💧 ");
    Serial.print(WATERING_NAMES[windowIndex]);
    Serial.print(" (Local: ");
    Serial.print(nowLocal.hour());
    Serial.print(":");
    if (nowLocal.minute() < 10) Serial.print("0");
    Serial.print(nowLocal.minute());
    Serial.println(")");
    Serial.println("======================================");
    tone(BUZZER, 1000, 200);
    sendSMSAlert(WATERING_NAMES[windowIndex] + " started");
  }
  if (!wateringWindowActive && wasWateringActive) {
    Serial.println("--- WATERING WINDOW CLOSED ---\n");
  }

  // ===== READ ALL SENSORS =====
  currentWeight = readWeight();
  hxValid = checkHX(currentWeight);

  // FIX: assign into the GLOBAL feedLevel/waterLevel declared above,
  // instead of shadowing them with new local "float" variables.
  // This is what lets sendSensorData() read the current values.
  feedLevel = readFeedLevel();
  int feedTankState = getFeedTankState(feedLevel);

  waterLevel = readWaterLevel();
  int waterTankState = getWaterTankState(waterLevel);

  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  // ===== CLIMATE CONTROL =====
  if (!isnan(temperature)) {
    if (temperature > TEMP_HIGH) {
      controlRelay(FAN_RELAY, true);
      controlRelay(LAMP_RELAY, false);
      fanState = true;
      lampState = false;
    } else if (temperature < TEMP_LOW) {
      controlRelay(FAN_RELAY, false);
      controlRelay(LAMP_RELAY, true);
      fanState = false;
      lampState = true;
    } else {
      controlRelay(FAN_RELAY, false);
      controlRelay(LAMP_RELAY, false);
      fanState = false;
      lampState = false;
    }
  }

  // ===== ULTRASONIC FAILSAFES =====
  if (feedLevel < 0 && feedUltraFails >= ULTRASONIC_FAIL_LIMIT && feederState != IDLE) {
    gateClose();
    plateClose();
    feederState = IDLE;
    tone(BUZZER, 400, 400);
    Serial.println("⚠️  FEED SENSOR FAIL - EMERGENCY STOP");
    sendSMSAlert("Feed tank ultrasonic sensor failure!");
  }
  if (waterLevel < 0 && waterUltraFails >= ULTRASONIC_FAIL_LIMIT && pumpOn) {
    stopPump("WATER SENSOR FAIL");
    sendSMSAlert("Water tank ultrasonic sensor failure - pump stopped");
  }

  // ===== ALERTS =====
  static int lastFeedState = 2;
  if (feedTankState != lastFeedState) {
    if (feedTankState == 0) {
      tone(BUZZER, 500, 300);
      sendSMSAlert("Feed tank EMPTY!");
    }
    lastFeedState = feedTankState;
  }
  static int lastWaterState = 2;
  if (waterTankState != lastWaterState) {
    if (waterTankState == 0) {
      tone(BUZZER, 500, 300);
      sendSMSAlert("Water tank EMPTY!");
    }
    lastWaterState = waterTankState;
  }

  // ==========================================
  // 🍽️  FEEDING SYSTEM
  // ==========================================
  if (feedingWindowActive) {
    switch (feederState) {
      case IDLE:
        gateClose();
        plateClose();
        if ((nowSec - lastFeedTime) >= FEED_INTERVAL_SEC) {
          if (feedTankState != 0) {
            startWeight = currentWeight;
            feedStartTime = nowSec;
            gateOpen();
            feederState = FEEDING;
            Serial.print("🍽️  [");
            Serial.print(nowLocal.hour());
            Serial.print(":");
            if (nowLocal.minute() < 10) Serial.print("0");
            Serial.print(nowLocal.minute());
            Serial.print("] FEED START - Initial: ");
            Serial.print(startWeight, 3);
            Serial.println(" kg");
          } else {
            tone(BUZZER, 500, 300);
            Serial.println("⚠️  FEED TANK EMPTY - FEED BLOCKED");
          }
        }
        break;
      case FEEDING: {
        float gained = currentWeight - startWeight;
        bool timeExceeded = (nowSec - feedStartTime) > MAX_FEED_TIME;
        if ((hxValid && gained >= TARGET_WEIGHT) || (!hxValid && timeExceeded)) {
          gateClose();
          actionStart = nowMs;
          feederState = DISPENSE;
          if (hxValid) {
            Serial.print("✅ TARGET REACHED! Gained: ");
            Serial.print(gained, 3);
            Serial.println(" kg");
          } else {
            Serial.println("⏰ RTC FALLBACK - HX711 invalid");
          }
        }
        if (feedTankState == 0) {
          gateClose();
          feederState = IDLE;
          lastFeedTime = nowSec;
          tone(BUZZER, 400, 400);
          Serial.println("⚠️  EMERGENCY STOP - FEED TANK EMPTY");
        }
        break;
      }
      case DISPENSE:
        plateOpen();
        if (nowMs - actionStart >= DISPENSE_TIME) {
          actionStart = nowMs;
          feederState = RETURNING;
        }
        break;
      case RETURNING:
        plateClose();
        if (nowMs - actionStart >= RETURN_TIME) {
          feederState = IDLE;
          lastFeedTime = nowSec;
          tone(BUZZER, 2000, 200);
          float totalFed = currentWeight - startWeight;
          Serial.print("✅ FEED CYCLE COMPLETE! Total: ");
          Serial.print(totalFed, 3);
          Serial.println(" kg\n");
        }
        break;
    }
  } else {
    if (feederState != IDLE) {
      gateClose();
      plateClose();
      feederState = IDLE;
      Serial.println("🍽️  FEEDER STOPPED - OUTSIDE FEEDING WINDOW");
    }
    feedingWindowJustOpened = false;
  }

  // ==========================================
  // 💧 WATERING SYSTEM
  // ==========================================
  if (wateringWindowActive) {
    if (!pumpOn && (nowSec - lastPumpTime >= PUMP_INTERVAL_SEC)) {
      if (waterTankState != 0) {
        startPump(waterLevel);
        lastPumpTime = nowSec;
      } else {
        Serial.println("💧 PUMP BLOCKED - WATER TANK EMPTY");
      }
    }
    if (pumpOn) {
      float drop = startCM - waterLevel;
      if (drop > 0) {
        totalUsedCM += drop;
        startCM = waterLevel;
      }
      if (drop >= DROP_CM_TARGET) {
        stopPump("TARGET REACHED");
      }
      if (nowMs - pumpStartTime > MAX_RUN_TIME_MS) {
        stopPump("TIMEOUT");
        sendSMSAlert("Pump timeout - possible leak");
      }
      if (waterTankState == 0) {
        stopPump("WATER TANK EMPTY");
        sendSMSAlert("Pump stopped - water tank empty");
      }
    }
  } else {
    if (pumpOn) {
      stopPump("OUTSIDE WATERING WINDOW");
    }
    wateringWindowJustOpened = false;
  }

  // ===== UPDATE DISPLAY =====
  updateDisplay(feedLevel, waterLevel, feedTankState, waterTankState);

  // ===== SERIAL DEBUG =====
  static unsigned long lastDebugTime = 0;
  if (nowMs - lastDebugTime >= 5000) {
    lastDebugTime = nowMs;
    Serial.print("Local:");
    if (nowLocal.hour() < 10) Serial.print("0");
    Serial.print(nowLocal.hour());
    Serial.print(":");
    if (nowLocal.minute() < 10) Serial.print("0");
    Serial.print(nowLocal.minute());
    Serial.print(" | FeedWin:");
    Serial.print(feedingWindowActive ? "ACT" : "---");
    Serial.print(" WaterWin:");
    Serial.print(wateringWindowActive ? "ACT" : "---");
    Serial.print(" | W:"); Serial.print(currentWeight, 3);
    Serial.print(" | Feed:"); Serial.print(feedLevel, 1);
    Serial.print(" | Water:"); Serial.print(waterLevel, 1);
    Serial.print(" | T:"); Serial.print(temperature);
    Serial.print(" | F:"); Serial.print(feederState);
    Serial.print(" | P:"); Serial.print(pumpOn);
    Serial.print(" | Fan:"); Serial.print(fanState);
    Serial.print(" | Lamp:"); Serial.println(lampState);
  }

  // ===== SEND DATA TO BACKEND (non‑blocking, every 10 sec) =====
  if (millis() - lastSendTime >= SEND_INTERVAL_MS) {
    sendSensorData();
    lastSendTime = millis();
  }

  delay(300);
}
