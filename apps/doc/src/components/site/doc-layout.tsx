import type { ReactNode } from "react";

import { useMessages } from "#/lib/i18n/use-locale.ts";

import { PageActions } from "./page-actions.tsx";

export type TocEntry = { id: string; title: string; depth?: 2 | 3 };

function OnThisPage({ entries }: { entries: readonly TocEntry[] }) {
  const messages = useMessages();
  if (entries.length < 2) return null;
  return (
    <nav
      aria-label={messages.onThisPage}
      className="sticky top-10 hidden w-48 shrink-0 self-start xl:block"
    >
      <p className="mb-2 text-footnote font-bold text-foreground-hint">{messages.onThisPage}</p>
      <ul className="flex flex-col gap-1.5 border-l border-line-hairline pl-3">
        {entries.map((entry) => (
          <li key={entry.id} className={entry.depth === 3 ? "pl-3" : undefined}>
            <a
              href={`#${entry.id}`}
              className="text-callout text-foreground-muted hover:text-foreground"
            >
              {entry.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Every documentation page: the header (eyebrow, title, summary, page
 * actions, then any `meta` such as status and the import line), an optional
 * notice, the body, and "On this page" from 1280 up.
 */
export function DocLayout({
  eyebrow,
  title,
  summary,
  lang,
  meta,
  notice,
  markdownPath,
  sourceHref,
  getMarkdown,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  summary?: string;
  /** The page's language when it differs from the site's: an untranslated page. */
  lang?: string;
  meta?: ReactNode;
  notice?: ReactNode;
  markdownPath: string;
  sourceHref: string;
  getMarkdown: () => Promise<string>;
  toc: readonly TocEntry[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1120px] gap-12 px-4 pt-8 pb-24 md:px-10 md:pt-10">
      <article className="min-w-0 max-w-[760px] flex-1" lang={lang}>
        <header className="mb-8 flex flex-col gap-3 border-b border-line-hairline pb-6">
          <p className="text-footnote font-bold text-foreground-hint">{eyebrow}</p>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-display font-bold text-foreground">{title}</h1>
            <PageActions
              markdownPath={markdownPath}
              sourceHref={sourceHref}
              getMarkdown={getMarkdown}
            />
          </div>
          {summary ? <p className="text-body text-foreground-muted">{summary}</p> : null}
          {meta}
        </header>
        {notice ? <div className="mb-8">{notice}</div> : null}
        {children}
      </article>
      <OnThisPage entries={toc} />
    </div>
  );
}
