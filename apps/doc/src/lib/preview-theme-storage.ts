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
    if ((theme === "brutal" || theme === "elegant") && (mode === "light" || mode === "dark")) {
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

export const getStoredPreviewTheme = createServerFn({ method: "GET" }).handler(async () => {
  const { getCookie } = await import("@tanstack/react-start/server");
  return parseStoredPreviewTheme(getCookie(PREVIEW_THEME_COOKIE));
});
