export type {
  Category,
  Command,
  CommandExample,
  CommandParam,
  Language,
  Models,
  PrinterProfile,
  Risk,
  Setting,
  StatusField,
  StatusLine,
  StatusSpec,
} from "./types.ts";

export { eplCommands, printers, settings, statuses, zplCommands } from "./generated/data.ts";

import { eplCommands, settings, zplCommands } from "./generated/data.ts";
import type { Command, Setting } from "./types.ts";

export const zplCommandById: Readonly<Record<string, Command>> = Object.fromEntries(
  zplCommands.map((command) => [command.id, command]),
);

export const eplCommandById: Readonly<Record<string, Command>> = Object.fromEntries(
  eplCommands.map((command) => [command.id, command]),
);

export const settingByKey: Readonly<Record<string, Setting>> = Object.fromEntries(
  settings.map((setting) => [setting.key, setting]),
);
