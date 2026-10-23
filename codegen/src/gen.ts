/**
 * Read spec YAML, lint it, and emit JSON, TypeScript, and C tables.
 * Firmware builds consume the committed C output and do not need Node.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv from "ajv/dist/2020.js";
import { parse } from "yaml";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const specRoot = join(root, "spec");

const REQUIRED_ZPL = [
  "SD",
  "MD",
  "PR",
  "MT",
  "MN",
  "MM",
  "PW",
  "LL",
  "LH",
  "LT",
  "LS",
  "TA",
  "PO",
  "PQ",
  "JC",
  "JG",
  "JUS",
  "JUF",
  "JUN",
  "JUR",
  "JR",
  "HS",
  "HQES",
  "HI",
  "WC",
  "HH",
  "XA",
  "XZ",
  "FO",
  "FD",
  "FS",
  "GFA",
  "CI",
  "PM",
];

const REQUIRED_SGD = [
  "device.languages",
  "device.reset",
  "device.restore_defaults",
  "device.friendly_name",
  "device.unique_id",
  "appl.name",
  "media.darkness",
  "media.speed",
  "media.type",
  "media.sense_mode",
  "media.printmode",
  "media.width_sense.enable",
  "ezpl.print_width",
  "ezpl.label_length_max",
  "ezpl.media_type",
  "ezpl.print_method",
  "ezpl.tear_off",
  "head.resolution.in_dpi",
  "odometer.total_print_length",
  "interface.network.active.ip_addr",
];

const REQUIRED_PRINTERS = [
  "zp450",
  "lp2844",
  "lp2844-z",
  "gx420d",
  "gk420d",
  "zd410",
  "zd420",
  "zd421",
];

const REQUIRED_EPL = ["N", "q", "Q", "S", "D", "ZB", "ZT", "UQ", "GW", "P"];

interface Command {
  id: string;
  language: string;
  prefix: string;
  name: string;
  risk: string;
  summary: string;
  explain: string;
  seeAlso: string[];
  params: Array<{ type?: string; range?: [number, number] }>;
  sourceRef: string;
  models: { all: boolean; ids?: string[] };
}

interface Setting {
  key: string;
  type: string;
  values?: string[];
  range?: [number, number];
  readOnly: boolean;
  access: string[];
  zplEquivalent: string | null;
  risk: string;
  summary: string;
  explain: string;
  models: { all: boolean; ids?: string[] };
  sourceRef: string;
}

interface StatusSpec {
  id: string;
  summary: string;
  explain: string;
  sourceRef: string;
}

interface Printer {
  id: string;
  summary: string;
  explain: string;
  sourceRef: string;
  verified: boolean;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function walkYaml(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (name.endsWith(".yaml")) out.push(path);
    else if (name !== "schema" && !name.includes(".")) {
      try {
        if (readdirSync(path).length >= 0) out.push(...walkYaml(path));
      } catch {
        /* not a directory */
      }
    }
  }
  return out.sort();
}

function loadSchema(name: string) {
  return JSON.parse(readFileSync(join(specRoot, "schema", name), "utf8")) as object;
}

function loadDocs(): {
  commands: Array<{ file: string; doc: Command }>;
  settings: Array<{ file: string; doc: Setting }>;
  statuses: Array<{ file: string; doc: StatusSpec }>;
  printers: Array<{ file: string; doc: Printer }>;
  errors: string[];
} {
  const ajv = new Ajv({ allErrors: true, strict: false });
  const validators = {
    command: ajv.compile(loadSchema("command.schema.json")),
    setting: ajv.compile(loadSchema("setting.schema.json")),
    status: ajv.compile(loadSchema("status.schema.json")),
    printer: ajv.compile(loadSchema("printer.schema.json")),
  };
  const errors: string[] = [];
  const commands: Array<{ file: string; doc: Command }> = [];
  const settings: Array<{ file: string; doc: Setting }> = [];
  const statuses: Array<{ file: string; doc: StatusSpec }> = [];
  const printers: Array<{ file: string; doc: Printer }> = [];

  for (const file of walkYaml(specRoot)) {
    const rel = relative(specRoot, file);
    const doc = parse(readFileSync(file, "utf8")) as Record<string, unknown>;
    let kind: keyof typeof validators;
    if (rel.startsWith("zpl/commands/") || rel.startsWith("epl2/commands/")) kind = "command";
    else if (rel.startsWith("sgd/settings/")) kind = "setting";
    else if (rel.startsWith("status/")) kind = "status";
    else if (rel.startsWith("printers/")) kind = "printer";
    else {
      errors.push(`${rel}: yaml outside a known spec folder`);
      continue;
    }
    if (!validators[kind](doc)) {
      const detail = (validators[kind].errors ?? [])
        .map((err) => `${err.instancePath} ${err.message}`)
        .join("; ");
      errors.push(`${rel}: schema ${detail}`);
      continue;
    }
    if (kind === "command") commands.push({ file: rel, doc: doc as unknown as Command });
    if (kind === "setting") settings.push({ file: rel, doc: doc as unknown as Setting });
    if (kind === "status") statuses.push({ file: rel, doc: doc as unknown as StatusSpec });
    if (kind === "printer") printers.push({ file: rel, doc: doc as unknown as Printer });
  }
  return { commands, settings, statuses, printers, errors };
}

function lint(bundle: ReturnType<typeof loadDocs>): string[] {
  const errors = [...bundle.errors];
  const commands = bundle.commands.map((row) => row.doc);
  const printers = bundle.printers.map((row) => row.doc);
  const ids = new Set<string>();
  const byLang = new Map<string, Set<string>>();

  for (const row of bundle.commands) {
    const doc = row.doc;
    if (ids.has(doc.id)) errors.push(`${row.file}: duplicate command id ${doc.id}`);
    ids.add(doc.id);
    const lang = byLang.get(doc.language) ?? new Set<string>();
    lang.add(doc.id);
    byLang.set(doc.language, lang);
    const stem =
      row.file
        .split("/")
        .pop()
        ?.replace(/\.yaml$/, "") ?? "";
    if (stem !== doc.id && !stem.startsWith(`${doc.id}-`)) {
      errors.push(`${row.file}: filename should match id ${doc.id}`);
    }
    if (wordCount(doc.explain) < 40) {
      errors.push(`${row.file}: explain has ${wordCount(doc.explain)} words`);
    }
    if (!doc.summary.trim()) errors.push(`${row.file}: missing summary`);
    if (!doc.sourceRef.startsWith("https://docs.zebra.com/")) {
      errors.push(`${row.file}: sourceRef must be on docs.zebra.com`);
    }
    for (const ref of doc.seeAlso) {
      if (
        !lang.has(ref) &&
        !commands.some((cmd) => cmd.id === ref && cmd.language === doc.language)
      ) {
        errors.push(`${row.file}: seeAlso ${ref} is not a ${doc.language} command`);
      }
    }
    if (!doc.models.all) {
      for (const id of doc.models.ids ?? []) {
        if (!printers.some((printer) => printer.id === id)) {
          errors.push(`${row.file}: unknown printer ${id}`);
        }
      }
    }
  }

  const keys = new Set<string>();
  for (const row of bundle.settings) {
    const doc = row.doc;
    if (keys.has(doc.key)) errors.push(`${row.file}: duplicate key`);
    keys.add(doc.key);
    const stem = row.file
      .split("/")
      .pop()
      ?.replace(/\.yaml$/, "");
    if (stem !== doc.key) errors.push(`${row.file}: filename should match key`);
    if (wordCount(doc.explain) < 40) errors.push(`${row.file}: explain too short`);
    if (
      doc.zplEquivalent &&
      !commands.some((cmd) => cmd.language === "zpl" && cmd.id === doc.zplEquivalent)
    ) {
      errors.push(`${row.file}: zplEquivalent ${doc.zplEquivalent} missing`);
    }
    if ((doc.type === "enum" || doc.type === "bool") && (!doc.values || doc.values.length === 0)) {
      errors.push(`${row.file}: ${doc.type} needs values`);
    }
    if (doc.type === "int" && !doc.range) errors.push(`${row.file}: int needs range`);
    if (doc.readOnly && doc.access.includes("setvar")) {
      errors.push(`${row.file}: readOnly settings cannot setvar`);
    }
  }

  for (const row of [...bundle.statuses, ...bundle.printers]) {
    if (wordCount(row.doc.explain) < 40) errors.push(`${row.file}: explain too short`);
    if (!row.doc.summary.trim()) errors.push(`${row.file}: missing summary`);
  }

  const zpl = byLang.get("zpl") ?? new Set<string>();
  for (const id of REQUIRED_ZPL) if (!zpl.has(id)) errors.push(`missing ZPL command ${id}`);
  const epl = byLang.get("epl2") ?? new Set<string>();
  for (const id of REQUIRED_EPL) if (!epl.has(id)) errors.push(`missing EPL2 command ${id}`);
  for (const key of REQUIRED_SGD) if (!keys.has(key)) errors.push(`missing SGD ${key}`);
  const printerIds = new Set(printers.map((printer) => printer.id));
  for (const id of REQUIRED_PRINTERS) if (!printerIds.has(id)) errors.push(`missing printer ${id}`);
  if (zpl.size < 30) errors.push(`need at least 30 ZPL commands, found ${zpl.size}`);
  if (keys.size < 20) errors.push(`need at least 20 SGD settings, found ${keys.size}`);
  if (printers.length < 8) errors.push(`need at least 8 printers, found ${printers.length}`);
  return errors;
}

function cEscape(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function riskEnum(risk: string): string {
  if (risk === "caution") return "WLT_RISK_CAUTION";
  if (risk === "destructive") return "WLT_RISK_DESTRUCTIVE";
  return "WLT_RISK_SAFE";
}

function langEnum(language: string): string {
  return language === "epl2" ? "WLT_LANG_EPL2" : "WLT_LANG_ZPL";
}

function cmdEnum(id: string): string {
  let name = "WLT_CMD_";
  for (const ch of id) {
    if (ch >= "a" && ch <= "z") name += `L${ch.toUpperCase()}`;
    else if (/[A-Z0-9]/.test(ch)) name += ch;
    else name += "_";
  }
  return name;
}

function setEnum(key: string): string {
  return `WLT_SET_${key.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
}

function typeEnum(type: string): string {
  if (type === "enum") return "WLT_TYPE_ENUM";
  if (type === "int") return "WLT_TYPE_INT";
  if (type === "bool") return "WLT_TYPE_BOOL";
  return "WLT_TYPE_STRING";
}

function accessBits(access: string[]): number {
  let bits = 0;
  if (access.includes("getvar")) bits |= 1;
  if (access.includes("setvar")) bits |= 2;
  if (access.includes("do")) bits |= 4;
  return bits;
}

function emitC(commands: Command[], settings: Setting[]): { header: string; source: string } {
  const sortedCommands = [...commands].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const sortedSettings = [...settings].sort((a, b) => (a.key < b.key ? -1 : 1));

  const header = `/* GENERATED from spec/ - do not edit */
#ifndef WLT_SPEC_H
#define WLT_SPEC_H

#include <stddef.h>
#include <stdint.h>

#if defined(CONFIG_WLT_WITH_DOCS) && CONFIG_WLT_WITH_DOCS
#define WLT_WITH_DOCS 1
#endif

typedef enum {
  WLT_RISK_SAFE = 0,
  WLT_RISK_CAUTION = 1,
  WLT_RISK_DESTRUCTIVE = 2
} wlt_risk_t;

typedef enum {
  WLT_LANG_ZPL = 0,
  WLT_LANG_EPL2 = 1
} wlt_lang_t;

typedef enum {
  WLT_TYPE_ENUM = 0,
  WLT_TYPE_INT = 1,
  WLT_TYPE_STRING = 2,
  WLT_TYPE_BOOL = 3
} wlt_value_type_t;

#define WLT_ACCESS_GET 1
#define WLT_ACCESS_SET 2
#define WLT_ACCESS_DO 4

typedef enum {
${sortedCommands.map((cmd, index) => `  ${cmdEnum(cmd.id)} = ${index}`).join(",\n")},
  WLT_CMD_COUNT
} wlt_cmd_id_t;

typedef enum {
${sortedSettings.map((row, index) => `  ${setEnum(row.key)} = ${index}`).join(",\n")},
  WLT_SET_COUNT
} wlt_setting_id_t;

typedef struct {
  wlt_cmd_id_t id;
  wlt_lang_t language;
  const char *code;
  char prefix;
  wlt_risk_t risk;
  int has_range;
  int32_t min_value;
  int32_t max_value;
#ifdef WLT_WITH_DOCS
  const char *summary;
#endif
} wlt_cmd_info_t;

typedef struct {
  wlt_setting_id_t id;
  const char *key;
  wlt_value_type_t type;
  int read_only;
  int access;
  int has_range;
  int32_t min_value;
  int32_t max_value;
  const char *const *values;
  wlt_risk_t risk;
#ifdef WLT_WITH_DOCS
  const char *summary;
#endif
} wlt_setting_info_t;

extern const wlt_cmd_info_t wlt_commands[WLT_CMD_COUNT];
extern const wlt_setting_info_t wlt_settings[WLT_SET_COUNT];

const wlt_cmd_info_t *wlt_cmd_info(wlt_cmd_id_t id);
const wlt_setting_info_t *wlt_setting_by_key(const char *key);

#endif
`;

  const valueArrays = sortedSettings
    .map((row, index) => {
      if (!row.values?.length) return "";
      const items = row.values.map((value) => `"${cEscape(value)}"`).join(", ");
      return `static const char *const wlt_vals_${index}[] = { ${items}, 0 };\n`;
    })
    .join("");

  const cmdRows = sortedCommands
    .map((cmd) => {
      const range = cmd.params[0]?.range;
      const has = range ? 1 : 0;
      const min = range ? Math.trunc(range[0]) : 0;
      const max = range ? Math.trunc(range[1]) : 0;
      const prefix = cmd.prefix ? `'${cmd.prefix}'` : "0";
      const summary = `"${cEscape(cmd.summary)}"`;
      return `  { ${cmdEnum(cmd.id)}, ${langEnum(cmd.language)}, "${cEscape(cmd.id)}", ${prefix}, ${riskEnum(cmd.risk)}, ${has}, ${min}, ${max},\n#ifdef WLT_WITH_DOCS\n    ${summary}\n#endif\n  }`;
    })
    .join(",\n");

  const setRows = sortedSettings
    .map((row, index) => {
      const has = row.range ? 1 : 0;
      const min = row.range ? Math.trunc(row.range[0]) : 0;
      const max = row.range ? Math.trunc(row.range[1]) : 0;
      const values = row.values?.length ? `wlt_vals_${index}` : "0";
      const summary = `"${cEscape(row.summary)}"`;
      return `  { ${setEnum(row.key)}, "${cEscape(row.key)}", ${typeEnum(row.type)}, ${row.readOnly ? 1 : 0}, ${accessBits(row.access)}, ${has}, ${min}, ${max}, ${values}, ${riskEnum(row.risk)},\n#ifdef WLT_WITH_DOCS\n    ${summary}\n#endif\n  }`;
    })
    .join(",\n");

  const source = `/* GENERATED from spec/ - do not edit */
#include "wlt_spec.h"

#include <string.h>

${valueArrays}
const wlt_cmd_info_t wlt_commands[WLT_CMD_COUNT] = {
${cmdRows}
};

const wlt_setting_info_t wlt_settings[WLT_SET_COUNT] = {
${setRows}
};

const wlt_cmd_info_t *wlt_cmd_info(wlt_cmd_id_t id) {
  if ((int)id < 0 || id >= WLT_CMD_COUNT) {
    return 0;
  }
  return &wlt_commands[id];
}

const wlt_setting_info_t *wlt_setting_by_key(const char *key) {
  size_t i;
  if (!key) {
    return 0;
  }
  for (i = 0; i < (size_t)WLT_SET_COUNT; i++) {
    if (strcmp(wlt_settings[i].key, key) == 0) {
      return &wlt_settings[i];
    }
  }
  return 0;
}
`;
  return { header, source };
}

function writeJson(path: string, value: unknown) {
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function main() {
  const checkOnly = process.argv.includes("--check");
  const bundle = loadDocs();
  const errors = lint(bundle);
  if (errors.length) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }
  const commands = bundle.commands.map((row) => row.doc).sort((a, b) => (a.id < b.id ? -1 : 1));
  const settings = bundle.settings.map((row) => row.doc).sort((a, b) => (a.key < b.key ? -1 : 1));
  const statuses = bundle.statuses.map((row) => row.doc).sort((a, b) => (a.id < b.id ? -1 : 1));
  const printers = bundle.printers.map((row) => row.doc).sort((a, b) => (a.id < b.id ? -1 : 1));
  const zpl = commands.filter((cmd) => cmd.language === "zpl");
  const epl = commands.filter((cmd) => cmd.language === "epl2");
  console.log(
    `spec ok: ${zpl.length} zpl, ${epl.length} epl2, ${settings.length} sgd, ${printers.length} printers`,
  );
  if (checkOnly) return;

  const dataDir = join(root, "packages/spec/data");
  const genDir = join(root, "packages/spec/src/generated");
  mkdirSync(dataDir, { recursive: true });
  mkdirSync(genDir, { recursive: true });
  writeJson(join(dataDir, "zpl-commands.json"), zpl);
  writeJson(join(dataDir, "epl2-commands.json"), epl);
  writeJson(join(dataDir, "settings.json"), settings);
  writeJson(join(dataDir, "status.json"), statuses);
  writeJson(join(dataDir, "printers.json"), printers);

  const ts = `/* GENERATED from spec/ - do not edit */
import type { Command, PrinterProfile, Setting, StatusSpec } from "../types.ts";

export const zplCommands: Command[] = ${JSON.stringify(zpl, null, 2)};

export const eplCommands: Command[] = ${JSON.stringify(epl, null, 2)};

export const settings: Setting[] = ${JSON.stringify(settings, null, 2)};

export const statuses: StatusSpec[] = ${JSON.stringify(statuses, null, 2)};

export const printers: PrinterProfile[] = ${JSON.stringify(printers, null, 2)};
`;
  writeFileSync(join(genDir, "data.ts"), ts);

  const c = emitC(commands, settings);
  writeFileSync(join(root, "c/include/wlt_spec.h"), c.header);
  writeFileSync(join(root, "c/src/wlt_spec.c"), c.source);
}

main();
