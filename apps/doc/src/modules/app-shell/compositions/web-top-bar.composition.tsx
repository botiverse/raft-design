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
 * The web top bar from 768px: the frame's row above the rail, a frame item
 * with 6px above and below (44px with a mouse, the desktop header; 48px on a
 * touch screen). The workspace button on the left, the search field centered
 * on the window, the bell at the right end. The product puts the workspace
 * strip after the button and who is working before the bell. The left end
 * lines up with the rail's items (the region pads by the rail's item inset
 * plus its seam); on the right the bell's icon box ends 20px from the edge,
 * the region's padding plus the frame item's icon inset.
 */
export function WebTopBarComposition() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="flex h-[calc(var(--frame-item-height)+12px)] min-w-[720px] items-center border-b border-line-seam bg-layer-frame text-foreground-on-frame frame-decor-top">
        <div className="flex min-w-0 flex-1 items-center pr-2 pl-[calc((var(--rail-width)-1px-var(--rail-item))/2+1px)]">
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
        <div className="flex min-w-0 flex-1 items-center justify-end pr-[calc(20px-(var(--frame-item-height)-20px)/2)] pl-2">
          <Button variant="on-frame" size="icon-md" aria-label="Notifications">
            <Bell />
          </Button>
        </div>
      </div>
    </div>
  );
}
