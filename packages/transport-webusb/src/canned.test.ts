import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MockTransport } from "@wifilabel/transport";
import { queryPrinter } from "@wifilabel/zpl";
import { describe, expect, it } from "vitest";
import {
  CANNED_HI_HEX,
  CANNED_HQES_HEX,
  CANNED_HS_HEX,
  CANNED_SGD_15_HEX,
  CANNED_SGD_NAME_HEX,
  cannedQueryResponses,
  createCannedPrinterTransport,
} from "./canned.ts";

const vectors = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "../../../test-vectors/parsers.json"),
    "utf8",
  ),
) as { parsers: Array<{ fn: string; rawHex: string }> };

function hex(fn: string): string {
  const row = vectors.parsers.find((item) => item.fn === fn);
  if (!row) throw new Error(`missing ${fn}`);
  return row.rawHex;
}

describe("canned replies", () => {
  it("copies ~HI, ~HS, ~HQES, and SGD bytes from test-vectors", () => {
    expect(CANNED_HI_HEX).toBe(hex("parseHi"));
    expect(CANNED_HS_HEX).toBe(
      vectors.parsers.find((item) => item.fn === "parseHostStatus")?.rawHex,
    );
    expect(CANNED_HQES_HEX).toBe(vectors.parsers.find((item) => item.fn === "parseHqes")?.rawHex);
    expect(CANNED_SGD_15_HEX).toBe(vectors.parsers.find((item) => item.fn === "parseSgd")?.rawHex);
    expect(CANNED_SGD_NAME_HEX).toBe(
      vectors.parsers.filter((item) => item.fn === "parseSgd")[1]?.rawHex,
    );
  });

  it("feeds MockTransport enough replies for queryPrinter", async () => {
    const transport = new MockTransport(cannedQueryResponses());
    const snapshot = await queryPrinter(transport);
    expect(snapshot.model).toContain("ZP 450");
    expect(snapshot.dpi).toBe(203);
    expect(snapshot.friendlyName).toBe("Pack bench");
    expect(snapshot.hostStatus.paperOut).toBe(false);
    expect(snapshot.hqes.errorCount).toBe(0);
  });

  it("remembers an SGD set for the next get", async () => {
    const transport = createCannedPrinterTransport();
    await transport.write(new TextEncoder().encode('! U1 setvar "media.darkness" "20"\r\n'));
    await transport.read(50);
    await transport.write(new TextEncoder().encode('! U1 getvar "media.darkness"\r\n'));
    const raw = new TextDecoder().decode(await transport.read(50));
    expect(raw).toContain("20");
  });
});
