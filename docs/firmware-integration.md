# Firmware integration

The C API is in `c/include/wlt_zpl.h` and `c/include/wlt_status.h`. Builders and parsers do not allocate. You pass the buffer and its capacity. The return value is the number of bytes written, or a negative code (`WLT_ERR_RANGE`, `WLT_ERR_NOSPC`, `WLT_ERR_CONFIRM`, and the others in the header).

## Bitmap wrappers

Older firmware wrapped a packed bitmap with helpers that called `malloc` and returned a pointer the caller had to free:

- ZPL `^GFA` inside `^XA` / `^PW` / `^LL` / `^FO0,0`
- EPL2 `N`, `GW`, `P1` with raw image bytes
- TSPL `SIZE 4,6`, `CLS`, `BITMAP`, `PRINT 1`

Replace those calls with the no-heap helpers:

```c
char zpl[8192];
int n = wlt_wrap_zpl_gfa(zpl, sizeof zpl, bits, byte_count, width_dots, height_dots);
if (n < 0) {
  /* range, short bitmap, or buffer too small */
}
```

`wlt_wrap_epl_gw` and `wlt_wrap_tspl_bitmap` take the same kind of caller buffer. `SIZE 4,6` is still fixed, matching the previous TSPL helper. Bytes per row are `(width_dots + 7) / 8`.

A stack buffer is enough for a 4 by 6 inch 203 dpi label only if you size it for the ASCII hex expansion (`^GFA` stores two hex characters per image byte, plus the header). EPL and TSPL copies are about the size of the bitmap plus a short header.

## Component

`c/idf_component.yml` publishes the component. From an application:

```yaml
dependencies:
  label_toolkit:
    git: https://github.com/WiFiLabel/label-toolkit.git
    path: c
```

`REQUIRES label_toolkit` in the app `CMakeLists.txt`. The component manager checks that git path out as `managed_components/label_toolkit`.

The example under `c/examples/esp-idf-basic` sits inside the component directory, so its folder name is `c`. It adds that directory with `EXTRA_COMPONENT_DIRS` and `REQUIRES c`, and it targets `esp32p4`.

`CONFIG_WLT_WITH_DOCS` (Kconfig, default off) copies one-line summaries into the image. Leave it off on the printer firmware. The tables of command ids, ranges, and SGD keys stay in flash either way, and a host build of `wlt_spec.c` without the flag keeps that rodata under 16 KB.
