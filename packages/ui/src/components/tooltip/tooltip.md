---
title: Tooltip
summary: One line that appears on hover or keyboard focus and gives something without a visible label its name, its consequence or its shortcut.
status: stable
aliases: [Hint]
layer: core
category: overlays
related: [preview-card, popover, button, app-rail]
---

# Tooltip

A tooltip is one line that appears on hover or keyboard focus and gives something without a visible label its name, its consequence or its keyboard shortcut. Icon buttons, truncated names, runtime chips and the items of the desktop rail use it.

## When to use

| Situation                                                                     | Use                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| An icon button, a truncated name, a runtime chip ("Runs on Martin's MacBook") | Tooltip                                                                                |
| An item of the desktop rail                                                   | Tooltip on the right, with the destination's name ([AppRail](../app-rail/app-rail.md)) |
| A label that is already visible on the control                                | Nothing: don't repeat it in a tooltip                                                  |
| Content with a link or a button                                               | [Popover](../popover/popover.md)                                                       |
| A person or an agent                                                          | [PreviewCard](../preview-card/preview-card.md)                                         |

## Anatomy

- `TooltipProvider`: sets the open delay for the tooltips inside it. In raft-ui they open without delay.
- `Tooltip`: the root. Required.
- `TooltipTrigger`: the element the tooltip describes. Required.
- `TooltipContent`: the tooltip, with a small arrow toward the trigger. A leading icon and a `Kbd` for the shortcut can sit inside it. Required.
- `TooltipPortal`: a lower-level part.

The tooltip is `layer-hud` with `foreground-on-hud` text, like a toast ([Color](../../../../../design/foundations/color.md#surfaces)).

## Behavior

- It opens above its trigger, centered on it, and flips below when there is no room above.
- The room above ends where the window's own controls begin. A desktop shell that draws its caption buttons over the top of the page sets the height of that band as `--raft-frame-inset-top` on the root element, and a tooltip that would open into the band flips below; one beside its trigger moves down out of it. The web sets none.
- It flips away from `--raft-frame-inset-start` and `--raft-frame-inset-end` the same way: one on an item in a foldable phone's system column opens toward the content ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)).
- `side="right"` puts it beside the trigger, as on the rail; `side="bottom"` puts it under the trigger.
- It wraps at 20rem, or at the space left in the window.
- It closes when the pointer leaves, when focus leaves and on Esc.

## Content

- Write one name or one short sentence, in sentence case: Search, Runs on Martin's MacBook.
- Use the same word in the tooltip as in the trigger's `aria-label`.
- Put the shortcut in a `Kbd` after the text: Search ⌘K.
- Where a disabled control's tooltip also gives the reason it can't be used, and the first line names the control (its label cut short on the trigger), put the reason on a second line in `foreground-on-hud-muted`, 4px below the name: the name, then why. A reason alone is the tooltip's one line, in its own text color.

## Accessibility

- Tooltip wraps the Base UI Tooltip. It provides the `tooltip` role and opens on hover and on keyboard focus.
- A tooltip adds to a name; it doesn't replace it. Give every icon-only button its own `aria-label`.
- Touch screens have no hover. Show the tooltip on press and hold, or write the explanation in the interface instead.

## Rules

- Never put a link, a button or anything people must act on in a tooltip: the pointer can't reach it.
