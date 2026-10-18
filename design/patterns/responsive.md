---
title: Responsive layout
summary: The breakpoints, what each width shows, how short desktop windows shrink, and how phone layouts hold at 320px.
---

# Responsive layout

Below 768px Raft is a phone layout: top-level pages with the tab bar, everything else pushed. From 768px the desktop layout begins, and the side panel sits beside the main area once there is room for both.

## When it applies

Every screen. The regions themselves are in [Page structure](./page-structure.md). A product can add its own conditions, such as when Raft Chat's thread panel sits beside the conversation ([Raft Chat](../products/raft-chat/README.md)).

## Structure

| Width | Layout |
| --- | --- |
| Below 768px | Phone: top-level pages with the tab bar, every other page pushed. What would be a side panel (a thread, a task, a profile) is a pushed page. Task details are full screen |
| 768px to 1023px | Rail, sidebar and main area. The side panel covers the main area. Task details are a centered dialog |
| 1024px and up | The side panel (380px) sits beside the main area when the main area keeps at least 320px; otherwise it covers the main area |
| Desktop window shorter than 600px | Headers shrink from 56px to 48px, and the rail with them (its top-left corner stays square); rail items shrink from 40px to 36px; the labeled rail hides its labels |

```example
app-shell/compositions/responsive
```

## Rules

### Phone

- Design for 390px wide, and make everything fit at 320px.
- Truncate long names.
- Let buttons wrap to a new line. Don't shrink their text.
- Use at most 4 segments in a segmented control. When they don't fit, show only their icons.
- Scroll tabs horizontally when they don't fit ([Tabs](../../packages/ui/src/components/tabs/tabs.md)).
- Make Return in the composer insert a new line on a phone held upright.

## Related

- [Spacing](../foundations/spacing.md): widths and header heights.
- [Navigation](./navigation.md): Back and the tab bar.
