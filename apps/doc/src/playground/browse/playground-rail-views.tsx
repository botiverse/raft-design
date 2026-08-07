import {
  Activity,
  AtSign,
  Bell,
  Bookmark,
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
import { Fragment } from "react";
import {
  Button,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  MessageList,
  SidebarBody,
  SidebarContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemMeta,
  SidebarItemTitle,
  SidebarRoot,
  ConversationPanelBody,
  ConversationPanelContent,
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelHeaderIcon,
  PanelMeta,
  ConversationPanelRoot,
  PanelTitle,
} from "raft-ui";

import { findPlaygroundTaskForMessage } from "../mock/index.ts";
import { PlaygroundMessageRow } from "../message/playground-message-row.tsx";
import { usePlaygroundSavedMessages } from "../message/use-playground-message-workflow.ts";
import type { PlaygroundRailView } from "../navigation/playground-navigation.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
import { usePlaygroundTaskState } from "../tasks/use-playground-task-state.ts";
import { MemberDetailPanel } from "./member-detail-panel.tsx";
import { getSelectedMember, memberDetailId } from "./member-selection.ts";
import { MembersDetailView, MembersSidebar } from "./members-sidebar.tsx";
import { PlaygroundActivityPanel } from "../activity/playground-activity-panel.tsx";

type AuxiliaryRailView = Extract<PlaygroundRailView, "members" | "computers" | "settings">;

type RailDetail = {
  id: string;
  label: string;
  description: string;
  group?: "Personal" | "Workspace" | "About";
  meta?: string;
  icon: LucideIcon;
};

const auxiliaryViewDetails: Record<Exclude<AuxiliaryRailView, "members">, readonly RailDetail[]> = {
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
      description: "Choose a theme from the Settings menu in the navigation.",
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

  if (view === "members") {
    return <MembersSidebar selectedId={railDetailId} onSelect={(id) => selectRailDetail(id)} />;
  }

  const details = auxiliaryViewDetails[view];
  const selectedId = details.some((detail) => detail.id === railDetailId)
    ? railDetailId
    : undefined;

  return (
    <SidebarRoot>
      <SidebarHeader className="md:hidden">
        <SidebarHeaderTitle>{viewMeta[view].title}</SidebarHeaderTitle>
      </SidebarHeader>
      <SidebarHeader className="max-md:hidden">
        <SidebarHeaderTitle>{viewMeta[view].title}</SidebarHeaderTitle>
      </SidebarHeader>
      <SidebarBody>
        <SidebarContent>
          {details.map((detail, index) => {
            const DetailIcon = detail.icon;
            const previousGroup = details[index - 1]?.group;
            return (
              <Fragment key={detail.id}>
                {detail.group && detail.group !== previousGroup ? (
                  <SidebarGroupLabel>{detail.group}</SidebarGroupLabel>
                ) : null}
                <SidebarItem
                  active={selectedId === detail.id}
                  onClick={() => selectRailDetail(detail.id)}
                >
                  <SidebarItemIcon aria-hidden>
                    <DetailIcon />
                  </SidebarItemIcon>
                  <SidebarItemTitle>{detail.label}</SidebarItemTitle>
                  {detail.meta ? <SidebarItemMeta>{detail.meta}</SidebarItemMeta> : null}
                </SidebarItem>
              </Fragment>
            );
          })}
        </SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

export function PlaygroundRailViewPanel({
  view,
}: {
  view: Exclude<PlaygroundRailView, "search" | "chat" | "tasks">;
}) {
  if (view === "activity") {
    return <PlaygroundActivityPanel />;
  }

  const ViewIcon = viewMeta[view].icon;
  const { railDetailId, selectRailDetail, selectRailView } = usePlaygroundNavigation();
  const selectedMember = view === "members" ? getSelectedMember(railDetailId) : undefined;
  const auxiliaryDetail =
    (view === "members" || view === "computers" || view === "settings") &&
    railDetailId !== undefined;
  const mobileBack = view === "saved" || auxiliaryDetail;

  if (selectedMember) {
    return (
      <MemberDetailPanel
        key={selectedMember.id}
        actor={selectedMember}
        onBack={() => selectRailDetail(undefined)}
        onClose={() => selectRailDetail(undefined)}
        onSelectActor={(actor) =>
          selectRailDetail(
            actor.type === "agent"
              ? memberDetailId.agent(actor.id)
              : memberDetailId.human(actor.id),
          )
        }
      />
    );
  }

  return (
    <ConversationPanelRoot>
      <PanelHeader>
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
        <PanelHeaderContent>
          <PanelHeaderIcon>
            <ViewIcon className="size-4.5 in-data-[theme=elegant]:size-3.5 in-data-[theme=elegant]:stroke-[2.5]" />
          </PanelHeaderIcon>
          <PanelHeading>
            <PanelTitle>{viewMeta[view].title}</PanelTitle>
          </PanelHeading>
          <PanelMeta>Playground preview</PanelMeta>
        </PanelHeaderContent>
      </PanelHeader>
      <ConversationPanelContent>
        {view === "saved" ? <PlaygroundSavedView /> : <PlaygroundDetailView view={view} />}
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}

function PlaygroundSavedView() {
  const { savedMessagesById } = usePlaygroundSavedMessages();
  const { tasks } = usePlaygroundTaskState();
  const savedMessages = [...savedMessagesById.values()].sort(
    (left, right) => Date.parse(right.savedAtDateTime) - Date.parse(left.savedAtDateTime),
  );

  if (savedMessages.length) {
    return (
      <ConversationPanelBody>
        <MessageList>
          <div className="px-3 py-2 text-xs text-foreground-muted">
            {savedMessages.length === 1
              ? "1 saved message"
              : `${savedMessages.length} saved messages`}
          </div>
          {savedMessages.map(({ message, savedAt, surface, threadId }) => (
            <PlaygroundMessageRow
              key={message.id}
              message={message}
              task={findPlaygroundTaskForMessage(tasks, message.id)}
              threadId={threadId ?? message.id}
              surface={surface}
              footer={<span className="text-xs text-foreground-muted">Saved {savedAt}</span>}
            />
          ))}
          <div className="pb-3" aria-hidden />
        </MessageList>
      </ConversationPanelBody>
    );
  }

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

function PlaygroundDetailView({ view }: { view: AuxiliaryRailView }) {
  const { railDetailId } = usePlaygroundNavigation();

  if (view === "members") {
    return <MembersDetailView selectedId={railDetailId} />;
  }

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
