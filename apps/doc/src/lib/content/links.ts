import { DEFAULT_LOCALE, localizePath } from "../i18n/locales.ts";
import type { Locale } from "../i18n/locales.ts";
import { isTranslated, pageAt, pageForFile, SECTIONS } from "./pages.ts";

export const SITE_ORIGIN = "https://raft-design.botiverse.build";
export const REPOSITORY_URL = "https://github.com/botiverse/raft-design";

/** Resolves `../a/b.md` against the folder of `from`, both repository paths. */
function resolvePath(from: string, target: string) {
  const parts = from.split("/").slice(0, -1);
  for (const part of target.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return parts.join("/");
}

/** Every section folder, also the ones not written yet, and what it links to. */
const SECTION_FOLDERS = new Map<string, string>([
  ...SECTIONS.map((section) => [`design/${section.id}`, `/${section.id}`] as const),
  ["packages/ui/src/components", "/components"],
  ["design", "/"],
]);

/** Site paths that are a section's own page or the home page, not a page in a section. */
export const SECTION_PATHS: ReadonlySet<string> = new Set(SECTION_FOLDERS.values());

/**
 * Where a link in a doc goes on the site. The docs link with relative paths to
 * Markdown files (so they work on GitHub); the site turns a link to another
 * page into that page's URL, a link to a section folder into the section, and
 * a link to any other repository file into its GitHub URL.
 */
export function resolveDocLink(fromRepoPath: string, href: string): string {
  if (/^([a-z][a-z\d+.-]*:|#|\/\/)/i.test(href) || href.startsWith("/")) return href;
  const [pathPart, hash] = href.split("#", 2) as [string, string | undefined];
  const anchor = hash ? `#${hash}` : "";
  const target = resolvePath(fromRepoPath, pathPart);
  const page = pageForFile(target);
  if (page) return `${page.url}${anchor}`;
  const folder = SECTION_FOLDERS.get(target.replace(/\/+$/, ""));
  if (folder) return `${folder}${anchor}`;
  if (target === "design/README.md") return `/${anchor}`;
  const kind = pathPart.endsWith("/") ? "tree" : "blob";
  return `${REPOSITORY_URL}/${kind}/main/${target}${anchor}`;
}

/** The same link for a Markdown reader: an absolute URL, to the `.md` twin when it is a page. */
export function resolveDocLinkForMarkdown(
  fromRepoPath: string,
  href: string,
  locale: Locale = DEFAULT_LOCALE,
): string {
  const resolved = resolveDocLink(fromRepoPath, href);
  if (!resolved.startsWith("/")) return resolved;
  const [path, hash] = resolved.split("#", 2) as [string, string | undefined];
  const anchor = hash ? `#${hash}` : "";
  // A page, a section's introduction included, has a twin; a section without
  // one does not. In another language a page not translated yet links to its
  // English twin.
  const page = path === "/" ? undefined : pageAt(path);
  if (!page) return `${SITE_ORIGIN}${localizePath(path, locale)}${anchor}`;
  const shown = isTranslated(page.repoPath, locale) ? localizePath(path, locale) : path;
  return `${SITE_ORIGIN}${shown}.md${anchor}`;
}
