import { describe, expect, it } from "vitest";
import { decodeLatin1, encodeAscii, MockTransport, readUntilQuiet } from "./index.ts";

describe("readUntilQuiet", () => {
  it("returns the response armed by write and stops on the empty follow-up", async () => {
    const transport = new MockTransport(["ab", "c"]);
    await transport.write(encodeAscii("~HI\n"));
    const first = await readUntilQuiet(transport, { timeoutMs: 500, quietMs: 50 });
    expect(decodeLatin1(first)).toBe("ab");
    await transport.write(encodeAscii("~HS\n"));
    const second = await readUntilQuiet(transport, { timeoutMs: 500, quietMs: 50 });
    expect(decodeLatin1(second)).toBe("c");
  });
});
