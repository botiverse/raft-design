import { Link } from "@tanstack/react-router";
import {
  Activity,
  AtSign,
  Bell,
  Bot,
  CircleUserRound,
  Monitor,
  Palette,
  Search,
  Server,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Button,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "raft-ui";
import {
  ChatMainPanelBody,
  ChatMainPanelContent,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelRoot,
  ChatMainPanelSubtitle,
  ChatMainPanelTitle,
  ChatMainPanelTitleBlock,
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarHeader,
  ChatSidebarHeaderTitle,
  ChatSidebarItem,
  ChatSidebarItemIcon,
  ChatSidebarItemMeta,
  ChatSidebarItemTitle,
  ChatSidebarRoot,
} from "raft-ui/wip";

import {
  PLAYGROUND_DIRECT_MESSAGES,
  PLAYGROUND_JOINT_CHANNELS,
  PLAYGROUND_ROOM_CHANNELS,
} from "./mock/index.ts";
import {
  usePlaygroundNavigation,
  type PlaygroundRailView,
} from "./playground-navigation-state.tsx";

type AuxiliaryRailView = Extract<PlaygroundRailView, "members" | "computers" | "settings">;

type RailDetail = {
  id: string;
  label: string;
  description: string;
  meta?: string;
  icon: LucideIcon;
};

const auxiliaryViewDetails: Record<AuxiliaryRailView, readonly RailDetail[]> = {
  members: [
    {
      id: "agents",
      label: "Agents",
      description: "Browse the mock agents available in this server.",
      meta: "8",
      icon: Bot,
    },
    {
      id: "humans",
      label: "Humans",
      description: "Browse members and their current access.",
      meta: "12",
      icon: Users,
    },
    {
      id: "graph",
      label: "Graph",
      description: "Inspect relationships between members, agents, and channels.",
      icon: Activity,
    },
  ],
  computers: [
    {
      id: "dev-machine",
      label: "dev-machine",
      description: "Online and running the current daemon version.",
      meta: "online",
      icon: Monitor,
    },
    {
      id: "seed-offline",
      label: "seed-offline-laptop",
      description: "Offline test computer used for disconnected states.",
      meta: "offline",
      icon: Monitor,
    },
    {
      id: "seed-outdated",
      label: "seed-outdated-daemon",
      description: "Managed computer with an available daemon upgrade.",
      meta: "update",
      icon: Server,
    },
  ],
  settings: [
    {
      id: "account",
      label: "Account",
      description: "Review the current mock profile and account preferences.",
      icon: CircleUserRound,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Theme controls remain available in the Playground toolbar.",
      icon: Palette,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Review notification policy and delivery preferences.",
      icon: Bell,
    },
  ],
};

const viewMeta: Record<PlaygroundRailView, { title: string; icon: LucideIcon }> = {
  search: { title: "Search", icon: Search },
  chat: { title: "Chat", icon: AtSign },
  activity: { title: "Activity", icon: Activity },
  tasks: { title: "Tasks", icon: Activity },
  members: { title: "Members", icon: Users },
  computers: { title: "Computers", icon: Monitor },
  settings: { title: "Settings", icon: Settings },
};

export function PlaygroundRailViewSidebar({ view }: { view: AuxiliaryRailView }) {
  const { railDetailId, selectRailDetail } = usePlaygroundNavigation();
  const details = auxiliaryViewDetails[view];
  const selectedId = details.some((detail) => detail.id === railDetailId)
    ? railDetailId
    : details[0]?.id;

  return (
    <ChatSidebarRoot>
      <ChatSidebarHeader>
        <ChatSidebarHeaderTitle>{viewMeta[view].title}</ChatSidebarHeaderTitle>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <ChatSidebarContent>
          {details.map((detail) => {
            const DetailIcon = detail.icon;
            return (
              <ChatSidebarItem
                key={detail.id}
                aria-current={selectedId === detail.id ? "page" : undefined}
                onClick={() => selectRailDetail(detail.id)}
              >
                <ChatSidebarItemIcon aria-hidden>
                  <DetailIcon className="size-3.5" />
                </ChatSidebarItemIcon>
                <ChatSidebarItemTitle>{detail.label}</ChatSidebarItemTitle>
                {detail.meta ? <ChatSidebarItemMeta>{detail.meta}</ChatSidebarItemMeta> : null}
              </ChatSidebarItem>
            );
          })}
        </ChatSidebarContent>
      </ChatSidebarBody>
    </ChatSidebarRoot>
  );
}

export function PlaygroundRailViewPanel({
  view,
}: {
  view: Exclude<PlaygroundRailView, "chat" | "tasks">;
}) {
  const ViewIcon = viewMeta[view].icon;

  return (
    <ChatMainPanelRoot>
      <ChatMainPanelHeader>
        <ChatMainPanelHeaderIcon>
          <ViewIcon className="size-[18px]" />
        </ChatMainPanelHeaderIcon>
        <ChatMainPanelTitleBlock>
          <ChatMainPanelTitle>{viewMeta[view].title}</ChatMainPanelTitle>
          <ChatMainPanelSubtitle>Playground preview</ChatMainPanelSubtitle>
        </ChatMainPanelTitleBlock>
      </ChatMainPanelHeader>
      <ChatMainPanelContent>
        {view === "search" ? (
          <PlaygroundSearchView />
        ) : view === "activity" ? (
          <PlaygroundActivityView />
        ) : (
          <PlaygroundDetailView view={view} />
        )}
      </ChatMainPanelContent>
    </ChatMainPanelRoot>
  );
}

function PlaygroundSearchView() {
  const [query, setQuery] = useState("");
  const { selectRailView } = usePlaygroundNavigation();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = [
    ...PLAYGROUND_JOINT_CHANNELS,
    ...PLAYGROUND_ROOM_CHANNELS,
    ...PLAYGROUND_DIRECT_MESSAGES,
  ].filter((channel) => channel.name.toLocaleLowerCase().includes(normalizedQuery));

  return (
    <ChatMainPanelBody>
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
        <Input
          aria-label="Search channels and direct messages"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Search channels and direct messages…"
        />
        <div className="grid gap-2">
          {results.slice(0, 8).map((channel) => (
            <Button
              key={channel.id}
              variant="outline"
              nativeButton={false}
              render={
                <Link to="/playground/$channelId" params={{ channelId: channel.id }} search={{}} />
              }
              onClick={() => selectRailView("chat")}
            >
              {channel.kind === "dm" ? "@" : "#"}
              {channel.name}
            </Button>
          ))}
        </div>
        {results.length === 0 ? (
          <EmptyState className="min-h-48">
            <EmptyStateContent>
              <EmptyStateIcon>
                <Search />
              </EmptyStateIcon>
              <EmptyStateTitle>No matches</EmptyStateTitle>
              <EmptyStateDescription>Try another channel or member name.</EmptyStateDescription>
            </EmptyStateContent>
          </EmptyState>
        ) : null}
      </div>
    </ChatMainPanelBody>
  );
}

function PlaygroundActivityView() {
  const [filter, setFilter] = useState("all");
  const labels = {
    all: "No activity yet",
    unread: "No unread activity",
    mentions: "No mentions yet",
  } as const;

  return (
    <ChatMainPanelBody>
      <div className="flex h-full min-h-0 flex-col gap-4 p-4">
        <SegmentedControl ariaLabel="Filter activity" value={filter} onValueChange={setFilter}>
          <SegmentedControlItem value="all">
            <SegmentedControlLabel>All</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="unread">
            <SegmentedControlLabel>Unread</SegmentedControlLabel>
          </SegmentedControlItem>
          <SegmentedControlItem value="mentions">
            <SegmentedControlLabel>Mentions</SegmentedControlLabel>
          </SegmentedControlItem>
        </SegmentedControl>
        <EmptyState className="min-h-0 flex-1">
          <EmptyStateContent>
            <EmptyStateIcon>
              <Activity />
            </EmptyStateIcon>
            <EmptyStateTitle>{labels[filter as keyof typeof labels]}</EmptyStateTitle>
            <EmptyStateDescription>
              New replies and mentions will appear here as the mock workspace changes.
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </ChatMainPanelBody>
  );
}

function PlaygroundDetailView({ view }: { view: AuxiliaryRailView }) {
  const { railDetailId } = usePlaygroundNavigation();
  const details = auxiliaryViewDetails[view];
  const detail = details.find((item) => item.id === railDetailId) ?? details[0];
  const DetailIcon = detail?.icon ?? viewMeta[view].icon;

  return (
    <ChatMainPanelBody>
      <div className="flex h-full items-center justify-center p-4">
        <EmptyState>
          <EmptyStateContent>
            <EmptyStateIcon>
              <DetailIcon />
            </EmptyStateIcon>
            <EmptyStateTitle>{detail?.label ?? viewMeta[view].title}</EmptyStateTitle>
            <EmptyStateDescription>
              {detail?.description ?? "Choose an item from the sidebar to inspect it."}
            </EmptyStateDescription>
          </EmptyStateContent>
        </EmptyState>
      </div>
    </ChatMainPanelBody>
  );
}
