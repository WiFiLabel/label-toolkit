export type SpecErrorCode = "range" | "confirm" | "readonly" | "invalid";

export class SpecError extends Error {
  readonly code: SpecErrorCode;

  constructor(code: SpecErrorCode, message: string) {
    super(message);
    this.name = "SpecError";
    this.code = code;
  }
}
