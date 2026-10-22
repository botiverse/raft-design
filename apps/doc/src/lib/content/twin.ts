import { loadExampleSource } from "#/lib/examples.ts";
import { tokenGroup } from "#/lib/tokens/tokens.ts";

import { DEFAULT_LOCALE, localizePath } from "../i18n/locales.ts";
import type { Locale } from "../i18n/locales.ts";
import { resolveDocLinkForMarkdown, SITE_ORIGIN } from "./links.ts";
import type { DocPage } from "./pages.ts";

const BLOCK = /```(example|tokens)[ \t]*\r?\n([^\n]+)\r?\n```/g;

function tokensTable(group: string) {
  const rows = tokenGroup(group.trim());
  if (!rows) return `<!-- Unknown token group: ${group} -->`;
  const cell = (value: { display: string; reference?: string }) =>
    `\`${value.display}\`${value.reference ? ` (\`${value.reference}\`)` : ""}`;
  if (rows.some((row) => row.desktop)) {
    return [
      "| Token | Light | Dark | Desktop |",
      "| --- | --- | --- | --- |",
      ...rows.map(
        (row) =>
          `| \`${row.name}\` | ${cell(row.light)} | ${cell(row.dark)} | ${row.desktop ? cell(row.desktop) : ""} |`,
      ),
    ].join("\n");
  }
  return [
    "| Token | Light | Dark |",
    "| --- | --- | --- |",
    ...rows.map((row) => `| \`${row.name}\` | ${cell(row.light)} | ${cell(row.dark)} |`),
  ].join("\n");
}

/** Rewrites relative links outside code to absolute URLs, `.md` twins for pages. */
function rewriteLinks(markdown: string, repoPath: string, locale: Locale) {
  return markdown
    .split(/(```[\s\S]*?```)/g)
    .map((part, index) =>
      index % 2 === 1
        ? part
        : part.replace(
            /\]\(([^)\s]+)\)/g,
            (_, href: string) => `](${resolveDocLinkForMarkdown(repoPath, href, locale)})`,
          ),
    )
    .join("");
}

/**
 * A page as an agent reads it, served at the page's path plus `.md`: the
 * summary under the title, `example` blocks replaced by the composition's
 * source, `tokens` blocks by tables with both modes' values, links made
 * absolute. `appendix` carries what is generated from code, such as a
 * component's API.
 */
export async function renderMarkdownTwin(page: DocPage, appendix = "") {
  const locale = page.translation && page.translation !== "missing" ? page.locale! : DEFAULT_LOCALE;
  // A translation's headings carry the English anchors (`## 颜色 {#color}`);
  // a Markdown reader gets the heading alone.
  let body =
    locale === DEFAULT_LOCALE
      ? page.body
      : page.body.replace(/^(#{2,6} .*?)\s*\{#[\w-]+\}\s*$/gm, "$1");
  for (const [block, kind, argument] of body.matchAll(BLOCK)) {
    const replacement =
      kind === "tokens"
        ? tokensTable(argument!)
        : `\`\`\`tsx\n${(await loadExampleSource(argument!.trim())) ?? `// Missing example: ${argument}`}\n\`\`\``;
    body = body.replace(block, replacement);
  }
  const header = [
    `# ${page.frontMatter.title}`,
    "",
    `> ${page.frontMatter.summary}`,
    "",
    locale === DEFAULT_LOCALE
      ? `Source: ${SITE_ORIGIN}${page.url}. Generated from the current release; where it differs from what you remember, this page is right.`
      : `Source: ${SITE_ORIGIN}${localizePath(page.url, locale)}. Translated from ${SITE_ORIGIN}${page.url}.md; where the two differ, the English page is right.`,
  ].join("\n");
  return `${header}\n\n${rewriteLinks(body, page.repoPath, locale).trim()}${appendix ? `\n\n${appendix.trim()}` : ""}\n`;
}
