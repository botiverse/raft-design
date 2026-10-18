import { Info } from "lucide-react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
} from "raft-ui";

import { pageAt } from "#/lib/content/pages.ts";
import type { DocPage } from "#/lib/content/pages.ts";

import { DocMarkdownLink } from "./doc-markdown.tsx";
import { DocPageView } from "./doc-page-view.tsx";
import { StatusLabel } from "./status-label.tsx";
import type { ComponentStatus } from "./status-label.tsx";

function importLineOf(page: DocPage) {
  const entry = page.frontMatter.status === "experimental" ? "raft-ui/wip" : "raft-ui";
  return `import { ${page.frontMatter.title} } from "${entry}";`;
}

/**
 * A component page: the component's doc (packages/ui/src/components/<x>/<x>.md)
 * under a header with its status, other names and import line. A deprecated
 * component opens with what replaces it.
 */
export function ComponentPageView({ page }: { page: DocPage }) {
  const { status, aliases, replacedBy } = page.frontMatter;
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
        <CopyableCode>{importLineOf(page)}</CopyableCode>
        <CopyableCodeAction aria-label="Copy import" />
      </CopyableCodeRoot>
    </>
  );

  const notice =
    status === "deprecated" ? (
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
          ) : (
            <>{page.frontMatter.title} will be removed in the next major version.</>
          )}
        </BannerDescription>
      </Banner>
    ) : undefined;

  return <DocPageView page={page} meta={meta} notice={notice} />;
}
