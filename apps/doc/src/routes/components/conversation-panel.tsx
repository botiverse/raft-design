import { createFileRoute } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
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

const PROPS: readonly PropRow[] = [
  {
    name: "ConversationPanelRoot",
    type: "section props",
    description:
      "Full-height active conversation surface between sidebar and panel stack. Product shells own responsive placement and scroll behavior.",
  },
  {
    name: "ConversationPanelHeader",
    type: "div props",
    description:
      "Header layout for caller-owned leading content, title metadata, and actions. It sticks to the top on mobile by default.",
  },
  {
    name: "ConversationPanelSectionHeader",
    type: "div props",
    description:
      "Top-level section header with the reusable Brutal mobile accent treatment and standard Elegant header treatment.",
  },
  {
    name: "ConversationPanelHeaderIcon",
    type: "div props",
    description:
      "Optional identity icon. Put it inside HeaderContent to align it with the title on mobile.",
  },
  {
    name: "ConversationPanelHeaderContent",
    type: "div props",
    description:
      "Flexible identity region for an optional icon, title, metadata, and status parts.",
  },
  {
    name: "ConversationPanelHeading",
    type: "div props",
    description: "Optional inline group for a title and its adjacent status.",
  },
  {
    name: "ConversationPanelTitle",
    type: "div props",
    description: "Caller-owned conversation or section title.",
  },
  {
    name: "ConversationPanelMeta",
    type: 'div props & { size?: "sm" | "md" }',
    description: "Optional secondary metadata below or alongside the title.",
  },
  {
    name: "ConversationPanelStatus",
    type: "span props",
    description: "Optional caller-owned status. It remains visible on mobile by default.",
  },
  {
    name: "ConversationPanelActions",
    type: "div props",
    description:
      "Optional action region for caller-owned PanelAction and PanelToggleAction controls.",
  },
  {
    name: "PanelAction",
    type: "button props",
    description:
      "Panel action root for direct icon, text, and count children. It owns icon sizing and tabular number alignment.",
  },
  {
    name: "PanelToggleAction",
    type: "Toggle button props",
    description:
      "Controlled pressed action for binary panel state. Pass pressed and onPressedChange; the caller owns the icon and accessible label for each state.",
  },
  {
    name: "ConversationPanelContent",
    type: "div props",
    description: "Single content region below the header, containing tabs, body, and footer.",
  },
  {
    name: "ConversationPanelTabs",
    type: "div props",
    description: "Optional tab-chrome region. The caller provides the tab primitive and labels.",
  },
  {
    name: "ConversationPanelBody",
    type: "div props",
    description: "Scroll boundary for caller-owned message or task content.",
  },
  {
    name: "ConversationPanelFooter",
    type: "div props",
    description:
      "Optional floating footer boundary. Override --panel-footer-clearance on the root when custom footer content needs more or less than the 10rem default.",
  },
  {
    name: "ConversationPanelEmptyState",
    type: "div props",
    description: "Centered inactive-panel state. The caller owns its icon and copy.",
  },
  {
    name: "ConversationPanelEmptyStateBrand",
    type: "div props",
    description: "Optional brand wrapper for the empty state.",
  },
  {
    name: "ConversationPanelEmptyStateBrandMark",
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
        <PropsTable rows={PROPS} />
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
