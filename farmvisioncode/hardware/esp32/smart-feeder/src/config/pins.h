#pragma once

#ifndef PI
#define PI 3.14159265358979323846
#endif

// Timezone
#define TIMEZONE_OFFSET 2

// I2C
#define I2C_SDA 21
#define I2C_SCL 22

// Servos
#define SERVO_FEED_GATE 19
#define SERVO_PLATE 18

// Buzzer
#define BUZZER_PIN 25

// HX711
#define HX711_DT 32
#define HX711_SCK 33

// Ultrasonic Feed
#define TRIG_FEED 4
#define ECHO_FEED 35

// Ultrasonic Water
#define TRIG_WATER 5
#define ECHO_WATER 26

// DHT22
#define DHT_PIN 14

// Relays
#define FAN_RELAY 13
#define LAMP_RELAY 27
#define PUMP_RELAY 23

// GSM UART
#define GSM_RX 16
#define GSM_TX 17

// Feed level geometry
#define FEED_MAX_DISTANCE_CM 30.0
#define FEED_MIN_DISTANCE_CM 5.0

// Water tank geometry (cylinder)
#define TANK_RADIUS_CM 20.0
#define TANK_MAX_HEIGHT_CM 50.0
#define TANK_MAX_VOLUME_LITRES (PI * TANK_RADIUS_CM * TANK_RADIUS_CM * TANK_MAX_HEIGHT_CM / 1000.0)

// GSM config
#define GSM_ALERT_NUMBER "+250726173472"
