import { describe, expect, it } from "vitest";
import { colors, tonePalette } from "./tokens";

describe("design tokens", () => {
  it("matches the brief's base palette", () => {
    expect(colors.primary).toBe("#2AEEEF");
    expect(colors.primaryDark).toBe("#004A75");
    expect(colors.background).toBe("#F2F2F2");
    expect(colors.text).toBe("#0F0F0F");
  });

  it("matches the design's derived tone tints", () => {
    expect(tonePalette.danger).toEqual({ bg: "#FFF0F0", text: "#8A2E2E", dot: "#C64545" });
    expect(tonePalette.success).toEqual({ bg: "#F0FFF0", text: "#1E6B1E", dot: "#2E8A2E" });
    expect(tonePalette.info).toEqual({ bg: "#F0F2FF", text: "#2B3C7D", dot: "#3B4E9C" });
    expect(tonePalette.neutral).toEqual({ bg: "#F7F8F8", text: "#4A5560", dot: "#8B9297" });
  });
});
