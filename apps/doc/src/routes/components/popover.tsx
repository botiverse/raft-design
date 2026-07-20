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
  Status,
} from "raft-ui";
import { AlertTriangle, Info, X } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { useRef } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import popoverMentionCardCompositionSource from "#/modules/popover/compositions/popover-mention-card.composition.tsx?raw";
import { PopoverMentionCardComposition } from "#/modules/popover/compositions/popover-mention-card.composition.tsx";
import popoverNotificationCompositionSource from "#/modules/popover/compositions/popover-notification.composition.tsx?raw";
import { PopoverNotificationComposition } from "#/modules/popover/compositions/popover-notification.composition.tsx";
import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
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
        label: "MentionLink.tsx:15-33",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MentionLink.tsx:15-33",
      },
      {
        label: "useProfileHoverCard.tsx:49-83",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/hooks/useProfileHoverCard.tsx:49-83",
      },
      {
        label: "MentionHoverCard.tsx:35,99,102",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MentionHoverCard.tsx:35,99,102",
      },
      {
        label: "MessageItem.tsx:2808,2860,2862,2890",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:2808,2860,2862,2890",
      },
    ],
  },
] as const;

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
  anatomy: `<Popover>
  <PopoverTrigger />
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle />
      <PopoverClose />
    </PopoverHeader>
    <PopoverSeparator />
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

const ROOT_PROPS: readonly PropRow[] = [
  {
    name: "Popover",
    type: "Base UI Popover.Root.Props",
    description: "Owns open state, Escape, outside press, focus handoff, and modal behavior.",
  },
];

const TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "PopoverTrigger",
    type: "Base UI Popover.Trigger.Props",
    description: "Trigger part. Compose custom controls with Base UI's render prop.",
  },
];

const CONTENT_PROPS: readonly PropRow[] = [
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
    name: "PopoverViewport",
    type: "Base UI Popover.Viewport.Props",
    description:
      "Optional transition viewport for one popover whose content changes between multiple triggers.",
  },
];

const PART_PROPS: readonly PropRow[] = [
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
];

const POPOVER_NOTIFICATION_COMPOSITION_PATH =
  "apps/doc/src/modules/popover/compositions/popover-notification.composition.tsx" as const;
const POPOVER_MENTION_CARD_COMPOSITION_PATH =
  "apps/doc/src/modules/popover/compositions/popover-mention-card.composition.tsx" as const;

export const Route = createFileRoute("/components/popover")({
  component: PopoverDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        popoverNotificationComposition: popoverNotificationCompositionSource,
        popoverMentionCardComposition: popoverMentionCardCompositionSource,
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
      <div className="grid w-80 justify-items-start gap-2">
        <span className="relative inline-flex">
          <button
            type="button"
            aria-label="Notification center (2 active)"
            className="inline-flex size-9 items-center justify-center border-2 border-black bg-brutal-orange text-black shadow-[2px_2px_0_#141111] transition-all duration-100 hover:shadow-[4px_4px_0_#141111]"
          >
            <AlertTriangle className="size-[18px]" />
          </button>
          <Status
            aria-hidden
            size="md"
            variant="warning"
            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2"
          />
        </span>
        <div className="flex h-72 w-full flex-col overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0_#141111]">
          <div className="flex items-center gap-2 border-b-2 border-black bg-brutal-cream px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-black/60">
              Notifications
            </span>
            <span className="ml-auto font-mono text-xs text-black/40">2 items</span>
          </div>
          <ul className="divide-y-2 divide-black">
            <SourceNotificationItem
              title="Sync needs attention"
              body="Retry source sync before publishing docs."
              action="Retry"
            />
            <SourceNotificationItem
              title="Thread mentioned you"
              body="Atlas left a note in #design-system."
              action="Open"
            />
          </ul>
        </div>
      </div>
    </SourceComparisonPreview>
  );
}

function SourceNotificationItem({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: string;
}) {
  return (
    <li className="px-3 py-3">
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-black bg-brutal-orange">
          <AlertTriangle className="size-4 text-black" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="break-words text-sm font-bold text-black">{title}</div>
          <div className="mt-0.5 break-words text-sm text-black">{body}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="border-2 border-black bg-brutal-pink px-3 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0_#141111]">
              {action}
            </span>
            <span className="border-2 border-black bg-white px-3 py-1.5 text-xs font-bold text-black shadow-[2px_2px_0_#141111]">
              Dismiss
            </span>
          </div>
        </div>
      </div>
    </li>
  );
}

function SourceMentionCardPreview() {
  return (
    <SourceComparisonPreview className="min-h-72 items-start pt-8">
      <div className="grid w-[20rem] justify-items-start gap-2">
        <p className="m-0 max-w-full text-sm leading-6 text-black">
          <span>Follow up with </span>
          <a
            href="#"
            onClick={(event) => event.preventDefault()}
            className="cursor-default select-text font-bold text-black underline decoration-black/30 decoration-2 underline-offset-2 hover:text-brutal-pink hover:decoration-brutal-pink"
          >
            @Atlas
          </a>
          <span> about the token migration.</span>
        </p>
        <div className="ml-16 w-[17.5rem] overflow-hidden border-2 border-black bg-white shadow-[4px_4px_0_#141111]">
          <div className="flex items-start gap-3 px-3 pt-3 pb-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-black bg-brutal-yellow text-sm font-bold text-black">
              AT
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-bold text-black">Atlas</span>
                <Status aria-hidden size="sm" variant="success" />
                <span className="truncate font-mono text-xs text-black/60">Online</span>
              </div>
              <div className="truncate font-mono text-xs text-black/60">@atlas</div>
            </div>
          </div>
          <div
            className="truncate border-t-2 border-black px-3 py-2 text-xs text-black/70"
            title="Reviewing the token migration in #design-system."
          >
            Reviewing the token migration in #design-system.
          </div>
        </div>
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
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
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
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage" showThemeSwitcher>
        <DocSubsection parentId="usage" id="details" title="Details">
          <Example html={code.details} previewClassName="min-h-[18rem] items-start pt-28">
            <OpenPopoverExample triggerId="details-popover-trigger" label="Usage notes">
              <PopoverPanelBody />
            </OpenPopoverExample>
          </Example>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-root" title="Popover root">
            <PropsTable rows={ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-trigger" title="Trigger">
            <PropsTable rows={TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-content" title="Content">
            <PropsTable rows={CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-parts" title="Panel parts">
            <PropsTable rows={PART_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison" showThemeSwitcher={false}>
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              id: "source-comparison-notification-popover",
              label: "Notification popover",
              status: "difference",
              note: "Source scenes: NotificationTrigger.tsx:58,126,166; LeftRail.tsx:162; Sidebar.tsx:1226.",
              source: <SourceNotificationPopoverPreview />,
              brutal: <PopoverNotificationComposition />,
              elegant: <PopoverNotificationComposition />,
              elegantDark: <PopoverNotificationComposition />,
              compositionCode: code.popoverNotificationComposition,
              compositionCollapsedCode: code.popoverNotificationCompositionBody,
              compositionPath: POPOVER_NOTIFICATION_COMPOSITION_PATH,
              compositionSource: popoverNotificationCompositionSource,
              compositionShowLineNumbers: false,
            },
            {
              id: "source-comparison-mention-card",
              label: "Mention card",
              status: "difference",
              note: "Source trigger is the @mention anchor in MentionLink.tsx:15-33; useProfileHoverCard.tsx:49-83 opens the card on hover/focus. This comparison freezes the opened MentionHoverCard.tsx:35,99,102 state because Popover only opens on click/press. See PreviewCard for the hover-native migration of this scene.",
              source: <SourceMentionCardPreview />,
              brutal: <PopoverMentionCardComposition />,
              elegant: <PopoverMentionCardComposition />,
              elegantDark: <PopoverMentionCardComposition />,
              compositionCode: code.popoverMentionCardComposition,
              compositionCollapsedCode: code.popoverMentionCardCompositionBody,
              compositionPath: POPOVER_MENTION_CARD_COMPOSITION_PATH,
              compositionSource: popoverMentionCardCompositionSource,
              compositionShowLineNumbers: false,
            },
          ]}
          previewSize="popover"
        />
      </DocSection>
    </DocPage>
  );
}
