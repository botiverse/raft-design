import { Link } from "@tanstack/react-router";
import {
  Archive,
  ArrowUpDown,
  Bookmark,
  ChevronRight,
  CircleAlert,
  GitBranch,
  Hash,
  Lock,
  Mail,
  MailOpen,
  Pin,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useState, type ReactElement, type ReactNode } from "react";
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
  Button,
  Combobox,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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

// Sidebar sort ⇅ menu — single-select radio (Manual/Recent/A-Z), matches the
// source `renderSortMenu` SelectionPopover. Shared by every section header.
function SidebarSortMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ChatSidebarSectionAction type="button" aria-label="Sort sidebar conversations">
            <ArrowUpDown className="size-3.5" />
          </ChatSidebarSectionAction>
        }
      />
      <DropdownMenuContent
        align="end"
        className={`flex w-[136px] min-w-[136px] flex-col ${OVERLAY_CONTENT_CLASS}`}
      >
        <DropdownMenuRadioGroup defaultValue="manual">
          <DropdownMenuRadioItem value="manual" className={OVERLAY_ITEM_CLASS}>
            Manual
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="recent" className={OVERLAY_ITEM_CLASS}>
            Recent
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="az" className={OVERLAY_ITEM_CLASS}>
            A-Z
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
            <Plus className="size-3.5" />
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

// Wraps a sidebar row as a right-click context-menu trigger. The row element
// keeps its own `render` (Link/button); Base UI merges the context handlers in.
function RowContextMenu({ trigger, children }: { trigger: ReactElement; children: ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={trigger} />
      <ContextMenuContent
        className={`flex w-48 min-w-48 flex-col ${OVERLAY_CONTENT_CLASS}`}
        collisionAvoidance={{ side: "flip", align: "flip" }}
        collisionPadding={8}
      >
        {children}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Shared read-toggle row — MailOpen/"Mark as Read" when unread, else Mail.
function ReadToggleItem({ hasUnread }: { hasUnread: boolean }) {
  return (
    <ContextMenuItem className={OVERLAY_ITEM_CLASS}>
      {hasUnread ? <MailOpen /> : <Mail />}
      <span className="min-w-0 flex-1 truncate">
        {hasUnread ? "Mark as Read" : "Mark as Unread"}
      </span>
    </ContextMenuItem>
  );
}

// Channel row context menu — source ctx `channel`.
function ChannelRowMenuItems({
  hasUnread,
  onArchive,
}: {
  hasUnread: boolean;
  onArchive: () => void;
}) {
  return (
    <>
      <ReadToggleItem hasUnread={hasUnread} />
      <ContextMenuItem className={OVERLAY_ITEM_CLASS}>
        <Pin />
        <span className="min-w-0 flex-1 truncate">Pin</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem onClick={onArchive} className={OVERLAY_ITEM_CLASS}>
        <Archive />
        <span className="min-w-0 flex-1 truncate">Archive</span>
      </ContextMenuItem>
    </>
  );
}

// DM row context menu — source ctx `dm`/`agent`/`human` (same shape).
function DmRowMenuItems({ hasUnread }: { hasUnread: boolean }) {
  return (
    <>
      <ReadToggleItem hasUnread={hasUnread} />
      <ContextMenuItem className={OVERLAY_ITEM_CLASS}>
        <Pin />
        <span className="min-w-0 flex-1 truncate">Pin</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem className={OVERLAY_ITEM_CLASS}>
        <X />
        <span className="min-w-0 flex-1 truncate">Close Chat</span>
      </ContextMenuItem>
    </>
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
                    <SidebarSortMenu />
                    <SidebarAddMenu
                      onCreateChannel={() => setDialog("create-channel")}
                      onCreateJoint={() => setDialog("create-joint")}
                    />
                  </ChatSidebarSectionActions>
                </ChatSidebarSectionHeader>
                <ChatSidebarList>
                  <RowContextMenu
                    trigger={
                      <ChatSidebarItem
                        selected={activeChannelId === "proj-uiux"}
                        render={
                          <Link to="/playground/$channelId" params={{ channelId: "proj-uiux" }} />
                        }
                      >
                        <ChatSidebarItemChannelIcon />
                        <ChatSidebarItemText>
                          <ChatSidebarItemTitle>proj-uiux</ChatSidebarItemTitle>
                        </ChatSidebarItemText>
                      </ChatSidebarItem>
                    }
                  >
                    <ChannelRowMenuItems
                      hasUnread={false}
                      onArchive={() => setArchiveTarget("proj-uiux")}
                    />
                  </RowContextMenu>
                  <RowContextMenu
                    trigger={
                      <ChatSidebarItem
                        selected={activeChannelId === "incident-alerts"}
                        render={
                          <Link
                            to="/playground/$channelId"
                            params={{ channelId: "incident-alerts" }}
                          />
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
                    }
                  >
                    <ChannelRowMenuItems
                      hasUnread
                      onArchive={() => setArchiveTarget("incident-alerts")}
                    />
                  </RowContextMenu>
                  <RowContextMenu
                    trigger={
                      <ChatSidebarItem
                        selected={activeChannelId === "release"}
                        render={
                          <Link to="/playground/$channelId" params={{ channelId: "release" }} />
                        }
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
                    }
                  >
                    <ChannelRowMenuItems hasUnread onArchive={() => setArchiveTarget("release")} />
                  </RowContextMenu>
                  <RowContextMenu
                    trigger={
                      <ChatSidebarItem
                        selected={activeChannelId === "component-matrix"}
                        render={
                          <Link
                            to="/playground/$channelId"
                            params={{ channelId: "component-matrix" }}
                          />
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
                    }
                  >
                    <ChannelRowMenuItems
                      hasUnread={false}
                      onArchive={() => setArchiveTarget("component-matrix")}
                    />
                  </RowContextMenu>
                  <RowContextMenu
                    trigger={
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
                    }
                  >
                    <ChannelRowMenuItems
                      hasUnread={false}
                      onArchive={() => setArchiveTarget("new-channel")}
                    />
                  </RowContextMenu>
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
                    <SidebarSortMenu />
                  </ChatSidebarSectionActions>
                </ChatSidebarSectionHeader>
                <ChatSidebarList>
                  <RowContextMenu
                    trigger={
                      <ChatSidebarItem
                        render={
                          <Link to="/playground/$channelId" params={{ channelId: "dm-cindy" }} />
                        }
                      >
                        <ChatSidebarItemIcon>
                          <Avatar
                            size="sidebar"
                            type="human"
                            className="[[data-preview-theme=brutal]_&]:border-black"
                          >
                            <AvatarFallback className="text-[9px] font-bold">C</AvatarFallback>
                          </Avatar>
                        </ChatSidebarItemIcon>
                        <ChatSidebarItemText>
                          <ChatSidebarItemTitle className="max-w-[70%] shrink-0">
                            Cindy
                          </ChatSidebarItemTitle>
                          <ChatSidebarItemSubtitle>
                            Pushed the latest export
                          </ChatSidebarItemSubtitle>
                        </ChatSidebarItemText>
                        <ChatSidebarItemAside>
                          <Status aria-hidden variant="success" size="md" />
                        </ChatSidebarItemAside>
                      </ChatSidebarItem>
                    }
                  >
                    <DmRowMenuItems hasUnread={false} />
                  </RowContextMenu>
                  <RowContextMenu
                    trigger={
                      <ChatSidebarItem
                        selected={activeChannelId === "dm-atlas"}
                        render={
                          <Link to="/playground/$channelId" params={{ channelId: "dm-atlas" }} />
                        }
                      >
                        <ChatSidebarItemIcon>
                          <Avatar
                            size="sidebar"
                            type="agent"
                            className="[[data-preview-theme=brutal]_&]:border-black [[data-preview-theme=brutal]_&]:bg-brutal-cyan"
                          />
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
                    }
                  >
                    <DmRowMenuItems hasUnread />
                  </RowContextMenu>
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
