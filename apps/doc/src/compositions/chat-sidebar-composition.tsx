import {
  ChatShellSidebar,
  ChatSidebarBody,
  ChatSidebarHeader,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarSection,
} from "raft-ui/wip";
import { Bookmark, Hash, MessageSquare, User } from "lucide-react";
import { Status } from "raft-ui";

export function ChatSidebarComposition() {
  return (
    <div className="flex h-full min-w-[640px] overflow-hidden border border-line-strong bg-layer-panel shadow-sm [[data-preview-theme=brutal]_&]:border-2 [[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-cream [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle">
      <ChatShellSidebar className="flex h-full w-60 md:flex">
        <ChatSidebarRoot>
          <ChatSidebarHeader>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold text-foreground-strong">Chat</div>
            </div>
          </ChatSidebarHeader>
          <ChatSidebarBody className="relative flex min-h-0 flex-1 overflow-hidden p-0">
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
              <div className="min-h-full">
                <button
                  type="button"
                  className="mb-1 flex w-full items-center gap-2 border-2 border-transparent px-2.5 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-transparent [[data-preview-theme=elegant]_&]:hover:border-line-subtle [[data-preview-theme=elegant]_&]:hover:bg-layer-muted"
                >
                  <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-primary-400 [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                    <Bookmark className="size-3" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-foreground-strong">Saved</span>
                  <span className="font-mono text-[10px] text-foreground-muted">2</span>
                </button>
                <ChatSidebarSection className="mb-3 px-0">
                  <div className="mb-1 flex h-6 items-center justify-between px-2 text-xs font-bold tracking-widest text-foreground-muted uppercase">
                    <span>Pinned</span>
                    <span className="font-mono text-[10px] font-normal tracking-normal">2</span>
                  </div>
                  <ChatSidebarList>
                    <button
                      type="button"
                      data-selected="true"
                      className="flex w-full items-center gap-2 border-2 border-line-strong bg-accent-400 px-2.5 py-2 text-left text-sm font-bold shadow-sm transition-colors [[data-preview-theme=brutal]_&]:bg-brutal-pink [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-line-subtle [[data-preview-theme=elegant]_&]:bg-layer-muted"
                    >
                      <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-primary-400 [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                        <Hash className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground-strong">#proj-uiux</span>
                        <span className="block truncate font-mono text-[11px] text-foreground-muted">
                          Cindy replied
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-2 border-transparent px-2.5 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-transparent [[data-preview-theme=elegant]_&]:hover:border-line-subtle [[data-preview-theme=elegant]_&]:hover:bg-layer-muted"
                    >
                      <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-info-base [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                        <Hash className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground-strong">#proj-theme</span>
                        <span className="block truncate font-mono text-[11px] text-foreground-muted">
                          Atlas is typing
                        </span>
                      </span>
                    </button>
                  </ChatSidebarList>
                </ChatSidebarSection>
                <ChatSidebarSection className="mb-3 px-0">
                  <div className="mb-1 flex h-6 items-center justify-between px-2 text-xs font-bold tracking-widest text-foreground-muted uppercase">
                    <span>Joint Channels</span>
                    <span className="font-mono text-[10px] font-normal tracking-normal">1</span>
                  </div>
                  <ChatSidebarList>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-2 border-transparent px-2.5 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-transparent [[data-preview-theme=elegant]_&]:hover:border-line-subtle [[data-preview-theme=elegant]_&]:hover:bg-layer-muted"
                    >
                      <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-info-base [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                        <Hash className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground-strong">#partners</span>
                        <span className="block truncate font-mono text-[11px] text-foreground-muted">
                          3 unread
                        </span>
                      </span>
                    </button>
                  </ChatSidebarList>
                </ChatSidebarSection>
                <ChatSidebarSection className="mb-3 px-0">
                  <div className="mb-1 flex h-6 items-center justify-between px-2 text-xs font-bold tracking-widest text-foreground-muted uppercase">
                    <span>Channels</span>
                    <span className="font-mono text-[10px] font-normal tracking-normal">2</span>
                  </div>
                  <ChatSidebarList>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-2 border-transparent px-2.5 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-transparent [[data-preview-theme=elegant]_&]:hover:border-line-subtle [[data-preview-theme=elegant]_&]:hover:bg-layer-muted"
                    >
                      <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-primary-400 [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                        <Hash className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground-strong">#general</span>
                        <span className="block truncate font-mono text-[11px] text-foreground-muted">
                          12 unread
                        </span>
                      </span>
                      <Status aria-hidden variant="accent" size="sm" />
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-2 border-transparent px-2.5 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-transparent [[data-preview-theme=elegant]_&]:hover:border-line-subtle [[data-preview-theme=elegant]_&]:hover:bg-layer-muted"
                    >
                      <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-success-base [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                        <Hash className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground-strong">#release</span>
                        <span className="block truncate font-mono text-[11px] text-foreground-muted">
                          No unread
                        </span>
                      </span>
                    </button>
                  </ChatSidebarList>
                </ChatSidebarSection>
                <ChatSidebarSection className="mb-3 px-0">
                  <div className="mb-1 flex h-6 items-center justify-between px-2 text-xs font-bold tracking-widest text-foreground-muted uppercase">
                    <span>Direct Messages</span>
                    <span className="font-mono text-[10px] font-normal tracking-normal">2</span>
                  </div>
                  <ChatSidebarList>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-2 border-transparent px-2.5 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-transparent [[data-preview-theme=elegant]_&]:hover:border-line-subtle [[data-preview-theme=elegant]_&]:hover:bg-layer-muted"
                    >
                      <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-success-base [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                        <User className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground-strong">Cindy</span>
                        <span className="block truncate font-mono text-[11px] text-foreground-muted">
                          online
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 border-2 border-transparent px-2.5 py-2 text-left text-sm font-medium transition-colors hover:border-line-strong hover:bg-layer-panel hover:shadow-sm [[data-preview-theme=brutal]_&]:hover:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border [[data-preview-theme=elegant]_&]:border-transparent [[data-preview-theme=elegant]_&]:hover:border-line-subtle [[data-preview-theme=elegant]_&]:hover:bg-layer-muted"
                    >
                      <span className="flex size-[18px] shrink-0 items-center justify-center border border-line-strong bg-primary-400 [[data-preview-theme=elegant]_&]:rounded-sm [[data-preview-theme=elegant]_&]:border-line-subtle">
                        <MessageSquare className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-foreground-strong">Atlas</span>
                        <span className="block truncate font-mono text-[11px] text-foreground-muted">
                          idle
                        </span>
                      </span>
                    </button>
                  </ChatSidebarList>
                </ChatSidebarSection>
              </div>
            </div>
          </ChatSidebarBody>
        </ChatSidebarRoot>
      </ChatShellSidebar>
      <div className="min-w-0 flex-1 bg-layer-panel p-4 [[data-preview-theme=brutal]_&]:bg-white">
        <div className="mb-4 h-8 w-48 border-b-2 border-line-strong text-lg font-bold text-foreground-strong [[data-preview-theme=elegant]_&]:border-line-subtle">
          #proj-uiux
        </div>
        <div className="space-y-3">
          <div className="h-14 border-2 border-line-strong bg-layer-panel shadow-sm [[data-preview-theme=brutal]_&]:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle" />
          <div className="h-20 border-2 border-line-strong bg-layer-panel shadow-sm [[data-preview-theme=brutal]_&]:bg-white [[data-preview-theme=elegant]_&]:rounded-md [[data-preview-theme=elegant]_&]:border-line-subtle" />
        </div>
      </div>
    </div>
  );
}
