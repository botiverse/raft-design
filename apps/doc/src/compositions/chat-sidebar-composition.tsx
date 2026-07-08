import { ArrowUpDown, Bookmark, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  ChatShellSidebar,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarBody,
  ChatSidebarHeader,
  ChatSidebarItem,
  ChatSidebarItemIcon,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemIndicator,
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

import { ChatRailComposition } from "./chat-rail-composition.tsx";

export function ChatSidebarComposition() {
  return (
    <div className="flex h-full w-full min-w-0">
      <ChatRailComposition />
      <ChatSidebarResizeGroup className="min-w-0 flex-1" orientation="horizontal">
        <ChatSidebarResizePanel
          id="chat-sidebar"
          className="bg-layer-panel [[data-preview-theme=brutal]_&]:bg-brutal-cream"
          defaultSize={240}
          minSize={180}
          maxSize={320}
          groupResizeBehavior="preserve-pixel-size"
        >
          <ChatShellSidebar resizable className="flex h-full md:flex">
            <ChatSidebarRoot>
              <ChatSidebarHeader>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-lg font-bold text-foreground-strong">Chat</div>
                </div>
              </ChatSidebarHeader>
              <ChatSidebarBody className="relative flex min-h-0 flex-1 overflow-hidden p-0">
                <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
                  <div className="min-h-full">
                    <ChatSidebarItem type="button">
                      <ChatSidebarItemIcon>
                        <Bookmark className="size-3.5" />
                      </ChatSidebarItemIcon>
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
                            <ChatSidebarItemSubtitle className="min-w-0 flex-1 text-xs">
                              Cindy replied
                            </ChatSidebarItemSubtitle>
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
                            <ChatSidebarItemSubtitle className="min-w-0 flex-1 text-xs">
                              planning
                            </ChatSidebarItemSubtitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <Status aria-hidden variant="accent" size="sm" />
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
                          <ChatSidebarItemIndicator>
                            <ChatSidebarItemMention />
                          </ChatSidebarItemIndicator>
                          <ChatSidebarItemBadge>12</ChatSidebarItemBadge>
                        </ChatSidebarItem>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemChannelIcon />
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle>#release</ChatSidebarItemTitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemIndicator>
                            <ChatSidebarItemMuted />
                          </ChatSidebarItemIndicator>
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
                            <ChatSidebarItemSubtitle className="min-w-0 flex-1 text-xs">
                              design
                            </ChatSidebarItemSubtitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <Status aria-hidden variant="accent" size="sm" />
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
                            <ChatSidebarItemSubtitle className="min-w-0 flex-1 text-xs">
                              idle
                            </ChatSidebarItemSubtitle>
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
          </ChatShellSidebar>
        </ChatSidebarResizePanel>
        <ChatSidebarResizeHandle />
        <ChatSidebarResizePanel id="chat-sidebar-fill" minSize={0} />
      </ChatSidebarResizeGroup>
    </div>
  );
}
