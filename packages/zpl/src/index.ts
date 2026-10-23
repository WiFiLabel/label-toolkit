import {
  eplCommandById,
  settingByKey,
  zplCommandById,
  type Command,
  type Setting,
} from "@wifilabel/printer-spec";
import {
  alignTarget,
  calibrate,
  calibrateFlow,
  factoryReset,
  graphicField,
  labelLength,
  mediaDarkness,
  mediaTracking,
  mediaType,
  printSpeed,
  printWidth,
  restart,
  saveSettings,
  setDarkness,
  setTearOff,
  tearOff,
  tearTest,
  testLabel,
} from "./builders.ts";
import { SpecError } from "./errors.ts";
import { parseHi, parseHostStatus, parseHqes } from "./parse.ts";
import { queryPrinter } from "./query.ts";
import { doCommand, get, parseSgdResponse, set } from "./sgd.ts";

export { SpecError };
export type { SpecErrorCode } from "./errors.ts";
export type { HostId, HostStatus, HqesStatus } from "./parse.ts";
export type { PrinterSnapshot } from "./query.ts";
export type { Command, Setting };

export const zpl = {
  setDarkness,
  mediaDarkness,
  printSpeed,
  mediaType,
  mediaTracking,
  printWidth,
  labelLength,
  calibrate,
  calibrateFlow,
  saveSettings,
  factoryReset,
  restart,
  tearOff,
  setTearOff,
  testLabel,
  alignTarget,
  tearTest,
  graphicField,
};

export const sgd = {
  get,
  set,
  do: doCommand,
};

export {
  alignTarget,
  calibrate,
  calibrateFlow,
  factoryReset,
  graphicField,
  labelLength,
  mediaDarkness,
  mediaTracking,
  mediaType,
  parseHi,
  parseHostStatus,
  parseHqes,
  parseSgdResponse,
  printSpeed,
  printWidth,
  queryPrinter,
  restart,
  saveSettings,
  setDarkness,
  setTearOff,
  tearOff,
  tearTest,
  testLabel,
};

export function describe(id: string): Command | Setting {
  const found = zplCommandById[id] ?? eplCommandById[id] ?? settingByKey[id];
  if (!found) throw new SpecError("invalid", `unknown id ${id}`);
  return found;
}
