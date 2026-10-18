import { describe, expect, it } from "vitest";

import { oklchToHex, tokenGroup, TOKEN_GROUPS } from "./tokens.ts";

describe("tokens", () => {
  it("converts OKLCH to the hex values the guidelines quote", () => {
    // The frame yellow and white paper (design/foundations/color.md).
    expect(oklchToHex([0.8829, 0.1623, 91.9])).toBe("#ffd440");
    expect(oklchToHex([1, 0, 0])).toBe("#ffffff");
  });

  it("lists a group with light and dark values and follows references", () => {
    const canvas = tokenGroup("layer")!.find((row) => row.name === "layer-canvas")!;
    expect(canvas.cssVar).toBe("--layer-canvas");
    expect(canvas.light.display).toBe("#ffffff");
    expect(canvas.dark.display).not.toBe("#ffffff");

    const brand = tokenGroup("brand")!.find((row) => row.name === "brand-500")!;
    expect(brand.light.reference).toBe("palette-yellow-500");
    expect(brand.light.display).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("names a group's own token after the group", () => {
    expect(tokenGroup("foreground")!.some((row) => row.name === "foreground")).toBe(true);
    expect(TOKEN_GROUPS).toContain("line");
    expect(tokenGroup("no-such-group")).toBeNull();
  });
});
