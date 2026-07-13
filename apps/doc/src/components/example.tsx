import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react";
import { Button } from "raft-ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { ChevronDown } from "lucide-react";
import { ComponentDemoFrame } from "#/components/component-demo-frame.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import type { PreviewMode } from "#/components/preview-theme.tsx";
import type { Theme } from "raft-ui";

type ExampleProps = {
  html?: ReactNode | AnyRenderableServerComponent;
  collapsedHtml?: ReactNode | AnyRenderableServerComponent;
  codeBlock?: ReactNode;
  children: ReactNode;
  previewClassName?: string;
  previewInset?: "default" | "flush";
  previewTheme?: Theme;
  previewMode?: PreviewMode;
};

/** A rendered demo above its Shiki-highlighted source. */
export function Example({
  html,
  collapsedHtml,
  codeBlock,
  children,
  previewClassName,
  previewInset,
  previewTheme,
  previewMode,
}: ExampleProps) {
  return (
    <ComponentDemoFrame
      previewClassName={previewClassName}
      previewInset={previewInset}
      previewTheme={previewTheme}
      previewMode={previewMode}
      footer={
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
              <DocsCodeBlock>
                <DocsCodeBlock.Body showLineNumbers={false}>
                  <DocsCodeBlock.Content html={html} collapsedHtml={collapsedHtml} />
                </DocsCodeBlock.Body>
              </DocsCodeBlock>
            )}
          </Collapsible.Panel>
        </Collapsible.Root>
      }
      footerInset="flush"
    >
      {children}
    </ComponentDemoFrame>
  );
}
