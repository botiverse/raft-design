import { useLocation } from "@tanstack/react-router";

import { localeOfPath } from "./locales.ts";
import type { Locale } from "./locales.ts";
import { messagesFor } from "./messages.ts";

/** The language of the page being shown, from its public URL. */
export function useLocale(): Locale {
  return useLocation({ select: (location) => localeOfPath(location.publicHref) });
}

/** The site's own words (menus, labels, notices) in the page's language. */
export function useMessages() {
  return messagesFor(useLocale());
}
