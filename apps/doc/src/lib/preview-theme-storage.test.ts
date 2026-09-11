import { describe, expect, it, vi } from "vitest";
import vm from "node:vm";

import {
  documentThemeAttributes,
  parseStoredPreviewTheme,
  PREVIEW_THEME_COOKIE,
  PREVIEW_THEME_INLINE_SCRIPT,
} from "./preview-theme-storage.ts";
import type { StoredPreviewTheme } from "./preview-theme-storage.ts";

/**
 * The pre-paint script is shipped as a string, so it cannot be type-checked or
 * imported. These tests execute the exact string against a stub document and
 * hold it to the same mapping as `documentThemeAttributes` — the single source
 * the SSR markup and `DocumentThemeProvider`'s effect also follow. Since the
 * default family now depends on the resolved mode (a dark machine defaults to
 * elegant dark), even "no choice" is a write, not a no-op.
 */
type SystemPreference = "light" | "dark";

function matchMediaFor(prefers: SystemPreference) {
  return (query: string) => ({
    matches: prefers === "dark" && query === "(prefers-color-scheme: dark)",
  });
}

function runPrePaintScript(cookie: string, systemPrefers: SystemPreference = "light") {
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

  vm.runInNewContext(PREVIEW_THEME_INLINE_SCRIPT, {
    document: { cookie, documentElement },
    window: { matchMedia: matchMediaFor(systemPrefers) },
  });

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

function raw(value: unknown) {
  return encodeURIComponent(JSON.stringify(value));
}

const WRITTEN_CASES: ReadonlyArray<{
  name: string;
  cookie: string;
  stored: StoredPreviewTheme | null;
  systemPrefers?: SystemPreference;
}> = [
  {
    name: "explicit light",
    cookie: cookieFor({ mode: "light", light: "brutal", dark: "elegant" }),
    stored: { mode: "light", light: "brutal", dark: "elegant" },
  },
  {
    name: "explicit dark",
    cookie: cookieFor({ mode: "dark", light: "brutal", dark: "elegant" }),
    stored: { mode: "dark", light: "brutal", dark: "elegant" },
  },
  {
    name: "system on a light machine",
    cookie: cookieFor({ mode: "system", light: "elegant", dark: "elegant" }),
    stored: { mode: "system", light: "elegant", dark: "elegant" },
    systemPrefers: "light",
  },
  {
    name: "system on a dark machine picks the dark family",
    cookie: cookieFor({ mode: "system", light: "brutal", dark: "elegant" }),
    stored: { mode: "system", light: "brutal", dark: "elegant" },
    systemPrefers: "dark",
  },
  {
    name: "legacy single-family cookie",
    cookie: cookieFor({ theme: "elegant", mode: "dark" }),
    stored: { mode: "dark", light: "elegant", dark: "elegant" },
  },
  {
    name: "legacy brutal cookie on a dark machine",
    cookie: cookieFor({ theme: "brutal", mode: "system" }),
    stored: { mode: "system", light: "brutal", dark: "elegant" },
    systemPrefers: "dark",
  },
  {
    name: "no choice at all",
    cookie: "",
    stored: null,
    systemPrefers: "dark",
  },
  {
    name: "malformed cookie falls back to the defaults",
    cookie: `${PREVIEW_THEME_COOKIE}=%7Bnope`,
    stored: null,
    systemPrefers: "dark",
  },
  {
    name: "unknown mode falls back to the defaults",
    cookie: cookieFor({ theme: "elegant", mode: "sepia" }),
    stored: null,
    systemPrefers: "light",
  },
  {
    name: "cookie alongside others",
    cookie: `foo=1; ${cookieFor({ mode: "dark", light: "brutal", dark: "elegant" })}; bar=2`,
    stored: { mode: "dark", light: "brutal", dark: "elegant" },
  },
];

describe("pre-paint theme script", () => {
  for (const { name, cookie, stored, systemPrefers } of WRITTEN_CASES) {
    it(`writes exactly documentThemeAttributes(${name})`, () => {
      const stubbed = systemPrefers
        ? vi.stubGlobal("matchMedia", matchMediaFor(systemPrefers))
        : null;
      try {
        const expected = documentThemeAttributes(stored);
        const actual = runPrePaintScript(cookie, systemPrefers ?? "light");

        expect(actual).toEqual({
          theme: expected.theme,
          colorScheme: expected.colorScheme,
          light: expected.light,
          dark: expected.dark,
        });
      } finally {
        if (stubbed) vi.unstubAllGlobals();
      }
    });
  }

  it("reads a legacy single-family cookie as both modes", () => {
    expect(parseStoredPreviewTheme(raw({ theme: "brutal", mode: "light" }))).toEqual({
      mode: "light",
      light: "brutal",
      dark: "elegant",
    });
  });

  it("never lets brutal into the dark slot", () => {
    expect(
      parseStoredPreviewTheme(raw({ mode: "system", light: "brutal", dark: "brutal" })),
    ).toEqual({ mode: "system", light: "brutal", dark: "elegant" });
  });

  it("resolves the default family per mode", () => {
    expect(documentThemeAttributes(null)).toEqual({
      theme: "brutal",
      colorScheme: "light",
      light: false,
      dark: false,
    });

    vi.stubGlobal("matchMedia", matchMediaFor("dark"));
    try {
      expect(documentThemeAttributes(null)).toEqual({
        theme: "elegant",
        colorScheme: "dark",
        light: false,
        dark: true,
      });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
