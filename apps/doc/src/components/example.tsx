import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react";
import { Button } from "@slock/ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { IconChevronDownOutline18 } from "nucleo-ui-outline-18";
import { ComponentDemoFrame } from "#/components/component-demo-frame.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";

type ExampleProps = {
  html: ReactNode | AnyRenderableServerComponent;
  collapsedHtml?: ReactNode | AnyRenderableServerComponent;
  children: ReactNode;
  previewClassName?: string;
};

/** A rendered demo above its Shiki-highlighted source. */
export function Example({ html, collapsedHtml, children, previewClassName }: ExampleProps) {
  return (
    <ComponentDemoFrame
      previewClassName={previewClassName}
      footer={
        <Collapsible.Root className="relative min-h-10">
          <Button
            render={<Collapsible.Trigger />}
            variant="ghost"
            size="xs"
            className="absolute top-1.5 right-6 z-10 text-foreground-placeholder hover:text-foreground-muted focus-visible:ring-1 [&[data-panel-open]_svg]:rotate-180"
          >
            <span className="order-1">Code</span>
            <IconChevronDownOutline18
              aria-hidden
              className="order-2 size-3 transition duration-200 ease-out"
              strokeWidth={1.5}
            />
          </Button>
          <Collapsible.Panel className="min-w-0">
            <DocsCodeBlock>
              <DocsCodeBlock.Body showLineNumbers={false}>
                <DocsCodeBlock.Content html={html} collapsedHtml={collapsedHtml} />
              </DocsCodeBlock.Body>
            </DocsCodeBlock>
          </Collapsible.Panel>
        </Collapsible.Root>
      }
      footerInset="flush"
      footerClassName="!border-t-0 has-[[data-open]]:bg-[oklch(0.986_0_0)]"
      footerTone="white"
    >
      {children}
    </ComponentDemoFrame>
  );
}
