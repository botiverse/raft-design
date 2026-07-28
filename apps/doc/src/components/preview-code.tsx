import { Collapsible } from "@base-ui/react";
import { Button } from "raft-ui";
import { ChevronDown } from "lucide-react";

import { DocsCodeBlockBody } from "./docs-code-block-body.tsx";
import { DocsCodeBlockContent } from "./docs-code-block-content.tsx";
import { DocsCodeBlockRoot } from "./docs-code-block-root.tsx";
import type { PreviewCodeProps } from "./preview.types.ts";

export function PreviewCode({ html, collapsedHtml, codeBlock }: PreviewCodeProps) {
  return (
    <Collapsible.Root className="min-w-0">
      <div className="flex h-10 items-center justify-end px-6">
        <Button
          render={<Collapsible.Trigger />}
          variant="ghost"
          size="xs"
          className="text-foreground-placeholder hover:text-foreground-muted [&[data-panel-open]_svg]:rotate-180"
        >
          <span className="order-1">Code</span>
          <ChevronDown
            aria-hidden
            className="order-2 size-3 transition duration-200 ease-out"
            strokeWidth={1.5}
          />
        </Button>
      </div>
      <Collapsible.Panel className="min-w-0 border-t border-[oklch(0_0_0_/_0.06)]">
        {codeBlock ?? (
          <DocsCodeBlockRoot>
            <DocsCodeBlockBody showLineNumbers={false}>
              <DocsCodeBlockContent html={html} collapsedHtml={collapsedHtml} />
            </DocsCodeBlockBody>
          </DocsCodeBlockRoot>
        )}
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
