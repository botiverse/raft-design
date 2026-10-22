import { raftUiChangelogMarkdown } from "#/data/raft-ui-release.ts";
import {
  API_INDEX,
  apiMarkdown,
  changesFor,
  changesMarkdown,
  loadComponentApi,
} from "#/lib/content/api.ts";
import { REPOSITORY_URL, SITE_ORIGIN } from "#/lib/content/links.ts";
import {
  componentGroup,
  componentGroupPath,
  componentPages,
  layerOf,
  shortTitle,
} from "#/lib/content/nav.ts";
import {
  isTranslated,
  loadTranslations,
  localize,
  PAGES,
  SECTIONS,
  sectionIntro,
} from "#/lib/content/pages.ts";
import type { DocPage } from "#/lib/content/pages.ts";
import { DEFAULT_LOCALE, LOCALES, localizePath } from "#/lib/i18n/locales.ts";
import { renderMarkdownTwin } from "#/lib/content/twin.ts";

/** What a component page adds from code to its twin: the API and the changes. */
async function appendixOf(page: DocPage) {
  if (page.section !== "components" || page.intro) return "";
  return [apiMarkdown(await loadComponentApi(page.slug)), changesMarkdown(changesFor(page.slug))]
    .filter(Boolean)
    .join("\n\n");
}

export type MarkdownPage = {
  /** URL path of the HTML page, e.g. `/components/button`. */
  path: string;
  title: string;
  markdown: string;
  /** One sentence for llms.txt. */
  summary: string;
  /** For components, the layer and category llms.txt lists them under: `Core · Actions`. */
  group?: string;
};

/**
 * The `##` sections of llms.txt and the order of llms-full.txt: the site's
 * sections in reading order (decision records follow About, which lists
 * them), then the changelog. `path` is the section's own page; its pages are
 * under `path/`.
 */
export function llmsSections(): { heading: string; path: string }[] {
  return [
    ...SECTIONS.map((section) => ({ heading: section.title, path: `/${section.id}` })),
    { heading: "Changelog", path: "/changelog" },
  ];
}

/**
 * Every page's Markdown twin, from its source: the guidelines and component
 * docs (with examples, tokens and, for components, the generated API and
 * changes inlined) and the changelog.
 */
export async function renderMarkdownPages(): Promise<MarkdownPage[]> {
  const pages: MarkdownPage[] = [];
  // Components in the nav's order (by layer and category), deprecated ones
  // included; build-llms.mjs then orders the sections with a stable sort.
  const componentsIntro = sectionIntro("components");
  const ordered = [
    ...PAGES.filter((page) => page.section !== "components"),
    ...(componentsIntro ? [componentsIntro] : []),
    ...componentPages(),
  ];
  for (const page of ordered) {
    const isComponent = page.section === "components" && !page.intro;
    const appendix = await appendixOf(page);
    pages.push({
      path: page.url,
      title: shortTitle(page),
      markdown: (await renderMarkdownTwin(page, appendix)).trim(),
      summary: page.frontMatter.summary,
      ...(isComponent ? { group: componentGroupPath(page) } : {}),
    });
  }
  pages.push({
    path: "/changelog",
    title: "Changelog",
    markdown: raftUiChangelogMarkdown.trim(),
    summary: "What changed in each release of raft-ui, newest first.",
  });
  return pages;
}

/**
 * /components.json: every component, for agents and tools that pick one by
 * name or alias. The same front matter drives the site's nav and search.
 */
export function renderComponentIndex() {
  return componentPages().map((page) => ({
    name: page.frontMatter.title,
    slug: page.slug,
    layer: layerOf(page) ?? null,
    category: page.frontMatter.category ?? null,
    group: componentGroup(page),
    status: page.frontMatter.status ?? "stable",
    aliases: page.frontMatter.aliases ?? [],
    summary: page.frontMatter.summary,
    documented: !page.generated,
    exports: API_INDEX[page.slug]?.names ?? [],
    import: `raft-ui${page.frontMatter.status === "experimental" ? "/wip" : ""}`,
    docs: `${SITE_ORIGIN}${page.url}`,
    markdown: `${SITE_ORIGIN}${page.url}.md`,
    source: `${REPOSITORY_URL}/tree/main/packages/ui/src/components/${page.slug}`,
    related: page.frontMatter.related ?? [],
    ...(page.frontMatter.replacedBy ? { replacedBy: page.frontMatter.replacedBy } : {}),
  }));
}

/**
 * The `.md` twin of every translated page, at its translated path
 * (`/zh/foundations/color.md`). llms.txt and llms-full.txt stay English; an
 * untranslated page has only its English twin.
 */
export async function renderTranslatedMarkdownPages(): Promise<
  { path: string; markdown: string }[]
> {
  const pages: { path: string; markdown: string }[] = [];
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    await loadTranslations(locale);
    for (const page of PAGES) {
      if (!isTranslated(page.repoPath, locale)) continue;
      pages.push({
        path: localizePath(page.url, locale),
        markdown: (await renderMarkdownTwin(localize(page, locale), await appendixOf(page))).trim(),
      });
    }
  }
  return pages;
}
