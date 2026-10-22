import { createContext, useContext } from "react";

import { DEFAULT_LOCALE } from "./locales.ts";
import type { Locale } from "./locales.ts";
import { messagesFor } from "./messages.ts";

/**
 * The language of the document, set once by the root route from its URL
 * (lib/i18n/locales.ts). English outside it, as in a test that renders one
 * part on its own.
 */
export const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

/** The language of the page being shown. */
export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** The site's own words (menus, labels, notices) in the page's language. */
export function useMessages() {
  return messagesFor(useLocale());
}
