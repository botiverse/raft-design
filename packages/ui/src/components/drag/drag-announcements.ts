import type { Announcements, ScreenReaderInstructions, UniqueIdentifier } from "@dnd-kit/core";

/** A place in words: the list or area's name, and the item's position in it when it has one. */
export type DragPlace = {
  /**
   * The list or area, as people see it: "Pinned", "In Review", "the right
   * column". Empty when it has no name (an unlabelled tab row): then only the
   * position is said.
   */
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
  /** A drop on a refused place: why, then the item back home (`place` is its home). */
  refusedDrop: (details: DragNamed & Partial<DragPlace> & { reason: string }) => string;
};

function at({ place, position, count }: Partial<DragPlace>) {
  const where =
    position == null
      ? ""
      : count == null
        ? `position ${position}`
        : `position ${position} of ${count}`;
  if (!place) return where;
  return where ? `${place}, ${where}` : place;
}

function sentence(text: string) {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

export const DEFAULT_DRAG_MESSAGES: DragMessages = {
  instructions:
    "To pick up an item, press Space. Use the arrow keys to move it, Space to drop it, Escape to cancel.",
  pickedUp: ({ name, ...place }) =>
    at(place) ? `Picked up ${name}. Over ${at(place)}.` : `Picked up ${name}.`,
  over: ({ name: _name, ...place }) => `Over ${at(place)}.`,
  notOver: () => "Not over a place. Dropping now cancels.",
  refused: ({ name, place, reason }) => `${name} can't go to ${place}. ${reason}`,
  dropped: ({ name, ...place }) => `Dropped ${name} in ${at(place)}.`,
  cancelled: ({ name, ...place }) =>
    at(place) ? `Cancelled. ${name} is back in ${at(place)}.` : `Cancelled. ${name} is back.`,
  refusedDrop: ({ reason, ...rest }) =>
    `${sentence(reason)} ${DEFAULT_DRAG_MESSAGES.cancelled(rest)}`,
};

/** Merges your messages over the English defaults. */
export function dragMessages(messages?: Partial<DragMessages>): DragMessages {
  return messages ? { ...DEFAULT_DRAG_MESSAGES, ...messages } : DEFAULT_DRAG_MESSAGES;
}

export type DragAnnouncementSource = {
  /**
   * The dragged item's name as people see it: "#launch-week", "Task #25",
   * "Wug". Never an id: return an empty string when there is no name, and
   * the drag is not announced.
   */
  name: (activeId: UniqueIdentifier) => string;
  /**
   * Where the item would land with the hand over `overId`, or where it is
   * when `overId` is null (on pick-up and after a cancel). Return null for
   * "nowhere". Without it, a move over a place and a drop on one are not
   * announced (pick-up, refusals and cancels still are).
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
  // The place last said. The first "over" comes in the same frame as the
  // pick-up, at the same place: saying it again would replace the pick-up.
  let lastPlace: string | null = null;
  const placeKey = (place: DragPlace | null | undefined) => (place ? JSON.stringify(place) : null);
  const describeOver = (
    name: string,
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier | null,
  ) => {
    if (overId == null) {
      lastPlace = null;
      return say.notOver({ name });
    }
    const refused = source.refusal?.(activeId, overId);
    if (refused) {
      lastPlace = null;
      return say.refused({ name, ...refused });
    }
    if (!source.place) return undefined;
    const place = source.place(activeId, overId);
    if (!place) {
      lastPlace = null;
      return say.notOver({ name });
    }
    const key = placeKey(place);
    if (key === lastPlace) return undefined;
    lastPlace = key;
    return say.over({ name, ...place });
  };
  // No name, nothing said: never the id in its place.
  const named =
    <Event extends { active: { id: UniqueIdentifier } }>(
      speak: (name: string, event: Event) => string | undefined,
    ) =>
    (event: Event) => {
      const name = source.name(event.active.id);
      return name ? speak(name, event) : undefined;
    };
  return {
    onDragStart: named((name, { active }) => {
      const home = source.place?.(active.id, null);
      lastPlace = placeKey(home);
      return say.pickedUp({ name, ...home });
    }),
    onDragOver: named((name, { active, over }) => describeOver(name, active.id, over?.id ?? null)),
    onDragMove: () => undefined,
    onDragEnd: named((name, { active, over }) => {
      const refused = over == null ? null : source.refusal?.(active.id, over.id);
      if (over != null && !refused && !source.place) return undefined;
      const place = over == null || refused ? null : source.place?.(active.id, over.id);
      if (place) return say.dropped({ name, ...place });
      const home = source.place?.(active.id, null);
      return refused
        ? say.refusedDrop({ name, reason: refused.reason, ...home })
        : say.cancelled({ name, ...home });
    }),
    onDragCancel: named((name, { active }) =>
      say.cancelled({ name, ...source.place?.(active.id, null) }),
    ),
  };
}

/** Announcements that say nothing, for a surface that announces on its own or has no names. */
export const SILENT_DRAG_ANNOUNCEMENTS: Announcements = {
  onDragStart: () => undefined,
  onDragMove: () => undefined,
  onDragOver: () => undefined,
  onDragEnd: () => undefined,
  onDragCancel: () => undefined,
};

/** dnd-kit `screenReaderInstructions`: Space, not Enter, in your language. */
export function dragInstructions(messages?: Partial<DragMessages>): ScreenReaderInstructions {
  return { draggable: dragMessages(messages).instructions };
}
