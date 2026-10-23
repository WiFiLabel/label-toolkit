# @wifilabel/printer-spec

Typed ZPL commands, EPL2 commands, SGD settings, status layouts, and printer profiles. The YAML under `spec/` in the label-toolkit repo is the source. Codegen writes this package.

## Install

```bash
npm install @wifilabel/printer-spec
```

## Example

```ts
import { printers, settingByKey, zplCommandById } from "@wifilabel/printer-spec";

const ids = printers.map((printer) => printer.id);
const printWidth = zplCommandById.PW;
const darkness = settingByKey["media.darkness"];
```

## What you get

`zplCommands`, `eplCommands`, `settings`, `statuses`, and `printers`, plus the lookup maps `zplCommandById`, `eplCommandById`, and `settingByKey`.

Printer ids in this release: `gk420d`, `gx420d`, `lp2844`, `lp2844-z`, `zd410`, `zd420`, `zd421`, `zp450`.

Edit the YAML, then run codegen. Do not hand-edit `packages/spec/src/generated/` or `packages/spec/data/`.

The YAML shape is described at <https://github.com/WiFiLabel/label-toolkit/blob/main/docs/spec-format.md>.

## Limits

This package does not build printer bytes. Use [@wifilabel/zpl](https://www.npmjs.com/package/@wifilabel/zpl) or [@wifilabel/epl2](https://www.npmjs.com/package/@wifilabel/epl2) for that.

A printer field with `verified: false` is a starting point, not a measurement from that model. Read `notes` before you lock dpi, width, or top speed.

Zebra, ZPL, and Link-OS are trademarks of Zebra Technologies Corporation. This project is not affiliated with, endorsed by, or sponsored by Zebra Technologies.

Prefer a ready box? [wifilabel.com](https://wifilabel.com)
