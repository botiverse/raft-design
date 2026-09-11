import { createServerFn } from "@tanstack/react-start";
import type { Theme, ThemeMode } from "raft-ui";

export const PREVIEW_THEME_COOKIE = "raft-docs-preview-theme";

export type StoredPreviewTheme = { theme: Theme; mode: ThemeMode };

export function parseStoredPreviewTheme(raw: string | null | undefined): StoredPreviewTheme | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return null;
    const { theme, mode } = parsed as { theme?: unknown; mode?: unknown };
    if (
      (theme === "brutal" || theme === "elegant") &&
      (mode === "light" || mode === "dark" || mode === "system")
    ) {
      return { theme, mode };
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

/**
 * The document-level writes a stored choice implies. One mapping, three
 * writers: the SSR `<html>` markup, the pre-paint inline script below, and
 * `DocumentThemeProvider`'s `syncDom` effect (which writes these same three
 * things once it mounts).
 */
export function documentThemeAttributes(
  stored: StoredPreviewTheme | null,
): DocumentThemeAttributes {
  const theme = stored?.theme ?? "brutal";
  const mode = resolveThemeMode(stored?.mode ?? "system");
  return {
    theme,
    colorScheme: theme === "elegant" ? mode : "light",
    light: theme === "elegant" && mode === "light",
    dark: theme === "elegant" && mode === "dark",
  };
}

/**
 * Pre-paint writer for `<html>`.
 *
 * Doc routes are prerendered and cache-served, so the shipped markup always
 * says `data-theme="brutal"` and the stored choice can only land on the
 * client — measured at ~125ms of wrong theme before hydration catches up,
 * visible as a flash for any non-brutal choice. This runs during head parsing,
 * before the first paint.
 *
 * It must mirror `documentThemeAttributes`; `preview-theme-storage.test.ts`
 * executes this exact string against a stub document and asserts it produces
 * the same writes for the same cookies.
 */
export const PREVIEW_THEME_INLINE_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${PREVIEW_THEME_COOKIE}=([^;]+)/);if(!m)return;var parsed=JSON.parse(decodeURIComponent(m[1]));var theme=parsed&&parsed.theme,mode=parsed&&parsed.mode;if((theme!=="brutal"&&theme!=="elegant")||(mode!=="light"&&mode!=="dark"&&mode!=="system"))return;if(mode==="system"){mode=typeof window!=="undefined"&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var root=document.documentElement;root.dataset.theme=theme;root.classList.toggle("light",theme==="elegant"&&mode==="light");root.classList.toggle("dark",theme==="elegant"&&mode==="dark");root.style.colorScheme=theme==="elegant"?mode:"light"}catch(error){}})();`;

export const getStoredPreviewTheme = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return parseStoredPreviewTheme(getCookie(PREVIEW_THEME_COOKIE));
});
