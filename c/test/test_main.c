#include "json_min.h"
#include "wlt_status.h"
#include "wlt_zpl.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int g_failed = 0;

static void fail(const char *message) {
  fprintf(stderr, "FAIL %s\n", message);
  g_failed++;
}

static const char *err_name(int code) {
  if (code == WLT_ERR_RANGE) return "range";
  if (code == WLT_ERR_CONFIRM) return "confirm";
  if (code == WLT_ERR_READONLY) return "readonly";
  if (code == WLT_ERR_INVAL) return "invalid";
  if (code == WLT_ERR_NOSPC) return "nospace";
  return "error";
}

static int dispatch(const char *fn, const jval *args, char *buf, size_t cap) {
  const jval *a0 = json_at(args, 0);
  const jval *a1 = json_at(args, 1);
  if (strcmp(fn, "setDarkness") == 0) return wlt_zpl_set_darkness(buf, cap, (int)json_long(a0));
  if (strcmp(fn, "mediaDarkness") == 0) return wlt_zpl_media_darkness(buf, cap, (int)json_long(a0));
  if (strcmp(fn, "printSpeed") == 0) return wlt_zpl_print_speed(buf, cap, (int)json_long(a0));
  if (strcmp(fn, "mediaType") == 0) return wlt_zpl_media_type(buf, cap, json_str(a0));
  if (strcmp(fn, "mediaTracking") == 0) return wlt_zpl_media_tracking(buf, cap, json_str(a0));
  if (strcmp(fn, "printWidth") == 0) return wlt_zpl_print_width(buf, cap, (int)json_long(a0));
  if (strcmp(fn, "labelLength") == 0) return wlt_zpl_label_length(buf, cap, (int)json_long(a0));
  if (strcmp(fn, "calibrate") == 0) return wlt_zpl_calibrate(buf, cap);
  if (strcmp(fn, "saveSettings") == 0) return wlt_zpl_save(buf, cap);
  if (strcmp(fn, "tearOff") == 0) return wlt_zpl_tear_off(buf, cap, (int)json_long(a0));
  if (strcmp(fn, "setTearOff") == 0) {
    return wlt_zpl_set_tear_off(buf, cap, (int)json_long(a0), json_bool(a1));
  }
  if (strcmp(fn, "factoryReset") == 0) {
    int confirm = 0;
    if (a0 && a0->type == 5) {
      const jval *flag = json_get(a0, "confirm");
      confirm = json_bool(flag);
    }
    return wlt_zpl_factory_reset(buf, cap, confirm);
  }
  if (strcmp(fn, "sgdGet") == 0) return wlt_sgd_get(buf, cap, json_str(a0));
  if (strcmp(fn, "sgdSet") == 0) return wlt_sgd_set(buf, cap, json_str(a0), json_str(a1));
  if (strcmp(fn, "sgdDo") == 0) {
    const jval *a2 = json_at(args, 2);
    int confirm = a2 && a2->type == 5 && json_bool(json_get(a2, "confirm"));
    return wlt_sgd_do(buf, cap, json_str(a0), json_str(a1) ? json_str(a1) : "", confirm);
  }
  if (strcmp(fn, "alignTarget") == 0) {
    return wlt_zpl_align_target(buf, cap, (int)json_long(a0), (int)json_long(a1),
                                (int)json_long(json_at(args, 2)), (int)json_long(json_at(args, 3)),
                                (int)json_long(json_at(args, 4)));
  }
  if (strcmp(fn, "testLabel") == 0) {
    return wlt_zpl_test_label(buf, cap, (int)json_long(json_get(a0, "widthDots")),
                              (int)json_long(json_get(a0, "heightDots")),
                              json_str(json_get(a0, "text")));
  }
  if (strcmp(fn, "calibrateFlow") == 0) {
    char first[32];
    char second[32];
    int n1 = wlt_zpl_calibrate(first, sizeof first);
    int n2 = wlt_zpl_save(second, sizeof second);
    if (n1 < 0) return n1;
    if (n2 < 0) return n2;
    if ((size_t)(n1 + n2) >= cap) return WLT_ERR_NOSPC;
    memcpy(buf, first, (size_t)n1);
    memcpy(buf + n1, second, (size_t)n2);
    buf[n1 + n2] = '\0';
    return n1 + n2;
  }
  return WLT_ERR_INVAL;
}

static char *read_file(const char *path) {
  FILE *file = fopen(path, "rb");
  long size;
  char *buf;
  if (!file) return 0;
  if (fseek(file, 0, SEEK_END) != 0) {
    fclose(file);
    return 0;
  }
  size = ftell(file);
  rewind(file);
  buf = malloc((size_t)size + 1);
  if (!buf) {
    fclose(file);
    return 0;
  }
  if (fread(buf, 1, (size_t)size, file) != (size_t)size) {
    free(buf);
    fclose(file);
    return 0;
  }
  buf[size] = '\0';
  fclose(file);
  return buf;
}

static int hex_nibble(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'a' && c <= 'f') return c - 'a' + 10;
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  return -1;
}

static uint8_t *decode_hex(const char *hex, size_t *out_len) {
  size_t n = strlen(hex);
  size_t i;
  uint8_t *buf;
  if (n % 2) return 0;
  buf = malloc(n / 2 + 1);
  if (!buf) return 0;
  for (i = 0; i < n; i += 2) {
    int hi = hex_nibble(hex[i]);
    int lo = hex_nibble(hex[i + 1]);
    if (hi < 0 || lo < 0) {
      free(buf);
      return 0;
    }
    buf[i / 2] = (uint8_t)((hi << 4) | lo);
  }
  *out_len = n / 2;
  return buf;
}

static const jval *array_rows(const jval *root) {
  const char *keys[] = {"cases", "builders", "parsers", "bitmaps"};
  int i;
  for (i = 0; i < 4; i++) {
    const jval *rows = json_get(root, keys[i]);
    if (rows && rows->type == 4) return rows;
  }
  return 0;
}

static void check_builders(const jval *root) {
  const jval *rows = array_rows(root);
  int i;
  if (!rows) {
    fail("builders missing");
    return;
  }
  for (i = 0; i < rows->length; i++) {
    const jval *row = json_at(rows, i);
    const char *fn = json_str(json_get(row, "fn"));
    const char *expected = json_str(json_get(row, "error"));
    char buf[2048];
    int n = dispatch(fn, json_get(row, "args"), buf, sizeof buf);
    if (expected) {
      if (strcmp(err_name(n), expected) != 0) {
        fprintf(stderr, "FAIL %s error got %s want %s\n", fn, err_name(n), expected);
        g_failed++;
      }
      continue;
    }
    expected = json_str(json_get(row, "expected"));
    if (n < 0 || !expected || strcmp(buf, expected) != 0) {
      fprintf(stderr, "FAIL %s\n got: %s\n want: %s\n", fn, n < 0 ? err_name(n) : buf,
              expected ? expected : "(null)");
      g_failed++;
    }
  }
}

static int faults_match(const wlt_host_status_t *status, const jval *expected) {
  int i;
  if (!expected || expected->length != status->fault_count) return 0;
  for (i = 0; i < status->fault_count; i++) {
    const char *name = json_str(json_at(expected, i));
    if (!name || strcmp(name, status->faults[i]) != 0) return 0;
  }
  return 1;
}

static void check_parsers(const jval *root) {
  const jval *rows = array_rows(root);
  int i;
  if (!rows) {
    fail("parsers missing");
    return;
  }
  for (i = 0; i < rows->length; i++) {
    const jval *row = json_at(rows, i);
    const char *fn = json_str(json_get(row, "fn"));
    size_t len = 0;
    uint8_t *raw = decode_hex(json_str(json_get(row, "rawHex")), &len);
    const jval *expected = json_get(row, "expected");
    if (!raw) {
      fail(fn);
      continue;
    }
    if (strcmp(fn, "parseHostStatus") == 0) {
      wlt_host_status_t status;
      wlt_parse_hs(raw, len, &status);
      if (status.paper_out != json_bool(json_get(expected, "paperOut")) ||
          status.paused != json_bool(json_get(expected, "paused")) ||
          status.head_up != json_bool(json_get(expected, "headUp")) ||
          status.ribbon_out != json_bool(json_get(expected, "ribbonOut")) ||
          status.buffer_full != json_bool(json_get(expected, "bufferFull")) ||
          status.label_length_dots != (int)json_long(json_get(expected, "labelLengthDots")) ||
          status.formats_in_buffer != (int)json_long(json_get(expected, "formatsInBuffer")) ||
          !faults_match(&status, json_get(expected, "faults"))) {
        fprintf(stderr, "FAIL parseHostStatus case %d\n", i);
        g_failed++;
      }
    } else if (strcmp(fn, "parseHi") == 0) {
      wlt_host_id_t id;
      wlt_parse_hi(raw, len, &id);
      if (strcmp(id.model, json_str(json_get(expected, "model"))) != 0 ||
          strcmp(id.firmware, json_str(json_get(expected, "firmware"))) != 0 ||
          id.dpi != (int)json_long(json_get(expected, "dpi")) ||
          id.memory_kb != (int)json_long(json_get(expected, "memoryKb"))) {
        fprintf(stderr, "FAIL parseHi got %s %s dpi %d mem %d\n", id.model, id.firmware, id.dpi,
                id.memory_kb);
        g_failed++;
      }
    } else if (strcmp(fn, "parseHqes") == 0) {
      wlt_hqes_t hq;
      const jval *flags = json_get(expected, "flags");
      int f;
      wlt_parse_hqes(raw, len, &hq);
      if (hq.error_count != (int)json_long(json_get(expected, "errorCount")) ||
          hq.warning_count != (int)json_long(json_get(expected, "warningCount")) || !flags ||
          hq.flag_count != flags->length) {
        fprintf(stderr, "FAIL parseHqes case %d counts\n", i);
        g_failed++;
      } else {
        for (f = 0; f < hq.flag_count; f++) {
          const char *name = json_str(json_at(flags, f));
          if (!name || strcmp(name, hq.flags[f]) != 0) {
            fprintf(stderr, "FAIL parseHqes flag %s\n", hq.flags[f]);
            g_failed++;
          }
        }
      }
    } else if (strcmp(fn, "parseSgd") == 0 || strcmp(fn, "parseSgdResponse") == 0) {
      char text[128];
      wlt_parse_sgd_value(raw, len, text, sizeof text);
      if (strcmp(text, json_str(expected)) != 0) {
        fprintf(stderr, "FAIL parseSgd got %s\n", text);
        g_failed++;
      }
    } else {
      fail(fn);
    }
    free(raw);
  }
}

static void check_bitmaps(const jval *root) {
  const jval *rows = array_rows(root);
  int i;
  if (!rows) return;
  for (i = 0; i < rows->length; i++) {
    const jval *row = json_at(rows, i);
    const char *fn = json_str(json_get(row, "fn"));
    size_t len = 0;
    uint8_t *bitmap = decode_hex(json_str(json_get(row, "bitmapHex")), &len);
    char buf[512];
    int n = -1;
    int width = (int)json_long(json_get(row, "width"));
    int height = (int)json_long(json_get(row, "height"));
    if (!bitmap) {
      fail(fn);
      continue;
    }
    if (strcmp(fn, "wrapZplGfa") == 0) n = wlt_wrap_zpl_gfa(buf, sizeof buf, bitmap, len, width, height);
    if (strcmp(fn, "wrapEplGw") == 0) n = wlt_wrap_epl_gw(buf, sizeof buf, bitmap, len, width, height);
    if (strcmp(fn, "wrapTsplBitmap") == 0) {
      n = wlt_wrap_tspl_bitmap(buf, sizeof buf, bitmap, len, width, height);
    }
    if (json_str(json_get(row, "expected"))) {
      if (n < 0 || strcmp(buf, json_str(json_get(row, "expected"))) != 0) {
        fprintf(stderr, "FAIL %s bitmap\n", fn);
        g_failed++;
      }
    } else if (json_str(json_get(row, "expectedHex"))) {
      size_t expect_len = 0;
      uint8_t *expect = decode_hex(json_str(json_get(row, "expectedHex")), &expect_len);
      if (n < 0 || !expect || (size_t)n != expect_len || memcmp(buf, expect, expect_len) != 0) {
        fprintf(stderr, "FAIL %s bitmap hex\n", fn);
        g_failed++;
      }
      free(expect);
    }
    free(bitmap);
  }
}

static void run_file(const char *dir, const char *name, void (*check)(const jval *)) {
  char path[512];
  char *text;
  jval *root;
  snprintf(path, sizeof path, "%s/%s", dir, name);
  text = read_file(path);
  if (!text) {
    fprintf(stderr, "FAIL missing %s\n", path);
    g_failed++;
    return;
  }
  root = json_parse(text);
  free(text);
  if (!root) {
    fprintf(stderr, "FAIL parse %s\n", path);
    g_failed++;
    return;
  }
  check(root);
  json_free(root);
}

int main(int argc, char **argv) {
  const char *dir = argc > 1 ? argv[1] : WLT_VECTORS_DIR;
  run_file(dir, "builders.json", check_builders);
  run_file(dir, "parsers.json", check_parsers);
  run_file(dir, "bitmaps.json", check_bitmaps);
  if (g_failed) {
    fprintf(stderr, "%d failure(s)\n", g_failed);
    return 1;
  }
  printf("c vectors ok\n");
  return 0;
}
