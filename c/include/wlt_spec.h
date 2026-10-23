/* GENERATED from spec/ - do not edit */
#ifndef WLT_SPEC_H
#define WLT_SPEC_H

#include <stddef.h>
#include <stdint.h>

#if defined(CONFIG_WLT_WITH_DOCS) && CONFIG_WLT_WITH_DOCS
#define WLT_WITH_DOCS 1
#endif

typedef enum {
  WLT_RISK_SAFE = 0,
  WLT_RISK_CAUTION = 1,
  WLT_RISK_DESTRUCTIVE = 2
} wlt_risk_t;

typedef enum {
  WLT_LANG_ZPL = 0,
  WLT_LANG_EPL2 = 1
} wlt_lang_t;

typedef enum {
  WLT_TYPE_ENUM = 0,
  WLT_TYPE_INT = 1,
  WLT_TYPE_STRING = 2,
  WLT_TYPE_BOOL = 3
} wlt_value_type_t;

#define WLT_ACCESS_GET 1
#define WLT_ACCESS_SET 2
#define WLT_ACCESS_DO 4

typedef enum {
  WLT_CMD_CI = 0,
  WLT_CMD_D = 1,
  WLT_CMD_FD = 2,
  WLT_CMD_FO = 3,
  WLT_CMD_FS = 4,
  WLT_CMD_GFA = 5,
  WLT_CMD_GW = 6,
  WLT_CMD_HH = 7,
  WLT_CMD_HI = 8,
  WLT_CMD_HQES = 9,
  WLT_CMD_HS = 10,
  WLT_CMD_JC = 11,
  WLT_CMD_JG = 12,
  WLT_CMD_JR = 13,
  WLT_CMD_JUF = 14,
  WLT_CMD_JUN = 15,
  WLT_CMD_JUR = 16,
  WLT_CMD_JUS = 17,
  WLT_CMD_LH = 18,
  WLT_CMD_LL = 19,
  WLT_CMD_LS = 20,
  WLT_CMD_LT = 21,
  WLT_CMD_MD = 22,
  WLT_CMD_MM = 23,
  WLT_CMD_MN = 24,
  WLT_CMD_MT = 25,
  WLT_CMD_N = 26,
  WLT_CMD_P = 27,
  WLT_CMD_PM = 28,
  WLT_CMD_PO = 29,
  WLT_CMD_PQ = 30,
  WLT_CMD_PR = 31,
  WLT_CMD_PW = 32,
  WLT_CMD_Q = 33,
  WLT_CMD_S = 34,
  WLT_CMD_SD = 35,
  WLT_CMD_TA = 36,
  WLT_CMD_UQ = 37,
  WLT_CMD_WC = 38,
  WLT_CMD_XA = 39,
  WLT_CMD_XZ = 40,
  WLT_CMD_ZB = 41,
  WLT_CMD_ZT = 42,
  WLT_CMD_LQ = 43,
  WLT_CMD_COUNT
} wlt_cmd_id_t;

typedef enum {
  WLT_SET_APPL_NAME = 0,
  WLT_SET_DEVICE_FRIENDLY_NAME = 1,
  WLT_SET_DEVICE_LANGUAGES = 2,
  WLT_SET_DEVICE_RESET = 3,
  WLT_SET_DEVICE_RESTORE_DEFAULTS = 4,
  WLT_SET_DEVICE_UNIQUE_ID = 5,
  WLT_SET_EZPL_LABEL_LENGTH_MAX = 6,
  WLT_SET_EZPL_MEDIA_TYPE = 7,
  WLT_SET_EZPL_PRINT_METHOD = 8,
  WLT_SET_EZPL_PRINT_WIDTH = 9,
  WLT_SET_EZPL_TEAR_OFF = 10,
  WLT_SET_HEAD_RESOLUTION_IN_DPI = 11,
  WLT_SET_INTERFACE_NETWORK_ACTIVE_IP_ADDR = 12,
  WLT_SET_MEDIA_DARKNESS = 13,
  WLT_SET_MEDIA_PRINTMODE = 14,
  WLT_SET_MEDIA_SENSE_MODE = 15,
  WLT_SET_MEDIA_SPEED = 16,
  WLT_SET_MEDIA_TYPE = 17,
  WLT_SET_MEDIA_WIDTH_SENSE_ENABLE = 18,
  WLT_SET_ODOMETER_TOTAL_PRINT_LENGTH = 19,
  WLT_SET_PRINT_TONE = 20,
  WLT_SET_ZPL_RELATIVE_DARKNESS = 21,
  WLT_SET_COUNT
} wlt_setting_id_t;

typedef struct {
  wlt_cmd_id_t id;
  wlt_lang_t language;
  const char *code;
  char prefix;
  wlt_risk_t risk;
  int has_range;
  int32_t min_value;
  int32_t max_value;
#ifdef WLT_WITH_DOCS
  const char *summary;
#endif
} wlt_cmd_info_t;

typedef struct {
  wlt_setting_id_t id;
  const char *key;
  wlt_value_type_t type;
  int read_only;
  int access;
  int has_range;
  int32_t min_value;
  int32_t max_value;
  const char *const *values;
  wlt_risk_t risk;
#ifdef WLT_WITH_DOCS
  const char *summary;
#endif
} wlt_setting_info_t;

extern const wlt_cmd_info_t wlt_commands[WLT_CMD_COUNT];
extern const wlt_setting_info_t wlt_settings[WLT_SET_COUNT];

const wlt_cmd_info_t *wlt_cmd_info(wlt_cmd_id_t id);
const wlt_setting_info_t *wlt_setting_by_key(const char *key);

#endif
