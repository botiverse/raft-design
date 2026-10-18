import { raftUiChangelogMarkdown } from "#/data/raft-ui-release.ts";
import {
  API_INDEX,
  apiMarkdown,
  changesFor,
  changesMarkdown,
  loadComponentApi,
} from "#/lib/content/api.ts";
import { REPOSITORY_URL, SITE_ORIGIN } from "#/lib/content/links.ts";
import { componentGroup, componentPages, shortTitle } from "#/lib/content/nav.ts";
import { PAGES } from "#/lib/content/pages.ts";
import { renderMarkdownTwin } from "#/lib/content/twin.ts";

export type MarkdownPage = {
  /** URL path of the HTML page, e.g. `/components/button`. */
  path: string;
  title: string;
  markdown: string;
  /** One sentence for llms.txt. */
  summary: string;
  /** For components, the category llms.txt lists them under. */
  group?: string;
};

/**
 * Every page's Markdown twin, from its source: the guidelines and component
 * docs (with examples, tokens and, for components, the generated API and
 * changes inlined) and the changelog.
 */
export async function renderMarkdownPages(): Promise<MarkdownPage[]> {
  const pages: MarkdownPage[] = [];
  // Components in the nav's order (by category); build-llms.mjs then orders
  // the sections with a stable sort.
  const ordered = [...PAGES.filter((page) => page.section !== "components"), ...componentPages()];
  for (const page of ordered) {
    const appendix =
      page.section === "components"
        ? [apiMarkdown(await loadComponentApi(page.slug)), changesMarkdown(changesFor(page.slug))]
            .filter(Boolean)
            .join("\n\n")
        : "";
    pages.push({
      path: page.url,
      title: shortTitle(page),
      markdown: (await renderMarkdownTwin(page, appendix)).trim(),
      summary: page.frontMatter.summary,
      ...(page.section === "components" ? { group: componentGroup(page) } : {}),
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
    category: page.frontMatter.category ?? null,
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
