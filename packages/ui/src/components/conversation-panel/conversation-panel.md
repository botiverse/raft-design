---
title: ConversationPanel
summary: The main-area panel for one conversation — a panel header, an optional row of tabs, the message list and the composer.
status: stable
aliases: [Channel panel]
category: layout
related: [panel, thread-panel, tabs, composer, message-item]
---

# ConversationPanel

ConversationPanel lays out one conversation in the desktop main area: a channel or a direct message. It is a [Panel](../panel/panel.md) with a `PanelHeader`, an optional row of tabs under it, the message list and the composer.

```example
conversation-panel/compositions/conversation-panel
```

## When to use

| Situation                                           | Use                                                 |
| --------------------------------------------------- | --------------------------------------------------- |
| A channel or a direct message in the main area      | ConversationPanel                                   |
| The replies to one message, beside the conversation | [ThreadPanel](../thread-panel/thread-panel.md)      |
| Tasks, files or a profile beside the conversation   | A [Panel](../panel/panel.md) with `edge="attached"` |
| Any other column of the main area                   | [Panel](../panel/panel.md)                          |

## Anatomy

- `ConversationPanelRoot`: the panel. It is a `Panel` with `edge="inset"` by default.
- A `PanelHeader`: the conversation's location tile or avatar, its name, its description and its actions. Its parts and rules are in [Panel](../panel/panel.md).
- `ConversationPanelContent`: everything under the header.
  - `ConversationPanelTabs`: an optional row of [Tabs](../tabs/tabs.md), with a `line-seam` under it.
  - `ConversationPanelBody`: the scroll boundary for the message list.
  - `ConversationPanelFooter`: the composer ([Composer](../composer/composer.md)).
- `ConversationPanelEmptyState`, with `ConversationPanelEmptyStateBrand` and `ConversationPanelEmptyStateBrandMark`: the panel's content when no conversation is open.

## Variants

A place can hold several kinds of content, such as a channel's chat, tasks and files. They are one row of sticker tabs in `ConversationPanelTabs`, under the header ([Navigation](../../../../../design/patterns/navigation.md#several-views-of-one-place)). Leave the row out when the place has only one view, such as a thread.

## Behavior

- The header, the tabs and the composer stay in place; the message list is the only part that scrolls.
- The row of tabs scrolls sideways on its own when the tabs don't fit ([Tabs](../tabs/tabs.md#behavior)).
- On a phone, the conversation is a pushed page: its header is the top bar, with Back ([Responsive layout](../../../../../design/patterns/responsive.md)).

## Accessibility

- `ConversationPanelRoot` renders a `section`. Name it after the conversation with `aria-label` or `aria-labelledby`.
- Name the row of tabs after the conversation as well (`aria-label="launch-week"` on the `TabsList`).
- The header's buttons and the composer's field need their own names; see [Panel](../panel/panel.md#accessibility) and [Composer](../composer/composer.md).

## Rules

- Put the row of tabs directly under the header, outside the scrolling message list.
- Start the first tab on the header's edge: 20px on desktop and 16px on a phone, the same margin as the header's first element and the message avatar column ([Page structure](../../../../../design/patterns/page-structure.md#one-edge-per-column)). `ConversationPanelTabs` sets this margin.
