import {
  Activity,
  AtSign,
  Bell,
  Bookmark,
  Bot,
  Building2,
  ChevronLeft,
  CircleUserRound,
  CreditCard,
  FileText,
  Info,
  Languages,
  Link as LinkIcon,
  Monitor,
  Palette,
  Search,
  Server,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Fragment, useState } from "react";
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
  ConversationPanelBody,
  ConversationPanelContent,
  ConversationPanelHeader,
  ConversationPanelHeaderIcon,
  ConversationPanelRoot,
  ConversationPanelMeta,
  ConversationPanelTitle,
  ConversationPanelHeaderContent,
  ChatSidebarBody,
  ChatSidebarContent,
  ChatSidebarGroupLabel,
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
} from "../mock/index.ts";
import { PlaygroundConversationLink } from "../navigation/conversation-link.tsx";
import {
  usePlaygroundNavigation,
  type PlaygroundRailView,
} from "../navigation/playground-navigation-state.tsx";

type AuxiliaryRailView = Extract<PlaygroundRailView, "members" | "computers" | "settings">;

type RailDetail = {
  id: string;
  label: string;
  description: string;
  group?: "Personal" | "Workspace" | "About";
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
      group: "Personal",
      icon: CircleUserRound,
    },
    {
      id: "language-region",
      label: "Language & Region",
      description: "Choose language, locale, and regional formatting preferences.",
      group: "Personal",
      icon: Languages,
    },
    {
      id: "appearance",
      label: "Appearance",
      description: "Theme controls remain available in the Playground toolbar.",
      group: "Personal",
      icon: Palette,
    },
    {
      id: "notifications",
      label: "Notifications",
      description: "Review notification policy and delivery preferences.",
      group: "Personal",
      icon: Bell,
    },
    {
      id: "server-profile",
      label: "Server Profile",
      description: "Review the server name, icon, and profile information.",
      group: "Workspace",
      icon: Building2,
    },
    {
      id: "plan-billing",
      label: "Plan & Billing",
      description: "Review the current plan and workspace billing details.",
      group: "Workspace",
      icon: CreditCard,
    },
    {
      id: "administration",
      label: "Administration",
      description: "Manage workspace policies and administrative access.",
      group: "Workspace",
      icon: Shield,
    },
    {
      id: "connected-apps",
      label: "Connected Apps",
      description: "Review apps and integrations connected to this workspace.",
      group: "Workspace",
      icon: LinkIcon,
    },
    {
      id: "computers",
      label: "Computers",
      description: "Review managed computers and daemon status.",
      group: "Workspace",
      icon: Monitor,
    },
    {
      id: "about",
      label: "About",
      description: "Review product and environment information.",
      group: "About",
      icon: Info,
    },
    {
      id: "release-notes",
      label: "Release Notes",
      description: "Review recent product changes and migration notes.",
      group: "About",
      icon: FileText,
    },
  ],
};

const viewMeta: Record<PlaygroundRailView, { title: string; icon: LucideIcon }> = {
  search: { title: "Search", icon: Search },
  chat: { title: "Chat", icon: AtSign },
  activity: { title: "Activity", icon: Activity },
  saved: { title: "Saved", icon: Bookmark },
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
    : undefined;

  return (
    <ChatSidebarRoot>
      <ChatSidebarHeader className="md:hidden">
        <ChatSidebarHeaderTitle>{viewMeta[view].title}</ChatSidebarHeaderTitle>
      </ChatSidebarHeader>
      <ChatSidebarHeader className="max-md:hidden">
        <ChatSidebarHeaderTitle>{viewMeta[view].title}</ChatSidebarHeaderTitle>
      </ChatSidebarHeader>
      <ChatSidebarBody>
        <ChatSidebarContent>
          {details.map((detail, index) => {
            const DetailIcon = detail.icon;
            const previousGroup = details[index - 1]?.group;
            return (
              <Fragment key={detail.id}>
                {detail.group && detail.group !== previousGroup ? (
                  <ChatSidebarGroupLabel>{detail.group}</ChatSidebarGroupLabel>
                ) : null}
                <ChatSidebarItem
                  active={selectedId === detail.id}
                  onClick={() => selectRailDetail(detail.id)}
                >
                  <ChatSidebarItemIcon aria-hidden>
                    <DetailIcon />
                  </ChatSidebarItemIcon>
                  <ChatSidebarItemTitle>{detail.label}</ChatSidebarItemTitle>
                  {detail.meta ? <ChatSidebarItemMeta>{detail.meta}</ChatSidebarItemMeta> : null}
                </ChatSidebarItem>
              </Fragment>
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
  const { railDetailId, selectRailDetail, selectRailView } = usePlaygroundNavigation();
  const auxiliaryDetail =
    (view === "members" || view === "computers" || view === "settings") &&
    railDetailId !== undefined;
  const mobileBack =
    view === "search" || view === "activity" || view === "saved" || auxiliaryDetail;

  return (
    <ConversationPanelRoot>
      <ConversationPanelHeader>
        {mobileBack ? (
          <Button
            variant="outline"
            size="icon-sm"
            className="md:hidden"
            aria-label={auxiliaryDetail ? `Back to ${viewMeta[view].title}` : "Back to Home"}
            onClick={() => {
              if (auxiliaryDetail) selectRailDetail(undefined);
              else selectRailView("chat");
            }}
          >
            <ChevronLeft aria-hidden />
          </Button>
        ) : null}
        <ConversationPanelHeaderIcon>
          <ViewIcon />
        </ConversationPanelHeaderIcon>
        <ConversationPanelHeaderContent>
          <ConversationPanelTitle>{viewMeta[view].title}</ConversationPanelTitle>
          <ConversationPanelMeta>Playground preview</ConversationPanelMeta>
        </ConversationPanelHeaderContent>
      </ConversationPanelHeader>
      <ConversationPanelContent>
        {view === "search" ? (
          <PlaygroundSearchView />
        ) : view === "activity" ? (
          <PlaygroundActivityView />
        ) : view === "saved" ? (
          <PlaygroundSavedView />
        ) : (
          <PlaygroundDetailView view={view} />
        )}
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}

function PlaygroundSavedView() {
  return (
    <ConversationPanelBody>
      <EmptyState className="min-h-full">
        <EmptyStateContent>
          <EmptyStateIcon>
            <Bookmark />
          </EmptyStateIcon>
          <EmptyStateTitle>Saved messages</EmptyStateTitle>
          <EmptyStateDescription>
            Messages saved in this Playground will appear here.
          </EmptyStateDescription>
        </EmptyStateContent>
      </EmptyState>
    </ConversationPanelBody>
  );
}

function PlaygroundSearchView() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const results = [
    ...PLAYGROUND_JOINT_CHANNELS,
    ...PLAYGROUND_ROOM_CHANNELS,
    ...PLAYGROUND_DIRECT_MESSAGES,
  ].filter((channel) => channel.name.toLocaleLowerCase().includes(normalizedQuery));

  return (
    <ConversationPanelBody>
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
              render={<PlaygroundConversationLink conversation={channel} />}
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
    </ConversationPanelBody>
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
    <ConversationPanelBody>
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
    </ConversationPanelBody>
  );
}

function PlaygroundDetailView({ view }: { view: AuxiliaryRailView }) {
  const { railDetailId } = usePlaygroundNavigation();
  const details = auxiliaryViewDetails[view];
  const detail = details.find((item) => item.id === railDetailId) ?? details[0];
  const DetailIcon = detail?.icon ?? viewMeta[view].icon;

  return (
    <ConversationPanelBody>
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
    </ConversationPanelBody>
  );
}
