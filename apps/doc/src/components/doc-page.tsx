import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Text } from "raft-ui";
import { isMarkdownMode } from "#/lib/markdown-mode.ts";
import { markdownPathFor } from "#/lib/markdown-pages.ts";
import { DocPageActions } from "./doc-page-actions.tsx";
import { Toc } from "./toc.tsx";
import type { TocItem } from "./toc.tsx";

export { GithubMark } from "./github-mark.tsx";

const DOCS_SOURCE_URL = "https://github.com/botiverse/rui/blob/main";
const COMPONENT_SOURCE_URL =
  "https://github.com/botiverse/rui/tree/main/packages/ui/src/components";

/**
 * Docs slugs whose package directory name differs from the route slug, or null
 * for pages that document docs-local modules instead of a package component.
 */
const COMPONENT_DIRECTORIES: Record<string, string | null> = {
  activity: "activity-inbox",
  "chat-composer": "composer",
  "composer-suggestions": "composer",
  "message-reference": "message-embed",
  search: "search",
  "sidebar-item": "sidebar",
  "task-chip": "task-card",
  icons: null,
};

const DOC_SOURCE_FILES: Record<string, string> = {
  "/changelog": "routes/changelog.tsx",
  "/tokens/colors": "routes/tokens/colors.tsx",
  "/tokens/typography": "routes/tokens/typography.tsx",
  "/tokens/shadows": "routes/tokens/shadows.tsx",
};

function resolveSourceHref(pathname: string): string | null {
  const componentMatch = pathname.match(/^\/components\/([^/]+)/);
  if (componentMatch) {
    const slug = componentMatch[1]!;
    const directory = COMPONENT_DIRECTORIES[slug];
    if (directory) {
      return `${COMPONENT_SOURCE_URL}/${directory}`;
    }
    if (directory === null) {
      return `${DOCS_SOURCE_URL}/apps/doc/src/routes/components/${slug}.tsx`;
    }
    return `${COMPONENT_SOURCE_URL}/${slug}`;
  }
  const docsFile = DOC_SOURCE_FILES[pathname];
  return docsFile ? `${DOCS_SOURCE_URL}/apps/doc/src/${docsFile}` : null;
}

type DocPageProps = {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  /** Override the "View source on GitHub" link target. Defaults to the component source dir. */
  sourceHref?: string | null;
  /** Quick summary of what this component changes versus its upstream original. */
  overview?: ReactNode;
  articleClassName?: string;
  toc: readonly TocItem[];
  showToc?: boolean;
  showHeader?: boolean;
  children: ReactNode;
};

export function DocPage({
  title,
  description,
  articleClassName,
  headerAction,
  sourceHref,
  overview,
  toc,
  showToc = true,
  showHeader = true,
  children,
}: DocPageProps) {
  const { pathname } = useLocation();
  const resolvedSourceHref = sourceHref !== undefined ? sourceHref : resolveSourceHref(pathname);
  const showChrome = !isMarkdownMode();
  const contentInset = showToc ? "xl:pr-[var(--toc-w)]" : "";
  // Below xl the TOC is hidden — don't keep the old narrow max-w-160 gutters.
  // xl+ already reserves toc padding via contentInset; 2xl opens up further.
  const articleWidth = showToc ? "mx-auto max-w-5xl 2xl:max-w-6xl" : "max-w-none";

  return (
    <>
      <div className={contentInset}>
        <article className={`w-full min-w-0 px-8 py-12 ${articleClassName ?? articleWidth}`}>
          {showHeader ? (
            <header className="mb-10">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground">
                    {title}
                  </h1>
                  {description ? (
                    <Text.Sans size="body" variant="muted" className="mt-3">
                      {description}
                    </Text.Sans>
                  ) : null}
                </div>
                {showChrome && (resolvedSourceHref || markdownPathFor(pathname) || headerAction) ? (
                  <div className="flex shrink-0 items-center gap-2 pt-1">
                    <DocPageActions
                      markdownPath={markdownPathFor(pathname)}
                      sourceHref={resolvedSourceHref}
                    />
                    {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
                  </div>
                ) : null}
              </div>
              {overview ? (
                <div className="mt-4 border-l-2 border-line-muted pl-4 text-sm leading-relaxed text-foreground-muted">
                  {overview}
                </div>
              ) : null}
            </header>
          ) : null}
          {children}
        </article>
      </div>
      {showToc && !isMarkdownMode() ? <Toc items={toc} /> : null}
    </>
  );
}
