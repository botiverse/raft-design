import { notFound } from "@tanstack/react-router";

import { pageAt } from "#/lib/content/pages.ts";

/** Loader for a page route: the page's URL, or a 404 when no Markdown file backs it. */
export function loadDocPage(url: string) {
  const page = pageAt(url);
  if (!page) throw notFound();
  return { url: page.url };
}

/** `head` for a page route: description and the Markdown twin as an alternate. */
export function docPageHead(url: string | undefined) {
  const page = url ? pageAt(url) : undefined;
  if (!page) return {};
  return {
    meta: [{ name: "description", content: page.frontMatter.summary }],
    links: [{ rel: "alternate", type: "text/markdown", href: `${page.url}.md` }],
  };
}
