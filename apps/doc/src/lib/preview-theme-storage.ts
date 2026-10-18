import { createServerFn } from "@tanstack/react-start";
import type { ThemeMode } from "@botiverse/raft-ui";

export const PREVIEW_THEME_COOKIE = "raft-docs-preview-theme";

/** What the visitor chose: a color mode, `system` by default. */
export type StoredPreviewTheme = {
  mode: ThemeMode;
};

function asMode(value: unknown): ThemeMode | null {
  return value === "light" || value === "dark" || value === "system" ? value : null;
}

export function parseStoredPreviewTheme(raw: string | null | undefined): StoredPreviewTheme | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (typeof parsed !== "object" || parsed === null) return null;
    const mode = asMode((parsed as { mode?: unknown }).mode);
    return mode ? { mode } : null;
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
 * The mode a stored choice puts on `<html>`. One mapping, three writers: the
 * SSR `<html>` markup, the pre-paint inline script below, and
 * `DocumentThemeProvider`'s `syncDom` effect.
 */
export function documentThemeMode(stored: StoredPreviewTheme | null): "light" | "dark" {
  return resolveThemeMode(stored?.mode ?? "system");
}

/**
 * Pre-paint writer for `<html>`.
 *
 * Doc routes are prerendered and cache-served, so the shipped markup always
 * says light and the stored choice can only land on the client — measured at
 * ~125ms of the wrong mode before hydration catches up, visible as a flash.
 * This runs during head parsing, before the first paint, and resolves the same
 * default as `documentThemeMode`. Keep the two in step.
 */
export const PREVIEW_THEME_INLINE_SCRIPT = `(function(){try{var mode;var m=document.cookie.match(/(?:^|;\\s*)${PREVIEW_THEME_COOKIE}=([^;]+)/);if(m){try{var parsed=JSON.parse(decodeURIComponent(m[1]));mode=parsed&&parsed.mode}catch(error){}}if(mode!=="light"&&mode!=="dark"){mode=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}var root=document.documentElement;root.classList.toggle("light",mode==="light");root.classList.toggle("dark",mode==="dark");root.style.colorScheme=mode}catch(error){}})();`;

export const getStoredPreviewTheme = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return parseStoredPreviewTheme(getCookie(PREVIEW_THEME_COOKIE));
});
