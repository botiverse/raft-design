import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Kbd,
  Status,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import { Bell, Bookmark, Info, MessageSquare, SmilePlus } from "lucide-react";
import { useId, useRef, type ReactNode, type RefObject } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
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
  anatomy: `<TooltipProvider>
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
    name: "open / defaultOpen",
    type: "boolean",
    description: "Controlled or initial open state.",
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
    name: "delay / closeDelay",
    type: "number",
    description: "Per-trigger timing overrides.",
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
    name: "sideOffset / alignOffset",
    type: "number",
    default: "8 elegant, 6 brutal / 0",
    description: "Offsets passed to Base UI Positioner.",
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

function TooltipFrame({
  children,
  className,
}: {
  children: (portalRef: RefObject<HTMLDivElement | null>) => ReactNode;
  className?: string;
}) {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={portalRef}
      className={[
        "relative flex min-h-36 w-full items-center justify-center overflow-hidden px-4 py-10",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children(portalRef)}
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
      {(portalRef) => (
        <TooltipProvider>
          <Tooltip {...(open ? { open: true, triggerId } : {})}>
            {children(triggerId)}
            <TooltipContent
              positionMethod="absolute"
              portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
            >
              {content}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </TooltipFrame>
  );
}

function TooltipPlaygroundPreview({ label, side }: PlaygroundValues) {
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

function ActionClusterExample() {
  return (
    <TooltipFrame>
      {(portalRef) => {
        const portalProps = { container: portalRef as RefObject<HTMLElement | null> };

        return (
          <TooltipProvider>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Reply in thread" />}
                >
                  <MessageSquare />
                </TooltipTrigger>
                <TooltipContent positionMethod="absolute" portalProps={portalProps}>
                  Reply in thread
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}
                >
                  <SmilePlus />
                </TooltipTrigger>
                <TooltipContent positionMethod="absolute" portalProps={portalProps}>
                  Add reaction
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Save message" />}
                >
                  <Bookmark />
                </TooltipTrigger>
                <TooltipContent positionMethod="absolute" portalProps={portalProps}>
                  Save message
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={<Button variant="ghost" size="icon-sm" aria-label="Mute thread" />}
                >
                  <Bell />
                </TooltipTrigger>
                <TooltipContent positionMethod="absolute" portalProps={portalProps}>
                  Mute thread
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      }}
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
      {(portalRef) => {
        const portalProps = { container: portalRef as RefObject<HTMLElement | null> };

        return (
          <TooltipProvider>
            <div className="grid grid-cols-2 gap-x-28 gap-y-20">
              <Tooltip open triggerId={topId}>
                <TooltipTrigger
                  id={topId}
                  render={<Button variant="ghost" size="icon-sm" aria-label="Add reaction" />}
                >
                  <SmilePlus />
                </TooltipTrigger>
                <TooltipContent side="top" positionMethod="absolute" portalProps={portalProps}>
                  Top
                </TooltipContent>
              </Tooltip>
              <Tooltip open triggerId={rightId}>
                <TooltipTrigger id={rightId} render={<Button variant="outline" size="sm" />}>
                  Permission
                </TooltipTrigger>
                <TooltipContent side="right" positionMethod="absolute" portalProps={portalProps}>
                  Right
                </TooltipContent>
              </Tooltip>
              <Tooltip open triggerId={leftId}>
                <TooltipTrigger
                  id={leftId}
                  render={
                    <span
                      tabIndex={0}
                      className="inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
                    />
                  }
                >
                  <Status variant="primary" pulse aria-hidden />
                  Thinking
                </TooltipTrigger>
                <TooltipContent side="left" positionMethod="absolute" portalProps={portalProps}>
                  Left
                </TooltipContent>
              </Tooltip>
              <Tooltip open triggerId={bottomId}>
                <TooltipTrigger
                  id={bottomId}
                  render={
                    <time
                      dateTime="2026-06-23T09:30:00+08:00"
                      tabIndex={0}
                      className="rounded-sm px-1 py-0.5 font-mono text-xs text-foreground-muted outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
                    />
                  }
                >
                  09:30
                </TooltipTrigger>
                <TooltipContent side="bottom" positionMethod="absolute" portalProps={portalProps}>
                  Bottom
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        );
      }}
    </TooltipFrame>
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
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            side: "top",
            label: "Add reaction",
          }}
          controls={[
            { name: "side", label: "Side", type: "select", options: PREVIEW_SIDES },
            { name: "label", label: "Label", type: "text" },
          ]}
          render={(values) => <TooltipPlaygroundPreview {...values} />}
        />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <div className="space-y-8">
          <DocNote>
            Use Tooltip for terse labels or hidden detail. Rich cards with actions, avatars, or
            structured content should stay in Popover or a future HoverCard-style primitive. Wrap
            tooltip trees in TooltipProvider once near the app or page root.
          </DocNote>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Action cluster</h3>
            <Example html={code.usageActions}>
              <ActionClusterExample />
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Status hint</h3>
            <Example html={code.usageStatus}>
              <TooltipExample content="Agent is thinking">
                {(triggerId) => (
                  <TooltipTrigger
                    id={triggerId}
                    render={
                      <span
                        tabIndex={0}
                        aria-label="Agent is thinking"
                        className="inline-flex items-center gap-2 rounded-sm px-2 py-1 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
                      />
                    }
                  >
                    <Status variant="primary" pulse aria-hidden />
                    Thinking
                  </TooltipTrigger>
                )}
              </TooltipExample>
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Icon content</h3>
            <Example html={code.usageIconContent}>
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
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Long text</h3>
            <Example html={code.usageLongText}>
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
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Long text with icon</h3>
            <Example html={code.usageLongIconContent}>
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
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Timestamp detail</h3>
            <Example html={code.usageTimestamp}>
              <TooltipExample content="Jun 23, 2026, 09:30">
                {(triggerId) => (
                  <TooltipTrigger
                    id={triggerId}
                    render={
                      <time
                        dateTime="2026-06-23T09:30:00+08:00"
                        tabIndex={0}
                        className="rounded-sm px-1 py-0.5 font-mono text-xs text-foreground-muted outline-none focus-visible:ring-2 focus-visible:ring-line-focus"
                      />
                    }
                  >
                    Today at 09:30
                  </TooltipTrigger>
                )}
              </TooltipExample>
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Shortcut hint</h3>
            <Example html={code.usageShortcut}>
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
            </Example>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Arrow placement</h3>
            <DocNote>Brutal renders tooltip hints without arrows.</DocNote>
            <Example html={code.usagePlacement}>
              <ArrowPlacementExample />
            </Example>
          </div>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-8">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">TooltipProvider props</h3>
            <PropsTable rows={TOOLTIP_PROVIDER_PROPS} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">Tooltip props</h3>
            <PropsTable rows={TOOLTIP_ROOT_PROPS} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">TooltipTrigger props</h3>
            <PropsTable rows={TOOLTIP_TRIGGER_PROPS} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground-strong">TooltipContent props</h3>
            <PropsTable rows={TOOLTIP_CONTENT_PROPS} />
          </div>
        </div>
      </DocSection>
    </DocPage>
  );
}
