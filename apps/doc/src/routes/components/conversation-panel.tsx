import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection, DocSubsection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { Preview } from "#/components/preview.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import {
  ConversationPanelComposition,
  type ConversationPanelCompositionProps,
} from "#/modules/conversation-panel/compositions/conversation-panel.composition.tsx";
import conversationPanelCompositionSource from "#/modules/conversation-panel/compositions/conversation-panel.composition.tsx?raw";
import { SourceConversationPanelPreview } from "#/modules/conversation-panel/conversation-panel.source-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CONVERSATIONS = ["channel", "dm"] as const;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  preview: `<ConversationPanelComposition conversation="channel" />`,
  anatomy: `<ConversationPanelRoot>
  <ConversationPanelHeader>
    {/* Sticks to the top on mobile by default. */}
    <ConversationPanelHeaderContent>
      {/* optional caller-owned identity; it shares the title row on mobile */}
      <ConversationPanelHeaderIcon />
      {/* use Heading when Title and Status form one group */}
      <ConversationPanelHeading>
        <ConversationPanelTitle />
        {/* optional */}
        <ConversationPanelStatus />
      </ConversationPanelHeading>
      {/* optional */}
      <ConversationPanelMeta />
    </ConversationPanelHeaderContent>
    {/* optional caller-owned actions */}
    <ConversationPanelActions>
      {/* PanelAction / PanelToggleAction */}
    </ConversationPanelActions>
  </ConversationPanelHeader>

  {/* optional caller-owned state layer, e.g. Banner */}

  <ConversationPanelContent>
    {/* optional caller-owned tabs */}
    <ConversationPanelTabs />
    <ConversationPanelBody>
      {/* caller-owned scroll content, e.g. MessageList and ScrollToLatest */}
    </ConversationPanelBody>
    {/* optional caller-owned footer */}
    <ConversationPanelFooter>
      {/* e.g. ComposerRoot */}
    </ConversationPanelFooter>
  </ConversationPanelContent>
</ConversationPanelRoot>`,
  emptyStateAnatomy: `<ConversationPanelRoot>
  <ConversationPanelEmptyState>
    <ConversationPanelEmptyStateBrand>
      <ConversationPanelEmptyStateBrandMark />
    </ConversationPanelEmptyStateBrand>
    <span>Select a conversation</span>
  </ConversationPanelEmptyState>
</ConversationPanelRoot>`,
  conversationPanelComposition: conversationPanelCompositionSource,
} as const;

const CONVERSATION_PANEL_ROOT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "section props",
    description:
      "Full-height active conversation surface between sidebar and panel stack. Product shells own responsive placement and scroll behavior.",
  },
];

const CONVERSATION_PANEL_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Header layout for caller-owned leading content, title metadata, and actions. It sticks to the top on mobile by default.",
  },
];

const CONVERSATION_PANEL_SECTION_HEADER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Top-level section header with the reusable Brutal mobile accent treatment and standard Elegant header treatment.",
  },
];

const CONVERSATION_PANEL_HEADER_ICON_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Optional identity icon. Put it inside HeaderContent to align it with the title on mobile.",
  },
];

const CONVERSATION_PANEL_HEADER_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Flexible identity region for an optional icon, title, metadata, and status parts.",
  },
];

const CONVERSATION_PANEL_HEADING_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Optional inline group for a title and its adjacent status.",
  },
];

const CONVERSATION_PANEL_TITLE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Caller-owned conversation or section title.",
  },
];

const CONVERSATION_PANEL_META_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: 'div props & { size?: "sm" | "md" }',
    description: "Optional secondary metadata below or alongside the title.",
  },
];

const CONVERSATION_PANEL_STATUS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "span props",
    description: "Optional caller-owned status. It remains visible on mobile by default.",
  },
];

const CONVERSATION_PANEL_ACTIONS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Optional action region for caller-owned PanelAction and PanelToggleAction controls.",
  },
];

const PANEL_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "button props",
    description:
      "Panel action root for direct icon, text, and count children. It owns icon sizing and tabular number alignment.",
  },
];

const PANEL_TOGGLE_ACTION_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "Toggle button props",
    description:
      "Controlled pressed action for binary panel state. Pass pressed and onPressedChange; the caller owns the icon and accessible label for each state.",
  },
];

const CONVERSATION_PANEL_CONTENT_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Single content region below the header, containing tabs, body, and footer.",
  },
];

const CONVERSATION_PANEL_TABS_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Optional tab-chrome region. The caller provides the tab primitive and labels.",
  },
];

const CONVERSATION_PANEL_BODY_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Scroll boundary for caller-owned message or task content.",
  },
];

const CONVERSATION_PANEL_FOOTER_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description:
      "Optional floating footer boundary. Override --panel-footer-clearance on the root when custom footer content needs more or less than the 10rem default.",
  },
];

const CONVERSATION_PANEL_EMPTY_STATE_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Centered inactive-panel state. The caller owns its icon and copy.",
  },
];

const CONVERSATION_PANEL_EMPTY_STATE_BRAND_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Optional brand wrapper for the empty state.",
  },
];

const CONVERSATION_PANEL_EMPTY_STATE_BRAND_MARK_PROPS: readonly PropRow[] = [
  {
    name: "...props",
    type: "div props",
    description: "Optional inner mark frame for caller-owned brand artwork.",
  },
];

export const Route = createFileRoute("/components/conversation-panel")({
  component: ConversationPanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ConversationPanelPreview({
  code,
  collapsedCode,
}: {
  code: ReturnType<typeof Route.useLoaderData>["preview"];
  collapsedCode?: ReturnType<typeof Route.useLoaderData>["previewBody"];
}) {
  const [conversation, setConversation] =
    useState<NonNullable<ConversationPanelCompositionProps["conversation"]>>("channel");
  const [muted, setMuted] = useState(false);
  const [banner, setBanner] = useState(false);
  const [jumpToLatest, setJumpToLatest] = useState(false);

  return (
    <Preview previewInset="flush" previewClassName="min-h-[32rem]">
      <Preview.Canvas>
        <div className="h-[32rem] w-full min-w-0 overflow-hidden">
          <ConversationPanelComposition
            conversation={conversation}
            muted={muted}
            notificationError={
              banner ? "Couldn’t update Activity mute for this conversation." : null
            }
            newMessageCount={jumpToLatest ? 3 : 0}
          />
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Conversation" htmlFor="conversation-panel-preview-conversation">
          <Preview.Select
            id="conversation-panel-preview-conversation"
            label="Conversation"
            options={CONVERSATIONS}
            value={conversation}
            onValueChange={(value) =>
              setConversation(
                value as NonNullable<ConversationPanelCompositionProps["conversation"]>,
              )
            }
          />
        </Preview.Control>
        <Preview.Control label="Muted" htmlFor="conversation-panel-preview-muted">
          <Preview.Checkbox
            id="conversation-panel-preview-muted"
            label="Muted"
            checked={muted}
            onCheckedChange={setMuted}
          />
        </Preview.Control>
        <Preview.Control label="Banner" htmlFor="conversation-panel-preview-banner">
          <Preview.Checkbox
            id="conversation-panel-preview-banner"
            label="Banner"
            checked={banner}
            onCheckedChange={setBanner}
          />
        </Preview.Control>
        <Preview.Control label="Jump" htmlFor="conversation-panel-preview-jump">
          <Preview.Checkbox
            id="conversation-panel-preview-jump"
            label="Jump"
            checked={jumpToLatest}
            onCheckedChange={setJumpToLatest}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
  );
}

function ConversationPanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ConversationPanel"
      description="Active conversation panel between chat sidebar and panel stack."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ConversationPanelPreview code={code.preview} collapsedCode={code.previewBody} />
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.anatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
        <DocsCodeBlock>
          <DocsCodeBlock.Body>
            <DocsCodeBlock.Content html={code.emptyStateAnatomy} />
          </DocsCodeBlock.Body>
        </DocsCodeBlock>
      </DocSection>

      <DocSection id="api" title="API">
        <div className="space-y-6">
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-root"
            title="ConversationPanelRoot"
          >
            <PropsTable rows={CONVERSATION_PANEL_ROOT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-header"
            title="ConversationPanelHeader"
          >
            <PropsTable rows={CONVERSATION_PANEL_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-section-header"
            title="ConversationPanelSectionHeader"
          >
            <PropsTable rows={CONVERSATION_PANEL_SECTION_HEADER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-header-icon"
            title="ConversationPanelHeaderIcon"
          >
            <PropsTable rows={CONVERSATION_PANEL_HEADER_ICON_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-header-content"
            title="ConversationPanelHeaderContent"
          >
            <PropsTable rows={CONVERSATION_PANEL_HEADER_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-heading"
            title="ConversationPanelHeading"
          >
            <PropsTable rows={CONVERSATION_PANEL_HEADING_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-title"
            title="ConversationPanelTitle"
          >
            <PropsTable rows={CONVERSATION_PANEL_TITLE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-meta"
            title="ConversationPanelMeta"
          >
            <PropsTable rows={CONVERSATION_PANEL_META_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-status"
            title="ConversationPanelStatus"
          >
            <PropsTable rows={CONVERSATION_PANEL_STATUS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-actions"
            title="ConversationPanelActions"
          >
            <PropsTable rows={CONVERSATION_PANEL_ACTIONS_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-action" title="PanelAction">
            <PropsTable rows={PANEL_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection parentId="api" id="api-panel-toggle-action" title="PanelToggleAction">
            <PropsTable rows={PANEL_TOGGLE_ACTION_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-content"
            title="ConversationPanelContent"
          >
            <PropsTable rows={CONVERSATION_PANEL_CONTENT_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-tabs"
            title="ConversationPanelTabs"
          >
            <PropsTable rows={CONVERSATION_PANEL_TABS_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-body"
            title="ConversationPanelBody"
          >
            <PropsTable rows={CONVERSATION_PANEL_BODY_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-footer"
            title="ConversationPanelFooter"
          >
            <PropsTable rows={CONVERSATION_PANEL_FOOTER_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-empty-state"
            title="ConversationPanelEmptyState"
          >
            <PropsTable rows={CONVERSATION_PANEL_EMPTY_STATE_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-empty-state-brand"
            title="ConversationPanelEmptyStateBrand"
          >
            <PropsTable rows={CONVERSATION_PANEL_EMPTY_STATE_BRAND_PROPS} />
          </DocSubsection>
          <DocSubsection
            parentId="api"
            id="api-conversation-panel-empty-state-brand-mark"
            title="ConversationPanelEmptyStateBrandMark"
          >
            <PropsTable rows={CONVERSATION_PANEL_EMPTY_STATE_BRAND_MARK_PROPS} />
          </DocSubsection>
        </div>
      </DocSection>

      <DocSection id="source-comparison" title="Source comparison">
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourceConversationPanelPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <CurrentConversationPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <CurrentConversationPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <CurrentConversationPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path="apps/doc/src/modules/conversation-panel/compositions/conversation-panel.composition.tsx"
          source={SNIPPETS.conversationPanelComposition}
          html={code.conversationPanelComposition}
          showLineNumbers={false}
        />
      </DocSection>
    </DocPage>
  );
}

function PreviewGrid({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}

function PreviewPane({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 overflow-hidden rounded-none border border-line bg-layer-panel">
      <div className="border-b border-line bg-layer-muted px-3 py-2 text-xs font-medium text-foreground-muted">
        {label}
      </div>
      <div className="flex h-[420px] overflow-x-auto bg-white p-2">
        <div className="flex h-full min-w-full justify-center">{children}</div>
      </div>
    </div>
  );
}

function CurrentConversationPanelPreview(props: ConversationPanelCompositionProps) {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-theme=elegant]_&]:bg-layer-page">
      <ConversationPanelComposition {...props} />
    </div>
  );
}
