---
title: Resizable
summary: Columns or rows whose split people drag, with the drag handle sitting on the seam between them, or in the gap between cards that have no seam.
status: stable
aliases: [Split view, Splitter, Resize handle]
layer: core
category: layout
related: [app-shell, sidebar, panel, thread-panel]
---

# Resizable

Resizable lets people drag the boundary between two regions to change how much room each one gets: the sidebar and the main area, or a conversation and its thread. The seam between the two columns is the only line, and the drag handle sits on it ([Built from existing parts](../../../../../design/components/overview.md#resizable-columns)). Cards laid out in a panel have no seam, so their handle is the gap between them ([The gap handle](#the-gap-handle)).

```example
app-shell/compositions/collapsible-sidebar
```

## When to use

| Situation                                               | Use                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------- |
| A split people adjust: the sidebar, the thread panel    | Resizable                                                           |
| Widths fixed by the design                              | The slots of [AppShell](../app-shell/app-shell.md), or plain layout |
| A side panel that opens and closes beside the main area | A [Panel](../panel/panel.md) in the shell                           |
| Details that cover the page for a while                 | [Drawer](../drawer/drawer.md)                                       |

## Anatomy

- `ResizableGroup`: the container. `orientation="horizontal"` (the default) puts its panels side by side; `orientation="vertical"` stacks them. Required.
- `ResizablePanel`: one region, with its default, minimum and maximum size. At least 2.
- `ResizableHandle`: the drag handle between two panels. Required between every adjacent pair: a group without handles is plain layout.

The panels draw no surface, edge or padding. The region inside each panel draws its own, including the one seam between the two ([Page structure](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)).

## Variants

| Variant   | Use for                                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| On a seam | Columns that meet at a seam: the sidebar and the main area, a conversation and its thread. The default, drawn by `ResizableHandle`                                                      |
| In a gap  | Cards laid out in a panel with a 12px gap around them: the side cards beside a conversation ([Page structure](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)) |

### The gap handle

Cards laid out in a panel, such as the Tasks and Files cards beside a conversation, have no seam to drag: each card draws its own edge, and the 12px between it and its neighbor is empty. So the handle is the gap itself: the 12px left of the cards (the message list's own right padding) and the 12px between two stacked cards. A line drawn in the gap would be the seam the cards were laid out without, so the handle shows a short bar instead, which reads as a grip, not as an edge.

| State          | Look                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| At rest        | Nothing                                                                                                                                                                                                                               |
| Hover          | A 56 × 4px bar along the middle of the gap, `line-seam`, `rounded-[1px]` like the [Drawer](../drawer/drawer.md)'s grab handle, after a 150ms pause so a pointer passing over doesn't flash it; a Resize tooltip and the resize cursor |
| Dragging       | The bar in `foreground-muted`                                                                                                                                                                                                         |
| Keyboard focus | The bar in `foreground`                                                                                                                                                                                                               |

- The hit area is the whole 12px gap along the card, 24px under a coarse pointer, so it takes no room from the cards. A double click puts the size back to its default.
- Where two gaps cross, the 12px square where they meet (24px by touch) drags both at once with the move cursor, as at a grid's crossing, and hovering or dragging it lights both bars. A double click on it resets both. The square is for the pointer only: each gap keeps its own keyboard handle, a focusable `separator` like a seam's.
- `ResizableHandle` draws only the seam handle today; Raft Chat's side cards draw the gap handle themselves.

## States

These are the states of the handle on a seam; the gap handle's are in [The gap handle](#the-gap-handle).

| State           | Look                                                             |
| --------------- | ---------------------------------------------------------------- |
| At rest         | Nothing: the seam drawn by the region shows where the handle is  |
| Hover, dragging | A 1px `foreground-muted` line over the seam, and a resize cursor |
| Keyboard focus  | A 2px `foreground` line over the seam                            |

## Behavior

- The handle is 12px wide and centered on the boundary, overlapping each panel by 6px, so it takes no room from either. Under a coarse pointer (a finger on a tablet) it is 24px wide.
- A double click on the handle puts the column back to its default width.
- Use the widths in [Spacing](../../../../../design/foundations/spacing.md#layout-widths) for the default, minimum and maximum: every column has its own range, and the sidebar keeps one width on every page ([Resizing columns](../../../../../design/foundations/spacing.md#resizing-columns)).
- Pass `groupResizeBehavior="preserve-pixel-size"` on the sidebar's panel, so the sidebar keeps its width when the window changes and the main area takes up the difference.
- Below 768px there are no side-by-side columns to resize in Raft Chat; a server's public page keeps its columns from 640px ([Responsive layout](../../../../../design/patterns/responsive.md)).

## Accessibility

- Resizable wraps react-resizable-panels. Each `ResizableHandle` is a focusable `separator` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-controls`.
- Keyboard: the arrow keys along the group's orientation resize in small steps, Home and End go to the minimum and the maximum, Enter collapses or restores a collapsible panel, and F6 moves to the next handle.
- Give every handle an `aria-label` that says what it resizes: "Resize sidebar".

## Rules

- Use Resizable only for splits people adjust. Don't wrap fixed layouts in a group in case they might be resized later.
- Don't draw a line on a seam's handle or a second edge on the panels: the seam of the region is the only line. A gap handle draws only its short bar, and only on hover, drag and focus.
