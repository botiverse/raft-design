import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { ChatRailComposition } from "#/compositions/chat-rail-composition.tsx";
import chatRailCompositionSource from "#/compositions/chat-rail-composition.tsx?raw";
import { SourceChatRailPreview } from "#/compositions/source-chat-rail-preview.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const CHAT_RAIL_COMPOSITION_PATH = "apps/doc/src/compositions/chat-rail-composition.tsx";

const TOC = [
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
  { id: "source-comparison", title: "Source comparison" },
] as const;

const SNIPPETS = {
  chatRailComposition: chatRailCompositionSource,
  anatomy: `import {
  ChatShellRail,
  ChatRailRoot,
  ChatRailHeader,
  ChatRailServerButton,
  ChatRailNav,
  ChatRailItem,
  ChatRailItemIcon,
  ChatRailItemLabel,
  ChatRailItemBadge,
  ChatRailItemIndicator,
  ChatRailFooter,
} from "raft-ui/wip";

<ChatShellRail>
  <ChatRailRoot value={value} onValueChange={setValue}>
    <ChatRailHeader>
      <ChatRailServerButton aria-label="Switch server">R</ChatRailServerButton>
    </ChatRailHeader>
    <ChatRailNav>
      <ChatRailItem value="chat">
        <ChatRailItemIcon><MessageSquare /></ChatRailItemIcon>
        <ChatRailItemLabel>Chat</ChatRailItemLabel>
        <ChatRailItemBadge>3</ChatRailItemBadge>
      </ChatRailItem>
    </ChatRailNav>
    <ChatRailFooter>
      <ChatRailItem value="settings">
        <ChatRailItemIcon><Settings /></ChatRailItemIcon>
        <ChatRailItemLabel>Settings</ChatRailItemLabel>
      </ChatRailItem>
    </ChatRailFooter>
  </ChatRailRoot>
</ChatShellRail>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ChatShellRail",
    type: "aside props & { hidden?: boolean }",
    description:
      "Desktop rail column. Hidden by default below md to match source mobile ownership.",
  },
  {
    name: "ChatRailRoot",
    type: "{ value?: string; onValueChange?: (value: string) => void }",
    description: "Optional controlled selection context. Routing and tab memory stay app-owned.",
  },
  {
    name: "ChatRailHeader / Nav / Footer",
    type: "div / nav props",
    description:
      "Source-faithful vertical regions for server switcher, rail actions, and settings.",
  },
  {
    name: "ChatRailItem*",
    type: "button + span props",
    description: "Composable icon, label, badge, and indicator parts for app-owned rail actions.",
  },
];

export const Route = createFileRoute("/components/chat-rail")({
  component: ChatRailDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatRailDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatRail"
      description="Controlled rail structure for server switching, app mode navigation, unread badges, and footer actions."
      overview={
        <Differences from="LeftRail">
          <li>
            does not import stores, router memory, server unread summaries, or notification wiring
          </li>
          <li>
            keeps the source rail geometry: yellow column, 64px desktop width, square icon slots
          </li>
          <li>
            selection is optional controlled state; app code decides where each value navigates
          </li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="chat-rail.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
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
              <SourceChatRailPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <ChatRailComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <ChatRailComposition />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <ChatRailComposition />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
        <DocsCodeBlock.Panel
          path={CHAT_RAIL_COMPOSITION_PATH}
          source={chatRailCompositionSource}
          html={code.chatRailComposition}
          collapsedHtml={code.chatRailCompositionBody}
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
      <div className="flex h-[586px] items-stretch justify-start overflow-hidden bg-background p-2">
        {children}
      </div>
    </div>
  );
}
