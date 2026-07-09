import { Link } from "@tanstack/react-router";
import { ArrowUpDown, Bookmark, ChevronRight, Plus } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Status,
} from "raft-ui";
import {
  ChatSidebarBody,
  ChatSidebarHeader,
  ChatSidebarItem,
  ChatSidebarItemAside,
  ChatSidebarItemBadge,
  ChatSidebarItemChannelIcon,
  ChatSidebarItemDraft,
  ChatSidebarItemIcon,
  ChatSidebarItemMention,
  ChatSidebarItemMeta,
  ChatSidebarItemMuted,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionAction,
  ChatSidebarSectionActions,
  ChatSidebarSectionButton,
  ChatSidebarSectionCount,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
} from "raft-ui/wip";

import type { PlaygroundChannelId } from "./mock-data.ts";

export function PlaygroundSidebar({ activeChannelId }: { activeChannelId: PlaygroundChannelId }) {
  return (
    <ChatSidebarRoot>
      <ChatSidebarHeader>
        <div className="text-lg font-bold text-black">Chat</div>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <div className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-3">
          <div className="min-h-full">
            <ChatSidebarItem type="button">
              <Bookmark className="size-3.5 shrink-0" />
              Saved
              <ChatSidebarItemMeta>3</ChatSidebarItemMeta>
            </ChatSidebarItem>

            <ChatSidebarSection className="px-0">
              <ChatSidebarSectionHeader>
                <ChatSidebarSectionButton type="button">
                  <ChevronRight className="size-3" />
                  <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
                  <ChatSidebarSectionCount>5</ChatSidebarSectionCount>
                </ChatSidebarSectionButton>
                <ChatSidebarSectionActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <ChatSidebarSectionAction
                          type="button"
                          aria-label="Sort sidebar conversations"
                        >
                          <ArrowUpDown className="size-3.5" />
                        </ChatSidebarSectionAction>
                      }
                    />
                    <DropdownMenuContent
                      align="end"
                      className="flex w-[136px] min-w-[136px] flex-col"
                    >
                      <DropdownMenuRadioGroup defaultValue="manual">
                        <DropdownMenuRadioItem value="manual">Manual</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="recent">Recent</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="az">A-Z</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChatSidebarSectionAction type="button" aria-label="Add channel">
                    <Plus className="size-3.5" />
                  </ChatSidebarSectionAction>
                </ChatSidebarSectionActions>
              </ChatSidebarSectionHeader>
              <ChatSidebarList>
                <ChatSidebarItem
                  selected={activeChannelId === "proj-uiux"}
                  render={<Link to="/playground/$channelId" params={{ channelId: "proj-uiux" }} />}
                >
                  <ChatSidebarItemChannelIcon />
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>proj-uiux</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                </ChatSidebarItem>
                <ChatSidebarItem
                  selected={activeChannelId === "incident-alerts"}
                  render={
                    <Link to="/playground/$channelId" params={{ channelId: "incident-alerts" }} />
                  }
                >
                  <ChatSidebarItemChannelIcon />
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle className="font-bold">
                      incident-alerts
                    </ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  {activeChannelId === "incident-alerts" ? null : (
                    <ChatSidebarItemBadge className="ml-auto">5</ChatSidebarItemBadge>
                  )}
                </ChatSidebarItem>
                <ChatSidebarItem
                  selected={activeChannelId === "release"}
                  render={<Link to="/playground/$channelId" params={{ channelId: "release" }} />}
                >
                  <ChatSidebarItemChannelIcon />
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle className="font-bold">release</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  {activeChannelId === "release" ? null : (
                    <>
                      <ChatSidebarItemMention />
                      <ChatSidebarItemBadge className="ml-auto">3</ChatSidebarItemBadge>
                    </>
                  )}
                </ChatSidebarItem>
                <ChatSidebarItem
                  selected={activeChannelId === "component-matrix"}
                  render={
                    <Link to="/playground/$channelId" params={{ channelId: "component-matrix" }} />
                  }
                >
                  <ChatSidebarItemChannelIcon />
                  <ChatSidebarItemText className="items-center gap-0">
                    <ChatSidebarItemTitle className="text-black/70">
                      component-matrix
                    </ChatSidebarItemTitle>
                    <ChatSidebarItemMuted />
                  </ChatSidebarItemText>
                  {activeChannelId === "component-matrix" ? null : (
                    <ChatSidebarItemMeta>2</ChatSidebarItemMeta>
                  )}
                </ChatSidebarItem>
                <ChatSidebarItem
                  selected={activeChannelId === "new-channel"}
                  render={
                    <Link to="/playground/$channelId" params={{ channelId: "new-channel" }} />
                  }
                >
                  <ChatSidebarItemChannelIcon />
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle>new-channel</ChatSidebarItemTitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemDraft className="ml-auto" />
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
                  <ChatSidebarSectionAction type="button" aria-label="Sort sidebar conversations">
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
                    <ChatSidebarItemTitle className="max-w-[70%] shrink-0">
                      Cindy
                    </ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>Pushed the latest export</ChatSidebarItemSubtitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemAside>
                    <Status aria-hidden variant="success" size="md" />
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
                <ChatSidebarItem
                  selected={activeChannelId === "dm-atlas"}
                  render={<Link to="/playground/$channelId" params={{ channelId: "dm-atlas" }} />}
                >
                  <ChatSidebarItemIcon>
                    <Avatar size="sidebar" type="agent" />
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemText>
                    <ChatSidebarItemTitle className="max-w-[70%] shrink-0 font-bold">
                      Atlas
                    </ChatSidebarItemTitle>
                    <ChatSidebarItemSubtitle>
                      Seeded agent on the primary machine
                    </ChatSidebarItemSubtitle>
                  </ChatSidebarItemText>
                  <ChatSidebarItemAside>
                    <Status aria-hidden variant="success" size="md" />
                    {activeChannelId === "dm-atlas" ? null : (
                      <ChatSidebarItemBadge>1</ChatSidebarItemBadge>
                    )}
                  </ChatSidebarItemAside>
                </ChatSidebarItem>
              </ChatSidebarList>
            </ChatSidebarSection>
          </div>
        </div>
      </ChatSidebarBody>
    </ChatSidebarRoot>
  );
}
