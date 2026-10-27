#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\display\\lcd_manager.cpp"
#pragma once

#include "lcd_manager.h"
#include <LiquidCrystal_I2C.h>

static LiquidCrystal_I2C* lcd = nullptr;

void LCDManager::begin() {
  scanI2C();
  lcd = new LiquidCrystal_I2C(address, 16, 2);
  lcd->init();
  lcd->backlight();
  lcd->clear();
}

void LCDManager::clear() {
  if (lcd) {
    lcd->clear();
  }
}

void LCDManager::printLine(int line, const char* text) {
  if (!lcd) {
    return;
  }

  lcd->setCursor(0, line);
  lcd->print(text);
}

void LCDManager::scanI2C() {
  byte error;
  for (byte addr = 1; addr < 127; addr++) {
    Wire.beginTransmission(addr);
    error = Wire.endTransmission();
    if (error == 0) {
      address = addr;
      return;
    }
  }
}
