import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@botiverse/raft-ui";
import { ButtonSplit, ButtonSplitMain, ButtonSplitMenu } from "@botiverse/raft-ui/wip";
import { useCallback, useState } from "react";

const INVITE_MENU = <ButtonSplitMenu aria-label="More ways to invite" />;
const EXPORT_MENU = <ButtonSplitMenu aria-label="More export formats" disabled />;
const CREATE_MENU = <ButtonSplitMenu variant="primary" aria-label="More ways to create an agent" />;

export function ButtonSplitStatesContent() {
  const [status, setStatus] = useState("");
  const invite = useCallback(() => setStatus("Invitation sent"), []);
  const copyLink = useCallback(() => setStatus("Invite link copied"), []);
  const exportCsv = useCallback(() => setStatus("Exported as CSV"), []);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <ButtonSplit aria-label="Invite people">
          <ButtonSplitMain onClick={invite}>Invite</ButtonSplitMain>
          <DropdownMenu>
            <DropdownMenuTrigger render={INVITE_MENU} />
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={copyLink}>Copy invite link</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ButtonSplit>
        <ButtonSplit aria-label="Export members">
          <ButtonSplitMain onClick={exportCsv}>Export as CSV</ButtonSplitMain>
          <DropdownMenu>
            <DropdownMenuTrigger render={EXPORT_MENU} />
          </DropdownMenu>
        </ButtonSplit>
        <ButtonSplit aria-label="New agent" disabled>
          <ButtonSplitMain variant="primary">Create agent</ButtonSplitMain>
          <DropdownMenu>
            <DropdownMenuTrigger render={CREATE_MENU} />
          </DropdownMenu>
        </ButtonSplit>
      </div>
      <p aria-live="polite" className="min-h-5 text-body text-foreground-muted">
        {status}
      </p>
    </div>
  );
}

// @docs-source-strip-start
export function ButtonSplitStatesComposition() {
  return (
    <div className="flex size-full items-center justify-center px-6 py-8">
      <ButtonSplitStatesContent />
    </div>
  );
}
// @docs-source-strip-end
