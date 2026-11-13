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
  ScrollArea,
} from "@botiverse/raft-ui";
import {
  WebTopBarCenter,
  WebTopBarEnd,
  WebTopBarRoot,
  WebTopBarStart,
} from "@botiverse/raft-ui/wip";

/**
 * The web top bar from 768px: the frame's row above the rail. The workspace
 * button on the left, lined up with the rail's items; the search field
 * centered on the window; the bell at the right end, its icon box on the
 * column margin. The product puts the workspace strip after the button and
 * who is working before the bell.
 */
export function WebTopBarComposition() {
  return (
    <ScrollArea orientation="horizontal" className="w-full">
      <WebTopBarRoot className="min-w-[720px]">
        <WebTopBarStart>
          <WorkspaceButton aria-label="Raft HQ, switch server">
            <Avatar type="server" size="sm">
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
            <WorkspaceButtonName>Raft HQ</WorkspaceButtonName>
          </WorkspaceButton>
        </WebTopBarStart>
        <WebTopBarCenter>
          <SearchTrigger className="w-[min(32vw,420px)]">
            <Search aria-hidden />
            <SearchTriggerLabel>Search</SearchTriggerLabel>
            <SearchTriggerShortcut>⌘K</SearchTriggerShortcut>
          </SearchTrigger>
        </WebTopBarCenter>
        <WebTopBarEnd>
          <Button variant="on-frame" size="icon-md" aria-label="Notifications">
            <Bell />
          </Button>
        </WebTopBarEnd>
      </WebTopBarRoot>
    </ScrollArea>
  );
}
