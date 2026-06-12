import type { ReactNode } from "react";
import { Toc, type TocItem } from "./toc.tsx";

type DocPageProps = {
  title: string;
  description?: string;
  /** Quick summary of what this component changes versus its upstream original. */
  overview?: ReactNode;
  toc: readonly TocItem[];
  showToc?: boolean;
  showHeader?: boolean;
  children: ReactNode;
};

export function DocPage({
  title,
  description,
  overview,
  toc,
  showToc = true,
  showHeader = true,
  children,
}: DocPageProps) {
  const contentInset = showToc ? "xl:pr-[var(--rail-w)]" : "";
  const articleWidth = showToc ? "mx-auto max-w-160 xl:max-w-4xl 2xl:max-w-6xl" : "max-w-none";

  return (
    <>
      <div className={contentInset}>
        <article className={`w-full min-w-0 px-8 py-12 ${articleWidth}`}>
          {showHeader ? (
            <header className="mb-10">
              <h1 className="font-display text-3xl font-medium tracking-tight text-foreground-strong">
                {title}
              </h1>
              {description ? (
                <p className="mt-3 text-sm text-foreground-muted">{description}</p>
              ) : null}
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
