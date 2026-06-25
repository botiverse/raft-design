import { Link, createFileRoute } from "@tanstack/react-router";
import { Badge, InlineCode, Text } from "raft-ui";
import { ArrowLeft } from "lucide-react";
import { Fragment, type ReactNode } from "react";

import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { getMigrationGuide } from "#/data/migration.ts";
import { highlightSnippets } from "#/lib/highlight.tsx";

export const Route = createFileRoute("/migration/$sourceFile")({
  component: MigrationGuidePage,
  loader: ({ params }) => {
    const guide = getMigrationGuide(params.sourceFile);
    const snippets = Object.fromEntries(
      guide?.components
        .filter((component) => component.write)
        .map((component) => [writeSnippetId(component.component), component.write ?? ""]) ?? [],
    );

    return highlightSnippets({ data: snippets });
  },
});

function MigrationGuidePage() {
  const { sourceFile } = Route.useParams();
  const code = Route.useLoaderData();
  const guide = getMigrationGuide(sourceFile);

  if (!guide) {
    return (
      <DocPage title="Migration" description="Source file not found." toc={[]}>
        <Link to="/migration" className="text-sm font-medium text-foreground-strong underline">
          Back to migration list
        </Link>
      </DocPage>
    );
  }

  return (
    <DocPage
      title="Migration"
      description="Single source-file migration guide."
      toc={guide.components.map((component) => ({
        id: component.component,
        title: component.componentLabel,
      }))}
    >
      <div className="grid gap-10">
        <div className="grid gap-4 border-b border-line-subtle pb-6">
          <Link
            to="/migration"
            className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground-strong"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Migration list
          </Link>
          <div className="grid gap-2">
            <Text.Mono size="eyebrow" variant="placeholder">
              Source file
            </Text.Mono>
            <Text.Mono size="code" variant="muted" className="w-fit max-w-full break-all">
              {guide.sourceFile}
            </Text.Mono>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {guide.components.map((component) => (
              <Badge key={component.component} appearance="soft" variant="muted">
                {component.componentLabel}
              </Badge>
            ))}
          </div>
        </div>

        {guide.components.map((component) => (
          <section
            key={component.component}
            id={component.component}
            className="grid scroll-mt-8 gap-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-heading text-2xl font-medium text-foreground-strong">
                {component.componentLabel}
              </h2>
              <SourceComparisonLink
                href={component.docsHref}
                className="text-sm font-medium text-foreground-muted underline underline-offset-4 transition-colors hover:text-foreground-strong"
              />
            </div>

            <div className="grid gap-3">
              <Text.Mono size="eyebrow" variant="placeholder">
                Source refs
              </Text.Mono>
              <div className="flex flex-wrap gap-2">
                {component.refs.map((ref) => (
                  <InlineCode key={ref}>{formatRef(guide.sourceFile, ref)}</InlineCode>
                ))}
              </div>
            </div>

            <GuideList title="Migration" items={component.migration} />

            {component.write ? (
              <div className="grid gap-3">
                <Text.Mono size="eyebrow" variant="placeholder">
                  Write
                </Text.Mono>
                <DocsCodeBlock.Panel
                  path={`migration/${guide.slug}/${component.component}.tsx`}
                  source={component.write}
                  html={code[writeSnippetId(component.component)]}
                  collapsible={false}
                />
              </div>
            ) : null}

            {component.noDirect ? (
              <GuideList title="No direct API support" items={component.noDirect} />
            ) : null}
          </section>
        ))}
      </div>
    </DocPage>
  );
}

function writeSnippetId(component: string) {
  return `write-${component}`;
}

function SourceComparisonLink({ href, className }: { href: string; className?: string }) {
  const [to, hash] = href.split("#");

  return (
    <Link to={to} hash={hash} className={className}>
      Source comparison
    </Link>
  );
}

function GuideList({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div className="grid gap-3">
      <Text.Mono size="eyebrow" variant="placeholder">
        {title}
      </Text.Mono>
      <ul className="grid list-disc gap-3 pl-5 text-base leading-7 text-foreground-placeholder">
        {items.map((item) => (
          <li key={item}>{renderInline(item)}</li>
        ))}
      </ul>
    </div>
  );
}

function formatRef(sourceFile: string, ref: string) {
  return ref.startsWith("legacy") ? ref : `${sourceFile}:${ref}`;
}

function renderInline(text: string): ReactNode {
  return text.split(/(`[^`]+`)/g).map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>;
    }

    return <Fragment key={index}>{part}</Fragment>;
  });
}
