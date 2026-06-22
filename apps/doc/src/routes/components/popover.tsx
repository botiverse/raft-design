import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
} from "@raft/ui";
import { Info, X } from "lucide-react";
import { IconGridCircleOutline18 } from "nucleo-ui-outline-18";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "details", title: "Details" },
  { id: "api", title: "API" },
] as const;

const TODOS = ["Keep trigger labels aligned with the panel's actual content."] as const;

type PlaygroundValues = {
  open: boolean;
};

const PANEL_BODY_SNIPPET = `    <PopoverHeader>
      <PopoverTitle>Usage notes</PopoverTitle>
      <PopoverClose aria-label="Close usage notes">
        <X />
      </PopoverClose>
    </PopoverHeader>
    <PopoverSeparator />
    <div className="grid gap-2 px-3 py-3 text-sm leading-6 text-foreground-muted [[data-theme=brutal]_&]:text-black">
      <p>Use #channel names, @people, or exact phrases to narrow results.</p>
      <p className="font-mono text-xs text-foreground/50">Try: #design "token audit"</p>
    </div>`;

const SNIPPETS = {
  anatomy: `import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
} from "@raft/ui";
import { Info, X } from "lucide-react";

<Popover>
  <PopoverTrigger render={<Button variant="outline" size="md" />}>
    <Info />
    Usage notes
  </PopoverTrigger>
  <PopoverContent className="min-w-[240px]">
${PANEL_BODY_SNIPPET}
  </PopoverContent>
</Popover>`,
  details: `<Popover open modal={false} triggerId="details-popover-trigger">
  <PopoverTrigger id="details-popover-trigger" render={<Button variant="outline" size="md" />}>
    Usage notes
  </PopoverTrigger>
  <PopoverContent className="min-w-[240px]">
${PANEL_BODY_SNIPPET}
  </PopoverContent>
</Popover>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "Popover",
    type: "Base UI Popover.Root.Props",
    description: "Owns open state, Escape, outside press, focus handoff, and modal behavior.",
  },
  {
    name: "PopoverTrigger",
    type: "Base UI Popover.Trigger.Props",
    description: "Trigger part. Compose custom controls with Base UI's render prop.",
  },
  {
    name: "PopoverContent",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled floating panel. Defaults to side=bottom, align=start, sideOffset=4, disableAnchorTracking=true, and forwards anchor/collision/sticky/inline-side positioning props.",
  },
  {
    name: "PopoverPopup",
    type: "div props",
    description: "Static panel shell for docs previews and non-portaled comparison panes.",
  },
  {
    name: "PopoverHeader",
    type: "div props",
    description: "Panel header layout for title, description, and close actions.",
  },
  {
    name: "PopoverSeparator",
    type: "div props",
    description: "Optional horizontal separator. Compose it where the content needs a division.",
  },
  {
    name: "PopoverTitle",
    type: "Base UI Popover.Title.Props",
    description: "Accessible panel heading.",
  },
  {
    name: "PopoverDescription",
    type: "Base UI Popover.Description.Props",
    description: "Accessible supporting copy for the panel.",
  },
  {
    name: "PopoverClose",
    type: "Base UI Popover.Close.Props",
    description: "Closes the popover. Compose your own visual affordance with render/className.",
  },
  {
    name: "PopoverViewport",
    type: "Base UI Popover.Viewport.Props",
    description:
      "Optional transition viewport for one popover whose content changes between multiple triggers.",
  },
];

export const Route = createFileRoute("/components/popover")({
  component: PopoverDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function OpenPopoverExample({
  triggerId,
  label,
  children,
  contentClassName = "min-w-[240px]",
}: {
  triggerId: string;
  label: string;
  children: ReactNode;
  contentClassName?: string;
}) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Popover open modal={false} triggerId={triggerId}>
        <PopoverTrigger id={triggerId} render={<Button variant="outline" size="md" />}>
          {label}
        </PopoverTrigger>
        <PopoverContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className={contentClassName}
        >
          {children}
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PopoverPanelBody() {
  return (
    <>
      <PopoverHeader>
        <PopoverTitle>Usage notes</PopoverTitle>
        <PopoverClose aria-label="Close usage notes" className="[&_svg]:size-3">
          <X />
        </PopoverClose>
      </PopoverHeader>
      <PopoverSeparator />
      <div className="grid gap-2 px-3 py-3 text-sm leading-6 text-foreground-muted [[data-theme=brutal]_&]:text-black">
        <p>Use channel names, people, and exact phrases to narrow message history.</p>
        <div className="grid gap-1 rounded-sm bg-foreground/[0.04] px-2 py-2 font-mono text-xs text-foreground/60 [[data-theme=brutal]_&]:rounded-none [[data-theme=brutal]_&]:border [[data-theme=brutal]_&]:border-black/10 [[data-theme=brutal]_&]:bg-brutal-yellow/20 [[data-theme=brutal]_&]:text-black/70">
          <span>#design "token audit"</span>
          <span>@atlas migration notes</span>
        </div>
      </div>
    </>
  );
}

function SearchGuidePreview({ open }: { open: boolean }) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <Popover open={open} modal={false} triggerId="preview-popover-trigger">
        <PopoverTrigger
          id="preview-popover-trigger"
          render={<Button variant="outline" size="md" />}
        >
          <Info size={18} />
          Usage notes
        </PopoverTrigger>
        <PopoverContent
          initialFocus={false}
          finalFocus={false}
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="min-w-[240px]"
        >
          <PopoverPanelBody />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PopoverDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Popover"
      description="A trigger-positioned floating panel for arbitrary composed content."
      headerAction={
        <Button
          render={<a href="/components/popover/matrix" target="_blank" rel="noreferrer" />}
          variant="ghost"
          size="sm"
        >
          Matrix
          <IconGridCircleOutline18 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
      sectionDividers={false}
    >
      <DocSection id="todo" title="Todo">
        <TodoList items={TODOS} />
      </DocSection>

      <DocSection id="preview" title="Preview">
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview keeps the surface to one trigger and its supporting guidance panel.
        </p>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            open: true,
          }}
          controls={[{ name: "open", label: "Open", type: "boolean" }]}
          previewClassName="min-h-[24rem] items-start pt-24"
          render={(values) => <SearchGuidePreview open={values.open} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="Popover.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="details" title="Details">
        <Example html={code.details} previewClassName="min-h-[18rem] items-start pt-28">
          <OpenPopoverExample triggerId="details-popover-trigger" label="Usage notes">
            <PopoverPanelBody />
          </OpenPopoverExample>
        </Example>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
