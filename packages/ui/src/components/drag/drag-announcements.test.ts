import { expect, test } from "vite-plus/test";
import { createDragAnnouncements, dragInstructions } from "./drag-announcements";
import type { DragMessages } from "./drag-announcements";

// Announcements say names, never ids, and take your translations
// (design/patterns/drag-and-drop.md#screen-readers).

const NAMES: Record<string, string> = { c1: "#launch-week", s1: "Pinned", s2: "Channels" };
const active = (id: string) => ({
  id,
  data: { current: undefined },
  rect: { current: { initial: null, translated: null } },
});
const over = (id: string) => ({
  id,
  rect: { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 },
  data: { current: undefined },
  disabled: false,
});

const announcements = createDragAnnouncements({
  name: (id) => NAMES[String(id)]!,
  place: (_id, overId) =>
    overId == null
      ? { place: "Pinned", position: 1, count: 3 }
      : { place: NAMES[String(overId)]!, position: 2, count: 5 },
  refusal: (_id, overId) =>
    overId === "s2" ? { place: "Channels", reason: "Channels is read-only." } : null,
});

test("every step is said by name, with the place and position", () => {
  const start = announcements.onDragStart({ active: active("c1") } as never);
  const move = announcements.onDragOver({ active: active("c1"), over: over("s1") } as never);
  const end = announcements.onDragEnd({ active: active("c1"), over: over("s1") } as never);
  const cancel = announcements.onDragCancel({ active: active("c1"), over: null } as never);
  expect([start, move, end, cancel]).toEqual([
    "Picked up #launch-week. Over Pinned, position 1 of 3.",
    "Over Pinned, position 2 of 5.",
    "Dropped #launch-week in Pinned, position 2 of 5.",
    "Cancelled. #launch-week is back in Pinned, position 1 of 3.",
  ]);
  for (const line of [start, move, end, cancel]) expect(line).not.toMatch(/\b(c1|s1|s2)\b/);
});

test("a refused place says why, and a drop there puts the item back", () => {
  expect(announcements.onDragOver({ active: active("c1"), over: over("s2") } as never)).toBe(
    "#launch-week can't go to Channels. Channels is read-only.",
  );
  expect(announcements.onDragEnd({ active: active("c1"), over: over("s2") } as never)).toBe(
    "Cancelled. #launch-week is back in Pinned, position 1 of 3.",
  );
  expect(announcements.onDragOver({ active: active("c1"), over: null } as never)).toBe(
    "Not over a place. Dropping now cancels.",
  );
});

test("your messages replace the English ones, built from the same details", () => {
  const messages: Partial<DragMessages> = {
    instructions: "Appuyez sur Espace pour prendre un élément.",
    pickedUp: ({ name, place }) => `${name} pris, dans ${place}.`,
  };
  const localized = createDragAnnouncements(
    { name: () => "#launch-week", place: () => ({ place: "Épinglés" }) },
    messages,
  );
  expect(localized.onDragStart({ active: active("c1") } as never)).toBe(
    "#launch-week pris, dans Épinglés.",
  );
  expect(dragInstructions(messages).draggable).toBe("Appuyez sur Espace pour prendre un élément.");
  expect(dragInstructions().draggable).toContain("press Space");
  expect(dragInstructions().draggable).not.toContain("Enter");
});
