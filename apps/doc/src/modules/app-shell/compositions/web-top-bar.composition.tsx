import { Bell, Search } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Button,
  SearchTrigger,
  SearchTriggerLabel,
  SearchTriggerShortcut,
  WorkspaceButton,
  WorkspaceButtonName,
} from "@botiverse/raft-ui";

/**
 * The web top bar from 768px: the frame's 48px row above the rail. The
 * workspace button on the left, the search field centered on the window, the
 * bell at the right end. The product puts the workspace strip after the
 * button and who is working before the bell. Both ends sit on 20px
 * (alignment.md, "The ends of a header"): on the left the avatar, after the
 * region's 9px, the button's border and its 10px; on the right the bell's
 * icon box, 12px plus the 36px frame item's 8px inset.
 */
export function WebTopBarComposition() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex h-12 min-w-[720px] items-center border-b border-line-seam bg-layer-frame text-foreground-on-frame">
        <div className="flex min-w-0 flex-1 items-center pr-2 pl-[calc(--spacing(2)+1px)]">
          <WorkspaceButton aria-label="Raft HQ, switch server">
            <Avatar type="server" size="sm">
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <WorkspaceButtonName>Raft HQ</WorkspaceButtonName>
          </WorkspaceButton>
        </div>
        <SearchTrigger className="w-[min(32vw,420px)]">
          <Search aria-hidden />
          <SearchTriggerLabel>Search</SearchTriggerLabel>
          <SearchTriggerShortcut>⌘K</SearchTriggerShortcut>
        </SearchTrigger>
        <div className="flex min-w-0 flex-1 items-center justify-end pr-3 pl-2">
          <Button variant="on-frame" size="icon-md" aria-label="Notifications">
            <Bell />
          </Button>
        </div>
      </div>
    </div>
  );
}
