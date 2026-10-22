import { notFound } from "@tanstack/react-router";

import { localize, pageAt } from "#/lib/content/pages.ts";
import { localeOfMatches } from "#/lib/i18n/head.ts";
import { DEFAULT_LOCALE, localizePath } from "#/lib/i18n/locales.ts";

/** Loader for a page route: the page's URL, or a 404 when no Markdown file backs it. */
export function loadDocPage(url: string) {
  const page = pageAt(url);
  if (!page) throw notFound();
  return { url: page.url };
}

/**
 * `head` for a page route: description in the page's language, and the
 * Markdown twin as an alternate (in another language, only a translated page
 * has its own).
 */
export function docPageHead(
  url: string | undefined,
  matches: readonly { loaderData?: unknown }[] = [],
) {
  const english = url ? pageAt(url) : undefined;
  if (!english) return {};
  const locale = localeOfMatches(matches);
  const page = localize(english, locale);
  const translated = locale !== DEFAULT_LOCALE && page.translation !== "missing";
  return {
    meta: [{ name: "description", content: page.frontMatter.summary }],
    links: [
      {
        rel: "alternate",
        type: "text/markdown",
        href: `${translated ? localizePath(page.url, locale) : page.url}.md`,
      },
    ],
  };
}
