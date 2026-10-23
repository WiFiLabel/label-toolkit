import { describe, expect, it } from "vitest";
import { eplCommands, printers, settings, statuses, zplCommands } from "./index.ts";

function words(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

describe("spec coverage", () => {
  it("meets the minimum catalog size", () => {
    expect(zplCommands.length).toBeGreaterThanOrEqual(30);
    expect(settings.length).toBeGreaterThanOrEqual(20);
    expect(printers.length).toBeGreaterThanOrEqual(8);
    expect(eplCommands.length).toBeGreaterThanOrEqual(9);
    expect(statuses.map((status) => status.id).sort()).toEqual(["HI", "HQES", "HS"]);
  });

  it("gives every entry a long explanation, a summary, and a docs link", () => {
    const commandIds = new Set([...zplCommands, ...eplCommands].map((command) => command.id));
    const settingKeys = new Set(settings.map((setting) => setting.key));
    expect(commandIds.size).toBe(zplCommands.length + eplCommands.length);
    expect(settingKeys.size).toBe(settings.length);
    expect(new Set(printers.map((printer) => printer.id)).size).toBe(printers.length);

    for (const entry of [...zplCommands, ...eplCommands, ...settings, ...printers, ...statuses]) {
      expect(words(entry.explain)).toBeGreaterThanOrEqual(40);
      expect(entry.summary.length).toBeGreaterThan(0);
      expect(entry.sourceRef.startsWith("https://docs.zebra.com/")).toBe(true);
    }
    for (const command of [...zplCommands, ...eplCommands]) {
      for (const ref of command.seeAlso) {
        expect(commandIds.has(ref)).toBe(true);
      }
    }
  });

  it("marks printer profiles unverified and leaves USB product ids empty", () => {
    for (const printer of printers) {
      expect(printer.verified).toBe(false);
      expect(printer.usb.vendorId).toBe(0x0a5f);
      expect(printer.usb.productIds).toEqual([]);
    }
  });
});
