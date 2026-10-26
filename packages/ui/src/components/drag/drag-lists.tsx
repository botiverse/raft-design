"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type {
  Announcements,
  CollisionDetection,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  KeyboardCoordinateGetter,
  ScreenReaderInstructions,
  UniqueIdentifier,
} from "@dnd-kit/core";
import { arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { SortingStrategy } from "@dnd-kit/sortable";
import { dragInstructions, dragMessages } from "./drag-announcements";
import type { DragMessages, DragPlace } from "./drag-announcements";
import { useDragAcrossLists } from "./drag-sensors";
import { DropPlaceholder } from "./drop-placeholder";
import { cn } from "../../lib/cn";

export type DragListsItems<L extends string> = Record<L, readonly string[]>;

export type UseDragListsOptions<L extends string> = {
  /** The lists, in the order they are on screen (by keyboard, entering a list from above lands first, from below last). */
  lists: readonly L[];
  /** Each list's items, by id. */
  items: DragListsItems<L>;
  /** Called with the lists as they should now render: while dragging (the item standing at its landing spot), on a drop and on a cancel. */
  onItemsChange: (items: DragListsItems<L>) => void;
  /** A list's name as people see it ("Pinned"). */
  listName: (list: L) => string;
  /** An item's name as people see it ("#launch-week"); never its id. */
  itemName: (id: string) => string;
  /** Why `to` won't take an item from `from`, or null when it will. */
  refuse?: (from: L, to: L, id: string) => string | null;
  /** The surface's collision detection; it is held still for a moment right after the item changes list. */
  collisionDetection: CollisionDetection;
  /** Says each step in a polite live region (`useDragAnnouncer`). */
  announce: (message: string) => void;
  /** Your translations of the announcements. */
  messages?: Partial<DragMessages>;
};

const SILENT: Announcements = {
  onDragStart: () => undefined,
  onDragMove: () => undefined,
  onDragOver: () => undefined,
  onDragEnd: () => undefined,
  onDragCancel: () => undefined,
};

/** dnd-kit's vertical strategy, except that nothing moves while the hand is outside the list. */
export const dragListStrategy: SortingStrategy = (args) =>
  args.overIndex < 0 ? null : verticalListSortingStrategy(args);

/**
 * Items in one or more lists that can be reordered and moved between lists
 * (a sidebar's sections, a board's columns): the lists half of the drag
 * model (design/patterns/drag-and-drop.md#where-it-will-land). While dragging,
 * the item stands at its landing spot (its own slot is the place; siblings
 * slide apart), a list can refuse it, and every step is announced by name.
 * The keyboard is measured from the item's real place, so the arrows never
 * skip one after a move into another list.
 *
 * Spread `handlers`, `collisionDetection` and `accessibility` on the
 * `DndContext`, pass `coordinateGetter` to `useDragSensors`, and render
 * `DragRemeasure version={items}` inside it.
 */
export function useDragLists<L extends string>({
  lists,
  items,
  onItemsChange,
  listName,
  itemName,
  refuse,
  collisionDetection,
  announce,
  messages,
}: UseDragListsOptions<L>) {
  const say = useMemo(() => dragMessages(messages), [messages]);
  const across = useDragAcrossLists(collisionDetection);
  const itemsRef = useRef(items);
  useLayoutEffect(() => {
    itemsRef.current = items;
  }, [items]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [originList, setOriginList] = useState<L | null>(null);
  const [refusal, setRefusalState] = useState<{ list: L; reason: string } | null>(null);
  const refusalRef = useRef(refusal);
  const setRefusal = (next: typeof refusal) => {
    refusalRef.current = next;
    setRefusalState(next);
  };
  const origin = useRef<{
    list: L;
    index: number;
    snapshot: DragListsItems<L>;
    keyboard: boolean;
  } | null>(null);
  // The row the item was put next to on entering a list: a drop on it moves nothing more.
  const inserted = useRef<UniqueIdentifier | null>(null);

  const listOf = useCallback(
    (state: DragListsItems<L>, id: UniqueIdentifier): L | null =>
      lists.includes(id as L)
        ? (id as L)
        : (lists.find((list) => state[list].includes(String(id))) ?? null),
    [lists],
  );
  const isList = (id: UniqueIdentifier): id is L => lists.includes(id as L);
  const where = (state: DragListsItems<L>, id: string): DragPlace => {
    const list = listOf(state, id)!;
    return {
      place: listName(list),
      position: state[list].indexOf(id) + 1,
      count: state[list].length,
    };
  };
  const update = (next: DragListsItems<L>) => {
    itemsRef.current = next;
    onItemsChange(next);
  };

  /** Still home: in its own list, at its own index (pass the sortable's projected index). */
  const isHome = useCallback(
    (id: string, index: number) => {
      const start = origin.current;
      return start != null && listOf(itemsRef.current, id) === start.list && index === start.index;
    },
    [listOf],
  );

  const onDragStart = ({ active, activatorEvent }: DragStartEvent) => {
    const id = String(active.id);
    const list = listOf(items, id);
    if (!list) return;
    origin.current = {
      list,
      index: items[list].indexOf(id),
      snapshot: items,
      keyboard: typeof KeyboardEvent !== "undefined" && activatorEvent instanceof KeyboardEvent,
    };
    inserted.current = null;
    setActiveId(id);
    setOriginList(list);
    announce(say.pickedUp({ name: itemName(id), ...where(items, id) }));
  };

  const onDragOver = ({ active, over }: DragOverEvent) => {
    const start = origin.current;
    if (!start) return;
    const id = String(active.id);
    if (!over) {
      announce(say.notOver({ name: itemName(id) }));
      return;
    }
    const current = itemsRef.current;
    const from = listOf(current, id);
    const to = listOf(current, over.id);
    if (!from || !to) return;
    const reason = refuse?.(start.list, to, id) ?? null;
    if (reason) {
      // A refused place: no placeholder anywhere; the item is home until the hand leaves.
      setRefusal({ list: to, reason });
      update(start.snapshot);
      inserted.current = null;
      announce(say.refused({ name: itemName(id), place: listName(to), reason }));
      return;
    }
    if (refusalRef.current) setRefusal(null);
    if (from !== to) {
      const fromList = current[from].filter((item) => item !== id);
      const toList = [...current[to]];
      let at = toList.indexOf(String(over.id));
      if (at < 0) at = toList.length;
      else if (start.keyboard) {
        if (lists.indexOf(from) > lists.indexOf(to)) at += 1;
      } else {
        const rect = active.rect.current.translated;
        if (rect && rect.top + rect.height / 2 > over.rect.top + over.rect.height / 2) at += 1;
      }
      toList.splice(at, 0, id);
      const next = { ...current, [from]: fromList, [to]: toList } as DragListsItems<L>;
      across.moved(start.keyboard);
      update(next);
      inserted.current = isList(over.id) ? null : over.id;
      announce(say.over({ name: itemName(id), ...where(next, id) }));
      return;
    }
    if (over.id === id) {
      inserted.current = null;
      return;
    }
    const list = current[to];
    if (inserted.current === over.id) {
      announce(say.over({ name: itemName(id), ...where(current, id) }));
      return;
    }
    inserted.current = null;
    const overIndex = isList(over.id) ? list.length - 1 : list.indexOf(String(over.id));
    announce(
      say.over({
        name: itemName(id),
        place: listName(to),
        position: overIndex + 1,
        count: list.length,
      }),
    );
  };

  const finish = (dropped: boolean, overId: UniqueIdentifier | null) => {
    const start = origin.current;
    const id = activeId;
    const refused = refusalRef.current;
    origin.current = null;
    across.reset();
    setActiveId(null);
    setOriginList(null);
    setRefusal(null);
    if (!start || !id) return;
    if (!dropped || overId == null || refused) {
      // Cancel, a drop on nothing, or on a refused place: everything returns, and the copy glides home.
      update(start.snapshot);
      const back = say.cancelled({ name: itemName(id), ...where(start.snapshot, id) });
      announce(refused && dropped ? `${refused.reason}. ${back}` : back);
      return;
    }
    const current = itemsRef.current;
    const list = listOf(current, id)!;
    const ids = current[list];
    const fromIndex = ids.indexOf(id);
    const toIndex =
      inserted.current === overId
        ? fromIndex
        : isList(overId)
          ? ids.length - 1
          : ids.indexOf(String(overId));
    const next =
      toIndex >= 0 && toIndex !== fromIndex
        ? ({ ...current, [list]: arrayMove([...ids], fromIndex, toIndex) } as DragListsItems<L>)
        : current;
    update(next);
    announce(say.dropped({ name: itemName(id), ...where(next, id) }));
  };

  const accessibility = useMemo<{
    announcements: Announcements;
    screenReaderInstructions: ScreenReaderInstructions;
  }>(
    () => ({ announcements: SILENT, screenReaderInstructions: dragInstructions(messages) }),
    [messages],
  );

  return {
    /** The dragged item's id, or null. */
    activeId,
    /** The list that refuses the item under the hand, and why. */
    refusal,
    /** The list the drag started in, while dragging. */
    originList,
    isHome,
    listOf,
    collisionDetection: across.collisionDetection,
    coordinateGetter: across.coordinateGetter as KeyboardCoordinateGetter,
    accessibility,
    handlers: {
      onDragStart,
      onDragOver,
      onDragEnd: ({ over }: DragEndEvent) => finish(true, over?.id ?? null),
      onDragCancel: () => finish(false, null),
    },
  };
}

export type DraggedSlotProps = {
  /**
   * This item is the one being dragged. Render the slot around every item
   * and pass `isDragging`, so the dragged one keeps its node (and focus).
   * @default true
   */
  dragging?: boolean;
  /** The dragged item still stands at its own place. */
  home: boolean;
  /** The item's radius class, for the place: `rounded-control` by default. */
  radius?: string;
  /** Classes for the place, after `radius`. */
  className?: string;
  children: ReactNode;
};

/**
 * Wraps each item's content in a list. The dragged item's own node is at 40%
 * while it is still home, and the dashed place (its size, its radius) once it
 * stands anywhere else. Every other item renders as it is: the wrapper stays
 * the same, so the item keeps focus when its drag starts.
 */
export function DraggedSlot({
  dragging = true,
  home,
  radius,
  className,
  children,
}: DraggedSlotProps) {
  const place = dragging && !home;
  return (
    <div data-slot="drag-slot" className="relative">
      <div
        data-drag-origin={dragging && home ? "" : undefined}
        className={place ? "invisible" : undefined}
      >
        {children}
      </div>
      {place ? <DropPlaceholder className={cn("absolute inset-0", radius, className)} /> : null}
    </div>
  );
}

/** The last announcement, for a polite live region (`DragLiveRegion`). Repeats are dropped. */
export function useDragAnnouncer() {
  const [message, setMessage] = useState("");
  const last = useRef("");
  const announce = useCallback((text: string) => {
    if (text === last.current) return;
    last.current = text;
    setMessage(text);
  }, []);
  return { message, announce };
}

/** A polite, visually hidden live region for drag announcements. */
export function DragLiveRegion({ message }: { message: string }) {
  return (
    <span className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {message}
    </span>
  );
}
