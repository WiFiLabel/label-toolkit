import { describe, expect, it } from "vitest";
import {
  PRINTER_CLASS,
  WebUsbTransport,
  ZEBRA_VENDOR_ID,
  requestPrinter,
  watchUsb,
  webUsbSupport,
  type UsbAlternateLike,
  type UsbDeviceLike,
  type UsbInResult,
  type UsbOutResult,
  type UsbPort,
} from "./webusb.ts";

function endpoint(
  endpointNumber: number,
  direction: "in" | "out",
  packetSize = 64,
): UsbAlternateLike["endpoints"][number] {
  return { endpointNumber, direction, type: "bulk", packetSize };
}

function alternate(
  interfaceClass: number,
  endpoints: UsbAlternateLike["endpoints"],
  setting = 0,
): UsbAlternateLike {
  return { alternateSetting: setting, interfaceClass, endpoints };
}

class FakeDevice implements UsbDeviceLike {
  opened = false;
  configuration: UsbDeviceLike["configuration"] = null;
  released: number[] = [];
  claimed: number[] = [];
  selectedConfig: number[] = [];
  selectedAlt: Array<[number, number]> = [];
  outs: Uint8Array[] = [];
  readonly configurations = [
    {
      configurationValue: 1,
      interfaces: [
        {
          interfaceNumber: 0,
          alternate: alternate(0xff, [endpoint(1, "out", 64), endpoint(2, "in", 64)]),
          alternates: [alternate(0xff, [endpoint(1, "out", 64), endpoint(2, "in", 64)])],
        },
        {
          interfaceNumber: 1,
          alternate: alternate(PRINTER_CLASS, [endpoint(3, "out", 64), endpoint(4, "in", 64)]),
          alternates: [alternate(PRINTER_CLASS, [endpoint(3, "out", 64), endpoint(4, "in", 64)])],
        },
      ],
    },
  ];

  constructor(
    private readonly incoming: Uint8Array[] = [],
    readonly productName = "ZP450",
  ) {}

  vendorId = ZEBRA_VENDOR_ID;
  productId = 0x0081;

  async open(): Promise<void> {
    this.opened = true;
  }
  async close(): Promise<void> {
    this.opened = false;
  }
  async selectConfiguration(configurationValue: number): Promise<void> {
    this.selectedConfig.push(configurationValue);
    this.configuration = this.configurations[0] ?? null;
  }
  async claimInterface(interfaceNumber: number): Promise<void> {
    this.claimed.push(interfaceNumber);
  }
  async releaseInterface(interfaceNumber: number): Promise<void> {
    this.released.push(interfaceNumber);
  }
  async selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void> {
    this.selectedAlt.push([interfaceNumber, alternateSetting]);
  }
  async transferOut(_endpointNumber: number, data: BufferSource): Promise<UsbOutResult> {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    this.outs.push(Uint8Array.from(bytes));
    return { status: "ok", bytesWritten: bytes.byteLength };
  }
  async transferIn(): Promise<UsbInResult> {
    const next = this.incoming.shift();
    if (!next)
      return { status: "ok", data: { buffer: new ArrayBuffer(0), byteLength: 0, byteOffset: 0 } };
    return {
      status: "ok",
      data: { buffer: next.buffer, byteLength: next.byteLength, byteOffset: next.byteOffset },
    };
  }
}

describe("webUsbSupport", () => {
  it("rejects a missing USB API or an insecure page", () => {
    expect(webUsbSupport({ usb: {}, isSecureContext: false }).ok).toBe(false);
    expect(webUsbSupport({ isSecureContext: true }).ok).toBe(false);
    const missing = webUsbSupport({ isSecureContext: false });
    if (missing.ok) throw new Error("expected unsupported");
    expect(missing.message).toContain("Safari and Firefox don't support USB printers");
    expect(webUsbSupport({ usb: {}, isSecureContext: true }).ok).toBe(true);
  });
});

describe("WebUsbTransport", () => {
  it("selects configuration 1, claims the printer class, and chunks writes", async () => {
    const device = new FakeDevice();
    const calls: number[] = [];
    const original = device.transferOut.bind(device);
    device.transferOut = async (endpointNumber, data) => {
      calls.push(endpointNumber);
      return original(endpointNumber, data);
    };
    const transport = await WebUsbTransport.open(device);
    expect(device.selectedConfig).toEqual([1]);
    expect(device.claimed).toEqual([1]);
    const payload = new Uint8Array(100);
    payload[0] = 1;
    payload[99] = 9;
    await transport.write(payload);
    expect(device.outs.map((chunk) => chunk.byteLength)).toEqual([64, 36]);
    expect(calls).toEqual([3, 3]);
    await transport.close();
    expect(device.released).toEqual([1]);
    expect(device.opened).toBe(false);
  });

  it("falls back to the first interface that has bulk in and bulk out", async () => {
    const device = new FakeDevice();
    device.configurations[0]!.interfaces = [
      {
        interfaceNumber: 0,
        alternate: alternate(0xff, [endpoint(7, "out", 32), endpoint(8, "in", 32)]),
        alternates: [alternate(0xff, [endpoint(7, "out", 32), endpoint(8, "in", 32)])],
      },
    ];
    const transport = await WebUsbTransport.open(device);
    expect(device.claimed).toEqual([0]);
    expect(transport.packetSize).toBe(32);
  });

  it("reads until a quiet empty transfer", async () => {
    const device = new FakeDevice([Uint8Array.from([0x02, 0x41]), Uint8Array.from([0x42])]);
    const transport = await WebUsbTransport.open(device);
    const bytes = await transport.read(500);
    expect([...bytes]).toEqual([0x02, 0x41, 0x42]);
  });

  it("returns empty when the transfer does not finish before the timeout", async () => {
    const device = new FakeDevice();
    device.transferIn = () => new Promise(() => undefined);
    const transport = await WebUsbTransport.open(device);
    const bytes = await transport.read(40);
    expect(bytes.byteLength).toBe(0);
    await transport.close();
    expect(device.opened).toBe(false);
  });

  it("does not start a second IN transfer while one is still running", async () => {
    const device = new FakeDevice();
    let calls = 0;
    let inFlight = 0;
    let maxInFlight = 0;
    let finishFirst: ((result: UsbInResult) => void) | undefined;
    device.transferIn = () => {
      calls += 1;
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      const isFirst = calls === 1;
      return new Promise((resolve) => {
        const done = (result: UsbInResult) => {
          inFlight -= 1;
          resolve(result);
        };
        if (isFirst) finishFirst = done;
        else
          done({
            status: "ok",
            data: { buffer: new ArrayBuffer(0), byteLength: 0, byteOffset: 0 },
          });
      });
    };
    const transport = await WebUsbTransport.open(device);
    const first = await transport.read(30);
    expect(first.byteLength).toBe(0);
    expect(calls).toBe(1);
    const second = transport.read(200);
    finishFirst?.({
      status: "ok",
      data: { buffer: Uint8Array.from([7]).buffer, byteLength: 1, byteOffset: 0 },
    });
    expect([...(await second)]).toEqual([7]);
    expect(maxInFlight).toBe(1);
    await transport.close();
  });

  it("serializes writes so chunks cannot interleave", async () => {
    const device = new FakeDevice();
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let started = 0;
    device.transferOut = async (_endpoint, data) => {
      started += 1;
      if (started === 1) await gate;
      const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
      device.outs.push(Uint8Array.from(bytes));
      return { status: "ok", bytesWritten: bytes.byteLength };
    };
    const transport = await WebUsbTransport.open(device);
    const first = transport.write(Uint8Array.from([1, 2]));
    const second = transport.write(Uint8Array.from([3]));
    await Promise.resolve();
    expect(started).toBe(1);
    expect(device.outs).toEqual([]);
    release?.();
    await first;
    await second;
    expect(device.outs.map((chunk) => [...chunk])).toEqual([[1, 2], [3]]);
  });
});

describe("request and events", () => {
  it("asks for the Zebra vendor and the printer class", async () => {
    let filters: Array<{ vendorId?: number; classCode?: number }> = [];
    const usb: UsbPort = {
      async requestDevice(options) {
        filters = options.filters;
        return new FakeDevice();
      },
      async getDevices() {
        return [];
      },
    };
    await requestPrinter(usb);
    expect(filters).toEqual([{ vendorId: ZEBRA_VENDOR_ID }, { classCode: PRINTER_CLASS }]);
  });

  it("forwards connect and disconnect", () => {
    const listeners = new Map<string, (event: { device: UsbDeviceLike }) => void>();
    const usb: UsbPort = {
      requestDevice: async () => new FakeDevice(),
      getDevices: async () => [],
      addEventListener(type, listener) {
        listeners.set(type, listener);
      },
      removeEventListener(type) {
        listeners.delete(type);
      },
    };
    const seen: string[] = [];
    const stop = watchUsb(usb, {
      onConnect: () => seen.push("connect"),
      onDisconnect: () => seen.push("disconnect"),
    });
    const device = new FakeDevice();
    listeners.get("connect")?.({ device });
    listeners.get("disconnect")?.({ device });
    stop();
    expect(seen).toEqual(["connect", "disconnect"]);
    expect(listeners.size).toBe(0);
  });
});
