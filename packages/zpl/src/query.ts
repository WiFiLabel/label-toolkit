import { encodeAscii, readUntilQuiet, type Transport } from "@wifilabel/transport";
import {
  parseHi,
  parseHostStatus,
  parseHqes,
  type HostId,
  type HostStatus,
  type HqesStatus,
} from "./parse.ts";
import { get, parseSgdResponse } from "./sgd.ts";

export interface PrinterSnapshot {
  model: string;
  firmware: string;
  dpi: number;
  memoryKb: number | null;
  friendlyName: string | null;
  hostStatus: HostStatus;
  hqes: HqesStatus;
  identification: HostId;
}

async function exchange(transport: Transport, command: string): Promise<Uint8Array> {
  await transport.write(encodeAscii(command));
  return readUntilQuiet(transport, { timeoutMs: 2000, quietMs: 200 });
}

/** Identify a printer with ~HI, two SGD reads, ~HS, and ~HQES. */
export async function queryPrinter(transport: Transport): Promise<PrinterSnapshot> {
  const identification = parseHi(await exchange(transport, "~HI\n"));
  const friendlyRaw = parseSgdResponse(await exchange(transport, get("device.friendly_name")));
  const dpiRaw = parseSgdResponse(await exchange(transport, get("head.resolution.in_dpi")));
  const hostStatus = parseHostStatus(await exchange(transport, "~HS\n"));
  const hqes = parseHqes(await exchange(transport, "~HQES\n"));
  const dpiNumber = Number.parseInt(dpiRaw, 10);
  const friendlyName = friendlyRaw && friendlyRaw !== "?" ? friendlyRaw : null;
  return {
    model: identification.model,
    firmware: identification.firmware,
    dpi: Number.isFinite(dpiNumber) && dpiNumber > 0 ? dpiNumber : identification.dpi,
    memoryKb: identification.memoryKb,
    friendlyName,
    hostStatus,
    hqes,
    identification,
  };
}
