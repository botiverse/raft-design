import {
  ArrowDownAZ,
  ArrowUpDown,
  Clock,
  EllipsisVertical,
  GitBranch,
  GripVertical,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  Button,
  ContextMenu,
  ContextMenuContent,
  ContextMenuFooter,
  ContextMenuItem,
  ContextMenuItemLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuFooter,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "raft-ui";
import { ChatSidebarAction, ChatSidebarSectionHeader } from "raft-ui/wip";

const SORT_MENU_CLASS = "flex w-[160px] min-w-[160px] flex-col";
const CHANNELS_MENU_CLASS = "flex w-[190px] min-w-[190px] flex-col";

export const SIDEBAR_SORT_OPTIONS = [
  { value: "manual", label: "Manual", icon: <GripVertical /> },
  { value: "recent", label: "Recent", icon: <Clock /> },
  { value: "az", label: "A-Z", icon: <ArrowDownAZ /> },
] as const;

function ChannelsMenuFooterText({ count, label }: { count: number; label: string }) {
  return (
    <>
      {count} {label}
    </>
  );
}

export function SidebarDropdownSortItems() {
  return (
    <DropdownMenuRadioGroup defaultValue="manual">
      {SIDEBAR_SORT_OPTIONS.map((option) => (
        <DropdownMenuRadioItem key={option.value} value={option.value}>
          {option.icon}
          <DropdownMenuItemLabel>{option.label}</DropdownMenuItemLabel>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

export function SidebarContextSortItems() {
  return (
    <ContextMenuRadioGroup defaultValue="manual">
      {SIDEBAR_SORT_OPTIONS.map((option) => (
        <ContextMenuRadioItem key={option.value} value={option.value}>
          {option.icon}
          <ContextMenuItemLabel>{option.label}</ContextMenuItemLabel>
        </ContextMenuRadioItem>
      ))}
    </ContextMenuRadioGroup>
  );
}

export function SidebarSectionSortDropdownContent() {
  return (
    <DropdownMenuContent align="end" className={SORT_MENU_CLASS}>
      <SidebarDropdownSortItems />
    </DropdownMenuContent>
  );
}

export function SidebarSectionSortContextContent() {
  return (
    <ContextMenuContent className={SORT_MENU_CLASS}>
      <SidebarContextSortItems />
    </ContextMenuContent>
  );
}

export function SidebarSectionChannelsDropdownContent({
  count,
  countLabel = "channels",
  createLabel = "Create Channel",
  createIcon = "channel",
  createDisabled = false,
  onCreate,
}: {
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  createDisabled?: boolean;
  onCreate?: () => void;
}) {
  const CreateIcon = createIcon === "joint" ? GitBranch : Plus;
  return (
    <DropdownMenuContent align="end" className={CHANNELS_MENU_CLASS}>
      <DropdownMenuItem disabled={createDisabled} onClick={createDisabled ? undefined : onCreate}>
        <CreateIcon />
        <DropdownMenuItemLabel>{createLabel}</DropdownMenuItemLabel>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <SidebarDropdownSortItems />
      <DropdownMenuSeparator />
      <DropdownMenuFooter>
        <ChannelsMenuFooterText count={count} label={countLabel} />
      </DropdownMenuFooter>
    </DropdownMenuContent>
  );
}

export function SidebarSectionChannelsContextContent({
  count,
  countLabel = "channels",
  createLabel = "Create Channel",
  createIcon = "channel",
  createDisabled = false,
  onCreate,
}: {
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  createDisabled?: boolean;
  onCreate?: () => void;
}) {
  const CreateIcon = createIcon === "joint" ? GitBranch : Plus;
  return (
    <ContextMenuContent className={CHANNELS_MENU_CLASS}>
      <ContextMenuItem disabled={createDisabled} onClick={createDisabled ? undefined : onCreate}>
        <CreateIcon />
        <ContextMenuItemLabel>{createLabel}</ContextMenuItemLabel>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <SidebarContextSortItems />
      <ContextMenuSeparator />
      <ContextMenuFooter>
        <ChannelsMenuFooterText count={count} label={countLabel} />
      </ContextMenuFooter>
    </ContextMenuContent>
  );
}

type SidebarCreateMenuProps = {
  disabled?: boolean;
  onCreateChannel?: () => void;
  onCreateJoint?: () => void;
};

export function SidebarCreateDropdownContent({
  disabled = false,
  onCreateChannel,
  onCreateJoint,
}: SidebarCreateMenuProps) {
  return (
    <DropdownMenuContent align="end" className={CHANNELS_MENU_CLASS}>
      <DropdownMenuItem disabled={disabled} onClick={disabled ? undefined : onCreateChannel}>
        <Plus />
        <DropdownMenuItemLabel>Create Channel</DropdownMenuItemLabel>
      </DropdownMenuItem>
      <DropdownMenuItem disabled={disabled} onClick={disabled ? undefined : onCreateJoint}>
        <GitBranch />
        <DropdownMenuItemLabel>Create Joint Channel</DropdownMenuItemLabel>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export function SidebarCreateMenu({
  disabled = false,
  onCreateChannel,
  onCreateJoint,
}: SidebarCreateMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Add channel"
            disabled={disabled}
          >
            <Plus />
          </Button>
        }
      />
      <SidebarCreateDropdownContent
        disabled={disabled}
        onCreateChannel={onCreateChannel}
        onCreateJoint={onCreateJoint}
      />
    </DropdownMenu>
  );
}

/** Hover action for Pinned / DM — sort only. */
export function SidebarSectionSortMenu({
  "aria-label": ariaLabel = "Sort section",
}: {
  "aria-label"?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ChatSidebarAction type="button" aria-label={ariaLabel}>
            <ArrowUpDown />
          </ChatSidebarAction>
        }
      />
      <SidebarSectionSortDropdownContent />
    </DropdownMenu>
  );
}

/** Plain + button for Channels / Joint. */
export function SidebarSectionAddButton({
  "aria-label": ariaLabel = "Add channel",
  disabled = false,
  onClick,
}: {
  "aria-label"?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <ChatSidebarAction
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      <Plus />
    </ChatSidebarAction>
  );
}

/** Channels / Joint section menu: create + sort + count footer. */
export function SidebarSectionChannelsMenu({
  "aria-label": ariaLabel = "Section menu",
  count,
  countLabel,
  createLabel,
  createIcon,
  createDisabled = false,
  onCreate,
}: {
  "aria-label"?: string;
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  createDisabled?: boolean;
  onCreate?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ChatSidebarAction type="button" aria-label={ariaLabel}>
            <EllipsisVertical />
          </ChatSidebarAction>
        }
      />
      <SidebarSectionChannelsDropdownContent
        count={count}
        countLabel={countLabel}
        createLabel={createLabel}
        createIcon={createIcon}
        createDisabled={createDisabled}
        onCreate={onCreate}
      />
    </DropdownMenu>
  );
}

type SidebarSectionHeaderMenuProps = {
  children: ReactNode;
  menu: "sort" | "channels";
  count?: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  createDisabled?: boolean;
  onCreate?: () => void;
};

/** Section header with context menu mirroring the hover dropdown content. */
export function SidebarSectionHeaderMenu({
  children,
  menu,
  count = 0,
  countLabel,
  createLabel,
  createIcon,
  createDisabled = false,
  onCreate,
}: SidebarSectionHeaderMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full min-w-0">
        <ChatSidebarSectionHeader>{children}</ChatSidebarSectionHeader>
      </ContextMenuTrigger>
      {menu === "sort" ? <SidebarSectionSortContextContent /> : null}
      {menu === "channels" ? (
        <SidebarSectionChannelsContextContent
          count={count}
          countLabel={countLabel}
          createLabel={createLabel}
          createIcon={createIcon}
          createDisabled={createDisabled}
          onCreate={onCreate}
        />
      ) : null}
    </ContextMenu>
  );
}
