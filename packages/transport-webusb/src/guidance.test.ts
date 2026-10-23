import { describe, expect, it } from "vitest";
import { INCOGNITO_WARNING, LINUX_UDEV_RULE, guidanceForUsbError } from "./guidance.ts";
import { detectOs } from "./os.ts";

describe("detectOs", () => {
  it("prefers the client hint platform", () => {
    expect(detectOs({ platform: "Windows", userAgent: "Linux" })).toBe("windows");
    expect(detectOs({ platform: "macOS" })).toBe("macos");
    expect(detectOs({ platform: "Chrome OS" })).toBe("chromeos");
    expect(detectOs({ platform: "Android" })).toBe("android");
    expect(detectOs({ userAgent: "X11; Linux x86_64" })).toBe("linux");
  });
});

describe("guidanceForUsbError", () => {
  it("maps a Windows claim failure to Zadig and the revert steps", () => {
    const guide = guidanceForUsbError("windows", new Error("Access denied"));
    expect(guide.reason).toBe("win_driver");
    expect(guide.boxCta).toBe(true);
    expect(guide.steps.join(" ")).toContain("Zadig");
    expect(guide.steps.join(" ")).toContain("WinUSB");
    expect(guide.steps.join(" ")).toContain("normal Windows printing stops");
    expect(guide.steps.join(" ")).toContain("Device Manager");
    expect(guide.steps.join(" ")).toContain("USB Printing Support");
    expect(guide.steps.join(" ")).toContain("WiFiLabel box");
    expect(guide.incognitoWarning).toBe(INCOGNITO_WARNING);
  });

  it("maps unable to claim on macOS and Linux", () => {
    const mac = guidanceForUsbError("macos", new Error("Unable to claim interface"));
    expect(mac.reason).toBe("macos_queue");
    expect(mac.steps.join(" ")).toContain("Printers & Scanners");
    const linux = guidanceForUsbError("linux", new Error("Unable to claim interface"));
    expect(linux.reason).toBe("linux_udev");
    expect(linux.steps.join(" ")).toContain(LINUX_UDEV_RULE);
    expect(linux.steps.join(" ")).toContain("udevadm control --reload-rules");
  });

  it("warns when the error itself is an incognito block", () => {
    const guide = guidanceForUsbError("windows", new Error("blocked in incognito"));
    expect(guide.reason).toBe("incognito");
  });
});
