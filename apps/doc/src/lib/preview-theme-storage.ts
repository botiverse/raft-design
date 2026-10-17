import { createServerFn } from "@tanstack/react-start";
import type { Theme, ThemeMode } from "raft-ui";

export const PREVIEW_THEME_COOKIE = "raft-docs-preview-theme";

/**
 * Defaults follow the product's appearance model: `system` by default, brutal
 * for light. Brutal only has a light form (foundation.css gives only `elegant`
 * the mode blocks), so its dark slot can never hold brutal.
 */
export const DEFAULT_PREVIEW_LIGHT: Theme = "brutal";
export const DEFAULT_PREVIEW_DARK: Theme = "elegant";

/**
 * What the visitor chose, per the product's model: a color mode plus a separate
 * appearance (family) for light and for dark, so `system` keeps both.
 */
export type StoredPreviewTheme = {
  mode: ThemeMode;
  light: Theme;
  dark: Theme;
};

function asFamily(value: unknown): Theme | null {
  return value === "brutal" || value === "elegant" || value === "raft" ? value : null;
}

function asMode(value: unknown): ThemeMode | null {
  return value === "light" || value === "dark" || value === "system" ? value : null;
}

/** Brutal has no dark form, so a dark slot of brutal reads back as elegant. */
function normalizeDark(theme: Theme): Theme {
  return theme === "brutal" ? "elegant" : theme;
}

export function parseStoredPreviewTheme(raw: string | null | undefined): StoredPreviewTheme | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return null;
    const { theme, mode, light, dark } = parsed as {
      theme?: unknown;
      mode?: unknown;
      light?: unknown;
      dark?: unknown;
    };
    const parsedMode = asMode(mode);
    if (!parsedMode) return null;

    const lightFamily = asFamily(light);
    const darkFamily = asFamily(dark);
    if (lightFamily && darkFamily) {
      return { mode: parsedMode, light: lightFamily, dark: normalizeDark(darkFamily) };
    }

    // Legacy shape: one family for both modes (`{ theme, mode }`).
    const legacyFamily = asFamily(theme);
    if (legacyFamily) {
      return {
        mode: parsedMode,
        light: legacyFamily,
        dark: normalizeDark(legacyFamily),
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function readPreviewThemeCookieFromDocument(): StoredPreviewTheme | null {
  const entry = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${PREVIEW_THEME_COOKIE}=`));
  return parseStoredPreviewTheme(entry ? entry.slice(PREVIEW_THEME_COOKIE.length + 1) : null);
}

export function writePreviewThemeCookie(value: StoredPreviewTheme) {
  document.cookie = `${PREVIEW_THEME_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=31536000; SameSite=Lax`;
}

export type DocumentThemeAttributes = {
  theme: Theme;
  colorScheme: "light" | "dark";
  light: boolean;
  dark: boolean;
};

/**
 * `system` resolves against the OS preference where a document exists (the
 * client); a server render has no `window` and falls back to light, which the
 * pre-paint script then corrects on the client.
 */
export function resolveThemeMode(mode: ThemeMode): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "light";
}

/** The family a resolved mode renders with — the per-mode choice, or the default. */
export function resolveThemeFamily(
  stored: StoredPreviewTheme | null,
  resolvedMode: "light" | "dark",
): Theme {
  const light = stored?.light ?? DEFAULT_PREVIEW_LIGHT;
  const dark = stored?.dark ?? DEFAULT_PREVIEW_DARK;
  const family = resolvedMode === "dark" ? normalizeDark(dark) : light;
  return family;
}

/**
 * The document-level writes a stored choice implies. One mapping, three
 * writers: the SSR `<html>` markup, the pre-paint inline script below, and
 * `DocumentThemeProvider`'s `syncDom` effect (which writes these same three
 * things once it mounts).
 *
 * With no stored choice the defaults still apply — and they are mode-dependent
 * now (a dark machine defaults to elegant dark), which is why the pre-paint
 * script writes them instead of leaving the brutal markup untouched.
 */
export function documentThemeAttributes(
  stored: StoredPreviewTheme | null,
): DocumentThemeAttributes {
  const mode = resolveThemeMode(stored?.mode ?? "system");
  const theme = resolveThemeFamily(stored, mode);
  // Brutal is light-only; the families with modes (elegant, raft) take the
  // mode class and color scheme.
  const modal = theme !== "brutal";
  return {
    theme,
    colorScheme: modal ? mode : "light",
    light: modal && mode === "light",
    dark: modal && mode === "dark",
  };
}

/**
 * Pre-paint writer for `<html>`.
 *
 * Doc routes are prerendered and cache-served, so the shipped markup always
 * says `data-theme="brutal"` and the stored choice can only land on the
 * client — measured at ~125ms of wrong theme before hydration catches up,
 * visible as a flash for any non-brutal choice. This runs during head parsing,
 * before the first paint, and resolves the same defaults as
 * `documentThemeAttributes` (including the mode-dependent default family).
 *
 * It must mirror `documentThemeAttributes`; `preview-theme-storage.test.ts`
 * executes this exact string against a stub document and asserts it produces
 * the same writes for the same cookies.
 */
export const PREVIEW_THEME_INLINE_SCRIPT = `(function(){try{var isFamily=function(v){return v==="brutal"||v==="elegant"||v==="raft"};var parsed={};var m=document.cookie.match(/(?:^|;\\s*)${PREVIEW_THEME_COOKIE}=([^;]+)/);if(m){try{parsed=JSON.parse(decodeURIComponent(m[1]))||{}}catch(error){parsed={}}}if(typeof parsed!=="object"||parsed===null)parsed={};var mode=parsed.mode;if(mode!==undefined&&mode!=="light"&&mode!=="dark"&&mode!=="system"){parsed={};mode=undefined}var storedLight=isFamily(parsed.light)?parsed.light:(isFamily(parsed.theme)?parsed.theme:"brutal");var storedDark=isFamily(parsed.dark)?parsed.dark:(isFamily(parsed.theme)?parsed.theme:"elegant");if(storedDark==="brutal")storedDark="elegant";if(mode===undefined||mode==="system"){mode=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var family=mode==="dark"?storedDark:storedLight;var root=document.documentElement;root.dataset.theme=family;var modal=family!=="brutal";root.classList.toggle("light",modal&&mode==="light");root.classList.toggle("dark",modal&&mode==="dark");root.style.colorScheme=modal?mode:"light"}catch(error){}})();`;

export const getStoredPreviewTheme = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return parseStoredPreviewTheme(getCookie(PREVIEW_THEME_COOKIE));
});
