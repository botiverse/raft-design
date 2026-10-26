---
title: Drag and drop
summary: The one way everything in Raft is dragged — how a drag starts, what follows the hand, where the item will land, what a refused place shows, how a drop and a cancel move, and the keyboard and screen-reader path.
---

# Drag and drop

Everything people can drag in Raft (sidebar rows and sections, tabs, servers, task cards, composer attachments, side sections, an agent onto a computer) is dragged the same way. The item is picked up the same way, a lifted copy of it follows the hand, the item it came from stays behind at 40%, one dashed place shows where it will land, a place that won't take it says why, and a drop or a cancel settles in 160ms. Learning one drag is learning all of them, and none of them needs a mouse.

raft-ui carries the model: `useDragSensors`, `DragLift`, `DropPlaceholder`, `DragRefusalHint` and the announcement helpers ([Drag](../../packages/ui/src/components/drag/drag.md)), from `@botiverse/raft-ui/wip` until their API settles. `TaskDnd`, `SortableTabsList` and `SortableComposerAttachments` are built on them.

## When it applies

Any item a person moves by dragging: reordering a list, moving an item to another list or column, dropping it into a container, or moving a section of a layout. Resizing a column by its seam is not a drag of an item; it follows [Resizable](../../packages/ui/src/components/resizable/resizable.md), with one rule from here: Escape puts the starting width back. Files dragged in from outside the browser follow the [Composer](../../packages/ui/src/components/composer/composer.md)'s drop overlay.

Dragging is never the only way to do something. Each drag has a keyboard path (below) and, where the action matters, a control that does the same: a task's status chip, a Move button ([Accessibility](../foundations/accessibility.md#focus-and-keyboard)).

## Structure

Two lists, as a sidebar's Pinned and Channels sections. Drag a channel within a section or into the other one, by pointer, by touch or with the keyboard (Tab to a row, Space, the arrow keys, Space):

```example
drag/compositions/lists
```

A board, where a column can refuse a card (Closed refuses every card here):

```example
task-dnd/compositions/task-dnd
```

## Starting a drag

- With a mouse or a pen, start the drag once the pointer has moved 6px with the button down. A click never moves anything, and 6px is the same on every surface.
- On a touch screen, start it on the first 10px move after the finger has held still for 500ms. Moving earlier scrolls, and holding still without moving opens the item's menu ([Dragging on a touch screen](../foundations/states.md#dragging-on-a-touch-screen)).
- With the keyboard, Space picks the focused item up. Enter never starts a drag: on an item that also opens (a sidebar row, a card), Enter opens it.
- Use `useDragSensors()` for all three, so no surface picks its own numbers.

## The handle

- Make the whole item the handle for small items: rows, tabs, chips, avatars, cards. A grip on a row is one more thing to aim at, and the row is already the target.
- Make only the grip the handle for a panel of live content, such as a side section. Its head already does things when clicked (a thread head, a jump to the channel), so a drag from anywhere on it would fight those clicks. Show the grip bar on the head while it is hovered or the grip has keyboard focus (always, on a device that can't hover, where there is no hover to reveal it), and make its hit area larger than the bar: at least 24px tall, wider than the bar on both sides, so it doesn't need careful aim. The rest of the head keeps its clicks and doesn't show `grab`. The grip is also the keyboard's way in (Space on the grip).
- Show `grab` over a handle, `grabbing` everywhere while something is lifted, and `not-allowed` over a place that refuses it. `DragLift` and `DragRefusalHint` set the last two for the whole page, whatever is under the pointer.

## What follows the hand

- Move a lifted copy, never the item itself. It tracks the pointer 1:1 from the point it was grabbed, every frame. Never clamp it to its container or hold it to one axis: the hand can go anywhere, and the copy goes with it.
- For a small item, the copy is the item. For a large one (a panel, a section), the copy is a compact proxy: the head's icon and title, at most 240px wide, held so the hand stays on it.
- Give the copy the lift look: an opaque `layer-popover` surface, `shadow-float` and a `line-seam` ring, with no scale and no tilt ([Elevation](../foundations/elevation.md)). The ring separates the copy from what is under it in dark mode, where a shadow barely shows. The same ring is on the HUD chip of a refused place.
- In a keyboard drag, set the copy 6px down and right of the place it stands on, so the dashed outline under it stays visible.
- Keep the copy above everything, popovers, dialogs and toasts included, and render it where no ancestor's transform can move it (`document.body` from a drawer or a dialog): it is the one thing under the hand, and it must stay there.

## Where it came from

- Leave the item in its place, at 40% (`data-drag-origin`), until something else takes its place. One value everywhere, so the faded item always reads as "where this was".

## Where it will land

One placeholder for every place: a 1.5px dashed `line-strong` outline on `fill-subtle`, with the item's radius and the item's size (`DropPlaceholder`).

- **In lists and boards**, open the place at the landing spot: the siblings slide apart (160ms, `motion-drag-settle-*`) and the item's own spot closes once it stands somewhere else. The item's own slot is the place (`DraggedSlot`), so the place is always exactly the item's size.
- **In layouts** (panels, columns), move nothing while dragging: draw the place over the area the section will take, and reflow on the drop. Over live content the place is opaque (`DropPlaceholder opaque`: `layer-canvas` under the `fill-subtle` wash), so the content under it never shows through. A new column is a full-height dashed strip at the edge where the column will appear.
- **A section alone in its column** is not offered the edges next to its own column: moving it there would leave the layout as it is.
- **A container you drop into** (another sidebar section, a computer's row) takes `fill-subtle` (`data-drag-into`) while the item is in it, with the place at the insertion point.

## Refused places

- Show no placeholder over a place that won't take the item, set the `not-allowed` cursor, and say why in a HUD chip by the pointer (by the copy, in a keyboard drag): "Cannot move to Closed", "The window is too narrow for another column". `DragRefusalHint` does all three.
- Keep the chip in the window and clear of the copy. It sits right of and below the pointer; where the window's right edge would cut it, it goes left of the pointer and of the copy (a compact proxy held near its end reaches left of the pointer); where the bottom edge would, above the pointer. It never sits under the copy, which is drawn over it, and always stays at least 8px inside the window. `DragRefusalHint` places it so.
- Say the reason in the announcement too: the chip is not read out.
- A drop on a refused place is a cancel: the copy glides home and nothing moves.

## Drop and cancel

- On a drop, glide the copy into the place in 160ms with `motion-drag-settle-easing` (ease-out), then show the item there. In a layout, the reflow animates over the same 160ms, in step with the glide ([Motion](../foundations/motion.md#usage)).
- Cancel on Escape, a `pointercancel` (the system took the touch), the window losing focus and the tab going hidden: the copy glides back to the item, and everything that moved returns. `DragLift` covers the ones dnd-kit leaves open, without a synthetic Escape: a cancel must never close the dialog or panel the drag happens in.
- Escape during a drag belongs to the drag, however it started (pointer, touch or keyboard): it puts the item back and reaches nothing else. `useDragSensors` takes it in the capture phase on the window and stops it, so no app handler that closes a panel, a dialog or a popover on Escape hears it. Once the drag is over, Escape reaches the app again.
- With reduced motion, the copy and the siblings settle at once.

## Keyboard

- Space picks up, the arrow keys move one place at a time, Space drops, Escape puts the item back. Up and Down move through a list and on into the next one; Left and Right move between columns, tabs and attachments.
- Move exactly one place per arrow, also right after the item enters another list, so what is announced and where it drops always agree. `useDragAcrossLists` (and `useDragLists`, built on it) measures each step from the item's real place and re-measures after a move between lists; without it, dnd-kit skips the place after entering a list.
- While a tab or another item of a composite widget is lifted, its own arrow keys stay off, so the arrows move the item and not the focus.
- A layout's places are stepped through in their order on screen, skipping places with no room.

## Screen readers

- Announce every step in a polite live region, by name and never by id: "Picked up #launch-week. Over Pinned, position 2 of 5." "Dropped #launch-week in Channels, position 1 of 4." "Cancelled. #launch-week is back in Pinned, position 2 of 5."
- Build the strings from your translations: `createDragAnnouncements` takes the names and places and your messages, and `dragInstructions` says to press Space, not Enter. dnd-kit's own English, id-based defaults never ship: where there is no name for the item, say nothing. `SortableTabsList` and `SortableComposerAttachments` announce by the tab's and the attachment's name and take your `messages`; `TaskDndProvider` announces from the card's and the status's names you pass as `describe`, and says nothing without them.

## Auto-scroll

- Scroll any scrollable area when the pointer comes within 48px of its edge while dragging, faster the nearer the edge: the sidebar's list, a board's columns, a tab row, the page. `DragLift` does it for whatever is under the pointer; turn dnd-kit's own off (`autoScroll={false}`), so the two don't scroll together.

## Touch

- Keep a draggable item scrollable (`touch-manipulation`, not `touch-none`), so a list of them still scrolls under a finger.
- Close the item's menu when its drag starts: a long press opened it, and the move after the hold picked the item up ([Dragging on a touch screen](../foundations/states.md#dragging-on-a-touch-screen)).

## Related

- [Drag](../../packages/ui/src/components/drag/drag.md): the parts.
- [TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md), [Tabs](../../packages/ui/src/components/tabs/tabs.md#accessibility), [Composer](../../packages/ui/src/components/composer/composer.md): the components built on them.
- [States](../foundations/states.md#dragging-on-a-touch-screen), [Elevation](../foundations/elevation.md), [Motion](../foundations/motion.md#usage), [Accessibility](../foundations/accessibility.md#focus-and-keyboard).
