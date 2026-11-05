import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@botiverse/raft-ui";
import { ButtonSplit, ButtonSplitMain, ButtonSplitMenu } from "@botiverse/raft-ui/wip";
import { useCallback, useState } from "react";

const MENU_TRIGGER = (
  <ButtonSplitMenu variant="primary" aria-label="More ways to create an agent" />
);

export function ButtonSplitContent() {
  const [status, setStatus] = useState("5 members");
  const create = useCallback(() => setStatus("5 members · setting up a new agent"), []);
  const takeOver = useCallback(() => setStatus("5 members · waiting for a local session"), []);
  const connect = useCallback(() => setStatus("5 members · waiting for an external agent"), []);

  return (
    <div className="flex w-full max-w-120 items-center justify-between gap-4">
      <p aria-live="polite" className="text-body text-foreground-muted">
        {status}
      </p>
      <ButtonSplit aria-label="New agent">
        <ButtonSplitMain variant="primary" onClick={create}>
          Create agent
        </ButtonSplitMain>
        <DropdownMenu>
          <DropdownMenuTrigger render={MENU_TRIGGER} />
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={takeOver}>Take over a local session</DropdownMenuItem>
            <DropdownMenuItem onClick={connect}>Connect an external agent</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonSplit>
    </div>
  );
}

// @docs-source-strip-start
export function ButtonSplitComposition() {
  return (
    <div className="flex size-full items-center justify-center px-6 py-8">
      <ButtonSplitContent />
    </div>
  );
}
// @docs-source-strip-end
