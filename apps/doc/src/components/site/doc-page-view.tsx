import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { MarkdownHeading } from "@botiverse/raft-ui";

import { REPOSITORY_URL } from "#/lib/content/links.ts";
import { componentGroup, CONTRIBUTING_URL, shortTitle } from "#/lib/content/nav.ts";
import { pagesIn, sectionIntro, sectionOf } from "#/lib/content/pages.ts";
import type { DocPage, SectionId } from "#/lib/content/pages.ts";
import { sectionTitle } from "#/lib/content/search.ts";
import { renderMarkdownTwin } from "#/lib/content/twin.ts";

import { DocLayout } from "./doc-layout.tsx";
import type { TocEntry } from "./doc-layout.tsx";
import { DocMarkdown } from "./doc-markdown.tsx";

function eyebrowOf(page: DocPage) {
  if (page.section === "components") return `Components · ${componentGroup(page)}`;
  if (page.section === "products" && page.slug !== page.product) {
    return `Products · ${page.frontMatter.title.split(" — ")[0]}`;
  }
  if (page.section === "decisions" && page.frontMatter.number) {
    const status = page.frontMatter.status ? ` · ${page.frontMatter.status}` : "";
    return `Decision ${page.frontMatter.number}${status} · ${page.frontMatter.date ?? ""}`.trim();
  }
  return sectionTitle(page);
}

/**
 * A guideline page (foundation, pattern, product or decision) rendered from
 * its Markdown. Component pages add their generated parts through
 * `meta`, `notice` and `children`.
 */
export function DocPageView({
  page,
  meta,
  notice,
  children,
  appendix,
  toc,
}: {
  page: DocPage;
  meta?: ReactNode;
  notice?: ReactNode;
  children?: ReactNode;
  /** Markdown appended to the twin: what `children` shows, for agents. */
  appendix?: string;
  /** Replaces the page's own headings in "On this page". */
  toc?: readonly TocEntry[];
}) {
  const getMarkdown = useCallback(() => renderMarkdownTwin(page, appendix), [page, appendix]);
  return (
    <DocLayout
      key={page.url}
      eyebrow={eyebrowOf(page)}
      title={shortTitle(page)}
      summary={page.frontMatter.summary}
      meta={meta}
      notice={notice}
      markdownPath={`${page.url}.md`}
      sourceHref={`${REPOSITORY_URL}/blob/main/${page.repoPath}`}
      getMarkdown={getMarkdown}
      toc={toc ?? page.headings}
    >
      {page.body ? <DocMarkdown sourcePath={page.repoPath}>{page.body}</DocMarkdown> : null}
      {children}
    </DocLayout>
  );
}

function PageList({ pages }: { pages: readonly DocPage[] }) {
  return (
    <ul className="flex flex-col divide-y divide-line-hairline border-y border-line-hairline">
      {pages.map((page) => (
        <li key={page.url}>
          <Link
            to={page.url}
            className="flex flex-col gap-1 py-4 outline-none hover:press-overlay focus-visible:shadow-focus"
          >
            <span className="text-headline font-bold text-foreground">{shortTitle(page)}</span>
            <span className="text-callout text-foreground-muted">{page.frontMatter.summary}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DecisionTable({ pages }: { pages: readonly DocPage[] }) {
  return (
    <ul className="flex flex-col divide-y divide-line-hairline border-y border-line-hairline">
      {pages.map((page) => (
        <li key={page.url}>
          <Link
            to={page.url}
            className="flex gap-4 py-3 outline-none hover:press-overlay focus-visible:shadow-focus"
          >
            <span className="w-12 shrink-0 font-mono text-mono-meta text-foreground-hint">
              {page.frontMatter.number ?? "—"}
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-subhead font-semibold text-foreground">
                {page.frontMatter.title}
              </span>
              <span className="text-callout text-foreground-muted">{page.frontMatter.summary}</span>
            </span>
            {page.frontMatter.status && page.frontMatter.status !== "accepted" ? (
              <span className="shrink-0 text-footnote text-foreground-hint">
                {page.frontMatter.status}
              </span>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function ProductGroup({ product }: { product: string }) {
  const pages = useMemo(
    () => pagesIn("products").filter((page) => page.product === product),
    [product],
  );
  const readme = pages.find((page) => page.slug === product);
  return (
    <section className="mb-10">
      <MarkdownHeading level={2}>{readme?.frontMatter.title ?? product}</MarkdownHeading>
      <PageList pages={pages} />
    </section>
  );
}

/** What About links to besides its own pages: the records, the changelog, how to contribute. */
function AboutLinks() {
  const decisions = sectionOf("decisions");
  const rows = [
    { title: decisions.title, summary: decisions.summary, href: "/decisions" },
    {
      title: "Changelog",
      summary: "What changed in each release of raft-ui, newest first.",
      href: "/changelog",
    },
    {
      title: "Contributing",
      summary: "How to propose a change to the system, in code and docs together.",
      href: CONTRIBUTING_URL,
    },
  ];
  return (
    <ul className="mt-10 flex flex-col divide-y divide-line-hairline border-y border-line-hairline">
      {rows.map((row) => (
        <li key={row.href}>
          {row.href.startsWith("/") ? (
            <Link
              to={row.href}
              className="flex flex-col gap-1 py-4 outline-none hover:press-overlay focus-visible:shadow-focus"
            >
              <span className="text-headline font-bold text-foreground">{row.title}</span>
              <span className="text-callout text-foreground-muted">{row.summary}</span>
            </Link>
          ) : (
            <a
              href={row.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-1 py-4 outline-none hover:press-overlay focus-visible:shadow-focus"
            >
              <span className="text-headline font-bold text-foreground">{row.title}</span>
              <span className="text-callout text-foreground-muted">{row.summary}</span>
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * A section's own page: its introduction (design/<section>/README.md) when
 * the folder has one, else the section's summary, then every page in it.
 */
export function SectionIndex({ section }: { section: Exclude<SectionId, "components"> }) {
  const info = sectionOf(section);
  const intro = sectionIntro(section);
  const pages = pagesIn(section);
  const products = [...new Set(pages.map((page) => page.product))].filter(
    (product): product is string => product !== undefined,
  );
  const parent = info.parent ? sectionOf(info.parent) : undefined;
  const parentUrl: string = `/${parent?.id}`;

  return (
    <div className="mx-auto max-w-[760px] px-4 pt-8 pb-24 md:px-10 md:pt-10">
      <header className="mb-8 flex flex-col gap-3">
        {parent ? (
          <Link to={parentUrl} className="text-callout text-foreground-muted">
            {parent.title}
          </Link>
        ) : null}
        <h1 className="text-display font-bold">{intro?.frontMatter.title ?? info.title}</h1>
        <p className="text-body text-foreground-muted">
          {intro?.frontMatter.summary ?? info.summary}
        </p>
      </header>
      {intro?.body ? (
        <div className="mb-10">
          <DocMarkdown sourcePath={intro.repoPath}>{intro.body}</DocMarkdown>
        </div>
      ) : null}
      {pages.length === 0 ? (
        section === "about" || intro ? null : (
          <p className="text-body text-foreground-muted">No pages yet.</p>
        )
      ) : section === "decisions" ? (
        <DecisionTable pages={pages} />
      ) : section === "products" ? (
        products.map((product) => <ProductGroup key={product} product={product} />)
      ) : (
        <PageList pages={pages} />
      )}
      {section === "about" ? <AboutLinks /> : null}
    </div>
  );
}
