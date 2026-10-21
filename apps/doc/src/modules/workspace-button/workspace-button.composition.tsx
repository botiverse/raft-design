import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  WorkspaceButton,
  WorkspaceButtonName,
} from "@botiverse/raft-ui";

const SERVERS = ["Acme", "Botiverse", "The Long Name Of A Server That Does Not Fit"];

export function WorkspaceButtonComposition() {
  const [server, setServer] = useState(SERVERS[0]);

  return (
    <div className="flex h-14 w-80 max-w-full items-center rounded-control bg-layer-frame px-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger render={<WorkspaceButton aria-label={server} />}>
          <Avatar type="server" size="sm">
            <AvatarFallback>{server.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <WorkspaceButtonName>{server}</WorkspaceButtonName>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={server} onValueChange={setServer}>
            {SERVERS.map((name) => (
              <DropdownMenuRadioItem key={name} value={name}>
                {name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
