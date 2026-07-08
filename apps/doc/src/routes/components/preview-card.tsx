import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardSeparator,
  PreviewCardTitle,
  PreviewCardTrigger,
  Status,
} from "raft-ui";
import { useRef, type RefObject } from "react";

import { ComponentDemoFrame } from "#/components/component-demo-frame.tsx";
import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Example } from "#/components/example.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceComparison } from "#/components/source-comparison.tsx";
import previewCardMentionCompositionSource from "#/compositions/preview-card-mention-composition.tsx?raw";
import { PreviewCardMentionComposition } from "#/compositions/preview-card-mention-composition.tsx";
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
    label: "Mention hover card",
    scenes: [
      {
        label: "MentionLink.tsx:12-40",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MentionLink.tsx:12-40",
      },
      {
        label: "useProfileHoverCard.tsx:4-5,40-97",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/hooks/useProfileHoverCard.tsx:4-5,40-97",
      },
      {
        label: "MentionHoverCard.tsx:12-13,105-117",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MentionHoverCard.tsx:12-13,105-117",
      },
      {
        label: "MessageItem.tsx:2157",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/message/MessageItem.tsx:2157",
      },
      {
        label: "MemberGraphSection.tsx:144",
        path: "/Users/cuvii/Development/zolplay/slock-ui-backup/packages/web/src/components/settings/MemberGraphSection.tsx:144",
      },
    ],
  },
] as const;

const MENTION_CARD_BODY_SNIPPET = `    <PreviewCardHeader>
      <Avatar size="lg" type="agent">
        <AvatarFallback>AT</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <PreviewCardTitle>Atlas</PreviewCardTitle>
          <Status aria-hidden size="sm" variant="success" />
          <span className="font-mono text-xs text-foreground-muted">Online</span>
        </div>
        <div className="font-mono text-xs text-foreground-muted">@atlas</div>
      </div>
    </PreviewCardHeader>
    <PreviewCardSeparator />
    <PreviewCardDescription>
      Reviewing the token migration in #design-system.
    </PreviewCardDescription>`;

const SNIPPETS = {
  anatomy: `import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardTitle,
  PreviewCardTrigger,
} from "raft-ui";

<PreviewCard>
  <PreviewCardTrigger render={<a href="/components/avatar" />}>@atlas</PreviewCardTrigger>
  <PreviewCardContent>
    <PreviewCardHeader>
      <PreviewCardTitle>Atlas</PreviewCardTitle>
    </PreviewCardHeader>
    <PreviewCardDescription>Reviewing the token migration in #design-system.</PreviewCardDescription>
  </PreviewCardContent>
</PreviewCard>`,
  usage: `<p>
  Follow up with{" "}
  <PreviewCard>
    <PreviewCardTrigger
      render={
        <a
          href="/components/avatar"
          className="font-bold underline decoration-foreground/30 decoration-2 underline-offset-2"
        />
      }
    >
      @Atlas
    </PreviewCardTrigger>
    <PreviewCardContent className="w-[17.5rem]">
${MENTION_CARD_BODY_SNIPPET}
    </PreviewCardContent>
  </PreviewCard>{" "}
  about the token migration.
</p>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "PreviewCard",
    type: "Base UI PreviewCard.Root.Props",
    description:
      "Owns open state, hover/focus intent, and trigger-card association via triggerId/handle.",
  },
  {
    name: "PreviewCardTrigger",
    type: "Base UI PreviewCard.Trigger.Props",
    description:
      "Trigger affordance and positioning anchor. Renders an <a> by default; use render to compose the actual link element and keep styling on the semantic element.",
  },
  {
    name: "PreviewCardContent",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled floating card. Defaults to side=bottom, align=start, sideOffset=6, disableAnchorTracking=true, and forwards anchor/collision/sticky positioning props.",
  },
  {
    name: "PreviewCardPopup",
    type: "div props",
    description: "Static card shell for docs previews and non-portaled comparison panes.",
  },
  {
    name: "PreviewCardHeader",
    type: "div props",
    description: "Leading row for an avatar or icon plus a title stack.",
  },
  {
    name: "PreviewCardSeparator",
    type: "div props",
    description: "Optional horizontal divider between the header and description.",
  },
  {
    name: "PreviewCardTitle",
    type: "p props",
    description: "Primary heading, typically the previewed entity's name.",
  },
  {
    name: "PreviewCardDescription",
    type: "p props",
    description: "Supporting copy or status line for the previewed entity.",
  },
  {
    name: "PreviewCardArrow",
    type: "Base UI PreviewCard.Arrow.Props",
    description:
      "Optional pointer triangle. Brutal hides it to match the source card, which never rendered one.",
  },
];

const PREVIEW_CARD_MENTION_COMPOSITION_PATH =
  "apps/doc/src/compositions/preview-card-mention-composition.tsx" as const;

export const Route = createFileRoute("/components/preview-card")({
  component: PreviewCardDoc,
  loader: () =>
    highlightSnippets({
      data: {
        ...SNIPPETS,
        previewCardMentionComposition: previewCardMentionCompositionSource,
      },
    }),
});

function MentionCardBody() {
  return (
    <>
      <PreviewCardHeader>
        <Avatar size="lg" type="agent">
          <AvatarFallback>AT</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <PreviewCardTitle>Atlas</PreviewCardTitle>
            <Status aria-hidden size="sm" variant="success" />
            <span className="truncate font-mono text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/60">
              Online
            </span>
          </div>
          <div className="truncate font-mono text-xs text-foreground-muted [[data-theme=brutal]_&]:text-black/60">
            @atlas
          </div>
        </div>
      </PreviewCardHeader>
      <PreviewCardSeparator />
      <PreviewCardDescription title="Reviewing the token migration in #design-system.">
        Reviewing the token migration in #design-system.
      </PreviewCardDescription>
    </>
  );
}

function DefaultOpenPreviewCard() {
  const portalRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={portalRef} className="relative flex justify-center">
      <PreviewCard defaultOpen triggerId="preview-card-preview-trigger">
        <PreviewCardTrigger
          id="preview-card-preview-trigger"
          render={
            <a
              href="/components/avatar"
              className="cursor-default select-text font-bold text-foreground-strong underline decoration-foreground/30 decoration-2 underline-offset-2 [[data-theme=brutal]_&]:text-black [[data-theme=brutal]_&]:decoration-black/30"
            />
          }
        >
          @Atlas
        </PreviewCardTrigger>
        <PreviewCardContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-[17.5rem]"
        >
          <MentionCardBody />
        </PreviewCardContent>
      </PreviewCard>
    </div>
  );
}

function SourceMentionCardPreview() {
  return (
    <div className="flex min-h-72 w-full items-start justify-center pt-8">
      <div className="grid w-[20rem] justify-items-start gap-2">
        <p className="m-0 max-w-full text-sm leading-6 text-black">
          <span>Follow up with </span>
          <a
            href="/components/avatar"
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
    </div>
  );
}

function PreviewCardDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="Preview Card"
      description="A hover/focus-triggered floating card for glanceable link, user, and message previews."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <p className="mb-3 max-w-2xl text-sm leading-6 text-foreground-muted">
          Opens by default so the anatomy is inspectable without hovering, but stays fully
          interactive: move away and it closes on hover/focus intent like any other trigger.
        </p>
        <ComponentDemoFrame previewClassName="min-h-[22rem] items-start pt-24">
          <DefaultOpenPreviewCard />
        </ComponentDemoFrame>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="PreviewCard.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          collapsedHtml={code.anatomyBody}
        />
      </DocSection>

      <DocSection id="usage" title="Usage">
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground-strong">Mention hover card</h3>
          <DocNote>
            Hover or focus the @Atlas link below. delay/closeDelay default to 80ms/40ms so repeated
            message previews stay responsive.
          </DocNote>
          <Example html={code.usage} previewClassName="min-h-[18rem] items-start pt-8">
            <PreviewCardMentionComposition />
          </Example>
        </div>
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison" showThemeSwitcher={false}>
        <SourceComparison
          sourceScenes={SOURCE_SCENES}
          layout="grid"
          items={[
            {
              id: "source-comparison-mention-card",
              label: "Mention hover card",
              status: "match",
              note: "Source opens MentionHoverCard on hover/focus via useProfileHoverCard timers (MentionLink.tsx:12-40). PreviewCardTrigger keeps that intent native, with snappier defaults for dense message previews instead of freezing an opened state.",
              source: <SourceMentionCardPreview />,
              brutal: <PreviewCardMentionComposition defaultOpen />,
              elegant: <PreviewCardMentionComposition defaultOpen />,
              elegantDark: <PreviewCardMentionComposition defaultOpen />,
              compositionCode: code.previewCardMentionComposition,
              compositionCollapsedCode: code.previewCardMentionCompositionBody,
              compositionPath: PREVIEW_CARD_MENTION_COMPOSITION_PATH,
              compositionSource: previewCardMentionCompositionSource,
              compositionShowLineNumbers: false,
              previewClassName: "min-h-72 items-start pt-8",
            },
          ]}
          previewSize="popover"
        />
      </DocSection>
    </DocPage>
  );
}
