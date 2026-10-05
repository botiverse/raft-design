"use client";

import { useCallback, useState } from "react";
import { Button } from "raft-ui";

import { isMarkdownMode } from "#/lib/markdown-mode.ts";
import { CodeBlock } from "./code-block.tsx";
import type { DocsCodeBlockContentProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockContent({ html, collapsedHtml }: DocsCodeBlockContentProps) {
  // Tracks the user's expand action only; whether imports are collapsible stays derived
  // from the prop so a later `collapsedHtml` change is never observed stale.
  const [expanded, setExpanded] = useState(false);
  const handleExpand = useCallback(() => setExpanded(true), []);

  // Markdown has no expand action: collapsing would hide the imports for good.
  if (collapsedHtml && !expanded && !isMarkdownMode()) {
    return (
      <div>
        <Button
          variant="link"
          size="sm"
          aria-expanded={expanded}
          onClick={handleExpand}
          className="mb-[1.625em] flex w-full justify-start font-mono"
        >
          {"<-- imports collapsed, click to expand -->"}
        </Button>
        <CodeBlock html={collapsedHtml} variant="docs" />
      </div>
    );
  }

  return <CodeBlock html={html} variant="docs" />;
}
