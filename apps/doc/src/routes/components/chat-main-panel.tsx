import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ChatMainPanelRoot } from "raft-ui/wip";

import { ComponentPlayground } from "#/components/component-playground.tsx";
import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import {
  ChatMainPanelComposition,
  type ChatMainPanelCompositionProps,
} from "#/modules/chat-main-panel/compositions/chat-main-panel.composition.tsx";
import chatMainPanelCompositionSource from "#/modules/chat-main-panel/compositions/chat-main-panel.composition.tsx?raw";
import {
  ChatMainPanelChannelHeaderComposition,
  ChatMainPanelDmHeaderComposition,
  ChatMainPanelSectionHeaderComposition,
} from "#/modules/chat-main-panel/compositions/chat-main-panel-header.composition.tsx";
import chatMainPanelHeaderCompositionSource from "#/modules/chat-main-panel/compositions/chat-main-panel-header.composition.tsx?raw";
import { SourceMainPanelPreview } from "#/modules/chat-main-panel/chat-main-panel.source-preview.tsx";
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
  anatomy: `<ChatMainPanelRoot>
  <ChatMainPanelHeader>
    <ChatMainPanelHeaderIcon />
    <ChatMainPanelTitleBlock>
      <ChatMainPanelTitle />
      <ChatMainPanelSubtitle />
    </ChatMainPanelTitleBlock>
    <ChatMainPanelActions>
      <PanelButton>
        <PanelButtonIcon />
      </PanelButton>
    </ChatMainPanelActions>
  </ChatMainPanelHeader>
  <ChatMainPanelContent>
    <ChatMainPanelTabs />
    <ChatMainPanelBody>
      <ChatMainPanelTimeline>
        <ChatMainPanelMessageList />
      </ChatMainPanelTimeline>
      <ChatMainPanelJumpToLatestLayout>
        <ChatMainPanelJumpToLatest />
      </ChatMainPanelJumpToLatestLayout>
    </ChatMainPanelBody>
    <ChatMainPanelFooter>
      <ComposerRoot>
        <Composer />
      </ComposerRoot>
    </ChatMainPanelFooter>
  </ChatMainPanelContent>
</ChatMainPanelRoot>`,
  chatMainPanelComposition: chatMainPanelCompositionSource,
  chatMainPanelHeaderComposition: chatMainPanelHeaderCompositionSource,
} as const;

type PlaygroundValues = {
  conversation: NonNullable<ChatMainPanelCompositionProps["conversation"]>;
  muted: boolean;
  banner: boolean;
  jumpToLatest: boolean;
};

const PROPS: readonly PropRow[] = [
  {
    name: "ChatMainPanelRoot",
    type: "section props",
    description: "Full-height active conversation surface between sidebar and panel stack.",
  },
  {
    name: "ChatMainPanelHeader / HeaderIcon / TitleBlock / TitleRow",
    type: "div props",
    description: "Header structure for caller-owned leading content, title metadata, and actions.",
  },
  {
    name: "ChatMainPanelSectionHeader",
    type: "div props",
    description:
      "Top-level section header with the reusable Brutal mobile accent treatment and standard Elegant header treatment.",
  },
  {
    name: "ChatMainPanelTitle / Subtitle / TitleBadge / Actions",
    type: "div / span props",
    description: "Explicit title content and action regions; business copy remains caller-owned.",
  },
  {
    name: "PanelButton",
    type: "button props",
    description: "Shared panel action root for search, details, and app-owned commands.",
  },
  {
    name: "PanelButtonIcon / Label / Count",
    type: "span props",
    description:
      "Explicit content parts. Label is hidden below md and enters layout at md; Icon and Count remain visible at every size.",
  },
  {
    name: "ChatMainPanelContent",
    type: "div props",
    description: "Single content surface below the header, containing tabs, body, and footer.",
  },
  {
    name: "ChatMainPanelTabs / Body / Timeline / MessageList / Footer",
    type: "div / form props",
    description: "Tab chrome, positioned body, scroll owner, list flow, and footer boundary.",
  },
  {
    name: "ChatMainPanelJumpToLatestLayout / JumpToLatest",
    type: "div / button props",
    description: "Explicit positioning layout and independently rendered jump button.",
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
    description: "Composer parts rendered inside ChatMainPanelFooter via ComposerRoot.",
  },
];

export const Route = createFileRoute("/components/chat-main-panel")({
  component: ChatMainPanelDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatMainPanelDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatMainPanel"
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
              <ChatMainPanelComposition
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
      </DocSection>

      <DocSection id="combinations" title="Combinations" showThemeSwitcher>
        <PreviewGrid>
          <PreviewPane label="Muted channel header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ChatMainPanelChannelHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Direct message header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ChatMainPanelDmHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Top-level section header">
            <PreviewThemeScope className="h-full">
              <HeaderPreview>
                <ChatMainPanelSectionHeaderComposition />
              </HeaderPreview>
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Banner and jump-to-latest">
            <PreviewThemeScope className="h-full">
              <CurrentMainPanelPreview
                notificationError="Couldn’t update Activity mute for this conversation."
                newMessageCount={3}
              />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path="apps/doc/src/modules/chat-main-panel/compositions/chat-main-panel-header.composition.tsx"
          source={SNIPPETS.chatMainPanelHeaderComposition}
          html={code.chatMainPanelHeaderComposition}
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
              <SourceMainPanelPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <CurrentMainPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <CurrentMainPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <CurrentMainPanelPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path="apps/doc/src/modules/chat-main-panel/compositions/chat-main-panel.composition.tsx"
          source={SNIPPETS.chatMainPanelComposition}
          html={code.chatMainPanelComposition}
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
      <ChatMainPanelRoot>{children}</ChatMainPanelRoot>
    </div>
  );
}

function CurrentMainPanelPreview(props: ChatMainPanelCompositionProps) {
  return (
    <div className="h-full w-[560px] shrink-0 overflow-hidden bg-layer-panel [[data-theme=elegant]_&]:bg-layer-page">
      <ChatMainPanelComposition {...props} />
    </div>
  );
}
