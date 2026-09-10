import { describe, expect, it } from "vitest";
import vm from "node:vm";

import {
  documentThemeAttributes,
  PREVIEW_THEME_COOKIE,
  PREVIEW_THEME_INLINE_SCRIPT,
} from "./preview-theme-storage.ts";
import type { StoredPreviewTheme } from "./preview-theme-storage.ts";

/**
 * The pre-paint script is shipped as a string, so it cannot be type-checked or
 * imported. These tests execute the exact string against a stub document and
 * hold it to the same mapping as `documentThemeAttributes` — the single source
 * the SSR markup and `DocumentThemeProvider`'s effect also follow.
 */
function runPrePaintScript(cookie: string) {
  const classes = new Set<string>();
  const documentElement = {
    dataset: {} as { theme?: string },
    classList: {
      toggle: (name: string, force?: boolean) => {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    },
    style: {} as { colorScheme?: string },
  };

  vm.runInNewContext(PREVIEW_THEME_INLINE_SCRIPT, { document: { cookie, documentElement } });

  return {
    theme: documentElement.dataset.theme,
    colorScheme: documentElement.style.colorScheme,
    light: classes.has("light"),
    dark: classes.has("dark"),
  };
}

function cookieFor(value: unknown) {
  return `${PREVIEW_THEME_COOKIE}=${encodeURIComponent(JSON.stringify(value))}`;
}

const WRITTEN_CASES: ReadonlyArray<{ name: string; cookie: string; stored: StoredPreviewTheme }> = [
  {
    name: "brutal",
    cookie: cookieFor({ theme: "brutal", mode: "light" }),
    stored: { theme: "brutal", mode: "light" },
  },
  {
    name: "elegant light",
    cookie: cookieFor({ theme: "elegant", mode: "light" }),
    stored: { theme: "elegant", mode: "light" },
  },
  {
    name: "elegant dark",
    cookie: cookieFor({ theme: "elegant", mode: "dark" }),
    stored: { theme: "elegant", mode: "dark" },
  },
  {
    name: "cookie alongside others",
    cookie: `foo=1; ${cookieFor({ theme: "elegant", mode: "dark" })}; bar=2`,
    stored: { theme: "elegant", mode: "dark" },
  },
];

describe("pre-paint theme script", () => {
  for (const { name, cookie, stored } of WRITTEN_CASES) {
    it(`writes exactly documentThemeAttributes(${name})`, () => {
      const expected = documentThemeAttributes(stored);
      const actual = runPrePaintScript(cookie);

      expect(actual).toEqual({
        theme: expected.theme,
        colorScheme: expected.colorScheme,
        light: expected.light,
        dark: expected.dark,
      });
    });
  }

  it("leaves the document untouched when there is nothing valid to apply", () => {
    // No cookie, malformed JSON, or values outside the accepted set: the
    // prerendered default markup is left as-is rather than rewritten.
    const untouched = { theme: undefined, colorScheme: undefined, light: false, dark: false };
    expect(runPrePaintScript("")).toEqual(untouched);
    expect(runPrePaintScript(`${PREVIEW_THEME_COOKIE}=%7Bnope`)).toEqual(untouched);
    expect(runPrePaintScript(cookieFor({ theme: "solar", mode: "light" }))).toEqual(untouched);
    expect(runPrePaintScript(cookieFor({ theme: "elegant", mode: "system" }))).toEqual(untouched);
  });

  it("matches the document defaults the resolver reports for a missing choice", () => {
    // What the untouched pre-paint document already means: the SSR markup.
    expect(documentThemeAttributes(null)).toEqual({
      theme: "brutal",
      colorScheme: "light",
      light: false,
      dark: false,
    });
  });
});
