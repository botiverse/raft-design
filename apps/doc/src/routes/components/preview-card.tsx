import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarFallback,
  InlineCode,
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardSeparator,
  PreviewCardTitle,
  PreviewCardTrigger,
  Status,
} from "raft-ui";

import { DocNote } from "#/components/doc-note.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PropsTable } from "#/components/props-table.tsx";
import type { PropRow } from "#/components/props-table.tsx";
import { PreviewCardMentionComposition } from "#/modules/preview-card/preview-card-mention.composition.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "usage", title: "Usage" },
  { id: "api", title: "API" },
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
  preview: `<PreviewCard
  defaultOpen
  defaultTriggerId="preview-card-preview-trigger"
>
  <PreviewCardTrigger
    id="preview-card-preview-trigger"
    render={
      <a
        href="/components/avatar"
        className="font-sans font-bold underline decoration-foreground-strong/30 decoration-2 underline-offset-2"
      />
    }
  >
    @Atlas
  </PreviewCardTrigger>
  <PreviewCardContent className="w-[17.5rem]">
${MENTION_CARD_BODY_SNIPPET}
  </PreviewCardContent>
</PreviewCard>`,
  anatomy: `import {
  PreviewCard,
  PreviewCardContent,
  PreviewCardDescription,
  PreviewCardHeader,
  PreviewCardTitle,
  PreviewCardTrigger,
} from "raft-ui";

<PreviewCard>
  <PreviewCardTrigger />
  <PreviewCardContent>
    <PreviewCardHeader>
      <PreviewCardTitle />
    </PreviewCardHeader>
    <PreviewCardDescription />
  </PreviewCardContent>
</PreviewCard>`,
  usage: `<p>
  Follow up with{" "}
  <PreviewCard>
    <PreviewCardTrigger
      render={
        <a
          href="/components/avatar"
          className="font-bold underline decoration-foreground-strong/30 decoration-2 underline-offset-2"
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

const PREVIEW_CARD_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI PreviewCard.Root.Props",
    description:
      "Owns open state, hover/focus intent, and trigger-card association via triggerId/handle.",
  },
];

const PREVIEW_CARD_PORTAL_PROPS: readonly PropRow[] = [
  {
    name: "container",
    type: "HTMLElement | RefObject | null",
    description: "Custom portal container for framed previews or contained overlays.",
  },
  {
    name: "...props",
    type: "Base UI PreviewCard.Portal.Props",
    description: "Portals the preview card to the body or a custom container.",
  },
];

const PREVIEW_CARD_TRIGGER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI PreviewCard.Trigger.Props",
    description:
      "Trigger affordance and positioning anchor. Renders an <a> by default; use render to compose the actual link element and keep styling on the semantic element.",
  },
];

const PREVIEW_CARD_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI Popup + Positioner props",
    description:
      "Portaled floating card. Defaults to side=bottom, align=start, sideOffset=6, disableAnchorTracking=true, and forwards anchor/collision/sticky positioning props.",
  },
];

const PREVIEW_CARD_POPUP_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Static card shell for docs previews and non-portaled comparison panes.",
  },
];

const PREVIEW_CARD_ARROW_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Base UI PreviewCard.Arrow.Props",
    description:
      "Optional pointer triangle. Brutal hides it to match the source card, which never rendered one.",
  },
];

const PREVIEW_CARD_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Leading row for an avatar or icon plus a title stack.",
  },
];

const PREVIEW_CARD_SEPARATOR_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Optional horizontal divider between the header and description.",
  },
];

const PREVIEW_CARD_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "p props",
    description: "Primary heading, typically the previewed entity's name.",
  },
];

const PREVIEW_CARD_DESCRIPTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "p props",
    description: "Supporting copy or status line for the previewed entity.",
  },
];

export const Route = createFileRoute("/components/preview-card")({
  component: PreviewCardDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
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
            <span className="truncate font-mono text-xs text-foreground-muted in-data-[theme=brutal]:text-black/60">
              Online
            </span>
          </div>
          <div className="truncate font-mono text-xs text-foreground-muted in-data-[theme=brutal]:text-black/60">
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
  return (
    <div className="relative flex justify-center">
      <PreviewCard defaultOpen defaultTriggerId="preview-card-preview-trigger">
        <PreviewCardTrigger
          id="preview-card-preview-trigger"
          render={
            <Link
              to="/components/avatar"
              className="cursor-default select-text font-sans font-bold text-foreground underline decoration-foreground-strong/30 decoration-2 underline-offset-2 in-data-[theme=brutal]:text-black in-data-[theme=brutal]:decoration-black/30"
            />
          }
        >
          @Atlas
        </PreviewCardTrigger>
        <PreviewCardContent className="w-[17.5rem]">
          <MentionCardBody />
        </PreviewCardContent>
      </PreviewCard>
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
        <Preview previewClassName="min-h-[22rem] items-start pt-24">
          <Preview.Canvas>
            <DefaultOpenPreviewCard />
          </Preview.Canvas>
          <Preview.Code html={code.preview} />
        </Preview>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="usage" title="Usage">
        <DocSubsection parentId="usage" id="mention-hover-card" title="Mention hover card">
          <DocNote>
            Hover or focus the @Atlas link below. <InlineCode>delay</InlineCode> /{" "}
            <InlineCode>closeDelay</InlineCode> default to <InlineCode>80ms</InlineCode> /{" "}
            <InlineCode>40ms</InlineCode> so repeated message previews stay responsive.
          </DocNote>
          <Preview previewClassName="min-h-[18rem] items-start pt-8">
            <Preview.Canvas>
              <PreviewCardMentionComposition />
            </Preview.Canvas>
            <Preview.Code html={code.usage} />
          </Preview>
        </DocSubsection>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection parentId="api" id="api-preview-card" title="PreviewCard">
            <PropsTable rows={PREVIEW_CARD_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-preview-card-portal" title="PreviewCardPortal">
            <PropsTable rows={PREVIEW_CARD_PORTAL_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-preview-card-trigger" title="PreviewCardTrigger">
            <PropsTable rows={PREVIEW_CARD_TRIGGER_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-preview-card-content" title="PreviewCardContent">
            <PropsTable rows={PREVIEW_CARD_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-preview-card-popup" title="PreviewCardPopup">
            <PropsTable rows={PREVIEW_CARD_POPUP_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-preview-card-arrow" title="PreviewCardArrow">
            <PropsTable rows={PREVIEW_CARD_ARROW_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-preview-card-header" title="PreviewCardHeader">
            <PropsTable rows={PREVIEW_CARD_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-preview-card-separator"
            title="PreviewCardSeparator"
          >
            <PropsTable rows={PREVIEW_CARD_SEPARATOR_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-preview-card-title" title="PreviewCardTitle">
            <PropsTable rows={PREVIEW_CARD_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-preview-card-description"
            title="PreviewCardDescription"
          >
            <PropsTable rows={PREVIEW_CARD_DESCRIPTION_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>
    </DocPage>
  );
}
