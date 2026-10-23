// The site's languages. English is the source and keeps the unprefixed URLs
// that are already linked from everywhere; every other language lives under
// its own prefix (`/zh/foundations/color`). The router never sees the prefix:
// `router.tsx` strips it on the way in and adds it back to every link it
// builds, so routes, loaders and `useLocation().pathname` work with the
// English path in every language (i18n/README.md).

export const LOCALES = ["en", "zh"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** `lang` and `hreflang` for each language. */
export const LANGUAGE_TAG: Record<Locale, string> = { en: "en", zh: "zh-Hans" };

/** The name of each language, written in that language: the switcher's labels. */
export const LANGUAGE_NAME: Record<Locale, string> = { en: "English", zh: "简体中文" };

const PREFIXED = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
const PREFIX = new RegExp(`^/(${PREFIXED.join("|")})(?=/|$|[?#])`);

/** The language a public path is in: `/zh/foundations` → `zh`, `/foundations` → `en`. */
export function localeOfPath(path: string): Locale {
  return (path.match(PREFIX)?.[1] as Locale | undefined) ?? DEFAULT_LOCALE;
}

/** A public path without its language prefix: `/zh/foundations` → `/foundations`, `/zh` → `/`. */
export function stripLocale(path: string): string {
  const stripped = path.replace(PREFIX, "");
  return stripped === "" || /^[?#]/.test(stripped) ? `/${stripped}` : stripped;
}

/**
 * A site path in `locale`: `/foundations/color` → `/zh/foundations/color`.
 * Anything that is not a site path (a URL, a fragment) comes back unchanged.
 */
export function localizePath(path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE || !path.startsWith("/") || path.startsWith("//")) return path;
  if (localeOfPath(path) === locale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
