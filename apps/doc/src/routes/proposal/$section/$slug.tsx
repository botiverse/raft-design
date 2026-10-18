import { useMemo } from "react";
import type { ReactNode } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { InlineCode, MarkdownHeading } from "raft-ui";

import { PropsTable } from "#/components/props-table.tsx";
import { catalogEntry } from "#/proposal/catalog.ts";
import { DocLayout } from "#/proposal/doc-layout.tsx";
import type { TocEntry } from "#/proposal/doc-layout.tsx";
import { DocMarkdown } from "#/proposal/doc-markdown.tsx";
import { getDocSource, renderMarkdownTwin } from "#/proposal/doc-source.ts";
import { changesFor, MOCK_PROPS, propsMarkdown } from "#/proposal/generated.ts";
import { findPage, pageHref, SECTIONS } from "#/proposal/site-map.ts";
import type { SitePage } from "#/proposal/site-map.ts";

const REPO = "https://github.com/botiverse/raft-design/blob/main";

// One route for every documentation page. The page type follows the section;
// the body is the page's Markdown, and component pages add the parts that are
// generated from code: API, related components and changes.
export const Route = createFileRoute("/proposal/$section/$slug")({
  loader: ({ params }) => {
    const page = findPage(params.section, params.slug);
    if (!page) throw notFound();
    return page;
  },
  component: DocRoute,
});

function sourcePathOf(page: SitePage) {
  if (page.section === "components")
    return `packages/ui/src/components/${page.slug}/${page.slug}.md`;
  if (page.section === "products") return `design/products/${page.slug}/README.md`;
  return `design/${page.section}/${page.slug}.md`;
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <MarkdownHeading level={2} id={id} className="scroll-mt-20">
        {title}
      </MarkdownHeading>
      {children}
    </section>
  );
}

function buildView(page: SitePage) {
  const source = getDocSource(page.slug);
  const isComponent = page.section === "components";
  const entry = isComponent ? catalogEntry(page.slug) : undefined;
  const sectionTitle = SECTIONS.find((section) => section.id === page.section)!.title;
  const props = MOCK_PROPS[page.slug];
  const changes = isComponent ? changesFor(page.title) : [];
  const related = (source?.frontMatter.related ?? [])
    .map((slug) => findPage("components", slug))
    .filter((item): item is SitePage => item !== undefined);

  const generatedToc: TocEntry[] = isComponent
    ? [
        { id: "api", title: "API" },
        ...(related.length ? [{ id: "related", title: "Related" }] : []),
        ...(changes.length ? [{ id: "changes", title: "Changes" }] : []),
      ]
    : [];
  const toc = [...(source?.headings ?? []), ...generatedToc];

  async function getMarkdown() {
    const api = isComponent
      ? `\n\n## API\n\n${props ? propsMarkdown(props) : `Generated from \`${page.title}Props\`.`}`
      : "";
    if (source) return renderMarkdownTwin(source, api);
    return `# ${page.title}\n\n> Not written yet: ${sourcePathOf(page)}${api}\n`;
  }

  return { source, isComponent, entry, sectionTitle, props, changes, related, toc, getMarkdown };
}

function DocRoute() {
  const page = Route.useLoaderData();
  const { source, isComponent, entry, sectionTitle, props, changes, related, toc, getMarkdown } =
    useMemo(() => buildView(page), [page]);

  return (
    <DocLayout
      key={pageHref(page)}
      eyebrow={page.group ? `${sectionTitle} · ${page.group}` : sectionTitle}
      title={page.title}
      summary={source?.frontMatter.summary ?? page.summary}
      status={entry?.status}
      aliases={entry?.aliases}
      importLine={
        isComponent && entry
          ? `import { ${entry.title} } from "raft-ui${entry.status === "experimental" ? "/wip" : ""}";`
          : undefined
      }
      placeholder={source?.frontMatter.placeholder}
      plannedSource={source ? undefined : sourcePathOf(page)}
      markdownPath={`/${page.section}/${page.slug}.md`}
      sourceHref={`${REPO}/${sourcePathOf(page)}`}
      getMarkdown={getMarkdown}
      toc={toc}
    >
      {source ? <DocMarkdown>{source.body}</DocMarkdown> : null}

      {isComponent ? (
        <>
          <Section id="api" title="API">
            {props ? (
              <PropsTable rows={props} />
            ) : (
              <p className="text-body text-foreground-muted">
                Generated from <InlineCode>{page.title}Props</InlineCode> and the props of each
                part.
              </p>
            )}
          </Section>
          {related.length ? (
            <Section id="related" title="Related">
              <ul className="flex flex-wrap gap-2">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={pageHref(item)}
                      className="inline-flex h-8 items-center rounded-control border-[1.5px] border-line-strong px-3 text-subhead hover:press-overlay"
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
          {changes.length ? (
            <Section id="changes" title="Changes">
              <ul className="flex flex-col divide-y divide-line-hairline">
                {changes.map((change) => (
                  <li key={change.text} className="flex gap-4 py-3">
                    <span className="w-24 shrink-0 font-mono text-mono-meta text-foreground-hint">
                      {change.version} · {change.kind}
                    </span>
                    <span className="min-w-0 text-callout text-foreground-muted">
                      {change.text.replace(/`/g, "")}
                    </span>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </>
      ) : null}
    </DocLayout>
  );
}
