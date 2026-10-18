import { Collapsible } from "@base-ui/react";
import { Button } from "raft-ui";
import { ChevronDown } from "lucide-react";

import { DocsCodeBlockBody } from "./docs-code-block-body.tsx";
import { DocsCodeBlockContent } from "./docs-code-block-content.tsx";
import { DocsCodeBlockRoot } from "./docs-code-block-root.tsx";
import { isMarkdownMode } from "#/lib/markdown-mode.ts";
import type { PreviewCodeProps } from "./preview.types.ts";

export function PreviewCode({ html, collapsedHtml, codeBlock }: PreviewCodeProps) {
  const content = codeBlock ?? (
    <DocsCodeBlockRoot>
      <DocsCodeBlockBody showLineNumbers={false}>
        <DocsCodeBlockContent html={html} collapsedHtml={collapsedHtml} />
      </DocsCodeBlockBody>
    </DocsCodeBlockRoot>
  );

  // The disclosure is an affordance, not content: in Markdown its trigger would
  // render as a bare "Code" line above every block.
  if (isMarkdownMode()) return content;

  return (
    <Collapsible.Root className="min-w-0">
      <div className="flex h-10 items-center justify-end px-6">
        <Button
          render={<Collapsible.Trigger />}
          variant="ghost"
          size="xs"
          className="text-foreground-hint hover:text-foreground-muted [&[data-panel-open]_svg]:rotate-180"
        >
          <span className="order-1">Code</span>
          <ChevronDown
            aria-hidden
            className="order-2 size-3 transition duration-200 ease-out"
            strokeWidth={1.5}
          />
        </Button>
      </div>
      <Collapsible.Panel
        keepMounted={isMarkdownMode() || undefined}
        className="min-w-0 border-t border-[oklch(0_0_0/0.06)] dark:border-transparent"
      >
        {content}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
