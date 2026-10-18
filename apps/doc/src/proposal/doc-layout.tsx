import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { useClipboard } from "foxact/use-clipboard";
import {
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  FileText,
  Info,
  Link as LinkIcon,
} from "lucide-react";
import {
  Banner,
  BannerDescription,
  BannerTitle,
  Button,
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
  CopyableCode,
  CopyableCodeAction,
  CopyableCodeRoot,
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "raft-ui";

import { GithubMark } from "#/components/github-mark.tsx";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";

import type { ComponentStatus } from "./catalog.ts";
import { StatusLabel } from "./status-label.tsx";

export type TocEntry = { id: string; title: string };

/**
 * Copy page / View as Markdown / Copy link / Source. On the built site the
 * twin is a static file at the page path plus `.md`; the mock builds it in the
 * browser from the same source.
 */
function PageActions({
  markdownPath,
  sourceHref,
  getMarkdown,
}: {
  markdownPath: string;
  sourceHref: string;
  getMarkdown: () => Promise<string>;
}) {
  const { copied, copy } = useClipboard();
  const { copied: linkCopied, copy: copyLink } = useClipboard();
  const [twin, setTwin] = useState<string | null>(null);
  const copyPage = useCallback(async () => copy(await getMarkdown()), [copy, getMarkdown]);
  const viewTwin = useCallback(async () => setTwin(await getMarkdown()), [getMarkdown]);
  const copyTwinLink = useCallback(
    () => copyLink(new URL(markdownPath, window.location.origin).href),
    [copyLink, markdownPath],
  );
  const openSource = useCallback(() => window.open(sourceHref, "_blank", "noopener"), [sourceHref]);
  const closeTwin = useCallback((open: boolean) => {
    if (!open) setTwin(null);
  }, []);

  return (
    <div className="flex items-center">
      <Button variant="outline" className="rounded-r-none" onClick={copyPage}>
        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {copied ? "Copied" : "Copy Page"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="icon-md"
              className="ml-[-1.5px] rounded-l-none"
              aria-label="More page actions"
            />
          }
        >
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={viewTwin}>
            <FileText />
            <DropdownMenuItemLabel>View as Markdown</DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyTwinLink}>
            {linkCopied ? <Check /> : <LinkIcon />}
            <DropdownMenuItemLabel>Copy Markdown Link</DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openSource}>
            <GithubMark />
            <DropdownMenuItemLabel>View Source</DropdownMenuItemLabel>
            <ExternalLink className="ml-auto" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={twin !== null} onOpenChange={closeTwin}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>{markdownPath}</DialogTitle>
          </DialogHeader>
          <DialogBody className="max-h-[70vh] overflow-y-auto">
            <CodeBlock>
              <CodeBlockHeader>
                <CodeBlockTitle>markdown</CodeBlockTitle>
                <CodeBlockActions>
                  <CodeCopyAction code={twin ?? ""} />
                </CodeBlockActions>
              </CodeBlockHeader>
              <CodeBlockBody>
                <pre className="overflow-x-auto p-4 font-mono text-mono-code whitespace-pre-wrap">
                  {twin}
                </pre>
              </CodeBlockBody>
            </CodeBlock>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Toc({ entries }: { entries: readonly TocEntry[] }) {
  if (entries.length === 0) return null;
  return (
    <nav
      aria-label="On this page"
      className="sticky top-8 hidden w-48 shrink-0 self-start xl:block"
    >
      <p className="mb-2 text-footnote font-bold text-foreground-hint">On this page</p>
      <ul className="flex flex-col gap-1.5 border-l border-line-hairline pl-3">
        {entries.map((entry) => (
          <li key={entry.id}>
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

export function DocLayout({
  eyebrow,
  title,
  summary,
  status,
  aliases,
  importLine,
  placeholder,
  plannedSource,
  markdownPath,
  sourceHref,
  getMarkdown,
  toc,
  children,
}: {
  eyebrow: string;
  title: string;
  summary?: string;
  status?: ComponentStatus;
  aliases?: readonly string[];
  importLine?: string;
  /** The page shows placeholder content until the English docs land. */
  placeholder?: boolean;
  /** Where the page's source will live, for pages not written yet. */
  plannedSource?: string;
  markdownPath: string;
  sourceHref: string;
  getMarkdown: () => Promise<string>;
  toc: readonly TocEntry[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1120px] gap-12 px-4 pt-8 pb-24 md:px-10 md:pt-10">
      <article className="min-w-0 max-w-[760px] flex-1">
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
          {status || aliases?.length ? (
            <div className="flex flex-wrap items-center gap-2 text-callout text-foreground-muted">
              {status ? <StatusLabel status={status} /> : null}
              {aliases?.length ? <span>Also called {aliases.join(", ")}</span> : null}
            </div>
          ) : null}
          {importLine ? (
            <CopyableCodeRoot size="sm" className="self-start">
              <CopyableCode>{importLine}</CopyableCode>
              <CopyableCodeAction aria-label="Copy import" />
            </CopyableCodeRoot>
          ) : null}
        </header>

        {placeholder ? (
          <Banner status="info" className="mb-8">
            <Info />
            <BannerTitle>Placeholder content</BannerTitle>
            <BannerDescription>
              This mock shows the page structure. The English text comes from the docs rewrite.
            </BannerDescription>
          </Banner>
        ) : null}
        {plannedSource ? (
          <Banner status="default" className="mb-8">
            <Info />
            <BannerTitle>Not written yet</BannerTitle>
            <BannerDescription>
              This page will render <code className="font-mono">{plannedSource}</code>. What you see
              below is generated without it.
            </BannerDescription>
          </Banner>
        ) : null}

        {children}
      </article>
      <Toc entries={toc} />
    </div>
  );
}
