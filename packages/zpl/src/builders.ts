import { zplCommandById, type Command } from "@wifilabel/printer-spec";
import { SpecError } from "./errors.ts";

function command(id: string): Command {
  const found = zplCommandById[id];
  if (!found) throw new SpecError("invalid", `unknown command ${id}`);
  return found;
}

function formatNumber(value: number): string {
  if (!Number.isFinite(value)) throw new SpecError("invalid", "expected a finite number");
  const rounded = Math.round(value * 1000) / 1000;
  if (Math.abs(rounded - Math.trunc(rounded)) < 1e-9) return String(Math.trunc(rounded));
  return String(rounded);
}

function assertNumber(id: string, value: number): void {
  const cmd = command(id);
  const param = cmd.params[0];
  if (!param?.range) return;
  const [min, max] = param.range;
  if (value < min || value > max) {
    throw new SpecError("range", `${id} value ${value} is outside ${min}..${max}`);
  }
  if (param.step) {
    const steps = (value - min) / param.step;
    if (Math.abs(steps - Math.round(steps)) > 1e-6) {
      throw new SpecError("range", `${id} value ${value} does not match step ${param.step}`);
    }
  }
}

function hasControlOrCaret(text: string): boolean {
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code < 0x20 || text[i] === "^" || text[i] === "~") return true;
  }
  return false;
}

function emit(id: string, args: string[] = []): string {
  const cmd = command(id);
  const body = args.length === 0 ? "" : args.join(cmd.joiner);
  return `${cmd.prefix}${cmd.id}${body}\n`;
}

function formatTear(dots: number): string {
  assertNumber("TA", dots);
  const abs = String(Math.abs(Math.trunc(dots)));
  if (dots < 0) return `~TA-${abs.padStart(3, "0")}\n`;
  return `~TA${abs.padStart(3, "0")}\n`;
}

const MEDIA_TYPE: Record<string, string> = {
  direct: "D",
  d: "D",
  "direct thermal": "D",
  transfer: "T",
  thermal: "T",
  t: "T",
  "thermal transfer": "T",
};

const TRACKING: Record<string, string> = {
  gap: "Y",
  web: "Y",
  "non-continuous": "Y",
  y: "Y",
  continuous: "N",
  n: "N",
  mark: "M",
  "black-mark": "M",
  m: "M",
};

export function setDarkness(value: number): string {
  assertNumber("SD", value);
  return emit("SD", [formatNumber(value)]);
}

export function mediaDarkness(value: number): string {
  assertNumber("MD", value);
  return emit("MD", [formatNumber(value)]);
}

export function printSpeed(value: number): string {
  assertNumber("PR", value);
  return emit("PR", [formatNumber(value)]);
}

export function mediaType(kind: string): string {
  const letter = MEDIA_TYPE[kind.trim().toLowerCase()];
  if (!letter) throw new SpecError("invalid", `unknown media type ${kind}`);
  return emit("MT", [letter]);
}

export function mediaTracking(kind: string): string {
  const letter = TRACKING[kind.trim().toLowerCase()];
  if (!letter) throw new SpecError("invalid", `unknown media tracking ${kind}`);
  return emit("MN", [letter]);
}

export function printWidth(dots: number): string {
  assertNumber("PW", dots);
  return emit("PW", [formatNumber(dots)]);
}

export function labelLength(dots: number): string {
  assertNumber("LL", dots);
  return emit("LL", [formatNumber(dots)]);
}

export function calibrate(): string {
  return emit("JC");
}

export function saveSettings(): string {
  return "^XA^JUS^XZ\n";
}

export function calibrateFlow(): string {
  return `${calibrate()}${saveSettings()}`;
}

export function factoryReset(options?: { confirm?: boolean }): string {
  if (command("JUF").risk === "destructive" && !options?.confirm) {
    throw new SpecError("confirm", "factory reset requires { confirm: true }");
  }
  return "^XA^JUF^XZ\n";
}

export function restart(options?: { confirm?: boolean }): string {
  if (!options?.confirm) throw new SpecError("confirm", "restart requires { confirm: true }");
  return emit("JR");
}

export function tearOff(dots: number): string {
  return formatTear(dots);
}

export function setTearOff(dots: number, options?: { save?: boolean }): string {
  const parts = ["^XA^MMT^MNY^XZ\n", formatTear(dots)];
  if (options?.save) parts.push(saveSettings());
  return parts.join("");
}

export interface TestLabelOptions {
  widthDots: number;
  heightDots: number;
  text: string;
}

export function testLabel(options: TestLabelOptions): string {
  assertNumber("PW", options.widthDots);
  assertNumber("LL", options.heightDots);
  if (!options.text || hasControlOrCaret(options.text)) {
    throw new SpecError("invalid", "test label text must be plain and non-empty");
  }
  return [
    "^XA",
    `^PW${formatNumber(options.widthDots)}`,
    `^LL${formatNumber(options.heightDots)}`,
    `^FO20,20^A0N,36,36^FD${options.text}^FS`,
    "^XZ",
    "",
  ].join("\n");
}

export interface AlignTargetOptions {
  widthDots?: number;
  lengthDots?: number;
  labelTop?: number;
  leftShift?: number;
  tearOff?: number;
}

export function alignTarget(options: AlignTargetOptions = {}): string {
  const width = options.widthDots ?? 812;
  const length = options.lengthDots ?? 1218;
  const top = options.labelTop ?? 0;
  const left = options.leftShift ?? 0;
  const tear = options.tearOff ?? 0;
  assertNumber("PW", width);
  assertNumber("LL", length);
  assertNumber("LT", top);
  assertNumber("LS", left);
  const midX = Math.trunc(width / 2);
  const midY = Math.trunc(length / 2);
  return [
    "^XA",
    "^MMT",
    `^PW${width}`,
    `^LL${length}`,
    `^LT${top}`,
    `^LS${left}`,
    `^TO${tear}`,
    "^MNY",
    `^FO0,0^GB${width - 1},${length - 1},4^FS`,
    `^FO${midX},0^GB2,${length},2^FS`,
    `^FO0,${midY}^GB${width},2,2^FS`,
    `^FO20,20^A0N,30,30^FDALIGN top=${top} left=${left}^FS`,
    `^FO20,60^A0N,24,24^FDtear_off(^TO)=${tear}^FS`,
    "^FO20,95^A0N,24,24^FDGap should stop at tear bar^FS",
    "^XZ",
    "",
  ].join("\n");
}

export interface TearTestOptions {
  widthDots?: number;
  lengthDots?: number;
  tearOff?: number;
  extraFeedDots?: number;
  save?: boolean;
}

export function tearTest(options: TearTestOptions = {}): string {
  const width = options.widthDots ?? 812;
  const length = options.lengthDots ?? 1218;
  const extra = Math.max(0, Math.trunc(options.extraFeedDots ?? 0));
  const toValue = Math.max(-120, Math.min(120, Math.trunc(options.tearOff ?? 0)));
  const present = Math.max(0, toValue) + extra;
  const save = options.save ? "^JUS\n" : "";
  if (present > 0) {
    const feed = length + present;
    return (
      `^XA\n^MMT\n^MNC\n^PW${width}\n^LL${feed}\n^TO0\n^XB\n${save}` +
      "^FO40,40^A0N,40,40^FDTEAR TEST (continuous)^FS\n" +
      `^FO40,100^A0N,28,28^FDLL=${feed} (= ${length}+${present})^FS\n` +
      "^FO40,145^A0N,24,24^FDShould stop at tear bar; one label only^FS\n" +
      "^XZ\n"
    );
  }
  return (
    `^XA\n^MMT\n^MNY\n^PW${width}\n^LL${length}\n^TO${toValue}\n^XB\n${save}` +
    "^FO40,40^A0N,40,40^FDTEAR TEST^FS\n" +
    `^FO40,100^A0N,30,30^FD^TO=${toValue}^FS\n` +
    "^XZ\n"
  );
}

export function graphicField(bitmap: Uint8Array, widthDots: number, heightDots: number): string {
  if (widthDots <= 0 || heightDots <= 0) throw new SpecError("invalid", "bitmap size");
  const bytesPerRow = Math.ceil(widthDots / 8);
  const expected = bytesPerRow * heightDots;
  if (bitmap.byteLength < expected)
    throw new SpecError("invalid", "bitmap is shorter than width times height");
  let hex = "";
  for (let i = 0; i < expected; i += 1) {
    hex += (bitmap[i] ?? 0).toString(16).toUpperCase().padStart(2, "0");
  }
  return `^XA\n^PW${widthDots}\n^LL${heightDots}\n^FO0,0^GFA,${expected},${expected},${bytesPerRow},${hex}^FS\n^XZ\n`;
}
