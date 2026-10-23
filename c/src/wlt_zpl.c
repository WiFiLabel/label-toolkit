#include "wlt_zpl.h"

#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int emit(char *buf, size_t cap, const char *fmt, ...) {
  va_list ap;
  int n;
  if (!buf || cap == 0) {
    return WLT_ERR_INVAL;
  }
  va_start(ap, fmt);
  n = vsnprintf(buf, cap, fmt, ap);
  va_end(ap);
  if (n < 0) {
    return WLT_ERR_INVAL;
  }
  if ((size_t)n >= cap) {
    return WLT_ERR_NOSPC;
  }
  return n;
}

static int require_range(wlt_cmd_id_t id, int value) {
  const wlt_cmd_info_t *info = wlt_cmd_info(id);
  if (!info) {
    return WLT_ERR_INVAL;
  }
  if (info->has_range && (value < info->min_value || value > info->max_value)) {
    return WLT_ERR_RANGE;
  }
  return WLT_OK;
}

int wlt_zpl_set_darkness(char *buf, size_t cap, int value) {
  int rc = require_range(WLT_CMD_SD, value);
  if (rc != WLT_OK) {
    return rc;
  }
  return emit(buf, cap, "~SD%d\n", value);
}

int wlt_zpl_media_darkness(char *buf, size_t cap, int value) {
  int rc = require_range(WLT_CMD_MD, value);
  if (rc != WLT_OK) {
    return rc;
  }
  return emit(buf, cap, "^MD%d\n", value);
}

int wlt_zpl_print_speed(char *buf, size_t cap, int value) {
  int rc = require_range(WLT_CMD_PR, value);
  if (rc != WLT_OK) {
    return rc;
  }
  return emit(buf, cap, "^PR%d\n", value);
}

int wlt_zpl_media_type(char *buf, size_t cap, const char *kind) {
  char letter = 0;
  if (!kind) {
    return WLT_ERR_INVAL;
  }
  if (strcmp(kind, "direct") == 0 || strcmp(kind, "direct thermal") == 0) {
    letter = 'D';
  } else if (strcmp(kind, "transfer") == 0 || strcmp(kind, "thermal") == 0 ||
             strcmp(kind, "thermal transfer") == 0) {
    letter = 'T';
  } else {
    return WLT_ERR_INVAL;
  }
  return emit(buf, cap, "^MT%c\n", letter);
}

int wlt_zpl_media_tracking(char *buf, size_t cap, const char *kind) {
  char letter = 0;
  if (!kind) {
    return WLT_ERR_INVAL;
  }
  if (strcmp(kind, "gap") == 0 || strcmp(kind, "web") == 0) {
    letter = 'Y';
  } else if (strcmp(kind, "continuous") == 0) {
    letter = 'N';
  } else if (strcmp(kind, "mark") == 0 || strcmp(kind, "black-mark") == 0) {
    letter = 'M';
  } else {
    return WLT_ERR_INVAL;
  }
  return emit(buf, cap, "^MN%c\n", letter);
}

int wlt_zpl_print_width(char *buf, size_t cap, int dots) {
  int rc = require_range(WLT_CMD_PW, dots);
  if (rc != WLT_OK) {
    return rc;
  }
  return emit(buf, cap, "^PW%d\n", dots);
}

int wlt_zpl_label_length(char *buf, size_t cap, int dots) {
  int rc = require_range(WLT_CMD_LL, dots);
  if (rc != WLT_OK) {
    return rc;
  }
  return emit(buf, cap, "^LL%d\n", dots);
}

int wlt_zpl_calibrate(char *buf, size_t cap) {
  return emit(buf, cap, "~JC\n");
}

int wlt_zpl_save(char *buf, size_t cap) {
  return emit(buf, cap, "^XA^JUS^XZ\n");
}

int wlt_zpl_factory_reset(char *buf, size_t cap, int confirm) {
  if (!confirm) {
    return WLT_ERR_CONFIRM;
  }
  return emit(buf, cap, "^XA^JUF^XZ\n");
}

int wlt_zpl_tear_off(char *buf, size_t cap, int dots) {
  int rc = require_range(WLT_CMD_TA, dots);
  if (rc != WLT_OK) {
    return rc;
  }
  if (dots < 0) {
    return emit(buf, cap, "~TA-%03d\n", -dots);
  }
  return emit(buf, cap, "~TA%03d\n", dots);
}

int wlt_zpl_set_tear_off(char *buf, size_t cap, int dots, int save) {
  char tear[16];
  int n = wlt_zpl_tear_off(tear, sizeof tear, dots);
  int total;
  if (n < 0) {
    return n;
  }
  if (!buf || cap == 0) {
    return WLT_ERR_INVAL;
  }
  if (save) {
    total = snprintf(buf, cap, "^XA^MMT^MNY^XZ\n%s^XA^JUS^XZ\n", tear);
  } else {
    total = snprintf(buf, cap, "^XA^MMT^MNY^XZ\n%s", tear);
  }
  if (total < 0 || (size_t)total >= cap) {
    return WLT_ERR_NOSPC;
  }
  return total;
}

int wlt_zpl_align_target(char *buf, size_t cap, int width, int length, int top, int left, int tear) {
  int mid_x;
  int mid_y;
  int rc = require_range(WLT_CMD_PW, width);
  if (rc != WLT_OK) {
    return rc;
  }
  rc = require_range(WLT_CMD_LL, length);
  if (rc != WLT_OK) {
    return rc;
  }
  mid_x = width / 2;
  mid_y = length / 2;
  return emit(buf, cap,
              "^XA\n^MMT\n^PW%d\n^LL%d\n^LT%d\n^LS%d\n^TO%d\n^MNY\n"
              "^FO0,0^GB%d,%d,4^FS\n"
              "^FO%d,0^GB2,%d,2^FS\n"
              "^FO0,%d^GB%d,2,2^FS\n"
              "^FO20,20^A0N,30,30^FDALIGN top=%d left=%d^FS\n"
              "^FO20,60^A0N,24,24^FDtear_off(^TO)=%d^FS\n"
              "^FO20,95^A0N,24,24^FDGap should stop at tear bar^FS\n"
              "^XZ\n",
              width, length, top, left, tear, width - 1, length - 1, mid_x, length, mid_y, width,
              top, left, tear);
}

int wlt_zpl_test_label(char *buf, size_t cap, int width, int height, const char *text) {
  size_t i;
  int rc = require_range(WLT_CMD_PW, width);
  if (rc != WLT_OK) {
    return rc;
  }
  rc = require_range(WLT_CMD_LL, height);
  if (rc != WLT_OK) {
    return rc;
  }
  if (!text || text[0] == '\0') {
    return WLT_ERR_INVAL;
  }
  for (i = 0; text[i] != '\0'; i++) {
    unsigned char c = (unsigned char)text[i];
    if (c < 0x20 || c == '^' || c == '~') {
      return WLT_ERR_INVAL;
    }
  }
  return emit(buf, cap, "^XA\n^PW%d\n^LL%d\n^FO20,20^A0N,36,36^FD%s^FS\n^XZ\n", width, height, text);
}

static int value_ok(const wlt_setting_info_t *setting, const char *value) {
  size_t i;
  if (!value || strchr(value, '"') || strchr(value, '\n') || strchr(value, '\r')) {
    return WLT_ERR_INVAL;
  }
  if (setting->type == WLT_TYPE_INT) {
    char *end = 0;
    long number = strtol(value, &end, 10);
    if (end == value || (end && *end != '\0')) {
      return WLT_ERR_RANGE;
    }
    if (setting->has_range && (number < setting->min_value || number > setting->max_value)) {
      return WLT_ERR_RANGE;
    }
    return WLT_OK;
  }
  if (setting->type == WLT_TYPE_ENUM || setting->type == WLT_TYPE_BOOL) {
    if (!setting->values) {
      return WLT_ERR_RANGE;
    }
    for (i = 0; setting->values[i] != 0; i++) {
      if (strcmp(setting->values[i], value) == 0) {
        return WLT_OK;
      }
    }
    return WLT_ERR_RANGE;
  }
  if (value[0] == '\0' || strlen(value) > 80) {
    return WLT_ERR_INVAL;
  }
  return WLT_OK;
}

int wlt_sgd_get(char *buf, size_t cap, const char *key) {
  if (!wlt_setting_by_key(key)) {
    return WLT_ERR_INVAL;
  }
  return emit(buf, cap, "! U1 getvar \"%s\"\r\n", key);
}

int wlt_sgd_set(char *buf, size_t cap, const char *key, const char *value) {
  const wlt_setting_info_t *setting = wlt_setting_by_key(key);
  int rc;
  if (!setting) {
    return WLT_ERR_INVAL;
  }
  if (setting->read_only || (setting->access & WLT_ACCESS_SET) == 0) {
    return WLT_ERR_READONLY;
  }
  if (setting->risk == WLT_RISK_DESTRUCTIVE) {
    return WLT_ERR_CONFIRM;
  }
  rc = value_ok(setting, value);
  if (rc != WLT_OK) {
    return rc;
  }
  return emit(buf, cap, "! U1 setvar \"%s\" \"%s\"\r\n", key, value);
}

int wlt_sgd_do(char *buf, size_t cap, const char *key, const char *value, int confirm) {
  const wlt_setting_info_t *setting = wlt_setting_by_key(key);
  if (!setting || (setting->access & WLT_ACCESS_DO) == 0) {
    return WLT_ERR_INVAL;
  }
  if (setting->risk == WLT_RISK_DESTRUCTIVE && !confirm) {
    return WLT_ERR_CONFIRM;
  }
  if (!value) {
    value = "";
  }
  if (strchr(value, '"') || strchr(value, '\n')) {
    return WLT_ERR_INVAL;
  }
  return emit(buf, cap, "! U1 do \"%s\" \"%s\"\r\n", key, value);
}

static int bitmap_size(int width_dots, int height_dots, size_t bitmap_len, size_t *expected, int *bpr) {
  if (width_dots <= 0 || height_dots <= 0) {
    return WLT_ERR_INVAL;
  }
  *bpr = (width_dots + 7) / 8;
  *expected = (size_t)(*bpr) * (size_t)height_dots;
  if (bitmap_len < *expected) {
    return WLT_ERR_INVAL;
  }
  return WLT_OK;
}

int wlt_wrap_zpl_gfa(char *buf, size_t cap, const uint8_t *bitmap, size_t bitmap_len, int width_dots,
                     int height_dots) {
  size_t expected = 0;
  int bpr = 0;
  char header[96];
  int header_len;
  const char *footer = "^FS\n^XZ\n";
  size_t footer_len = strlen(footer);
  size_t need;
  size_t pos;
  size_t i;
  static const char hex[] = "0123456789ABCDEF";
  int rc = bitmap_size(width_dots, height_dots, bitmap_len, &expected, &bpr);
  if (rc != WLT_OK || !buf || !bitmap) {
    return rc != WLT_OK ? rc : WLT_ERR_INVAL;
  }
  header_len = snprintf(header, sizeof header, "^XA\n^PW%d\n^LL%d\n^FO0,0^GFA,%u,%u,%d,", width_dots,
                        height_dots, (unsigned)expected, (unsigned)expected, bpr);
  if (header_len < 0 || (size_t)header_len >= sizeof header) {
    return WLT_ERR_INVAL;
  }
  need = (size_t)header_len + expected * 2 + footer_len;
  if (need + 1 > cap) {
    return WLT_ERR_NOSPC;
  }
  memcpy(buf, header, (size_t)header_len);
  pos = (size_t)header_len;
  for (i = 0; i < expected; i++) {
    buf[pos++] = hex[bitmap[i] >> 4];
    buf[pos++] = hex[bitmap[i] & 0x0f];
  }
  memcpy(buf + pos, footer, footer_len);
  pos += footer_len;
  buf[pos] = '\0';
  return (int)pos;
}

static int wrap_binary(char *buf, size_t cap, const char *head, const uint8_t *bitmap, size_t expected,
                       const char *tail) {
  size_t head_len = strlen(head);
  size_t tail_len = strlen(tail);
  size_t need = head_len + expected + tail_len;
  if (need + 1 > cap) {
    return WLT_ERR_NOSPC;
  }
  memcpy(buf, head, head_len);
  memcpy(buf + head_len, bitmap, expected);
  memcpy(buf + head_len + expected, tail, tail_len);
  buf[need] = '\0';
  return (int)need;
}

int wlt_wrap_epl_gw(char *buf, size_t cap, const uint8_t *bitmap, size_t bitmap_len, int width_dots,
                    int height_dots) {
  size_t expected = 0;
  int bpr = 0;
  char head[64];
  int rc = bitmap_size(width_dots, height_dots, bitmap_len, &expected, &bpr);
  if (rc != WLT_OK || !buf || !bitmap) {
    return rc != WLT_OK ? rc : WLT_ERR_INVAL;
  }
  if (snprintf(head, sizeof head, "\r\nN\r\nGW0,0,%d,%d,", bpr, height_dots) >= (int)sizeof head) {
    return WLT_ERR_INVAL;
  }
  return wrap_binary(buf, cap, head, bitmap, expected, "\r\nP1\r\n");
}

int wlt_wrap_tspl_bitmap(char *buf, size_t cap, const uint8_t *bitmap, size_t bitmap_len,
                         int width_dots, int height_dots) {
  size_t expected = 0;
  int bpr = 0;
  char head[80];
  int rc = bitmap_size(width_dots, height_dots, bitmap_len, &expected, &bpr);
  if (rc != WLT_OK || !buf || !bitmap) {
    return rc != WLT_OK ? rc : WLT_ERR_INVAL;
  }
  if (snprintf(head, sizeof head, "SIZE 4,6\r\nCLS\r\nBITMAP 0,0,%d,%d,0,", bpr, height_dots) >=
      (int)sizeof head) {
    return WLT_ERR_INVAL;
  }
  return wrap_binary(buf, cap, head, bitmap, expected, "\r\nPRINT 1\r\n");
}
