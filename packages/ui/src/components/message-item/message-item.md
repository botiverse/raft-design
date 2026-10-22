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
  - `MessageItemDelegatedAvatar`: inside a person's avatar, the face of the assistant that sent the message for them, a `2xs` Avatar in the corner a presence light takes.
- `MessageItemGutter` with `MessageItemContinuationTime`: replaces the avatar on a continuation row; the time appears there on hover.
- `MessageItemContent`: everything right of the avatar. Required.
- `MessageItemHeader`: one line holding, in order, with every part's letters on the name's baseline ([Text of different sizes on one line](../../../../../design/foundations/alignment.md#text-of-different-sizes-on-one-line)):
  - `MessageItemSenderGroup`: who sent it, which gives way in a fixed order when the line runs out of room ([Behavior](#behavior)). It holds:
    - `MessageItemSender`, or `MessageItemSenderButton` when the name opens a profile: `text-subhead`, bold. Only the button underlines on hover ([Clickable text](../../../../../design/foundations/states.md#clickable-text));
    - `MessageItemSenderBadges`: the `agent` tag, and sender states such as Left or Deleted;
    - `MessageItemMeta`: the sender's role, such as Product & Brand;
  - `MessageItemDelegatedBy`: "sent by Friday" when an assistant sent the message for the sender, with the assistant's name in `MessageItemDelegatedByName`, or `MessageItemDelegatedByButton` when it opens the assistant's profile;
  - `MessageItemTime`: right after the sender, `text-mono-meta` in `foreground-hint`. A `<time>`: pass the moment in `dateTime`;
  - `MessageItemInlineStatus`: a short state after the time, such as "Converting…" while a message becomes a task. A working agent is shown by the light on its avatar, not here ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)).
- `MessageItemBody`: the text, in `text-body`. Required.
- `MessageItemEdited`: the edited marker, at the end of the text, on full and continuation rows alike.
- `MessageItemAttachments`: files and images ([MessageAttachment](../message-attachment/message-attachment.md)).
- `MessageItemEmbedded`: code blocks, action cards and link cards.
- `MessageItemFooter`: one row: the task marker, then the reactions (`MessageReactionChip`, with `MessageReactionAddButton` last), then the saved and read markers (`MessageItemSavedIndicator`, `MessageItemReadReceipt`).
- `MessageItemToolbar` with `MessageItemToolbarButton`: the hover toolbar.
- `MessageMultiSelectCheckbox` and `MessageMultiSelectToolbar`, with its actions in `MessageMultiSelectToolbarActions` (28px buttons 4px apart; on a touch screen each takes a 44px tap, and reaches only half the gap toward its neighbour, so a tap between two lands on the nearer): selecting several messages ([Built from existing parts](../../../../../design/components/overview.md#toolbar-for-selected-messages)).
- `MessageTextSelectionToolbar` with `MessageTextSelectionToolbarButton` and `MessageTextSelectionToolbarSeparator`: actions on selected text ([Toolbar for selected text](#toolbar-for-selected-text)); `createMessageTextSelectionAnchor` places it.

### In the body

| Element                                        | Part                                                               | Looks                                                                                                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A mention of someone else                      | `MessageReferenceText`                                             | Ink, bold, underlined in ink on hover ([Conversation](../../../../../design/patterns/conversation.md#mentions))                                                           |
| A mention of the person reading; a search hit  | `MessageReferenceText variant="primary"`; `MessageItemSearchMatch` | A small yellow sticker                                                                                                                                                    |
| A reference chip                               | `MessageReferenceChip`                                             | `variant="accent"` for a channel or direct message, `variant="info"` for a thread or message ([Navigation](../../../../../design/patterns/navigation.md#going-somewhere)) |
| A reference that is loading or can't be opened | `MessageReferencePending`, `MessageReferenceUnavailable`           | A gray chip on `inactive-soft`                                                                                                                                            |
| A note after a reference chip's label          | `MessageReferenceSuffix`                                           | Muted Space Mono, such as `msg` on a link to a message                                                                                                                    |
| A web link                                     | Markdown link                                                      | `foreground-link`, underlined at rest ([Markdown](../markdown/markdown.md))                                                                                               |
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
| Sent by an assistant            | The assistant's face on the sender's avatar and "sent by Friday" after the name; the words only on a continuation row                  |
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

### Sent by an assistant

A person's assistant can send a message as that person: the message is theirs, and two marks say the assistant sent it ([Identity and presence](../../../../../design/people-and-agents/identity-and-presence.md#sent-by-an-assistant)). The parts are experimental, exported from `@botiverse/raft-ui/wip` until the design is approved: `MessageItemDelegatedAvatar`, `MessageItemDelegatedBy`, `MessageItemDelegatedByName` and `MessageItemDelegatedByButton`. Put `MessageItemDelegatedAvatar` in the sender's `md` Avatar, with the assistant's `2xs` Avatar in it, and `MessageItemDelegatedBy` after `MessageItemSenderGroup`; keep the sender in the group, which holds its 3rem. On a continuation row, put `MessageItemDelegatedBy` at the end of the text, as with `MessageItemEdited`, without the face. Such a message starts its own group ([Conversation](../../../../../design/patterns/conversation.md#dates-and-grouping)).

```example
message-item/compositions/delegated-group
```

```example
message-item/compositions/delegated-thread
```

When the assistant has been deleted, keep both marks: the default face in `MessageItemDelegatedAvatar deleted`, which grays and fades it over the row's surface, and "sent by a deleted assistant" as plain words in `MessageItemDelegatedBy`, without a name part, so none of it truncates or opens anything:

```example
message-item/compositions/delegated-deleted
```

In an Activity row or a search result there is no face; write the words into the sender: "Alice (sent by Friday)".

```example
message-item/compositions/delegated-preview
```

## Behavior

- Space messages by grouping, on the [timeline rhythm](../../../../../design/foundations/spacing.md#timeline-rhythm): 8px between the rows of one group (a continuation row sits under the row it continues) and the message step, 16px, before a new group. Every row keeps the row inset, 4px, above and below its text, and the extra 8px before a group is a transparent top border the highlight doesn't paint. The recipe reads both from the timeline tokens (`py-timeline-row`, `border-t-(length:--spacing-timeline-turn)`), so a change to the rhythm changes every row. So the hover, selected and search highlights sit evenly around the text on every row: when a continuation row had no top padding, its highlight touched the first line and left 8px under the last.
- On hover the row lays `fill-subtle` over itself, the subtle tier of every row: a message can be many lines tall and is read with the pointer resting on it, so the step is small and the text keeps its contrast ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)). It used to be lighter than other rows (3%); now a message steps like the rows and cards beside it. A message has no press: the row is not an action itself, a click selects text or lands on a link, a name or a button in it. A jumped-to, search-hit or selected message keeps `info-soft` on hover.
- While one of its popups is open (its context menu, from a right-click, the toolbar's button, or press and hold on a phone), the row lays `fill-subtle` over itself, the same tier as its hover, so the two never stack. A phone has no hover, so this fill is the sign of which message the menu acts on; it stays lighter than `info-soft`, so the message doesn't look selected.
- The hover toolbar appears on hover, when focus is inside the row, and while one of its popups is open. It rides the top edge of the highlight, on the right.
- Hover only adds; it never takes information away. Hovering a message is the moment someone wants to know about it, so the toolbar appears in empty space instead of covering what was there.
- The time belongs to the sender: who said it and when read as one, so the time follows the name, its badges and its role, and stays there on hover. The top right corner belongs to the toolbar alone.
- With a mouse, the header ends where the toolbar begins, so the toolbar covers nothing on the sender line however long it is. The space is set by `--mi-toolbar-reserve`, sized for three buttons; a product whose toolbar has more sets it on the message list. On a touch screen there is no hover toolbar, and the header keeps its full width.
- When the sender line runs out of room, `MessageItemSenderGroup` gives way in a fixed order: the role truncates first, then the name. The badges stay whole beside the name, and the time never truncates ([When a row runs out of room](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)). Show the full name and role in a tooltip when they can truncate.
- `MessageItemDelegatedBy` takes its own width up to 45% of the line; past that, only the assistant's name truncates. When its words alone are wider than that ("sent by a deleted assistant" on a phone), it is as wide as its words and the sender's name gives way instead: the words never truncate and never run under the time. The sender's name keeps at least 3rem, or all of it when shorter; when even that doesn't fit (a 360px thread panel, with room for the toolbar), plain words wrap onto as many lines as they need, their first line on the name's baseline, and the time stays on the first line, clear of the toolbar. The words around the name never truncate: the product's spaces around the name are kept as written, and a translation with words on both sides of the name (Chinese) keeps both whole.

```example
message-item/compositions/delegated-long-names
```

- The toolbar is 36px high: 28px buttons with 16px icons, 4px from the frame and 4px apart, with its hairline drawn inside that height. It rides the top edge of the highlight and reaches 18px above it, half its height; on a group's first row the transparent 8px border takes part of that, so it reaches only 10px beyond the row. Its buttons are `MessageItemToolbarButton`, not [Button](../button/button.md). It stays this compact because it appears on every message under the pointer: at 38px it covered the sender line and was clipped above the first message.
- The toolbar keeps `radius-container`, like every popup. Its buttons are controls embedded in its frame, so they wear `radius-chip`, like the buttons in a field, the composer and a card corner ([Inside a frame](../../../../../design/foundations/shape.md#inside-a-frame)).
- Leave at least 18px above the first message of a scroll area and above the root message of a thread, so the toolbar is never clipped. A timeline that opens with a date line already has the room.
- The task marker opens the task. Status changes in the task, not from the marker.

```example
message-item/compositions/toolbar
```

```example
message-item/compositions/long-header
```

```example
message-item/compositions/reactions
```

### Toolbar for selected text

`MessageTextSelectionToolbar` floats over text the person selects in a message, with actions such as Quote and Copy. It looks exactly like the hover toolbar, so the two read as one kind of thing:

- It is 36px high: `radius-container` with its hairline drawn inside (`ring-inset`), around 28px buttons with `radius-chip`, 4px from the frame and 4px apart.
- Its buttons have text labels after 16px icons in `foreground-muted`. On hover they take the medium tier, `fill-medium`, not the `brand-soft` of a menu row: a toolbar's actions are buttons, not menu rows ([States](../../../../../design/foundations/states.md)).
- `MessageTextSelectionToolbarSeparator` is 20px high, with the toolbar's 4px on each side.
- Write labels in Title Case. They never wrap: Chinese text can break between any two characters, so a toolbar squeezed at the edge of the window broke a two-character label onto two lines.
- It anchors to the line where the selection's focus end is, where the person let go, not to the whole range: a whole-line or multi-paragraph selection spans the row, and the middle of that is nowhere near the pointer. Build the anchor with `createMessageTextSelectionAnchor(selection)` and pass it to `PopoverContent`'s `anchor`.
- It stays inside the viewport: above the line by default, it flips below when there is no room and shifts along the line near a side edge.

## Content

- Write the continuation time as the hour and minute only, in the person's 12-hour or 24-hour format, without AM or PM: 6:35, 18:35 ([Writing](../../../../../design/content/writing.md#times)). The gutter is the avatar's 35px column, and a two-digit hour (10:35, 18:35, 36.7px in Space Mono) reaches about 2px past it into the row's padding: the time is right-aligned to the text, so that is where it belongs. Don't widen the gutter for it, because that moves every message's text off the avatar column.
- Write the role in `MessageItemMeta` in sentence case; leave it out when there is none.
- Put `MessageItemEdited` inside the last paragraph of the text, so it follows the last word ("(edited)"), and give it the edit time as its tooltip. It sits in the text, not in the header, because a continuation row has no header and an edit belongs to that one message.
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
- `MessageItemDelegatedAvatar` is `aria-hidden`: "sent by Friday" is plain text in the header, read in its order (name, role, "sent by Friday", time). When a product names the whole row (`aria-label`), it uses the same words. `MessageItemDelegatedByButton` is a `<button>`; render it as a link through `render` when it goes to a profile page.
- Give `MessageItemTime` and `MessageItemContinuationTime` the moment in `dateTime` (ISO 8601), and the full date and time in a tooltip. A screen reader reads the header in the order it shows: name, badges, role, time.

## Rules

- Put `MessageItemDelegatedAvatar` only on a person's avatar, never with a presence light ([Avatar](../avatar/avatar.md#rules)).
- Don't frame a message, and don't give agents a bubble color. Only what is embedded (code blocks, attachments, action cards) looks like a card.
- Put the task marker first in the footer, then the reactions, with the add button last.
- Make the task marker a status chip: the status pixel, the task number and the assignee ([Tasks](../tasks/tasks.md)).
- Show one reaction chip per emoji. Put a reaction the person added on `attention-soft`.
- Keep a chip's ink as far from its left edge as from its right ([Alignment](../../../../../design/foundations/alignment.md#chips)). A reference chip with an icon and a reaction split their padding evenly, 4.5px and 7px at each end, the same total and width as before: a Lucide icon leaves about as much space in its box as a letter beside it, and an emoji or an app's icon is drawn to its edges. The saved marker takes 5.5px before its bookmark, which is drawn 2.3px inside its box, and 6.5px after its text.
- Put a note after a reference chip's label in `MessageReferenceSuffix`, not in a span of your own. It stays on the label's baseline in the layout and is drawn a quarter of the size difference higher, so the middles of the two x-heights meet; the label stays on the sentence's baseline.
- Make a reaction chip 24px tall, with a 44px hit area ([Spacing](../../../../../design/foundations/spacing.md#hit-targets)).
