import {
  Bot,
  CheckSquare,
  FolderPlus,
  GitBranch,
  Hash,
  MessageSquarePlus,
  Pin,
  Plus,
  Search,
  SquarePen,
  X,
} from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  SidebarItem,
  SidebarItemIcon,
  SidebarItemMeta,
  SidebarItemTitle,
} from "raft-ui";

/**
 * Design exploration for the chat sidebar (not a shipped surface). The
 * playground sidebar renders one of three directions when the URL carries
 * `?sidebar=a|b|c`; without it, the sidebar is unchanged.
 *
 *   a — smallest change: a "New" menu in the header and a filter box.
 *   b — the filter box is also the create entry: no match offers to create.
 *   c — b, plus management made visible: a tasks row, an unread-only toggle,
 *       and a dismissible hint strip that teaches pinning.
 */
export type SidebarDirection = "a" | "b" | "c";

function subscribeToLocation(notify: () => void) {
  window.addEventListener("popstate", notify);
  return () => window.removeEventListener("popstate", notify);
}

function readDirection(): SidebarDirection | null {
  const value = new URLSearchParams(window.location.search).get("sidebar");
  return value === "a" || value === "b" || value === "c" ? value : null;
}

function readDirectionOnServer(): SidebarDirection | null {
  return null;
}

export function useSidebarDirection(): SidebarDirection | null {
  return useSyncExternalStore(subscribeToLocation, readDirection, readDirectionOnServer);
}

export function matchesSidebarQuery(name: string, query: string) {
  const needle = query.trim().toLowerCase();
  return needle === "" || name.toLowerCase().includes(needle);
}

type SidebarQuickFindProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
};

/** Filter box pinned under the header. Typing narrows the list in place. */
export function SidebarQuickFind({ value, onValueChange, placeholder }: SidebarQuickFindProps) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onValueChange(event.target.value),
    [onValueChange],
  );
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") onValueChange("");
    },
    [onValueChange],
  );
  const handleClear = useCallback(() => onValueChange(""), [onValueChange]);

  return (
    <div className="pb-2">
      <InputGroup>
        <InputGroupAddon.Text>
          <Search aria-hidden className="size-3.5" />
        </InputGroupAddon.Text>
        <InputGroupInput
          aria-label={placeholder}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        {value ? (
          <InputGroupAddon.Text align="inline-end">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Clear"
              onClick={handleClear}
            >
              <X />
            </Button>
          </InputGroupAddon.Text>
        ) : null}
      </InputGroup>
    </div>
  );
}

/** One "New" entry for everything a person can start from the chat page. */
export function SidebarNewMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="outline" size="icon-sm" aria-label="New">
            <SquarePen />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <MessageSquarePlus />
          <DropdownMenuItemLabel>New message</DropdownMenuItemLabel>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Hash />
          <DropdownMenuItemLabel>New channel</DropdownMenuItemLabel>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <GitBranch />
          <DropdownMenuItemLabel>New joint channel</DropdownMenuItemLabel>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bot />
          <DropdownMenuItemLabel>New agent</DropdownMenuItemLabel>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <FolderPlus />
          <DropdownMenuItemLabel>New section</DropdownMenuItemLabel>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Shown when the filter matches nothing: the query becomes a create offer. */
export function SidebarCreateFromQuery({ query }: { query: string }) {
  const name = query.trim();
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="pt-1">
      <p className="px-3 pb-1 text-xs text-foreground-muted">Nothing called “{name}” yet</p>
      <SidebarItem variant="accent">
        <SidebarItemIcon aria-hidden>
          <Hash />
        </SidebarItemIcon>
        <SidebarItemTitle>Create channel #{slug}</SidebarItemTitle>
        <SidebarItemMeta>
          <Plus aria-hidden className="size-3.5" />
        </SidebarItemMeta>
      </SidebarItem>
      <SidebarItem variant="accent">
        <SidebarItemIcon aria-hidden>
          <MessageSquarePlus />
        </SidebarItemIcon>
        <SidebarItemTitle>Message someone named “{name}”</SidebarItemTitle>
      </SidebarItem>
      <SidebarItem variant="accent">
        <SidebarItemIcon aria-hidden>
          <Bot />
        </SidebarItemIcon>
        <SidebarItemTitle>Create agent “{name}”</SidebarItemTitle>
        <SidebarItemMeta>
          <Plus aria-hidden className="size-3.5" />
        </SidebarItemMeta>
      </SidebarItem>
    </div>
  );
}

/** A fixed slot for "how much is left for me": tasks first, more later. */
export function SidebarTasksRow({ remaining }: { remaining: number }) {
  return (
    <SidebarItem variant="accent">
      <SidebarItemIcon aria-hidden>
        <CheckSquare />
      </SidebarItemIcon>
      <SidebarItemTitle>My tasks</SidebarItemTitle>
      <SidebarItemMeta>{remaining} left</SidebarItemMeta>
    </SidebarItem>
  );
}

/** One teaching hint at a time, dismissible, above the sections. */
export function SidebarHintStrip({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="py-2">
      <Banner status="default">
        <Pin />
        <BannerTitle>Keep what matters on top</BannerTitle>
        <BannerDescription>
          Drag a channel or DM into Pinned, or right-click it for more options.
        </BannerDescription>
        <BannerAction>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Dismiss"
            onClick={onDismiss}
          >
            <X />
          </Button>
        </BannerAction>
      </Banner>
    </div>
  );
}

/** Unread-only toggle that sits beside the filter in direction c. */
export function SidebarUnreadToggle({
  pressed,
  onPressedChange,
}: {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
}) {
  const handleClick = useCallback(() => onPressedChange(!pressed), [onPressedChange, pressed]);
  return (
    <div className="pb-2">
      <Button
        type="button"
        variant={pressed ? "outline" : "ghost"}
        size="xs"
        aria-pressed={pressed}
        onClick={handleClick}
      >
        Unread only
      </Button>
    </div>
  );
}
