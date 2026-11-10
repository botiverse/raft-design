import { useCallback, useMemo, useState } from "react";
import type { MouseEvent } from "react";
import { Bell, CircleDot, Eye, Trash2, UserRound } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSubmenu,
  DropdownMenuSubmenuTrigger,
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
  SelectionToolbarMoreItems,
} from "@botiverse/raft-ui/wip";

const chosen = (event: MouseEvent<HTMLElement>) => event.currentTarget.dataset.value ?? "";

export function SelectionToolbarContent() {
  const [last, setLast] = useState("");
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const portalProps = useMemo(
    () => (portalContainer ? { container: portalContainer } : undefined),
    [portalContainer],
  );
  const setStatus = useCallback(
    (event: MouseEvent<HTMLElement>) => setLast(`2 tasks moved to ${chosen(event)}, 1 skipped`),
    [],
  );
  const assign = useCallback(
    (event: MouseEvent<HTMLElement>) => setLast(`2 tasks assigned to ${chosen(event)}, 1 skipped`),
    [],
  );
  const nudge = useCallback(() => setLast("Nudged the assignees of 3 tasks"), []);
  const follow = useCallback(() => setLast("Following 3 tasks"), []);
  const remove = useCallback(() => setLast("3 tasks deleted"), []);
  const clear = useCallback(() => setLast("Selection cleared"), []);

  const statusItems = (
    <>
      <DropdownMenuItem data-value="To do" onClick={setStatus}>
        To do
      </DropdownMenuItem>
      <DropdownMenuItem data-value="In progress" onClick={setStatus}>
        In progress
      </DropdownMenuItem>
      <DropdownMenuItem data-value="Done" onClick={setStatus}>
        Done
      </DropdownMenuItem>
    </>
  );
  const assigneeItems = (
    <>
      <DropdownMenuItem data-value="you" onClick={assign}>
        Me
      </DropdownMenuItem>
      <DropdownMenuItem data-value="Noel" onClick={assign}>
        Noel
      </DropdownMenuItem>
      <DropdownMenuItem data-value="Kirby" onClick={assign}>
        Kirby
      </DropdownMenuItem>
    </>
  );

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
                  <SelectionToolbarAction
                    menu
                    icon={<CircleDot />}
                    moreItem={
                      <DropdownMenuSubmenu>
                        <DropdownMenuSubmenuTrigger>
                          <CircleDot size={14} />
                          Status
                        </DropdownMenuSubmenuTrigger>
                        <DropdownMenuContent portalProps={portalProps}>
                          {statusItems}
                        </DropdownMenuContent>
                      </DropdownMenuSubmenu>
                    }
                  >
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
                {statusItems}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SelectionToolbarAction
                    menu
                    icon={<UserRound />}
                    moreItem={
                      <DropdownMenuSubmenu>
                        <DropdownMenuSubmenuTrigger>
                          <UserRound size={14} />
                          Assignee
                        </DropdownMenuSubmenuTrigger>
                        <DropdownMenuContent portalProps={portalProps}>
                          {assigneeItems}
                        </DropdownMenuContent>
                      </DropdownMenuSubmenu>
                    }
                  >
                    Assignee
                  </SelectionToolbarAction>
                }
              />
              <DropdownMenuContent
                side="top"
                align="start"
                sideOffset={8}
                portalProps={portalProps}
              >
                {assigneeItems}
              </DropdownMenuContent>
            </DropdownMenu>
            <SelectionToolbarAction icon={<Bell />} onClick={nudge}>
              Nudge
            </SelectionToolbarAction>
            <SelectionToolbarAction secondary icon={<Eye />} onClick={follow}>
              Follow
            </SelectionToolbarAction>
            <SelectionToolbarAction secondary icon={<Trash2 />} onClick={remove}>
              Delete
            </SelectionToolbarAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SelectionToolbarMore aria-label="More selected task actions" />}
              />
              <DropdownMenuContent side="top" align="end" sideOffset={8} portalProps={portalProps}>
                <SelectionToolbarMoreItems />
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
