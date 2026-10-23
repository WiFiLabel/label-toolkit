export { concatBytes, hexToBytes, toHex } from "./bytes.ts";
export {
  CANNED_HI_HEX,
  CANNED_HQES_HEX,
  CANNED_HS_HEX,
  CANNED_SGD_15_HEX,
  CANNED_SGD_NAME_HEX,
  CannedPrinterTransport,
  cannedQueryResponses,
  createCannedPrinterTransport,
} from "./canned.ts";
export {
  INCOGNITO_WARNING,
  LINUX_RELOAD_COMMANDS,
  LINUX_UDEV_RULE,
  UNSUPPORTED_BROWSER_MESSAGE,
  guidanceForUsbError,
} from "./guidance.ts";
export type { Guidance, GuidanceReason } from "./guidance.ts";
export { detectOs, detectOsFromNavigator } from "./os.ts";
export type { OsName } from "./os.ts";
export {
  PRINTER_CLASS,
  WebUsbTransport,
  ZEBRA_VENDOR_ID,
  permittedDevices,
  requestPrinter,
  watchUsb,
  webUsbSupport,
} from "./webusb.ts";
export type {
  UsbAlternateLike,
  UsbConfigurationLike,
  UsbConnectionLike,
  UsbDeviceLike,
  UsbEndpointLike,
  UsbInterfaceLike,
  UsbPort,
  WebUsbScope,
} from "./webusb.ts";
