---
title: ThreadPanel
summary: The side panel for one thread — a header that names it, the original message, the replies and a composer, with no tabs.
status: stable
aliases: [Thread]
category: layout
related: [panel, conversation-panel, message-replies, composer]
---

# ThreadPanel

ThreadPanel shows the replies to one message beside the conversation it belongs to. It is not a narrower conversation panel: its header names the thread and where it is, the original message comes first, and it has no tabs.

```example
thread-panel/thread-panel
```

## When to use

| Situation                                                | Use                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------------- |
| The replies to one message, read beside the conversation | ThreadPanel                                                      |
| The conversation itself                                  | [ConversationPanel](../conversation-panel/conversation-panel.md) |
| Tasks, files or a profile beside the conversation        | A [Panel](../panel/panel.md) with `edge="attached"`              |
| How a thread is reached from a message                   | [MessageReplies](../message-replies/message-replies.md)          |

## Anatomy

- `ThreadPanelRoot`: the panel. It is a `Panel` with `edge="attached"`, so it draws its own left seam.
- `ThreadPanelHeader`: the 56px header, built on `PanelHeaderRoot`.
  - `ThreadPanelTitle`: the title, "Thread", followed by `ThreadPanelTitleMeta` for where the thread is.
  - `ThreadPanelActions`: `PanelAction` buttons. The last one is the × ([Navigation](../../../../../design/patterns/navigation.md#closing)).
- `ThreadPanelContent`: everything under the header.
  - `ThreadPanelSearch`, with `ThreadPanelSearchTrailing` and `ThreadPanelSearchCount`: an optional row for searching within the thread.
  - `ThreadPanelOriginalMessage`: the message the thread replies to, with a hairline under it.
  - `ThreadPanelBody`: the scrolling replies. `ThreadPanelReplySummary` and `ThreadPanelReplyCount` head the list of replies.
  - `ThreadPanelFooter`: the composer ([Composer](../composer/composer.md)).

## Behavior

- A thread and a profile can be open together: a profile opened from the thread sits beside it, and a profile opened from the conversation replaces it ([Page structure](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)).
- Its width is in [Spacing](../../../../../design/foundations/spacing.md#layout-widths). When it sits beside the conversation and when it covers it is the product's rule ([Raft Chat](../../../../../design/products/raft-chat/README.md)).
- On a phone the thread covers the conversation, with Back instead of the ×. It is the same panel, not a pushed page, and the tab bar is already hidden by the conversation ([Responsive layout](../../../../../design/patterns/responsive.md)). On desktop it covers the conversation the same way when there isn't room beside it.

## Content

- Title the panel "Thread".
- Say in the header where the thread is and how many replies it has: "#launch-week · 3 replies".

## Accessibility

- `ThreadPanelRoot` renders a `section`. Name it with `aria-label="Thread"`.
- `ThreadPanelTitle` renders an `h2`.
- Give every icon-only action an `aria-label`: "Search in Thread", "Close Thread".

## Rules

- Don't add tabs to a thread. It holds the original message, the replies and the composer, nothing else.
- Leave 20px above the original message. The hover toolbar rides on a message's top edge ([MessageItem](../message-item/message-item.md)); the original message is the first item in the scroll area, so with less room the toolbar is cut off and looks pinned under the header.
- Separate the original message from the replies with a `line-hairline`, not a seam: both are content of the same panel.
