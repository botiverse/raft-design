import { createFileRoute } from "@tanstack/react-router";
import {
  Button,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverPopup,
  PopoverSeparator,
  PopoverTitle,
  PopoverTrigger,
} from "raft-ui";
import { AtSign, Bell, CheckCircle2, Grid2X2, Info, Search, X } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import { TodoList } from "#/components/todo-list.tsx";
import { SourceComparisonPreview } from "#/compositions/source-comparison-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "todo", title: "Todo" },
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "details", title: "Details" },
  {
    id: "source-comparison",
    title: "Source comparison",
    children: [
      { id: "source-comparison-notification-popover", title: "Notification popover" },
      { id: "source-comparison-mention-card", title: "Mention card" },
      { id: "source-comparison-composer-popover", title: "Composer popover" },
    ],
  },
  { id: "api", title: "API" },
] as const;
const SOURCE_SCENES = [
  {
    label: "Notification popovers",
    scenes: [
      {
        label: "NotificationTrigger.tsx:58,126,166",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/NotificationTrigger.tsx:58,126,166",
      },
      {
        label: "LeftRail.tsx:162",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/LeftRail.tsx:162",
      },
      {
        label: "Sidebar.tsx:1226",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/layout/Sidebar.tsx:1226",
      },
    ],
  },
  {
    label: "Hover cards and message popovers",
    scenes: [
      {
        label: "MentionHoverCard.tsx:35,99,102",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MentionHoverCard.tsx:35,99,102",
      },
      {
        label: "MessageInput.tsx:928",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageInput.tsx:928",
      },
      {
        label: "MessageItem.tsx:2808,2860,2862,2890",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:2808,2860,2862,2890",
      },
    ],
  },
  {
    label: "Inline editors and selection popovers",
    scenes: [
      {
        label: "InlineBadgeEditor.tsx:209",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/InlineBadgeEditor.tsx:209",
      },
      {
        label: "SelectionPopover.tsx:105,157",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/ui/SelectionPopover.tsx:105,157",
      },
    ],
  },
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
} from "raft-ui";

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

function SourceNotificationPopoverPreview() {
  return (
    <SourceComparisonPreview className="min-h-72 items-start pt-8">
      <div className="grid w-[17rem] justify-items-start gap-2">
        <button
          type="button"
          className="relative inline-flex h-9 items-center gap-2 border-2 border-black bg-white px-3 text-xs font-bold uppercase tracking-wide shadow-[3px_3px_0_#000]"
        >
          <Bell className="size-4" />
          Alerts
          <span className="absolute -top-1 -right-1 size-2.5 rounded-full border-2 border-white bg-red-500" />
        </button>
        <div className="w-full border-2 border-black bg-white shadow-[4px_4px_0_#000]">
          <div className="flex items-center justify-between border-b-2 border-black px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-black/60">
              Notifications
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wide text-black/40">
              Clear
            </span>
          </div>
          <div className="grid divide-y-2 divide-black/10">
            <div className="grid gap-1 px-3 py-2">
              <span className="text-xs font-bold text-black">Build finished</span>
              <span className="text-[11px] leading-4 text-black/60">Docs preview is ready.</span>
            </div>
            <div className="grid gap-1 px-3 py-2">
              <span className="text-xs font-bold text-black">Thread mentioned you</span>
              <span className="text-[11px] leading-4 text-black/60">Atlas in #design</span>
            </div>
          </div>
        </div>
      </div>
    </SourceComparisonPreview>
  );
}

function CurrentNotificationPopoverPreview() {
  return (
    <SourceComparisonPreview className="min-h-72 items-start pt-8">
      <div className="grid w-[17rem] justify-items-start gap-2">
        <Button variant="outline" size="sm">
          <Bell className="size-4" />
          Alerts
        </Button>
        <PopoverPopup className="w-full">
          <PopoverHeader>
            <PopoverTitle>Notifications</PopoverTitle>
            <PopoverClose aria-label="Close notifications">
              <X className="size-3" />
            </PopoverClose>
          </PopoverHeader>
          <PopoverSeparator />
          <div className="grid divide-y divide-line-muted">
            <div className="grid gap-1 px-3 py-2">
              <span className="text-sm font-medium text-foreground-strong">Build finished</span>
              <span className="text-xs leading-5 text-foreground-muted">
                Docs preview is ready.
              </span>
            </div>
            <div className="grid gap-1 px-3 py-2">
              <span className="text-sm font-medium text-foreground-strong">
                Thread mentioned you
              </span>
              <span className="text-xs leading-5 text-foreground-muted">Atlas in #design</span>
            </div>
          </div>
        </PopoverPopup>
      </div>
    </SourceComparisonPreview>
  );
}

function SourceMentionCardPreview() {
  return (
    <SourceComparisonPreview className="min-h-72 items-start pt-10">
      <div className="w-[17rem] border-2 border-black bg-white p-3 shadow-[4px_4px_0_#000]">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full border-2 border-black bg-yellow-200 text-sm font-bold">
            AT
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-bold text-black">Atlas</span>
              <span className="size-2 rounded-full bg-emerald-500" />
            </div>
            <p className="mt-1 text-xs leading-5 text-black/60">
              Reviewing the token migration in #design-system.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 border-t-2 border-black/10 pt-3">
          <span className="rounded-none border border-black bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Message
          </span>
          <span className="rounded-none border border-black bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-black">
            View profile
          </span>
        </div>
      </div>
    </SourceComparisonPreview>
  );
}

function CurrentMentionCardPreview() {
  return (
    <SourceComparisonPreview className="min-h-72 items-start pt-10">
      <PopoverPopup className="w-[17rem]">
        <div className="p-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-accent-100 text-sm font-medium text-accent-700">
              AT
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-medium text-foreground-strong">Atlas</span>
                <span className="size-2 rounded-full bg-success-base" />
              </div>
              <p className="mt-1 text-xs leading-5 text-foreground-muted">
                Reviewing the token migration in #design-system.
              </p>
            </div>
          </div>
        </div>
        <PopoverSeparator />
        <div className="flex gap-2 px-3 py-3">
          <Button size="sm">Message</Button>
          <Button variant="outline" size="sm">
            View profile
          </Button>
        </div>
      </PopoverPopup>
    </SourceComparisonPreview>
  );
}

function SourceComposerPopoverPreview() {
  return (
    <SourceComparisonPreview className="min-h-72 items-start pt-8">
      <div className="grid w-[18rem] gap-2">
        <div className="flex h-9 items-center gap-2 border-2 border-black bg-white px-3 text-xs text-black/50 shadow-[3px_3px_0_#000]">
          <AtSign className="size-4 text-black" />
          Search people or saved snippets
        </div>
        <div className="border-2 border-black bg-white shadow-[4px_4px_0_#000]">
          <div className="flex items-center gap-2 border-b-2 border-black px-3 py-2">
            <Search className="size-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wide text-black/50">
              Suggestions
            </span>
          </div>
          <div className="grid">
            {["Atlas", "Design notes", "Token audit"].map((item, index) => (
              <div
                key={item}
                className={`flex items-center justify-between px-3 py-2 text-xs font-bold ${
                  index === 0 ? "bg-yellow-200" : "bg-white"
                }`}
              >
                {item}
                {index === 0 ? <CheckCircle2 className="size-3.5" /> : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </SourceComparisonPreview>
  );
}

function CurrentComposerPopoverPreview() {
  return (
    <SourceComparisonPreview className="min-h-72 items-start pt-8">
      <div className="grid w-[18rem] gap-2">
        <Button variant="outline" size="sm">
          <AtSign className="size-4" />
          Insert
        </Button>
        <PopoverPopup className="w-full">
          <PopoverHeader>
            <PopoverTitle>Suggestions</PopoverTitle>
          </PopoverHeader>
          <PopoverSeparator />
          <div className="grid p-1">
            {["Atlas", "Design notes", "Token audit"].map((item, index) => (
              <button
                key={item}
                type="button"
                className={`flex items-center justify-between px-2 py-2 text-left text-sm ${
                  index === 0
                    ? "bg-primary-50 text-primary-700 [[data-theme=brutal]_&]:bg-brutal-yellow [[data-theme=brutal]_&]:text-black"
                    : "text-foreground-muted"
                }`}
              >
                {item}
                {index === 0 ? <CheckCircle2 className="size-3.5" /> : null}
              </button>
            ))}
          </div>
        </PopoverPopup>
      </div>
    </SourceComparisonPreview>
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
          <Grid2X2 data-icon="inline-end" />
        </Button>
      }
      toc={TOC}
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

      <DocSection id="source-comparison" title="Source comparison">
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          items={[
            {
              id: "source-comparison-notification-popover",
              label: "Notification popover",
              status: "difference",
              note: "Source scenes: NotificationTrigger.tsx:58,126,166; LeftRail.tsx:162; Sidebar.tsx:1226.",
              source: <SourceNotificationPopoverPreview />,
              current: <CurrentNotificationPopoverPreview />,
            },
            {
              id: "source-comparison-mention-card",
              label: "Mention card",
              status: "difference",
              note: "Source scenes: MentionHoverCard.tsx:35,99,102; MessageItem.tsx:2808,2860,2862,2890.",
              source: <SourceMentionCardPreview />,
              current: <CurrentMentionCardPreview />,
            },
            {
              id: "source-comparison-composer-popover",
              label: "Composer and selection popover",
              status: "difference",
              note: "Source scenes: MessageInput.tsx:928; InlineBadgeEditor.tsx:209; SelectionPopover.tsx:105,157.",
              source: <SourceComposerPopoverPreview />,
              current: <CurrentComposerPopoverPreview />,
            },
          ]}
          previewSize="popover"
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>
    </DocPage>
  );
}
