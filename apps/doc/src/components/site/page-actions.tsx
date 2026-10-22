import { useCallback, useState } from "react";
import { useClipboard } from "foxact/use-clipboard";
import { Check, ChevronDown, Copy, ExternalLink, FileText, Link as LinkIcon } from "lucide-react";
import {
  Button,
  CodeBlock,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockHeader,
  CodeBlockTitle,
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
} from "@botiverse/raft-ui";

import { GithubMark } from "#/components/github-mark.tsx";
import { CodeCopyAction } from "#/lib/code-block/code-copy-action.tsx";
import { useMessages } from "#/lib/i18n/use-locale.ts";

/**
 * Copy Page copies the page's Markdown twin, the same text served at the page
 * path plus `.md`. The menu views it, copies its URL or opens the source file.
 */
export function PageActions({
  markdownPath,
  sourceHref,
  getMarkdown,
}: {
  /** `/foundations/color.md` */
  markdownPath: string;
  sourceHref: string;
  getMarkdown: () => Promise<string>;
}) {
  const messages = useMessages();
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
    <div className="flex shrink-0 items-center">
      <Button variant="default" className="rounded-r-none" onClick={copyPage}>
        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {copied ? messages.copied : messages.copyPage}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="default"
              size="icon-md"
              className="ml-[-1.5px] rounded-l-none"
              aria-label={messages.morePageActions}
            />
          }
        >
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={viewTwin}>
            <FileText />
            <DropdownMenuItemLabel>{messages.viewAsMarkdown}</DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={copyTwinLink}>
            {linkCopied ? <Check /> : <LinkIcon />}
            <DropdownMenuItemLabel>{messages.copyMarkdownLink}</DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={openSource}>
            <GithubMark />
            <DropdownMenuItemLabel>{messages.viewSource}</DropdownMenuItemLabel>
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
