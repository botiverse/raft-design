import type { Announcements, ScreenReaderInstructions, UniqueIdentifier } from "@dnd-kit/core";

/** A place in words: the list or area's name, and the item's position in it when it has one. */
export type DragPlace = {
  /** The list or area, as people see it: "Pinned", "In Review", "the right column". */
  place: string;
  /** 1-based. */
  position?: number;
  count?: number;
};

export type DragNamed = { name: string };

/**
 * What a screen reader hears during a drag, by name and never by id
 * (design/patterns/drag-and-drop.md#screen-readers). The defaults are English;
 * pass your translations, built from the same details.
 */
export type DragMessages = {
  /** Read with every draggable item. */
  instructions: string;
  pickedUp: (details: DragNamed & Partial<DragPlace>) => string;
  over: (details: DragNamed & DragPlace) => string;
  /** The hand is over no place: a drop now puts the item back. */
  notOver: (details: DragNamed) => string;
  refused: (details: DragNamed & { place: string; reason: string }) => string;
  dropped: (details: DragNamed & DragPlace) => string;
  cancelled: (details: DragNamed & Partial<DragPlace>) => string;
};

function at({ place, position, count }: Partial<DragPlace>) {
  if (place == null) return "";
  if (position == null) return place;
  return count == null
    ? `${place}, position ${position}`
    : `${place}, position ${position} of ${count}`;
}

export const DEFAULT_DRAG_MESSAGES: DragMessages = {
  instructions:
    "To pick up an item, press Space. Use the arrow keys to move it, Space to drop it, Escape to cancel.",
  pickedUp: ({ name, ...place }) =>
    place.place == null ? `Picked up ${name}.` : `Picked up ${name}. Over ${at(place)}.`,
  over: ({ name: _name, ...place }) => `Over ${at(place)}.`,
  notOver: () => "Not over a place. Dropping now cancels.",
  refused: ({ name, place, reason }) => `${name} can't go to ${place}. ${reason}`,
  dropped: ({ name, ...place }) => `Dropped ${name} in ${at(place)}.`,
  cancelled: ({ name, ...place }) =>
    place.place == null
      ? `Cancelled. ${name} is back.`
      : `Cancelled. ${name} is back in ${at(place)}.`,
};

/** Merges your messages over the English defaults. */
export function dragMessages(messages?: Partial<DragMessages>): DragMessages {
  return messages ? { ...DEFAULT_DRAG_MESSAGES, ...messages } : DEFAULT_DRAG_MESSAGES;
}

export type DragAnnouncementSource = {
  /** The dragged item's name as people see it: "#launch-week", "Task #25", "Wug". Never an id. */
  name: (activeId: UniqueIdentifier) => string;
  /**
   * Where the item would land with the hand over `overId`, or where it is
   * when `overId` is null (on pick-up and after a cancel). Return null for
   * "nowhere".
   */
  place?: (activeId: UniqueIdentifier, overId: UniqueIdentifier | null) => DragPlace | null;
  /** Why `overId` won't take the item, or null when it will. */
  refusal?: (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier,
  ) => { place: string; reason: string } | null;
};

/**
 * dnd-kit `announcements` that speak by name, from your names and places,
 * in your language. Pass them with `dragInstructions` as a `DndContext`'s
 * `accessibility`, or to `TaskDndProvider`'s.
 */
export function createDragAnnouncements(
  source: DragAnnouncementSource,
  messages?: Partial<DragMessages>,
): Announcements {
  const say = dragMessages(messages);
  const describeOver = (activeId: UniqueIdentifier, overId: UniqueIdentifier | null) => {
    const name = source.name(activeId);
    if (overId == null) return say.notOver({ name });
    const refused = source.refusal?.(activeId, overId);
    if (refused) return say.refused({ name, ...refused });
    const place = source.place?.(activeId, overId);
    return place ? say.over({ name, ...place }) : say.notOver({ name });
  };
  return {
    onDragStart: ({ active }) =>
      say.pickedUp({ name: source.name(active.id), ...source.place?.(active.id, null) }),
    onDragOver: ({ active, over }) => describeOver(active.id, over?.id ?? null),
    onDragMove: () => undefined,
    onDragEnd: ({ active, over }) => {
      const name = source.name(active.id);
      const refused = over == null ? null : source.refusal?.(active.id, over.id);
      const place = over == null || refused ? null : source.place?.(active.id, over.id);
      if (place) return say.dropped({ name, ...place });
      return say.cancelled({ name, ...source.place?.(active.id, null) });
    },
    onDragCancel: ({ active }) =>
      say.cancelled({ name: source.name(active.id), ...source.place?.(active.id, null) }),
  };
}

/** dnd-kit `screenReaderInstructions`: Space, not Enter, in your language. */
export function dragInstructions(messages?: Partial<DragMessages>): ScreenReaderInstructions {
  return { draggable: dragMessages(messages).instructions };
}
