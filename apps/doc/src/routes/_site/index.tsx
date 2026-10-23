import type { ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Braces, FileText } from "lucide-react";
import {
  Button,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
  InlineCode,
  MarkdownHeading,
} from "@botiverse/raft-ui";

import { DocMarkdown } from "#/components/site/doc-markdown.tsx";
import { raftUiVersion } from "#/data/raft-ui-release.ts";
import { latestChanges } from "#/lib/content/api.ts";
import { localize, pagesIn, README } from "#/lib/content/pages.ts";
import { localeOfMatches } from "#/lib/i18n/head.ts";
import { useLocale, useMessages } from "#/lib/i18n/use-locale.ts";

export const Route = createFileRoute("/_site/")({
  head: ({ matches }) => ({
    meta: README
      ? [
          {
            name: "description",
            content: localize(README, localeOfMatches(matches)).frontMatter.summary,
          },
        ]
      : [],
  }),
  component: Home,
});

const COMPONENTS: string = "/components";
/** Why the system is the way it is: the Principles, until they are written the Foundations. */
const WHY =
  pagesIn("principles").length > 0
    ? { url: "/principles" as string, label: "readPrinciples" as const }
    : { url: "/foundations" as string, label: "readFoundations" as const };

const AGENT_SURFACES = [
  { icon: FileText, path: "/llms.txt", text: "llmsText" },
  { icon: FileText, path: "/llms-full.txt", text: "llmsFullText" },
  { icon: FileText, path: "/components/button.md", text: "markdownTwinText" },
  { icon: Braces, path: "/components.json", text: "componentsJsonText" },
] as const;

const LATEST = latestChanges(4);

/** The frame, the sidebar and paper, drawn with the tokens themselves. */
function FrameDiagram() {
  return (
    <div
      aria-hidden
      className="flex h-44 w-full max-w-sm overflow-hidden rounded-container border-[1.5px] border-line-strong"
    >
      <div className="w-10 shrink-0 border-r border-line-seam bg-layer-frame" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-8 shrink-0 border-b border-line-seam bg-layer-frame" />
        <div className="flex min-h-0 flex-1">
          <div className="w-20 shrink-0 border-r border-line-seam bg-layer-sidebar p-2">
            <div className="h-5 rounded-control border-[1.5px] border-line-strong bg-brand" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 bg-layer-canvas p-3">
            <div className="h-2 w-3/4 rounded-sticker bg-fill-muted" />
            <div className="h-2 w-1/2 rounded-sticker bg-fill-muted" />
            <div className="mt-auto h-6 w-16 self-end rounded-control border-[1.5px] border-line-strong bg-attention" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return (
    <MarkdownHeading level={2} className="mb-4">
      {children}
    </MarkdownHeading>
  );
}

/**
 * Home: what the system is (the title and summary of design/README.md), how
 * to install raft-ui, then the README itself, the agent surfaces and the
 * latest release.
 */
function Home() {
  const locale = useLocale();
  const messages = useMessages();
  const readme = README ? localize(README, locale) : null;
  return (
    <div className="mx-auto flex max-w-[1120px] flex-col gap-14 px-4 pt-10 pb-24 md:px-10">
      <section className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-4">
          <h1 className="text-display font-bold">
            {readme?.frontMatter.title ?? messages.siteName}
          </h1>
          {readme ? (
            <p className="max-w-xl text-body text-foreground-muted">{readme.frontMatter.summary}</p>
          ) : null}
          <CopyableCodeRoot size="sm" className="self-start">
            <CopyableCode>pnpm add @botiverse/raft-ui</CopyableCode>
            <CopyableCodeAction aria-label={messages.copyInstall} />
          </CopyableCodeRoot>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" nativeButton={false} render={<Link to={COMPONENTS} />}>
              {messages.browseComponents}
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button variant="default" nativeButton={false} render={<Link to={WHY.url} />}>
              {messages[WHY.label]}
            </Button>
          </div>
        </div>
        <FrameDiagram />
      </section>

      {readme ? (
        <section
          className="max-w-[760px]"
          lang={readme.translation === "missing" ? "en" : undefined}
        >
          <DocMarkdown sourcePath={readme.repoPath}>{readme.body}</DocMarkdown>
        </section>
      ) : null}

      <section className="grid gap-10 md:grid-cols-2">
        <div>
          <Heading>{messages.forAgentsHeading}</Heading>
          <ul className="flex flex-col rule-y rule-line-hairline">
            {AGENT_SURFACES.map(({ icon: Icon, path, text }) => (
              <li key={path} className="flex items-start gap-3 py-3">
                <Icon className="mt-0.5 size-5 shrink-0 text-foreground-muted" aria-hidden />
                <span className="flex min-w-0 flex-col">
                  <a href={path} className="font-mono text-mono-code text-foreground-link">
                    {path}
                  </a>
                  <span className="text-callout text-foreground-muted">{messages[text]}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <Heading>{messages.latestRelease}</Heading>
          <p className="mb-2 font-mono text-mono-meta text-foreground-hint">
            raft-ui {raftUiVersion}
          </p>
          <ul className="flex flex-col rule-y rule-line-hairline">
            {LATEST.map((change) => (
              <li
                key={`${change.version}-${change.text}`}
                className="py-3 text-callout text-foreground-muted"
              >
                <span className="mr-2 font-bold text-foreground">{change.kind}</span>
                {change.text.split(/(`[^`]+`)/g).map((part, index) =>
                  part.startsWith("`") ? (
                    // oxlint-disable-next-line react/no-array-index-key -- a static split of one string
                    <InlineCode key={index}>{part.slice(1, -1)}</InlineCode>
                  ) : (
                    part.replace(/\*\*/g, "")
                  ),
                )}
              </li>
            ))}
          </ul>
          <Link to="/changelog" className="mt-2 inline-block text-callout text-foreground-link">
            {messages.fullChangelog}
          </Link>
        </div>
      </section>
    </div>
  );
}
