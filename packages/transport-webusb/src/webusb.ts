import type { Transport } from "@wifilabel/transport";
import { concatBytes } from "./bytes.ts";

export const ZEBRA_VENDOR_ID = 0x0a5f;
export const PRINTER_CLASS = 0x07;

export interface UsbEndpointLike {
  endpointNumber: number;
  direction: "in" | "out";
  type: "bulk" | "interrupt" | "isochronous";
  packetSize: number;
}

export interface UsbAlternateLike {
  alternateSetting: number;
  interfaceClass: number;
  endpoints: UsbEndpointLike[];
}

export interface UsbInterfaceLike {
  interfaceNumber: number;
  alternate: UsbAlternateLike;
  alternates: UsbAlternateLike[];
}

export interface UsbConfigurationLike {
  configurationValue: number;
  interfaces: UsbInterfaceLike[];
}

export interface UsbInResult {
  data?: { buffer: ArrayBuffer; byteLength: number; byteOffset?: number } | null;
  status: "ok" | "stall" | "babble";
}

export interface UsbOutResult {
  status: "ok" | "stall" | "babble";
  bytesWritten: number;
}

export interface UsbDeviceLike {
  vendorId: number;
  productId: number;
  productName?: string;
  opened: boolean;
  configuration: UsbConfigurationLike | null;
  configurations: UsbConfigurationLike[];
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  selectAlternateInterface?(interfaceNumber: number, alternateSetting: number): Promise<void>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<UsbOutResult>;
  transferIn(endpointNumber: number, length: number): Promise<UsbInResult>;
}

export interface UsbPort {
  requestDevice(options: {
    filters: Array<{ vendorId?: number; classCode?: number }>;
  }): Promise<UsbDeviceLike>;
  getDevices(): Promise<UsbDeviceLike[]>;
  addEventListener?(
    type: "connect" | "disconnect",
    listener: (event: UsbConnectionLike) => void,
  ): void;
  removeEventListener?(
    type: "connect" | "disconnect",
    listener: (event: UsbConnectionLike) => void,
  ): void;
}

export interface UsbConnectionLike {
  device: UsbDeviceLike;
}

export interface WebUsbScope {
  usb?: unknown;
  isSecureContext?: boolean;
}

export function webUsbSupport(scope: WebUsbScope): { ok: true } | { ok: false; message: string } {
  if (!scope.isSecureContext || !scope.usb) {
    return {
      ok: false,
      message:
        "Use Chrome or Edge on Mac, Windows, Linux, ChromeOS or Android. Safari and Firefox don't support USB printers.",
    };
  }
  return { ok: true };
}

export function requestPrinter(usb: UsbPort): Promise<UsbDeviceLike> {
  return usb.requestDevice({
    filters: [{ vendorId: ZEBRA_VENDOR_ID }, { classCode: PRINTER_CLASS }],
  });
}

export function permittedDevices(usb: UsbPort): Promise<UsbDeviceLike[]> {
  return usb.getDevices();
}

export function watchUsb(
  usb: UsbPort,
  handlers: {
    onConnect?: (device: UsbDeviceLike) => void;
    onDisconnect?: (device: UsbDeviceLike) => void;
  },
): () => void {
  const onConnect = (event: UsbConnectionLike) => handlers.onConnect?.(event.device);
  const onDisconnect = (event: UsbConnectionLike) => handlers.onDisconnect?.(event.device);
  usb.addEventListener?.("connect", onConnect);
  usb.addEventListener?.("disconnect", onDisconnect);
  return () => {
    usb.removeEventListener?.("connect", onConnect);
    usb.removeEventListener?.("disconnect", onDisconnect);
  };
}

interface ChosenEndpoint {
  interfaceNumber: number;
  alternateSetting: number;
  inEndpoint: number;
  outEndpoint: number;
  packetSize: number;
}

function chooseInterface(configuration: UsbConfigurationLike): ChosenEndpoint {
  const rows = configuration.interfaces.flatMap((iface) => {
    const alternates = iface.alternates.length > 0 ? iface.alternates : [iface.alternate];
    return alternates.map((alt) => {
      const incoming = alt.endpoints.find(
        (endpoint) => endpoint.direction === "in" && endpoint.type === "bulk",
      );
      const outgoing = alt.endpoints.find(
        (endpoint) => endpoint.direction === "out" && endpoint.type === "bulk",
      );
      return { iface, alt, incoming, outgoing };
    });
  });
  const printer = rows.find(
    (row) => row.alt.interfaceClass === PRINTER_CLASS && row.incoming && row.outgoing,
  );
  const fallback = rows.find((row) => row.incoming && row.outgoing);
  const chosen = printer ?? fallback;
  if (!chosen?.incoming || !chosen.outgoing) {
    throw new Error("Unable to claim interface: no bulk printer endpoints");
  }
  return {
    interfaceNumber: chosen.iface.interfaceNumber,
    alternateSetting: chosen.alt.alternateSetting,
    inEndpoint: chosen.incoming.endpointNumber,
    outEndpoint: chosen.outgoing.endpointNumber,
    packetSize: chosen.outgoing.packetSize > 0 ? chosen.outgoing.packetSize : 64,
  };
}

function viewToBytes(data: {
  buffer: ArrayBuffer;
  byteLength: number;
  byteOffset?: number;
}): Uint8Array {
  return new Uint8Array(data.buffer, data.byteOffset ?? 0, data.byteLength);
}

export class WebUsbTransport implements Transport {
  private tail: Promise<void> = Promise.resolve();
  private closed = false;
  /** The one IN transfer WebUSB allows on this endpoint. */
  private inbound: Promise<UsbInResult> | null = null;
  /** Bytes that arrived after a read had already timed out. */
  private held: UsbInResult | null = null;
  private readerWaiting = false;

  private constructor(
    private readonly device: UsbDeviceLike,
    private readonly chosen: ChosenEndpoint,
  ) {}

  static async open(device: UsbDeviceLike): Promise<WebUsbTransport> {
    if (!device.opened) await device.open();
    if (!device.configuration) await device.selectConfiguration(1);
    const configuration =
      device.configuration ??
      device.configurations.find((item) => item.configurationValue === 1) ??
      device.configurations[0];
    if (!configuration) throw new Error("Unable to claim interface: printer has no configuration");
    const chosen = chooseInterface(configuration);
    if (
      device.selectAlternateInterface &&
      chosen.alternateSetting !==
        configuration.interfaces.find((item) => item.interfaceNumber === chosen.interfaceNumber)
          ?.alternate.alternateSetting
    ) {
      await device.selectAlternateInterface(chosen.interfaceNumber, chosen.alternateSetting);
    }
    await device.claimInterface(chosen.interfaceNumber);
    return new WebUsbTransport(device, chosen);
  }

  get packetSize(): number {
    return this.chosen.packetSize;
  }

  private enqueue<T>(task: () => Promise<T>): Promise<T> {
    const run = this.tail.then(task, task);
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async write(data: Uint8Array): Promise<void> {
    return this.enqueue(async () => {
      if (this.closed) throw new Error("transport closed");
      const size = this.chosen.packetSize;
      for (let offset = 0; offset < data.byteLength; offset += size) {
        const chunk = new Uint8Array(data.subarray(offset, offset + size));
        const result = await this.device.transferOut(this.chosen.outEndpoint, chunk);
        if (result.status !== "ok") throw new Error(`USB write ${result.status}`);
      }
    });
  }

  async read(timeoutMs: number): Promise<Uint8Array> {
    return this.enqueue(() => this.readLoop(timeoutMs));
  }

  private async readLoop(timeoutMs: number): Promise<Uint8Array> {
    if (this.closed) throw new Error("transport closed");
    if (timeoutMs <= 0) return new Uint8Array();
    const quietMs = Math.min(80, timeoutMs);
    const deadline = Date.now() + timeoutMs;
    const chunks: Uint8Array[] = [];
    while (Date.now() < deadline && chunks.length < 32) {
      const remaining = Math.max(1, deadline - Date.now());
      const slice = chunks.length === 0 ? remaining : Math.min(quietMs, remaining);
      const result = await this.transferInTimeout(slice);
      if (!result || result.status === "stall" || result.status === "babble") {
        if (chunks.length > 0) break;
        if (!result) break;
        throw new Error(`USB read ${result.status}`);
      }
      if (!result.data || result.data.byteLength === 0) {
        if (chunks.length > 0) break;
        continue;
      }
      chunks.push(viewToBytes(result.data));
    }
    return concatBytes(chunks);
  }

  /**
   * Start an IN transfer only when the previous one has settled.
   * A timed-out read leaves that transfer running so the next read can take its bytes.
   */
  private nextInbound(): Promise<UsbInResult> {
    if (this.inbound) return this.inbound;
    const current = this.device.transferIn(this.chosen.inEndpoint, 4096).finally(() => {
      if (this.inbound === current) this.inbound = null;
    });
    this.inbound = current;
    return current;
  }

  private async transferInTimeout(timeoutMs: number): Promise<UsbInResult | null> {
    if (this.held) {
      const result = this.held;
      this.held = null;
      return result;
    }
    const pending = this.nextInbound();
    this.readerWaiting = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const timeout = new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      });
      const result = await Promise.race([pending, timeout]);
      if (result !== null) return result;
      void pending.then(
        (value) => {
          if (this.closed || this.readerWaiting) return;
          this.held ??= value;
        },
        () => undefined,
      );
      return null;
    } finally {
      if (timer) clearTimeout(timer);
      this.readerWaiting = false;
    }
  }

  async close(): Promise<void> {
    if (this.closed) return;
    this.closed = true;
    this.held = null;
    const pending = this.inbound;
    try {
      if (pending && this.device.opened) await this.device.close();
    } catch {
      /* disconnect already closed the device */
    }
    try {
      await this.device.releaseInterface(this.chosen.interfaceNumber);
    } catch {
      /* already released, or the device closed with a transfer in flight */
    }
    try {
      if (this.device.opened) await this.device.close();
    } catch {
      /* already closed */
    }
    if (pending) void pending.catch(() => undefined);
  }
}
