import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
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
  anatomy: `<ConversationPanelRoot>
  <ConversationPanelHeader>
    {/* Sticks to the top on mobile by default. */}
    {/* optional caller-owned leading content */}
    <ConversationPanelHeaderIcon />
    <ConversationPanelHeaderContent>
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

type PlaygroundValues = {
  conversation: NonNullable<ConversationPanelCompositionProps["conversation"]>;
  muted: boolean;
  banner: boolean;
  jumpToLatest: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "ConversationPanelRoot",
    type: "section props",
    description:
      'Full-height active conversation surface between sidebar and panel stack. Set mobileScroll="page" to release internal scroll on mobile so the panel joins the document scroll, stickies its tabs, and fixes its composer footer.',
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
    description: "Optional leading icon slot for a channel or section header.",
  },
  {
    name: "ConversationPanelHeaderContent",
    type: "div props",
    description: "Flexible header-content region for title, metadata, and status parts.",
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

function ConversationPanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ConversationPanel"
      description="Active conversation panel between chat sidebar and panel stack."
      toc={TOC}
    >
      <DocSection id="preview" title="Preview" showThemeSwitcher>
        <ComponentPlayground<PlaygroundValues>
          defaultValues={{
            conversation: "channel",
            muted: false,
            banner: false,
            jumpToLatest: false,
          }}
          controls={[
            {
              name: "conversation",
              label: "Conversation",
              type: "select",
              options: CONVERSATIONS,
            },
            { name: "muted", label: "Muted", type: "boolean" },
            { name: "banner", label: "Banner", type: "boolean" },
            { name: "jumpToLatest", label: "Jump", type: "boolean" },
          ]}
          previewClassName="!min-h-[32rem] !items-stretch !p-0"
          render={(values) => (
            <div className="h-[32rem] w-full min-w-0 overflow-hidden">
              <ConversationPanelComposition
                conversation={values.conversation}
                muted={values.muted}
                notificationError={
                  values.banner ? "Couldn’t update Activity mute for this conversation." : null
                }
                newMessageCount={values.jumpToLatest ? 3 : 0}
              />
            </div>
          )}
        />
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
