/* GENERATED from spec/ - do not edit */
import type { Command, PrinterProfile, Setting, StatusSpec } from "../types.ts";

export const zplCommands: Command[] = [
  {
    "id": "CI",
    "language": "zpl",
    "prefix": "^",
    "name": "Change Encoding",
    "category": "label-format",
    "syntax": "^CIa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "encoding",
        "type": "number",
        "range": [
          0,
          36
        ],
        "step": 1
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Selects the character encoding used by later text fields.",
    "explain": "Change international encoding picks the code page for later field data. The classic single-byte pages are small integers. Newer firmware also accepts UTF-8 selectors in the same command. If accented characters print as the wrong glyph, the encoding does not match the bytes you sent. Set it near the start of the format, before the text. The test label helper stays on the printer default and only sends plain ASCII, so it does not depend on a particular page. Encoding does not translate stored settings. It only affects how field data in that format is decoded.",
    "symptoms": [
      "missing-text"
    ],
    "examples": [
      {
        "title": "Select a single-byte page",
        "code": "^CI0"
      }
    ],
    "seeAlso": [
      "FD"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ci.html"
  },
  {
    "id": "FD",
    "language": "zpl",
    "prefix": "^",
    "name": "Field Data",
    "category": "label-format",
    "syntax": "^FDa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "data",
        "type": "string"
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Supplies the text or data for the current field.",
    "explain": "Field data is the payload of the current field. For a text field it is the characters to print. Barcode fields use the same command for their contents. The data runs until the field separator. A caret or tilde inside the data can be read as a new command, so the test label helper rejects those characters. An empty data command produces an empty field, which looks like a missing line rather than a printer fault. Put the origin and any font command before the data, and the separator immediately after it.",
    "symptoms": [
      "missing-text"
    ],
    "examples": [
      {
        "title": "Text field",
        "code": "^FDTEST"
      }
    ],
    "seeAlso": [
      "FO",
      "FS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-fd.html"
  },
  {
    "id": "FO",
    "language": "zpl",
    "prefix": "^",
    "name": "Field Origin",
    "category": "label-format",
    "syntax": "^FOx,y",
    "joiner": ",",
    "params": [
      {
        "key": "x",
        "name": "x",
        "type": "number",
        "range": [
          0,
          32000
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      },
      {
        "key": "y",
        "name": "y",
        "type": "number",
        "range": [
          0,
          32000
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Sets the position of the next field.",
    "explain": "Field origin places the next field at x and y dots from the label home. x grows across the label and y grows down from the leading edge in normal orientation. Every text or barcode field needs its own origin. Reusing the previous coordinate stacks fields on top of each other. Positions outside the print width or label length are clipped. If a field vanishes, check the origin before changing darkness. The test label helper uses a small origin so sample text sits inside a 4 by 6 inch page.",
    "symptoms": [
      "clipped-label",
      "misaligned"
    ],
    "examples": [
      {
        "title": "Place the next field",
        "code": "^FO20,20"
      }
    ],
    "seeAlso": [
      "FD",
      "FS",
      "LH"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-fo.html"
  },
  {
    "id": "FS",
    "language": "zpl",
    "prefix": "^",
    "name": "Field Separator",
    "category": "label-format",
    "syntax": "^FS",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Ends the current field.",
    "explain": "Field separator closes the field that was opened by an origin and data command. Without it, the next command can be swallowed as more data. Every field in a format should end with a separator before the next origin or the format end. The separator does not print anything by itself and does not change printer settings. The graphic field helper emits a separator after the hex image so the format can end cleanly.",
    "symptoms": [
      "missing-text"
    ],
    "examples": [
      {
        "title": "Close the field",
        "code": "^FS"
      }
    ],
    "seeAlso": [
      "FD",
      "FO"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-fs.html"
  },
  {
    "id": "GFA",
    "language": "zpl",
    "prefix": "^",
    "name": "Graphic Field",
    "category": "label-format",
    "syntax": "^GFAa,b,c,d,data",
    "joiner": ",",
    "params": [
      {
        "key": "a",
        "name": "compression",
        "type": "number",
        "range": [
          0,
          0
        ],
        "step": 1
      },
      {
        "key": "b",
        "name": "binary bytes",
        "type": "number",
        "range": [
          1,
          5000000
        ],
        "step": 1,
        "units": "bytes"
      },
      {
        "key": "c",
        "name": "graphic bytes",
        "type": "number",
        "range": [
          1,
          5000000
        ],
        "step": 1,
        "units": "bytes"
      },
      {
        "key": "d",
        "name": "bytes per row",
        "type": "number",
        "range": [
          1,
          2000
        ],
        "step": 1,
        "units": "bytes"
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Prints a 1-bit image sent as ASCII hex.",
    "explain": "Graphic field ASCII places a monochrome bitmap on the label. The counts are the binary size, the graphic size, and the bytes per row, followed by hex digits. This library's wrapper sends an uncompressed image: both sizes equal the packed bitmap length, and each source byte becomes two hex characters. The bitmap must be row-packed, one bit per dot, with the row padded to a whole byte. A short buffer is rejected instead of printing a torn image. The wrapper also sets print width and label length so a 4 by 6 inch page is not clipped by a narrower previous format.",
    "symptoms": [
      "clipped-label",
      "blank-labels"
    ],
    "examples": [
      {
        "title": "One black row, 8 dots",
        "code": "^XA^PW8^LL1^FO0,0^GFA,1,1,1,FF^FS^XZ"
      }
    ],
    "seeAlso": [
      "FO",
      "FS",
      "PW"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-gf.html"
  },
  {
    "id": "HH",
    "language": "zpl",
    "prefix": "^",
    "name": "Configuration to Host",
    "category": "status",
    "syntax": "^HH",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Returns the configuration listing to the host instead of printing it.",
    "explain": "Configuration to host sends the same kind of setup listing as the printed configuration label, but back up the data channel. Use it when you cannot spare a label or when a program wants the text. The reply is long and line oriented, so read until the channel goes quiet. It does not change settings. Parsing every line is out of scope for the first status helpers, which focus on identification and the short status frames. If the reply is empty, the host channel may be write-only on that interface. Fall back to the short status query.",
    "symptoms": [
      "unknown-model"
    ],
    "examples": [
      {
        "title": "Return configuration to the host",
        "code": "^XA^HH^XZ"
      }
    ],
    "seeAlso": [
      "WC",
      "HI"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-hh.html"
  },
  {
    "id": "HI",
    "language": "zpl",
    "prefix": "~",
    "name": "Host Identification",
    "category": "status",
    "syntax": "~HI",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Asks the printer to identify model, firmware, resolution, and memory.",
    "explain": "Host identification returns one comma-separated record: a model string, a firmware or configuration id, dots per millimeter, and installed memory. Eight dots per millimeter is 203 dpi, twelve is 300 dpi, and twenty-four is 600 dpi. The memory field usually ends in KB. The reply is often wrapped in the same start-of-text and end-of-text bytes as host status. Strip those before splitting on commas. Use it at connect time so width math and feature flags follow the head that is actually attached. The command does not change settings.",
    "symptoms": [
      "unknown-model"
    ],
    "examples": [
      {
        "title": "Identify the printer",
        "code": "~HI"
      }
    ],
    "seeAlso": [
      "HS",
      "HQES"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-hi.html"
  },
  {
    "id": "HQES",
    "language": "zpl",
    "prefix": "~",
    "name": "Host Query Status",
    "category": "status",
    "syntax": "~HQES",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Asks for the current error and warning bit words.",
    "explain": "Host query with the ES parameter returns the printer's current error count, warning count, and the hex words that hold the flag bits. A zero error count with empty words means the printer is not reporting a fault. A non-zero count means something such as media, ribbon, or the head needs attention. Bit positions differ by firmware, so this library exposes the words and a simple present flag instead of pretending every bit has one name. The command is safe to poll. It does not clear the fault by itself. Fix the cause, then query again.",
    "symptoms": [
      "red-light",
      "paper-out",
      "ribbon-out"
    ],
    "examples": [
      {
        "title": "Request error status",
        "code": "~HQES"
      }
    ],
    "seeAlso": [
      "HS",
      "HI"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-hq.html"
  },
  {
    "id": "HS",
    "language": "zpl",
    "prefix": "~",
    "name": "Host Status",
    "category": "status",
    "syntax": "~HS",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Asks the printer for a three-line host status snapshot.",
    "explain": "Host status returns a short machine-readable snapshot: paper, pause, label length, buffer flags, head and ribbon state, and a few counters. The reply is three comma-separated records, each wrapped in start-of-text and end-of-text bytes, then a carriage return and line feed. It does not change settings. Send it any time you need to know why a printer is idle or why a label did not move. Parsers in this library accept a partial reply. Missing lines leave the matching flags false instead of failing the whole read.",
    "symptoms": [
      "paper-out",
      "paused",
      "head-up",
      "ribbon-out"
    ],
    "examples": [
      {
        "title": "Request host status",
        "code": "~HS"
      }
    ],
    "seeAlso": [
      "HI",
      "HQES"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-hs.html"
  },
  {
    "id": "JC",
    "language": "zpl",
    "prefix": "~",
    "name": "Media Calibration",
    "category": "calibration",
    "syntax": "~JC",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Runs a media-sensor calibration and feeds several labels.",
    "explain": "Media calibration teaches the sensor where the gap, web, or mark is. The printer feeds several labels while it measures the difference between stock and the index. Run it after you change label size, liner color, or tracking mode, and whenever the printer skips or feeds a blank between good labels. The command is immediate. It does not need a format wrapper. Keep hands clear of the tear bar because the mechanism moves on its own. Calibration does not set darkness or tear-off. Do those next, with a single test label, and save the configuration if the sensor result should persist.",
    "symptoms": [
      "skipping-labels",
      "blank-labels",
      "red-light"
    ],
    "examples": [
      {
        "title": "Calibrate the media sensor",
        "code": "~JC"
      }
    ],
    "seeAlso": [
      "JG",
      "MN",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-jc.html"
  },
  {
    "id": "JG",
    "language": "zpl",
    "prefix": "~",
    "name": "Sensor Profile",
    "category": "calibration",
    "syntax": "~JG",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Prints a sensor profile so you can see gap and mark levels.",
    "explain": "The sensor profile command prints a graph of what the media sensor sees along the web. Peaks and valleys show the gap or black mark versus the label face. Use it when calibration finishes but labels still skip. A flat graph means the sensor is not seeing a difference, often because the stock is loaded wrong or the mode is continuous. The printer consumes a label to draw the graph. It does not by itself change the saved threshold. Read the shape, adjust tracking or the sensor position, then calibrate again. Save only after a normal label stops on the gap.",
    "symptoms": [
      "skipping-labels",
      "blank-labels"
    ],
    "examples": [
      {
        "title": "Print a sensor graph",
        "code": "~JG"
      }
    ],
    "seeAlso": [
      "JC",
      "MN"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-jg.html"
  },
  {
    "id": "JR",
    "language": "zpl",
    "prefix": "~",
    "name": "Power On Reset",
    "category": "reset",
    "syntax": "~JR",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "destructive",
    "summary": "Restarts the printer as if power had been cycled.",
    "explain": "Power-on reset reboots the printer. Jobs in the buffer are dropped and the mechanism restarts its power-up sequence. Use it when a save or a language change will not take effect until the next boot. Do not send it in the middle of a batch you still need. The library treats it as destructive and requires confirm. The printer will be quiet on USB for a few seconds and may renumber or re-enumerate. Wait until the head is ready, then query identification before sending another format.",
    "symptoms": [
      "printer-offline"
    ],
    "examples": [
      {
        "title": "Restart the printer",
        "code": "~JR"
      }
    ],
    "seeAlso": [
      "JUS",
      "JUF"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-jr.html"
  },
  {
    "id": "JUF",
    "language": "zpl",
    "prefix": "^",
    "name": "Factory Defaults",
    "category": "reset",
    "syntax": "^JUF",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "destructive",
    "summary": "Reloads factory defaults and discards saved setup.",
    "explain": "Factory defaults replaces the saved configuration with the values the printer shipped with. Network options, darkness, media size, and custom names can all disappear. Use it when the printer is badly mis-set and you would rather start over than untangle one field. Do not use it as a routine calibrate. The builders in this library refuse to emit it unless the caller passes an explicit confirm flag, because the effect is hard to undo. After the reload, calibrate the media and set width, length, and darkness again, then save the new baseline.",
    "symptoms": [
      "settings-lost",
      "blank-labels"
    ],
    "examples": [
      {
        "title": "Reload factory defaults",
        "code": "^XA^JUF^XZ"
      }
    ],
    "seeAlso": [
      "JUN",
      "JUR",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ju.html"
  },
  {
    "id": "JUN",
    "language": "zpl",
    "prefix": "^",
    "name": "Network Defaults",
    "category": "reset",
    "syntax": "^JUN",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "destructive",
    "summary": "Restores network settings to the factory network defaults.",
    "explain": "Network defaults reloads the factory network configuration. IP address, wireless profiles, and related print-server options can return to the shipping state. Use it when a printer is stranded on an old static address and a normal save will not clear it. It is the wrong tool for a darkness or media problem. Treat it as destructive. The library will not emit it unless confirm is set, and you should expect to rejoin the printer to the network afterwards. Media calibration and label size are left alone on many models, but do not assume that until you print a known label.",
    "symptoms": [
      "network-lost"
    ],
    "examples": [
      {
        "title": "Reload network defaults",
        "code": "^XA^JUN^XZ"
      }
    ],
    "seeAlso": [
      "JUF",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ju.html"
  },
  {
    "id": "JUR",
    "language": "zpl",
    "prefix": "^",
    "name": "Recall Settings",
    "category": "memory",
    "syntax": "^JUR",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Recalls the last saved configuration into the running session.",
    "explain": "Recall settings copies the last saved configuration back into the running session. It is how you throw away unsaved experiments without a power cycle. If you never saved, recall may restore an older baseline or the last successful save, not the values from five minutes ago. It does not factory-reset the printer. Factory reload is a different parameter on the same command family. Recall, then query host status or identification if you need to confirm the printer is idle before the next test label.",
    "symptoms": [
      "settings-lost"
    ],
    "examples": [
      {
        "title": "Recall the saved configuration",
        "code": "^XA^JUR^XZ"
      }
    ],
    "seeAlso": [
      "JUS",
      "JUF"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ju.html"
  },
  {
    "id": "JUS",
    "language": "zpl",
    "prefix": "^",
    "name": "Save Settings",
    "category": "memory",
    "syntax": "^JUS",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Writes the current configuration so it survives power off.",
    "explain": "Save settings stores the running configuration into nonvolatile memory. Darkness, width, tracking, tear-off, and similar setup values are the usual reason to send it. Send it after a setup session, not after every test nudge, so a bad experiment is easier to abandon by cycling power. The command is normally wrapped in a format start and end. It does not print a label by itself. Saving does not factory-reset the printer. If you need the original defaults, use the factory reload command instead, and only on purpose.",
    "symptoms": [
      "settings-lost"
    ],
    "examples": [
      {
        "title": "Persist the current setup",
        "code": "^XA^JUS^XZ"
      }
    ],
    "seeAlso": [
      "JUF",
      "JUR",
      "SD",
      "TA"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ju.html"
  },
  {
    "id": "LH",
    "language": "zpl",
    "prefix": "^",
    "name": "Label Home",
    "category": "label-format",
    "syntax": "^LHx,y",
    "joiner": ",",
    "params": [
      {
        "key": "x",
        "name": "x origin",
        "type": "number",
        "range": [
          0,
          32000
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      },
      {
        "key": "y",
        "name": "y origin",
        "type": "number",
        "range": [
          0,
          32000
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      }
    ],
    "persist": "^JUS",
    "sgd": null,
    "risk": "caution",
    "summary": "Moves the origin used by later fields.",
    "explain": "Label home sets the x and y origin that later field positions are measured from. It shifts a whole format without editing every coordinate. Positive x moves content to the right. Positive y moves content down the label, away from the leading edge on a normal orientation. Use a small home shift when every field is offset by the same amount. Use label top or left shift when the physical stop position is wrong but the artwork is already centered. A large home value can push fields off the printable area, which looks like missing text. Save only if you want the origin to stick for later jobs.",
    "symptoms": [
      "misaligned",
      "clipped-label"
    ],
    "examples": [
      {
        "title": "Origin 10 dots in and 10 down",
        "code": "^XA^LH10,10^XZ"
      }
    ],
    "seeAlso": [
      "LT",
      "LS",
      "FO"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-lh.html"
  },
  {
    "id": "LL",
    "language": "zpl",
    "prefix": "^",
    "name": "Label Length",
    "category": "media",
    "syntax": "^LLa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "length",
        "type": "number",
        "range": [
          1,
          32000
        ],
        "step": 1,
        "units": "dots"
      }
    ],
    "persist": "^JUS",
    "sgd": "ezpl.label_length_max",
    "risk": "caution",
    "summary": "Sets the label length in dots for the current format or calibration.",
    "explain": "Label length is the distance, in dots, that the printer treats as one label. A 6 inch label at 203 dpi is 1218 dots. On gap stock the sensor still finds the gap, and this value is a hint. On continuous stock it is the actual feed distance, so a wrong length reprints a slice of the next form. Do not use a huge length to nudge the tear bar. That feeds extra media and can look like a second blank label. Use tear-off for a small present adjustment. Set the length to the real label, calibrate, and save. Maximum label length is a related setting and should stay a little longer than one label plus the gap.",
    "symptoms": [
      "skipping-labels",
      "short-feed"
    ],
    "examples": [
      {
        "title": "6 inch label at 203 dpi",
        "code": "^XA^LL1218^XZ"
      }
    ],
    "seeAlso": [
      "PW",
      "MN",
      "TA",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ll.html"
  },
  {
    "id": "LS",
    "language": "zpl",
    "prefix": "^",
    "name": "Label Shift",
    "category": "media",
    "syntax": "^LSa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "left shift",
        "type": "number",
        "range": [
          -9999,
          9999
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      }
    ],
    "persist": "^JUS",
    "sgd": null,
    "risk": "caution",
    "summary": "Shifts the image left or right.",
    "explain": "Label shift moves the image sideways in dots. Positive values move it toward the center of a typical left-aligned head, and negative values move it back toward the left edge. Use it when the label is the right length and the right width, but the whole picture sits too far left or right. A shift that pushes ink past the stock edge wastes the head on the platen. Check a full-width frame before saving a large number. This does not change print width. Set the width to the stock, then use shift only for the leftover centering error.",
    "symptoms": [
      "misaligned",
      "clipped-label"
    ],
    "examples": [
      {
        "title": "Shift right by 12 dots",
        "code": "^XA^LS12^XZ"
      }
    ],
    "seeAlso": [
      "LT",
      "PW",
      "LH",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ls.html"
  },
  {
    "id": "LT",
    "language": "zpl",
    "prefix": "^",
    "name": "Label Top",
    "category": "media",
    "syntax": "^LTa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "top offset",
        "type": "number",
        "range": [
          -120,
          120
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      }
    ],
    "persist": "^JUS",
    "sgd": null,
    "risk": "caution",
    "summary": "Shifts the image up or down relative to the top of the label.",
    "explain": "Label top slides the printed image vertically, in dots, without changing the media feed length. Negative values move the image toward the leading edge. Use it when the art is consistently high or low but the gap still stops in the right place. It does not fix a sensor that is tracking the wrong feature. The usual working window is about -120 to 120 dots. At 203 dpi, 8 dots is roughly one millimeter. Adjust with a crosshair label, then save. Tear-off is the separate control for where the gap sits on the tear bar.",
    "symptoms": [
      "misaligned"
    ],
    "examples": [
      {
        "title": "Move image down 20 dots",
        "code": "^XA^LT20^XZ"
      }
    ],
    "seeAlso": [
      "LS",
      "TA",
      "LH",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-lt.html"
  },
  {
    "id": "MD",
    "language": "zpl",
    "prefix": "^",
    "name": "Media Darkness",
    "category": "print-quality",
    "syntax": "^MDa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "darkness adjustment",
        "type": "number",
        "range": [
          -30,
          30
        ],
        "step": 0.1,
        "units": "relative",
        "default": 0
      }
    ],
    "persist": "^JUS",
    "sgd": "media.darkness",
    "risk": "caution",
    "summary": "Nudges darkness up or down relative to the current base.",
    "explain": "Media darkness shifts the current burn level by a signed amount instead of replacing it. Positive values print darker and negative values print lighter. Each command is applied to the darkness already stored, so two small steps are not the same as asking for an absolute level of zero. Start with a change of one or two when a label is slightly light or slightly heavy, then print again before moving further. The useful range is about -30 to 30, and the head still clamps at the ends of the absolute scale. Save once the scan quality is stable.",
    "symptoms": [
      "faded-print",
      "too-dark-print"
    ],
    "examples": [
      {
        "title": "Make print slightly darker",
        "code": "^XA^MD5^XZ"
      }
    ],
    "seeAlso": [
      "SD",
      "PR",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-md.html"
  },
  {
    "id": "MM",
    "language": "zpl",
    "prefix": "^",
    "name": "Print Mode",
    "category": "media",
    "syntax": "^MMa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "mode",
        "type": "enum",
        "values": [
          "T",
          "P",
          "R",
          "A",
          "C",
          "D"
        ],
        "default": "T"
      }
    ],
    "persist": "^JUS",
    "sgd": "media.printmode",
    "risk": "caution",
    "summary": "Selects tear-off, peel, rewind, applicator, or cutter handling.",
    "explain": "Print mode tells the printer what to do with the label after it is imaged. T is tear-off, P is peel, R is rewind, A is applicator, C is cutter, and D is a delayed cut. A desktop shipping printer with no peeler should stay on tear-off. Peel mode on a machine with no take-up spindle will pause or present the label in a way that looks like a jam. Cutter modes should be used only when a cutter is fitted. Sending them to a plain desktop does not add a cutter. Save after the present position looks right. Tear-off position is a separate adjustment from this mode.",
    "symptoms": [
      "misaligned",
      "not-presenting"
    ],
    "examples": [
      {
        "title": "Tear-off present",
        "code": "^XA^MMT^XZ"
      }
    ],
    "seeAlso": [
      "TA",
      "MN",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-mm.html"
  },
  {
    "id": "MN",
    "language": "zpl",
    "prefix": "^",
    "name": "Media Tracking",
    "category": "media",
    "syntax": "^MNa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "tracking",
        "type": "enum",
        "values": [
          "Y",
          "N",
          "W",
          "M"
        ],
        "default": "Y"
      }
    ],
    "persist": "^JUS",
    "sgd": "ezpl.media_type",
    "risk": "caution",
    "summary": "Selects gap, continuous, or black-mark media tracking.",
    "explain": "Media tracking tells the sensor how to find the start of the next label. Y and W look for a gap or web, M looks for a black mark, and N means continuous stock with no index. Die-cut shipping labels almost always want gap tracking. Receipt-style continuous stock wants N, or the printer will hunt for a gap that is not there and feed a long strip. Black-mark stock that is set to gap tracking skips or stops in the wrong place. Calibrate after changing this, then save. If labels drift by a fixed amount after the right tracking mode is set, adjust label top or tear-off rather than flipping the sensor mode again.",
    "symptoms": [
      "skipping-labels",
      "blank-labels",
      "misaligned"
    ],
    "examples": [
      {
        "title": "Gap sensing for die-cut labels",
        "code": "^XA^MNY^XZ"
      }
    ],
    "seeAlso": [
      "MT",
      "JC",
      "LL",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-mn.html"
  },
  {
    "id": "MT",
    "language": "zpl",
    "prefix": "^",
    "name": "Media Type",
    "category": "media",
    "syntax": "^MTa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "method",
        "type": "enum",
        "values": [
          "T",
          "D"
        ],
        "default": "D"
      }
    ],
    "persist": "^JUS",
    "sgd": "ezpl.print_method",
    "risk": "caution",
    "summary": "Selects direct thermal stock or thermal transfer ribbon.",
    "explain": "Media type tells the printer whether heat should mark coated stock directly or melt a ribbon onto ordinary labels. Direct thermal uses D. Thermal transfer uses T and expects a ribbon that matches the label face. The wrong choice is a common cause of blank labels: transfer mode with no ribbon, or direct mode on stock that needs a ribbon. Set it before calibration, print one label, and save. Leaving the wrong mode in place wastes media and can glaze the head.",
    "symptoms": [
      "blank-labels",
      "ribbon-wrinkle"
    ],
    "examples": [
      {
        "title": "Direct thermal",
        "code": "^XA^MTD^XZ"
      },
      {
        "title": "Thermal transfer",
        "code": "^XA^MTT^XZ"
      }
    ],
    "seeAlso": [
      "MN",
      "SD",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-mt.html"
  },
  {
    "id": "PM",
    "language": "zpl",
    "prefix": "^",
    "name": "Print Mirror",
    "category": "label-format",
    "syntax": "^PMa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "mirror",
        "type": "enum",
        "values": [
          "Y",
          "N"
        ],
        "default": "N"
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Mirrors the format for printing on the reverse side of clear stock.",
    "explain": "Print mirror flips the format horizontally so it reads correctly through clear media when the ink is on the back. Y enables the mirror for the format and N returns to a normal image. Leave it off for ordinary paper labels. A mirrored label looks like a backwards printer problem. Check this flag before recalibrating the sensor. Mirror is a format-time choice. It does not replace print orientation, which rotates rather than flips.",
    "symptoms": [
      "misaligned"
    ],
    "examples": [
      {
        "title": "Turn mirroring off",
        "code": "^XA^PMN^XZ"
      }
    ],
    "seeAlso": [
      "PO"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-pm.html"
  },
  {
    "id": "PO",
    "language": "zpl",
    "prefix": "^",
    "name": "Print Orientation",
    "category": "label-format",
    "syntax": "^POa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "orientation",
        "type": "enum",
        "values": [
          "N",
          "I"
        ],
        "default": "N"
      }
    ],
    "persist": "^JUS",
    "sgd": null,
    "risk": "caution",
    "summary": "Prints the format upright or rotated 180 degrees.",
    "explain": "Print orientation turns the whole format. N is the normal direction and I rotates it 180 degrees. Use the inverted setting when the printer is loaded so the leading edge is the bottom of the artwork, which is common on some peel and rewind paths. Inversion is not a substitute for fixing a shifted image. If only one field is upside down, the field itself has its own rotation. Confirm with a label that has a single asymmetric mark, then save if every job should share that orientation.",
    "symptoms": [
      "misaligned"
    ],
    "examples": [
      {
        "title": "Invert the format",
        "code": "^XA^POI^XZ"
      }
    ],
    "seeAlso": [
      "LH",
      "LT"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-po.html"
  },
  {
    "id": "PQ",
    "language": "zpl",
    "prefix": "^",
    "name": "Print Quantity",
    "category": "label-format",
    "syntax": "^PQq,p,r,o",
    "joiner": ",",
    "params": [
      {
        "key": "q",
        "name": "quantity",
        "type": "number",
        "range": [
          1,
          99999999
        ],
        "step": 1,
        "units": "labels",
        "default": 1
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Sets how many labels to print for the current format.",
    "explain": "Print quantity repeats the current format. The first number is how many labels to produce. Later numbers can insert pauses and serial replicates. A setup tool usually sends 1 so a test does not run the whole roll. Production jobs send the real count. Quantity does not change darkness, speed, or media size. If the first label is wrong, stop the printer before the rest of the batch follows it. The command belongs inside a format, after the fields and before the format end.",
    "symptoms": [
      "extra-labels"
    ],
    "examples": [
      {
        "title": "Print a single test",
        "code": "^XA^PQ1^XZ"
      }
    ],
    "seeAlso": [
      "XA",
      "XZ"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-pq.html"
  },
  {
    "id": "PR",
    "language": "zpl",
    "prefix": "^",
    "name": "Print Rate",
    "category": "print-quality",
    "syntax": "^PRp,s,b",
    "joiner": ",",
    "params": [
      {
        "key": "p",
        "name": "print speed",
        "type": "number",
        "range": [
          1,
          14
        ],
        "step": 1,
        "units": "ips"
      }
    ],
    "persist": "^JUS",
    "sgd": "media.speed",
    "risk": "caution",
    "summary": "Sets how fast the media moves while printing, in inches per second.",
    "explain": "Print rate picks the media speed used while the head is printing. Optional later fields can set slew and backfeed speeds, but a single number is enough for setup. Slower speeds usually make small barcodes cleaner. Faster speeds shorten a batch and often need a darker setting to keep the same contrast. The printer silently clamps a number that is higher than the mechanism can run, so a desktop that tops out at 6 ips will not actually run at 12. Change speed with a known label, not during a live order, and save only after the barcode still scans.",
    "symptoms": [
      "faded-print",
      "slow-throughput"
    ],
    "examples": [
      {
        "title": "Print at 4 inches per second",
        "code": "^XA^PR4^XZ"
      }
    ],
    "seeAlso": [
      "SD",
      "MD",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-pr-print-rate.html"
  },
  {
    "id": "PW",
    "language": "zpl",
    "prefix": "^",
    "name": "Print Width",
    "category": "media",
    "syntax": "^PWa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "width",
        "type": "number",
        "range": [
          2,
          32000
        ],
        "step": 1,
        "units": "dots"
      }
    ],
    "persist": "^JUS",
    "sgd": "ezpl.print_width",
    "risk": "caution",
    "summary": "Sets the printable width in dots.",
    "explain": "Print width limits how far across the head the printer will image, measured in dots. A 4 inch label at 203 dpi is 812 dots wide. If the width is narrower than the artwork, the right side of the label is clipped. If it is wider than the stock, the head burns on the platen and wears early. The firmware clamps to the head that is installed, so a number copied from a 300 dpi model is not automatically correct on a 203 dpi model. Set width before a calibration or a framed test label, then save. Pair it with label length so the page matches the physical stock.",
    "symptoms": [
      "clipped-label",
      "misaligned"
    ],
    "examples": [
      {
        "title": "4 inch label at 203 dpi",
        "code": "^XA^PW812^XZ"
      }
    ],
    "seeAlso": [
      "LL",
      "LH",
      "LS",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-pw.html"
  },
  {
    "id": "SD",
    "language": "zpl",
    "prefix": "~",
    "name": "Set Darkness",
    "category": "print-quality",
    "syntax": "~SDa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "darkness",
        "type": "number",
        "range": [
          0,
          30
        ],
        "step": 0.1,
        "units": "absolute"
      }
    ],
    "persist": "^JUS",
    "sgd": "media.darkness",
    "risk": "caution",
    "summary": "Sets the absolute print darkness on the 0 to 30 scale.",
    "explain": "Absolute darkness chooses how hard the printhead burns for later labels, from a light setting near zero up to the darkest step the firmware allows. Use a higher value when barcodes look pale, and a lower value when dots swell, the ribbon wrinkles, or the head feels too hot to leave running. This is the base level. A relative darkness command afterwards adds or subtracts from it instead of naming a new base. Save after you are happy with a test label, because some models drop the change at power off until a save is sent.",
    "symptoms": [
      "faded-print",
      "too-dark-print"
    ],
    "examples": [
      {
        "title": "Set a mid darkness",
        "code": "~SD15"
      }
    ],
    "seeAlso": [
      "MD",
      "PR",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-sd.html"
  },
  {
    "id": "TA",
    "language": "zpl",
    "prefix": "~",
    "name": "Tear Off",
    "category": "media",
    "syntax": "~TAaaa",
    "joiner": "",
    "params": [
      {
        "key": "a",
        "name": "tear off",
        "type": "number",
        "range": [
          -120,
          120
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      }
    ],
    "persist": "^JUS",
    "sgd": "ezpl.tear_off",
    "risk": "caution",
    "summary": "Adjusts how far the label is presented past the tear bar.",
    "explain": "Tear-off adds or removes a small present distance after the label is printed, so the gap lines up with the tear bar. Positive values feed farther out. Negative values stop sooner. The practical range on desktop models is about -120 to 120 dots. At 203 dpi, eight dots is about one millimeter. If the gap stops short of the bar by a couple of millimeters, add a modest positive value and print once. Do not lengthen the label to chase the tear bar. That often feeds a second label. Save with the configuration save command when the stop looks right.",
    "symptoms": [
      "misaligned",
      "not-presenting"
    ],
    "examples": [
      {
        "title": "Present 120 dots farther",
        "code": "~TA120"
      },
      {
        "title": "Present 60 dots less",
        "code": "~TA-060"
      }
    ],
    "seeAlso": [
      "MM",
      "LL",
      "JUS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-ta.html"
  },
  {
    "id": "WC",
    "language": "zpl",
    "prefix": "~",
    "name": "Print Configuration",
    "category": "status",
    "syntax": "~WC",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Prints the configuration label.",
    "explain": "Print configuration feeds one label that lists the running setup: darkness, print mode, network, and firmware, among other lines. It is the fastest way to see what the printer believes without a parser. It does consume a label, so do not send it in a tight loop. The printed page is for a person. Host status and identification are the machine-readable equivalents when a program needs the same facts. If the configuration label itself is blank, fix media type and darkness before trusting any value on it.",
    "symptoms": [
      "blank-labels"
    ],
    "examples": [
      {
        "title": "Print the config label",
        "code": "~WC"
      }
    ],
    "seeAlso": [
      "HH",
      "HI",
      "HS"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-wc.html"
  },
  {
    "id": "XA",
    "language": "zpl",
    "prefix": "^",
    "name": "Start Format",
    "category": "label-format",
    "syntax": "^XA",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Opens a label format.",
    "explain": "Start format marks the beginning of a label description. Field commands, sizes, and the print quantity belong after it and before the matching end. Most setup commands are also accepted inside the format. Immediate tilde commands such as calibration can stand alone outside it. A missing start causes the printer to ignore or mis-group the following fields. Always pair it with an end format. The builders that print a test label include both ends so a caller cannot forget the wrapper.",
    "symptoms": [],
    "examples": [
      {
        "title": "Open a format",
        "code": "^XA"
      }
    ],
    "seeAlso": [
      "XZ",
      "FO",
      "FD"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-xa.html"
  },
  {
    "id": "XZ",
    "language": "zpl",
    "prefix": "^",
    "name": "End Format",
    "category": "label-format",
    "syntax": "^XZ",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Closes a label format and releases it to print.",
    "explain": "End format closes the label description opened by start format. The printer then images and prints according to the quantity and media settings. Leaving it off parks the format in the buffer, which looks like a printer that accepted bytes and did nothing. Send it once per label description. A second end without a new start does not print another copy. Use print quantity for repeats. Configuration saves are often wrapped in their own tiny format so they are committed even when no artwork is printed.",
    "symptoms": [
      "no-print"
    ],
    "examples": [
      {
        "title": "Close a format",
        "code": "^XZ"
      }
    ],
    "seeAlso": [
      "XA",
      "PQ"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-xz.html"
  }
];

export const eplCommands: Command[] = [
  {
    "id": "D",
    "language": "epl2",
    "prefix": "",
    "name": "Density",
    "category": "print-quality",
    "syntax": "Dn",
    "joiner": "",
    "params": [
      {
        "key": "n",
        "name": "density",
        "type": "number",
        "range": [
          0,
          15
        ],
        "step": 1
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Sets EPL2 darkness, often called density.",
    "explain": "Density is the EPL2 darkness control. Larger numbers burn hotter, up to a small integer ceiling around 15 on classic desktop firmware. Raise it when print is gray. Lower it when the label looks blotchy or the head is leaving a shiny track. It is not the same scale as ZPL darkness, which runs to 30. Do not copy a ZPL number straight into this command. Change it one step at a time and print. The graphic wrapper does not set density for you.",
    "symptoms": [
      "faded-print",
      "too-dark-print"
    ],
    "examples": [
      {
        "title": "Mid density",
        "code": "D8"
      }
    ],
    "seeAlso": [
      "S",
      "P"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "GW",
    "language": "epl2",
    "prefix": "",
    "name": "Graphic Write",
    "category": "label-format",
    "syntax": "GWx,y,w,h,data",
    "joiner": ",",
    "params": [
      {
        "key": "x",
        "name": "x",
        "type": "number",
        "range": [
          0,
          32000
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      },
      {
        "key": "y",
        "name": "y",
        "type": "number",
        "range": [
          0,
          32000
        ],
        "step": 1,
        "units": "dots",
        "default": 0
      },
      {
        "key": "w",
        "name": "bytes per row",
        "type": "number",
        "range": [
          1,
          2000
        ],
        "step": 1,
        "units": "bytes"
      },
      {
        "key": "h",
        "name": "height",
        "type": "number",
        "range": [
          1,
          32000
        ],
        "step": 1,
        "units": "dots"
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Writes a raw 1-bit bitmap into the EPL image.",
    "explain": "Graphic write places a packed bitmap at x and y. The width argument is bytes per row, not dots, and the height is in dot rows. The bitmap bytes follow the comma immediately, with no hex encoding. A row is padded to a whole byte, the same packing used for a ZPL graphic. The wrapper clears the buffer, writes the image at the origin, and prints one copy. It rejects a buffer shorter than width times height. Because the payload is binary, do not log it as text. A broken length clips the picture or eats the following print command.",
    "symptoms": [
      "clipped-label",
      "blank-labels"
    ],
    "examples": [
      {
        "title": "Origin and size header",
        "code": "GW0,0,1,8,"
      }
    ],
    "seeAlso": [
      "N",
      "P"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "N",
    "language": "epl2",
    "prefix": "",
    "name": "Clear Buffer",
    "category": "label-format",
    "syntax": "N",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Clears the EPL image buffer before a new label.",
    "explain": "Clear buffer throws away the image currently built in an EPL2 printer so the next commands start from a blank page. Send it at the beginning of every label. Skipping it overlays the new art on whatever was left from the previous job. It does not calibrate, and it does not change width, length, speed, or darkness. The graphic wrapper emits this command before the bitmap so a stale image cannot show through.",
    "symptoms": [
      "ghost-image"
    ],
    "examples": [
      {
        "title": "Clear the buffer",
        "code": "N"
      }
    ],
    "seeAlso": [
      "P",
      "GW"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "P",
    "language": "epl2",
    "prefix": "",
    "name": "Print",
    "category": "label-format",
    "syntax": "Pn",
    "joiner": "",
    "params": [
      {
        "key": "n",
        "name": "copies",
        "type": "number",
        "range": [
          1,
          9999
        ],
        "step": 1,
        "units": "labels",
        "default": 1
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Prints the current EPL image one or more times.",
    "explain": "Print sends the current EPL image to the head. The number is how many copies to make. A setup flow uses 1. Forgetting the command leaves the image in the buffer and nothing comes out of the printer. The graphic wrapper always prints a single copy after the bitmap so the host does not have to remember the trailer. Printing does not save settings. Width and density stay as they were for the next job until something changes them.",
    "symptoms": [
      "no-print"
    ],
    "examples": [
      {
        "title": "Print one label",
        "code": "P1"
      }
    ],
    "seeAlso": [
      "N",
      "GW"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "Q",
    "language": "epl2",
    "prefix": "",
    "name": "Set Length",
    "category": "media",
    "syntax": "Qlll,ggg",
    "joiner": ",",
    "params": [
      {
        "key": "l",
        "name": "length",
        "type": "number",
        "range": [
          1,
          32000
        ],
        "step": 1,
        "units": "dots"
      },
      {
        "key": "g",
        "name": "gap",
        "type": "number",
        "range": [
          0,
          32000
        ],
        "step": 1,
        "units": "dots"
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Sets the label length and gap size in dots for EPL2.",
    "explain": "The uppercase length command sets how long each label is and how large the gap between labels is, both in dots. A 6 inch label at 203 dpi uses 1218 as the length. The gap is the liner that shows between die-cut labels, often a few millimeters. Continuous stock uses a gap of zero. A non-zero gap on continuous stock makes the printer hunt and feed extra paper. This is not the lowercase width command. Set both, then print a single copy before saving a workflow around them.",
    "symptoms": [
      "skipping-labels",
      "short-feed"
    ],
    "examples": [
      {
        "title": "6 inch label with a small gap",
        "code": "Q1218,24"
      }
    ],
    "seeAlso": [
      "q",
      "P"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "S",
    "language": "epl2",
    "prefix": "",
    "name": "Speed",
    "category": "print-quality",
    "syntax": "Sn",
    "joiner": "",
    "params": [
      {
        "key": "n",
        "name": "speed",
        "type": "number",
        "range": [
          1,
          6
        ],
        "step": 1,
        "units": "ips"
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Sets EPL2 print speed.",
    "explain": "Speed selects how fast an EPL2 printer moves the media. Typical desktop values run from 1 to 6, and the mechanism clamps anything higher. Slow down when a barcode prints light at the current darkness. Speed and density trade against each other. The command is a single letter and an integer. It is not the ZPL print-rate command, and mixing the two languages in one job confuses the parser. Set speed before the print command for that label.",
    "symptoms": [
      "faded-print"
    ],
    "examples": [
      {
        "title": "Medium speed",
        "code": "S3"
      }
    ],
    "seeAlso": [
      "D",
      "P"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "UQ",
    "language": "epl2",
    "prefix": "",
    "name": "Configuration Query",
    "category": "status",
    "syntax": "UQ",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "safe",
    "summary": "Asks an EPL2 printer to report its configuration.",
    "explain": "Configuration query asks an EPL2 printer to send its setup text back to the host. The reply is a human-readable listing, not the ZPL host-status frame. Use it to see width, length, and density when you cannot print a configuration label. The command does not clear the image buffer and does not start a calibration. Read until the channel is quiet, because the listing is more than one line. ZPL identification is a different command. Send this one only after the printer is actually in EPL mode.",
    "symptoms": [
      "unknown-model"
    ],
    "examples": [
      {
        "title": "Query configuration",
        "code": "UQ"
      }
    ],
    "seeAlso": [
      "N"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "ZB",
    "language": "epl2",
    "prefix": "",
    "name": "Print Bottom First",
    "category": "label-format",
    "syntax": "ZB",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Prints the label starting at the bottom.",
    "explain": "Print bottom first reverses the EPL2 imaging direction so the bottom of the format comes out of the printer first. Use it when the stock path presents the label upside down relative to the artwork. The companion command prints top first. Direction is easy to confuse with a bad sensor. If the art is complete but rotated, change direction before you recalibrate. Send it once before the fields. It stays in effect until the other direction command replaces it.",
    "symptoms": [
      "misaligned"
    ],
    "examples": [
      {
        "title": "Bottom first",
        "code": "ZB"
      }
    ],
    "seeAlso": [
      "ZT",
      "P"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "ZT",
    "language": "epl2",
    "prefix": "",
    "name": "Print Top First",
    "category": "label-format",
    "syntax": "ZT",
    "joiner": "",
    "params": [],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Prints the label starting at the top.",
    "explain": "Print top first is the usual EPL2 direction: the top of the format leads out of the printer. Send it to undo a previous bottom-first command when labels suddenly look upside down after a shared printer was reconfigured. It does not move the image in dots. Width, length, and the graphic origin still decide placement. Pair it with a single test print. Direction changes are persistent on many older firmware builds until they are replaced.",
    "symptoms": [
      "misaligned"
    ],
    "examples": [
      {
        "title": "Top first",
        "code": "ZT"
      }
    ],
    "seeAlso": [
      "ZB",
      "P"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  },
  {
    "id": "q",
    "language": "epl2",
    "prefix": "",
    "name": "Set Width",
    "category": "media",
    "syntax": "qnnn",
    "joiner": "",
    "params": [
      {
        "key": "n",
        "name": "width",
        "type": "number",
        "range": [
          1,
          32000
        ],
        "step": 1,
        "units": "dots"
      }
    ],
    "persist": null,
    "sgd": null,
    "risk": "caution",
    "summary": "Sets the label width in dots for EPL2.",
    "explain": "The lowercase width command sets how many dots across the EPL2 page is. A 4 inch label at 203 dpi is 812 dots. Uppercase Q is a different command and sets length, not width. The two letters must not be swapped. A width wider than the head prints into the platen. A width that is too narrow clips the right side of a graphic. Send it after clearing the buffer and before the graphic or text. Older Eltron-style firmware keeps the value until it is changed again.",
    "symptoms": [
      "clipped-label"
    ],
    "examples": [
      {
        "title": "4 inch width at 203 dpi",
        "code": "q812"
      }
    ],
    "seeAlso": [
      "Q",
      "GW"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html"
  }
];

export const settings: Setting[] = [
  {
    "key": "appl.name",
    "type": "string",
    "readOnly": true,
    "access": [
      "getvar"
    ],
    "zplEquivalent": null,
    "risk": "safe",
    "summary": "Reads the application firmware name.",
    "explain": "Application name reports the firmware application currently running, which is how you tell a ZPL build from an unexpected download. The value is read-only. It changes when firmware is updated, not when you save darkness or width. Pair it with host identification. One gives a model line and the other gives the application package name. If a feature in this spec is missing on the printer, quote this string in a bug report along with the model.",
    "symptoms": [
      "unknown-model"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-appl-name.html"
  },
  {
    "key": "device.friendly_name",
    "type": "string",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": null,
    "risk": "safe",
    "summary": "Reads or sets the name the printer shows to people and discovery tools.",
    "explain": "Friendly name is a short human label stored on the printer, such as the bench it sits on. It is not the serial number and not the model string. Get returns a quoted string. An empty reply or a question mark means the printer has no custom name. Set replaces the name. Avoid quotes and control characters. The helper rejects them so the SGD frame cannot be broken. Renaming does not change how labels print. It only helps you tell two printers apart on a shared bench.",
    "symptoms": [],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-friendly-name.html"
  },
  {
    "key": "device.languages",
    "type": "enum",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": null,
    "risk": "caution",
    "summary": "Selects whether the printer parses ZPL, EPL, or a hybrid mode.",
    "explain": "Device language chooses the command language the printer expects on its host ports. Common values are zpl, epl, and hybrid_xml. A printer left in EPL ignores ZPL setup, which looks like a dead USB port. Switch language, then send a command from the new language only. Some firmware applies the change on the next job, and some want a restart. Query the key again before assuming it stuck. This library validates the three common names and rejects anything else so a typo cannot push the printer into an unknown mode.",
    "symptoms": [
      "no-print",
      "blank-labels"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-languages.html",
    "values": [
      "zpl",
      "epl",
      "hybrid_xml"
    ]
  },
  {
    "key": "device.reset",
    "type": "string",
    "readOnly": false,
    "access": [
      "do"
    ],
    "zplEquivalent": "JR",
    "risk": "destructive",
    "summary": "Restarts the printer through an SGD do command.",
    "explain": "Device reset is an action, not a stored value. Sending do runs a restart similar to a power cycle. Jobs in memory are lost. Use it after a language or network change that will not apply until boot, not as a way to clear a paper fault. The setter refuses a normal set, because this key is not a setvar. The do helper also requires an explicit confirm flag. Wait for the printer to enumerate again, then read identification before the next label.",
    "symptoms": [
      "printer-offline"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-reset.html"
  },
  {
    "key": "device.restore_defaults",
    "type": "string",
    "readOnly": false,
    "access": [
      "do"
    ],
    "zplEquivalent": "JUF",
    "risk": "destructive",
    "summary": "Restores factory defaults through an SGD do command.",
    "explain": "Restore defaults is the SGD action that puts saved setup back to the factory baseline. Darkness, size, and network options can all reset. Use it when the configuration is untrustworthy. It is not a media calibration and it will not fix a hardware fault. The library requires confirm before it will emit the do command. There is no setvar form. After it finishes, set media type, width, and darkness again and save the new baseline on purpose.",
    "symptoms": [
      "settings-lost"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-restore-defaults.html"
  },
  {
    "key": "device.unique_id",
    "type": "string",
    "readOnly": true,
    "access": [
      "getvar"
    ],
    "zplEquivalent": null,
    "risk": "safe",
    "summary": "Reads the printer unique id. It cannot be set.",
    "explain": "Unique id is a factory identifier for the device. Programs use it to tell two printers of the same model apart. The key is read-only. A set attempt is rejected by this library and should be rejected by the printer as well. Do not treat it as a secret password, but do not publish it in screenshots if the workflow uses it as an account key. If the reply is empty, fall back to the identification string from the host identification command.",
    "symptoms": [
      "unknown-model"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-device-unique-id.html"
  },
  {
    "key": "ezpl.label_length_max",
    "type": "int",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "LL",
    "risk": "caution",
    "summary": "Maximum label length the sensor will search, in dots.",
    "explain": "Maximum label length is how far the printer will travel while looking for a gap or mark before it assumes continuous media. Set it a little longer than one real label plus the gap. If it is shorter than the label, calibration decides the stock is continuous and then skips. It is not the same number as the format label length, but the two have to agree in spirit: the format length is one label, and this ceiling must be larger. The accepted range here is 1 to 32000 dots. Confirm on the printer. An absurdly large ceiling makes a missing gap feed a long strip.",
    "symptoms": [
      "skipping-labels",
      "short-feed"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-ezpl-label-length-max.html",
    "range": [
      1,
      32000
    ],
    "units": "dots"
  },
  {
    "key": "ezpl.media_type",
    "type": "enum",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "MN",
    "risk": "caution",
    "summary": "Selects continuous, gap/notch, or mark media.",
    "explain": "EZPL media type is the Link-OS stock selector. Continuous has no index, gap/notch is die-cut labels, and mark is black-mark stock. It corresponds to the ZPL media tracking command. Shipping labels are almost always gap/notch. Set this before calibration. The sensor uses it to decide what a valid index looks like. The default on many models is gap/notch. If you load continuous receipt stock, change it or the printer will keep searching for a gap.",
    "symptoms": [
      "skipping-labels",
      "blank-labels"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-ezpl-media-type.html",
    "values": [
      "continuous",
      "gap/notch",
      "mark"
    ]
  },
  {
    "key": "ezpl.print_method",
    "type": "enum",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "MT",
    "risk": "caution",
    "summary": "Selects direct thermal or thermal transfer.",
    "explain": "Print method chooses direct thermal or thermal transfer. The tokens used here are direct thermal and thermal trans, which is the short form many firmware builds store. Direct thermal needs coated stock and no ribbon. Transfer needs a ribbon. The mismatch is a blank label with a healthy status. If a set is rejected, get the key and copy the printer's own spelling, then widen this list in a spec change. Method is independent from darkness. A darker setting will not make transfer mode mark direct stock.",
    "symptoms": [
      "blank-labels",
      "ribbon-wrinkle"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-ezpl-print-method.html",
    "values": [
      "direct thermal",
      "thermal trans"
    ]
  },
  {
    "key": "ezpl.print_width",
    "type": "int",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "PW",
    "risk": "caution",
    "summary": "Print width in dots.",
    "explain": "EZPL print width is the stored printable width in dots. It matches the ZPL print-width command. A 4 inch label at 203 dpi is 812 dots. The same physical width at 300 dpi is a larger dot count, so do not reuse a number across heads. This library accepts 2 to 32000 and lets the printer clamp to the real head. Still send the true label width, not the head maximum, when the stock is narrower. Set width, print a frame, and only then save. A too-wide value wears the platen where there is no media.",
    "symptoms": [
      "clipped-label"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-ezpl-print-width.html",
    "range": [
      2,
      32000
    ],
    "units": "dots"
  },
  {
    "key": "ezpl.tear_off",
    "type": "int",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "TA",
    "risk": "caution",
    "summary": "Tear-off present adjustment in dots.",
    "explain": "Tear-off is the SGD form of the present adjustment. Positive numbers feed the label farther out of the printer and negative numbers stop it sooner. The working window checked here is -120 to 120 dots, matching the ZPL tear-off command used on desktop mechanisms. At 203 dpi, eight dots is about a millimeter. Change it in small steps and print one label between tries. Do not encode a large present distance as extra label length. That feeds another label. This key is the small trim.",
    "symptoms": [
      "misaligned",
      "not-presenting"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-ezpl-tear-off.html",
    "range": [
      -120,
      120
    ],
    "units": "dots"
  },
  {
    "key": "head.resolution.in_dpi",
    "type": "int",
    "readOnly": true,
    "access": [
      "getvar"
    ],
    "zplEquivalent": null,
    "risk": "safe",
    "summary": "Reads the printhead resolution in dots per inch.",
    "explain": "Head resolution reports 203, 300, or 600 on typical heads. It is read-only because the head, not a setting, decides it. Use the value to convert millimeters to dots. A 4 inch label is 812 dots at 203 dpi and about 1200 dots at 300 dpi. Host identification reports dots per millimeter instead. Eight dots per millimeter matches 203 dpi. Prefer this key when it answers. If the key is missing, fall back to the identification record rather than assuming 203.",
    "symptoms": [
      "unknown-model"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-head-resolution-in-dpi.html",
    "range": [
      100,
      600
    ],
    "units": "dpi"
  },
  {
    "key": "interface.network.active.ip_addr",
    "type": "string",
    "readOnly": true,
    "access": [
      "getvar"
    ],
    "zplEquivalent": null,
    "risk": "safe",
    "summary": "Reads the IP address of the active network interface.",
    "explain": "Active IP address returns the address the printer is using right now on whichever interface is up. It is a get-only view, not the place to configure a static address. A typical reply is a dotted IPv4 string. No address, or zeros, means the interface has not obtained one. The library rejects a set so a tool cannot accidentally write this key. Change address through the documented configurable IP keys if you must. Pair the value with identification when you file a printer report, and do not treat it as stable across DHCP renewals.",
    "symptoms": [
      "network-lost"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/r-sgd-wireless-sgd-wireless-commands/r-sgd-interface-network-active-ip-addr.html"
  },
  {
    "key": "media.darkness",
    "type": "int",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "SD",
    "risk": "caution",
    "summary": "Gets or sets absolute darkness on the 0 to 30 scale.",
    "explain": "Media darkness is the settings key many desktop firmware builds use for the same 0 to 30 burn level as the absolute darkness command. A dedicated HTML page for this exact key was not present beside the newer tone setting, so the source link is the absolute darkness command that defines the scale. Values outside 0 to 30 are rejected here. Tenths may be accepted by some firmware. This checker uses whole numbers. Raise it for pale barcodes and lower it when the image blooms. Save the ZPL configuration if the model forgets the value at power off.",
    "symptoms": [
      "faded-print",
      "too-dark-print"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-sd.html",
    "range": [
      0,
      30
    ],
    "units": "absolute"
  },
  {
    "key": "media.printmode",
    "type": "enum",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "MM",
    "risk": "caution",
    "summary": "Selects tear-off, peel, rewind, cutter, or applicator behavior.",
    "explain": "Print mode is the SGD form of the present style. The values used here are the common lowercase phrases: tear off, peel off, rewind, cutter, and applicator. Firmware spelling varies. If a set is rejected, read the key first and reuse the exact token the printer returned. Peel and cutter require the matching hardware. Setting them on a plain desktop makes the printer wait for a sensor that will never trip. Tear-off position is a different key. Set the mode first, then the present distance.",
    "symptoms": [
      "not-presenting",
      "misaligned"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-media-printmode.html",
    "values": [
      "tear off",
      "peel off",
      "rewind",
      "cutter",
      "applicator"
    ]
  },
  {
    "key": "media.sense_mode",
    "type": "enum",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "MN",
    "risk": "caution",
    "summary": "Selects gap, bar, or continuous sensing on firmware that exposes this key.",
    "explain": "Sense mode picks how the media sensor indexes the stock. Gap follows the liner between labels, bar follows a black mark, and continuous does not index. Newer firmware often uses device.sensor_select with transmissive and reflective instead. If this key is unknown, set ezpl.media_type and the sensor select key. The source link is the ZPL tracking command, which is the format-language equivalent of this choice. Change sensing only when the stock actually changed, then calibrate. A mode that does not match the roll is the usual cause of skipped labels.",
    "symptoms": [
      "skipping-labels",
      "blank-labels"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-mn.html",
    "values": [
      "gap",
      "bar",
      "continuous"
    ]
  },
  {
    "key": "media.speed",
    "type": "enum",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "PR",
    "risk": "caution",
    "summary": "Gets or sets print speed in inches per second.",
    "explain": "Media speed is the SGD form of print rate. Documented numeric values run from 2 to 12 inches per second, and some firmware also accepts the words up and down. The printer still clamps to the fastest speed the mechanism can do. Setting 12 on a 6 ips desktop does not make it a 12 ips printer. This library allows the documented numbers plus up and down, and rejects other words. Slower speeds help small barcodes. Change speed and darkness together only by one variable at a time.",
    "symptoms": [
      "faded-print",
      "slow-throughput"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-media-speed.html",
    "values": [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "up",
      "down"
    ],
    "units": "ips"
  },
  {
    "key": "media.type",
    "type": "enum",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "MN",
    "risk": "caution",
    "summary": "Older media-type key. Confirm the spelling on the printer.",
    "explain": "Media type on older firmware describes the stock family, with values seen in the field such as label, tag, and journal. Current Link-OS builds prefer ezpl.media_type with continuous, gap/notch, and mark. If get on this key returns a question mark, use the ezpl key instead. The value list here is the common older set and is not marked verified against every model. A rejected set means the printer wants a different spelling. Wrong media type makes the sensor look for an index that is not there, which shows up as skipping or a long feed.",
    "symptoms": [
      "skipping-labels",
      "blank-labels"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/r-sgd-sgd-printer-commands/r-sgd-command-structure.html",
    "values": [
      "label",
      "tag",
      "journal"
    ]
  },
  {
    "key": "media.width_sense.enable",
    "type": "bool",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": null,
    "risk": "caution",
    "summary": "Turns automatic label-width sensing on or off.",
    "explain": "Width sense lets the printer measure the stock width instead of trusting only the stored print width. The values used here are on and off. A dedicated command page for this key was not in the SGD index we checked, so the source link is the sensor-type page that describes how desktop sensors see media. Leave sensing off when you set an explicit width that you trust. Turn it on only if the model documents automatic width and the stock has a clear edge. A bad automatic width clips the label or burns the platen. Read the key back after a set.",
    "symptoms": [
      "clipped-label"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop/zd421-and-zd621-desktop-printers-user-guide/color-touch-display-and-controls/print-menu/print-sensors-sensor-type.html",
    "values": [
      "on",
      "off"
    ]
  },
  {
    "key": "odometer.total_print_length",
    "type": "string",
    "readOnly": true,
    "access": [
      "getvar"
    ],
    "zplEquivalent": null,
    "risk": "safe",
    "summary": "Reads the lifetime print-length odometer.",
    "explain": "Total print length is a read-only odometer of how much media the printer has fed over its life. The text may be a bare number of inches or a number with a unit. Use it to spot a heavily used head when print quality is poor at settings that used to work. It does not reset when you load new media. This library does not parse the unit. Callers should keep the raw string. A set is rejected. There is no honest reason for a setup tool to rewrite a lifetime counter.",
    "symptoms": [],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-odometer-total-print-length.html"
  },
  {
    "key": "print.tone",
    "type": "int",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "SD",
    "risk": "caution",
    "summary": "Link-OS darkness, on the same idea as a 0 to 30 burn level.",
    "explain": "Print tone is the Link-OS name for darkness on many current firmware builds. It tracks the same kind of 0 to 30 scale as absolute darkness. Older desktops answer media.darkness instead, or as well. Read both if you are not sure which generation you have, and write the one that reads back. This library range-checks 0 to 30. Confirm the live printer before treating a tenth as valid. Tone does not select ribbon versus direct thermal. Set the print method separately so a darkness change is not hiding the wrong media type.",
    "symptoms": [
      "faded-print",
      "too-dark-print"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-print-tone.html",
    "range": [
      0,
      30
    ],
    "units": "absolute"
  },
  {
    "key": "zpl.relative_darkness",
    "type": "int",
    "readOnly": false,
    "access": [
      "getvar",
      "setvar"
    ],
    "zplEquivalent": "MD",
    "risk": "caution",
    "summary": "Relative darkness in tenths, matching the relative ZPL command.",
    "explain": "Relative darkness is the SGD cousin of the relative media-darkness command. The stored integer is in tenths: 10 means one darkness step, and the documented window runs from -300 to 300. It adds to the current base rather than replacing it. Sending it twice applies two adjustments. Desktop models often keep the result. Industrial models may not. Read it back after a set, then save if your workflow needs it after power loss. This library checks the -300 to 300 window and does not scale the number for you. Pass tenths, not a 0 to 30 absolute level.",
    "symptoms": [
      "faded-print",
      "too-dark-print"
    ],
    "models": {
      "all": true
    },
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-sgd-printer-commands/r-sgd-zpl-relative-darkness.html",
    "range": [
      -300,
      300
    ],
    "units": "tenths"
  }
];

export const statuses: StatusSpec[] = [
  {
    "id": "HI",
    "language": "zpl",
    "command": "~HI",
    "framing": {
      "stx": 2,
      "etx": 3,
      "lineEnding": "crlf",
      "lineCount": 1
    },
    "lines": [
      {
        "name": "identity",
        "fields": [
          {
            "name": "model",
            "index": 0,
            "type": "string"
          },
          {
            "name": "firmware",
            "index": 1,
            "type": "string"
          },
          {
            "name": "dotsPerMm",
            "index": 2,
            "type": "number"
          },
          {
            "name": "memory",
            "index": 3,
            "type": "string"
          }
        ]
      }
    ],
    "summary": "One record with model, firmware, dots per millimeter, and memory.",
    "explain": "Host identification is a single comma-separated record. The first field is the model text, the second is firmware or a configuration id, the third is dots per millimeter, and the fourth is memory. Map 8 dots per millimeter to 203 dpi, 12 to 300 dpi, and 24 to 600 dpi. If the third field is already 203 or higher, treat it as dpi directly. The memory field usually ends in KB. Strip that suffix before converting to a number. The record may be wrapped in start-of-text and end-of-text. A parser should still accept a bare line.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-hi.html"
  },
  {
    "id": "HQES",
    "language": "zpl",
    "command": "~HQES",
    "framing": {
      "stx": 2,
      "etx": 3,
      "lineEnding": "crlf",
      "lineCount": 2
    },
    "lines": [
      {
        "name": "errors",
        "fields": [
          {
            "name": "errorCount",
            "index": 0,
            "type": "number"
          },
          {
            "name": "errorWord0",
            "index": 1,
            "type": "hex"
          },
          {
            "name": "errorWord1",
            "index": 2,
            "type": "hex"
          }
        ]
      },
      {
        "name": "warnings",
        "fields": [
          {
            "name": "warningCount",
            "index": 0,
            "type": "number"
          },
          {
            "name": "warningWord0",
            "index": 1,
            "type": "hex"
          },
          {
            "name": "warningWord1",
            "index": 2,
            "type": "hex"
          }
        ]
      }
    ],
    "summary": "Error and warning counts plus two hex words each.",
    "explain": "The ES host query returns an errors line and a warnings line. Each line has a count and two hexadecimal words. A count of zero with empty words means that group is clear. A non-zero count means the printer wants attention, but the meaning of each bit depends on firmware. This library surfaces the words and a simple errors-present or warnings-present flag. It does not assign a name to every bit. The text is often wrapped in the same start and end bytes as host status. Parsers should tolerate extra labels such as PRINTER STATUS around the two lines.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-hq.html"
  },
  {
    "id": "HS",
    "language": "zpl",
    "command": "~HS",
    "framing": {
      "stx": 2,
      "etx": 3,
      "lineEnding": "crlf",
      "lineCount": 3
    },
    "lines": [
      {
        "name": "interface",
        "fields": [
          {
            "name": "communication",
            "index": 0,
            "type": "string"
          },
          {
            "name": "paperOut",
            "index": 1,
            "type": "flag"
          },
          {
            "name": "paused",
            "index": 2,
            "type": "flag"
          },
          {
            "name": "labelLengthDots",
            "index": 3,
            "type": "number"
          },
          {
            "name": "formatsInBuffer",
            "index": 4,
            "type": "number"
          },
          {
            "name": "bufferFull",
            "index": 5,
            "type": "flag"
          },
          {
            "name": "diagnosticMode",
            "index": 6,
            "type": "flag"
          },
          {
            "name": "partialFormat",
            "index": 7,
            "type": "flag"
          },
          {
            "name": "unused",
            "index": 8,
            "type": "string"
          },
          {
            "name": "corruptRam",
            "index": 9,
            "type": "flag"
          },
          {
            "name": "underTemperature",
            "index": 10,
            "type": "flag"
          },
          {
            "name": "overTemperature",
            "index": 11,
            "type": "flag"
          }
        ]
      },
      {
        "name": "sensors",
        "fields": [
          {
            "name": "functionSettings",
            "index": 0,
            "type": "string"
          },
          {
            "name": "unused",
            "index": 1,
            "type": "string"
          },
          {
            "name": "headUp",
            "index": 2,
            "type": "flag"
          },
          {
            "name": "ribbonOut",
            "index": 3,
            "type": "flag"
          },
          {
            "name": "transferMode",
            "index": 4,
            "type": "flag"
          },
          {
            "name": "printMode",
            "index": 5,
            "type": "number"
          },
          {
            "name": "printWidthMode",
            "index": 6,
            "type": "number"
          },
          {
            "name": "labelWaiting",
            "index": 7,
            "type": "flag"
          },
          {
            "name": "labelsRemaining",
            "index": 8,
            "type": "number"
          },
          {
            "name": "formatWhilePrinting",
            "index": 9,
            "type": "flag"
          },
          {
            "name": "imagesStored",
            "index": 10,
            "type": "number"
          }
        ]
      },
      {
        "name": "memory",
        "fields": [
          {
            "name": "password",
            "index": 0,
            "type": "string"
          },
          {
            "name": "staticRam",
            "index": 1,
            "type": "flag"
          }
        ]
      }
    ],
    "summary": "Three comma-separated status records wrapped in STX and ETX.",
    "explain": "Host status is three records. The first carries paper-out, pause, label length, format count, and buffer-full. The second carries head-open and ribbon-out. The third is a short memory record. Each record is wrapped in start-of-text (byte 2) and end-of-text (byte 3), then a carriage return and line feed. Printers sometimes omit a line or the control bytes. Flag fields use 1 for the fault and 0 for clear. This library maps those positions into named booleans and a fault list. The field order is a functional layout of the reply, written up in our own names. Do not treat a missing second record as a head-open fault.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/software/zpl-pg/c-zpl-zpl-commands/r-zpl-hs.html"
  }
];

export const printers: PrinterProfile[] = [
  {
    "id": "gk420d",
    "displayName": "GK420d",
    "languages": [
      "zpl",
      "epl2"
    ],
    "dpi": [
      203,
      300
    ],
    "maxWidthDots": 832,
    "speed": {
      "min": 2,
      "max": 5,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for GK420d is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "GK420d direct-thermal desktop, ZPL, about 4 inches wide.",
    "explain": "The GK420d is the direct-thermal GK-series desktop. Shipping workflows use it like the GX420d: ZPL, gap labels, tear-off, 203 dpi unless identification says otherwise. The 300 dpi option is listed because both heads were sold. Max width dots in this file is the 203 dpi number, 832, and must be scaled for a 300 dpi head. Top speed is written as 5 ips as a conservative desktop guess. verified is false until a unit is measured. Set direct thermal explicitly. A unit left in transfer mode will not mark coated stock.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  },
  {
    "id": "gx420d",
    "displayName": "GX420d",
    "languages": [
      "zpl",
      "epl2"
    ],
    "dpi": [
      203,
      300
    ],
    "maxWidthDots": 832,
    "speed": {
      "min": 2,
      "max": 6,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for GX420d is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "GK/GX-series desktop, direct thermal, ZPL with EPL available.",
    "explain": "The GX420d is a direct-thermal desktop from the G-series. It is a common 4 inch shipping printer and can run ZPL, with EPL still available on many firmware builds. 203 dpi is the usual head. 300 dpi units exist, so read identification before converting inches to dots. The 832 dot width is the 203 dpi figure. Direct thermal is the expected print method. Transfer mode with no ribbon prints blank labels. Speed, darkness, and USB product id in this profile are unverified. Confirm them from a configuration label before locking a workflow.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  },
  {
    "id": "lp2844",
    "displayName": "LP 2844",
    "languages": [
      "epl2"
    ],
    "dpi": [
      203
    ],
    "maxWidthDots": 832,
    "speed": {
      "min": 2,
      "max": 4,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for LP 2844 is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "Older desktop that speaks EPL2, commonly 203 dpi.",
    "explain": "The LP 2844 is the EPL2-era desktop used for years as a shipping printer. It does not speak ZPL unless the hardware is the Z variant. Treat width and length with the EPL commands, and send a graphic with the GW wrapper rather than a ZPL graphic field. 203 dpi and a 4 inch head are the usual numbers. Speed tops out lower than later ZPL desktops. All of those figures are unverified here. If a unit answers ZPL identification, it is not this profile. Use the LP 2844-Z profile instead.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  },
  {
    "id": "lp2844-z",
    "displayName": "LP 2844-Z",
    "languages": [
      "zpl"
    ],
    "dpi": [
      203
    ],
    "maxWidthDots": 832,
    "speed": {
      "min": 2,
      "max": 4,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for LP 2844-Z is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "2844-family desktop that speaks ZPL.",
    "explain": "The LP 2844-Z is the ZPL model in the 2844 family. Tell it apart from the EPL2-only LP 2844 by the model sticker. Send ZPL to this profile. The dot width and speed here match the 203 dpi 4 inch assumption used for the EPL-only model, and they are not hardware-verified.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  },
  {
    "id": "zd410",
    "displayName": "ZD410",
    "languages": [
      "zpl"
    ],
    "dpi": [
      203,
      300
    ],
    "maxWidthDots": 448,
    "speed": {
      "min": 2,
      "max": 6,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for ZD410 is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "Narrow ZD410 desktop, about 2 inches wide, ZPL.",
    "explain": "The ZD410 is a narrow desktop, about 2.2 inches of print width, not a 4 inch shipping printer. At 203 dpi that is roughly 448 dots. Do not send an 812 dot shipping label to it. The image will clip. This profile exists so a tool can refuse a 4 inch page. 203 and 300 dpi heads were both offered. Read the resolution key. The width here is the 203 dpi estimate and is unverified. Language is ZPL. USB product ids are empty until someone reads a real device.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  },
  {
    "id": "zd420",
    "displayName": "ZD420",
    "languages": [
      "zpl"
    ],
    "dpi": [
      203,
      300
    ],
    "maxWidthDots": 832,
    "speed": {
      "min": 2,
      "max": 6,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for ZD420 is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "ZD420 4 inch desktop, ZPL, 203 or 300 dpi.",
    "explain": "The ZD420 is a 4 inch ZPL desktop that replaced a lot of GK and GX units on packing benches. Direct and transfer configurations both exist, so read the print method instead of assuming. 203 dpi width is about 832 dots. 300 dpi is wider in dots for the same physical label. This file stores the 203 dpi width and lists both resolutions. None of the numeric limits were measured on hardware for this tree. verified is false. Gap stock, tear-off, and a saved darkness are the usual shipping setup. Calibrate when the liner color changes.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  },
  {
    "id": "zd421",
    "displayName": "ZD421",
    "languages": [
      "zpl"
    ],
    "dpi": [
      203,
      300
    ],
    "maxWidthDots": 832,
    "speed": {
      "min": 2,
      "max": 6,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for ZD421 is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "ZD421 4 inch desktop, ZPL, successor to the ZD420.",
    "explain": "The ZD421 is the later 4 inch ZPL desktop. It covers the same shipping-label job as the ZD420 and adds options such as wireless that do not change the bitmap path. Use 812 dots for a 4 inch label only after the head reports 203 dpi. A 300 dpi head needs a larger dot count for the same physical width. The speed range and 832 dot width are unverified defaults so a tool has somewhere to start. Product ids are empty. Read identification and the resolution key on connect, then show this profile as a hint rather than as a measured spec sheet.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  },
  {
    "id": "zp450",
    "displayName": "ZP 450",
    "languages": [
      "zpl"
    ],
    "dpi": [
      203
    ],
    "maxWidthDots": 832,
    "speed": {
      "min": 2,
      "max": 6,
      "units": "ips"
    },
    "darkness": {
      "min": 0,
      "max": 30
    },
    "usb": {
      "vendorId": 2655,
      "productIds": []
    },
    "verified": false,
    "notes": "Profile for ZP 450 is a starting point for setup tools. verified is false: dpi options, top speed, and the 203 dpi width were not confirmed on hardware in this tree. USB vendor 2655 is 0x0A5F. Product ids stay empty until a device is read.",
    "summary": "Desktop ZPL shipping printer, commonly 203 dpi and about 4 inches wide.",
    "explain": "The ZP 450 is a desktop shipping printer that speaks ZPL. The usual head is 203 dpi with a printable width a little over 4 inches, about 832 dots. People use it for 4 by 6 inch carrier labels. Gap tracking, tear-off, and a darkness somewhere in the middle of 0 to 30 are the setup that matches that job. A 300 dpi variant exists in the family. Do not assume 203 until identification or the resolution key says so. This profile marks that uncertainty with verified false. Product ids are intentionally empty. Filter USB by vendor 0x0A5F and then confirm the model string.",
    "sourceRef": "https://docs.zebra.com/us/en/printers/desktop.html"
  }
];
