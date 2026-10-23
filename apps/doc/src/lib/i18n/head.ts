import { DEFAULT_LOCALE } from "./locales.ts";
import type { Locale } from "./locales.ts";

/**
 * The page's language in a route's `head`, which runs outside React: the
 * root route's loader reads it from the URL.
 */
export function localeOfMatches(matches: readonly { loaderData?: unknown }[]): Locale {
  const root = matches[0]?.loaderData as { locale?: Locale } | undefined;
  return root?.locale ?? DEFAULT_LOCALE;
}
