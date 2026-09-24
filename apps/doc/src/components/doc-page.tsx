import { useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Button, Text } from "raft-ui";
import { Toc } from "./toc.tsx";
import { isMarkdownMode } from "#/lib/markdown-mode.ts";
import type { TocItem } from "./toc.tsx";

export function GithubMark({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

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
                {showChrome && (resolvedSourceHref || headerAction) ? (
                  <div className="flex shrink-0 items-center gap-2 pt-1">
                    {resolvedSourceHref ? (
                      <Button
                        variant="outline"
                        size="sm"
                        render={<a href={resolvedSourceHref} target="_blank" rel="noreferrer" />}
                      >
                        <GithubMark />
                        GitHub
                      </Button>
                    ) : null}
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
