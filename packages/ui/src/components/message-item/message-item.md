---
title: MessageItem
summary: One message in a conversation — avatar, name, time and body, with attachments, embedded cards and a footer row — used the same way for people and agents.
status: stable
aliases: [Message]
layer: collaboration
category: messages
related:
  [
    system-message,
    message-replies,
    message-attachment,
    inline-code,
    code-block,
    message-action-card,
    composer,
  ]
---

# MessageItem

A message: the sender's avatar, name and time, then the body, with attachments, embedded cards and a footer row under it. People and agents post the same message; the pixel face and the `agent` tag say who sent it. How messages form a timeline (grouping, mentions, the hover toolbar and the menu, threads) is in [Conversation](../../../../../design/patterns/conversation.md); this page covers the message itself.

```example
message-item/compositions/item-preview
```

## When to use

| Situation                                                             | Use                                                                                     |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Something a person or an agent said                                   | MessageItem                                                                             |
| Something that happened: a date, a claim, a hand-off, a status change | An event line ([SystemMessage](../system-message/system-message.md)), not a message     |
| The replies to a message                                              | [MessageReplies](../message-replies/message-replies.md), under the message              |
| An agent needs a person's approval                                    | A [MessageActionCard](../message-action-card/message-action-card.md) inside the message |
| A message found by search, outside the conversation                   | The search result row ([Search](../search/search.md))                                   |

## Anatomy

- `MessageItem`: the row.
- `MessageItemAvatarSlot`: the 35px [Avatar](../avatar/avatar.md), with its presence light. Required on a full row.
- `MessageItemGutter` with `MessageItemContinuationTime`: replaces the avatar on a continuation row; the time appears there on hover.
- `MessageItemContent`: everything right of the avatar. Required.
- `MessageItemHeader`: one line holding, in order:
  - `MessageItemSender`, or `MessageItemSenderButton` when the name opens a profile: `text-subhead`, bold;
  - `MessageItemSenderBadges`: the `agent` tag, and sender states such as Left or Deleted;
  - `MessageItemMeta`: the sender's role, such as Product & Brand;
  - `MessageItemTime`: `text-mono-meta` in `foreground-hint`;
  - `MessageItemInlineStatus`: a short state after the time, such as "Converting…" while a message becomes a task. A working agent is shown by the light on its avatar, not here ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)).
- `MessageItemBody`: the text, in `text-body`. Required.
- `MessageItemAttachments`: files and images ([MessageAttachment](../message-attachment/message-attachment.md)).
- `MessageItemEmbedded`: code blocks, action cards and link cards.
- `MessageItemFooter`: one row: the task marker, then the reactions (`MessageReactionChip`, with `MessageReactionAddButton` last), then the saved and read markers (`MessageItemSavedIndicator`, `MessageItemReadReceipt`).
- `MessageItemToolbar` with `MessageItemToolbarButton`: the hover toolbar.
- `MessageMultiSelectCheckbox` and `MessageMultiSelectToolbar`: selecting several messages ([Built from existing parts](../../../../../design/components/overview.md#toolbar-for-selected-messages)).
- `MessageTextSelectionToolbar`: actions on selected text.

### In the body

| Element                                        | Part                                                               | Looks                                                                                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A mention of someone else                      | `MessageReferenceText`                                             | Ink, bold, underlined ([Conversation](../../../../../design/patterns/conversation.md#mentions))                                                                           |
| A mention of the person reading; a search hit  | `MessageReferenceText variant="primary"`; `MessageItemSearchMatch` | A small yellow sticker                                                                                                                                                    |
| A reference chip                               | `MessageReferenceChip`                                             | `variant="accent"` for a channel or direct message, `variant="info"` for a thread or message ([Navigation](../../../../../design/patterns/navigation.md#going-somewhere)) |
| A reference that is loading or can't be opened | `MessageReferencePending`, `MessageReferenceUnavailable`           | A gray chip on `inactive-soft`                                                                                                                                            |
| A web link                                     | Markdown link                                                      | `foreground-link`, with a 2px underline that turns pink on hover                                                                                                          |
| A task number                                  | `TaskChip` or Space Mono text                                      | [Tasks](../tasks/tasks.md)                                                                                                                                                |
| Inline code                                    | [InlineCode](../inline-code/inline-code.md)                        | Space Mono on `fill-muted`                                                                                                                                                |
| A quote                                        | Markdown blockquote                                                | A 2px bar on the left, `foreground-muted` text                                                                                                                            |
| A code block                                   | [CodeBlock](../code-block/code-block.md)                           | `layer-code` with a hairline                                                                                                                                              |

```example
message-reference/compositions/mixed-long-message
```

## Variants

| Variant   | Use for                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------- |
| Full row  | The first message of a group: avatar, header and body                                              |
| `compact` | A continuation row: the next message from the same sender on the same day, without avatar and name |

```example
message-item/compositions/consecutive
```

## States

| State                           | Look                                                                                                                                   |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Jumped to                       | The whole row on `info-soft`. raft-ui applies it when the row holds a `MessageItemSearchMatch`                                         |
| Selected, in multi-select       | The whole row on `info-soft` while its `MessageMultiSelectCheckbox` is checked                                                         |
| Agent working                   | A still yellow light on the avatar and the inline status ([Working agents](../../../../../design/people-and-agents/working-agents.md)) |
| Sender left, removed or deleted | A muted badge in `MessageItemSenderBadges`; a deleted agent's avatar is grayed                                                         |
| Reaction failed                 | The chip on `warning-soft`, with `MessageReactionErrorIndicator` announcing why                                                        |

```example
message-item/compositions/row-chrome
```

```example
message-item/compositions/sender-state
```

```example
message-item/compositions/avatar-status
```

## Behavior

- The hover toolbar appears on hover, when focus is inside the row, and while one of its popups is open. It rides the top edge of the row, on the right.
- The toolbar covers the time, so the time fades out while the toolbar shows. The header doesn't reserve space for it.
- The toolbar is 32px high: 28px buttons with 16px icons, in a 2px frame. It rides the row's top edge and reaches 16px above it, half its height. It stays this compact because it appears on every message under the pointer: at 38px it covered the sender line and was clipped above the first message.
- Leave at least 16px above the first message of a scroll area and above the root message of a thread, so the toolbar is never clipped. A timeline that opens with a date line already has the room.
- The task marker opens the task. Status changes in the task, not from the marker.

```example
message-item/compositions/toolbar
```

```example
message-item/compositions/reactions
```

## Content

- Write the continuation time as the hour and minute only, in the person's 12-hour or 24-hour format, without AM or PM: 6:35, 18:35 ([Writing](../../../../../design/content/writing.md#times)). The gutter is the avatar's 35px column, and a two-digit hour (10:35, 18:35, 36.7px in Space Mono) reaches about 2px past it into the row's padding: the time is right-aligned to the text, so that is where it belongs. Don't widen the gutter for it, because that moves every message's text off the avatar column.
- Write the role in `MessageItemMeta` in sentence case; leave it out when there is none.
- Label each reaction chip with the reaction, the count and whether the person is among them.

## Accessibility

- `MessageItem` and its parts are plain elements built with Base UI `useRender`; use `render` to change the element, such as a link on `MessageItemSenderButton`.
- Give every `MessageItemToolbarButton` an `aria-label` in Title Case: Reply in Thread, Add Reaction, Save. The toolbar shows on keyboard focus, so Tab reaches it.
- `MessageReactionChip` wraps Base UI `Toggle`: `aria-pressed` says whether the person reacted. Give it an `aria-label`; the drawn reaction inside is hidden ([Brand](../../../../../design/foundations/brand.md#reactions)).
- Put the reason a reaction failed in `MessageReactionErrorIndicator`, a visually hidden `role="status"`.
- `MessageTextSelectionToolbar` wraps Base UI `Toolbar`; give it an `aria-label`.
- Give `MessageMultiSelectCheckbox` a label that names the message, such as "Select message from Bugen".
- Render a reference chip that opens something as a link, through `render`; the chip is a `span` by default.
- Give the avatar image an empty `alt`: the name beside it already says who it is.

## Rules

- Don't frame a message, and don't give agents a bubble color. Only what is embedded (code blocks, attachments, action cards) looks like a card.
- Put the task marker first in the footer, then the reactions, with the add button last.
- Make the task marker a status chip: the status pixel, the task number and the assignee ([Tasks](../tasks/tasks.md)).
- Show one reaction chip per emoji. Put a reaction the person added on `attention-soft`.
- Make a reaction chip 24px tall, with a 44px hit area ([Spacing](../../../../../design/foundations/spacing.md#hit-targets)).
