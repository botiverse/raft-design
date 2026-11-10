import { useCallback, useMemo, useState } from "react";
import { Archive, CircleDot, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Text,
} from "@botiverse/raft-ui";
import {
  SelectionToolbar,
  SelectionToolbarAction,
  SelectionToolbarActions,
  SelectionToolbarClose,
  SelectionToolbarCount,
  SelectionToolbarCountValue,
  SelectionToolbarDock,
  SelectionToolbarHint,
  SelectionToolbarMore,
} from "@botiverse/raft-ui/wip";

export function SelectionToolbarContent() {
  const [last, setLast] = useState("");
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const portalProps = useMemo(
    () => (portalContainer ? { container: portalContainer } : undefined),
    [portalContainer],
  );
  const markDone = useCallback(() => setLast("2 tasks moved to Done, 1 skipped"), []);
  const markInProgress = useCallback(() => setLast("2 tasks moved to In progress, 1 skipped"), []);
  const assignToMe = useCallback(() => setLast("2 tasks assigned to you, 1 skipped"), []);
  const archive = useCallback(() => setLast("3 tasks archived"), []);
  const clear = useCallback(() => setLast("Selection cleared"), []);

  return (
    <div ref={setPortalContainer} className="relative h-40 w-full">
      <Text.Sans color="muted" size="small" role="status" className="p-4">
        {last}
      </Text.Sans>
      <SelectionToolbarDock>
        <SelectionToolbar aria-label="Selected task actions">
          <SelectionToolbarCount>
            <SelectionToolbarCountValue>3</SelectionToolbarCountValue> selected
          </SelectionToolbarCount>
          <SelectionToolbarHint>1 will be skipped</SelectionToolbarHint>
          <SelectionToolbarActions>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SelectionToolbarAction menu icon={<CircleDot />}>
                    Status
                  </SelectionToolbarAction>
                }
              />
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                portalProps={portalProps}
              >
                <DropdownMenuItem onClick={markInProgress}>In progress</DropdownMenuItem>
                <DropdownMenuItem onClick={markDone}>Done</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <SelectionToolbarAction icon={<UserRound />} onClick={assignToMe}>
              Assign to me
            </SelectionToolbarAction>
            <SelectionToolbarAction secondary icon={<Archive />} onClick={archive}>
              Archive
            </SelectionToolbarAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SelectionToolbarMore aria-label="More selected task actions" />}
              />
              <DropdownMenuContent side="top" align="end" sideOffset={8} portalProps={portalProps}>
                <DropdownMenuItem onClick={archive}>
                  <Archive size={14} />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SelectionToolbarActions>
          <SelectionToolbarClose
            aria-label="Clear selection"
            title="Clear selection"
            onClick={clear}
          />
        </SelectionToolbar>
      </SelectionToolbarDock>
    </div>
  );
}

export function SelectionToolbarComposition() {
  return (
    <div className="flex size-full items-end justify-center">
      <SelectionToolbarContent />
    </div>
  );
}
