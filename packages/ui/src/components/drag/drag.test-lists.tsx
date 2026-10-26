import { useState } from "react";
import type { CSSProperties } from "react";
import {
  closestCenter,
  DndContext,
  MeasuringStrategy,
  pointerWithin,
  useDroppable,
} from "@dnd-kit/core";
import type { CollisionDetection } from "@dnd-kit/core";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DragLift } from "./drag-lift";
import {
  DragLiveRegion,
  DragSlot,
  dragListStrategy,
  useDragAnnouncer,
  useDragLists,
} from "./drag-lists";
import type { DragListsItems } from "./drag-lists";
import { DragRemeasure, useDragSensors } from "./drag-sensors";
import { DragRefusalHint } from "./drop-placeholder";

export type TestList = "pinned" | "channels";
const LISTS = ["pinned", "channels"] as const;
const LIST_NAME: Record<TestList, string> = { pinned: "Pinned", channels: "Channels" };
const MEASURING = { droppable: { strategy: MeasuringStrategy.Always } };
const ROW: CSSProperties = { height: 32, display: "flex", alignItems: "center", paddingLeft: 8 };

/** Rows win over the list they sit in; by keyboard (no pointer), the closest row. */
const collision: CollisionDetection = (args) => {
  const hits = pointerWithin(args);
  if (hits.length > 0) {
    const row = hits.find((hit) => !LISTS.includes(hit.id as TestList));
    return row ? [row] : [hits[0]!];
  }
  return closestCenter(args);
};

/**
 * Two lists of channels, as a sidebar's Pinned and Channels sections, on
 * `useDragLists`: the item stands at its landing spot while dragged, a list
 * may refuse it, and every step is announced by name.
 */
export function TestLists({
  initial,
  onChange,
  refuse,
}: {
  initial: DragListsItems<TestList>;
  onChange?: (items: DragListsItems<TestList>) => void;
  refuse?: (from: TestList, to: TestList) => string | null;
}) {
  const [items, setItems] = useState(initial);
  const { message, announce } = useDragAnnouncer();
  const lists = useDragLists({
    lists: LISTS,
    items,
    onItemsChange: (next) => {
      setItems(next);
      onChange?.(next);
    },
    listName: (list) => LIST_NAME[list],
    itemName: (id) => `#${id}`,
    refuse,
    collisionDetection: collision,
    announce,
  });
  const sensors = useDragSensors({ coordinateGetter: lists.coordinateGetter });

  return (
    <div style={{ width: 240, padding: 16 }}>
      <DndContext
        sensors={sensors}
        collisionDetection={lists.collisionDetection}
        measuring={MEASURING}
        autoScroll={false}
        accessibility={lists.accessibility}
        {...lists.handlers}
      >
        <DragRemeasure version={items} />
        {LISTS.map((list) => (
          <TestListSection key={list} list={list} ids={items[list]} isHome={lists.isHome} />
        ))}
        <DragLift>{lists.activeId ? <div style={ROW}>#{lists.activeId}</div> : null}</DragLift>
        {lists.refusal ? <DragRefusalHint>{lists.refusal.reason}</DragRefusalHint> : null}
      </DndContext>
      <DragLiveRegion message={message} />
      <output data-testid="announcement">{message}</output>
    </div>
  );
}

function TestListSection({
  list,
  ids,
  isHome,
}: {
  list: TestList;
  ids: readonly string[];
  isHome: (id: string, index: number) => boolean;
}) {
  const { setNodeRef } = useDroppable({ id: list });
  return (
    <section aria-label={LIST_NAME[list]} style={{ marginBottom: 16 }}>
      <h3 style={{ margin: 0, height: 24 }}>{LIST_NAME[list]}</h3>
      <SortableContext id={list} items={ids as string[]} strategy={dragListStrategy}>
        <div ref={setNodeRef} data-testid={`list-${list}`} style={{ minHeight: 32 }}>
          {ids.map((id) => (
            <TestRow key={id} id={id} isHome={isHome} />
          ))}
        </div>
      </SortableContext>
    </section>
  );
}

function TestRow({ id, isHome }: { id: string; isHome: (id: string, index: number) => boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, index, overIndex } =
    useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }}>
      <DragSlot dragging={isDragging} home={isHome(id, overIndex >= 0 ? overIndex : index)}>
        <div {...attributes} {...listeners} data-testid={`row-${id}`} style={ROW}>
          #{id}
        </div>
      </DragSlot>
    </div>
  );
}
