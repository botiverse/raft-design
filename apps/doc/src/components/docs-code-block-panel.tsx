"use client";

import { Collapsible } from "@base-ui/react";
import { useState } from "react";

import { DocsCodeBlockBody } from "./docs-code-block-body.tsx";
import { DocsCodeBlockCollapse } from "./docs-code-block-collapse.tsx";
import { DocsCodeBlockContent } from "./docs-code-block-content.tsx";
import { DocsCodeBlockCopy } from "./docs-code-block-copy.tsx";
import { DocsCodeBlockHeader } from "./docs-code-block-header.tsx";
import { DocsCodeBlockPath } from "./docs-code-block-path.tsx";
import { DocsCodeBlockRoot } from "./docs-code-block-root.tsx";
import type { DocsCodeBlockPanelProps } from "./docs-code-block.types.ts";

export function DocsCodeBlockPanel({
  path,
  source,
  html,
  collapsedHtml,
  collapsible = true,
  showLineNumbers = false,
}: DocsCodeBlockPanelProps) {
  const [bodyOpen, setBodyOpen] = useState(true);

  if (!collapsible) {
    return (
      <DocsCodeBlockRoot showLineNumbers={showLineNumbers}>
        <DocsCodeBlockHeader showLineNumbers={showLineNumbers}>
          <DocsCodeBlockPath>{path}</DocsCodeBlockPath>
          <DocsCodeBlockCopy source={source} />
        </DocsCodeBlockHeader>
        <DocsCodeBlockBody showLineNumbers={showLineNumbers} source={source}>
          <DocsCodeBlockContent html={html} collapsedHtml={collapsedHtml} />
        </DocsCodeBlockBody>
      </DocsCodeBlockRoot>
    );
  }

  return (
    <DocsCodeBlockRoot showLineNumbers={showLineNumbers}>
      <Collapsible.Root open={bodyOpen} onOpenChange={setBodyOpen} className="contents">
        <DocsCodeBlockHeader showLineNumbers={showLineNumbers}>
          <DocsCodeBlockPath>{path}</DocsCodeBlockPath>
          <DocsCodeBlockCollapse open={bodyOpen} />
          <DocsCodeBlockCopy source={source} />
        </DocsCodeBlockHeader>
        <Collapsible.Panel className="contents">
          <DocsCodeBlockBody showLineNumbers={showLineNumbers} source={source}>
            <DocsCodeBlockContent html={html} collapsedHtml={collapsedHtml} />
          </DocsCodeBlockBody>
        </Collapsible.Panel>
      </Collapsible.Root>
    </DocsCodeBlockRoot>
  );
}
