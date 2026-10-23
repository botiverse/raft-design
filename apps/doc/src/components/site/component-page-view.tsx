import { Info } from "lucide-react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
} from "@botiverse/raft-ui";

import { useMemo } from "react";

import { apiMarkdown, changesFor, changesMarkdown } from "#/lib/content/api.ts";
import type { ApiComponent } from "#/lib/content/api.ts";
import { pageAt } from "#/lib/content/pages.ts";
import type { DocPage } from "#/lib/content/pages.ts";
import { useMessages } from "#/lib/i18n/use-locale.ts";

import { ApiSection, ChangesSection, RelatedSection } from "./api-section.tsx";
import { DocMarkdownLink } from "./doc-markdown.tsx";
import { DocPageView } from "./doc-page-view.tsx";
import { StatusLabel } from "./status-label.tsx";
import type { ComponentStatus } from "./status-label.tsx";

function importLineOf(page: DocPage, api: readonly ApiComponent[]) {
  const entry =
    api[0]?.entry ??
    (page.frontMatter.status === "experimental" ? "@botiverse/raft-ui/wip" : "@botiverse/raft-ui");
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
  const messages = useMessages();
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
      { id: "api", title: messages.api, depth: 2 as const },
      ...(related.length ? [{ id: "related", title: messages.related, depth: 2 as const }] : []),
      ...(changes.length ? [{ id: "changes", title: messages.changes, depth: 2 as const }] : []),
    ],
    [page.headings, related.length, changes.length, messages],
  );
  const replacement = replacedBy ? pageAt(`/components/${replacedBy}`) : undefined;

  const meta = (
    <>
      {status || aliases?.length ? (
        <div className="flex flex-wrap items-center gap-2 text-callout text-foreground-muted">
          {status ? <StatusLabel status={status as ComponentStatus} /> : null}
          {aliases?.length ? <span>{messages.alsoCalled(aliases.join(", "))}</span> : null}
        </div>
      ) : null}
      <CopyableCodeRoot size="sm" className="self-start">
        <CopyableCode>{importLineOf(page, api)}</CopyableCode>
        <CopyableCodeAction aria-label={messages.copyImport} />
      </CopyableCodeRoot>
    </>
  );

  const deprecatedNotice = (
    <Banner status="warning">
      <Info />
      <BannerTitle>{messages.deprecated}</BannerTitle>
      <BannerDescription>
        {replacement ? (
          <>
            {messages.useInstead}{" "}
            <DocMarkdownLink href={replacement.url}>
              {replacement.frontMatter.title}
            </DocMarkdownLink>
            {messages.insteadRemoved(page.frontMatter.title)}
          </>
        ) : typeof api[0]?.deprecated === "string" ? (
          api[0].deprecated
        ) : (
          <>{messages.willBeRemoved(page.frontMatter.title)}</>
        )}
      </BannerDescription>
    </Banner>
  );
  const undocumentedNotice = (
    <Banner status="default">
      <Info />
      <BannerTitle>{messages.notDocumentedTitle}</BannerTitle>
      <BannerDescription>
        {messages.notDocumented} <code className="font-mono">{page.repoPath}</code>
        {messages.notDocumentedEnd}
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
