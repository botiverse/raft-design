---
title: Elevation
summary: Which things float and cast a shadow, the controls that float over a conversation without one, how popups are positioned, the named order of every layer, and the focus ring.
redirectFrom: [decisions/0015-ink-focus-ring, decisions/0036-popup-positioning]
---

# Elevation

Controls and cards sit flat on the page. Only things that float above it for a moment (menus, popups, dialogs, toasts) cast a shadow, and they all cast the same soft one. The controls that float over a conversation to take the person somewhere in it stay flat ([Floating controls](#floating-controls)).

## Principles

- **No shadow on controls and cards.** A control is marked by its ink border, not a shadow, even where it floats over content. The two exceptions are things that leave their place for a moment: the lifted copy of anything dragged and the open comment card.
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
| `elevation-float` (`shadow-float`) | Menus, select lists, drawers, bottom sheets, dialogs, profile cards, tooltips, toasts, the hover toolbar of a message, the toolbar for selected text (popups over the message they act on) and the toolbar for selected items, the lifted copy of anything dragged, a row, a tab, a card or a section's head, on a `layer-popover` surface with a `line-seam` ring and no scale or tilt (it is lifted off its list; the item left behind at 40% casts nothing; [Drag and drop](../patterns/drag-and-drop.md#what-follows-the-hand)), the task head pulled down from its bar over the conversation, with no divider under it ([Tasks](../patterns/tasks.md#pulling-the-task-head-down)), and the open comment card in a document's margin (it is lifted off the column of cards, which move out of its way; [Comments](../patterns/comments.md)) |
| `elevation-sticker` (`shadow-sticker`) | Brand illustration only: the 99px avatar on a profile and on the last setup step, and the preview or collage on the pages that sign up or create an account or a server ([Brand](./brand.md#how-much-brand)). Nothing else |
| `focus-ring` (`shadow-focus`) | Every element that can be reached with the keyboard, when the keyboard reaches it |

## Popups

Menus, select and filter lists, and profile cards open next to the element that opened them. The same rules hold in every component, so no popup runs off a narrow screen or moves the page under the person.

- Float popups above the whole page. They never take space in the layout.
- Move or flip a popup to the other side when it meets the window edge, and never make it larger than the space left.
- On a phone, put a popup about as wide as the screen 8px from each screen edge: as wide as the screen less 8px on each side, at most 480px, and stopped 8px from the edge it is pushed against. The 8px is measured from the screen's edge, not from the safe area, as the server list does; where the shell keeps a frame inset, such as a foldable phone's system column, it is measured from the inset ([Page structure](../patterns/page-structure.md#frame-insets)). That is the inset stdrc chose for the server list, under the top bar on Home and above the tab bar ([Navigation](../patterns/navigation.md#the-server-tab-on-a-phone)), and every popup that wide uses it, whether it comes out of a bar or out of a button in it, such as the notification center ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md#behavior)). Popups that open from the same top bar then line up with each other and sit evenly between the screen's edges. The 480px cap never touches a phone held upright (the widest leaves 424px), so upright it always sits evenly; it only stops a phone on its side, 667px wide, from getting a 650px popup far wider than what it holds. Take the width from the positioner's `--available-width` (the screen less both 8px paddings, without a scrollbar) rather than `100vw`, which counts a desktop window's scrollbar in a narrow window.
- Don't scroll or shift the page when a popup opens or when someone types in it.
- Keep a popup on the element that opened it. When the page scrolls or moves under an open popup, whether the window scrolls or a pane inside it, the popup moves with its trigger; a popup left where it opened points at whatever has scrolled into its place. A context menu is the exception: it belongs to the point where it was opened, not to an element ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md#behavior)).
- Close a popup that doesn't hold focus when focus leaves it with Tab or Shift+Tab, and continue from the element that opened it: the next Tab goes on from there, as if the popup had never opened. Never leave focus on an invisible element or on the page's start while the popup stays open, where a keyboard user can't see where they are. This holds for a popup an app draws itself too, such as a card opened from inside an embedded page: it closes and hands focus back the way Esc does, in the same step.

## Floating controls

The jump pills of a conversation, Back to bottom, "3 new messages" and "Next unread thread (3)", float over the bottom or the top of the message list ([MessageList](../../packages/ui/src/components/message-list/message-list.md#jump-controls)). They are the only controls that float over content, and they cast no shadow.

- Draw a floating control as the control it is: a Button at `outline`, with its ink edge on the opaque `layer-card`. The opaque card keeps it readable over the messages that pass under it, and the ink edge marks it as a control, as everywhere else.
- Don't give it the soft shadow. The shadow says "this is above the page for a moment and goes away when you are done with it": a menu, a popup, a toolbar over the message it acts on. A jump pill belongs to the conversation, stays in one place while the list scrolls under it, and goes away by itself when there is nowhere to jump; a shadow would make the conversation look as if a popup were open.
- Don't use a floating control for an action on the page. It is only for moving through the list it floats over; an action belongs in the header or a toolbar.

## Stacked overlays

A modal surface (a dialog, an alert dialog, a modal sheet, a lightbox) dims everything under it with a scrim, so the one thing that can be used is the one on top. When one opens from another, the same must stay true: the surface below has to step back, or a white dialog sits on a white sheet with nothing to say which of the two is live.

- Put a scrim directly under every modal surface, including one opened from another. The scrim is what says "this is on top"; a shadow alone doesn't.
- Draw every scrim the same: `layer-backdrop`, or `layer-backdrop-nested` over another modal surface, with no blur and no tint of its own, whether it is under a dialog, a drawer, a bottom sheet or the search overlay (stdrc, 2026-10-21). How it appears follows its surface ([Motion](./motion.md#usage)).
- The first surface gets `layer-backdrop`. One opened from it gets the lighter `layer-backdrop-nested` (40% in both themes), so the surface below dims without the page going black. In light mode one scrim leaves a white page at about 35% of its light, and two full ones would leave 12%; with the nested scrim it keeps about 21%. In dark mode the first scrim is 60%, and the nested 40% still leaves the dark surface below visibly stepped back without merging it into the page.
- Stack at most two modal surfaces. When a third would open, replace the top one, or move the flow to a page.
- A sheet opened from a sheet is the exception: the one below steps back by itself instead ([Drawer](../../packages/ui/src/components/drawer/drawer.md#behavior)).

raft-ui does this on its own. A modal `Dialog`, `AlertDialog` or `Drawer`, and a `Lightbox` in every mode (it always draws its scrim), tells everything under its root that it is open, the same way Base UI decides a dialog is nested, so a dialog, an alert dialog, a sheet or a lightbox opened under it draws the nested scrim. A non-modal dialog or sheet doesn't count: nothing below it is dimmed. Base UI draws no scrim for a nested dialog by default, which is how a confirm opened from a sheet came to sit on an undimmed sheet.

An app's own modal surface, one with its own backdrop, Esc and focus, joins the same stack with two pieces of raft-ui (`@botiverse/raft-ui/wip` for now):

- `OverlayLayerProvider` (`kind`, `modal`): wrap the surface's scrim and content in it. A raft-ui overlay opened from inside then draws the nested scrim over it. Use `kind="dialog"` for an app's own modal, whatever it looks like: `"drawer"` is for a Base UI Drawer, which nests under another drawer by itself and draws its own scrim only over a `"dialog"`.
- `useParentOverlayKind()`: called inside that provider, it returns the kind of surface this one was opened from, or `null` when it is the first. Not `null` means: draw `layer-backdrop-nested`.

Both are for modal overlays only. A non-modal one passes `modal={false}` and adds nothing, so `useParentOverlayKind` inside it would read the layer below as its own. Both read React context, portals included, so they see only the surfaces whose tree the overlay is rendered in: render the overlay inside the surface it was opened from. An overlay opened from another React tree (a confirm an app opens from a global store, say) isn't stacked by them; it needs `layer={1}` or the app's own check.

## Layer order

Every layer has one place in a single order, from the page up, and one name for it. The names are Tailwind's own `z-*` utilities (`z-raised`, `max-md:z-chrome`, `before:z-below`), from the `--z-index-*` variables in raft-ui's `styles.css`, which CSS reads as `var(--z-index-sticky)`. Write the name, never the number: a number of your own puts a layer above or below layers it doesn't know about. Layers at the same place are drawn in DOM order, which for overlays is the order they opened.

| Name | Value | When to use | Example |
| --- | --- | --- | --- |
| `z-below` | -1 | Local. Decoration behind a component's content | A row's hover or selected fill (`before:z-below`), a drop zone's fill, the sidebar header's mask |
| `z-base` | 0 | Local. The content layer, named when a part beside it needs `z-raised` | An inbox row's stretched trigger, the active pill under a tab bar icon |
| `z-raised` | 1 | Local. A part over its sibling or over a stretched cover | Parts of a row over its stretched link, a badge on an avatar, a button's label, the pressed segment of a split button, an item sorted in place in its own list |
| `z-control` | 10 | A control or handle laid over content | Resize and seam handles, prev and next arrows, a drawer's grip, a message's hover toolbar, an attachment's remove button, swipe-reveal layers, a loading veil over a tile |
| `z-sticky` | 20 | Content that sticks inside a scroller | Day headings, table heads, section heads, the pull-to-refresh indicator |
| `z-float` | 30 | Controls that float over content and its sticky parts | The jump pills of a conversation, the typing line, the selected-items toolbar, a composer's drop overlay, a floating side card |
| `z-chrome` | 35 | A region's own chrome, over everything in the region | A panel header (sticky on a phone), a page toolbar, a thread's header |
| `z-cover` | 40 | A surface that covers a region in place | A phone panel over the main column, a thread or task opened over a channel, `AppShellOverlaySlot` |
| `z-app` | 45 | Fixed app-level chrome over every region | Update and version banners, the phone tab bar, fixed onboarding bars, dev tools |
| `z-scrollbar` | 49 | A ScrollArea's scrollbars, over every layer inside the area | ScrollArea's gutters, inside the area's own stacking context, so over its sticky headings, raised parts and floating controls ([ScrollArea](../../packages/ui/src/components/scroll-area/scroll-area.md#rules)) |
| `z-popup` | 50 | Popups opened from the page | Menus, select lists, popovers, tooltips, profile cards |
| `z-dialog` | 50 | Dialogs, alert dialogs and sheets, with their scrims | `Dialog`, `AlertDialog`, `Drawer` |
| `z-dialog-layer` | 60 | A dialog opened from another React tree, which can't nest in the one below | `DialogContent layer={1}` |
| `z-lightbox` | 70 | A [lightbox](../../packages/ui/src/components/lightbox/lightbox.md#popups-inside): its scrim, its content and everything opened inside it | `Lightbox` |
| `z-toast` | 80 | Toasts | `Toast` |
| `z-drag` | 999 | The lifted copy of anything dragged, and the hint beside the pointer that says why it can't be dropped ([Drag](../../packages/ui/src/components/drag/drag.md)) | `DragLift`, `DragRefusalHint` |

### In-page layers

The rows from `z-below` to `z-scrollbar` order the parts of a page. They all stay below 50, where the overlays begin.

- **Local layers rank only inside their component.** `z-below`, `z-base` and `z-raised` are local: the component's root is `isolate` (or is already a stacking context of its own), so a part at `z-raised` never competes with anything outside it. Lint can't check that the root is isolated; check it when you review.
- **Two local layers are enough.** A part that has to sit over another raised part takes `z-raised` too and comes after it in the DOM, inside the component's `isolate`: the progress bar of an uploading attachment over its veil, the second icon of the composer's drop overlay over the first. There is no third local level.
- **Page layers order regions inside one stacking context**: a panel, a ScrollArea or the app. A ScrollArea is a stacking context of its own, so a layer inside it ranks only among the area's content, under the area's scrollbar.
- **Anything anchored to a trigger portals.** A popup, a menu or a card opened from a trigger is a raft-ui `Popover`, `Menu`, `PreviewCard` or `Tooltip`, never an in-page layer; the copy of a dragged item is `DragLift`. Drawn in place they are clipped at the edge of the area they are in and drawn under its scrollbar.

### Overlays

- A popup or a dialog opened from inside a dialog or a lightbox is drawn above it: Base UI puts it in that surface's portal, after the surface. The lightbox's portal is a stacking context of its own, so what opens inside it is ordered only among the lightbox's layers, and is never drawn under its scrim.
- Toasts are above every surface, the lightbox included, so the receipt for something done in a lightbox (Link copied) is seen. While a modal surface is open, show only the toasts it causes, without an action ([Toast](../../packages/ui/src/components/toast/toast.md#where-it-appears)).
- Nothing sits above the toasts but the drag lift, and nothing above the drag lift. A surface of an app's own at 100 or 1000 hides the toast that reports what was done in it, or the item being dragged over it.
- To tell whether a node is in one of these layers (a press in a popover's panel is not inside the region it was opened from), use `isInsideOverlay(node)` ([Popover](../../packages/ui/src/components/popover/popover.md#inside-an-overlay)).
- Don't give any of these layers a z-index of your own. Use raft-ui's component, which takes its place in the order; an app's own modal surface takes `z-dialog`, or `z-dialog-layer` when it opens from another React tree.

### Kept exceptions

A number stays only where no name can say it, with the reason in a `// raft-ui: z-index <reason>` comment on the line above it (`raft-ui/no-raw-z-index`, [Lint rules](../about/use-raft-ui.md#lint-rules)). raft-ui keeps these, listed in `z-index-named.test.ts`:

- **Stacked toasts**, ordered by their index: `calc(var(--z-index-toast) - var(--toast-index))`.
- **`DRAG_LIFT_Z_INDEX`**, 999: `z-drag` as the number dnd-kit's overlay takes.

## Focus ring

`focus-ring` is a 2px gap in the surface color followed by 2px of ink. It is ink, not yellow: a yellow ring would disappear on the yellow frame and on yellow stickers.

- Give every element that can be reached with the keyboard a visible focus ring.
- Show it only after keyboard navigation, not after a click or a tap ([States](./states.md#focus)). The token itself is emptied while the root says `data-input-modality="pointer"`, so `shadow-focus` follows the rule on its own.
- Use an inset 2px ink outline instead for elements that touch the edge of their container, such as the search row of a menu. It is not the token, so it takes the `keyboard:` variant (`focus-visible:keyboard:inset-ring-2`) to follow the same rule.
- Keep a sticker's own ink edge when it takes focus (a mention marker, a selected sidebar row, a filter), and draw the focus ring outside it. Don't replace the edge with the ring.
- Which part of a compound control shows the ring is in [States](./states.md#focus).

## Related

- [States](./states.md): hover, press and focus.
- [Drag and drop](../patterns/drag-and-drop.md): the lift look of a dragged item.
- [Visual comfort](./comfort.md#surfaces): when content gets a card or a border at all.
- [Brand](./brand.md): where the sticker shadow may appear.
- [Choosing a component](../components/overview.md#how-to-choose-a-component): which popup to use.
