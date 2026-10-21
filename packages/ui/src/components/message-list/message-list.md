---
title: MessageList
summary: The scrolling timeline of a conversation or thread, with the date lines, the notice at its start, the marker for limited history and the jump controls that float over it.
status: stable
aliases:
  [
    Message timeline,
    Date divider,
    Timeline view,
    Back to Bottom,
    Jump to bottom,
    New messages pill,
    JumpPill,
  ]
layer: collaboration
category: messages
related: [conversation-panel, thread-panel, message-item, system-message, scroll-area, button]
---

# MessageList

MessageList is the scroll container of a conversation: it holds the messages, event lines and dates in one column, newest at the bottom ([Conversation](../../../../../design/patterns/conversation.md#structure)). It sits in the body of a [ConversationPanel](../conversation-panel/conversation-panel.md) or a [ThreadPanel](../thread-panel/thread-panel.md) and is the only part of the panel that scrolls.

```example
conversation-panel/compositions/conversation-panel
```

## When to use

| Situation                                             | Use                                                                                   |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| The messages of a conversation or a thread            | MessageList                                                                           |
| One message                                           | [MessageItem](../message-item/message-item.md)                                        |
| An action that happened: a claim, a hand-off          | [SystemMessage](../system-message/system-message.md), inside the list                 |
| An agent's history of actions, outside a conversation | [Timeline](../timeline/timeline.md)                                                   |
| Any other region that scrolls                         | [ScrollArea](../scroll-area/scroll-area.md), or the panel's own `PanelScrollViewport` |

## Anatomy

- `MessageList`: the scroll container. Its props and `ref` go to the element that scrolls, so the caller can read and set the scroll position; `rootClassName` styles the outer element.
- `MessageListNotice`: a centered line in Space Mono at the start of the history, such as "Beginning of messages". `tone="faint"` (the default) sets it in `foreground-hint`, `tone="muted"` in `foreground-muted`.
- `MessageListHistoryLimited`: a small chip with a `line-hairline` outline, in Space Mono, for a history that doesn't go back to the start.
- `MessageListDateDivider`: the date between two `line-hairline` rules, in `text-mono-meta` and `foreground-hint`, drawn like an event line ([SystemMessage](../system-message/system-message.md#rules)).
- The jump controls ([Jump controls](#jump-controls)), experimental, exported from `@botiverse/raft-ui/wip`:
  - `MessageListJumpControls`: where the pills float, centered on the list's bottom edge, or its top with `side="top"`. Put it beside `MessageList`, in the same positioned parent (`ConversationPanelBody` is one).
  - `MessageListJumpPill`: one pill, a Button at `outline` and `md` built from the Button recipe: its icon, then its label.
  - `MessageListJumpPillGroup` with `MessageListJumpPillDismiss`: a pill with a dismiss button joined to its end on one shared edge, like a split button. The dismiss button has a 16px icon in `foreground-muted` and no edge of its own on the pill's side.

## Behavior

- The list only scrolls up and down. Wide content, such as a long line of code or a row of tabs, scrolls inside its own container and never widens the messages.
- On desktop the list is a [ScrollArea](../scroll-area/scroll-area.md): its thin scrollbar shows only while the list scrolls.
- Below 768px it uses the panel's native scrolling, without the drawn scrollbar ([Responsive layout](../../../../../design/patterns/responsive.md)).
- Scrolling reaches the end of the list and stops; it doesn't scroll the page behind it.
- MessageList renders every message it is given and doesn't load older ones. For a history too long to keep in the DOM, use [VirtualList](../virtual-list/virtual-list.md), which renders the rows in view and keeps them still while older rows load above; loading them stays in the product.

## Jump controls

When the person has scrolled away from the end, or there is somewhere to go that is out of view, a pill floats over the list and takes them there.

```example
message-list/compositions/back-to-bottom
```

```example
message-list/compositions/new-messages
```

```example
message-list/compositions/next-unread-thread
```

On a phone two pills rarely fit in one row. They stack, 12px apart so their hit areas don't overlap, with the first one nearest the edge:

```example
message-list/compositions/phone
```

- Show Back to Bottom while the end of the conversation is out of view; when messages arrived since the person scrolled away, the same pill says how many: "3 New Messages". Remove it once the end is in view again.
- Put a pill that goes to something further down at the bottom, after Back to Bottom: "Next Unread Thread (3)". Put one that goes up, "Earliest Unread Thread (3)", alone at the top.
- Show at most two pills at the bottom and one at the top. A third destination waits until one of them is gone: more than two pills cover the messages they are meant to reach.
- Give a pill a dismiss button only when the person may not want to go where it points (unread threads), never Back to Bottom. A dismissed pill stays away until its count changes.
- Write the label in Title Case, as on any button, with the count in it: "3 New Messages", "Next Unread Thread (3)".

### How they look

A pill is one action, so it is a Button, at the size of the ordinary buttons around Raft (Save in a settings row): `outline` at `md`, with the label in `text-control` at 700, a 16px icon and a 32px height ([Button](../button/button.md#sizes)). It is built from the Button recipe, so it can't drift from it. How it sits with the other controls that float in a conversation is in [Conversation](../../../../../design/patterns/conversation.md#floating-controls).

- Float the controls 12px from the edge of the list, centered, with 8px between pills. At the bottom they rise by `--message-list-bottom-inset`, which the product sets to the height of whatever else floats on that edge (the line of who is about to post, [Working agents](../../../../../design/people-and-agents/working-agents.md#who-is-about-to-post)), so a pill never covers it.
- Draw no shadow. A pill is a control, marked by its ink edge on `layer-card`, and the opaque card keeps it readable over the messages that pass under it ([Elevation](../../../../../design/foundations/elevation.md#floating-controls)).
- Make a pill appear and disappear without animation, and replace its count without rolling the digits ([Motion](../../../../../design/foundations/motion.md)): it doesn't come from anywhere, and a pill that slides draws the eye from the messages each time someone scrolls.
- Keep `MessageListJumpControls` mounted and change only what is in it, or hide it with `hidden`. Adding and removing the list's sibling while someone scrolls makes WebKit restyle the whole list.
- Every pill and the dismiss button keep a 44px hit area, which reaches past the 12px edge only by 6px.

## Content

- Write the notice in sentence case and say what it is the start of: "Beginning of messages", "Beginning of replies".

## Accessibility

- MessageList renders plain elements and adds no role or live region. Name the panel around it after the conversation ([ConversationPanel](../conversation-panel/conversation-panel.md#accessibility)).
- The notice, the date lines and the history marker are text, not controls.
- Put the date in `MessageListDateDivider` in a `<time>` element with `dateTime`, as for an event line's time ([SystemMessage](../system-message/system-message.md#accessibility)).
- The jump pills are native buttons; their label is their name. Give `MessageListJumpPillDismiss` an `aria-label` in Title Case that says what it dismisses when there is more than one: "Dismiss Unread Threads".
- The pills come after the list in the DOM, so Tab reaches them after the messages, and they are not announced when they appear: they repeat what scrolling shows.

## Rules

- Leave room above the first message for its hover toolbar ([MessageItem](../message-item/message-item.md#behavior)). A list that opens with a date line already has it.
- Show one thing above the oldest loaded message: a notice while older messages load, the history marker when the history is cut short, or "Beginning of messages" once the start is reached.
