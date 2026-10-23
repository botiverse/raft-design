import { DEFAULT_LOCALE } from "../i18n/locales.ts";
import type { Locale } from "../i18n/locales.ts";
import { messagesFor } from "../i18n/messages.ts";
import { localize, PAGES } from "./pages.ts";
import type { DocPage } from "./pages.ts";

export type SearchHit = {
  page: DocPage;
  /** The other name that matched, for "Also called …". */
  alias?: string;
  /** The heading that matched, when the hit is a section of the page. */
  heading?: { id: string; title: string };
};

export function sectionTitle(page: DocPage, locale: Locale = DEFAULT_LOCALE) {
  return messagesFor(locale).sections[page.section].title;
}

/**
 * Ranks title matches first, then aliases (former design names and the names
 * other systems use: Sheet, Snackbar, Modal), then headings, then summaries.
 */
export function searchDocs(
  query: string,
  limit = 12,
  locale: Locale = DEFAULT_LOCALE,
): SearchHit[] {
  return searchIn(localizedPages(locale), query, limit);
}

const byLocale = new Map<Locale, readonly DocPage[]>();

/**
 * The pages as shown in `locale`, a translated page also answering to its
 * English title: someone reading in Chinese can still search for "sheet".
 */
function localizedPages(locale: Locale) {
  if (locale === DEFAULT_LOCALE) return PAGES;
  let pages = byLocale.get(locale);
  if (!pages) {
    pages = PAGES.map((page) => {
      const shown = localize(page, locale);
      if (!shown.englishTitle || shown.englishTitle === shown.frontMatter.title) return shown;
      const aliases = [...(shown.frontMatter.aliases ?? []), shown.englishTitle];
      return { ...shown, frontMatter: { ...shown.frontMatter, aliases } };
    });
    byLocale.set(locale, pages);
  }
  return pages;
}

export function searchIn(pages: readonly DocPage[], query: string, limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored: { hit: SearchHit; score: number }[] = [];
  for (const page of pages) {
    const title = page.frontMatter.title.toLowerCase();
    const alias = page.frontMatter.aliases?.find((name) => name.toLowerCase().includes(q));
    let score = 0;
    let hit: SearchHit = { page };
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 80;
    else if (alias) {
      score = alias.toLowerCase() === q ? 75 : 55;
      hit = { page, alias };
    } else if (title.includes(q)) score = 60;
    if (score > 0) scored.push({ hit, score });

    for (const heading of page.headings) {
      if (heading.title.toLowerCase().includes(q)) {
        scored.push({ hit: { page, heading }, score: heading.title.toLowerCase() === q ? 45 : 30 });
      }
    }
    if (score === 0 && page.frontMatter.summary.toLowerCase().includes(q)) {
      scored.push({ hit: { page }, score: 20 });
    }
  }
  return scored
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.hit.page.frontMatter.title.localeCompare(b.hit.page.frontMatter.title),
    )
    .slice(0, limit)
    .map(({ hit }) => hit);
}
