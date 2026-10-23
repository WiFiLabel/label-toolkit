#include "wlt_zpl.h"

#include "esp_log.h"

void app_main(void) {
  char buf[64];
  int n = wlt_zpl_calibrate(buf, sizeof buf);
  if (n > 0) {
    ESP_LOGI("wlt", "%.*s", n, buf);
  }
  n = wlt_zpl_set_darkness(buf, sizeof buf, 15);
  if (n > 0) {
    ESP_LOGI("wlt", "%.*s", n, buf);
  }
}
