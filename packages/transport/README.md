# @wifilabel/transport

A `write` / `read` / `close` pipe for one label-printer session, a mock that scripts the replies, and a helper that reads until the line goes quiet.

## Install

```bash
npm install @wifilabel/transport
```

## Example

```ts
import { decodeLatin1, encodeAscii, MockTransport, readUntilQuiet } from "@wifilabel/transport";

const transport = new MockTransport(["ok"]);
await transport.write(encodeAscii("~HI"));
const reply = decodeLatin1(await readUntilQuiet(transport));
```

`MockTransport` records each write and returns the next scripted response on the following read. An empty read after that lets `readUntilQuiet` stop.

## What you get

`Transport` is three methods. `write` takes a `Uint8Array`. `read(timeoutMs)` resolves with bytes, or an empty array when that timeout elapsed with nothing new. `close` ends the session.

`readUntilQuiet` keeps calling `read` until a timeout comes back empty after some data, or the overall budget runs out. Defaults are 2000 ms total and 200 ms of quiet.

`encodeAscii` copies a string into bytes. A code point above 255 throws. `decodeLatin1` turns bytes back into a string.

## Limits

No USB and no sockets. Those adapters are [@wifilabel/webusb](https://www.npmjs.com/package/@wifilabel/webusb) and [@wifilabel/box-client](https://www.npmjs.com/package/@wifilabel/box-client). Command text comes from [@wifilabel/zpl](https://www.npmjs.com/package/@wifilabel/zpl) or [@wifilabel/epl2](https://www.npmjs.com/package/@wifilabel/epl2).

Prefer a ready box? [wifilabel.com](https://wifilabel.com)
