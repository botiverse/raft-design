import {
  AddCommentIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  PanelAction,
  PanelActions,
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelMeta,
  PanelTitle,
} from "@botiverse/raft-ui";
import {
  PanelSplitAction,
  PanelSplitActionMain,
  PanelSplitActionMenu,
} from "@botiverse/raft-ui/wip";
import { MessageSquare, X } from "lucide-react";
import { useCallback, useState } from "react";

const MENU_TRIGGER = <PanelSplitActionMenu aria-label="Comments" />;

export function PanelSplitActionContent() {
  const [commenting, setCommenting] = useState(false);
  const [showingAll, setShowingAll] = useState(false);
  const showAll = useCallback(() => setShowingAll(true), []);
  const close = useCallback(() => setShowingAll(false), []);

  return (
    <div className="w-full max-w-160 bg-layer-canvas">
      <PanelHeader className="border-b border-line-seam">
        <PanelHeaderContent>
          <PanelHeading>
            <PanelTitle>Q3 launch plan</PanelTitle>
          </PanelHeading>
          <PanelMeta>{showingAll ? "Showing all 3 comments" : "Artifact · #launch"}</PanelMeta>
        </PanelHeaderContent>
        <PanelActions>
          <PanelSplitAction aria-label="Comment">
            <PanelSplitActionMain
              aria-label="Comment"
              pressed={commenting}
              onPressedChange={setCommenting}
            >
              <AddCommentIcon />
            </PanelSplitActionMain>
            <DropdownMenu>
              <DropdownMenuTrigger render={MENU_TRIGGER} />
              <DropdownMenuContent side="bottom" align="end" aria-label="Comments">
                <DropdownMenuItem onClick={showAll}>
                  <MessageSquare />
                  Show All Comments (3)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </PanelSplitAction>
          <PanelAction aria-label="Close" onClick={close}>
            <X />
          </PanelAction>
        </PanelActions>
      </PanelHeader>
    </div>
  );
}

export function PanelSplitActionComposition() {
  return (
    <div className="flex size-full items-center justify-center px-3 py-4">
      <PanelSplitActionContent />
    </div>
  );
}
