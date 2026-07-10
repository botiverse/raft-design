import { Bookmark, ChevronRight, Plus } from "lucide-react";
import { Avatar, AvatarFallback, Status } from "raft-ui";
import {
  AppShellMain,
  AppShellSidebar,
  AppShellRoot,
  ChatSidebarContent,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarBody,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemIcon,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemMention,
  ChatSidebarItemMuted,
  ChatSidebarItemInlineText,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarMenu,
  ChatSidebarMenuAside,
  ChatSidebarMenuCount,
  ChatSidebarMenuIcon,
  ChatSidebarMenuTitle,
  ChatSidebarResizeGroup,
  ChatSidebarResizeHandle,
  ChatSidebarResizePanel,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionAction,
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
    <AppShellRoot className="h-full min-w-[865px] border border-line-strong shadow-sm [[data-theme=brutal]_&]:border-2 [[data-theme=brutal]_&]:border-black">
      <AppRailComposition />
      <ChatSidebarResizeGroup className="min-w-0 flex-1" orientation="horizontal">
        <ChatSidebarResizePanel
          id="chat-sidebar"
          defaultSize={308}
          minSize={180}
          maxSize={368}
          groupResizeBehavior="preserve-pixel-size"
        >
          <AppShellSidebar resizable className="flex h-full md:flex">
            <ChatSidebarRoot>
              <ChatSidebarHeader>
                <div className="min-w-0 flex-1">
                  <ChatSidebarHeaderTitle>Chat</ChatSidebarHeaderTitle>
                </div>
                <ChatSidebarSectionAction type="button" aria-label="Add channel">
                  <Plus className="size-3.5" />
                </ChatSidebarSectionAction>
              </ChatSidebarHeader>
              <ChatSidebarBody>
                <ChatSidebarContent className="min-h-0 px-2">
                  <div className="min-h-full">
                    <ChatSidebarSection>
                      <ChatSidebarSectionHeader className="mt-0">
                        <ChatSidebarMenu>
                          <ChatSidebarMenuIcon>
                            <Bookmark />
                          </ChatSidebarMenuIcon>
                          <ChatSidebarMenuTitle>Saved</ChatSidebarMenuTitle>
                          <ChatSidebarMenuAside>
                            <ChatSidebarMenuCount>2</ChatSidebarMenuCount>
                          </ChatSidebarMenuAside>
                        </ChatSidebarMenu>
                      </ChatSidebarSectionHeader>
                    </ChatSidebarSection>

                    <ChatSidebarSection className="px-0">
                      <ChatSidebarSectionHeader>
                        <ChatSidebarSectionButton type="button">
                          <ChevronRight className="size-3" />
                          <ChatSidebarSectionTitle>Pinned</ChatSidebarSectionTitle>
                          <ChatSidebarSectionCount>3</ChatSidebarSectionCount>
                        </ChatSidebarSectionButton>
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
                          <ChatSidebarItemInlineText titleWidth="constrained">
                            <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                            <ChatSidebarItemSubtitle>planning</ChatSidebarItemSubtitle>
                          </ChatSidebarItemInlineText>
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
                      </ChatSidebarSectionHeader>
                      <ChatSidebarList>
                        <ChatSidebarItem type="button" unread>
                          <ChatSidebarItemChannelIcon />
                          <ChatSidebarItemText>
                            <ChatSidebarItemTitle>#general</ChatSidebarItemTitle>
                          </ChatSidebarItemText>
                          <ChatSidebarItemAside>
                            <ChatSidebarItemMention />
                            <ChatSidebarItemBadge>12</ChatSidebarItemBadge>
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemChannelIcon />
                          <ChatSidebarItemInlineText align="center">
                            <ChatSidebarItemTitle>#release</ChatSidebarItemTitle>
                            <ChatSidebarItemMuted />
                          </ChatSidebarItemInlineText>
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
                      </ChatSidebarSectionHeader>
                      <ChatSidebarList>
                        <ChatSidebarItem type="button" unread>
                          <ChatSidebarItemIcon>
                            <Avatar size="sidebar" type="human">
                              <AvatarFallback className="text-[9px] font-bold">C</AvatarFallback>
                            </Avatar>
                          </ChatSidebarItemIcon>
                          <ChatSidebarItemInlineText titleWidth="constrained">
                            <ChatSidebarItemTitle>Cindy</ChatSidebarItemTitle>
                            <ChatSidebarItemSubtitle>design</ChatSidebarItemSubtitle>
                          </ChatSidebarItemInlineText>
                          <ChatSidebarItemAside>
                            <Status aria-hidden variant="success" size="md" />
                            <ChatSidebarItemBadge>4</ChatSidebarItemBadge>
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                        <ChatSidebarItem type="button">
                          <ChatSidebarItemIcon>
                            <Avatar size="sidebar" type="agent" />
                          </ChatSidebarItemIcon>
                          <ChatSidebarItemInlineText titleWidth="constrained">
                            <ChatSidebarItemTitle>Atlas</ChatSidebarItemTitle>
                            <ChatSidebarItemSubtitle>idle</ChatSidebarItemSubtitle>
                          </ChatSidebarItemInlineText>
                          <ChatSidebarItemAside>
                            <ChatSidebarItemDraft />
                          </ChatSidebarItemAside>
                        </ChatSidebarItem>
                      </ChatSidebarList>
                    </ChatSidebarSection>
                  </div>
                </ChatSidebarContent>
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
