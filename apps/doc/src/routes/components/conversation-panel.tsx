import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ConversationPanelRoot } from "raft-ui/wip";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
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
import { ConversationPanelEmptyStateComposition } from "#/modules/conversation-panel/compositions/conversation-panel-empty-state.composition.tsx";
import conversationPanelEmptyStateCompositionSource from "#/modules/conversation-panel/compositions/conversation-panel-empty-state.composition.tsx?raw";
import {
  ConversationPanelChannelHeaderComposition,
  ConversationPanelDmHeaderComposition,
  ConversationPanelSectionHeaderComposition,
} from "#/modules/conversation-panel/compositions/conversation-panel-header.composition.tsx";
import conversationPanelHeaderCompositionSource from "#/modules/conversation-panel/compositions/conversation-panel-header.composition.tsx?raw";
import { NativeScrollPaginationComposition } from "#/modules/conversation-panel/compositions/native-scroll-pagination.composition.tsx";
import nativeScrollPaginationCompositionSource from "#/modules/conversation-panel/compositions/native-scroll-pagination.composition.tsx?raw";
import { SourceConversationPanelPreview } from "#/modules/conversation-panel/conversation-panel.source-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CONVERSATIONS = ["channel", "dm"] as const;

const TOC = [
  { id: "preview", title: "Preview" },
  { id: "anatomy", title: "Anatomy" },
  { id: "combinations", title: "Combinations" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  anatomy: `<ConversationPanelRoot>
  <ConversationPanelHeader>
    <ConversationPanelHeaderIcon />
    <ConversationPanelHeaderContent>
      <ConversationPanelHeading>
        <ConversationPanelTitle />
        <ConversationPanelStatus />
      </ConversationPanelHeading>
      <ConversationPanelMeta />
    </ConversationPanelHeaderContent>
    <ConversationPanelActions>
      <PanelAction>
        <Search />
      </PanelAction>
    </ConversationPanelActions>
  </ConversationPanelHeader>
  <ConversationPanelContent>
    <ConversationPanelTabs />
    <ConversationPanelBody>
      <MessageList />
      <ScrollToLatest />
    </ConversationPanelBody>
    <ConversationPanelFooter>
      <ComposerRoot>
        <Composer />
      </ComposerRoot>
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
  conversationPanelEmptyStateComposition: conversationPanelEmptyStateCompositionSource,
  conversationPanelHeaderComposition: conversationPanelHeaderCompositionSource,
  nativeScrollPaginationComposition: nativeScrollPaginationCompositionSource,
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
    description: "Full-height active conversation surface between sidebar and panel stack.",
  },
  {
    name: "ConversationPanelHeader / HeaderIcon / HeaderContent / Heading",
    type: "div props",
    description: "Header structure for caller-owned leading content, title metadata, and actions.",
  },
  {
    name: "ConversationPanelSectionHeader",
    type: "div props",
    description:
      "Top-level section header with the reusable Brutal mobile accent treatment and standard Elegant header treatment.",
  },
  {
    name: "ConversationPanelTitle / Meta / Status / Actions",
    type: "div / span props",
    description:
      "Explicit title content and action regions; set ConversationPanelStatus mobileVisible when its caller-owned status must remain visible on mobile.",
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
    name: "ConversationPanelTabs / Body / Timeline / MessageList / Footer",
    type: "div / form props",
    description:
      "Tab chrome, scroll owner, list flow, and floating footer boundary. Override --panel-footer-clearance on the root when a custom composer needs more or less than the 10rem default.",
  },
  {
    name: "ScrollToLatest",
    type: "div / button props",
    description: "Explicit positioning layout and independently rendered jump button.",
  },
  {
    name: "ConversationPanelEmptyState / EmptyStateBrand / EmptyStateBrandMark",
    type: "div props",
    description:
      "Centered inactive-panel state with an optional nested brand treatment. The caller owns its icon and copy.",
  },
  {
    name: "ComposerAttachment*",
    type: "div / span / img / button props",
    description:
      "Pending-upload strip above the composer: image and file tiles, uploading/failed overlays, progress bar, and remove affordance.",
  },
  {
    name: "ComposerDropOverlay / DropOverlayLabel",
    type: "div / span props",
    description: "Drag-and-drop overlay covering the composer form while files hover over it.",
  },
  {
    name: "Composer*",
    type: "div / span / textarea / button props",
    description: "Composer parts rendered inside ConversationPanelFooter via ComposerRoot.",
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
      overview={
        <Differences from="Main chat content">
          <li>does not own message data, footer content, routing, or realtime subscriptions</li>
          <li>owns the panel header, tabs, content surface, scroll body, and footer boundary</li>
          <li>keeps product state and visible business structure in caller compositions</li>
        </Differences>
      }
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

      <DocSection id="combinations" title="Combinations" showThemeSwitcher>
        <PreviewGrid>
          <PreviewPane label="Native scroll pagination">
            <PreviewThemeScope className="h-full">
              <NativeScrollPaginationComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Muted channel header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ConversationPanelChannelHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Direct message header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ConversationPanelDmHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Top-level section header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ConversationPanelSectionHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Banner and jump-to-latest">
            <PreviewThemeScope className="h-full">
              <CurrentConversationPanelPreview
                notificationError="Couldn’t update Activity mute for this conversation."
                newMessageCount={3}
              />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="No active conversation">
            <PreviewThemeScope className="h-full">
              <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-theme=elegant]_&]:bg-layer-page">
                <ConversationPanelEmptyStateComposition />
              </div>
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path="apps/doc/src/modules/conversation-panel/compositions/native-scroll-pagination.composition.tsx"
          source={SNIPPETS.nativeScrollPaginationComposition}
          html={code.nativeScrollPaginationComposition}
          showLineNumbers={false}
        />
        <DocsCodeBlock.Panel
          path="apps/doc/src/modules/conversation-panel/compositions/conversation-panel-header.composition.tsx"
          source={SNIPPETS.conversationPanelHeaderComposition}
          html={code.conversationPanelHeaderComposition}
          showLineNumbers={false}
        />
        <DocsCodeBlock.Panel
          path="apps/doc/src/modules/conversation-panel/compositions/conversation-panel-empty-state.composition.tsx"
          source={SNIPPETS.conversationPanelEmptyStateComposition}
          html={code.conversationPanelEmptyStateComposition}
          showLineNumbers={false}
        />
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
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-white p-2">
        {children}
      </div>
    </div>
  );
}

function HeaderPreview({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-theme=elegant]_&]:bg-layer-page">
      <ConversationPanelRoot>{children}</ConversationPanelRoot>
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
