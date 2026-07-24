import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  TaskBoardColumn,
  TaskBoardColumnBadge,
  TaskBoardColumnCount,
  TaskBoardColumnHeading,
  TaskBoardColumnItems,
  TaskBoardColumnPanel,
  TaskBoardColumnTrigger,
  TaskBoardRoot,
} from "raft-ui";

import { TaskCardComposition } from "#/modules/task-card/compositions/task-card.composition.tsx";
import type { TaskFixture } from "#/modules/task-card/task-card.fixtures.ts";

const VIRTUAL_TASK_COUNT = 48;
const ESTIMATED_CARD_SIZE = 116;
const CARD_GAP = 10;

function createVirtualTasks(count: number): TaskFixture[] {
  return Array.from({ length: count }, (_, index) => {
    const taskNumber = 200 + index;
    return {
      id: `virtual-task-${taskNumber}`,
      taskNumber,
      channelName: "proj-uiux",
      title: `Virtualized board card #${taskNumber}`,
      description: "Only viewport rows mount; scroll to recycle off-screen cards.",
      status: "todo" as const,
      creatorId: "me",
      assigneeId: "atlas",
    };
  });
}

/**
 * Consumer-owned virtualization demo for tall board columns.
 * Shows mounted vs total so the overscan window is visible while scrolling.
 */
export function TaskBoardVirtualizationComposition() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const [scrollMargin, setScrollMargin] = useState(0);
  const tasks = useMemo(() => createVirtualTasks(VIRTUAL_TASK_COUNT), []);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const items = itemsRef.current;
    if (!viewport || !items) return;

    const update = () => {
      const next =
        items.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top +
        viewport.scrollTop;
      setScrollMargin((current) => (Math.abs(current - next) < 0.5 ? current : next));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(viewport);
    observer.observe(items);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useVirtualizer({
    count: tasks.length,
    getScrollElement: () => viewportRef.current,
    getItemKey: (index) => tasks[index]!.id,
    estimateSize: () => ESTIMATED_CARD_SIZE,
    gap: CARD_GAP,
    overscan: 6,
    scrollMargin,
  });
  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line-subtle px-4 py-2">
        <p className="text-xs text-foreground-muted">
          Mount a virtual stack when a column can grow past the shared viewport. Only visible rows
          plus overscan stay in the DOM.
        </p>
        <p className="shrink-0 font-mono text-xs tabular-nums text-foreground">
          Mounted {virtualItems.length} / {tasks.length}
        </p>
      </div>
      <ScrollArea className="relative min-h-0 w-full flex-1">
        <ScrollAreaViewport ref={viewportRef} className="p-4">
          <ScrollAreaContent>
            <TaskBoardRoot>
              <TaskBoardColumn defaultOpen>
                <TaskBoardColumnTrigger>
                  <TaskBoardColumnHeading>
                    <TaskBoardColumnBadge status="todo">Todo</TaskBoardColumnBadge>
                    <TaskBoardColumnCount>{tasks.length}</TaskBoardColumnCount>
                  </TaskBoardColumnHeading>
                </TaskBoardColumnTrigger>
                <TaskBoardColumnPanel>
                  <TaskBoardColumnItems>
                    <div
                      ref={itemsRef}
                      className="relative w-full"
                      style={{ height: virtualizer.getTotalSize() }}
                    >
                      {virtualItems.map((row) => {
                        const task = tasks[row.index]!;
                        return (
                          <div
                            key={row.key}
                            ref={virtualizer.measureElement}
                            data-index={row.index}
                            className="absolute inset-x-0 top-0"
                            style={{ transform: `translateY(${row.start - scrollMargin}px)` }}
                          >
                            <TaskCardComposition task={task} readOnly />
                          </div>
                        );
                      })}
                    </div>
                  </TaskBoardColumnItems>
                </TaskBoardColumnPanel>
              </TaskBoardColumn>
            </TaskBoardRoot>
          </ScrollAreaContent>
        </ScrollAreaViewport>
        <ScrollAreaScrollbar>
          <ScrollAreaThumb />
        </ScrollAreaScrollbar>
        <ScrollAreaCorner />
      </ScrollArea>
    </div>
  );
}
