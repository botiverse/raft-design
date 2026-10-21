---
title: Elevation
summary: Which things float and cast a shadow, the controls that float over a conversation without one, how popups are positioned, and the focus ring.
redirectFrom: [decisions/0015-ink-focus-ring, decisions/0036-popup-positioning]
---

# Elevation

Controls and cards sit flat on the page. Only things that float above it for a moment (menus, popups, dialogs, toasts) cast a shadow, and they all cast the same soft one. The controls that float over a conversation to take the person somewhere in it stay flat ([Floating controls](#floating-controls)).

## Principles

- **No shadow on controls and cards.** A control is marked by its ink border, not a shadow, even where it floats over content. The two exceptions are cards that leave their place for a moment: a dragged card and the open comment card.
- **One soft shadow for everything that floats.**
- **The hard sticker shadow is for brand illustration only.**

## Tokens

```tokens
elevation
```

```tokens
focus
```

| Token (utility) | Use for |
| --- | --- |
| `elevation-float` (`shadow-float`) | Menus, select lists, drawers, bottom sheets, dialogs, profile cards, tooltips, toasts, the hover toolbar of a message and the toolbar for selected text (popups over the message they act on), a card while it is dragged (it is lifted off the board; the card left behind casts nothing), and the open comment card in a document's margin (it is lifted off the column of cards, which move out of its way; [Comments](../patterns/comments.md)) |
| `elevation-sticker` (`shadow-sticker`) | Brand illustration only: the 99px avatar on a profile and on the last setup step, and the preview of the new server on the page that creates a server ([Brand](./brand.md#how-much-brand)). Nothing else |
| `focus-ring` (`shadow-focus`) | Every element that can be reached with the keyboard, when the keyboard reaches it |

## Popups

Menus, select and filter lists, and profile cards open next to the element that opened them. The same rules hold in every component, so no popup runs off a narrow screen or moves the page under the person.

- Float popups above the whole page. They never take space in the layout.
- Move or flip a popup to the other side when it meets the window edge, and never make it larger than the space left.
- Don't scroll or shift the page when a popup opens or when someone types in it.
- Keep a popup on the element that opened it. When the page scrolls or moves under an open popup, whether the window scrolls or a pane inside it, the popup moves with its trigger; a popup left where it opened points at whatever has scrolled into its place. A context menu is the exception: it belongs to the point where it was opened, not to an element ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md#behavior)).

## Floating controls

The jump pills of a conversation, Back to Bottom, "3 New Messages" and "Next Unread Thread (3)", float over the bottom or the top of the message list ([MessageList](../../packages/ui/src/components/message-list/message-list.md#jump-controls)). They are the only controls that float over content, and they cast no shadow.

- Draw a floating control as the control it is: a Button at `outline`, with its ink edge on the opaque `layer-card`. The opaque card keeps it readable over the messages that pass under it, and the ink edge marks it as a control, as everywhere else.
- Don't give it the soft shadow. The shadow says "this is above the page for a moment and goes away when you are done with it": a menu, a popup, a toolbar over the message it acts on. A jump pill belongs to the conversation, stays in one place while the list scrolls under it, and goes away by itself when there is nowhere to jump; a shadow would make the conversation look as if a popup were open.
- Don't use a floating control for an action on the page. It is only for moving through the list it floats over; an action belongs in the header or a toolbar ([FloatButton](../../packages/ui/src/components/float-button/float-button.md)).

## Stacked overlays

A modal surface (a dialog, an alert dialog, a modal sheet) dims everything under it with a scrim, so the one thing that can be used is the one on top. When one opens from another, the same must stay true: the surface below has to step back, or a white dialog sits on a white sheet with nothing to say which of the two is live.

- Put a scrim directly under every modal surface, including one opened from another. The scrim is what says "this is on top"; a shadow alone doesn't.
- Draw every scrim the same: `layer-backdrop`, or `layer-backdrop-nested` over another modal surface, with no blur and no tint of its own, whether it is under a dialog, a drawer, a bottom sheet or the search overlay (stdrc, 2026-10-21). How it appears follows its surface ([Motion](./motion.md#usage)).
- The first surface gets `layer-backdrop`. One opened from it gets the lighter `layer-backdrop-nested` (40% in both themes), so the surface below dims without the page going black. In light mode one scrim leaves a white page at about 35% of its light, and two full ones would leave 12%; with the nested scrim it keeps about 21%. In dark mode the first scrim is 60%, and the nested 40% still leaves the dark surface below visibly stepped back without merging it into the page.
- Stack at most two modal surfaces. When a third would open, replace the top one, or move the flow to a page.
- A sheet opened from a sheet is the exception: the one below steps back by itself instead ([Drawer](../../packages/ui/src/components/drawer/drawer.md#behavior)).

raft-ui does this on its own. A modal `Dialog`, `AlertDialog` or `Drawer` tells everything under its root that it is open, the same way Base UI decides a dialog is nested, so a dialog, an alert dialog or a sheet opened under it draws the nested scrim. A non-modal one doesn't count: nothing below it is dimmed. Base UI draws no scrim for a nested dialog by default, which is how a confirm opened from a sheet came to sit on an undimmed sheet.

An app's own modal surface, one with its own backdrop, Esc and focus, joins the same stack with two public pieces of raft-ui:

- `OverlayLayerProvider` (`kind="dialog"` or `"drawer"`, `modal`): wrap the surface's scrim and content in it. A raft-ui overlay opened from inside then draws the nested scrim over it.
- `useParentOverlayKind()`: called inside that provider, it returns the kind of surface this one was opened from, or `null` when it is the first. Not `null` means: draw `layer-backdrop-nested`.

Both read React context, portals included, so they see the surfaces whose tree the overlay is rendered in. Don't look for open scrims in the document instead: render the overlay inside the surface it was opened from.

## Focus ring

`focus-ring` is a 2px gap in the surface color followed by 2px of ink. It is ink, not yellow: a yellow ring would disappear on the yellow frame and on yellow stickers.

- Give every element that can be reached with the keyboard a visible focus ring.
- Show it only after keyboard navigation, not after a click or a tap ([States](./states.md#focus)). The token itself is emptied while the root says `data-input-modality="pointer"`, so `shadow-focus` follows the rule on its own.
- Use an inset 2px ink outline instead for elements that touch the edge of their container, such as the search row of a menu. It is not the token, so it takes the `keyboard:` variant (`focus-visible:keyboard:inset-ring-2`) to follow the same rule.
- Keep a sticker's own ink edge when it takes focus (a mention marker, a selected sidebar row, a filter), and draw the focus ring outside it. Don't replace the edge with the ring.
- Which part of a compound control shows the ring is in [States](./states.md#focus).

## Related

- [States](./states.md): hover, press and focus.
- [Brand](./brand.md): where the sticker shadow may appear.
- [Choosing a component](../components/overview.md#how-to-choose-a-component): which popup to use.
