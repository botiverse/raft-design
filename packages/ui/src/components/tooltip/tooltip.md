---
title: Tooltip
summary: One line that appears on hover, keyboard focus or a press and hold, and gives something without a visible label its name, its consequence or its shortcut.
status: stable
aliases: [Hint]
layer: core
category: overlays
related: [preview-card, popover, button, app-rail]
---

# Tooltip

A tooltip is one line that appears on hover, on keyboard focus or, on a touch screen, on a press and hold, and gives something without a visible label its name, its consequence or its keyboard shortcut. Icon buttons, truncated names, runtime chips and the items of the desktop rail use it.

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
- `TooltipTrigger`: the element the tooltip describes. Required. `openOnLongPress` and `openOnTap` set how it opens on a touch screen ([Touch screens](#touch-screens)).
- `TooltipContent`: the tooltip, with a small arrow toward the trigger. A leading icon and a `Kbd` for the shortcut can sit inside it. Required.
- `TooltipPortal`: a lower-level part.

The tooltip is `layer-hud` with `foreground-on-hud` text, like a toast ([Color](../../../../../design/foundations/color.md#surfaces)).

## Behavior

- It opens above its trigger, centered on it, and flips below when there is no room above.
- In a phone sheet or a drawer, a tooltip on a control in the body stays under the sheet's head; one on a head button opens above it as usual ([Dialog](../dialog/dialog.md#popups-in-a-sheet)).
- The room above ends where the window's own controls begin. A desktop shell that draws its caption buttons over the top of the page sets the height of that band as `--raft-frame-inset-top` on the root element, and a tooltip that would open into the band flips below; one beside its trigger moves down out of it. The web sets none.
- On a trigger in that band it flips away from `--raft-frame-inset-start` and `--raft-frame-inset-end` the same way. They are the band's corners (the macOS traffic lights, the Windows caption buttons), not columns: under the band they bound nothing ([Page structure](../../../../../design/patterns/page-structure.md#frame-insets)).
- `side="right"` puts it beside the trigger, as on the rail; `side="bottom"` puts it under the trigger.
- It wraps at 20rem, or at the space left in the window.
- It closes when the pointer leaves, when focus leaves and on Esc.

### Touch screens

A touch screen has no hover, so there a tooltip opens on a press and hold, the same as the mobile app's tooltip. Without it, a disabled button's reason (the one step that would make it usable) was out of reach on a phone; with it, the reason reaches every screen the same way, on the web and in the app.

- Holding the trigger still for 500ms opens the tooltip: the design system's long press, the moment a long-press menu opens and a touch drag arms ([Dragging on a touch screen](../../../../../design/foundations/states.md#dragging-on-a-touch-screen)). The hold doesn't press the trigger: lifting the finger runs no action.
- It opens on a disabled button too, so a disabled button's reason works by touch. The button must still receive the touch: give it `focusableWhenDisabled` (`aria-disabled`), as a disabled button with a reason already has ([Button](../button/button.md#accessibility)). A natively `disabled` button takes no touches and its tooltip never opens.
- A finger that moves more than 10px before the 500ms are up is scrolling, and opens nothing; scrolling across a row of triggers never opens their tooltips.
- After the hold, the tooltip stays while the finger is down and closes 1.5 seconds after it lifts, time to read the line the finger was covering. A tap anywhere else closes it at once.
- A short tap presses the trigger, as always, and opens nothing.
- A long press belongs to the layer that owns it; the tooltip takes it only when nothing else wants it. So by default the hold opens nothing:
  - on a link, whose own long press gives the system's menu (copy the link, open it in a new tab), more useful than a tooltip, and whose name is in its accessible name;
  - inside a long-press owner: an element marked `data-long-press-owner`. raft-ui marks its own: `ContextMenuTrigger`, a reorderable tab, a sortable composer attachment, a draggable task. An app marks the element that runs its own long press (a message row with a touch menu, a sortable item): the hold there is its menu or its drag, never both at once.
- Inside an owner, a disabled button whose reason must still show takes the hold back with `openOnLongPress`: its tooltip opens, and the owner's menu or drag doesn't start. The trigger carries `data-tooltip-long-press`, and the touch stops at it, so an owner listening through React (`ContextMenuTrigger`) never arms; an owner with a DOM listener of its own skips a touch that starts inside `[data-tooltip-long-press]`. `openOnLongPress={false}` turns the hold off anywhere else.
- Every trigger is `select-none`, so holding a name doesn't select its text.
- A button that exists only to explain (an ⓘ beside a setting) opens on a tap with `openOnTap`, and the next tap, on it or anywhere else, closes it. Its tap does nothing else, so a hold to find it would only slow it down. Its click no longer closes the tooltip.

## Content

- Write one name or one short sentence, in sentence case: Search, Runs on Martin's MacBook.
- Use the same word in the tooltip as in the trigger's `aria-label`.
- Put the shortcut after the text, one key per cap: a `KbdShortcut` at `sm` from key names, which draws ⌘ K on a Mac and Ctrl K elsewhere ([Kbd](../kbd/kbd.md)).
- Where a disabled control's tooltip also says what would make it usable (the one step the reader can take, or who can do it; never Raft's internal reason, [Writing](../../../../../design/content/writing.md#principles)), and the first line names the control (its label cut short on the trigger), put that on a second line in `foreground-on-hud-muted`, 4px below the name: the name, then the step. The step alone is the tooltip's one line, in its own text color.

## Accessibility

- Tooltip wraps the Base UI Tooltip. It provides the `tooltip` role and opens on hover, on keyboard focus and, on a touch screen, on a press and hold ([Touch screens](#touch-screens)).
- A tooltip adds to a name; it doesn't replace it. Give every icon-only button its own `aria-label`.
- Touch screens have no hover. The tooltip opens on a press and hold there, which people find only when they look for it: keep a tooltip to what helps but isn't needed (a name, a disabled button's step). What everyone must read goes in the interface.
- A tooltip on a tag inside a row's button is reached by nothing but the pointer. Put its sentence in the tag as visually hidden text, so it joins the row's name, and keep the tooltip as an extra ([Accessibility](../../../../../design/foundations/accessibility.md#focus-and-keyboard)).

## Rules

- Never put a link, a button or anything people must act on in a tooltip: the pointer can't reach it.
