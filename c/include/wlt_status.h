#ifndef WLT_STATUS_H
#define WLT_STATUS_H

#include "wlt_zpl.h"

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
  int paper_out;
  int paused;
  int head_up;
  int ribbon_out;
  int buffer_full;
  int label_length_dots;
  int formats_in_buffer;
  int fault_count;
  char faults[5][16];
} wlt_host_status_t;

typedef struct {
  char model[80];
  char firmware[80];
  int dpi;
  int memory_kb;
  int has_memory;
} wlt_host_id_t;

typedef struct {
  int error_count;
  int warning_count;
  char error_words[2][16];
  char warning_words[2][16];
  int error_word_count;
  int warning_word_count;
  int flag_count;
  char flags[2][24];
} wlt_hqes_t;

int wlt_parse_hs(const uint8_t *data, size_t len, wlt_host_status_t *out);
int wlt_parse_hi(const uint8_t *data, size_t len, wlt_host_id_t *out);
int wlt_parse_hqes(const uint8_t *data, size_t len, wlt_hqes_t *out);
int wlt_parse_sgd_value(const uint8_t *data, size_t len, char *out, size_t cap);

#ifdef __cplusplus
}
#endif

#endif
