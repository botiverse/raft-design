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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "raft-ui";
import { ChatSidebarAction, ChatSidebarSectionHeader } from "raft-ui/wip";

const SORT_MENU_CLASS = "flex w-[160px] min-w-[160px] flex-col";
const CHANNELS_MENU_CLASS = "flex w-[190px] min-w-[190px] flex-col";

function ChannelsMenuFooter({ count, label }: { count: number; label: string }) {
  return (
    <div className="px-3 py-2 text-xs text-foreground-muted tabular-nums">
      {count} {label}
    </div>
  );
}

export function SidebarSectionSortDropdownContent() {
  return (
    <DropdownMenuContent align="end" className={SORT_MENU_CLASS}>
      <DropdownMenuRadioGroup defaultValue="manual">
        <DropdownMenuRadioItem value="manual">
          <GripVertical />
          <span className="min-w-0 flex-1 text-left">Manual</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="recent">
          <Clock />
          <span className="min-w-0 flex-1 text-left">Recent</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="az">
          <ArrowDownAZ />
          <span className="min-w-0 flex-1 text-left">A-Z</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </DropdownMenuContent>
  );
}

export function SidebarSectionSortContextContent() {
  return (
    <ContextMenuContent className={SORT_MENU_CLASS}>
      <ContextMenuRadioGroup defaultValue="manual">
        <ContextMenuRadioItem value="manual">
          <GripVertical />
          <span className="min-w-0 flex-1 text-left">Manual</span>
        </ContextMenuRadioItem>
        <ContextMenuRadioItem value="recent">
          <Clock />
          <span className="min-w-0 flex-1 text-left">Recent</span>
        </ContextMenuRadioItem>
        <ContextMenuRadioItem value="az">
          <ArrowDownAZ />
          <span className="min-w-0 flex-1 text-left">A-Z</span>
        </ContextMenuRadioItem>
      </ContextMenuRadioGroup>
    </ContextMenuContent>
  );
}

export function SidebarSectionChannelsDropdownContent({
  count,
  countLabel = "channels",
  createLabel = "Create Channel",
  createIcon = "channel",
  onCreate,
}: {
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  onCreate?: () => void;
}) {
  const CreateIcon = createIcon === "joint" ? GitBranch : Plus;
  return (
    <DropdownMenuContent align="end" className={CHANNELS_MENU_CLASS}>
      <DropdownMenuItem onClick={onCreate}>
        <CreateIcon />
        <span className="min-w-0 flex-1 text-left">{createLabel}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuRadioGroup defaultValue="manual">
        <DropdownMenuRadioItem value="manual">
          <GripVertical />
          <span className="min-w-0 flex-1 text-left">Manual</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="recent">
          <Clock />
          <span className="min-w-0 flex-1 text-left">Recent</span>
        </DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="az">
          <ArrowDownAZ />
          <span className="min-w-0 flex-1 text-left">A-Z</span>
        </DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <ChannelsMenuFooter count={count} label={countLabel} />
    </DropdownMenuContent>
  );
}

export function SidebarSectionChannelsContextContent({
  count,
  countLabel = "channels",
  createLabel = "Create Channel",
  createIcon = "channel",
  onCreate,
}: {
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  onCreate?: () => void;
}) {
  const CreateIcon = createIcon === "joint" ? GitBranch : Plus;
  return (
    <ContextMenuContent className={CHANNELS_MENU_CLASS}>
      <ContextMenuItem onClick={onCreate}>
        <CreateIcon />
        <span className="min-w-0 flex-1 text-left">{createLabel}</span>
      </ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuRadioGroup defaultValue="manual">
        <ContextMenuRadioItem value="manual">
          <GripVertical />
          <span className="min-w-0 flex-1 text-left">Manual</span>
        </ContextMenuRadioItem>
        <ContextMenuRadioItem value="recent">
          <Clock />
          <span className="min-w-0 flex-1 text-left">Recent</span>
        </ContextMenuRadioItem>
        <ContextMenuRadioItem value="az">
          <ArrowDownAZ />
          <span className="min-w-0 flex-1 text-left">A-Z</span>
        </ContextMenuRadioItem>
      </ContextMenuRadioGroup>
      <ContextMenuSeparator />
      <ChannelsMenuFooter count={count} label={countLabel} />
    </ContextMenuContent>
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
            <ArrowUpDown className="size-3.5" />
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
  onClick,
}: {
  "aria-label"?: string;
  onClick?: () => void;
}) {
  return (
    <ChatSidebarAction type="button" aria-label={ariaLabel} onClick={onClick}>
      <Plus className="size-3.5" />
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
  onCreate,
}: {
  "aria-label"?: string;
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  onCreate?: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <ChatSidebarAction type="button" aria-label={ariaLabel}>
            <EllipsisVertical className="size-3.5" />
          </ChatSidebarAction>
        }
      />
      <SidebarSectionChannelsDropdownContent
        count={count}
        countLabel={countLabel}
        createLabel={createLabel}
        createIcon={createIcon}
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
  onCreate,
}: SidebarSectionHeaderMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger render={<div className="w-full min-w-0" />}>
        <ChatSidebarSectionHeader>{children}</ChatSidebarSectionHeader>
      </ContextMenuTrigger>
      {menu === "sort" ? <SidebarSectionSortContextContent /> : null}
      {menu === "channels" ? (
        <SidebarSectionChannelsContextContent
          count={count}
          countLabel={countLabel}
          createLabel={createLabel}
          createIcon={createIcon}
          onCreate={onCreate}
        />
      ) : null}
    </ContextMenu>
  );
}
