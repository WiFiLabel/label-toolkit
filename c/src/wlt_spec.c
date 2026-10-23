/* GENERATED from spec/ - do not edit */
#include "wlt_spec.h"

#include <string.h>

static const char *const wlt_vals_2[] = { "zpl", "epl", "hybrid_xml", 0 };
static const char *const wlt_vals_7[] = { "continuous", "gap/notch", "mark", 0 };
static const char *const wlt_vals_8[] = { "direct thermal", "thermal trans", 0 };
static const char *const wlt_vals_14[] = { "tear off", "peel off", "rewind", "cutter", "applicator", 0 };
static const char *const wlt_vals_15[] = { "gap", "bar", "continuous", 0 };
static const char *const wlt_vals_16[] = { "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "up", "down", 0 };
static const char *const wlt_vals_17[] = { "label", "tag", "journal", 0 };
static const char *const wlt_vals_18[] = { "on", "off", 0 };

const wlt_cmd_info_t wlt_commands[WLT_CMD_COUNT] = {
  { WLT_CMD_CI, WLT_LANG_ZPL, "CI", '^', WLT_RISK_CAUTION, 1, 0, 36,
#ifdef WLT_WITH_DOCS
    "Selects the character encoding used by later text fields."
#endif
  },
  { WLT_CMD_D, WLT_LANG_EPL2, "D", 0, WLT_RISK_CAUTION, 1, 0, 15,
#ifdef WLT_WITH_DOCS
    "Sets EPL2 darkness, often called density."
#endif
  },
  { WLT_CMD_FD, WLT_LANG_ZPL, "FD", '^', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Supplies the text or data for the current field."
#endif
  },
  { WLT_CMD_FO, WLT_LANG_ZPL, "FO", '^', WLT_RISK_SAFE, 1, 0, 32000,
#ifdef WLT_WITH_DOCS
    "Sets the position of the next field."
#endif
  },
  { WLT_CMD_FS, WLT_LANG_ZPL, "FS", '^', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Ends the current field."
#endif
  },
  { WLT_CMD_GFA, WLT_LANG_ZPL, "GFA", '^', WLT_RISK_SAFE, 1, 0, 0,
#ifdef WLT_WITH_DOCS
    "Prints a 1-bit image sent as ASCII hex."
#endif
  },
  { WLT_CMD_GW, WLT_LANG_EPL2, "GW", 0, WLT_RISK_SAFE, 1, 0, 32000,
#ifdef WLT_WITH_DOCS
    "Writes a raw 1-bit bitmap into the EPL image."
#endif
  },
  { WLT_CMD_HH, WLT_LANG_ZPL, "HH", '^', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Returns the configuration listing to the host instead of printing it."
#endif
  },
  { WLT_CMD_HI, WLT_LANG_ZPL, "HI", '~', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Asks the printer to identify model, firmware, resolution, and memory."
#endif
  },
  { WLT_CMD_HQES, WLT_LANG_ZPL, "HQES", '~', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Asks for the current error and warning bit words."
#endif
  },
  { WLT_CMD_HS, WLT_LANG_ZPL, "HS", '~', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Asks the printer for a three-line host status snapshot."
#endif
  },
  { WLT_CMD_JC, WLT_LANG_ZPL, "JC", '~', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Runs a media-sensor calibration and feeds several labels."
#endif
  },
  { WLT_CMD_JG, WLT_LANG_ZPL, "JG", '~', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Prints a sensor profile so you can see gap and mark levels."
#endif
  },
  { WLT_CMD_JR, WLT_LANG_ZPL, "JR", '~', WLT_RISK_DESTRUCTIVE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Restarts the printer as if power had been cycled."
#endif
  },
  { WLT_CMD_JUF, WLT_LANG_ZPL, "JUF", '^', WLT_RISK_DESTRUCTIVE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Reloads factory defaults and discards saved setup."
#endif
  },
  { WLT_CMD_JUN, WLT_LANG_ZPL, "JUN", '^', WLT_RISK_DESTRUCTIVE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Restores network settings to the factory network defaults."
#endif
  },
  { WLT_CMD_JUR, WLT_LANG_ZPL, "JUR", '^', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Recalls the last saved configuration into the running session."
#endif
  },
  { WLT_CMD_JUS, WLT_LANG_ZPL, "JUS", '^', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Writes the current configuration so it survives power off."
#endif
  },
  { WLT_CMD_LH, WLT_LANG_ZPL, "LH", '^', WLT_RISK_CAUTION, 1, 0, 32000,
#ifdef WLT_WITH_DOCS
    "Moves the origin used by later fields."
#endif
  },
  { WLT_CMD_LL, WLT_LANG_ZPL, "LL", '^', WLT_RISK_CAUTION, 1, 1, 32000,
#ifdef WLT_WITH_DOCS
    "Sets the label length in dots for the current format or calibration."
#endif
  },
  { WLT_CMD_LS, WLT_LANG_ZPL, "LS", '^', WLT_RISK_CAUTION, 1, -9999, 9999,
#ifdef WLT_WITH_DOCS
    "Shifts the image left or right."
#endif
  },
  { WLT_CMD_LT, WLT_LANG_ZPL, "LT", '^', WLT_RISK_CAUTION, 1, -120, 120,
#ifdef WLT_WITH_DOCS
    "Shifts the image up or down relative to the top of the label."
#endif
  },
  { WLT_CMD_MD, WLT_LANG_ZPL, "MD", '^', WLT_RISK_CAUTION, 1, -30, 30,
#ifdef WLT_WITH_DOCS
    "Nudges darkness up or down relative to the current base."
#endif
  },
  { WLT_CMD_MM, WLT_LANG_ZPL, "MM", '^', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Selects tear-off, peel, rewind, applicator, or cutter handling."
#endif
  },
  { WLT_CMD_MN, WLT_LANG_ZPL, "MN", '^', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Selects gap, continuous, or black-mark media tracking."
#endif
  },
  { WLT_CMD_MT, WLT_LANG_ZPL, "MT", '^', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Selects direct thermal stock or thermal transfer ribbon."
#endif
  },
  { WLT_CMD_N, WLT_LANG_EPL2, "N", 0, WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Clears the EPL image buffer before a new label."
#endif
  },
  { WLT_CMD_P, WLT_LANG_EPL2, "P", 0, WLT_RISK_SAFE, 1, 1, 9999,
#ifdef WLT_WITH_DOCS
    "Prints the current EPL image one or more times."
#endif
  },
  { WLT_CMD_PM, WLT_LANG_ZPL, "PM", '^', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Mirrors the format for printing on the reverse side of clear stock."
#endif
  },
  { WLT_CMD_PO, WLT_LANG_ZPL, "PO", '^', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Prints the format upright or rotated 180 degrees."
#endif
  },
  { WLT_CMD_PQ, WLT_LANG_ZPL, "PQ", '^', WLT_RISK_SAFE, 1, 1, 99999999,
#ifdef WLT_WITH_DOCS
    "Sets how many labels to print for the current format."
#endif
  },
  { WLT_CMD_PR, WLT_LANG_ZPL, "PR", '^', WLT_RISK_CAUTION, 1, 1, 14,
#ifdef WLT_WITH_DOCS
    "Sets how fast the media moves while printing, in inches per second."
#endif
  },
  { WLT_CMD_PW, WLT_LANG_ZPL, "PW", '^', WLT_RISK_CAUTION, 1, 2, 32000,
#ifdef WLT_WITH_DOCS
    "Sets the printable width in dots."
#endif
  },
  { WLT_CMD_Q, WLT_LANG_EPL2, "Q", 0, WLT_RISK_CAUTION, 1, 1, 32000,
#ifdef WLT_WITH_DOCS
    "Sets the label length and gap size in dots for EPL2."
#endif
  },
  { WLT_CMD_S, WLT_LANG_EPL2, "S", 0, WLT_RISK_CAUTION, 1, 1, 6,
#ifdef WLT_WITH_DOCS
    "Sets EPL2 print speed."
#endif
  },
  { WLT_CMD_SD, WLT_LANG_ZPL, "SD", '~', WLT_RISK_CAUTION, 1, 0, 30,
#ifdef WLT_WITH_DOCS
    "Sets the absolute print darkness on the 0 to 30 scale."
#endif
  },
  { WLT_CMD_TA, WLT_LANG_ZPL, "TA", '~', WLT_RISK_CAUTION, 1, -120, 120,
#ifdef WLT_WITH_DOCS
    "Adjusts how far the label is presented past the tear bar."
#endif
  },
  { WLT_CMD_UQ, WLT_LANG_EPL2, "UQ", 0, WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Asks an EPL2 printer to report its configuration."
#endif
  },
  { WLT_CMD_WC, WLT_LANG_ZPL, "WC", '~', WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Prints the configuration label."
#endif
  },
  { WLT_CMD_XA, WLT_LANG_ZPL, "XA", '^', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Opens a label format."
#endif
  },
  { WLT_CMD_XZ, WLT_LANG_ZPL, "XZ", '^', WLT_RISK_SAFE, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Closes a label format and releases it to print."
#endif
  },
  { WLT_CMD_ZB, WLT_LANG_EPL2, "ZB", 0, WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Prints the label starting at the bottom."
#endif
  },
  { WLT_CMD_ZT, WLT_LANG_EPL2, "ZT", 0, WLT_RISK_CAUTION, 0, 0, 0,
#ifdef WLT_WITH_DOCS
    "Prints the label starting at the top."
#endif
  },
  { WLT_CMD_LQ, WLT_LANG_EPL2, "q", 0, WLT_RISK_CAUTION, 1, 1, 32000,
#ifdef WLT_WITH_DOCS
    "Sets the label width in dots for EPL2."
#endif
  }
};

const wlt_setting_info_t wlt_settings[WLT_SET_COUNT] = {
  { WLT_SET_APPL_NAME, "appl.name", WLT_TYPE_STRING, 1, 1, 0, 0, 0, 0, WLT_RISK_SAFE,
#ifdef WLT_WITH_DOCS
    "Reads the application firmware name."
#endif
  },
  { WLT_SET_DEVICE_FRIENDLY_NAME, "device.friendly_name", WLT_TYPE_STRING, 0, 3, 0, 0, 0, 0, WLT_RISK_SAFE,
#ifdef WLT_WITH_DOCS
    "Reads or sets the name the printer shows to people and discovery tools."
#endif
  },
  { WLT_SET_DEVICE_LANGUAGES, "device.languages", WLT_TYPE_ENUM, 0, 3, 0, 0, 0, wlt_vals_2, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Selects whether the printer parses ZPL, EPL, or a hybrid mode."
#endif
  },
  { WLT_SET_DEVICE_RESET, "device.reset", WLT_TYPE_STRING, 0, 4, 0, 0, 0, 0, WLT_RISK_DESTRUCTIVE,
#ifdef WLT_WITH_DOCS
    "Restarts the printer through an SGD do command."
#endif
  },
  { WLT_SET_DEVICE_RESTORE_DEFAULTS, "device.restore_defaults", WLT_TYPE_STRING, 0, 4, 0, 0, 0, 0, WLT_RISK_DESTRUCTIVE,
#ifdef WLT_WITH_DOCS
    "Restores factory defaults through an SGD do command."
#endif
  },
  { WLT_SET_DEVICE_UNIQUE_ID, "device.unique_id", WLT_TYPE_STRING, 1, 1, 0, 0, 0, 0, WLT_RISK_SAFE,
#ifdef WLT_WITH_DOCS
    "Reads the printer unique id. It cannot be set."
#endif
  },
  { WLT_SET_EZPL_LABEL_LENGTH_MAX, "ezpl.label_length_max", WLT_TYPE_INT, 0, 3, 1, 1, 32000, 0, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Maximum label length the sensor will search, in dots."
#endif
  },
  { WLT_SET_EZPL_MEDIA_TYPE, "ezpl.media_type", WLT_TYPE_ENUM, 0, 3, 0, 0, 0, wlt_vals_7, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Selects continuous, gap/notch, or mark media."
#endif
  },
  { WLT_SET_EZPL_PRINT_METHOD, "ezpl.print_method", WLT_TYPE_ENUM, 0, 3, 0, 0, 0, wlt_vals_8, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Selects direct thermal or thermal transfer."
#endif
  },
  { WLT_SET_EZPL_PRINT_WIDTH, "ezpl.print_width", WLT_TYPE_INT, 0, 3, 1, 2, 32000, 0, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Print width in dots."
#endif
  },
  { WLT_SET_EZPL_TEAR_OFF, "ezpl.tear_off", WLT_TYPE_INT, 0, 3, 1, -120, 120, 0, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Tear-off present adjustment in dots."
#endif
  },
  { WLT_SET_HEAD_RESOLUTION_IN_DPI, "head.resolution.in_dpi", WLT_TYPE_INT, 1, 1, 1, 100, 600, 0, WLT_RISK_SAFE,
#ifdef WLT_WITH_DOCS
    "Reads the printhead resolution in dots per inch."
#endif
  },
  { WLT_SET_INTERFACE_NETWORK_ACTIVE_IP_ADDR, "interface.network.active.ip_addr", WLT_TYPE_STRING, 1, 1, 0, 0, 0, 0, WLT_RISK_SAFE,
#ifdef WLT_WITH_DOCS
    "Reads the IP address of the active network interface."
#endif
  },
  { WLT_SET_MEDIA_DARKNESS, "media.darkness", WLT_TYPE_INT, 0, 3, 1, 0, 30, 0, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Gets or sets absolute darkness on the 0 to 30 scale."
#endif
  },
  { WLT_SET_MEDIA_PRINTMODE, "media.printmode", WLT_TYPE_ENUM, 0, 3, 0, 0, 0, wlt_vals_14, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Selects tear-off, peel, rewind, cutter, or applicator behavior."
#endif
  },
  { WLT_SET_MEDIA_SENSE_MODE, "media.sense_mode", WLT_TYPE_ENUM, 0, 3, 0, 0, 0, wlt_vals_15, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Selects gap, bar, or continuous sensing on firmware that exposes this key."
#endif
  },
  { WLT_SET_MEDIA_SPEED, "media.speed", WLT_TYPE_ENUM, 0, 3, 0, 0, 0, wlt_vals_16, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Gets or sets print speed in inches per second."
#endif
  },
  { WLT_SET_MEDIA_TYPE, "media.type", WLT_TYPE_ENUM, 0, 3, 0, 0, 0, wlt_vals_17, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Older media-type key. Confirm the spelling on the printer."
#endif
  },
  { WLT_SET_MEDIA_WIDTH_SENSE_ENABLE, "media.width_sense.enable", WLT_TYPE_BOOL, 0, 3, 0, 0, 0, wlt_vals_18, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Turns automatic label-width sensing on or off."
#endif
  },
  { WLT_SET_ODOMETER_TOTAL_PRINT_LENGTH, "odometer.total_print_length", WLT_TYPE_STRING, 1, 1, 0, 0, 0, 0, WLT_RISK_SAFE,
#ifdef WLT_WITH_DOCS
    "Reads the lifetime print-length odometer."
#endif
  },
  { WLT_SET_PRINT_TONE, "print.tone", WLT_TYPE_INT, 0, 3, 1, 0, 30, 0, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Link-OS darkness, on the same idea as a 0 to 30 burn level."
#endif
  },
  { WLT_SET_ZPL_RELATIVE_DARKNESS, "zpl.relative_darkness", WLT_TYPE_INT, 0, 3, 1, -300, 300, 0, WLT_RISK_CAUTION,
#ifdef WLT_WITH_DOCS
    "Relative darkness in tenths, matching the relative ZPL command."
#endif
  }
};

const wlt_cmd_info_t *wlt_cmd_info(wlt_cmd_id_t id) {
  if ((int)id < 0 || id >= WLT_CMD_COUNT) {
    return 0;
  }
  return &wlt_commands[id];
}

const wlt_setting_info_t *wlt_setting_by_key(const char *key) {
  size_t i;
  if (!key) {
    return 0;
  }
  for (i = 0; i < (size_t)WLT_SET_COUNT; i++) {
    if (strcmp(wlt_settings[i].key, key) == 0) {
      return &wlt_settings[i];
    }
  }
  return 0;
}
