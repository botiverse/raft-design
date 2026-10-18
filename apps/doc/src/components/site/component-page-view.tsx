import { Info } from "lucide-react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
} from "raft-ui";

import { useMemo } from "react";

import { apiMarkdown, changesFor, changesMarkdown } from "#/lib/content/api.ts";
import type { ApiComponent } from "#/lib/content/api.ts";
import { pageAt } from "#/lib/content/pages.ts";
import type { DocPage } from "#/lib/content/pages.ts";

import { ApiSection, ChangesSection, RelatedSection } from "./api-section.tsx";
import { DocMarkdownLink } from "./doc-markdown.tsx";
import { DocPageView } from "./doc-page-view.tsx";
import { StatusLabel } from "./status-label.tsx";
import type { ComponentStatus } from "./status-label.tsx";

function importLineOf(page: DocPage, api: readonly ApiComponent[]) {
  const entry =
    api[0]?.entry ?? (page.frontMatter.status === "experimental" ? "raft-ui/wip" : "raft-ui");
  return `import { ${page.frontMatter.title} } from "${entry}";`;
}

/**
 * A component page: the component's doc (packages/ui/src/components/<x>/<x>.md)
 * under a header with its status, other names and import line, then what is
 * generated from code: the API, related components and changes. A deprecated
 * component opens with what replaces it; a component with no doc yet is only
 * the generated parts.
 */
export function ComponentPageView({ page, api }: { page: DocPage; api: readonly ApiComponent[] }) {
  const { status, aliases, replacedBy } = page.frontMatter;
  const changes = useMemo(() => changesFor(page.slug), [page.slug]);
  const related = useMemo(
    () =>
      (page.frontMatter.related ?? [])
        .map((slug) => pageAt(`/components/${slug}`))
        .filter((item): item is DocPage => item !== undefined),
    [page.frontMatter.related],
  );
  const appendix = useMemo(
    () => [apiMarkdown(api), changesMarkdown(changes)].filter(Boolean).join("\n\n"),
    [api, changes],
  );
  const toc = useMemo(
    () => [
      ...page.headings,
      { id: "api", title: "API", depth: 2 as const },
      ...(related.length ? [{ id: "related", title: "Related", depth: 2 as const }] : []),
      ...(changes.length ? [{ id: "changes", title: "Changes", depth: 2 as const }] : []),
    ],
    [page.headings, related.length, changes.length],
  );
  const replacement = replacedBy ? pageAt(`/components/${replacedBy}`) : undefined;

  const meta = (
    <>
      {status || aliases?.length ? (
        <div className="flex flex-wrap items-center gap-2 text-callout text-foreground-muted">
          {status ? <StatusLabel status={status as ComponentStatus} /> : null}
          {aliases?.length ? <span>Also called {aliases.join(", ")}</span> : null}
        </div>
      ) : null}
      <CopyableCodeRoot size="sm" className="self-start">
        <CopyableCode>{importLineOf(page, api)}</CopyableCode>
        <CopyableCodeAction aria-label="Copy import" />
      </CopyableCodeRoot>
    </>
  );

  const deprecatedNotice = (
    <Banner status="warning">
      <Info />
      <BannerTitle>Deprecated</BannerTitle>
      <BannerDescription>
        {replacement ? (
          <>
            Use{" "}
            <DocMarkdownLink href={replacement.url}>
              {replacement.frontMatter.title}
            </DocMarkdownLink>{" "}
            instead. {page.frontMatter.title} will be removed in the next major version.
          </>
        ) : typeof api[0]?.deprecated === "string" ? (
          api[0].deprecated
        ) : (
          <>{page.frontMatter.title} will be removed in the next major version.</>
        )}
      </BannerDescription>
    </Banner>
  );
  const undocumentedNotice = (
    <Banner status="default">
      <Info />
      <BannerTitle>Not documented yet</BannerTitle>
      <BannerDescription>
        The API below is generated from raft-ui. The guidelines will be in{" "}
        <code className="font-mono">{page.repoPath}</code>.
      </BannerDescription>
    </Banner>
  );
  const notice =
    status === "deprecated" ? deprecatedNotice : page.generated ? undocumentedNotice : undefined;

  return (
    <DocPageView page={page} meta={meta} notice={notice} appendix={appendix} toc={toc}>
      <ApiSection components={api} />
      <RelatedSection pages={related} />
      <ChangesSection changes={changes} />
    </DocPageView>
  );
}
