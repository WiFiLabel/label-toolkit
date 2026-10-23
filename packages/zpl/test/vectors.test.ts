import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { SpecError } from "../src/errors.ts";
import {
  calibrate,
  calibrateFlow,
  factoryReset,
  labelLength,
  mediaDarkness,
  mediaTracking,
  mediaType,
  printSpeed,
  printWidth,
  saveSettings,
  setDarkness,
  setTearOff,
  tearOff,
  testLabel,
  type TestLabelOptions,
} from "../src/builders.ts";
import { parseHi, parseHostStatus, parseHqes } from "../src/parse.ts";
import { queryPrinter } from "../src/query.ts";
import { doCommand, get, parseSgdResponse, set } from "../src/sgd.ts";
import { describe as describeId } from "../src/index.ts";
import { wrapEplGw, wrapTsplBitmap, wrapZplGfa } from "../src/bitmap.ts";
import { MockTransport } from "@wifilabel/transport";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

interface BuilderCase {
  fn: string;
  args: unknown[];
  expected?: string;
  error?: string;
}

function runBuilder(row: BuilderCase): string {
  const args = row.args;
  switch (row.fn) {
    case "setDarkness":
      return setDarkness(args[0] as number);
    case "mediaDarkness":
      return mediaDarkness(args[0] as number);
    case "printSpeed":
      return printSpeed(args[0] as number);
    case "mediaType":
      return mediaType(args[0] as string);
    case "mediaTracking":
      return mediaTracking(args[0] as string);
    case "printWidth":
      return printWidth(args[0] as number);
    case "labelLength":
      return labelLength(args[0] as number);
    case "calibrate":
      return calibrate();
    case "saveSettings":
      return saveSettings();
    case "tearOff":
      return tearOff(args[0] as number);
    case "setTearOff":
      return setTearOff(args[0] as number, { save: Boolean(args[1]) });
    case "factoryReset":
      return factoryReset(args[0] as { confirm?: boolean });
    case "sgdGet":
      return get(args[0] as string);
    case "sgdSet":
      return set(args[0] as string, args[1] as string | number);
    case "sgdDo":
      return doCommand(
        args[0] as string,
        (args[1] as string) ?? "",
        args[2] as { confirm?: boolean } | undefined,
      );
    case "testLabel":
      return testLabel(args[0] as TestLabelOptions);
    case "calibrateFlow":
      return calibrateFlow();
    default:
      throw new Error(`unknown builder ${row.fn}`);
  }
}

function fromHex(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = Number.parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

describe("shared vectors", () => {
  const builders = JSON.parse(readFileSync(join(root, "test-vectors/builders.json"), "utf8")) as {
    cases: BuilderCase[];
  };

  it("matches builder wire output", () => {
    for (const row of builders.cases) {
      if (row.error) {
        expect(() => runBuilder(row), row.fn).toThrow(SpecError);
        try {
          runBuilder(row);
        } catch (error) {
          expect(error).toBeInstanceOf(SpecError);
          expect((error as SpecError).code).toBe(row.error);
        }
        continue;
      }
      expect(runBuilder(row), row.fn).toBe(row.expected);
    }
  });

  it("matches golden label files", () => {
    const label = readFileSync(join(root, "golden/test-label.zpl"), "utf8");
    const flow = readFileSync(join(root, "golden/calibrate.zpl"), "utf8");
    expect(testLabel({ widthDots: 812, heightDots: 1218, text: "HELLO" })).toBe(label);
    expect(calibrateFlow()).toBe(flow);
  });

  it("parses host status, identification, errors, and SGD", () => {
    const file = JSON.parse(readFileSync(join(root, "test-vectors/parsers.json"), "utf8")) as {
      parsers: Array<{ fn: string; rawHex: string; expected: Record<string, unknown> | string }>;
    };
    for (const row of file.parsers) {
      const raw = fromHex(row.rawHex);
      if (row.fn === "parseHostStatus") {
        const got = parseHostStatus(raw);
        const expected = row.expected as {
          paperOut: boolean;
          paused: boolean;
          headUp: boolean;
          ribbonOut: boolean;
          bufferFull: boolean;
          labelLengthDots: number;
          formatsInBuffer: number;
          faults: string[];
        };
        expect(got.paperOut).toBe(expected.paperOut);
        expect(got.paused).toBe(expected.paused);
        expect(got.headUp).toBe(expected.headUp);
        expect(got.ribbonOut).toBe(expected.ribbonOut);
        expect(got.bufferFull).toBe(expected.bufferFull);
        expect(got.labelLengthDots).toBe(expected.labelLengthDots);
        expect(got.formatsInBuffer).toBe(expected.formatsInBuffer);
        expect(got.faults).toEqual(expected.faults);
      } else if (row.fn === "parseHi") {
        const got = parseHi(raw);
        const expected = row.expected as {
          model: string;
          firmware: string;
          dpi: number;
          memoryKb: number;
        };
        expect(got.model).toBe(expected.model);
        expect(got.firmware).toBe(expected.firmware);
        expect(got.dpi).toBe(expected.dpi);
        expect(got.memoryKb).toBe(expected.memoryKb);
      } else if (row.fn === "parseHqes") {
        const got = parseHqes(raw);
        const expected = row.expected as {
          errorCount: number;
          warningCount: number;
          flags: string[];
        };
        expect(got.errorCount).toBe(expected.errorCount);
        expect(got.warningCount).toBe(expected.warningCount);
        expect(got.flags).toEqual(expected.flags);
      } else if (row.fn === "parseSgd" || row.fn === "parseSgdResponse") {
        expect(parseSgdResponse(raw)).toBe(row.expected);
      } else {
        throw new Error(row.fn);
      }
    }
  });

  it("wraps the same bitmap bytes as the C helpers", () => {
    const file = JSON.parse(readFileSync(join(root, "test-vectors/bitmaps.json"), "utf8")) as {
      bitmaps: Array<{
        fn: string;
        bitmapHex: string;
        width: number;
        height: number;
        expected?: string;
        expectedHex?: string;
      }>;
    };
    for (const row of file.bitmaps) {
      const bitmap = fromHex(row.bitmapHex);
      const wrapped =
        row.fn === "wrapZplGfa"
          ? wrapZplGfa(bitmap, row.width, row.height)
          : row.fn === "wrapEplGw"
            ? wrapEplGw(bitmap, row.width, row.height)
            : wrapTsplBitmap(bitmap, row.width, row.height);
      if (row.expected) expect(new TextDecoder().decode(wrapped)).toBe(row.expected);
      if (row.expectedHex) expect(toHex(wrapped)).toBe(row.expectedHex.toLowerCase());
    }
  });

  it("describes a command and queries a scripted printer", async () => {
    expect(describeId("SD").id).toBe("SD");
    const transport = new MockTransport([
      "\x02GK420d,V61.17.17Z,12,8192KB\x03\r\n",
      '"Front Desk"\r\n',
      '"203"\r\n',
      "\x02030,0,0,1245,000,0,0,0,000,0,0,0\x03\r\n\x02000,0,0,0,0,0,0,0,00000000,0,000\x03\r\n\x020000,0\x03\r\n",
      "\x02ERRORS: 0 00000000 00000000\r\nWARNINGS: 0 00000000 00000000\x03",
    ]);
    const snap = await queryPrinter(transport);
    expect(snap.model).toBe("GK420d");
    expect(snap.dpi).toBe(203);
    expect(snap.friendlyName).toBe("Front Desk");
    expect(snap.hostStatus.labelLengthDots).toBe(1245);
    expect(snap.hqes.errorCount).toBe(0);
    expect(transport.writes).toHaveLength(5);
  });
});
