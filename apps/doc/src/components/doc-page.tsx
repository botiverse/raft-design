import type { ReactNode } from "react";
import { Text } from "raft-ui";
import { Toc, type TocItem } from "./toc.tsx";

type DocPageProps = {
  title: string;
  description?: string;
  headerAction?: ReactNode;
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
  overview,
  toc,
  showToc = true,
  showHeader = true,
  children,
}: DocPageProps) {
  const contentInset = showToc ? "xl:pr-[var(--toc-w)]" : "";
  // Below xl the TOC is hidden — don't keep the old narrow max-w-160 gutters.
  // xl+ already reserves toc padding via contentInset; 2xl opens up further.
  const articleWidth = showToc ? "mx-auto max-w-5xl 2xl:max-w-6xl" : "max-w-none";

  return (
    <>
      <div className={contentInset}>
        <article className={`w-full min-w-0 px-8 py-12 ${articleWidth} ${articleClassName ?? ""}`}>
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
                {headerAction ? <div className="shrink-0 pt-1">{headerAction}</div> : null}
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
      {showToc ? <Toc items={toc} /> : null}
    </>
  );
}
