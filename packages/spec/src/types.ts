export type Language = "zpl" | "epl2" | "tspl" | "escpos";
export type Risk = "safe" | "caution" | "destructive";
export type Category =
  | "print-quality"
  | "media"
  | "calibration"
  | "status"
  | "memory"
  | "network"
  | "reset"
  | "label-format";

export interface CommandParam {
  key: string;
  name: string;
  type: "number" | "integer" | "string" | "enum" | "flag";
  range?: [number, number];
  step?: number;
  default?: number | string | null;
  units?: string;
  values?: string[];
  optional?: boolean;
  verified?: boolean;
}

export interface Models {
  all: boolean;
  ids?: string[];
  notes?: string;
}

export interface CommandExample {
  title: string;
  code: string;
}

export interface Command {
  id: string;
  language: Language;
  prefix: string;
  name: string;
  category: Category;
  syntax: string;
  joiner: "" | ",";
  params: CommandParam[];
  persist: string | null;
  sgd: string | null;
  risk: Risk;
  summary: string;
  explain: string;
  symptoms: string[];
  examples: CommandExample[];
  seeAlso: string[];
  models: Models;
  sourceRef: string;
  verified?: boolean;
}

export interface Setting {
  key: string;
  language?: "sgd";
  type: "enum" | "int" | "number" | "string" | "bool";
  values?: string[];
  range?: [number, number];
  step?: number;
  readOnly: boolean;
  access: Array<"getvar" | "setvar" | "do">;
  zplEquivalent: string | null;
  units?: string | null;
  risk: Risk;
  summary: string;
  explain: string;
  symptoms: string[];
  models: Models;
  sourceRef: string;
  verified?: boolean;
}

export interface PrinterProfile {
  id: string;
  displayName: string;
  languages: Language[];
  dpi: number[];
  maxWidthDots: number;
  speed: { min: number; max: number; units: string };
  darkness: { min: number; max: number };
  usb: { vendorId: number; productIds: number[] };
  notes: string;
  summary: string;
  explain: string;
  sourceRef: string;
  verified: boolean;
}

export interface StatusField {
  name: string;
  index: number;
  type: "string" | "number" | "flag" | "hex";
  values?: Record<string, string>;
}

export interface StatusLine {
  name: string;
  fields: StatusField[];
}

export interface StatusSpec {
  id: "HS" | "HQES" | "HI";
  language: "zpl";
  command: string;
  framing: {
    stx: number;
    etx: number;
    lineEnding: "crlf" | "lf" | "none";
    lineCount?: number;
  };
  lines: StatusLine[];
  summary: string;
  explain: string;
  sourceRef: string;
}
