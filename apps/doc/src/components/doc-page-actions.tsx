"use client";

import { useClipboard } from "foxact/use-clipboard";
import { Check, ChevronDown, Copy, FileText, Link } from "lucide-react";
import { useCallback } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "raft-ui";

import { GithubMark } from "./github-mark.tsx";

type DocPageActionsProps = {
  /** `/components/button.md`, or null when the page has no Markdown twin. */
  markdownPath: string | null;
  sourceHref: string | null;
};

/**
 * Header actions for a docs page: copy it as Markdown for an LLM, share its
 * Markdown URL, or jump to the source. Pages without a Markdown twin keep the
 * plain GitHub link.
 */
export function DocPageActions({ markdownPath, sourceHref }: DocPageActionsProps) {
  if (!markdownPath) {
    return sourceHref ? <GithubButton href={sourceHref} /> : null;
  }

  return <MarkdownPageActions markdownPath={markdownPath} sourceHref={sourceHref} />;
}

function MarkdownPageActions({
  markdownPath,
  sourceHref,
}: DocPageActionsProps & { markdownPath: string }) {
  const { copied: pageCopied, copy: copyPage } = useClipboard();
  const { copied: linkCopied, copy: copyLink } = useClipboard();

  const handleCopyPage = useCallback(async () => {
    const response = await fetch(markdownPath);
    if (response.ok) await copyPage(await response.text());
  }, [markdownPath, copyPage]);

  const handleCopyLink = useCallback(() => {
    void copyLink(new URL(markdownPath, window.location.origin).href);
  }, [markdownPath, copyLink]);

  const handleViewMarkdown = useCallback(() => {
    window.open(markdownPath, "_blank", "noopener");
  }, [markdownPath]);

  const handleOpenSource = useCallback(() => {
    if (sourceHref) window.open(sourceHref, "_blank", "noopener");
  }, [sourceHref]);

  return (
    <div className="flex items-center gap-1">
      <Button type="button" variant="outline" size="sm" onClick={handleCopyPage}>
        {pageCopied ? <Check /> : <Copy />}
        {pageCopied ? "Copied" : "Copy page"}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button type="button" variant="outline" size="icon-sm" aria-label="More page actions">
              <ChevronDown />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuItem closeOnClick={false} onClick={handleCopyLink}>
            {linkCopied ? <Check /> : <Link />}
            <DropdownMenuItemLabel>
              {linkCopied ? "Link copied" : "Copy Markdown link"}
            </DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewMarkdown}>
            <FileText />
            <DropdownMenuItemLabel>View as Markdown</DropdownMenuItemLabel>
          </DropdownMenuItem>
          {sourceHref ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleOpenSource}>
                <GithubMark />
                <DropdownMenuItemLabel>Open on GitHub</DropdownMenuItemLabel>
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function GithubButton({ href }: { href: string }) {
  return (
    <Button variant="outline" size="sm" render={<a href={href} target="_blank" rel="noreferrer" />}>
      <GithubMark />
      GitHub
    </Button>
  );
}
