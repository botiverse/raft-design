import type { ResolvedThemeMode, Theme, ThemeMode } from "./theme-context";

export const THEME_PRESETS = ["brutal", "elegant-light", "elegant-dark", "elegant-system"] as const;

/** A product-facing selection that owns both the visual family and color mode. */
export type ThemePreset = (typeof THEME_PRESETS)[number];

export type ResolvedThemePreset = {
  theme: Theme;
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
};

export type ThemeRoot = Pick<HTMLElement, "classList" | "dataset" | "style">;

type FixedThemeBootstrapStorage = {
  /** Synchronous storage entry containing one of the four `ThemePreset` values. */
  storageKey: string;
  account?: never;
  storageKeyPrefix?: never;
};

type AccountScopedThemeBootstrapStorage = {
  storageKey?: never;
  /** Prefix joined with the active access JWT `sub` to form the preset storage key. */
  storageKeyPrefix: string;
  account: {
    kind: "jwt-sub";
    /** Storage entry containing the active account's `type: "access"` JWT. */
    tokenStorageKey: string;
  };
};

export type ThemeBootstrapScriptOptions = (
  | FixedThemeBootstrapStorage
  | AccountScopedThemeBootstrapStorage
) & {
  /** Used when storage is missing, invalid, or inaccessible. Defaults to Brutal. */
  defaultPreset?: ThemePreset;
};

export function isThemePreset(value: unknown): value is ThemePreset {
  return (
    value === "brutal" ||
    value === "elegant-light" ||
    value === "elegant-dark" ||
    value === "elegant-system"
  );
}

/** Map the single product-facing preset onto RUI's existing family and mode axes. */
export function resolveThemePreset(
  preset: ThemePreset,
  systemMode: ResolvedThemeMode = "light",
): ResolvedThemePreset {
  switch (preset) {
    case "brutal":
      return { theme: "brutal", mode: "light", resolvedMode: "light" };
    case "elegant-light":
      return { theme: "elegant", mode: "light", resolvedMode: "light" };
    case "elegant-dark":
      return { theme: "elegant", mode: "dark", resolvedMode: "dark" };
    case "elegant-system":
      return { theme: "elegant", mode: "system", resolvedMode: systemMode };
  }
}

/** Apply the same root attributes/classes used by `ThemeProvider`. */
export function applyThemeToRoot(
  root: ThemeRoot,
  { theme, resolvedMode }: Pick<ResolvedThemePreset, "theme" | "resolvedMode">,
) {
  root.dataset.theme = theme;
  root.classList.toggle("light", theme === "elegant" && resolvedMode === "light");
  root.classList.toggle("dark", theme === "elegant" && resolvedMode === "dark");
  root.style.colorScheme = theme === "elegant" ? resolvedMode : "light";
}

export function applyThemePresetToRoot(
  root: ThemeRoot,
  preset: ThemePreset,
  systemMode: ResolvedThemeMode = "light",
) {
  const resolved = resolveThemePreset(preset, systemMode);
  applyThemeToRoot(root, resolved);
  return resolved;
}

function serializeInlineScriptValue(value: unknown) {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}

/**
 * Create a dependency-free classic script for `<head>`, before app JavaScript
 * and styles paint. The consumer owns the storage key and writes the effective
 * account/gate-aware preset into it; invalid or inaccessible storage falls back
 * deterministically.
 */
export function createThemeBootstrapScript(options: ThemeBootstrapScriptOptions) {
  const config = serializeInlineScriptValue({ defaultPreset: "brutal", ...options });

  return `(()=>{const c=${config};let p=c.defaultPreset,k=c.storageKey;try{if(c.account){const t=localStorage.getItem(c.account.tokenStorageKey),b=t&&t.split(".")[1];if(b){const n=b.replace(/-/g,"+").replace(/_/g,"/"),j=JSON.parse(atob(n+"=".repeat((4-n.length%4)%4)));if(j.type==="access"&&typeof j.sub==="string"&&j.sub)k=c.storageKeyPrefix+j.sub}}if(k){const s=localStorage.getItem(k);if(s==="brutal"||s==="elegant-light"||s==="elegant-dark"||s==="elegant-system")p=s}}catch{}let m="light";if(p==="elegant-dark")m="dark";else if(p==="elegant-system")try{m=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{}const e=p!=="brutal",r=document.documentElement;r.dataset.theme=e?"elegant":"brutal";r.classList.toggle("light",e&&m==="light");r.classList.toggle("dark",e&&m==="dark");r.style.colorScheme=e?m:"light"})()`;
}
