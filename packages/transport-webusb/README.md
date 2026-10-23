# @wifilabel/webusb

Open a USB label printer from Chrome or Edge and use it as a [`Transport`](https://www.npmjs.com/package/@wifilabel/transport).

## Install

```bash
npm install @wifilabel/webusb
```

## Example

```ts
import { requestPrinter, WebUsbTransport } from "@wifilabel/webusb";

const bytes = new Uint8Array([0x7e, 0x48, 0x49]);
const device = await requestPrinter(navigator.usb);
const transport = await WebUsbTransport.open(device);
await transport.write(bytes);
const chunk = await transport.read(2000);
```

`bytes` here is `~HI`. There is no public constructor. `open` claims the bulk in and out endpoints.

## What you get

`requestPrinter` filters on Zebra's vendor id (`0x0a5f`) or USB printer class `0x07`. `permittedDevices` lists devices this origin already may use. `watchUsb` subscribes to connect and disconnect. `webUsbSupport` reports when `navigator.usb` is missing. `guidanceForUsbError` maps a failed claim to a short note for the current operating system.

The same browser flow is on <https://wifilabel.com/tools>.

## Limits

Safari and Firefox do not implement WebUSB. The page has to be a secure context, https or localhost. On Windows the Zebra driver can keep the interface, so the claim fails until that driver lets go. Use `guidanceForUsbError` for the text this package shows. It does not swap the OS driver for you.

Build the bytes with [@wifilabel/zpl](https://www.npmjs.com/package/@wifilabel/zpl) or [@wifilabel/epl2](https://www.npmjs.com/package/@wifilabel/epl2).

Zebra, ZPL, and Link-OS are trademarks of Zebra Technologies Corporation. This project is not affiliated with, endorsed by, or sponsored by Zebra Technologies.

Prefer a ready box? [wifilabel.com](https://wifilabel.com)
