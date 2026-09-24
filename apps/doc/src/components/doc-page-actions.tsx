"use client";

import { useClipboard } from "foxact/use-clipboard";
import { Check, ChevronDown, Copy, FileText, Link } from "lucide-react";
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
  const page = useClipboard();
  const link = useClipboard();

  if (!markdownPath) {
    return sourceHref ? <GithubButton href={sourceHref} /> : null;
  }

  const markdownUrl = () => new URL(markdownPath, window.location.origin).href;

  const copyPage = async () => {
    const response = await fetch(markdownPath);
    if (response.ok) await page.copy(await response.text());
  };

  return (
    <div className="flex items-center gap-1">
      <Button type="button" variant="outline" size="sm" onClick={() => void copyPage()}>
        {page.copied ? <Check /> : <Copy />}
        {page.copied ? "Copied" : "Copy page"}
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
          <DropdownMenuItem closeOnClick={false} onClick={() => void link.copy(markdownUrl())}>
            {link.copied ? <Check /> : <Link />}
            <DropdownMenuItemLabel>
              {link.copied ? "Link copied" : "Copy Markdown link"}
            </DropdownMenuItemLabel>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(markdownPath, "_blank", "noopener")}>
            <FileText />
            <DropdownMenuItemLabel>View as Markdown</DropdownMenuItemLabel>
          </DropdownMenuItem>
          {sourceHref ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.open(sourceHref, "_blank", "noopener")}>
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
