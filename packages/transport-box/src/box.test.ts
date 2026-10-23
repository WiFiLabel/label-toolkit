import { afterEach, describe, expect, it, vi } from "vitest";
import { BoxClient, boxOrigin } from "./index.ts";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("boxOrigin", () => {
  it("accepts an IP or a wifilabel host", () => {
    expect(boxOrigin("192.168.1.20")).toBe("http://192.168.1.20");
    expect(boxOrigin("http://wifilabel-ab12.local/")).toBe("http://wifilabel-ab12.local");
  });

  it("rejects https, credentials, and public hosts", () => {
    expect(() => boxOrigin("https://wifilabel-ab12.local")).toThrow(/http:/);
    expect(() => boxOrigin("http://user:pass@192.168.1.20")).toThrow(/username/);
    expect(() => boxOrigin("8.8.8.8")).toThrow(/private IP/);
    expect(() => boxOrigin("http://example.com")).toThrow(/private IP/);
    expect(() => boxOrigin("printer.local")).toThrow(/private IP/);
  });

  it("accepts other private and link-local addresses", () => {
    expect(boxOrigin("10.1.2.3")).toBe("http://10.1.2.3");
    expect(boxOrigin("172.16.5.5")).toBe("http://172.16.5.5");
    expect(boxOrigin("169.254.1.8")).toBe("http://169.254.1.8");
    expect(boxOrigin("127.0.0.1")).toBe("http://127.0.0.1");
  });
});

describe("BoxClient", () => {
  it("posts raw bytes and reads info with a local-network target", async () => {
    const calls: Array<{ url: string; init: RequestInit & { targetAddressSpace?: string } }> = [];
    vi.stubGlobal(
      "fetch",
      async (url: string, init: RequestInit & { targetAddressSpace?: string }) => {
        calls.push({ url, init });
        if (url.endsWith("/api/info")) {
          return new Response(JSON.stringify({ name: "wifilabel-ab12" }), { status: 200 });
        }
        return new Response(Uint8Array.from([0x4f, 0x4b]), { status: 200 });
      },
    );
    const client = BoxClient.connect("wifilabel-ab12.local");
    await client.write(Uint8Array.from([0x5e, 0x58, 0x41]));
    const bytes = await client.read(1000);
    const info = await client.info();
    expect([...bytes]).toEqual([0x4f, 0x4b]);
    expect(info.name).toBe("wifilabel-ab12");
    expect(calls.every((call) => call.init.targetAddressSpace === "local")).toBe(true);
    expect(calls.every((call) => call.init.redirect === "error")).toBe(true);
    expect(calls[0]?.url).toBe("http://wifilabel-ab12.local/api/raw");
    expect(calls[0]?.init.method).toBe("POST");
    expect(calls[1]?.url).toBe("http://wifilabel-ab12.local/api/info");
    const quiet = await client.read(1000);
    expect(quiet.byteLength).toBe(0);
    expect(calls.filter((call) => call.url.endsWith("/api/raw"))).toHaveLength(1);
  });
});
