import type { Transport } from "@wifilabel/transport";

export interface BoxInfo {
  name?: string;
  firmware?: string;
}

export interface BoxFetchInit extends RequestInit {
  targetAddressSpace?: "local";
}

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".");
  if (parts.length !== 4) return false;
  const nums = parts.map((part) => Number(part));
  if (nums.some((num) => !Number.isInteger(num) || num < 0 || num > 255)) return false;
  const a = nums[0] ?? -1;
  const b = nums[1] ?? -1;
  if (a === 10 || a === 127) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 169 && b === 254) return true;
  return false;
}

function isLocalIpv6(host: string): boolean {
  const value = host.toLowerCase();
  if (!value.includes(":")) return false;
  if (value === "::1") return true;
  if (value.startsWith("fe80:")) return true;
  return /^f[cd][0-9a-f]{0,2}:/.test(value);
}

function isBoxHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (/^wifilabel-[a-z0-9-]+\.local$/.test(host)) return true;
  return isPrivateIpv4(host) || isLocalIpv6(host);
}

/** http://192.168.x.x or http://wifilabel-xxxx.local, nothing else. */
export function boxOrigin(host: string): string {
  const trimmed = host.trim().replace(/\/$/, "");
  if (!trimmed) throw new Error("Enter the box address");
  const withScheme = trimmed.includes("://") ? trimmed : `http://${trimmed}`;
  const url = new URL(withScheme);
  if (url.protocol !== "http:") throw new Error("Use http:// for a box on your local network");
  if (url.username || url.password) throw new Error("Box addresses do not take a username");
  if (!isBoxHost(url.hostname)) {
    throw new Error("Use a private IP or a wifilabel-xxxx.local address");
  }
  return url.origin;
}

/**
 * Local-network stub. write() stores bytes and read() POSTs them to /api/raw.
 * Firmware contract: docs/box-api.md.
 */
export class BoxClient implements Transport {
  private pending: Uint8Array | null = null;
  private closed = false;
  private tail: Promise<void> = Promise.resolve();

  private constructor(readonly origin: string) {}

  static connect(host: string): BoxClient {
    return new BoxClient(boxOrigin(host));
  }

  async info(timeoutMs = 4000): Promise<BoxInfo> {
    const response = await this.call("/api/info", { method: "GET" }, timeoutMs);
    return (await response.json()) as BoxInfo;
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
      this.pending = Uint8Array.from(data);
    });
  }

  async read(timeoutMs: number): Promise<Uint8Array> {
    return this.enqueue(async () => {
      if (this.closed) throw new Error("transport closed");
      const body = this.pending;
      if (!body) return new Uint8Array();
      this.pending = null;
      const response = await this.call(
        "/api/raw",
        {
          method: "POST",
          body: body as unknown as BodyInit,
          headers: { "content-type": "application/octet-stream" },
        },
        timeoutMs,
      );
      return new Uint8Array(await response.arrayBuffer());
    });
  }

  async close(): Promise<void> {
    this.closed = true;
    this.pending = null;
  }

  private async call(path: string, init: BoxFetchInit, timeoutMs: number): Promise<Response> {
    const request: BoxFetchInit = {
      ...init,
      redirect: "error",
      targetAddressSpace: "local",
      signal: AbortSignal.timeout(timeoutMs),
    };
    const response = await fetch(`${this.origin}${path}`, request);
    if (!response.ok) throw new Error(`Box returned ${response.status}`);
    return response;
  }
}
