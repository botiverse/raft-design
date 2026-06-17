import type { ReactNode } from "react";
import { Toc, type TocItem } from "./toc.tsx";

type DocPageProps = {
  title: string;
  description?: string;
  headerAction?: ReactNode;
  /** Quick summary of what this component changes versus its upstream original. */
  overview?: ReactNode;
  toc: readonly TocItem[];
  showToc?: boolean;
  showHeader?: boolean;
  sectionDividers?: boolean;
  children: ReactNode;
};

export function DocPage({
  title,
  description,
  headerAction,
  overview,
  toc,
  showToc = true,
  showHeader = true,
  sectionDividers = true,
  children,
}: DocPageProps) {
  const contentInset = showToc ? "xl:pr-[var(--rail-w)]" : "";
  const articleWidth = showToc ? "mx-auto max-w-160 xl:max-w-4xl 2xl:max-w-6xl" : "max-w-none";
  const sectionDividerClass = sectionDividers ? "" : "[&>section]:border-t-0";

  return (
    <>
      <div className={contentInset}>
        <article className={`w-full min-w-0 px-8 py-12 ${articleWidth} ${sectionDividerClass}`}>
          {showHeader ? (
            <header className="mb-10">
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <h1 className="font-heading text-3xl font-medium tracking-tight text-foreground-strong">
                    {title}
                  </h1>
                  {description ? (
                    <p className="mt-3 text-sm text-foreground-muted">{description}</p>
                  ) : null}
                </div>
                {headerAction ? <div className="shrink-0 pt-1">{headerAction}</div> : null}
              </div>
              {overview ? (
                <div className="mt-4 border-l-2 border-line-subtle pl-4 text-sm leading-relaxed text-foreground-muted">
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
