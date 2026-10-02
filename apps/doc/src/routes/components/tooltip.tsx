import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  InlineCode,
  Kbd,
  Status,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import { Bell, Bookmark, Info, MessageSquare, SmilePlus } from "lucide-react";
import { useCallback, useId, useState } from "react";
import type { ReactNode } from "react";

import { DocNote } from "#/components/doc-note.tsx";
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

const PREVIEW_SIDES = ["top", "right", "bottom", "left"] as const;

type PlaygroundValues = {
  side: (typeof PREVIEW_SIDES)[number];
  label: string;
};

const SNIPPETS = {
  preview: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";
import { SmilePlus } from "lucide-react";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}>
      <SmilePlus />
    </TooltipTrigger>
    <TooltipContent>Add reaction</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  anatomy: `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger />
    <TooltipContent />
  </Tooltip>
</TooltipProvider>`,
  usageActions: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";
import { Bookmark, MessageSquare, SmilePlus } from "lucide-react";

<TooltipProvider>
  <div className="flex items-center gap-2">
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Reply in thread" />}>
        <MessageSquare />
      </TooltipTrigger>
      <TooltipContent>Reply in thread</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}>
        <SmilePlus />
      </TooltipTrigger>
      <TooltipContent>Add reaction</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Save message" />}>
        <Bookmark />
      </TooltipTrigger>
      <TooltipContent>Save message</TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>`,
  usageStatus: `import { Status, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger
      render={
        <span tabIndex={0} aria-label="Agent is thinking" className="inline-flex items-center gap-2" />
      }
    >
      <Status variant="primary" pulse aria-hidden />
      Thinking
    </TooltipTrigger>
    <TooltipContent>Agent is thinking</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  usageIconContent: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";
import { Info } from "lucide-react";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline" size="sm" />}>
      Permission
    </TooltipTrigger>
    <TooltipContent>
      <Info aria-hidden />
      Only admins can change this
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  usageLongText: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline" size="sm" />}>
      Source path
    </TooltipTrigger>
    <TooltipContent>packages/web/src/components/message/MessageItem.tsx:695</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  usageLongIconContent: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";
import { Info } from "lucide-react";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="outline" size="sm" />}>
      Source path
    </TooltipTrigger>
    <TooltipContent>
      <Info aria-hidden />
      packages/web/src/components/message/MessageItem.tsx:695
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  usageTimestamp: `import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<time dateTime="2026-06-23T09:30:00+08:00" tabIndex={0} />}>
      Today at 09:30
    </TooltipTrigger>
    <TooltipContent>Jun 23, 2026, 09:30</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  usageShortcut: `import { Button, Kbd, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";
import { Info } from "lucide-react";

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Shortcut help" />}>
      <Info />
    </TooltipTrigger>
    <TooltipContent>
      Open command menu
      <Kbd>Cmd K</Kbd>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>`,
  usagePlacement: `import { Button, Status, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";
import { SmilePlus } from "lucide-react";

<TooltipProvider>
  <div className="grid grid-cols-2 gap-x-28 gap-y-20">
    <Tooltip open triggerId="tooltip-top">
      <TooltipTrigger
        id="tooltip-top"
        render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}
      >
        <SmilePlus />
      </TooltipTrigger>
      <TooltipContent side="top">Top</TooltipContent>
    </Tooltip>
    <Tooltip open triggerId="tooltip-right">
      <TooltipTrigger id="tooltip-right" render={<Button variant="outline" size="sm" />}>
        Permission
      </TooltipTrigger>
      <TooltipContent side="right">Right</TooltipContent>
    </Tooltip>
    <Tooltip open triggerId="tooltip-left">
      <TooltipTrigger
        id="tooltip-left"
        render={
          <span
            tabIndex={0}
            className="inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium"
          />
        }
      >
        <Status variant="primary" pulse aria-hidden />
        Thinking
      </TooltipTrigger>
      <TooltipContent side="left">Left</TooltipContent>
    </Tooltip>
    <Tooltip open triggerId="tooltip-bottom">
      <TooltipTrigger
        id="tooltip-bottom"
        render={
          <time
            dateTime="2026-06-23T09:30:00+08:00"
            tabIndex={0}
            className="rounded-sm px-1 py-0.5 font-mono text-xs text-foreground-muted"
          />
        }
      >
        09:30
      </TooltipTrigger>
      <TooltipContent side="bottom">Bottom</TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>`,
  usageCollision: `import { Button, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "raft-ui";

<TooltipProvider>
  {/* Tooltip defaults to collisionAvoidance={{ side: "flip", align: "shift" }}.
      When an edge prevents rendering on the requested side, it automatically
      flips to the opposite side and shifts along the alignment axis to stay visible. */}
  <div className="relative flex h-80 w-full flex-col justify-between rounded-lg border border-dashed border-line p-4">
    {/* Top edge: requested side="top" flips to bottom */}
    <div className="flex items-start justify-between">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Top Left
        </TooltipTrigger>
        <TooltipContent side="top">
          side="top" → flips to bottom, shifts right
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Top Edge
        </TooltipTrigger>
        <TooltipContent side="top">
          side="top" → flips to bottom
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Top Right
        </TooltipTrigger>
        <TooltipContent side="top">
          side="top" → flips to bottom, shifts left
        </TooltipContent>
      </Tooltip>
    </div>

    {/* Side edges: left flips to right, right flips to left */}
    <div className="flex items-center justify-between">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Left Edge
        </TooltipTrigger>
        <TooltipContent side="left">
          side="left" → flips to right
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Right Edge
        </TooltipTrigger>
        <TooltipContent side="right">
          side="right" → flips to left
        </TooltipContent>
      </Tooltip>
    </div>

    {/* Bottom edge: requested side="bottom" flips to top */}
    <div className="flex items-end justify-between">
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Bottom Left
        </TooltipTrigger>
        <TooltipContent side="bottom">
          side="bottom" → flips to top, shifts right
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Bottom Edge
        </TooltipTrigger>
        <TooltipContent side="bottom">
          side="bottom" → flips to top
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="sm" />}>
          Bottom Right
        </TooltipTrigger>
        <TooltipContent side="bottom">
          side="bottom" → flips to top, shifts left
        </TooltipContent>
      </Tooltip>
    </div>
  </div>
</TooltipProvider>`,
} as const;

const TOOLTIP_PROVIDER_PROPS: readonly PropRow[] = [
  {
    name: "delay",
    type: "number",
    default: "0",
    description: "Shared open delay in milliseconds. Raft defaults this to immediate hints.",
  },
  {
    name: "closeDelay",
    type: "number",
    description: "Shared close delay in milliseconds.",
  },
  {
    name: "timeout",
    type: "number",
    default: "400",
    description: "Window where adjacent tooltips open instantly after another tooltip closes.",
  },
];

const TOOLTIP_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "open",
    type: "boolean",
    description: "Controlled open state. Pair with onOpenChange.",
  },
  {
    name: "defaultOpen",
    type: "boolean",
    default: "false",
    description: "Initial open state for uncontrolled usage.",
  },
  {
    name: "onOpenChange",
    type: "(open, eventDetails) => void",
    description: "Called when hover, focus, press, escape, or disabled state changes visibility.",
  },
  {
    name: "disabled",
    type: "boolean",
    default: "false",
    description: "Prevents the tooltip from opening.",
  },
  {
    name: "disableHoverablePopup",
    type: "boolean",
    default: "false",
    description: "When true, the popup cannot be hovered without closing.",
  },
  {
    name: "trackCursorAxis",
    type: '"none" | "x" | "y" | "both"',
    default: '"none"',
    description: "Moves the tooltip with the cursor when cursor tracking is needed.",
  },
];

const TOOLTIP_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "render",
    type: "ReactElement | (props, state) => ReactElement",
    description: "Compose the trigger with Button, time, span, or another focusable element.",
  },
  {
    name: "delay",
    type: "number",
    description: "Per-trigger open delay override in milliseconds.",
  },
  {
    name: "closeDelay",
    type: "number",
    description: "Per-trigger close delay override in milliseconds.",
  },
  {
    name: "payload",
    type: "unknown",
    description: "Payload passed to render-function tooltip content when using shared handles.",
  },
  {
    name: "...props",
    type: "Base UI Tooltip.Trigger.Props",
    description: "Native button props plus Base UI trigger behavior.",
  },
];

const TOOLTIP_PORTAL_PROPS: readonly PropRow[] = [
  {
    name: "container",
    type: "HTMLElement | RefObject | null",
    description: "Custom portal container for framed previews or contained overlays.",
  },
  {
    name: "...props",
    type: "Base UI Tooltip.Portal.Props",
    description: "Portals the tooltip to the body or a custom container.",
  },
];

const TOOLTIP_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "side",
    type: '"top" | "bottom" | "left" | "right" | "inline-start" | "inline-end"',
    default: '"top"',
    description: "Preferred side. Tooltip shifts within that side instead of flipping position.",
  },
  {
    name: "align",
    type: '"start" | "center" | "end"',
    default: '"center"',
    description: "Alignment against the trigger.",
  },
  {
    name: "sideOffset",
    type: "number",
    default: "8 elegant, 6 brutal",
    description: "Distance from the trigger edge, passed to Base UI Positioner.",
  },
  {
    name: "alignOffset",
    type: "number",
    default: "0",
    description: "Distance along the aligned axis, passed to Base UI Positioner.",
  },
  {
    name: "portalProps",
    type: "TooltipPortalProps",
    description: "Portal options, including a custom container for framed previews or overlays.",
  },
  {
    name: "...props",
    type: "Base UI Tooltip.Popup.Props",
    description: "Popup attributes and event handlers.",
  },
];

export const Route = createFileRoute("/components/tooltip")({
  component: TooltipDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function TooltipFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "relative flex min-h-36 w-full items-center justify-center overflow-hidden px-4 py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}

function TooltipExample({
  children,
  content,
  frameClassName,
  open = false,
}: {
  children: (triggerId: string) => ReactNode;
  content: ReactNode;
  frameClassName?: string;
  open?: boolean;
}) {
  const triggerId = useId();

  return (
    <TooltipFrame className={frameClassName}>
      <TooltipProvider>
        <Tooltip {...(open ? { open: true, triggerId } : {})}>
          {children(triggerId)}
          <TooltipContent>{content}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TooltipFrame>
  );
}

function TooltipPreviewCanvas({ label, side }: PlaygroundValues) {
  const triggerId = useId();
  const content = label.trim() || "Tooltip";

  return (
    <TooltipProvider>
      <Tooltip open triggerId={triggerId}>
        <TooltipTrigger
          id={triggerId}
          render={<Button variant="ghost" size="icon-sm" aria-label={content} />}
        >
          <SmilePlus />
        </TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function TooltipPreview({
  code,
  collapsedCode,
}: {
  code: ReturnType<typeof Route.useLoaderData>["preview"];
  collapsedCode?: ReturnType<typeof Route.useLoaderData>["previewBody"];
}) {
  const [side, setSide] = useState<(typeof PREVIEW_SIDES)[number]>("top");
  const [label, setLabel] = useState("Add reaction");
  const handleSideChange = useCallback(
    (value: string) => setSide(value as (typeof PREVIEW_SIDES)[number]),
    [],
  );

  return (
    <Preview>
      <Preview.Canvas>
        <TooltipPreviewCanvas side={side} label={label} />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Side" htmlFor="tooltip-preview-side">
          <Preview.Select
            id="tooltip-preview-side"
            label="Side"
            options={PREVIEW_SIDES}
            value={side}
            onValueChange={handleSideChange}
          />
        </Preview.Control>
        <Preview.Control label="Label" htmlFor="tooltip-preview-label">
          <Preview.Text
            id="tooltip-preview-label"
            label="Label"
            value={label}
            onValueChange={setLabel}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

function ActionClusterExample() {
  return (
    <TooltipFrame>
      <TooltipProvider>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Reply in thread" />}
            >
              <MessageSquare />
            </TooltipTrigger>
            <TooltipContent>Reply in thread</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}
            >
              <SmilePlus />
            </TooltipTrigger>
            <TooltipContent>Add reaction</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Save message" />}
            >
              <Bookmark />
            </TooltipTrigger>
            <TooltipContent>Save message</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon-sm" aria-label="Mute thread" />}
            >
              <Bell />
            </TooltipTrigger>
            <TooltipContent>Mute thread</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </TooltipFrame>
  );
}

function ArrowPlacementExample() {
  const topId = useId();
  const rightId = useId();
  const leftId = useId();
  const bottomId = useId();

  return (
    <TooltipFrame className="min-h-64 px-10 py-16">
      <TooltipProvider>
        <div className="grid grid-cols-2 gap-x-28 gap-y-20">
          <Tooltip open triggerId={topId}>
            <TooltipTrigger
              id={topId}
              render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}
            >
              <SmilePlus />
            </TooltipTrigger>
            <TooltipContent side="top">Top</TooltipContent>
          </Tooltip>
          <Tooltip open triggerId={rightId}>
            <TooltipTrigger id={rightId} render={<Button variant="outline" size="sm" />}>
              Permission
            </TooltipTrigger>
            <TooltipContent side="right">Right</TooltipContent>
          </Tooltip>
          <Tooltip open triggerId={leftId}>
            <TooltipTrigger
              id={leftId}
              render={
                <span
                  tabIndex={0}
                  className="inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-line-strong"
                />
              }
            >
              <Status variant="primary" pulse aria-hidden />
              Thinking
            </TooltipTrigger>
            <TooltipContent side="left">Left</TooltipContent>
          </Tooltip>
          <Tooltip open triggerId={bottomId}>
            <TooltipTrigger
              id={bottomId}
              render={
                <time
                  dateTime="2026-06-23T09:30:00+08:00"
                  tabIndex={0}
                  className="rounded-sm px-1 py-0.5 font-mono text-xs text-foreground-muted outline-none focus-visible:ring-2 focus-visible:ring-line-strong"
                />
              }
            >
              09:30
            </TooltipTrigger>
            <TooltipContent side="bottom">Bottom</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </TooltipFrame>
  );
}

function EdgeCollisionExample() {
  const [boundary, setBoundary] = useState<HTMLDivElement | null>(null);
  const [openAll, setOpenAll] = useState(false);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-foreground-muted">
          Boundary: Dashed box below (tooltips flip &amp; shift at edges)
        </span>
        <label className="flex items-center gap-2 text-xs font-medium text-foreground-muted cursor-pointer select-none">
          <span>Show all</span>
          <Switch
            checked={openAll}
            onCheckedChange={setOpenAll}
            size="sm"
            aria-label="Show all tooltips"
          />
        </label>
      </div>

      <TooltipProvider>
        <div
          ref={setBoundary}
          className="relative flex h-80 w-full flex-col justify-between rounded-lg border border-dashed border-line-strong/60 bg-surface-muted/20 p-3"
        >
          {/* Top Row: Left corner, Center, Right corner */}
          <div className="flex items-start justify-between">
            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Top Left
              </TooltipTrigger>
              <TooltipContent side="top" collisionBoundary={boundary ?? undefined}>
                side=&quot;top&quot; → flips to bottom, shifts right
              </TooltipContent>
            </Tooltip>

            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Top Edge
              </TooltipTrigger>
              <TooltipContent side="top" collisionBoundary={boundary ?? undefined}>
                side=&quot;top&quot; → flips to bottom
              </TooltipContent>
            </Tooltip>

            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Top Right
              </TooltipTrigger>
              <TooltipContent side="top" collisionBoundary={boundary ?? undefined}>
                side=&quot;top&quot; → flips to bottom, shifts left
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Middle Row: Left Edge, Center info badge, Right Edge */}
          <div className="flex items-center justify-between">
            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Left Edge
              </TooltipTrigger>
              <TooltipContent side="left" collisionBoundary={boundary ?? undefined}>
                side=&quot;left&quot; → flips to right
              </TooltipContent>
            </Tooltip>

            <div className="pointer-events-none select-none text-center">
              <span className="rounded-sm bg-surface-elevated px-2 py-1 text-xs font-mono text-foreground-muted border border-line">
                collisionAvoidance: flip + shift
              </span>
            </div>

            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Right Edge
              </TooltipTrigger>
              <TooltipContent side="right" collisionBoundary={boundary ?? undefined}>
                side=&quot;right&quot; → flips to left
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Bottom Row: Left corner, Center, Right corner */}
          <div className="flex items-end justify-between">
            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Bottom Left
              </TooltipTrigger>
              <TooltipContent side="bottom" collisionBoundary={boundary ?? undefined}>
                side=&quot;bottom&quot; → flips to top, shifts right
              </TooltipContent>
            </Tooltip>

            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Bottom Edge
              </TooltipTrigger>
              <TooltipContent side="bottom" collisionBoundary={boundary ?? undefined}>
                side=&quot;bottom&quot; → flips to top
              </TooltipContent>
            </Tooltip>

            <Tooltip open={openAll ? true : undefined}>
              <TooltipTrigger render={<Button variant="outline" size="sm" />}>
                Bottom Right
              </TooltipTrigger>
              <TooltipContent side="bottom" collisionBoundary={boundary ?? undefined}>
                side=&quot;bottom&quot; → flips to top, shifts left
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}

function TooltipDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Tooltip"
      description="A short contextual hint for icon controls, status details, timestamps, and compact metadata."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <TooltipPreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-8">
          <DocNote>
            Use <InlineCode>Tooltip</InlineCode> for terse labels or hidden detail. Rich cards with
            actions, avatars, or structured content should stay in <InlineCode>Popover</InlineCode>{" "}
            or a future HoverCard-style primitive. Wrap tooltip trees in{" "}
            <InlineCode>TooltipProvider</InlineCode> once near the app or page root.
          </DocNote>
          <DocSubsection parentId="usage" id="action-cluster" title="Action cluster">
            <Preview>
              <Preview.Canvas>
                <ActionClusterExample />
              </Preview.Canvas>
              <Preview.Code html={code.usageActions} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="status-hint" title="Status hint">
            <Preview>
              <Preview.Canvas>
                <TooltipExample content="Agent is thinking">
                  {(triggerId) => (
                    <TooltipTrigger
                      id={triggerId}
                      render={
                        <span
                          tabIndex={0}
                          aria-label="Agent is thinking"
                          className="inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-line-strong"
                        />
                      }
                    >
                      <Status variant="primary" pulse aria-hidden />
                      Thinking
                    </TooltipTrigger>
                  )}
                </TooltipExample>
              </Preview.Canvas>
              <Preview.Code html={code.usageStatus} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="icon-content" title="Icon content">
            <Preview>
              <Preview.Canvas>
                <TooltipExample
                  content={
                    <>
                      <Info aria-hidden />
                      Only admins can change this
                    </>
                  }
                >
                  {(triggerId) => (
                    <TooltipTrigger id={triggerId} render={<Button variant="outline" size="sm" />}>
                      Permission
                    </TooltipTrigger>
                  )}
                </TooltipExample>
              </Preview.Canvas>
              <Preview.Code html={code.usageIconContent} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="long-text" title="Long text">
            <Preview>
              <Preview.Canvas>
                <TooltipExample
                  open
                  frameClassName="min-h-56 px-10 py-20"
                  content="packages/web/src/components/message/MessageItem.tsx:695"
                >
                  {(triggerId) => (
                    <TooltipTrigger id={triggerId} render={<Button variant="outline" size="sm" />}>
                      Source path
                    </TooltipTrigger>
                  )}
                </TooltipExample>
              </Preview.Canvas>
              <Preview.Code html={code.usageLongText} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="long-text-with-icon" title="Long text with icon">
            <Preview>
              <Preview.Canvas>
                <TooltipExample
                  open
                  frameClassName="min-h-56 px-10 py-20"
                  content={
                    <>
                      <Info aria-hidden />
                      packages/web/src/components/message/MessageItem.tsx:695
                    </>
                  }
                >
                  {(triggerId) => (
                    <TooltipTrigger id={triggerId} render={<Button variant="outline" size="sm" />}>
                      Source path
                    </TooltipTrigger>
                  )}
                </TooltipExample>
              </Preview.Canvas>
              <Preview.Code html={code.usageLongIconContent} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="timestamp-detail" title="Timestamp detail">
            <Preview>
              <Preview.Canvas>
                <TooltipExample content="Jun 23, 2026, 09:30">
                  {(triggerId) => (
                    <TooltipTrigger
                      id={triggerId}
                      render={
                        <time
                          dateTime="2026-06-23T09:30:00+08:00"
                          tabIndex={0}
                          className="rounded-sm px-1 py-0.5 font-mono text-xs text-foreground-muted outline-none focus-visible:ring-2 focus-visible:ring-line-strong"
                        />
                      }
                    >
                      Today at 09:30
                    </TooltipTrigger>
                  )}
                </TooltipExample>
              </Preview.Canvas>
              <Preview.Code html={code.usageTimestamp} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="shortcut-hint" title="Shortcut hint">
            <Preview>
              <Preview.Canvas>
                <TooltipExample
                  content={
                    <>
                      Open command menu
                      <Kbd>Cmd K</Kbd>
                    </>
                  }
                >
                  {(triggerId) => (
                    <TooltipTrigger
                      id={triggerId}
                      render={<Button variant="ghost" size="icon-sm" aria-label="Shortcut help" />}
                    >
                      <Info />
                    </TooltipTrigger>
                  )}
                </TooltipExample>
              </Preview.Canvas>
              <Preview.Code html={code.usageShortcut} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="arrow-placement" title="Arrow placement">
            <DocNote>Brutal renders tooltip hints without arrows.</DocNote>
            <Preview>
              <Preview.Canvas>
                <ArrowPlacementExample />
              </Preview.Canvas>
              <Preview.Code html={code.usagePlacement} />
            </Preview>
          </DocSubsection>
          <DocSubsection parentId="usage" id="edge-collision" title="Edge collision avoidance">
            <DocNote>
              Tooltips default to{" "}
              <InlineCode>
                collisionAvoidance=&#123;&#123; side: &quot;flip&quot;, align: &quot;shift&quot;
                &#125;&#125;
              </InlineCode>
              . When a trigger touches an edge boundary, the floating layer automatically flips to
              the opposite side and shifts along the perpendicular axis to prevent truncation.
            </DocNote>
            <Preview>
              <Preview.Canvas>
                <EdgeCollisionExample />
              </Preview.Canvas>
              <Preview.Code html={code.usageCollision} />
            </Preview>
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-provider" title="TooltipProvider">
            <PropsTable rows={TOOLTIP_PROVIDER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-root" title="Tooltip">
            <PropsTable rows={TOOLTIP_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="TooltipTrigger">
            <PropsTable rows={TOOLTIP_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-portal" title="TooltipPortal">
            <PropsTable rows={TOOLTIP_PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="TooltipContent">
            <PropsTable rows={TOOLTIP_CONTENT_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
