import { Link } from "@tanstack/react-router";
import {
  Bookmark,
  ChevronRight,
  CircleAlert,
  GitBranch,
  Hash,
  Lock,
  MessageSquare,
  Plus,
  Search,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
  Status,
  Textarea,
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
  ChatSidebarItemMuted,
  ChatSidebarItemSubtitle,
  ChatSidebarItemText,
  ChatSidebarItemTitle,
  ChatSidebarList,
  ChatSidebarRoot,
  ChatSidebarSection,
  ChatSidebarSectionAction,
  ChatSidebarSectionButton,
  ChatSidebarSectionCount,
  ChatSidebarSectionHeader,
  ChatSidebarSectionTitle,
} from "raft-ui/wip";

import type { PlaygroundChannelId } from "./mock-data.ts";

type ActiveDialog = "create-channel" | "create-joint" | null;

// Base UI portals every menu / dialog to `document.body`, escaping the
// `[data-preview-theme=brutal]` scope, so scoped brutal pins never match. These
// overlays therefore carry LITERAL brutal chrome (pure-black border + hard
// `shadow-brutal` + `font-medium` items) to match source. Elegant is out of
// scope for the playground, so the literals stay unconditional.
const OVERLAY_CONTENT_CLASS = "border-2 border-black shadow-brutal";
const OVERLAY_ITEM_CLASS = "px-3 py-2 font-medium text-black";
// Source dialog field labels are uppercased with wide tracking (FormField).
const DIALOG_LABEL_CLASS = "uppercase tracking-wide";

const dialogMembers = [
  { id: "atlas", name: "Atlas", kind: "agent" },
  { id: "avery", name: "Avery", kind: "human" },
  { id: "mira", name: "Mira", kind: "agent" },
] as const;

type DialogMember = (typeof dialogMembers)[number];

type ChannelRow = {
  id: string;
  routeId?: PlaygroundChannelId;
  title: string;
  /** Channel icon: public hash, private lock, or joint branch. */
  type?: "channel" | "private" | "joint";
  badge?: string;
  bold?: boolean;
  muted?: boolean;
  mention?: boolean;
  draft?: boolean;
};

const jointChannelRows: readonly ChannelRow[] = [
  { id: "partner-ops", title: "partner-ops", type: "joint", badge: "3" },
  { id: "vendor-review", title: "vendor-review", type: "joint" },
  { id: "community-lab", title: "community-lab", type: "joint", muted: true },
  { id: "shared-roadmap", title: "shared-roadmap", type: "joint", mention: true, badge: "1" },
  { id: "cross-team-qa", title: "cross-team-qa", type: "joint", draft: true },
  { id: "partner-launch", title: "partner-launch", type: "joint", badge: "7", bold: true },
];

const channelRows: readonly ChannelRow[] = [
  { id: "all", routeId: "proj-uiux", title: "all" },
  { id: "general", routeId: "component-matrix", title: "general" },
  { id: "design", routeId: "incident-alerts", title: "design", badge: "1" },
  {
    id: "incidents",
    routeId: "release",
    title: "incidents",
    badge: "12",
    bold: true,
    mention: true,
  },
  { id: "launch", routeId: "new-channel", title: "launch", badge: "2" },
  { id: "frontend", title: "frontend", badge: "4" },
  { id: "customer-notes", title: "customer-notes", badge: "2" },
  { id: "hiring", title: "hiring", type: "private" },
  { id: "exec", title: "exec", type: "private", badge: "5", bold: true },
  { id: "release-notes", title: "release-notes", muted: true },
  { id: "random", title: "random", muted: true, draft: true },
  { id: "design-crit", title: "design-crit", mention: true },
  { id: "standup", title: "standup", draft: true },
  { id: "archive-ops", title: "archive-ops" },
];

function ChannelRowContent({ row, hideBadge }: { row: ChannelRow; hideBadge?: boolean }) {
  const showBadge = row.badge && !hideBadge;
  const showAside = showBadge || row.draft;

  return (
    <>
      <ChatSidebarItemChannelIcon type={row.type ?? "channel"} />
      <ChatSidebarItemText className={row.muted ? "items-center gap-0" : undefined}>
        <ChatSidebarItemTitle className={row.bold ? "font-bold" : undefined}>
          {row.title}
        </ChatSidebarItemTitle>
        {row.muted ? <ChatSidebarItemMuted /> : null}
      </ChatSidebarItemText>
      {row.mention ? <ChatSidebarItemMention /> : null}
      {showAside ? (
        <ChatSidebarItemAside>
          {showBadge ? <ChatSidebarItemBadge>{row.badge}</ChatSidebarItemBadge> : null}
          {row.draft ? <ChatSidebarItemDraft /> : null}
        </ChatSidebarItemAside>
      ) : null}
    </>
  );
}

type DirectMessageRow = {
  id: string;
  routeId?: PlaygroundChannelId;
  title: string;
  subtitle: string;
  type: "human" | "agent";
  /** Letter initials fallback when the image is loading / fails. */
  fallback?: string;
  /** Portrait URL for humans; pixel-art data URI for agents. */
  avatarSrc?: string;
  badge?: string;
  bold?: boolean;
  status?: "online" | "working" | "idle" | "offline";
  messageIcon?: boolean;
  muted?: boolean;
  mention?: boolean;
  draft?: boolean;
};

// Human portraits — same Unsplash face-crop pattern as docs `AVATAR_PHOTOS`.
const HUMAN_AVATARS = {
  noah: "https://unsplash.com/photos/n4KewLKFOZw/download?force=true&w=160&h=160&fit=crop&crop=faces",
  samira:
    "https://unsplash.com/photos/H6FbE_vxaxQ/download?force=true&w=160&h=160&fit=crop&crop=faces",
  elliot:
    "https://unsplash.com/photos/mxwcEIqJ63Y/download?force=true&w=160&h=160&fit=crop&crop=faces",
  olivia:
    "https://unsplash.com/photos/8CEKQlmnf50/download?force=true&w=160&h=160&fit=crop&crop=faces",
  mateo:
    "https://unsplash.com/photos/iFgRcqHznqg/download?force=true&w=160&h=160&fit=crop&crop=faces",
} as const;

// Agent pixel avatars — same crisp-edge style as docs `SAMPLE_AGENT_PIXEL` /
// home hero bots. Distinct fills so DM rows don't all share one face.
const agentPixelAvatar = (fill: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" shape-rendering="crispEdges"><rect width="64" height="64" fill="${fill}"/><rect x="8" y="0" width="48" height="8" fill="#141111"/><rect x="0" y="8" width="8" height="24" fill="#141111"/><rect x="56" y="8" width="8" height="24" fill="#141111"/><rect x="8" y="32" width="48" height="8" fill="#141111"/><rect x="16" y="16" width="8" height="8" fill="#FFFFFF"/><rect x="40" y="16" width="8" height="8" fill="#FFFFFF"/><rect x="16" y="48" width="8" height="16" fill="#141111"/><rect x="40" y="48" width="8" height="16" fill="#141111"/></svg>`,
  )}`;

const AGENT_AVATARS = {
  cyan: agentPixelAvatar("#27CCF3"),
  yellow: agentPixelAvatar("#F7D358"),
  pink: agentPixelAvatar("#FF7AB6"),
  lime: agentPixelAvatar("#A3E86A"),
  orange: agentPixelAvatar("#FF9F43"),
  violet: agentPixelAvatar("#B794F4"),
  mint: agentPixelAvatar("#5EEAD4"),
  coral: agentPixelAvatar("#FB7185"),
  sky: agentPixelAvatar("#7DD3FC"),
  gold: agentPixelAvatar("#FBBF24"),
  rose: agentPixelAvatar("#F9A8D4"),
} as const;

function DirectMessageStatus({ status }: { status: NonNullable<DirectMessageRow["status"]> }) {
  if (status === "online") {
    return <Status aria-hidden variant="success" size="md" />;
  }
  if (status === "working") {
    return <Status aria-hidden variant="success" size="md" pulse />;
  }
  if (status === "idle") {
    return <Status aria-hidden variant="warning" size="md" />;
  }
  return <Status aria-hidden variant="default" size="md" />;
}

function DirectMessageRowContent({
  row,
  hideBadge,
}: {
  row: DirectMessageRow;
  hideBadge?: boolean;
}) {
  const showBadge = Boolean(row.badge && !hideBadge);
  const showAside = showBadge || Boolean(row.status || row.messageIcon || row.draft);

  return (
    <>
      <ChatSidebarItemIcon>
        <Avatar
          size="sidebar"
          type={row.type}
          className="[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-cyan"
        >
          {row.avatarSrc ? <AvatarImage src={row.avatarSrc} alt="" /> : null}
          {row.fallback ? (
            <AvatarFallback className="text-[9px] font-bold">{row.fallback}</AvatarFallback>
          ) : row.avatarSrc ? (
            <AvatarFallback />
          ) : null}
        </Avatar>
      </ChatSidebarItemIcon>
      <ChatSidebarItemText className={row.muted ? "items-center gap-0" : undefined}>
        <ChatSidebarItemTitle className={`max-w-[70%] shrink-0${row.bold ? " font-bold" : ""}`}>
          {row.title}
        </ChatSidebarItemTitle>
        <ChatSidebarItemSubtitle>{row.subtitle}</ChatSidebarItemSubtitle>
        {row.muted ? <ChatSidebarItemMuted /> : null}
      </ChatSidebarItemText>
      {row.mention ? <ChatSidebarItemMention /> : null}
      {showAside ? (
        <ChatSidebarItemAside>
          {row.status ? <DirectMessageStatus status={row.status} /> : null}
          {row.messageIcon ? <MessageSquare className="size-3 text-foreground-muted" /> : null}
          {showBadge ? <ChatSidebarItemBadge>{row.badge}</ChatSidebarItemBadge> : null}
          {row.draft ? <ChatSidebarItemDraft /> : null}
        </ChatSidebarItemAside>
      ) : null}
    </>
  );
}

const directMessageRows: readonly DirectMessageRow[] = [
  {
    id: "dm-noah",
    title: "Noah Bennett",
    subtitle: "Growth experiments and activation metrics.",
    type: "human",
    avatarSrc: HUMAN_AVATARS.noah,
    fallback: "N",
    badge: "12",
  },
  {
    id: "dm-samira",
    title: "Samira Khan",
    subtitle: "Security review and access policy.",
    type: "human",
    avatarSrc: HUMAN_AVATARS.samira,
    fallback: "S",
  },
  {
    id: "dm-elliot",
    title: "Elliot Park",
    subtitle: "Developer experience and local tooling.",
    type: "human",
    avatarSrc: HUMAN_AVATARS.elliot,
    fallback: "E",
    badge: "1",
  },
  {
    id: "dm-claude",
    routeId: "dm-atlas",
    title: "Claude Assistant",
    subtitle: "Seeded Claude agent on the primary online machine.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.cyan,
    status: "online",
    bold: true,
    badge: "1",
  },
  {
    id: "dm-olivia",
    title: "Olivia Carter",
    subtitle: "QA lead for desktop and mobile.",
    type: "human",
    avatarSrc: HUMAN_AVATARS.olivia,
    fallback: "O",
    badge: "1",
  },
  {
    id: "dm-mateo",
    title: "Mateo Alvarez",
    subtitle: "Infrastructure and staging deploys.",
    type: "human",
    avatarSrc: HUMAN_AVATARS.mateo,
    fallback: "M",
    badge: "1",
  },
  {
    id: "dm-search",
    title: "Search Scout",
    subtitle: "idle",
    type: "agent",
    avatarSrc: AGENT_AVATARS.yellow,
    messageIcon: true,
  },
  {
    id: "dm-release",
    title: "Release Scribe",
    subtitle: "Release-note and changelog agent.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.pink,
    status: "working",
    badge: "1",
  },
  {
    id: "dm-code-pilot",
    title: "Code Pilot",
    subtitle: "Active — refactoring auth module.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.lime,
    status: "online",
    bold: true,
    badge: "3",
  },
  {
    id: "dm-incident-triage",
    title: "Incident Triage",
    subtitle: "On standby — last run 2h ago.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.orange,
    status: "offline",
  },
  {
    id: "dm-qa-sentinel",
    title: "QA Sentinel",
    subtitle: "Regression checks and test plans.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.violet,
    badge: "5",
  },
  {
    id: "dm-deploy-watch",
    title: "Deploy Watch",
    subtitle: "Staging drift detected in us-east.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.mint,
    bold: true,
    mention: true,
  },
  {
    id: "dm-research-lark",
    title: "Research Lark",
    subtitle: "Market research summaries.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.coral,
    muted: true,
  },
  {
    id: "dm-spec-writer",
    title: "Spec Writer",
    subtitle: "Product requirements drafts.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.sky,
    draft: true,
  },
  {
    id: "dm-data-weaver",
    title: "Data Weaver",
    subtitle: "Synthesizing weekly metrics.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.gold,
    status: "working",
  },
  {
    id: "dm-support-guide",
    title: "Support Guide",
    subtitle: "Customer support playbooks.",
    type: "agent",
    avatarSrc: AGENT_AVATARS.rose,
    status: "idle",
    badge: "2",
  },
];

// Channels `+` add menu — source `renderChannelActionMenu`.
function SidebarAddMenu({
  onCreateChannel,
  onCreateJoint,
}: {
  onCreateChannel: () => void;
  onCreateJoint: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ChatSidebarSectionAction type="button" aria-label="Add channel">
            <Plus />
          </ChatSidebarSectionAction>
        }
      />
      <DropdownMenuContent
        align="end"
        className={`flex w-[190px] min-w-[190px] flex-col ${OVERLAY_CONTENT_CLASS}`}
      >
        <DropdownMenuItem onClick={onCreateChannel} className={OVERLAY_ITEM_CLASS}>
          <Plus />
          <span className="min-w-0 flex-1 text-left">Create Channel</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onCreateJoint} className={OVERLAY_ITEM_CLASS}>
          <GitBranch />
          <span className="min-w-0 flex-1 text-left">Create Joint Channel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Create Channel dialog — source `CreateChannelDialog`. Inlined (not the docs
// composition) so the playground can match source: title-case suffixed uppercase
// labels, no static archived-name banner, pink (accent) primary action.
function CreateChannelDialogContent() {
  return (
    <DialogContent className={OVERLAY_CONTENT_CLASS}>
      <DialogHeader>
        <DialogTitle>Create Channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <Field>
          <FieldLabel htmlFor="dialog-create-channel-name" required className={DIALOG_LABEL_CLASS}>
            Name
          </FieldLabel>
          <Input id="dialog-create-channel-name" placeholder="e.g. ai-research" />
        </Field>
        <Field>
          <FieldLabel
            htmlFor="dialog-create-channel-description"
            optional
            className={DIALOG_LABEL_CLASS}
          >
            Description
          </FieldLabel>
          <Textarea
            id="dialog-create-channel-description"
            placeholder="What is this channel about?"
            className="min-h-16"
          />
        </Field>
        <Field>
          <FieldLabel className={DIALOG_LABEL_CLASS}>Visibility</FieldLabel>
          <SegmentedControl defaultValue="public" ariaLabel="Channel visibility">
            <SegmentedControlItem value="public">
              <Hash />
              <SegmentedControlLabel>Public</SegmentedControlLabel>
            </SegmentedControlItem>
            <SegmentedControlItem value="private">
              <Lock />
              <SegmentedControlLabel>Private</SegmentedControlLabel>
            </SegmentedControlItem>
          </SegmentedControl>
        </Field>
        <Field>
          <FieldLabel optional className={DIALOG_LABEL_CLASS}>
            Members
          </FieldLabel>
          <Combobox<DialogMember, true>
            multiple
            autoHighlight
            items={dialogMembers}
            defaultValue={[dialogMembers[0], dialogMembers[2]]}
            isItemEqualToValue={(item, value) => item.id === value.id}
            itemToStringLabel={(member) => member.name}
          >
            <ComboboxControl className="w-full">
              <Search className="text-foreground-muted [[data-theme=brutal]_&]:!stroke-2 [[data-theme=brutal]_&_*]:!stroke-2" />
              <ComboboxInput
                aria-label="Search members"
                placeholder="Search members by name"
                suppressPasswordManager
              />
            </ComboboxControl>
            <ComboboxContent className="w-[var(--anchor-width)]">
              <ComboboxList className="max-h-none">
                {(member: DialogMember) => (
                  <ComboboxItem key={member.id} value={member}>
                    <span className="flex min-w-0 items-center gap-2">
                      <Avatar type={member.kind === "agent" ? "agent" : "human"} size="xs" />
                      <span className="min-w-0 truncate">{member.name}</span>
                    </span>
                    <ComboboxItemIndicator />
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <FieldDescription>
            Select the people and agents that should join immediately.
          </FieldDescription>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent">Create Channel</Button>
      </DialogFooter>
    </DialogContent>
  );
}

// Create Joint Channel dialog shell — source `CreateJointChannelDialog`.
// Structure only (Name, Description, Invite servers); actions inert.
function CreateJointChannelDialogContent() {
  return (
    <DialogContent className={`max-w-lg ${OVERLAY_CONTENT_CLASS}`}>
      <DialogHeader>
        <DialogTitle className="flex min-w-0 items-center gap-2">
          <GitBranch className="size-[18px] shrink-0" />
          <span className="truncate">Create Joint Channel</span>
        </DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-4">
        <div className="flex items-start gap-3 border-2 border-black bg-brutal-orange/20 p-3 font-bold">
          <span className="min-w-0 flex-1">
            Joint channels requires the Pro plan.{" "}
            <button type="button" className="text-black underline">
              View Billing
            </button>
          </span>
        </div>
        <Field>
          <FieldLabel htmlFor="dialog-joint-name" required className={DIALOG_LABEL_CLASS}>
            Name
          </FieldLabel>
          <Input id="dialog-joint-name" placeholder="e.g. partner-launch" />
        </Field>
        <Field>
          <FieldLabel htmlFor="dialog-joint-description" optional className={DIALOG_LABEL_CLASS}>
            Description
          </FieldLabel>
          <Textarea
            id="dialog-joint-description"
            placeholder="What will both servers use this channel for?"
            className="min-h-16"
          />
        </Field>
        <Field>
          <span className="flex items-center justify-between gap-3">
            <FieldLabel className={DIALOG_LABEL_CLASS}>Invite servers</FieldLabel>
            <Button type="button" variant="outline" size="xs">
              <Plus />
              Add server
            </Button>
          </span>
          <FieldDescription>
            Joint channels support a maximum of 3 servers, including this server.
          </FieldDescription>
          <span className="grid gap-3">
            <Field>
              <FieldLabel htmlFor="dialog-joint-slug" required className={DIALOG_LABEL_CLASS}>
                Server slug
              </FieldLabel>
              <Input id="dialog-joint-slug" placeholder="partner-workspace" />
            </Field>
            <Field>
              <FieldLabel htmlFor="dialog-joint-people" required className={DIALOG_LABEL_CLASS}>
                Invited people
              </FieldLabel>
              <Textarea
                id="dialog-joint-people"
                placeholder="@admin or admin@example.com"
                className="min-h-12"
              />
              <FieldDescription>
                Use target-server owner/admin handles or emails, separated by commas or new lines.
              </FieldDescription>
            </Field>
          </span>
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button variant="accent" disabled>
          Create Joint Channel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function PlaygroundSidebar({ activeChannelId }: { activeChannelId: PlaygroundChannelId }) {
  const [dialog, setDialog] = useState<ActiveDialog>(null);
  const [archiveTarget, setArchiveTarget] = useState<string | null>(null);

  return (
    <>
      <ChatSidebarRoot>
        <ChatSidebarHeader>
          <div className="min-w-0 flex-1">
            <div className="truncate font-heading text-[17px] font-medium leading-tight tabular-nums text-foreground-muted">
              Chat
            </div>
          </div>
          <SidebarAddMenu
            onCreateChannel={() => setDialog("create-channel")}
            onCreateJoint={() => setDialog("create-joint")}
          />
        </ChatSidebarHeader>
        <ChatSidebarBody>
          <div className="flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 [[data-preview-theme=elegant]_&]:px-[22px]">
            <div className="min-h-full">
              <ChatSidebarSection>
                <ChatSidebarSectionHeader className="mt-0">
                  <ChatSidebarSectionButton
                    type="button"
                    render={<button />}
                    className="[[data-preview-theme=elegant]_&]:font-[400] [[data-preview-theme=elegant]_&]:text-foreground-muted [[data-preview-theme=elegant]_&]:hover:text-foreground-strong [[data-preview-theme=elegant]_&]:active:text-foreground-strong"
                  >
                    <Bookmark
                      className={[
                        "size-3 shrink-0",
                        "[vector-effect:non-scaling-stroke] [&_*]:[vector-effect:non-scaling-stroke]",
                        "[[data-preview-theme=brutal]_&]:![stroke-width:1.5px] [[data-preview-theme=brutal]_&_*]:![stroke-width:1.5px]",
                        "[[data-preview-theme=elegant]_&]:![stroke-width:1px] [[data-preview-theme=elegant]_&_*]:![stroke-width:1px]",
                      ].join(" ")}
                    />
                    <ChatSidebarSectionTitle>Saved</ChatSidebarSectionTitle>
                    <ChatSidebarSectionCount>33</ChatSidebarSectionCount>
                  </ChatSidebarSectionButton>
                </ChatSidebarSectionHeader>
              </ChatSidebarSection>

              <ChatSidebarSection>
                <ChatSidebarSectionHeader>
                  <ChatSidebarSectionButton type="button" data-panel-open>
                    <ChatSidebarSectionTitle>Joint channels</ChatSidebarSectionTitle>
                    <ChevronRight className="size-3" />
                    <ChatSidebarSectionCount>{jointChannelRows.length}</ChatSidebarSectionCount>
                  </ChatSidebarSectionButton>
                </ChatSidebarSectionHeader>
                <ChatSidebarList>
                  {jointChannelRows.map((row) => (
                    <ChatSidebarItem key={row.id} type="button">
                      <ChannelRowContent row={row} />
                    </ChatSidebarItem>
                  ))}
                </ChatSidebarList>
              </ChatSidebarSection>

              <ChatSidebarSection>
                <ChatSidebarSectionHeader>
                  <ChatSidebarSectionButton type="button" data-panel-open>
                    <ChatSidebarSectionTitle>Channels</ChatSidebarSectionTitle>
                    <ChevronRight className="size-3" />
                    <ChatSidebarSectionCount>{channelRows.length}</ChatSidebarSectionCount>
                  </ChatSidebarSectionButton>
                </ChatSidebarSectionHeader>
                <ChatSidebarList>
                  {channelRows.map((row) =>
                    row.routeId ? (
                      <ChatSidebarItem
                        key={row.id}
                        selected={activeChannelId === row.routeId}
                        render={
                          <Link to="/playground/$channelId" params={{ channelId: row.routeId }} />
                        }
                      >
                        <ChannelRowContent row={row} hideBadge={activeChannelId === row.routeId} />
                      </ChatSidebarItem>
                    ) : (
                      <ChatSidebarItem key={row.id} type="button">
                        <ChannelRowContent row={row} />
                      </ChatSidebarItem>
                    ),
                  )}
                </ChatSidebarList>
              </ChatSidebarSection>

              <ChatSidebarSection>
                <ChatSidebarSectionHeader>
                  <ChatSidebarSectionButton type="button" data-panel-open>
                    <ChatSidebarSectionTitle>Direct Messages</ChatSidebarSectionTitle>
                    <ChevronRight className="size-3" />
                    <ChatSidebarSectionCount>{directMessageRows.length}</ChatSidebarSectionCount>
                  </ChatSidebarSectionButton>
                </ChatSidebarSectionHeader>
                <ChatSidebarList>
                  {directMessageRows.map((row) =>
                    row.routeId ? (
                      <ChatSidebarItem
                        key={row.id}
                        selected={activeChannelId === row.routeId}
                        render={
                          <Link to="/playground/$channelId" params={{ channelId: row.routeId }} />
                        }
                      >
                        <DirectMessageRowContent
                          row={row}
                          hideBadge={activeChannelId === row.routeId}
                        />
                      </ChatSidebarItem>
                    ) : (
                      <ChatSidebarItem key={row.id} type="button">
                        <DirectMessageRowContent row={row} />
                      </ChatSidebarItem>
                    ),
                  )}
                </ChatSidebarList>
              </ChatSidebarSection>
            </div>
          </div>
        </ChatSidebarBody>
      </ChatSidebarRoot>

      <Dialog
        open={dialog === "create-channel"}
        onOpenChange={(open) => setDialog(open ? "create-channel" : null)}
      >
        <CreateChannelDialogContent />
      </Dialog>

      <Dialog
        open={dialog === "create-joint"}
        onOpenChange={(open) => setDialog(open ? "create-joint" : null)}
      >
        <CreateJointChannelDialogContent />
      </Dialog>

      <AlertDialog
        open={archiveTarget !== null}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      >
        <AlertDialogContent className={OVERLAY_CONTENT_CLASS}>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Channel</AlertDialogTitle>
            <AlertDialogClose />
          </AlertDialogHeader>
          <AlertDialogBody>
            <div className="flex items-start gap-3 border-2 border-black bg-brutal-orange/20 p-3">
              <CircleAlert className="mt-0.5 size-[18px] shrink-0 text-black" />
              <p className="m-0 min-w-0 flex-1 text-sm leading-5 font-normal text-black">
                Archive "{archiveTarget}"? Members keep read access and history, but writes will be
                frozen and the channel will be hidden from sidebars. You can unarchive it later.
              </p>
            </div>
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogCancel size="md">Cancel</AlertDialogCancel>
            <AlertDialogAction variant="warning" size="md">
              Archive Channel
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
