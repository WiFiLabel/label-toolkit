import type { OsName } from "./os.ts";

export type GuidanceReason =
  "win_driver" | "macos_queue" | "linux_udev" | "incognito" | "no_device" | "generic";

export interface Guidance {
  reason: GuidanceReason;
  title: string;
  steps: string[];
  /** Always show this. Incognito and guest profiles cannot claim USB devices. */
  incognitoWarning: string;
  boxCta: boolean;
}

export const INCOGNITO_WARNING =
  "Incognito and guest profiles block USB access. Open a normal browser window and try again.";

export const UNSUPPORTED_BROWSER_MESSAGE =
  "Use Chrome or Edge on Mac, Windows, Linux, ChromeOS or Android. Safari and Firefox don't support USB printers.";

export const LINUX_UDEV_RULE = 'SUBSYSTEM=="usb", ATTRS{idVendor}=="0a5f", TAG+="uaccess"';

export const LINUX_RELOAD_COMMANDS = [
  "sudo udevadm control --reload-rules",
  "sudo udevadm trigger",
];

function textOf(error: unknown): string {
  if (error instanceof Error) return `${error.name} ${error.message}`;
  return String(error);
}

function claimFailure(message: string): boolean {
  return /access denied|unable to claim|claim interface|securityerror|networkerror|device is busy/.test(
    message,
  );
}

export function guidanceForUsbError(os: OsName, error: unknown): Guidance {
  const message = textOf(error).toLowerCase();
  if (/notfound|no device selected|cancelled|canceled/.test(message)) {
    return {
      reason: "no_device",
      title: "No printer was chosen",
      steps: ["Click Connect and pick the printer in the browser list."],
      incognitoWarning: INCOGNITO_WARNING,
      boxCta: false,
    };
  }
  if (/incognito|guest profile/.test(message)) {
    return {
      reason: "incognito",
      title: "This browser profile cannot use USB",
      steps: [INCOGNITO_WARNING],
      incognitoWarning: INCOGNITO_WARNING,
      boxCta: false,
    };
  }
  if (os === "windows" && claimFailure(message)) {
    return {
      reason: "win_driver",
      title: "Windows is holding the USB port",
      steps: [
        "Option A: use the WiFiLabel box (network mode, no driver change).",
        "Option B: install a WinUSB driver with Zadig so Chrome can claim the printer.",
        "In Zadig, choose the Zebra printer, select WinUSB, and click Replace Driver.",
        "Warning: normal Windows printing stops until you revert this.",
        "To revert: Device Manager, Update driver, USB Printing Support.",
      ],
      incognitoWarning: INCOGNITO_WARNING,
      boxCta: true,
    };
  }
  if (os === "macos" && claimFailure(message)) {
    return {
      reason: "macos_queue",
      title: "macOS queued this printer",
      steps: [
        "Open System Settings, then Printers & Scanners.",
        "Remove the Zebra printer from the list.",
        "Unplug the USB cable, plug it back in, and click Connect again.",
      ],
      incognitoWarning: INCOGNITO_WARNING,
      boxCta: false,
    };
  }
  if (os === "linux" && claimFailure(message)) {
    return {
      reason: "linux_udev",
      title: "Linux needs a udev rule for this printer",
      steps: [
        `Save this rule in /etc/udev/rules.d/99-zebra-printer.rules: ${LINUX_UDEV_RULE}`,
        LINUX_RELOAD_COMMANDS.join(" && "),
        "Unplug the printer, plug it back in, and click Connect again.",
      ],
      incognitoWarning: INCOGNITO_WARNING,
      boxCta: false,
    };
  }
  return {
    reason: "generic",
    title: "The printer did not connect",
    steps: [
      "Use a USB data cable and plug the printer in directly.",
      "Allow the browser USB prompt, then try Connect again.",
    ],
    incognitoWarning: INCOGNITO_WARNING,
    boxCta: false,
  };
}
