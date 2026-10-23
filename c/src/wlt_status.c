#include "wlt_status.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static int dpi_from_dots(int dots) {
  if (dots == 6) return 152;
  if (dots == 8) return 203;
  if (dots == 12) return 300;
  if (dots == 16) return 406;
  if (dots == 24) return 600;
  if (dots >= 100) return dots;
  return 0;
}

static int copy_text(char *dst, size_t cap, const char *src, size_t n) {
  size_t i = 0;
  if (cap == 0) return WLT_ERR_NOSPC;
  while (i + 1 < cap && i < n && src[i] != '\0') {
    dst[i] = src[i];
    i++;
  }
  dst[i] = '\0';
  return (int)i;
}

static int split_frames(const uint8_t *data, size_t len, char frames[][160], int max_frames) {
  size_t i;
  int count = 0;
  int saw = 0;
  for (i = 0; i < len; i++) {
    if (data[i] == 0x02) saw = 1;
  }
  if (saw) {
    i = 0;
    while (i < len && count < max_frames) {
      size_t start;
      size_t n;
      while (i < len && data[i] != 0x02) i++;
      if (i >= len) break;
      i++;
      start = i;
      while (i < len && data[i] != 0x03) i++;
      n = i - start;
      if (n >= sizeof frames[0]) n = sizeof frames[0] - 1;
      memcpy(frames[count], data + start, n);
      frames[count][n] = '\0';
      count++;
      if (i < len && data[i] == 0x03) i++;
    }
    return count;
  }
  i = 0;
  while (i < len && count < max_frames) {
    size_t start = i;
    size_t n;
    while (i < len && data[i] != '\n') i++;
    n = i - start;
    while (n > 0 && (data[start + n - 1] == '\r')) n--;
    if (n > 0) {
      if (n >= sizeof frames[0]) n = sizeof frames[0] - 1;
      memcpy(frames[count], data + start, n);
      frames[count][n] = '\0';
      count++;
    }
    if (i < len && data[i] == '\n') i++;
  }
  return count;
}

static int field_int(const char *line, int index) {
  int current = 0;
  const char *p = line;
  char buf[32];
  size_t n = 0;
  if (!line) return 0;
  while (*p && current < index) {
    if (*p == ',') current++;
    p++;
  }
  while (*p && *p != ',' && n + 1 < sizeof buf) {
    if (*p != ' ') buf[n++] = *p;
    p++;
  }
  buf[n] = '\0';
  return (int)strtol(buf, 0, 10);
}

static int field_flag(const char *line, int index) {
  return field_int(line, index) == 1;
}

static void add_fault(wlt_host_status_t *out, const char *name) {
  if (out->fault_count >= 5) return;
  snprintf(out->faults[out->fault_count], sizeof out->faults[0], "%s", name);
  out->fault_count++;
}

int wlt_parse_hs(const uint8_t *data, size_t len, wlt_host_status_t *out) {
  char frames[4][160];
  int count;
  const char *first;
  const char *second;
  if (!data || !out) return WLT_ERR_INVAL;
  memset(out, 0, sizeof *out);
  count = split_frames(data, len, frames, 4);
  first = count > 0 ? frames[0] : "";
  second = count > 1 ? frames[1] : "";
  out->paper_out = field_flag(first, 1);
  out->paused = field_flag(first, 2);
  out->label_length_dots = field_int(first, 3);
  out->formats_in_buffer = field_int(first, 4);
  out->buffer_full = field_flag(first, 5);
  out->head_up = field_flag(second, 2);
  out->ribbon_out = field_flag(second, 3);
  if (out->paper_out) add_fault(out, "paper-out");
  if (out->paused) add_fault(out, "paused");
  if (out->head_up) add_fault(out, "head-up");
  if (out->ribbon_out) add_fault(out, "ribbon-out");
  if (out->buffer_full) add_fault(out, "buffer-full");
  return WLT_OK;
}

static const char *skip_ws(const char *p) {
  while (*p == ' ' || *p == '\t' || *p == '\r' || *p == '\n') p++;
  return p;
}

int wlt_parse_hi(const uint8_t *data, size_t len, wlt_host_id_t *out) {
  char frames[2][160];
  int count;
  char body[160];
  char *parts[4];
  int nparts = 0;
  char *cursor;
  int dots;
  if (!data || !out) return WLT_ERR_INVAL;
  memset(out, 0, sizeof *out);
  count = split_frames(data, len, frames, 2);
  if (count > 0) {
    snprintf(body, sizeof body, "%s", frames[0]);
  } else {
    size_t n = len < sizeof body - 1 ? len : sizeof body - 1;
    memcpy(body, data, n);
    body[n] = '\0';
  }
  cursor = body;
  parts[nparts++] = cursor;
  while (*cursor && nparts < 4) {
    if (*cursor == ',') {
      *cursor = '\0';
      parts[nparts++] = cursor + 1;
    }
    cursor++;
  }
  if (nparts > 0) {
    const char *model = skip_ws(parts[0]);
    copy_text(out->model, sizeof out->model, model, strlen(model));
  }
  if (nparts > 1) {
    const char *firmware = skip_ws(parts[1]);
    copy_text(out->firmware, sizeof out->firmware, firmware, strlen(firmware));
  }
  dots = nparts > 2 ? (int)strtol(skip_ws(parts[2]), 0, 10) : 0;
  out->dpi = dpi_from_dots(dots);
  if (nparts > 3) {
    char mem[32];
    size_t i = 0;
    size_t j = 0;
    const char *src = skip_ws(parts[3]);
    while (src[i] && j + 1 < sizeof mem) {
      if (src[i] >= '0' && src[i] <= '9') mem[j++] = src[i];
      i++;
    }
    mem[j] = '\0';
    if (j > 0) {
      out->memory_kb = (int)strtol(mem, 0, 10);
      out->has_memory = 1;
    }
  }
  return WLT_OK;
}

static int grab_hex_line(const char *raw, const char *label, int *count, char word0[16], char word1[16]) {
  const char *p = strstr(raw, label);
  if (!p) return 0;
  p += strlen(label);
  if (sscanf(p, " %d %15s %15s", count, word0, word1) == 3) return 1;
  return 0;
}

int wlt_parse_hqes(const uint8_t *data, size_t len, wlt_hqes_t *out) {
  char text[256];
  size_t n;
  if (!data || !out) return WLT_ERR_INVAL;
  memset(out, 0, sizeof *out);
  n = len < sizeof text - 1 ? len : sizeof text - 1;
  memcpy(text, data, n);
  text[n] = '\0';
  if (grab_hex_line(text, "ERRORS:", &out->error_count, out->error_words[0], out->error_words[1])) {
    out->error_word_count = 2;
  }
  if (grab_hex_line(text, "WARNINGS:", &out->warning_count, out->warning_words[0], out->warning_words[1])) {
    out->warning_word_count = 2;
  }
  if (out->error_count > 0) {
    snprintf(out->flags[out->flag_count++], sizeof out->flags[0], "errors-present");
  }
  if (out->warning_count > 0) {
    snprintf(out->flags[out->flag_count++], sizeof out->flags[0], "warnings-present");
  }
  return WLT_OK;
}

int wlt_parse_sgd_value(const uint8_t *data, size_t len, char *out, size_t cap) {
  size_t start = 0;
  size_t end;
  size_t n;
  if (!data || !out || cap == 0) return WLT_ERR_INVAL;
  end = len;
  while (start < end && (data[start] == ' ' || data[start] == '\r' || data[start] == '\n' ||
                         data[start] == 0x02 || data[start] == 0x03)) {
    start++;
  }
  while (end > start && (data[end - 1] == ' ' || data[end - 1] == '\r' || data[end - 1] == '\n' ||
                         data[end - 1] == 0x02 || data[end - 1] == 0x03)) {
    end--;
  }
  if (end - start >= 2 && data[start] == '"' && data[end - 1] == '"') {
    start++;
    end--;
  }
  n = end - start;
  if (n + 1 > cap) return WLT_ERR_NOSPC;
  memcpy(out, data + start, n);
  out[n] = '\0';
  return (int)n;
}
