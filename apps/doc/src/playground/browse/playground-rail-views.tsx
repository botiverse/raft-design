import {
  Activity,
  AtSign,
  Bell,
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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Fragment, useCallback } from "react";
import {
  Button,
  EmptyState,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
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

import type { PlaygroundActor } from "../mock/index.ts";
import type { PlaygroundRailView } from "../navigation/playground-navigation.ts";
import { usePlaygroundNavigation } from "../navigation/use-playground-navigation.ts";
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
      description: "Choose an appearance from the Settings menu in the navigation.",
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
  tasks: { title: "Tasks", icon: Activity },
  members: { title: "Members", icon: Users },
  computers: { title: "Computers", icon: Monitor },
  settings: { title: "Settings", icon: Settings },
};

export function PlaygroundRailViewSidebar({ view }: { view: AuxiliaryRailView }) {
  const { railDetailId, selectRailDetail } = usePlaygroundNavigation();

  if (view === "members") {
    return <MembersSidebar selectedId={railDetailId} onSelect={selectRailDetail} />;
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
            const previousGroup = details[index - 1]?.group;
            return (
              <Fragment key={detail.id}>
                {detail.group && detail.group !== previousGroup ? (
                  <SidebarGroupLabel>{detail.group}</SidebarGroupLabel>
                ) : null}
                <RailDetailItem
                  detail={detail}
                  active={selectedId === detail.id}
                  onSelect={selectRailDetail}
                />
              </Fragment>
            );
          })}
        </SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

function RailDetailItem({
  detail,
  active,
  onSelect,
}: {
  detail: RailDetail;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const DetailIcon = detail.icon;
  const handleClick = useCallback(() => onSelect(detail.id), [detail.id, onSelect]);

  return (
    <SidebarItem active={active} onClick={handleClick}>
      <SidebarItemIcon aria-hidden>
        <DetailIcon />
      </SidebarItemIcon>
      <SidebarItemTitle>{detail.label}</SidebarItemTitle>
      {detail.meta ? <SidebarItemMeta>{detail.meta}</SidebarItemMeta> : null}
    </SidebarItem>
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

  return <AuxiliaryRailViewPanel view={view} />;
}

function AuxiliaryRailViewPanel({ view }: { view: AuxiliaryRailView }) {
  const ViewIcon = viewMeta[view].icon;
  const { railDetailId, selectRailDetail } = usePlaygroundNavigation();
  const selectedMember = view === "members" ? getSelectedMember(railDetailId) : undefined;
  const auxiliaryDetail =
    (view === "members" || view === "computers" || view === "settings") &&
    railDetailId !== undefined;
  const mobileBack = auxiliaryDetail;
  const clearRailDetail = useCallback(() => selectRailDetail(undefined), [selectRailDetail]);
  const selectActor = useCallback(
    (actor: PlaygroundActor) =>
      selectRailDetail(
        actor.type === "agent" ? memberDetailId.agent(actor.id) : memberDetailId.human(actor.id),
      ),
    [selectRailDetail],
  );

  if (selectedMember) {
    return (
      <MemberDetailPanel
        key={selectedMember.id}
        actor={selectedMember}
        onBack={clearRailDetail}
        onClose={clearRailDetail}
        onSelectActor={selectActor}
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
            aria-label={`Back to ${viewMeta[view].title}`}
            onClick={clearRailDetail}
          >
            <ChevronLeft aria-hidden />
          </Button>
        ) : null}
        <PanelHeaderIcon className="max-md:hidden">
          <ViewIcon className="size-4.5" />
        </PanelHeaderIcon>
        <PanelHeaderContent
          className={mobileBack ? "max-md:col-start-2 max-md:col-span-2" : "max-md:col-span-3"}
        >
          <PanelHeading>
            <PanelTitle>{viewMeta[view].title}</PanelTitle>
          </PanelHeading>
          <PanelMeta>Playground preview</PanelMeta>
        </PanelHeaderContent>
      </PanelHeader>
      <ConversationPanelContent>
        <PlaygroundDetailView view={view} />
      </ConversationPanelContent>
    </ConversationPanelRoot>
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
