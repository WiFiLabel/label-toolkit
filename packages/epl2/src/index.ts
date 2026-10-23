import { eplCommandById } from "@wifilabel/printer-spec";

class SpecError extends Error {
  readonly code: "range" | "invalid";

  constructor(code: "range" | "invalid", message: string) {
    super(message);
    this.name = "SpecError";
    this.code = code;
  }
}

function assertRange(id: string, value: number): void {
  const command = eplCommandById[id];
  const range = command?.params[0]?.range;
  if (!command || !range) throw new SpecError("invalid", `bad EPL command ${id}`);
  if (!Number.isInteger(value) || value < range[0] || value > range[1]) {
    throw new SpecError("range", `${id} value ${value} is outside ${range[0]}..${range[1]}`);
  }
}

export function clearBuffer(): string {
  return "N\n";
}

export function width(dots: number): string {
  assertRange("q", dots);
  return `q${dots}\n`;
}

export function length(dots: number, gap: number): string {
  assertRange("Q", dots);
  const gapRange = eplCommandById.Q?.params[1]?.range;
  if (!gapRange || !Number.isInteger(gap) || gap < gapRange[0] || gap > gapRange[1]) {
    throw new SpecError("range", "EPL gap is outside the spec range");
  }
  return `Q${dots},${gap}\n`;
}

export function speed(value: number): string {
  assertRange("S", value);
  return `S${value}\n`;
}

export function density(value: number): string {
  assertRange("D", value);
  return `D${value}\n`;
}

export function bottomFirst(): string {
  return "ZB\n";
}

export function topFirst(): string {
  return "ZT\n";
}

export function queryConfig(): string {
  return "UQ\n";
}

export function print(copies = 1): string {
  assertRange("P", copies);
  return `P${copies}\n`;
}

/** EPL2 GW plus a clear and a one-copy print, matching the firmware wrapper. */
export function graphicWrite(
  bitmap: Uint8Array,
  widthDots: number,
  heightDots: number,
): Uint8Array {
  if (widthDots <= 0 || heightDots <= 0) throw new SpecError("invalid", "bitmap size");
  const bytesPerRow = Math.ceil(widthDots / 8);
  const expected = bytesPerRow * heightDots;
  if (bitmap.byteLength < expected) throw new SpecError("invalid", "bitmap is short");
  const head = `\r\nN\r\nGW0,0,${bytesPerRow},${heightDots},`;
  const tail = "\r\nP1\r\n";
  const out = new Uint8Array(head.length + expected + tail.length);
  let offset = 0;
  for (let i = 0; i < head.length; i += 1) out[offset++] = head.charCodeAt(i);
  out.set(bitmap.subarray(0, expected), offset);
  offset += expected;
  for (let i = 0; i < tail.length; i += 1) out[offset++] = tail.charCodeAt(i);
  return out;
}

/** TSPL2 BITMAP wrapper. SIZE is fixed at 4x6 inches, same as the firmware helper. */
export function tsplBitmap(bitmap: Uint8Array, widthDots: number, heightDots: number): Uint8Array {
  if (widthDots <= 0 || heightDots <= 0) throw new SpecError("invalid", "bitmap size");
  const bytesPerRow = Math.ceil(widthDots / 8);
  const expected = bytesPerRow * heightDots;
  if (bitmap.byteLength < expected) throw new SpecError("invalid", "bitmap is short");
  const head = `SIZE 4,6\r\nCLS\r\nBITMAP 0,0,${bytesPerRow},${heightDots},0,`;
  const tail = "\r\nPRINT 1\r\n";
  const out = new Uint8Array(head.length + expected + tail.length);
  let offset = 0;
  for (let i = 0; i < head.length; i += 1) out[offset++] = head.charCodeAt(i);
  out.set(bitmap.subarray(0, expected), offset);
  offset += expected;
  for (let i = 0; i < tail.length; i += 1) out[offset++] = tail.charCodeAt(i);
  return out;
}

export const epl = {
  clearBuffer,
  width,
  length,
  speed,
  density,
  bottomFirst,
  topFirst,
  queryConfig,
  print,
  graphicWrite,
  tsplBitmap,
};
