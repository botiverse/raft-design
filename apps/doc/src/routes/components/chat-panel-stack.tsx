import { createFileRoute } from "@tanstack/react-router";
import {
  ChatPanelResizeHandle,
  ChatPanelStackContent,
  ChatPanelStackItem,
  ChatPanelStackRoot,
  ChatShellPanelStack,
} from "raft-ui/wip";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Differences } from "#/components/differences.tsx";
import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { DocsCodeBlock } from "#/components/docs-code-block.tsx";
import { PreviewThemeScope } from "#/components/preview-theme.tsx";
import { PropsTable, type PropRow } from "#/components/props-table.tsx";
import { SourceThemeScope } from "#/components/source-theme-scope.tsx";
import { highlightSnippets } from "#/lib/highlight.tsx";

const TOC = [
  { id: "source-comparison", title: "Source comparison" },
  { id: "anatomy", title: "Anatomy" },
  { id: "api", title: "API" },
] as const;

const SNIPPETS = {
  anatomy: `import {
  ChatShellPanelStack,
  ChatPanelStackRoot,
  ChatPanelStackItem,
  ChatPanelStackContent,
  ChatPanelResizeHandle,
} from "raft-ui/wip";

<ChatShellPanelStack>
  <ChatPanelStackRoot resizable>
    <ChatPanelStackItem>
      <ChatPanelResizeHandle />
      <ChatPanelStackContent>{threadPanel}</ChatPanelStackContent>
    </ChatPanelStackItem>
  </ChatPanelStackRoot>
</ChatShellPanelStack>`,
} as const;

const PROPS: readonly PropRow[] = [
  {
    name: "ChatShellPanelStack",
    type: "aside props & { hidden?: boolean; resizable?: boolean }",
    description:
      "Desktop right-panel host. Hidden below lg to match the source side-thread column.",
  },
  {
    name: "ChatPanelStackRoot",
    type: "div props & { resizable?: boolean }",
    description: "Stack container. It only exposes visual structure; stack order stays app-owned.",
  },
  {
    name: "ChatPanelStackItem",
    type: "section props & { open?: boolean }",
    description: "One right-panel column. Width and persistence are owned by the consumer.",
  },
  {
    name: "ChatPanelStackContent / ResizeHandle",
    type: "div props",
    description:
      "Scrollable content host and visual resize affordance. Pointer behavior is app-owned.",
  },
];

export const Route = createFileRoute("/components/chat-panel-stack")({
  component: ChatPanelStackDoc,
  loader: () => highlightSnippets({ data: SNIPPETS }),
});

function ChatPanelStackDoc() {
  const code = Route.useLoaderData();

  return (
    <DocPage
      title="ChatPanelStack"
      description="Right-side panel stack structure for thread, profile, task, and search-detail side columns."
      overview={
        <Differences from="ThreadPanelWrapper, SideThreadColumn, RightPanel">
          <li>
            does not own thread/profile/task stores, URL sync, modal fallback, or breakpoint logic
          </li>
          <li>
            keeps source side-column chrome: white panel, left divider, and left-edge resize
            affordance
          </li>
          <li>content surfaces such as ThreadPanel remain children owned by the consuming app</li>
        </Differences>
      }
      toc={TOC}
    >
      <DocSection id="source-comparison" title="Source comparison">
        <PreviewGrid>
          <PreviewPane label="Source">
            <SourceThemeScope className="h-full">
              <SourcePanelStackPreview />
            </SourceThemeScope>
          </PreviewPane>
          <PreviewPane label="Brutal">
            <PreviewThemeScope family="brutal" className="h-full">
              <PanelStackPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant">
            <PreviewThemeScope family="elegant" mode="light" className="h-full">
              <PanelStackPreview />
            </PreviewThemeScope>
          </PreviewPane>
          <PreviewPane label="Elegant dark">
            <PreviewThemeScope family="elegant" mode="dark" className="h-full dark">
              <PanelStackPreview />
            </PreviewThemeScope>
          </PreviewPane>
        </PreviewGrid>
      </DocSection>

      <DocSection id="anatomy" title="Anatomy">
        <DocsCodeBlock.Panel
          path="chat-panel-stack.tsx"
          source={SNIPPETS.anatomy}
          html={code.anatomy}
          showLineNumbers={false}
        />
      </DocSection>

      <DocSection id="api" title="API">
        <PropsTable rows={PROPS} />
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
      <div className="flex h-[420px] items-stretch justify-start overflow-x-auto bg-background p-2">
        {children}
      </div>
    </div>
  );
}

function PanelStackPreview() {
  return (
    <div className="flex h-full min-w-[920px] overflow-hidden border border-line-strong bg-layer-panel shadow-sm [[data-preview-theme=brutal]_&]:border-2 [[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-cream [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle">
      <CurrentMainContext />
      <ChatShellPanelStack className="flex h-full w-[400px] lg:flex">
        <ChatPanelStackRoot resizable>
          <ChatPanelStackItem>
            <ChatPanelResizeHandle />
            <PanelHeader title="Thread" />
            <ChatPanelStackContent>
              <div className="space-y-3 p-3">
                <MessageBlock author="Cindy">
                  The host owns width, breakpoint presentation, and persistence.
                </MessageBlock>
                <MessageBlock author="Atlas">
                  ThreadPanel content stays a child of the reusable panel column.
                </MessageBlock>
                <div className="border-t-2 border-line-strong pt-3 text-xs text-foreground-muted [[data-preview-theme=elegant]_&]:border-line-subtle">
                  Reply composer slot
                </div>
              </div>
            </ChatPanelStackContent>
          </ChatPanelStackItem>
        </ChatPanelStackRoot>
      </ChatShellPanelStack>
    </div>
  );
}

function PanelHeader({ title }: { title: string }) {
  return (
    <div className="flex h-[62px] shrink-0 items-center gap-2 border-b-2 border-line-strong bg-layer-panel px-3 [[data-preview-theme=elegant]_&]:border-line-subtle">
      <div className="min-w-0 flex-1 truncate text-sm font-bold text-foreground-strong">
        {title}
      </div>
      <button
        type="button"
        className="flex size-7 items-center justify-center border-2 border-line-strong bg-layer-panel text-foreground-strong shadow-xs [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle"
        aria-label="Close thread"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function MessageBlock({ author, children }: { author: string; children: ReactNode }) {
  return (
    <div className="border-2 border-line-strong bg-layer-panel p-3 text-sm shadow-xs [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle">
      <div className="mb-1 font-mono text-[11px] font-bold text-foreground-muted">{author}</div>
      <div className="leading-relaxed text-foreground-strong">{children}</div>
    </div>
  );
}

function SourcePanelStackPreview() {
  return (
    <div className="flex h-full min-w-[920px] overflow-hidden border-2 border-black bg-brutal-cream font-display text-black">
      <SourceMainContext />
      <div className="relative flex h-full w-[400px] shrink-0 flex-col border-l-2 border-black bg-white text-black">
        <div className="absolute bottom-0 left-0 top-0 z-10 hidden w-2 -translate-x-1 cursor-col-resize select-none md:block" />
        <div className="flex h-[62px] shrink-0 items-center gap-2 border-b-2 border-black bg-white px-3">
          <div className="min-w-0 flex-1 truncate text-sm font-bold">Thread</div>
          <button
            type="button"
            className="btn-brutal-sm flex size-7 items-center justify-center bg-white"
            aria-label="Close thread"
          >
            <X className="size-3.5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className="space-y-3 p-3">
            <SourceMessageBlock author="Cindy">
              SideThreadColumn owns persisted width and desktop resize chrome.
            </SourceMessageBlock>
            <SourceMessageBlock author="Atlas">
              ThreadPanel renders inside the host wrapper.
            </SourceMessageBlock>
            <div className="border-t-2 border-black pt-3 text-xs text-black/50">
              Reply composer slot
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceMessageBlock({ author, children }: { author: string; children: ReactNode }) {
  return (
    <div className="border-2 border-black bg-white p-3 text-sm shadow-brutal-sm">
      <div className="mb-1 font-mono text-[11px] font-bold text-black/50">{author}</div>
      <div>{children}</div>
    </div>
  );
}

function CurrentMainContext() {
  return (
    <div className="min-w-0 flex-1 bg-layer-panel p-4 [[data-preview-theme=brutal]_&]:bg-white">
      <div className="mb-4 h-8 w-48 border-b-2 border-line-strong text-lg font-bold text-foreground-strong [[data-preview-theme=elegant]_&]:border-line-subtle">
        #proj-uiux
      </div>
      <div className="space-y-3">
        <div className="h-14 border-2 border-line-strong bg-layer-panel shadow-sm [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle [[data-preview-theme=brutal]_&]:bg-white" />
        <div className="h-20 border-2 border-line-strong bg-layer-panel shadow-sm [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle [[data-preview-theme=brutal]_&]:bg-white" />
        <div className="h-10 border-2 border-line-strong bg-layer-muted [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle" />
      </div>
    </div>
  );
}

function SourceMainContext() {
  return (
    <div className="min-w-0 flex-1 bg-white p-4">
      <div className="mb-4 h-8 w-48 border-b-2 border-black text-lg font-bold">#proj-uiux</div>
      <div className="space-y-3">
        <div className="h-14 border-2 border-black bg-white shadow-brutal-sm" />
        <div className="h-20 border-2 border-black bg-white shadow-brutal-sm" />
        <div className="h-10 border-2 border-black bg-brutal-cream" />
      </div>
    </div>
  );
}
