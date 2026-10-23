import { decodeLatin1, encodeAscii, type Transport } from "@wifilabel/transport";
import { hexToBytes } from "./bytes.ts";

/** First ~HI vector in test-vectors/parsers.json. */
export const CANNED_HI_HEX =
  "025a50203435302d3230306470692d3230306470692c5a53502d30303232383241522c382c323130344b4203";

/** Idle ~HS vector in test-vectors/parsers.json. */
export const CANNED_HS_HEX =
  "023033302c302c302c313234352c3030302c302c302c302c3030302c302c302c30030d0a023030302c302c302c302c302c302c302c302c30303030303030302c302c303030030d0a02303030302c30030d0a";

/** Clean ~HQES vector in test-vectors/parsers.json. */
export const CANNED_HQES_HEX =
  "024552524f52533a20302030303030303030302030303030303030300d0a5741524e494e47533a203020303030303030303020303030303030303003";

/** SGD `"15"` vector in test-vectors/parsers.json. */
export const CANNED_SGD_15_HEX = "223135220d0a";

/** SGD `"Pack bench"` vector in test-vectors/parsers.json. */
export const CANNED_SGD_NAME_HEX = "02225061636b2062656e636822030d0a";

const DEFAULTS: Record<string, string> = {
  "device.friendly_name": "Pack bench",
  "head.resolution.in_dpi": "203",
  "device.languages": "zpl",
  "media.darkness": "15",
  "media.speed": "4",
  "ezpl.print_method": "direct thermal",
  "ezpl.media_type": "gap/notch",
  "ezpl.print_width": "812",
  "ezpl.label_length_max": "1218",
  "ezpl.tear_off": "0",
  "media.printmode": "tear off",
};

function quoted(value: string): Uint8Array {
  return encodeAscii(`"${value}"\r\n`);
}

/**
 * Byte pipe that answers ~HI, ~HS, ~HQES, and SGD get/set with canned replies.
 * Same contract as MockTransport: one payload, then an empty read.
 */
export class CannedPrinterTransport implements Transport {
  readonly writes: Uint8Array[] = [];
  private readonly values = new Map<string, string>(Object.entries(DEFAULTS));
  private pending: Uint8Array | null = null;
  private armed = false;
  private closed = false;

  async write(data: Uint8Array): Promise<void> {
    if (this.closed) throw new Error("transport closed");
    this.writes.push(Uint8Array.from(data));
    this.pending = this.reply(decodeLatin1(data));
    this.armed = true;
  }

  async read(_timeoutMs: number): Promise<Uint8Array> {
    if (this.closed) throw new Error("transport closed");
    if (this.armed) {
      const chunk = this.pending ?? new Uint8Array();
      this.pending = null;
      this.armed = false;
      return chunk;
    }
    return new Uint8Array();
  }

  async close(): Promise<void> {
    this.closed = true;
  }

  private reply(text: string): Uint8Array {
    if (text.includes("~HI")) return hexToBytes(CANNED_HI_HEX);
    if (text.includes("~HQES")) return hexToBytes(CANNED_HQES_HEX);
    if (text.includes("~HS")) return hexToBytes(CANNED_HS_HEX);
    const get = /getvar "([^"]+)"/.exec(text);
    if (get) {
      const key = get[1] ?? "";
      if (key === "media.darkness" && this.values.get(key) === "15")
        return hexToBytes(CANNED_SGD_15_HEX);
      if (key === "device.friendly_name" && this.values.get(key) === "Pack bench") {
        return hexToBytes(CANNED_SGD_NAME_HEX);
      }
      return quoted(this.values.get(key) ?? "");
    }
    const set = /setvar "([^"]+)" "([^"]*)"/.exec(text);
    if (set) {
      this.values.set(set[1] ?? "", set[2] ?? "");
      return encodeAscii("\r\n");
    }
    return encodeAscii("\r\n");
  }
}

export function createCannedPrinterTransport(): CannedPrinterTransport {
  return new CannedPrinterTransport();
}

/** Ordered replies for a MockTransport that only runs queryPrinter. */
export function cannedQueryResponses(): Uint8Array[] {
  return [
    hexToBytes(CANNED_HI_HEX),
    hexToBytes(CANNED_SGD_NAME_HEX),
    quoted("203"),
    hexToBytes(CANNED_HS_HEX),
    hexToBytes(CANNED_HQES_HEX),
  ];
}
