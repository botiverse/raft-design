---
title: Responsive layout
summary: The breakpoints, what each width shows, how short desktop windows shrink, and how phone layouts hold at 320px.
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

### Phone

- Design for 390px wide, and make everything fit at 320px, the narrowest phone still in use.
- Truncate long names.
- Let buttons wrap to a new line. Don't shrink their text: a label too small to read is worse than a taller button.
- Use at most 4 segments in a segmented control. When they don't fit, show only their icons, with the label kept as the accessible name.
- Scroll tabs horizontally when they don't fit ([Tabs](../../packages/ui/src/components/tabs/tabs.md)).
- The composer and the message actions on a touch screen are in [Conversation](./conversation.md#the-composer).

## Related

- [Spacing](../foundations/spacing.md): widths and header heights.
- [Navigation](./navigation.md): Back and the tab bar.
