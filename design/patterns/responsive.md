---
title: Responsive layout
summary: The breakpoints, what each width shows, how short desktop windows shrink, how a row gives way when it runs out of room, what replaces hover on a touch screen, and how phone layouts hold at 320px.
---

# Responsive layout

Below 768px Raft is a phone layout: top-level pages with the tab bar, everything else pushed. From 768px the desktop layout begins, with the web top bar and the rail, and side panels sit beside the main area once there is room for both. Where there isn't room, a panel covers the main area rather than squeezing it below the widths in the table. Task details don't change with the width beyond going full screen on a phone ([Tasks](./tasks.md#structure)).

## When it applies

Every screen. The regions themselves are in [Page structure](./page-structure.md); the widths of regions are in [Spacing](../foundations/spacing.md#layout-widths). A product can add its own conditions, such as the widths of Raft Chat's Search and Activity columns ([Raft Chat](../products/raft-chat/README.md#wide-and-narrow)).

## Structure

| Width | Layout |
| --- | --- |
| Below 768px | Phone: top-level pages with the tab bar, every other page pushed. No web top bar and no rail. A thread or a profile covers the page like a pushed page, with Back |
| 768px to 1023px | Web top bar, rail, sidebar and main area. A profile covers the main area |
| 1024px and up | A profile (380px, resizable from 300px to 600px) sits beside the main area when the area it opens in is at least 680px wide; otherwise it covers it |
| A thread, at any desktop width | Beside the conversation when the window is landscape or at least 1280px wide, and the conversation's column is at least 680px wide; otherwise it covers the conversation. Beside it, the thread is 400px (resizable from 360px to 60% of the window) and the conversation keeps at least 320px |
| Desktop window shorter than 600px | Headers shrink from 56px to 48px; the rail shrinks with them, from 57px to 49px wide; rail items shrink from 40px to 36px. The web top bar keeps 48px |

```example
app-shell/compositions/responsive
```

## Rules

### When a row runs out of room

A toolbar, a header or a filter row has to fit at the narrowest width its region can take (the Activity results list goes down to 320px), in the longest translation. When it doesn't, its parts give way in a fixed order, so the person still sees every control:

1. A secondary text button shows only its icon, with its label kept as the accessible name and the tooltip. Mark all read becomes the `check-check` icon button.
2. Only then, the main control shows only its icons: a segmented control's segments, a tab's label. A segmented control does this itself below the row width set in `iconsOnlyBelow`: each segment becomes a 32px square with its icon, its label kept as the accessible name and the tooltip ([SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md#behavior)).
3. Text truncates last, and only in a name (a channel, a person), never in a control's label. The one exception is a tab bar label, whose cell can't grow; which text may truncate when it is set larger is in [Larger text](../foundations/typography.md#larger-text).

- Never let parts overlap, and never let a control shrink below its own content: wrapping a control in `min-w-0` lets its frame shrink while its content spills onto its neighbor.
- Decide the switch with a container query on the row (`@container`, `@max-[…]:`), not the window width: the same row sits in columns of different widths.
- Don't shrink text or a control's height to make a row fit: a label too small to read, or a target too small to hit, is worse than an icon with a tooltip.

### Touch screens

A touch screen has no hover, so anything that only appears on hover is out of reach there. Decide by the input, not the width: use the `pointer: coarse` media query, because a tablet held sideways is touch and a narrow desktop window still has a mouse.

- With a mouse, keep a row's actions hover-only, Mark as Done on an Activity row included: show them while the row is hovered, holds keyboard focus or has a menu open from it, and hide them at rest. A list where every row shows its button reads as a wall of buttons and pulls the eye from the content, and the row itself is what a mouse goes for. Hidden actions stay in the tab order.
- Put every hover action in the row's press-and-hold menu, the same menu right-click opens on desktop, so an action is in one place on every device ([Conversation](./conversation.md)). On a touch screen that menu is where they are: the row shows none of them at rest, Mark as Done on an Activity row included, as in mail apps. A button on every row makes a phone's list a column of buttons ([InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#behavior)).
- A swipe may add a shortcut on an Activity row (by default Mark as Done to the left, and Unfollow Thread or, on a channel, Mute Activity to the right, with an Undo toast), but never be the only way to reach an action: the menu has it too. The rules for swipes, and which actions people can put on them, are in [Touch](./touch.md#swipe).

### Phone

- Design for 390px wide, and make everything fit at 320px, the narrowest phone still in use.
- Truncate long names.
- Let a button's label wrap to a new line, and the button grow taller with it. Don't shrink their text: a label too small to read is worse than a taller button ([Larger text](../foundations/typography.md#larger-text)).
- Use at most 4 segments in a segmented control. When they don't fit, show only their icons, with the label kept as the accessible name (`iconsOnlyBelow`).
- Scroll tabs horizontally when they don't fit ([Tabs](../../packages/ui/src/components/tabs/tabs.md)).
- The composer and the message actions on a touch screen are in [Conversation](./conversation.md#the-composer).

## Related

- [Spacing](../foundations/spacing.md): widths and header heights.
- [Navigation](./navigation.md): Back and the tab bar.
