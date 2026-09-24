import { RouterProvider, createMemoryHistory } from "@tanstack/react-router";
import { renderToMarkdownString } from "react-render-to-markdown";

import { beginMarkdownPage, setMarkdownMode } from "#/lib/markdown-mode.ts";
import { guides } from "#/modules/guides/guides.ts";
import { getRouter } from "#/router.tsx";

export type MarkdownPage = {
  /** URL path of the HTML page, e.g. `/components/button`. */
  path: string;
  title: string;
  markdown: string;
};

/** Route prefixes that are documentation. Playground, lab and iframe fixtures are app demos. */
const DOC_PREFIXES = ["/components/", "/tokens/"];

function listDocPaths() {
  const router = getRouter();
  return Object.keys(router.routesByPath)
    .filter((path) => DOC_PREFIXES.some((prefix) => path.startsWith(prefix)))
    .filter((path) => !path.includes("$"))
    .sort();
}

async function renderRoute(path: string) {
  const router = getRouter();
  router.update({
    ...router.options,
    history: createMemoryHistory({ initialEntries: [path] }),
  });
  // The root loader reads the theme cookie through a server function, which has
  // no request context outside the Start server. Markdown has no theme.
  (router.routeTree as { options: { loader?: unknown } }).options.loader = () => ({
    storedPreviewTheme: undefined,
  });
  await router.load();
  return renderToMarkdownString(<RouterProvider router={router} />);
}

function titleOf(markdown: string, fallback: string) {
  return markdown.match(/^# (.+)$/m)?.[1]?.trim() ?? fallback;
}

export async function renderMarkdownPages(): Promise<MarkdownPage[]> {
  const pages: MarkdownPage[] = [];

  setMarkdownMode(true);
  try {
    for (const path of listDocPaths()) {
      beginMarkdownPage();
      const markdown = (await renderRoute(path)).trim();
      // Layout routes such as `/tokens/shadows` only redirect to a child.
      if (!markdown) continue;
      pages.push({ path, title: titleOf(markdown, path), markdown });
    }
  } finally {
    setMarkdownMode(false);
  }

  // Guides are authored in Markdown already; serve the source, not a round trip.
  for (const guide of Object.values(guides)) {
    pages.push({
      path: `/guides/${guide.slug}`,
      title: guide.title,
      markdown: `# ${guide.title}\n\n${guide.body}`.trim(),
    });
  }

  return pages;
}
