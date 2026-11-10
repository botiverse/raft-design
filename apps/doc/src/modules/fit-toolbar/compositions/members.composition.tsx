import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import { ArrowDownUp, ArrowRightLeft, Bot, Plug, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SegmentedControl,
  SegmentedControlCount,
  SegmentedControlItem,
  SegmentedControlLabel,
  Text,
} from "@botiverse/raft-ui";
import {
  FitToolbar,
  FitToolbarButton,
  FitToolbarGroup,
  FitToolbarSplitButton,
} from "@botiverse/raft-ui/wip";

/**
 * The Members toolbar: the scope, the sort, Invite human, and Create agent
 * as a split button at the end, its ▾ opening the other ways to add an
 * agent. As the box narrows the sort shows its icon (10), Invite human its
 * icon (35), and Create agent becomes + with its ▾ kept (40). Narrow the box
 * to watch the steps.
 */
export function FitToolbarMembersContent() {
  const [scope, setScope] = useState("all");
  const [last, setLast] = useState("");
  const choose = useCallback((event: MouseEvent<HTMLElement>) => {
    setLast(event.currentTarget.dataset.action ?? "");
  }, []);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="w-full max-w-lg min-w-60 resize-x overflow-hidden rounded-container border border-line-seam p-3">
        <FitToolbar aria-label="Members" className="gap-2">
          <FitToolbarGroup firstLine className="gap-2">
            <SegmentedControl aria-label="Who" value={scope} onValueChange={setScope}>
              <SegmentedControlItem value="all">
                <SegmentedControlLabel>All</SegmentedControlLabel>
                <SegmentedControlCount>12</SegmentedControlCount>
              </SegmentedControlItem>
              <SegmentedControlItem value="agents">
                <SegmentedControlLabel>Agents</SegmentedControlLabel>
                <SegmentedControlCount>5</SegmentedControlCount>
              </SegmentedControlItem>
            </SegmentedControl>
          </FitToolbarGroup>
          <FitToolbarGroup firstLine className="ms-auto gap-2">
            <FitToolbarButton
              icon={<ArrowDownUp />}
              labelOrder={10}
              data-action="Sort"
              onClick={choose}
            >
              Sort
            </FitToolbarButton>
            <FitToolbarButton
              variant="default"
              icon={<UserPlus />}
              labelOrder={35}
              data-action="Invite human"
              onClick={choose}
            >
              Invite human
            </FitToolbarButton>
            <DropdownMenu>
              <FitToolbarSplitButton
                variant="primary"
                icon={<Bot />}
                groupLabel="New agent"
                menuLabel="More ways to create an agent"
                menuTrigger={<DropdownMenuTrigger />}
                plusOrder={40}
                data-action="Create agent"
                onClick={choose}
              >
                Create agent
              </FitToolbarSplitButton>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-action="Take over a local session" onClick={choose}>
                  <ArrowRightLeft />
                  Take over a local session
                </DropdownMenuItem>
                <DropdownMenuItem data-action="Connect an external agent" onClick={choose}>
                  <Plug />
                  Connect an external agent
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </FitToolbarGroup>
        </FitToolbar>
      </div>
      <Text.Sans color="muted" size="small" role="status">
        {last ? `Chose: ${last}` : "Nothing chosen yet"}
      </Text.Sans>
    </div>
  );
}
