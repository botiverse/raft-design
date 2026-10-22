import { useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import { Banner, BannerDescription, BannerTitle, MarkdownHeading } from "@botiverse/raft-ui";

import { REPOSITORY_URL } from "#/lib/content/links.ts";
import { componentGroup, CONTRIBUTING_URL, shortTitle } from "#/lib/content/nav.ts";
import { localize, pagesIn, sectionIntro, sectionOf } from "#/lib/content/pages.ts";
import type { DocPage, SectionId } from "#/lib/content/pages.ts";
import { sectionTitle } from "#/lib/content/search.ts";
import { renderMarkdownTwin } from "#/lib/content/twin.ts";
import { localizePath } from "#/lib/i18n/locales.ts";
import type { Locale } from "#/lib/i18n/locales.ts";
import { messagesFor } from "#/lib/i18n/messages.ts";
import { useLocale, useMessages } from "#/lib/i18n/use-locale.ts";

import { DocLayout } from "./doc-layout.tsx";
import type { TocEntry } from "./doc-layout.tsx";
import { DocMarkdown } from "./doc-markdown.tsx";

function eyebrowOf(page: DocPage, locale: Locale) {
  const messages = messagesFor(locale);
  if (page.section === "components") {
    return `${messages.sections.components.title} · ${componentGroup(page, locale)}`;
  }
  if (page.section === "products" && page.slug !== page.product) {
    return `${messages.sections.products.title} · ${page.frontMatter.title.split(" — ")[0]}`;
  }
  if (page.section === "decisions" && page.frontMatter.number) {
    const status = page.frontMatter.status ? ` · ${page.frontMatter.status}` : "";
    return `${messages.decision(page.frontMatter.number)}${status} · ${page.frontMatter.date ?? ""}`.trim();
  }
  return sectionTitle(page, locale);
}

/**
 * Above a page shown in another language: that it is not translated yet, or
 * that the English page changed after the translation was made.
 */
function TranslationNotice({ page }: { page: DocPage }) {
  const messages = useMessages();
  if (page.translation !== "missing" && page.translation !== "stale") return null;
  return (
    <Banner status={page.translation === "stale" ? "warning" : "default"}>
      <Languages />
      <BannerTitle>
        {page.translation === "stale" ? messages.staleTitle : messages.notTranslatedTitle}
      </BannerTitle>
      <BannerDescription>
        {page.translation === "stale" ? messages.stale : messages.notTranslated}{" "}
        {/* The English page: a document navigation, so the whole site switches language. */}
        <a href={page.url} hrefLang="en" className="text-foreground-link">
          {messages.readInEnglish}
        </a>
      </BannerDescription>
    </Banner>
  );
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
  const locale = useLocale();
  const shown = localize(page, locale);
  const translated = shown.translation === "current" || shown.translation === "stale";
  const getMarkdown = useCallback(() => renderMarkdownTwin(shown, appendix), [shown, appendix]);
  // A `toc` starts with the English page's headings; a translation shows its own.
  const shownToc = useMemo(
    () =>
      toc
        ? translated
          ? [...shown.headings, ...toc.slice(page.headings.length)]
          : toc
        : shown.headings,
    [toc, translated, shown.headings, page.headings.length],
  );
  const translationNotice =
    shown.translation === "missing" || shown.translation === "stale" ? (
      <TranslationNotice page={shown} />
    ) : null;
  return (
    <DocLayout
      key={page.url}
      eyebrow={eyebrowOf(shown, locale)}
      title={shortTitle(shown)}
      summary={shown.frontMatter.summary}
      lang={shown.translation === "missing" ? "en" : undefined}
      meta={meta}
      notice={
        translationNotice || notice ? (
          <div className="flex flex-col gap-3">
            {translationNotice}
            {notice}
          </div>
        ) : null
      }
      markdownPath={`${translated ? localizePath(page.url, locale) : page.url}.md`}
      sourceHref={`${REPOSITORY_URL}/blob/main/${translated ? `i18n/${locale}/` : ""}${page.repoPath}`}
      getMarkdown={getMarkdown}
      toc={shownToc}
    >
      {shown.body ? (
        <div lang={shown.translation === "missing" ? "en" : undefined}>
          <DocMarkdown sourcePath={page.repoPath}>{shown.body}</DocMarkdown>
        </div>
      ) : null}
      {children}
    </DocLayout>
  );
}

function PageList({ pages: english }: { pages: readonly DocPage[] }) {
  const locale = useLocale();
  const pages = english.map((page) => localize(page, locale));
  return (
    <ul className="flex flex-col rule-y rule-line-hairline border-y border-line-hairline">
      {pages.map((page) => (
        <li key={page.url}>
          <Link
            to={page.url}
            className="flex flex-col gap-1 py-4 outline-none hover:overlay-subtle focus-visible:shadow-focus"
          >
            <span className="text-headline font-bold text-foreground">{shortTitle(page)}</span>
            <span className="text-callout text-foreground-muted">{page.frontMatter.summary}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DecisionTable({ pages: english }: { pages: readonly DocPage[] }) {
  const locale = useLocale();
  const pages = english.map((page) => localize(page, locale));
  return (
    <ul className="flex flex-col rule-y rule-line-hairline border-y border-line-hairline">
      {pages.map((page) => (
        <li key={page.url}>
          <Link
            to={page.url}
            className="flex gap-4 py-3 outline-none hover:overlay-subtle focus-visible:shadow-focus"
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
  const locale = useLocale();
  const english = pages.find((page) => page.slug === product);
  const readme = english ? localize(english, locale) : undefined;
  return (
    <section className="mb-10">
      <MarkdownHeading level={2}>{readme?.frontMatter.title ?? product}</MarkdownHeading>
      <PageList pages={pages} />
    </section>
  );
}

/** What About links to besides its own pages: the records, the changelog, how to contribute. */
function AboutLinks() {
  const messages = useMessages();
  const decisions = messages.sections.decisions;
  const rows = [
    { title: decisions.title, summary: decisions.summary, href: "/decisions" },
    { title: messages.changelog, summary: messages.changelogSummary, href: "/changelog" },
    { title: messages.contributing, summary: messages.contributingSummary, href: CONTRIBUTING_URL },
  ];
  return (
    <ul className="mt-10 flex flex-col rule-y rule-line-hairline border-y border-line-hairline">
      {rows.map((row) => (
        <li key={row.href}>
          {row.href.startsWith("/") ? (
            <Link
              to={row.href}
              className="flex flex-col gap-1 py-4 outline-none hover:overlay-subtle focus-visible:shadow-focus"
            >
              <span className="text-headline font-bold text-foreground">{row.title}</span>
              <span className="text-callout text-foreground-muted">{row.summary}</span>
            </Link>
          ) : (
            <a
              href={row.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col gap-1 py-4 outline-none hover:overlay-subtle focus-visible:shadow-focus"
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
  const locale = useLocale();
  const messages = messagesFor(locale);
  const info = messages.sections[section];
  const englishIntro = sectionIntro(section);
  const intro = englishIntro ? localize(englishIntro, locale) : undefined;
  const pages = pagesIn(section);
  const products = [...new Set(pages.map((page) => page.product))].filter(
    (product): product is string => product !== undefined,
  );
  const parentId = sectionOf(section).parent;
  const parent = parentId ? messages.sections[parentId] : undefined;
  const parentUrl: string = `/${parentId}`;

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
      {intro?.translation === "missing" || intro?.translation === "stale" ? (
        <div className="mb-8">
          <TranslationNotice page={intro} />
        </div>
      ) : null}
      {intro?.body ? (
        <div className="mb-10" lang={intro.translation === "missing" ? "en" : undefined}>
          <DocMarkdown sourcePath={intro.repoPath}>{intro.body}</DocMarkdown>
        </div>
      ) : null}
      {pages.length === 0 ? (
        section === "about" || intro ? null : (
          <p className="text-body text-foreground-muted">{messages.noPagesYet}</p>
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
