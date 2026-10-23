# @wifilabel/box-client

A stub client for a WiFiLabel box on the local network. `write` holds bytes, and `read` posts them to the box.

## Install

```bash
npm install @wifilabel/box-client
```

## Example

```ts
import { BoxClient } from "@wifilabel/box-client";

const bytes = new Uint8Array([0x7e, 0x48, 0x49]);
const box = BoxClient.connect("http://192.168.1.20");
await box.write(bytes);
const reply = await box.read(4000);
const info = await box.info();
```

`read` POSTs the pending bytes to `/api/raw` and returns the body. `info` GETs `/api/info`.

## What you get

`BoxClient.connect` runs the address through `boxOrigin` first. The host has to be a private IPv4 address, a local IPv6 address, or `wifilabel-*.local`. The scheme has to be `http://`. A username, a password, or a public hostname throws.

Requests set `targetAddressSpace: "local"` so Chrome can show the local-network prompt.

## Limits

The client is the stub. The box has to serve those routes. The contract is <https://github.com/WiFiLabel/label-toolkit/blob/main/docs/box-api.md>.

It uses the same `write` / `read` / `close` shape as [@wifilabel/transport](https://www.npmjs.com/package/@wifilabel/transport). USB from the browser is [@wifilabel/webusb](https://www.npmjs.com/package/@wifilabel/webusb).

Prefer a ready box? [wifilabel.com](https://wifilabel.com)
