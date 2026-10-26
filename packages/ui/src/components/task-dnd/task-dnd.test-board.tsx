import { useCallback, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  TaskDndProvider,
  TaskDragOverlay,
  TaskDraggable,
  TaskDropPlaceholder,
  TaskDropZone,
} from "./task-dnd";
import type { TaskDndAccessibility, TaskMoveDetails } from "./task-dnd";
import { TaskCard } from "../task-card/task-card";

export type TestStatus = "todo" | "done";
export type TestCard = { id: string; status: TestStatus };

const STATUSES: readonly TestStatus[] = ["todo", "done"];
const COLUMN_DATA: Record<TestStatus, { status: TestStatus }> = {
  todo: { status: "todo" },
  done: { status: "done" },
};
const COLUMN_LEFT: Record<TestStatus, number> = { todo: 0, done: 300 };
const BOARD_STYLE: CSSProperties = { display: "flex", gap: 24, padding: 16 };
const COLUMN_STYLE: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  width: 240,
  minHeight: 400,
};
const CARD_STYLE: CSSProperties = { height: 80, border: "1px solid" };
const OVERLAY_CARD_STYLE: CSSProperties = { height: 80 };

/**
 * The TaskBoard shape: each column is a drop zone that takes drops only while
 * empty, each card is draggable and a drop target, a card leaves its column
 * while dragged and its copy in TaskDragOverlay is what moves. With
 * `keepActive` the dragged card stays in its column (at 40%, under the
 * overlay), as the docs' board does.
 *
 * jsdom has no layout, so each node also declares its rect in `data-rect`
 * ("left top width height") for the jsdom test to read, and leaves the overlay
 * out (`overlay={false}`), whose node it can't give a rect; real layout comes
 * from the inline styles.
 */
export function TestBoard({
  initial,
  onMove,
  accessibility,
  overlay = true,
  keepActive = false,
}: {
  initial: readonly TestCard[];
  onMove: (details: TaskMoveDetails) => void;
  accessibility?: TaskDndAccessibility;
  overlay?: boolean;
  keepActive?: boolean;
}) {
  const [cards, setCards] = useState(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const handleDragStart = useCallback(({ active }: { active: { id: string | number } }) => {
    setActiveId(String(active.id));
  }, []);
  const clearActive = useCallback(() => setActiveId(null), []);
  const handleMove = useCallback(
    (details: TaskMoveDetails) => {
      onMove(details);
      const status = details.overData?.status as TestStatus;
      setCards((current) =>
        current.map((card) => (card.id === details.activeId ? { ...card, status } : card)),
      );
    },
    [onMove],
  );

  return (
    <TaskDndProvider
      accessibility={accessibility}
      onDragStart={handleDragStart}
      onDragEnd={clearActive}
      onDragCancel={clearActive}
      onMove={handleMove}
    >
      <div style={BOARD_STYLE}>
        {STATUSES.map((status) => {
          const visible = cards.filter(
            (card) => card.status === status && (keepActive || card.id !== activeId),
          );
          return (
            <TaskDropZone
              key={status}
              id={`column:${status}`}
              data={COLUMN_DATA[status]}
              disabled={visible.length > 0}
              data-testid={`column-${status}`}
              data-rect={`${COLUMN_LEFT[status]} 0 200 600`}
              style={COLUMN_STYLE}
            >
              {visible.length === 0 ? <TaskDropPlaceholder id={`column:${status}`} /> : null}
              {visible.map((card, index) => (
                <TestBoardCard key={card.id} card={card} index={index} />
              ))}
            </TaskDropZone>
          );
        })}
      </div>
      {overlay ? (
        <TaskDragOverlay>
          {activeId == null ? null : <div style={OVERLAY_CARD_STYLE}>Card {activeId}</div>}
        </TaskDragOverlay>
      ) : null}
    </TaskDndProvider>
  );
}

function TestBoardCard({ card, index }: { card: TestCard; index: number }) {
  const dropData = useMemo(() => ({ status: card.status, taskId: card.id }), [card]);

  return (
    <TaskDraggable
      id={card.id}
      dropId={`card:${card.id}`}
      dropData={dropData}
      data-rect={`${COLUMN_LEFT[card.status] + 10} ${10 + index * 110} 180 100`}
      style={CARD_STYLE}
    >
      Card {card.id}
      <TaskCard aria-hidden />
    </TaskDraggable>
  );
}
