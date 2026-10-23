function stripControl(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code !== 0x02 && code !== 0x03) out += text[i];
  }
  return out;
}

function latin1(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += String.fromCharCode(byte);
  return out;
}

function asBytes(input: Uint8Array | string): Uint8Array {
  if (typeof input !== "string") return input;
  const out = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i += 1) out[i] = input.charCodeAt(i) & 0xff;
  return out;
}

export function splitFrames(input: Uint8Array | string): string[] {
  const bytes = asBytes(input);
  const frames: string[] = [];
  let sawStx = false;
  for (const byte of bytes) {
    if (byte === 0x02) sawStx = true;
  }
  if (sawStx) {
    let i = 0;
    while (i < bytes.length) {
      while (i < bytes.length && bytes[i] !== 0x02) i += 1;
      if (i >= bytes.length) break;
      i += 1;
      const start = i;
      while (i < bytes.length && bytes[i] !== 0x03) i += 1;
      frames.push(latin1(bytes.slice(start, i)).replace(/\r/g, "").trim());
      if (i < bytes.length && bytes[i] === 0x03) i += 1;
    }
    return frames.filter((frame) => frame.length > 0);
  }
  return latin1(bytes)
    .split(/\r?\n/)
    .map((line) => stripControl(line).trim())
    .filter((line) => line.includes(",") || line.includes("ERRORS") || line.includes("WARNINGS"));
}

function fieldsOf(line: string | undefined): string[] {
  if (!line) return [];
  return line.split(",").map((part) => part.trim());
}

function flag(fields: string[], index: number): boolean {
  return fields[index] === "1";
}

function integer(fields: string[], index: number): number {
  const value = Number.parseInt(fields[index] ?? "", 10);
  return Number.isFinite(value) ? value : 0;
}

export interface HostStatus {
  paperOut: boolean;
  paused: boolean;
  headUp: boolean;
  ribbonOut: boolean;
  bufferFull: boolean;
  labelLengthDots: number;
  formatsInBuffer: number;
  faults: string[];
  raw: string;
}

export function parseHostStatus(input: Uint8Array | string): HostStatus {
  const raw = typeof input === "string" ? input : latin1(input);
  const frames = splitFrames(input);
  const first = fieldsOf(frames[0]);
  const second = fieldsOf(frames[1]);
  const status: HostStatus = {
    paperOut: flag(first, 1),
    paused: flag(first, 2),
    headUp: flag(second, 2),
    ribbonOut: flag(second, 3),
    bufferFull: flag(first, 5),
    labelLengthDots: integer(first, 3),
    formatsInBuffer: integer(first, 4),
    faults: [],
    raw,
  };
  if (status.paperOut) status.faults.push("paper-out");
  if (status.paused) status.faults.push("paused");
  if (status.headUp) status.faults.push("head-up");
  if (status.ribbonOut) status.faults.push("ribbon-out");
  if (status.bufferFull) status.faults.push("buffer-full");
  return status;
}

export interface HqesStatus {
  errorCount: number;
  warningCount: number;
  errorWords: string[];
  warningWords: string[];
  flags: string[];
  raw: string;
}

export function parseHqes(input: Uint8Array | string): HqesStatus {
  const raw = typeof input === "string" ? input : latin1(input);
  const errors = /ERRORS:\s*(\d+)\s+([0-9A-Fa-f]+)\s+([0-9A-Fa-f]+)/.exec(raw);
  const warnings = /WARNINGS:\s*(\d+)\s+([0-9A-Fa-f]+)\s+([0-9A-Fa-f]+)/.exec(raw);
  const errorCount = errors ? Number(errors[1]) : 0;
  const warningCount = warnings ? Number(warnings[1]) : 0;
  const flags: string[] = [];
  if (errorCount > 0) flags.push("errors-present");
  if (warningCount > 0) flags.push("warnings-present");
  return {
    errorCount,
    warningCount,
    errorWords: errors ? [errors[2] ?? "", errors[3] ?? ""] : [],
    warningWords: warnings ? [warnings[2] ?? "", warnings[3] ?? ""] : [],
    flags,
    raw,
  };
}

export interface HostId {
  model: string;
  firmware: string;
  dpi: number;
  memoryKb: number | null;
  raw: string;
}

export function dpiFromDotsPerMm(dots: number | null): number {
  if (dots === 6) return 152;
  if (dots === 8) return 203;
  if (dots === 12) return 300;
  if (dots === 16) return 406;
  if (dots === 24) return 600;
  if (dots !== null && dots >= 100) return dots;
  return 0;
}

export function parseHi(input: Uint8Array | string): HostId {
  const raw = typeof input === "string" ? input : latin1(input);
  const frames = splitFrames(input);
  const body = stripControl(frames[0] ?? raw)
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .trim();
  const parts = body.split(",").map((part) => part.trim());
  const dots = Number.parseInt(parts[2] ?? "", 10);
  const memoryText = (parts[3] ?? "").toUpperCase().replace("KB", "").trim();
  const memory = Number.parseInt(memoryText, 10);
  return {
    model: parts[0] ?? "",
    firmware: parts[1] ?? "",
    dpi: dpiFromDotsPerMm(Number.isFinite(dots) ? dots : null),
    memoryKb: Number.isFinite(memory) ? memory : null,
    raw,
  };
}
