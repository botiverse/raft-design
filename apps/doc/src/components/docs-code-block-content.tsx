"use client";

import { useState } from "react";

import { CodeBlock } from "./code-block.tsx";
import type { DocsCodeBlockContentProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockContent({ html, collapsedHtml }: DocsCodeBlockContentProps) {
  // Tracks the user's expand action only; whether imports are collapsible stays derived
  // from the prop so a later `collapsedHtml` change is never observed stale.
  const [expanded, setExpanded] = useState(false);

  if (collapsedHtml && !expanded) {
    return (
      <div>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded(true)}
          className="mb-[1.625em] block w-full cursor-pointer text-left font-mono text-sm leading-relaxed text-[oklch(0.50_0.02_106.42)] hover:text-foreground-muted"
        >
          {"<-- imports collapsed, click to expand -->"}
        </button>
        <CodeBlock html={collapsedHtml} variant="docs" />
      </div>
    );
  }

  return <CodeBlock html={html} variant="docs" />;
}
