---
title: Resizable
summary: Columns or rows whose split people drag, with the drag handle sitting on the seam between them.
status: stable
aliases: [Split view, Splitter, Resize handle]
layer: core
category: layout
related: [app-shell, sidebar, panel, thread-panel]
---

# Resizable

Resizable lets people drag the boundary between two regions to change how much room each one gets: the sidebar and the main area, or a conversation and its thread. The seam between the two columns is the only line, and the drag handle sits on it ([Built from existing parts](../../../../../design/components/overview.md#resizable-columns)).

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

## States

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
- Don't draw a line on the handle or a second edge on the panels: the seam of the region is the only line.
