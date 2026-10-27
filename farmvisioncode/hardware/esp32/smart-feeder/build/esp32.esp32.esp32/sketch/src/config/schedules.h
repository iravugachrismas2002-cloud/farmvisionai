#line 1 "C:\\Users\\user\\farmvisioncode\\hardware\\esp32\\smart-feeder\\src\\config\\schedules.h"
#pragma once

namespace Schedule {
  // Feeding schedule (HH MM 24H)
  const int FEEDING_HOURS[] = {6, 12, 18, 21};
  const int FEEDING_MINUTES[] = {0, 0, 0, 0};
  const int FEEDING_COUNT = 4;

  // Watering schedule (HH MM 24H)
  const int WATERING_HOURS[] = {7, 16};
  const int WATERING_MINUTES[] = {0, 0};
  const int WATERING_COUNT = 2;
}
