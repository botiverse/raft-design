import type { ReactNode } from "react";
import { Collapsible } from "@base-ui/react";
import { Button } from "@slock/ui";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";
import { IconChevronDownOutline18 } from "nucleo-ui-outline-18";
import { CodeBlock } from "#/components/code-block.tsx";
import { ComponentDemoFrame } from "#/components/component-demo-frame.tsx";

type ExampleProps = {
  html: ReactNode | AnyRenderableServerComponent;
  children: ReactNode;
};

/** A rendered demo above its Shiki-highlighted source. */
export function Example({ html, children }: ExampleProps) {
  return (
    <ComponentDemoFrame
      footer={
        <Collapsible.Root className="grid grid-cols-[minmax(0,1fr)_max-content] items-start gap-4 pt-3.5 pb-3.5">
          <Button
            render={<Collapsible.Trigger />}
            variant="ghost"
            size="xs"
            className="col-start-2 row-start-1 text-foreground-placeholder hover:text-foreground-muted focus-visible:ring-1 [&[data-panel-open]_svg]:rotate-180"
          >
            <span className="order-1">Code</span>
            <IconChevronDownOutline18
              aria-hidden
              className="order-2 size-3 transition duration-200 ease-out"
              strokeWidth={1.5}
            />
          </Button>
          <Collapsible.Panel className="col-start-1 row-start-1 min-w-0">
            <div className="bg-[oklch(0.986_0_0)]">
              <CodeBlock html={html} variant="embedded" />
            </div>
          </Collapsible.Panel>
        </Collapsible.Root>
      }
      footerInset="flush"
      footerClassName="border-t-transparent has-[[data-open]]:border-t-[oklch(0_0_0_/_0.10)] has-[[data-open]]:bg-[oklch(0.986_0_0)]"
      footerTone="white"
    >
      {children}
    </ComponentDemoFrame>
  );
}
