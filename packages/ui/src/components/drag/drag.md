---
title: Drag
summary: The parts every drag in Raft is built from — one sensor set, the lifted copy that follows the hand, the dashed place where an item will land, the reason a place refuses it, and announcements by name.
status: experimental
aliases:
  [
    Drag and drop,
    DnD,
    DragLift,
    DropPlaceholder,
    DragRefusalHint,
    useDragSensors,
    useDragLists,
    Sortable,
  ]
layer: core
category: actions
related: [task-dnd, tabs, composer, sidebar]
---

# Drag

The Drag parts are what every drag in Raft is built from, on dnd-kit: `useDragSensors` starts a drag the same way everywhere, `DragLift` is the copy that follows the hand and settles on a drop or a cancel, `DropPlaceholder` is the one look of where an item will land, and `DragRefusalHint` says why a place won't take it. The model they implement, and its reasons, is in [Drag and drop](../../../../../design/patterns/drag-and-drop.md). Import them from `@botiverse/raft-ui/wip`: the API can still change while Raft Chat moves its drags onto it.

```example
drag/compositions/lists
```

## When to use

| Situation                                                                       | Use                                                                  |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Reordering items in a list, or moving them between lists (a sidebar's sections) | `useDragLists` with `DraggedSlot`, `DragLift` and `useDragSensors`   |
| Moving task cards on a board                                                    | [TaskDnd](../task-dnd/task-dnd.md), built on these parts             |
| Reordering tabs                                                                 | [`SortableTabsList`](../tabs/tabs.md)                                |
| Reordering composer attachments                                                 | [`SortableComposerAttachments`](../composer/composer.md)             |
| Moving a section of a layout (side sections)                                    | `useDragSensors`, `DragLift` with a compact proxy, `DropPlaceholder` |
| Resizing a column                                                               | [Resizable](../resizable/resizable.md)                               |

## Anatomy

- `useDragSensors()`: the one sensor set for a `DndContext`. A mouse or a pen after 6px (`MOUSE_DRAG_DISTANCE_PX`); a finger after a 500ms hold and a 10px move (`useHoldThenMoveTouchSensor`); the keyboard on Space (`DRAG_KEYBOARD_CODES`), never Enter. Pass `coordinateGetter` (or only the getter, `useDragSensors(getter)`) for how the arrows move. Escape during a drag from any of them only puts the item back: it is taken in the capture phase on the window and stopped, so no app Escape handler (a panel, a dialog, a popover) hears it until the drag is over.
- `DragLift`: the lifted copy, inside the `DndContext`. Its children are the copy: the item itself, or a compact proxy. It takes the control radius; pass the item's own in `className`. It also sets the grabbing cursor, cancels on window blur and a hidden tab, scrolls the area the pointer is near the edge of, and sets a keyboard drag's copy 6px off its place. Turn dnd-kit's own auto-scroll off (`autoScroll={false}`). The copy sits above every other layer (`DRAG_LIFT_Z_INDEX`, 999: over popovers, stacked dialogs and toasts). Pass `container` (`document.body`) when an ancestor has a transform, such as a drawer or a dialog: the copy keeps the theme scope it was rendered in.
- `keepGrabInside(proxyWidth)`: a modifier for a compact proxy, so the hand stays on it when the item was grabbed far from its start. `LIFT_CLASS` is the lift look for a copy drawn without `DragLift`.
- `DropPlaceholder`: where the item will land, at the item's size. `opaque` in a layout's gap or new-column strip, so the column behind doesn't show through.
- `DragRefusalHint`: the reason a place refuses the item, in a HUD chip by the pointer, with the not-allowed cursor. Render it only while the place under the hand refuses. The chip sits right of and below the pointer; near the window's right edge it goes left of the pointer and of the copy, near the bottom edge above the pointer. It never sits under the copy and always stays 8px inside the window. Its size is measured when its content changes, not every frame.
- `DraggedSlot`: wraps each item's content in a list; pass `dragging={isDragging}` (it is `false` by default). The dragged item's own slot is at 40% (`ORIGIN_OPACITY`) while home and the place, with the item's `radius`, once it stands elsewhere.
- `useDragLists`: items in one or more lists, reordered and moved between them, with refusals and announcements by name. It returns the `DndContext`'s handlers, collision detection and `accessibility`, and the `coordinateGetter` for `useDragSensors`. Render `DragRemeasure version={items}` inside the context.
- `useDragAcrossLists`, `listKeyboardCoordinates` and `DragRemeasure`: the keyboard fix `useDragLists` is built on, for a surface with lists of its own.
- `createDragAnnouncements`, `dragInstructions`, `DEFAULT_DRAG_MESSAGES`: announcements and instructions for dnd-kit's `accessibility`, by name, in your language. A source whose `name` is empty says nothing. `useDragAnnouncer` and `DragLiveRegion` for a surface that announces on its own.
- `useDragSiblingTransition()` (or `DRAG_SIBLING_TRANSITION`): the 160ms slide for `useSortable({ transition })`, none with reduced motion. `DROP_GLIDE` is the glide `DragLift` uses, and `DRAG_SETTLE` its duration and easing.
- `cancelDrag()`: cancels the drag in progress, whichever sensor holds it. It sends the window a `resize`, which every dnd-kit sensor cancels on, never a synthetic Escape, so no dialog, panel or popover that closes on Escape hears it.
- Data attributes the stylesheet reads: `data-drag-origin` on the item a drag came from (40%), `data-drag-into` on a container the item has moved into (`fill-subtle`).

## States

| State                | Look                                                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lifted               | The copy: `layer-popover`, `shadow-float`, a `line-seam` ring; no scale, no tilt. The cursor is `grabbing` everywhere                                      |
| Home                 | The item stays in its place at 40%                                                                                                                         |
| Over a place         | `DropPlaceholder`: 1.5px dashed `line-strong` on `fill-subtle`, the item's radius and size; opaque on `layer-canvas` in a layout's gap or new-column strip |
| Over a refused place | No placeholder; the `DragRefusalHint` chip by the pointer; the cursor is `not-allowed`                                                                     |
| Dropped or cancelled | The copy glides into the place, or home, in 160ms; then the item shows there                                                                               |

## Behavior

- The copy follows the pointer 1:1 from the grab point; never clamp it or hold it to one axis with a modifier. A compact proxy may take a modifier that keeps it under the hand.
- dnd-kit measures the overlay's first element, so the keyboard offset is drawn inside it and moves no drop target.
- With `prefers-reduced-motion`, neither the copy nor the siblings animate.
- Escape during a pointer or a keyboard drag cancels it: the copy glides home, and the keydown goes no further (`preventDefault`, `stopImmediatePropagation`). After the drag, Escape behaves as everywhere else.
- The refusal chip stays inside the window and off the copy: flipped left of the pointer and the copy at the right edge, above the pointer at the bottom edge, held 8px inside on every side.

## Accessibility

- The parts wrap dnd-kit. A draggable item carries dnd-kit's attributes: it is focusable, with a role description and the instructions.
- Keyboard: Space picks up, the arrow keys move one place, Space drops, Escape cancels (and only cancels: no app Escape handler hears it). Enter never starts a drag. With `useDragLists`, or `useDragAcrossLists` and `DragRemeasure`, each arrow moves exactly one place, also right after a move into another list.
- Pass names, never ids: `createDragAnnouncements({ name, place, refusal }, messages)`. The English defaults are in `DEFAULT_DRAG_MESSAGES`; pass your translations as `messages`, each built from the same details. With no name for the item, say nothing rather than its id: `SortableTabsList` names a tab by its `aria-label` or text, `SortableComposerAttachments` an attachment by its `label`, and `TaskDndProvider` a card by its `describe`, silent without it.
- `DropPlaceholder` and `DragRefusalHint` are hidden from assistive technology: announce the reason as well.

## Rules

- Use `useDragSensors` for every drag, so a surface never picks its own distance, hold or keys.
- Render the copy in `DragLift`, never by moving the item itself.
- Keep the item in its place while it is dragged, and let `data-drag-origin` fade it.
