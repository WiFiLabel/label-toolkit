# label-toolkit

Schema-first builders and parsers for thermal label printers. The YAML under `spec/` is the source of truth. Codegen writes TypeScript packages and C tables that firmware can compile without Node.

Zebra, ZPL, and Link-OS are trademarks of Zebra Technologies Corporation. This project is not affiliated with, endorsed by, or sponsored by Zebra Technologies.

## Packages

| Package                   | What it does                                                          |
| ------------------------- | --------------------------------------------------------------------- |
| `@wifilabel/printer-spec` | Generated command, SGD, status, and printer profiles                  |
| `@wifilabel/zpl`          | ZPL and SGD builders, host-status parsers, scripted printer query     |
| `@wifilabel/epl2`         | A small EPL2 setup sequence and bitmap wrappers                       |
| `@wifilabel/transport`    | `write` / `read` / `close`, plus `MockTransport` and `readUntilQuiet` |
| `@wifilabel/webusb`       | WebUSB transport for Chromium browsers                                |
| `@wifilabel/box-client`   | Stub client for a WiFiLabel box on the local network                  |

The browser tools are served at `https://wifilabel.com/tools/` from the storefront. This tree is the libraries, spec, codegen, and firmware component.

`@wifilabel/zpl` has no third-party runtime dependencies. Printer numbers that vary by model are marked `verified: false`.

```ts
import { sgd, zpl } from "@wifilabel/zpl";

zpl.setDarkness(15);
zpl.mediaDarkness(-3);
zpl.printSpeed(4);
zpl.mediaType("direct");
zpl.mediaTracking("gap");
zpl.printWidth(812);
zpl.labelLength(1218);
zpl.calibrate();
zpl.saveSettings();
zpl.factoryReset({ confirm: true });
zpl.testLabel({ widthDots: 812, heightDots: 1218, text: "HELLO" });
sgd.get("media.darkness");
sgd.set("media.darkness", 15);
```

The C component in `c/` exposes the same builders and parsers. Builders and parsers do not allocate. Pass a caller buffer. A negative return is an error.

## Develop

Node 20 or newer and pnpm 12.

```sh
pnpm i
pnpm gen
pnpm build
pnpm test
```

`pnpm gen` lints the spec and rewrites `packages/spec/src/generated/`, `packages/spec/data/`, and `c/include/wlt_spec.h` plus `c/src/wlt_spec.c`. A second `pnpm gen` should leave those files unchanged. `pnpm test` runs Vitest on the shared JSON vectors and the host C tests (`ctest`) against the same files.

Host C tests:

```sh
pnpm test:c
```

Optional Labelary preview of the golden ZPL files. This calls the public API, stays under one request per second, and caches PNGs in `.cache/`. It is not part of CI.

```sh
pnpm preview:labelary
```

## Firmware

`c/` is an ESP-IDF component. The example `c/examples/esp-idf-basic` targets `esp32p4`.

```sh
cd c/examples/esp-idf-basic
idf.py set-target esp32p4
idf.py build
```

Doc strings stay out of the binary unless `CONFIG_WLT_WITH_DOCS` is enabled. See `docs/firmware-integration.md`.

## Layout

Human text under `spec/` is CC BY 4.0 (`LICENSE-docs`). Code is MIT (`LICENSE`).

Prefer a ready box? [wifilabel.com](https://wifilabel.com)
