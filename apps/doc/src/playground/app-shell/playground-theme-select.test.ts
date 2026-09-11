import { afterEach, describe, expect, it, vi } from "vitest";

import { getThemeValue } from "./playground-theme-select.tsx";
import { resolveThemeMode } from "#/lib/preview-theme-storage.ts";

/**
 * The playground's theme picker shows which preset the site is on. Its value
 * used to be derived from the raw mode, so an `elegant + system` selection on a
 * dark machine displayed "Elegant" while the page rendered elegant dark. These
 * cases pin the mapping (and its resolution boundary) that Josh asked to have
 * covered — he verified only the first-visit and elegant-system states by hand.
 */
function stubSystemPreference(prefers: "light" | "dark") {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: prefers === "dark" && query === "(prefers-color-scheme: dark)",
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("playground theme picker value", () => {
  it("maps brutal to its own preset regardless of mode", () => {
    expect(getThemeValue("brutal", "light")).toBe("brutal");
    expect(getThemeValue("brutal", "dark")).toBe("brutal");
  });

  it("maps the explicit elegant modes", () => {
    expect(getThemeValue("elegant", "light")).toBe("elegant-light");
    expect(getThemeValue("elegant", "dark")).toBe("elegant-dark");
  });

  it("follows the resolved system mode the picker is fed", () => {
    stubSystemPreference("dark");
    expect(getThemeValue("elegant", resolveThemeMode("system"))).toBe("elegant-dark");
    stubSystemPreference("light");
    expect(getThemeValue("elegant", resolveThemeMode("system"))).toBe("elegant-light");
  });
});
