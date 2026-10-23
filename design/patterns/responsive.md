---
title: Responsive layout
summary: The breakpoints, what each width shows, how short desktop windows shrink, why a layout switches on the width of its own region, how a row gives way when it runs out of room, why the first frame is already the settled one, what replaces hover on a touch screen, and how phone layouts hold at 320px.
---

# Responsive layout

Below 768px Raft is a phone layout: top-level pages with the tab bar, everything else pushed. From 768px the desktop layout begins, with the web top bar and the rail, and side panels sit beside the main area once there is room for both. Where there isn't room, a panel covers the main area rather than squeezing it below the widths in the table. Task details don't change with the width beyond going full screen on a phone ([Tasks](./tasks.md#structure)).

## When it applies

Every screen. The regions themselves are in [Page structure](./page-structure.md); the widths of regions are in [Spacing](../foundations/spacing.md#layout-widths). A product can add its own conditions, such as the widths of Raft Chat's Search and Activity columns ([Raft Chat](../products/raft-chat/README.md#wide-and-narrow)).

## Structure

| Width | Layout |
| --- | --- |
| Below 768px | Phone: top-level pages with the tab bar, every other page pushed. No web top bar and no rail. A thread is a pushed page; a profile covers the page like one, with Back |
| 768px to 1023px | Web top bar, rail, sidebar and main area. A profile covers the main area |
| 1024px and up | A profile or a task side panel (400px, resizable from 320px until the main area is down to its 360px) sits beside the main area when the area it opens in is at least 720px wide, the main area's 360px plus the panel's 360px; otherwise it covers it |
| A thread, at any desktop width | Beside the conversation when the window is landscape or at least 1280px wide, and the conversation's column is at least 720px wide (the conversation's 360px plus the thread's 360px minimum); otherwise it covers the conversation. Beside it, the thread is 400px (resizable from 360px until the conversation is down to its 360px) and the conversation keeps at least 360px |
| Side cards beside a conversation | The cards sit inside the conversation's panel, under its header, at the right of the message list and composer. A thread is not part of them: it keeps its own column to the right of the whole panel, header included (the row above), and opening it only makes the panel narrower; the cards stay where they are. When the panel fits the message list (at least 360px, the main area's minimum, as beside a thread, its own 12px right padding before the cards included) and the cards (at least 280px, plus the column's 12px gutter at the right: a 652px panel), the cards take a column and the message list gets narrower. When it doesn't, the cards float over the right of the message list as one card with the `float` shadow, 12px in from the panel's edges and above the composer, so the messages keep their width. With both open, they stack while two 160px cards fit beside the messages; floating, or in a panel too short for two, one shows at a time under a Tasks / Files row of [tabs](../../packages/ui/src/components/tabs/tabs.md) (different content, so tabs, not a segmented control), the one opened or picked last first. The tabs start on the cards' 16px margin, where the card's title and rows start. Below 768px, and in a panel too narrow for a 280px floating card and 240px left for the messages (under 520px, such as a 1024px window with a thread open; the card's 12px inset from the panel's edge comes out of those 240px), the card covers the panel under its header, composer included, with Back |
| Desktop window shorter than 600px | Headers shrink from 56px to 48px; the rail shrinks with them, from 57px to 49px wide; rail items shrink from 40px to 36px. The web top bar keeps 48px |

The mobile apps switch by the window's width too, at their own breakpoint: from 840dp, with the app's desktop mode on, they show the rail and two panes instead of the tab bar, in landscape and on tablets alike, and a thread sits beside the conversation from 1200dp. The rail is drawn as the [AppRail](../../packages/ui/src/components/app-rail/app-rail.md) and keeps the phone's destinations in the phone's order, except the server tab: there the server is the workspace tile in the rail's header, the one way to switch servers, as the web has one ([Navigation](./navigation.md#the-server-in-the-apps-desktop-mode)). Keep each platform's breakpoint (768px on the web, 840dp in the apps) rather than forcing one: a breakpoint is how a layout is built, while the navigation's structure, which is the same everywhere, is in [Navigation](./navigation.md#principles).

```example
app-shell/compositions/responsive
```

## Rules

### Switch on the region's width

Switch a layout on the width of the region it sits in, not on the window's. The same component sits in a 320px panel on a 1440px window and fills a 390px phone: the window's width says nothing about its room. A profile panel, a thread beside a conversation, a dialog and the Activity list are each narrower than the window, and a layout that asks the window still lays itself out for a screen it doesn't have: a two-column list in a 360px panel, a step row that wraps where it should stack.

- **Content in a panel, column or card uses a container query on that region**: `@container` on the region, `@sm:`, `@max-[…]:` and the like on what it holds. A component that switches its own layout makes itself the container, so it works wherever it is put; it then fills its row's width, since a container can't take its width from what it holds. So give it a parent with a definite width: a block, a stretched flex or grid item, or anything with a width set. In a parent that shrinks to fit its content (`inline-block`, `w-fit` or `fit-content`, an absolutely positioned box or a floating layer with no width, a flex item with `flex-basis: auto` and no width) it collapses to no width at all, its text one word to a line. The components that make themselves containers say so on their pages.
- **Only what the window itself sizes reads the window**: the page shell and its breakpoints (the table above), dialogs, sheets, toasts, the notification center, and a panel header's phone padding (on a phone the panel is the page).
- **Mouse or touch is read with `pointer` and `hover`, never with the width** ([Touch screens](#touch-screens)): a tablet is touch at 1024px, and a narrow desktop window still has a mouse.
- **Anything measured in script keeps measuring.** Observe the element mounted now (a callback ref, not a ref read once in an effect) and measure again when it resizes and when its content changes (a `ResizeObserver` on it, and a `MutationObserver` or a layout effect for content: a `ResizeObserver` doesn't report text changing inside an inline element). A measurement taken once is wrong as soon as content arrives late, a font loads or the element is swapped.
- **Prefer a layout that needs no switch.** A row that wraps, a grid with `auto-fill`, a width as `min(360px, 100%)` rather than `100vw` less a guess at the chrome: these fit any region without asking its width.

Three causes account for the layouts that broke in narrow regions in the 2026-10 audit: a switch on the window's width, a measurement taken once, and a row with no way to give way. This section is the first two; the next is the third.

### When a row runs out of room

Every row needs a way to give way. A toolbar, a header, a filter row or a list row has to fit at the narrowest width its region can take (the Activity results list goes down to 320px), in the longest translation and with the longest value it can hold (an email address has no space to break at). When it doesn't, its parts give way in a fixed order, so the person still sees every control:

1. A secondary text button shows only its icon, with its label kept as the accessible name and the tooltip. Mark all read becomes the `check-check` icon button.
2. Only then, the main control shows only its icons: a segmented control's segments, a tab's label. A segmented control does this itself with `iconsOnlyBelow="auto"`, exactly when its labels don't fit the room it is given: each segment becomes a 32px square with its icon, its label kept as the accessible name and the tooltip ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md#behavior)).
3. A row of controls that still doesn't fit wraps onto a second line, the controls kept whole; a segmented control that can't show its icons only scrolls sideways inside its own track rather than spilling onto its neighbor ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md#behavior)).
4. Text truncates last, and only in a name or a value (a channel, a person, an email, a time), never in a control's label.

- Never let parts overlap, and never let a control shrink below its own content: wrapping a control in `min-w-0` lets its frame shrink while its content spills onto its neighbor.
- Give every part that can give way the means to: `min-w-0` and `truncate` on the text that may be cut, `flex-wrap` on a row of controls, `iconsOnlyBelow="auto"` on a segmented control in a row that may narrow. A part that can neither shrink, wrap nor truncate is the one that overflows.
- Decide the switch with a container query on the row (`@container`, `@max-[…]:`), not the window width ([Switch on the region's width](#switch-on-the-regions-width)). Where the switch is whether a part's content fits, measure the content rather than guess a width, as `iconsOnlyBelow="auto"` does: a width picked for one language or one count is wrong for another.
- Don't shrink text or a control's height to make a row fit: a label too small to read, or a target too small to hit, is worse than an icon with a tooltip.

### The first frame is the settled one

Draw the first frame the way it will stay. A frame drawn from a "not known yet" default and corrected a moment later is a flash: a row that grows and shrinks back, a panel that opens at one width and snaps to another, a card that pops in and pushes the page down. For that moment people see a layout that was never meant, and controls move under the pointer.

- **Read what decides a layout before the first paint.** A remembered width, a collapsed section and a view mode go into the initial state from storage; so do the viewport, the pointer and the platform. Don't read them in an effect after mount: an effect runs after the browser has painted.
- **Measure in a layout effect and decide there**, not in the next animation frame: a state set in a layout effect renders again before the browser paints. Wait for a frame only for later measurements, on a resize.
- **Keep a part's presence and size while its data reloads.** When a list reloads for a new filter, keep the counts, and the controls that show only when there is a count, at their last values until the new answer arrives. Don't drop them to an empty default and bring them back. A control that goes away for that moment gives its room to its neighbors, and they lay themselves out again: a segmented control with `iconsOnlyBelow="auto"` shows its labels and then goes back to icons.
- **A placeholder takes the size and place of what it stands for.** The fallback of a panel whose code loads lazily is that panel's own box at its remembered width, not the rest of the row. A skeleton is the size of its content ([Feedback](./feedback.md#empty-loading-and-failed)).
- **Change once, when the real answer arrives:** from the old value straight to the new one, never through an empty one.

### Touch screens

A touch screen has no hover, so anything that only appears on hover is out of reach there. Decide by the input, not the width: use the `pointer: coarse` media query, because a tablet held sideways is touch and a narrow desktop window still has a mouse.

- With a mouse, keep a row's actions hover-only, Mark as Done on an Activity row included: show them while the row is hovered, holds keyboard focus or has a menu open from it, and hide them at rest. A list where every row shows its button reads as a wall of buttons and pulls the eye from the content, and the row itself is what a mouse goes for. Hidden actions stay in the tab order.
- Show a row's hover action at rest on a touch screen when it is the row's main action: a 44px target at the end of the row, with its icon. The rest of the row makes room for it instead of sitting under it ([InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#behavior)).
- On a phone, Mark as Done on an Activity row is the exception: it is reached by swiping the row left and from its press-and-hold menu, with no button at rest (stdrc, 2026-10-23). A list that is mostly rows to clear reads as a column of buttons with one on every row, and on a phone swiping a row away is how people already clear a list (Mail, Messages). A tablet or a desktop keeps the button: there the row is wider and the swipe is not the habit.
- Put every hover action in the row's press-and-hold menu as well, the same menu right-click opens on desktop, so an action is in one place on every device ([Conversation](./conversation.md)).
- A swipe may add a shortcut for the row's main action (swipe left to reveal Mark as Done, release to apply, with an Undo toast), but never be the only way to reach it: the press-and-hold menu has the same action ([Accessibility](../foundations/accessibility.md)).
- Start a row's swipe only when the finger moves clearly sideways: more than twice as far across as up or down, and past the platform's touch slop. A drag that turns vertical once started goes back to scrolling the list. Otherwise people scrolling a list swipe its rows by accident.
- Judge that past the platform's touch slop, or 10px on the web, which has none, so the "twice as far" rule is read once the finger has gone 20px. Leave a swipe that starts within 24px of the screen's left or right edge to the browser and the system, whose back and app-switch gestures start there.
- Apply on release past 40% of the row's width, or past 20% with a quick flick, the same as Raft's apps. Short of that the row springs back, and nothing happens.
- Show which of the two a release will do. The layer the row uncovers has the action's colour soft (`success-soft` for Done, with its icon and word in `success-strong`) until the swipe has gone far enough, then solid with ink on it (`success`, ink icon and word), and soft again if the finger comes back. A pull to refresh shows armed and disarmed the same way ([Navigation](./navigation.md#refreshing)): the finger has to know before it lets go. The word is the action's shortest name ("Done", with a check), since it sits under the finger; the menu item keeps the full name ("Mark as Done").
- Take the row out of the list at once and give the toast an Undo, which keeps it for 8 seconds ([Toast](../../packages/ui/src/components/toast/toast.md)). The action may wait for the toast: apply it when the toast closes, when the next row is swiped (its toast replaces this one), or when the list is left or the page hidden, and drop it if new activity arrives in that row meanwhile. Undo puts the row back where it was.
- Keep secondary hover actions out of the row on a touch screen; they live in the menu, so a list stays calm.

### Phone

- Design for 390px wide, and make everything fit at 320px, the narrowest phone still in use.
- Truncate long names. What a long value does in a form field, and what wraps instead, is in [Forms](./forms.md#long-values-in-fields).
- Let buttons wrap to a new line. Don't shrink their text: a label too small to read is worse than a taller button.
- Use at most 4 segments in a segmented control. When they don't fit, show only their icons, with the label kept as the accessible name (`iconsOnlyBelow="auto"`).
- Scroll tabs horizontally when they don't fit ([Tabs](../../packages/ui/src/components/tabs/tabs.md)).
- The composer and the message actions on a touch screen are in [Conversation](./conversation.md#the-composer).

## Related

- [Spacing](../foundations/spacing.md): widths and header heights.
- [Navigation](./navigation.md): Back and the tab bar.
