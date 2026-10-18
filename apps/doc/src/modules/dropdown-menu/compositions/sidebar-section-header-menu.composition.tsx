import {
  ArrowDownAZ,
  ArrowUpDown,
  Clock,
  EllipsisVertical,
  GitBranch,
  GripVertical,
  Plus,
} from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";
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
  SidebarControl,
  SidebarSectionHeader,
} from "@botiverse/raft-ui";

const SORT_MENU_CLASS = "flex w-[160px] min-w-[160px] flex-col";
const CHANNELS_MENU_CLASS = "flex w-[190px] min-w-[190px] flex-col";

/**
 * Lets the menus rendered inside a section header mirror their open state onto
 * the header element as `data-popup-open`. The attention badge hides off that
 * attribute (`group-data-popup-open/section-header`), because the previous
 * ancestor `:has()` version made Chromium recalculate the whole page on
 * unrelated mutations (#386). The provider lives in SidebarSectionHeaderMenu.
 */
const SectionPopupOpenContext = createContext<((open: boolean) => void) | null>(null);

const SIDEBAR_SORT_OPTIONS = [
  { value: "manual", label: "Manual", icon: <GripVertical /> },
  { value: "recent", label: "Recent", icon: <Clock /> },
  { value: "az", label: "A-Z", icon: <ArrowDownAZ /> },
] as const;

export type SidebarSortValue = (typeof SIDEBAR_SORT_OPTIONS)[number]["value"];

type SidebarSortItemsProps = {
  value?: SidebarSortValue;
  defaultValue?: SidebarSortValue;
  onValueChange?: (value: SidebarSortValue) => void;
};

function isSidebarSortValue(value: string): value is SidebarSortValue {
  return SIDEBAR_SORT_OPTIONS.some((option) => option.value === value);
}

function handleSidebarSortValueChange(
  onValueChange: ((value: SidebarSortValue) => void) | undefined,
  value: string,
) {
  if (onValueChange && isSidebarSortValue(value)) onValueChange(value);
}

function ChannelsMenuFooterText({ count, label }: { count: number; label: string }) {
  return (
    <>
      {count} {label}
    </>
  );
}

export function SidebarDropdownSortItems({
  value,
  defaultValue = "manual",
  onValueChange,
}: SidebarSortItemsProps = {}) {
  const handleValueChange = useCallback(
    (nextValue: string) => handleSidebarSortValueChange(onValueChange, nextValue),
    [onValueChange],
  );

  return (
    <DropdownMenuRadioGroup
      defaultValue={value === undefined ? defaultValue : undefined}
      value={value}
      onValueChange={handleValueChange}
    >
      {SIDEBAR_SORT_OPTIONS.map((option) => (
        <DropdownMenuRadioItem key={option.value} value={option.value}>
          {option.icon}
          <DropdownMenuItemLabel>{option.label}</DropdownMenuItemLabel>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  );
}

export function SidebarContextSortItems({
  value,
  defaultValue = "manual",
  onValueChange,
}: SidebarSortItemsProps = {}) {
  const handleValueChange = useCallback(
    (nextValue: string) => handleSidebarSortValueChange(onValueChange, nextValue),
    [onValueChange],
  );

  return (
    <ContextMenuRadioGroup
      defaultValue={value === undefined ? defaultValue : undefined}
      value={value}
      onValueChange={handleValueChange}
    >
      {SIDEBAR_SORT_OPTIONS.map((option) => (
        <ContextMenuRadioItem key={option.value} value={option.value}>
          {option.icon}
          <ContextMenuItemLabel>{option.label}</ContextMenuItemLabel>
        </ContextMenuRadioItem>
      ))}
    </ContextMenuRadioGroup>
  );
}

export function SidebarSectionSortDropdownContent(props: SidebarSortItemsProps = {}) {
  return (
    <DropdownMenuContent align="end" className={SORT_MENU_CLASS}>
      <SidebarDropdownSortItems {...props} />
    </DropdownMenuContent>
  );
}

export function SidebarSectionSortContextContent(props: SidebarSortItemsProps = {}) {
  return (
    <ContextMenuContent className={SORT_MENU_CLASS}>
      <SidebarContextSortItems {...props} />
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
  sortValue,
  onSortValueChange,
}: {
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  createDisabled?: boolean;
  onCreate?: () => void;
  sortValue?: SidebarSortValue;
  onSortValueChange?: (value: SidebarSortValue) => void;
}) {
  const CreateIcon = createIcon === "joint" ? GitBranch : Plus;
  return (
    <DropdownMenuContent align="end" className={CHANNELS_MENU_CLASS}>
      <DropdownMenuItem disabled={createDisabled} onClick={createDisabled ? undefined : onCreate}>
        <CreateIcon />
        <DropdownMenuItemLabel>{createLabel}</DropdownMenuItemLabel>
      </DropdownMenuItem>
      {createIcon === "channel" ? (
        <DropdownMenuItem disabled={createDisabled}>
          <GitBranch />
          <DropdownMenuItemLabel>Create Joint Channel</DropdownMenuItemLabel>
        </DropdownMenuItem>
      ) : null}
      <DropdownMenuSeparator />
      <SidebarDropdownSortItems value={sortValue} onValueChange={onSortValueChange} />
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
  sortValue,
  onSortValueChange,
}: {
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  createDisabled?: boolean;
  onCreate?: () => void;
  sortValue?: SidebarSortValue;
  onSortValueChange?: (value: SidebarSortValue) => void;
}) {
  const CreateIcon = createIcon === "joint" ? GitBranch : Plus;
  return (
    <ContextMenuContent className={CHANNELS_MENU_CLASS}>
      <ContextMenuItem disabled={createDisabled} onClick={createDisabled ? undefined : onCreate}>
        <CreateIcon />
        <ContextMenuItemLabel>{createLabel}</ContextMenuItemLabel>
      </ContextMenuItem>
      {createIcon === "channel" ? (
        <ContextMenuItem disabled={createDisabled}>
          <GitBranch />
          <ContextMenuItemLabel>Create Joint Channel</ContextMenuItemLabel>
        </ContextMenuItem>
      ) : null}
      <ContextMenuSeparator />
      <SidebarContextSortItems value={sortValue} onValueChange={onSortValueChange} />
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
  value,
  onValueChange,
}: {
  "aria-label"?: string;
  value?: SidebarSortValue;
  onValueChange?: (value: SidebarSortValue) => void;
}) {
  const reportPopupOpen = useContext(SectionPopupOpenContext);
  return (
    <DropdownMenu onOpenChange={reportPopupOpen ?? undefined}>
      <DropdownMenuTrigger
        render={
          <SidebarControl type="button" aria-label={ariaLabel}>
            <ArrowUpDown />
          </SidebarControl>
        }
      />
      <SidebarSectionSortDropdownContent value={value} onValueChange={onValueChange} />
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
    <SidebarControl
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      <Plus />
    </SidebarControl>
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
  sortValue,
  onSortValueChange,
}: {
  "aria-label"?: string;
  count: number;
  countLabel?: string;
  createLabel?: string;
  createIcon?: "channel" | "joint";
  createDisabled?: boolean;
  onCreate?: () => void;
  sortValue?: SidebarSortValue;
  onSortValueChange?: (value: SidebarSortValue) => void;
}) {
  const reportPopupOpen = useContext(SectionPopupOpenContext);
  return (
    <DropdownMenu onOpenChange={reportPopupOpen ?? undefined}>
      <DropdownMenuTrigger
        render={
          <SidebarControl type="button" aria-label={ariaLabel}>
            <EllipsisVertical />
          </SidebarControl>
        }
      />
      <SidebarSectionChannelsDropdownContent
        count={count}
        countLabel={countLabel}
        createLabel={createLabel}
        createIcon={createIcon}
        createDisabled={createDisabled}
        onCreate={onCreate}
        sortValue={sortValue}
        onSortValueChange={onSortValueChange}
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
  sortValue?: SidebarSortValue;
  onSortValueChange?: (value: SidebarSortValue) => void;
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
  sortValue,
  onSortValueChange,
}: SidebarSectionHeaderMenuProps) {
  const [popupOpen, setPopupOpen] = useState(false);
  const handlePopupOpenChange = useCallback((open: boolean) => {
    setPopupOpen(open);
  }, []);

  return (
    <SectionPopupOpenContext.Provider value={handlePopupOpenChange}>
      <ContextMenu>
        <ContextMenuTrigger className="w-full min-w-0">
          <SidebarSectionHeader data-popup-open={popupOpen ? "" : undefined}>
            {children}
          </SidebarSectionHeader>
        </ContextMenuTrigger>
        {menu === "sort" ? (
          <SidebarSectionSortContextContent value={sortValue} onValueChange={onSortValueChange} />
        ) : null}
        {menu === "channels" ? (
          <SidebarSectionChannelsContextContent
            count={count}
            countLabel={countLabel}
            createLabel={createLabel}
            createIcon={createIcon}
            createDisabled={createDisabled}
            onCreate={onCreate}
            sortValue={sortValue}
            onSortValueChange={onSortValueChange}
          />
        ) : null}
      </ContextMenu>
    </SectionPopupOpenContext.Provider>
  );
}
