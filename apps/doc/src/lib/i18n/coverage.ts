import { isTranslated, pageAt, pagesIn, README, SECTIONS, sectionIntro } from "../content/pages.ts";
import { DEFAULT_LOCALE } from "./locales.ts";
import type { Locale } from "./locales.ts";

/**
 * Whether the page at a site path reads in `locale`: a page whose translation
 * exists, the home page when design/README.md is translated, a section's own
 * page when its introduction is translated (or, without one, when all its
 * pages are). Every other path in another language shows English text, so it
 * is left out of `hreflang` and the sitemap and marked `noindex`.
 */
export function isTranslatedPath(pathname: string, locale: Locale): boolean {
  if (locale === DEFAULT_LOCALE) return true;
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return README ? isTranslated(README.repoPath, locale) : false;
  const section = SECTIONS.find((item) => `/${item.id}` === path);
  if (section) {
    const intro = sectionIntro(section.id);
    if (intro) return isTranslated(intro.repoPath, locale);
    const pages = pagesIn(section.id);
    return pages.length > 0 && pages.every((page) => isTranslated(page.repoPath, locale));
  }
  const page = pageAt(path);
  return page ? !page.generated && isTranslated(page.repoPath, locale) : false;
}
