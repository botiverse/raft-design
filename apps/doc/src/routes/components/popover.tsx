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
} from "raft-ui";
import { Info, X } from "lucide-react";
import type { ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
] as const;
const PANEL_BODY_SNIPPET = `    <PopoverHeader>
      <PopoverTitle>Usage notes</PopoverTitle>
      <PopoverClose aria-label="Close usage notes" className="[&_svg]:size-3">
        <X />
      </PopoverClose>
    </PopoverHeader>
    <PopoverSeparator />
    <div className="grid gap-2 px-3 py-3 text-sm leading-6 text-foreground-muted">
      <p>Use channel names, people, and exact phrases to narrow message history.</p>
      <div className="grid gap-1 rounded-sm bg-foreground-strong/[0.04] px-2 py-2 font-mono text-xs text-foreground-strong/60">
        <span>#design "token audit"</span>
        <span>@atlas migration notes</span>
      </div>
    </div>`;

const SNIPPETS = {
  preview: `<Popover modal={false}>
  <PopoverTrigger render={<Button variant="outline" size="md" />}>
    <Info size={18} />
    Usage notes
  </PopoverTrigger>
  <PopoverContent className="min-w-[240px]" align="center">
${PANEL_BODY_SNIPPET}
  </PopoverContent>
</Popover>`,
  anatomy: `import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
} from "raft-ui";

<Popover>
  <PopoverTrigger />
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle />
      <PopoverClose />
    </PopoverHeader>
    <PopoverSeparator />
  </PopoverContent>
</Popover>`,
  details: `<Popover modal={false} triggerId="details-popover-trigger">
  <PopoverTrigger id="details-popover-trigger" render={<Button variant="outline" size="md" />}>
    Usage notes
  </PopoverTrigger>
  <PopoverContent className="min-w-[240px]" align="center">
${PANEL_BODY_SNIPPET}
  </PopoverContent>
</Popover>`,
} as const;

const POPOVER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Root.Props",
    description: "Owns open state, Escape, outside press, focus handoff, and modal behavior.",
  },
];

const POPOVER_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Trigger.Props",
    description: "Trigger part. Compose custom controls with Base UI's render prop.",
  },
];

const POPOVER_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled floating panel. Defaults to side=bottom, align=start, sideOffset=4, disableAnchorTracking=true, and forwards anchor/collision/sticky/inline-side positioning props.",
  },
];

const POPOVER_POPUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Static panel shell for docs previews and non-portaled comparison panes.",
  },
];

const POPOVER_PORTAL_PROPS: readonly PropRow[] = [
  {
    name: "container",
    type: "HTMLElement | RefObject | null",
    description: "Custom portal container for framed previews or contained overlays.",
  },
  {
    name: "...props",
    type: "Base UI Popover.Portal.Props",
    description: "Portals the popup to the body or a custom container.",
  },
];

const POPOVER_ARROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Arrow.Props",
    description: "Optional arrow pointing at the trigger. Compose inside PopoverContent.",
  },
];

const POPOVER_BACKDROP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Backdrop.Props",
    description: "Modal backdrop shown while a modal popover is open.",
  },
];

const POPOVER_VIEWPORT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Viewport.Props",
    description:
      "Optional transition viewport for one popover whose content changes between multiple triggers.",
  },
];

const POPOVER_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Panel header layout for title, description, and close actions.",
  },
];

const POPOVER_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Optional horizontal separator. Compose it where the content needs a division.",
  },
];

const POPOVER_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Title.Props",
    description: "Accessible panel heading.",
  },
];

const POPOVER_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Description.Props",
    description: "Accessible supporting copy for the panel.",
  },
];

const POPOVER_CLOSE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popover.Close.Props",
    description: "Closes the popover. Compose your own visual affordance with render/className.",
  },
];

export const Route = createFileRoute("/components/popover")({
  component: PopoverDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
      },
    }),
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
  return (
    <div className="relative flex justify-center">
      <Popover modal={false} triggerId={triggerId}>
        <PopoverTrigger id={triggerId} render={<Button variant="outline" size="md" />}>
          {label}
        </PopoverTrigger>
        <PopoverContent
          initialFocus={false}
          finalFocus={false}
          align="center"
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
      <div className="grid gap-2 px-3 py-3 text-sm leading-6 text-foreground-muted">
        <p>Use channel names, people, and exact phrases to narrow message history.</p>
        <div className="grid gap-1 rounded-sm bg-foreground-strong/4 px-2 py-2 font-mono text-xs text-foreground-strong/60">
          <span>#design "token audit"</span>
          <span>@atlas migration notes</span>
        </div>
      </div>
    </>
  );
}

function SearchGuidePreview() {
  return (
    <div className="relative flex justify-center">
      <Popover modal={false} triggerId="preview-popover-trigger">
        <PopoverTrigger
          id="preview-popover-trigger"
          render={<Button variant="outline" size="md" />}
        >
          <Info size={18} />
          Usage notes
        </PopoverTrigger>
        <PopoverContent
          align="center"
          initialFocus={false}
          finalFocus={false}
          className="min-w-[240px]"
        >
          <PopoverPanelBody />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function PopoverPreview({ code }: { code: ReturnType<typeof Route.useLoaderData>["preview"] }) {
  return (
    <Preview previewClassName="min-h-[24rem] items-start pt-24">
      <Preview.Canvas>
        <SearchGuidePreview />
      </Preview.Canvas>
      <Preview.Code html={code} />
    </Preview>
  );
}

function PopoverDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Popover"
      description="A trigger-positioned floating panel for arbitrary composed content."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Preview keeps the surface to one trigger and its supporting guidance panel.
        </p>
        <PopoverPreview code={code.preview} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="details" title="Details">
          <Preview previewClassName="min-h-[18rem] items-start pt-28">
            <Preview.Canvas>
              <OpenPopoverExample triggerId="details-popover-trigger" label="Usage notes">
                <PopoverPanelBody />
              </OpenPopoverExample>
            </Preview.Canvas>
            <Preview.Code html={code.details} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-popover" title="Popover">
            <PropsTable rows={POPOVER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-trigger" title="PopoverTrigger">
            <PropsTable rows={POPOVER_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-content" title="PopoverContent">
            <PropsTable rows={POPOVER_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-portal" title="PopoverPortal">
            <PropsTable rows={POPOVER_PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-popup" title="PopoverPopup">
            <PropsTable rows={POPOVER_POPUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-arrow" title="PopoverArrow">
            <PropsTable rows={POPOVER_ARROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-backdrop" title="PopoverBackdrop">
            <PropsTable rows={POPOVER_BACKDROP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-viewport" title="PopoverViewport">
            <PropsTable rows={POPOVER_VIEWPORT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-header" title="PopoverHeader">
            <PropsTable rows={POPOVER_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-separator" title="PopoverSeparator">
            <PropsTable rows={POPOVER_SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-title" title="PopoverTitle">
            <PropsTable rows={POPOVER_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-description" title="PopoverDescription">
            <PropsTable rows={POPOVER_DESCRIPTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-popover-close" title="PopoverClose">
            <PropsTable rows={POPOVER_CLOSE_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
