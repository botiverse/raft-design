import { ArrowUpDown, Bookmark, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  AppShellMain,
  AppShellSidebar,
  AppShellRoot,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarBody,
  ChatSidebarHeader,
  ChatSidebarItem,
  ChatSidebarItemIcon,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemMention,
  ChatSidebarItemMeta,
  ChatSidebarItemMuted,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarResizeGroup,
  ChatSidebarResizeHandle,
  ChatSidebarResizePanel,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionAction,
  ChatSidebarSectionActions,
  ChatSidebarSectionButton,
  ChatSidebarSectionCount,
  ChatSidebarSectionHeader,
  ChatSidebarSectionIndicator,
  ChatSidebarSectionTitle,
} from "raft-ui/wip";

import { AppRailComposition } from "./chat-rail-composition.tsx";
import { ChatMainPanelComposition } from "./chat-main-panel-composition.tsx";

export function ChatSidebarComposition() {
  return (
    <AppShellRoot className="h-full min-w-[865px] border border-line-strong shadow-sm [[data-preview-theme=brutal]_&]:border-2 [[data-preview-theme=brutal]_&]:border-black">
      <AppRailComposition />
      <ChatSidebarResizeGroup className="min-w-0 flex-1" orientation="horizontal">
        <ChatSidebarResizePanel
          id="chat-sidebar"
          className="bg-layer-panel [[data-preview-theme=brutal]_&]:bg-brutal-cream"
          defaultSize={240}
          minSize={180}
          maxSize={320}
          groupResizeBehavior="preserve-pixel-size"
        >
          <AppShellSidebar resizable className="flex h-full md:flex">
            <ChatSidebarRoot>
              <ChatSidebarHeader>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-bold text-foreground-strong">Chat</div>
                </div>
              </ChatSidebarHeader>
              <ChatSidebarBody>
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
                  <div className="min-h-full">
                    <ChatSidebarItem type="button">
                      <Bookmark className="size-3.5 shrink-0" />
                      <ChatSidebarItemTitle className="flex-1">Saved</ChatSidebarItemTitle>
                      <ChatSidebarItemMeta>2</ChatSidebarItemMeta>
                    </ChatSidebarItem>

                    <ChatSidebarSection className="px-0">
                      <ChatSidebarSectionHeader>
                        <ChatSidebarSectionButton type="button">
                          <ChevronRight className="size-3" />
                          <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
                          <ChatSidebarSectionCount>3</ChatSidebarSectionCount>
                        </ChatSidebarSectionButton>
                        <ChatSidebarSectionActions>
                          <ChatSidebarSectionAction type="button" aria-label="Sort pinned">
                            <ArrowUpDown className="size-3.5" />
                          </ChatSidebarSectionAction>
                        </ChatSidebarSectionActions>
                      </ChatSidebarSectionHeader>
                      <ChatSidebarList>
                        <ChatSidebarItem type="button" selected>
                          <ChatSidebarItemChannelIcon />
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle className="shrink-0">
                              #proj-uiux
                            </ChatSidebarItemTitle>
                            <ChatSidebarItemSubtitle>Cindy replied</ChatSidebarItemSubtitle>
                          </ChatSidebarItemText>
                        </ChatSidebarItem>
                        <ChatSidebarItem type="button" menuOpen>
                          <ChatSidebarItemIcon>
                            <Avatar size="sidebar" type="agent">
                              <AvatarFallback className="text-[9px] font-bold">A</AvatarFallback>
                            </Avatar>
                          </ChatSidebarItemIcon>
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle className="max-w-[70%] shrink-0">
                              Atlas
                            </ChatSidebarItemTitle>
                            <ChatSidebarItemSubtitle>planning</ChatSidebarItemSubtitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <Status aria-hidden variant="success" size="md" />
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemChannelIcon />
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle>#proj-theme</ChatSidebarItemTitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <ChatSidebarItemDraft />
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                      </ChatSidebarList>
                    </ChatSidebarSection>

                    <ChatSidebarSection defaultOpen={false} className="px-0">
                      <ChatSidebarSectionHeader>
                        <ChatSidebarSectionButton type="button">
                          <ChevronRight className="size-3" />
                          <ChatSidebarSectionTitle>Joint Channels</ChatSidebarSectionTitle>
                          <ChatSidebarSectionCount>1</ChatSidebarSectionCount>
                          <ChatSidebarSectionIndicator />
                        </ChatSidebarSectionButton>
                        <ChatSidebarSectionActions>
                          <ChatSidebarSectionAction type="button" aria-label="Sort joint channels">
                            <ArrowUpDown className="size-3.5" />
                          </ChatSidebarSectionAction>
                        </ChatSidebarSectionActions>
                      </ChatSidebarSectionHeader>
                      <ChatSidebarList>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemChannelIcon type="joint" />
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle>#partners</ChatSidebarItemTitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemBadge>3</ChatSidebarItemBadge>
                        </ChatSidebarItem>
                      </ChatSidebarList>
                    </ChatSidebarSection>

                    <ChatSidebarSection className="px-0">
                      <ChatSidebarSectionHeader>
                        <ChatSidebarSectionButton type="button">
                          <ChevronRight className="size-3" />
                          <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
                          <ChatSidebarSectionCount>2</ChatSidebarSectionCount>
                        </ChatSidebarSectionButton>
                        <ChatSidebarSectionActions>
                          <ChatSidebarSectionAction type="button" aria-label="Sort channels">
                            <ArrowUpDown className="size-3.5" />
                          </ChatSidebarSectionAction>
                          <ChatSidebarSectionAction type="button" aria-label="Add channel">
                            <Plus className="size-3.5" />
                          </ChatSidebarSectionAction>
                        </ChatSidebarSectionActions>
                      </ChatSidebarSectionHeader>
                      <ChatSidebarList>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemChannelIcon />
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle className="font-bold">
                              #general
                            </ChatSidebarItemTitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemMention />
                          <ChatSidebarItemBadge className="ml-auto">12</ChatSidebarItemBadge>
                        </ChatSidebarItem>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemChannelIcon />
                          <ChatSidebarItemText className="items-center gap-0">
                            <ChatSidebarItemTitle>#release</ChatSidebarItemTitle>
                            <ChatSidebarItemMuted />
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <ChatSidebarItemDraft />
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                      </ChatSidebarList>
                    </ChatSidebarSection>

                    <ChatSidebarSection className="px-0">
                      <ChatSidebarSectionHeader>
                        <ChatSidebarSectionButton type="button">
                          <ChevronRight className="size-3" />
                          <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
                          <ChatSidebarSectionCount>2</ChatSidebarSectionCount>
                        </ChatSidebarSectionButton>
                        <ChatSidebarSectionActions>
                          <ChatSidebarSectionAction type="button" aria-label="Sort direct messages">
                            <ArrowUpDown className="size-3.5" />
                          </ChatSidebarSectionAction>
                        </ChatSidebarSectionActions>
                      </ChatSidebarSectionHeader>
                      <ChatSidebarList>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemIcon>
                            <Avatar size="sidebar" type="human">
                              <AvatarFallback className="text-[9px] font-bold">C</AvatarFallback>
                            </Avatar>
                          </ChatSidebarItemIcon>
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle className="max-w-[70%] shrink-0 font-bold">
                              Cindy
                            </ChatSidebarItemTitle>
                            <ChatSidebarItemSubtitle>design</ChatSidebarItemSubtitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <Status aria-hidden variant="success" size="md" />
                            <ChatSidebarItemBadge>4</ChatSidebarItemBadge>
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemIcon>
                            <Avatar size="sidebar" type="agent" />
                          </ChatSidebarItemIcon>
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle className="max-w-[70%] shrink-0">
                              Atlas
                            </ChatSidebarItemTitle>
                            <ChatSidebarItemSubtitle>idle</ChatSidebarItemSubtitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <MessageSquare className="size-3 text-foreground-muted" />
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                      </ChatSidebarList>
                    </ChatSidebarSection>
                  </div>
                </div>
              </ChatSidebarBody>
            </ChatSidebarRoot>
          </AppShellSidebar>
        </ChatSidebarResizePanel>
        <ChatSidebarResizeHandle />
        <ChatSidebarResizePanel id="chat-main-panel" minSize={0} className="min-w-0">
          <AppShellMain className="flex h-full">
            <ChatMainPanelComposition />
          </AppShellMain>
        </ChatSidebarResizePanel>
      </ChatSidebarResizeGroup>
    </AppShellRoot>
  );
}
