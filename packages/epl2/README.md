# @wifilabel/epl2

A short EPL2 setup sequence, plus the bitmap wrappers the firmware uses for EPL `GW` and TSPL `BITMAP`.

## Install

```bash
npm install @wifilabel/epl2
```

## Example

```ts
import { epl } from "@wifilabel/epl2";

const setup = [
  epl.clearBuffer(),
  epl.width(812),
  epl.length(1218, 24),
  epl.density(8),
  epl.print(1),
].join("");
```

Each call returns one command and a newline. `812` by `1218` is a 4 inch by 6 inch label at 203 dpi. A number outside the spec range throws.

## What you get

`clearBuffer`, `width`, `length`, `speed`, `density`, `bottomFirst`, `topFirst`, `queryConfig`, `print`, `graphicWrite`, and `tsplBitmap`.

`graphicWrite` builds `N`, `GW`, and `P1` around a packed bitmap. `tsplBitmap` builds a TSPL job whose `SIZE` is fixed at 4x6 inches, the same helper the firmware uses.

## Limits

This is not a full EPL or TSPL language. There is no text, barcode, or font API. For ZPL, use [@wifilabel/zpl](https://www.npmjs.com/package/@wifilabel/zpl). Ranges come from [@wifilabel/printer-spec](https://www.npmjs.com/package/@wifilabel/printer-spec).

Zebra, ZPL, and Link-OS are trademarks of Zebra Technologies Corporation. This project is not affiliated with, endorsed by, or sponsored by Zebra Technologies.

Prefer a ready box? [wifilabel.com](https://wifilabel.com)
