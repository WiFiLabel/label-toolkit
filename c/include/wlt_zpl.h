#ifndef WLT_ZPL_H
#define WLT_ZPL_H

#include "wlt_spec.h"

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

#define WLT_OK 0
#define WLT_ERR_INVAL (-1)
#define WLT_ERR_NOSPC (-2)
#define WLT_ERR_RANGE (-3)
#define WLT_ERR_READONLY (-4)
#define WLT_ERR_CONFIRM (-5)

int wlt_zpl_set_darkness(char *buf, size_t cap, int value);
int wlt_zpl_media_darkness(char *buf, size_t cap, int value);
int wlt_zpl_print_speed(char *buf, size_t cap, int value);
int wlt_zpl_media_type(char *buf, size_t cap, const char *kind);
int wlt_zpl_media_tracking(char *buf, size_t cap, const char *kind);
int wlt_zpl_print_width(char *buf, size_t cap, int dots);
int wlt_zpl_label_length(char *buf, size_t cap, int dots);
int wlt_zpl_calibrate(char *buf, size_t cap);
int wlt_zpl_save(char *buf, size_t cap);
int wlt_zpl_factory_reset(char *buf, size_t cap, int confirm);
int wlt_zpl_tear_off(char *buf, size_t cap, int dots);
int wlt_zpl_set_tear_off(char *buf, size_t cap, int dots, int save);
int wlt_zpl_align_target(char *buf, size_t cap, int width, int length, int top, int left, int tear);
int wlt_zpl_test_label(char *buf, size_t cap, int width, int height, const char *text);

int wlt_sgd_get(char *buf, size_t cap, const char *key);
int wlt_sgd_set(char *buf, size_t cap, const char *key, const char *value);
int wlt_sgd_do(char *buf, size_t cap, const char *key, const char *value, int confirm);

int wlt_wrap_zpl_gfa(char *buf, size_t cap, const uint8_t *bitmap, size_t bitmap_len,
                     int width_dots, int height_dots);
int wlt_wrap_epl_gw(char *buf, size_t cap, const uint8_t *bitmap, size_t bitmap_len,
                    int width_dots, int height_dots);
int wlt_wrap_tspl_bitmap(char *buf, size_t cap, const uint8_t *bitmap, size_t bitmap_len,
                         int width_dots, int height_dots);

#ifdef __cplusplus
}
#endif

#endif
