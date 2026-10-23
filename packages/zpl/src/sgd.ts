import { settingByKey, type Setting } from "@wifilabel/printer-spec";
import { SpecError } from "./errors.ts";

const KEY_RE = /^[a-z][a-z0-9_.]*$/;

function unsafeSettingText(text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 0x20 || text[i] === '"') return true;
  }
  return false;
}

function stripMarkers(text: string): string {
  let out = "";
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code !== 0x02 && code !== 0x03) out += text[i];
  }
  return out;
}

function requireSetting(key: string): Setting {
  if (!KEY_RE.test(key) || !settingByKey[key]) {
    throw new SpecError("invalid", `unknown setting ${key}`);
  }
  return settingByKey[key];
}

function canonical(setting: Setting, value: string | number | boolean): string {
  if (setting.type === "int") {
    const numeric = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(numeric)) {
      throw new SpecError("range", `${setting.key} expects an integer`);
    }
    const [min, max] = setting.range ?? [Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY];
    if (numeric < min || numeric > max) {
      throw new SpecError("range", `${setting.key} value ${numeric} is outside ${min}..${max}`);
    }
    return String(numeric);
  }
  const text = String(value);
  if (setting.type === "enum" || setting.type === "bool") {
    if (!setting.values?.includes(text)) {
      throw new SpecError("range", `${setting.key} does not allow ${text}`);
    }
    return text;
  }
  if (text.length === 0 || text.length > 80 || unsafeSettingText(text)) {
    throw new SpecError("invalid", `${setting.key} value is empty or unsafe`);
  }
  return text;
}

export function get(key: string): string {
  requireSetting(key);
  return `! U1 getvar "${key}"\r\n`;
}

export function set(
  key: string,
  value: string | number | boolean,
  options?: { confirm?: boolean },
): string {
  const setting = requireSetting(key);
  if (setting.readOnly || !setting.access.includes("setvar")) {
    throw new SpecError("readonly", `${key} cannot be set`);
  }
  if (setting.risk === "destructive" && !options?.confirm) {
    throw new SpecError("confirm", `${key} requires { confirm: true }`);
  }
  return `! U1 setvar "${key}" "${canonical(setting, value)}"\r\n`;
}

export function doCommand(key: string, value = "", options?: { confirm?: boolean }): string {
  const setting = requireSetting(key);
  if (!setting.access.includes("do")) {
    throw new SpecError("invalid", `${key} is not an action`);
  }
  if (setting.risk === "destructive" && !options?.confirm) {
    throw new SpecError("confirm", `${key} requires { confirm: true }`);
  }
  if (/["\r\n]/.test(value)) throw new SpecError("invalid", "action value rejected");
  return `! U1 do "${key}" "${value}"\r\n`;
}

export function parseSgdResponse(bytes: Uint8Array | string): string {
  const text = typeof bytes === "string" ? bytes : latin1(bytes);
  let body = stripMarkers(text).trim();
  if (body.startsWith('"') && body.endsWith('"') && body.length >= 2) {
    body = body.slice(1, -1);
  }
  return body;
}

function latin1(bytes: Uint8Array): string {
  let out = "";
  for (const byte of bytes) out += String.fromCharCode(byte);
  return out;
}
