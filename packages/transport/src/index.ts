/** A byte pipe. WebUSB and network adapters live outside this package. */
export interface Transport {
  write(data: Uint8Array): Promise<void>;
  /** Resolve with bytes, or an empty array when timeoutMs elapsed with nothing new. */
  read(timeoutMs: number): Promise<Uint8Array>;
  close(): Promise<void>;
}

export function encodeAscii(text: string): Uint8Array {
  const out = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code > 0xff) {
      throw new Error("transport payloads are bytes");
    }
    out[i] = code;
  }
  return out;
}

export function decodeLatin1(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += String.fromCharCode(byte);
  return out;
}

function toBytes(value: Uint8Array | string): Uint8Array {
  return typeof value === "string" ? encodeAscii(value) : Uint8Array.from(value);
}

/**
 * Scripted transport. Each write arms the next response.
 * The following read returns that response, and the read after it returns empty
 * so readUntilQuiet can stop.
 */
export class MockTransport implements Transport {
  readonly writes: Uint8Array[] = [];
  private readonly responses: Uint8Array[];
  private cursor = 0;
  private pending: Uint8Array | null = null;
  private closed = false;

  constructor(responses: Array<Uint8Array | string> = []) {
    this.responses = responses.map(toBytes);
  }

  async write(data: Uint8Array): Promise<void> {
    if (this.closed) throw new Error("transport closed");
    this.writes.push(Uint8Array.from(data));
    this.pending = this.responses[this.cursor] ?? new Uint8Array();
    this.cursor += 1;
  }

  async read(_timeoutMs: number): Promise<Uint8Array> {
    if (this.closed) throw new Error("transport closed");
    if (this.pending) {
      const chunk = this.pending;
      this.pending = null;
      return chunk;
    }
    return new Uint8Array();
  }

  async close(): Promise<void> {
    this.closed = true;
  }
}

export interface ReadUntilQuietOptions {
  timeoutMs?: number;
  quietMs?: number;
}

/**
 * Read until a timeout returns no bytes after some data, or the overall budget runs out.
 * An empty read means the caller-supplied timeout elapsed with nothing new.
 */
export async function readUntilQuiet(
  transport: Transport,
  options: ReadUntilQuietOptions = {},
): Promise<Uint8Array> {
  const timeoutMs = options.timeoutMs ?? 2000;
  const quietMs = options.quietMs ?? 200;
  let budget = timeoutMs;
  const chunks: Uint8Array[] = [];
  while (budget > 0 && chunks.length < 32) {
    const slice = Math.min(quietMs, budget);
    const chunk = await transport.read(slice);
    if (chunk.byteLength === 0) {
      budget -= slice;
      if (chunks.length > 0) break;
      continue;
    }
    chunks.push(chunk);
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}
