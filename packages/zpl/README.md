# @wifilabel/zpl

Functions that return ZPL and SGD text, and parsers for `~HI`, `~HS`, and `^HQES`.

## Install

```bash
npm install @wifilabel/zpl
```

## Example

```ts
import { sgd, zpl } from "@wifilabel/zpl";

const setup = [
  zpl.setDarkness(15),
  zpl.mediaType("direct"),
  zpl.mediaTracking("gap"),
  zpl.printWidth(812),
  zpl.labelLength(1218),
  zpl.calibrate(),
  zpl.saveSettings(),
].join("");

const readDarkness = sgd.get("media.darkness");
```

`setup` and `readDarkness` are strings. Send them with a transport you already have. `queryPrinter(transport)` runs a short script of those queries and returns a `PrinterSnapshot`. `parseHostStatus` reads a `~HS` reply.

## What you get

`zpl` covers darkness, speed, media type, tracking, width, length, tear-off, calibrate, save, factory reset, restart, a test label, and `graphicField`. `sgd` is `get`, `set`, and `do`. `factoryReset` and `restart` throw unless you pass `{ confirm: true }`.

Runtime dependencies are [@wifilabel/printer-spec](https://www.npmjs.com/package/@wifilabel/printer-spec) and [@wifilabel/transport](https://www.npmjs.com/package/@wifilabel/transport). Nothing else.

## Limits

Nothing here opens USB or a socket. Pair it with [@wifilabel/webusb](https://www.npmjs.com/package/@wifilabel/webusb), [@wifilabel/box-client](https://www.npmjs.com/package/@wifilabel/box-client), or your own `Transport`.

Some numbers in the spec are still `verified: false`. The builder will emit them. That does not mean the value was measured on your printer.

Zebra, ZPL, and Link-OS are trademarks of Zebra Technologies Corporation. This project is not affiliated with, endorsed by, or sponsored by Zebra Technologies.

Prefer a ready box? [wifilabel.com](https://wifilabel.com)
