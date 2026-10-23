import { describe, expect, it } from "vitest";
import { clearBuffer, density, length, print, width } from "./index.ts";

describe("epl2 builders", () => {
  it("builds a short setup sequence", () => {
    expect(clearBuffer()).toBe("N\n");
    expect(width(812)).toBe("q812\n");
    expect(length(1218, 24)).toBe("Q1218,24\n");
    expect(density(8)).toBe("D8\n");
    expect(print()).toBe("P1\n");
  });
});
