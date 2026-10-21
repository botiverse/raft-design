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
  - `MessageItemInlineStatus`: a short state after the time, such as "Translating…" while the message's translation loads. A working agent is shown by the light on its avatar, not here ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)).
- `MessageItemBody`: the text, in `text-body`. Required.
- `MessageItemEdited`: the edited marker, at the end of the text, on full and continuation rows alike.
- `MessageItemAttachments`: files and images ([MessageAttachment](../message-attachment/message-attachment.md)).
- `MessageItemEmbedded`: code blocks, action cards and link cards. A link an app previews is not a card: it is a chip in the text ([App links](#app-links)).
- `MessageItemFooter`: one row: the reactions (`MessageReactionChip`, with `MessageReactionAddButton` last), then the saved and read markers (`MessageItemSavedIndicator`, `MessageItemReadReceipt`). The tasks created from the message are not in it: they are a list above it ([Tasks in a conversation](../../../../../design/patterns/tasks.md#tasks-in-a-conversation)).
- `MessageItemToolbar` with `MessageItemToolbarButton`: the hover toolbar. It sets `--mi-toolbar-width` on its row as it shows, which the header's fade under it reads. Earlier versions read a `--mi-toolbar-reserve` from the app to keep room in the header; it is now ignored, so remove it where you set it.
- `MessageMultiSelectCheckbox` and `MessageMultiSelectToolbar`, with its actions in `MessageMultiSelectToolbarActions` (28px buttons 4px apart; on a touch screen each takes a 44px tap, and reaches only half the gap toward its neighbour, so a tap between two lands on the nearer): selecting several messages ([Built from existing parts](../../../../../design/components/overview.md#toolbar-for-selected-messages)).
- `MessageTextSelectionToolbar` with `MessageTextSelectionToolbarButton` and `MessageTextSelectionToolbarSeparator`: actions on selected text ([Toolbar for selected text](#toolbar-for-selected-text)); `createMessageTextSelectionAnchor` places it.

### In the body

| Element                                         | Part                                                               | Looks                                                                                                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A mention of someone else                       | `MessageReferenceText`                                             | Ink, bold, underlined in ink on hover ([Conversation](../../../../../design/patterns/conversation.md#mentions))                                                           |
| A mention of the person reading; a search hit   | `MessageReferenceText variant="primary"`; `MessageItemSearchMatch` | A small yellow sticker                                                                                                                                                    |
| A reference chip                                | `MessageReferenceChip`                                             | `variant="accent"` for a channel or direct message, `variant="info"` for a thread or message ([Navigation](../../../../../design/patterns/navigation.md#going-somewhere)) |
| A link an app previews                          | `MessageReferenceChip variant="info" capped`                       | A cyan chip with the app's icon and its title ([App links](#app-links))                                                                                                   |
| A reference that is loading or can't be opened  | `MessageReferencePending`, `MessageReferenceUnavailable`           | A gray chip on `inactive-soft`                                                                                                                                            |
| A note after a reference chip's label           | `MessageReferenceSuffix`                                           | Muted Space Mono, such as `msg` on a link to a message                                                                                                                    |
| A mention of an agent that has read the message | `MessageReferenceReadMark`, last inside the mention                | A muted check after the name ([Read receipts on a mention](#read-receipts-on-a-mention))                                                                                  |
| A web link                                      | Markdown link                                                      | `foreground-link`, underlined at rest ([Markdown](../markdown/markdown.md))                                                                                               |
| A task number                                   | `TaskChip` or Space Mono text                                      | [Tasks](../tasks/tasks.md)                                                                                                                                                |
| Inline code                                     | [InlineCode](../inline-code/inline-code.md)                        | Space Mono on `fill-muted`                                                                                                                                                |
| A quote                                         | Markdown blockquote                                                | A 2px bar on the left, `foreground-muted` text                                                                                                                            |
| A code block                                    | [CodeBlock](../code-block/code-block.md)                           | `layer-code` with a hairline                                                                                                                                              |

```example
message-reference/compositions/mixed-long-message
```

### Chips in running text

The marks in a message's text are of two kinds:

- **Chips** have a fill: a reference chip (`MessageReferenceChip` in any variant, `MessageReferencePending`, `MessageReferenceUnavailable`), the yellow sticker (`MessageReferenceText variant="primary"`: a mention of the person reading, or a message or an app shown as one) and a task in the text (`TaskChip variant="inline"`). All of them share one box.
- **Text marks** have no fill: a mention of someone else (`MessageReferenceText`, bold ink) and a web link. They are words of the sentence, in its size.

| Part         | The chip box                                                                                                                                                                               | Desktop (body 14/22) | Phone (body 16/24)  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- | ------------------- |
| Type         | 0.875em of the sentence, semibold                                                                                                                                                          | 12.25px              | 14px                |
| Height       | The body line less 2px: the line box of the chip's text, with no padding above or below                                                                                                    | 20px                 | 22px                |
| Alignment    | The chip's words on the sentence's baseline, a leading mark centered on the chip ([Marks in running text](../../../../../design/foundations/alignment.md#marks-in-running-text))           | The line stays 22px  | The line stays 24px |
| Sides        | 6px at each end; 4.5px at each end with a leading mark ([Alignment](../../../../../design/foundations/alignment.md#chips): ink equally far in at both ends), the mark then 4px to the text | 6px, or 4.5px        | 6px, or 4.5px       |
| Leading mark | A 14px icon (an svg, or an app's image in `MessageReferenceIcon`), the loading spinner or a task's 10px status pixel, each in its own box, centered on the chip                            | 14px, 9.5px or 10px  | 14px, 9.5px or 10px |
| Note         | A note after the label (`MessageReferenceSuffix`), 4px after it                                                                                                                            | 4px                  | 4px                 |
| Corners      | `radius-sticker`                                                                                                                                                                           | 4px                  | 4px                 |

The chip's type is a share of the sentence's and its height a step below the sentence's line, so a chip is always 2px shorter than its line. However many chips a line holds, it keeps its height, and chips on two lines keep at least 2px between them; on a phone the body is larger and the chips grow with it. Before, a reference chip was its 20px line plus 1px above and below, 22px, which made a desktop line 23px, and a task chip and the sticker took the sentence's own size on a 1.2em line: boxes 5px shorter than a reference chip's, with letters 2px larger.

- The yellow sticker keeps its 1.5px ink edge inside and has no die-cut edge outside ([Dark mode](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)), so it is the size of the chips beside it.
- The height follows `--text-body--line-height`. Chips set in text on another line take that line less 2px from `--chip-line-height`, set on a container. Nothing sets it yet: a chip outside a message's body (the callout text of a quoted preview, for one) falls back to the body line less 2px, so set `--chip-line-height` on that container when chips appear there.
- Inline code isn't a chip: it is code, not a reference, and keeps its own box ([InlineCode](../inline-code/inline-code.md)), 20px on a desktop and 23px on a phone, never taller than the line.

In raft-ui the three components take the box from one recipe (`lib/inline-chip.ts`).

### App links

A link that an app previews is a reference chip in the sentence, with the app's icon and the app's own title. Why it is a chip and not a card, and its loading and hover behavior, are in [Navigation](../../../../../design/patterns/navigation.md#app-links).

- `MessageReferenceChip variant="info" capped`, rendered as a link that opens in a new tab: `render={<a href="…" target="_blank" rel="noopener noreferrer" />}`.
- `MessageReferenceIcon`: the app's registered icon, an `<img alt="">` served by Raft, first in the chip. It is 14px, centered on the chip, with 2px corners. It is a leading mark of the chip box ([Chips in running text](#chips-in-running-text)): 4.5px at each end, 4px to the label. The image is drawn to its edges, so it takes the same 4.5px as a status pixel ([Alignment](../../../../../design/foundations/alignment.md#chips)): its ink starts 4.5px from the chip's start, against about 4.8px after the last letter at the other end. Use it for any image or other non-svg icon: an `<img>` placed straight in the chip has no size of its own and sits on the text's baseline. Experimental, exported from `@botiverse/raft-ui/wip`.
- `MessageReferenceLabel`: the app's `title`, as sent. Put it in the label, not straight in the chip: only the label truncates.
- `capped` stops the chip at `min(100%, 24em)`, and the label truncates at the end. 24em of the chip's text is 294px on a desktop and 336px on a phone. In a 700px desktop message column, two full-length chips and a few words between them share a line, and three with shorter titles; on a 390px phone the line is narrower than 24em, so a long title takes one line of its own and never wraps inside the chip. Without `capped` a chip is as wide as its line, as before.
- No state: the icon is always the app's, in its own colors, and the chip is always cyan.

```example
message-reference/compositions/app-links
```

While the preview loads, the link is `MessageReferencePending capped` with a `link` icon and the address shortened to its host and path. It has the same ends, icon size and cap as the chip that replaces it, so only the icon and the words change.

```example
message-reference/compositions/app-link-pending
```

### Read receipts on a mention

When a message mentions an agent, the person who sent it wants to know whether the agent has read it. Once it has, a check follows the mention: put `MessageReferenceReadMark` last inside the `MessageReferenceText`, after the name, with the words a screen reader says as its children (`Read`). The check itself is hidden from screen readers. The part is experimental, exported from `@botiverse/raft-ui/wip` until the design is approved.

```example
message-reference/compositions/read-indicators
```

- Show nothing until the agent has read the message. A mark for "not read yet" on every new mention would be noise in each message, and the moment it changes is the one that matters.
- Say it in the mention's hover card too: "Read" or "Not read yet", so a person can check any mention, marked or not.
- On a touch screen there is no hover card, and tapping a mention opens the agent's profile, which belongs to no single message. There the check alone says it: no mark means not read yet. Don't add a long press or a popup only for this line: a gesture for one line of text is more to learn than it tells. The check's own word ("Read") still reaches a screen reader.
- The check is Lucide `check`, the size of an icon in a reference (12px beside 14px text), in `foreground-hint` with no color. It follows the name with no space of its own, so between their ink there is only the check's inset and the letter's side bearing, about 2px: the check reads as part of the mention, and the word space comes after it. A 2px margin more put its ink 4px from the name, nearly a word space, so it floated between the two words. It is centered on the letters' cap height, the line every icon in a reference centers on ([Alignment](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)), not raised like a superscript and not dropped to the x-height. Its box fits inside the line, so the mention and the line keep their height.
- The check's ink ends as far from the mention's edge as the `@` starts ([Alignment](../../../../../design/foundations/alignment.md#chips)). Lucide draws the check 3/24 inside its box, where other icons leave 1/24, about a letter's side bearing, so the mark takes the extra 2/24 back at its end.
- Don't mark it with a status light. The square light means presence and task status: lime for read is also the online light, so a read mention looked like an agent that is online ([Status](../status/status.md#presence-lights)). `MessageReferenceIndicator`, the slot at the mention's top right that held it, still renders; don't use it for a read receipt.

```example
message-reference/compositions/primary-references
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

| State                            | Look                                                                                                                                                                                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Located                          | The row on `info-soft` at once, fading out by 2s, with the `located` prop, driven by `useLocated` ([Located](../../../../../design/foundations/states.md#located)). A search match, a checked row or an open menu keeps its own fill                                           |
| Focused                          | After a jump started from the keyboard focuses the row (`tabIndex={-1}`, set by the caller), the 2px inset ring in `foreground`, square, and the toolbar; after a click, nothing. Never the browser's outline ([Located](../../../../../design/foundations/states.md#located)) |
| Search match                     | The whole row on `info-soft` while it holds a `MessageItemSearchMatch`                                                                                                                                                                                                         |
| Selected, in multi-select        | The whole row on `info-soft` while its `MessageMultiSelectCheckbox` is checked                                                                                                                                                                                                 |
| Agent working                    | A still yellow light on the avatar and the inline status ([Working agents](../../../../../design/people-and-agents/working-agents.md))                                                                                                                                         |
| Sender left, removed or deleted  | A muted badge in `MessageItemSenderBadges`; a deleted agent's avatar is grayed                                                                                                                                                                                                 |
| Sent by an assistant             | The assistant's face on the sender's avatar and "sent by Friday" after the name; the words only on a continuation row                                                                                                                                                          |
| Retracted (sent by an assistant) | Only a message an assistant sent can be retracted. A single record that can't be acted on: sender, time, both marks and its thread replies stay; the body is one line in `foreground-hint`                                                                                     |
| Reaction failed                  | The chip on `warning-soft`, with `MessageReactionErrorIndicator` announcing why                                                                                                                                                                                                |

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

Only a message an assistant sent for its owner can be retracted, by the owner. A retracted message stays in the timeline as a single record that can't be acted on:

- It keeps its sender, time, both marks (the face and "sent by Friday") and its thread replies, which people wrote and which stay readable.
- Its body is one line in `foreground-hint`, "This message was retracted.", in place of the text. It isn't the person's words: it isn't Markdown, can't be selected to quote and isn't translated.
- Its attachments, link previews, quoted messages and reactions are gone, and so are the hover toolbar (react, reply in thread, save, forward, more), the context menu and the long-press menu.
- Wherever it is quoted, the quote shows the same line, styled like an unavailable quote ([MessageQuotedPreview](../message-quoted-preview/message-quoted-preview.md)); an Activity row or a search result shows the same line as its excerpt, never the old text.

```example
message-item/compositions/delegated-retracted
```

In an Activity row or a search result there is no face; write the words into the sender: "Alice (sent by Friday)".

```example
message-item/compositions/delegated-preview
```

## Behavior

- Space messages by grouping, on the [timeline rhythm](../../../../../design/foundations/spacing.md#timeline-rhythm): 8px between the rows of one group (a continuation row sits under the row it continues) and the message step, 16px, before a new group. Every row keeps the row inset, 4px, above and below its text, and the extra 8px before a group is a transparent top border the highlight doesn't paint. The recipe reads both from the timeline tokens (`py-timeline-row`, `border-t-(length:--spacing-timeline-turn)`), so a change to the rhythm changes every row. So the hover, selected and search highlights sit evenly around the text on every row: when a continuation row had no top padding, its highlight touched the first line and left 8px under the last.
- On hover the row lays `fill-subtle` over itself, the subtle tier of every row: a message can be many lines tall and is read with the pointer resting on it, so the step is small and the text keeps its contrast ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)). It used to be lighter than other rows (3%); now a message steps like the rows and cards beside it. A message has no press: the row is not an action itself, a click selects text or lands on a link, a name or a button in it. A search-hit or selected message keeps `info-soft` on hover, and a located one doesn't answer hover while its highlight lasts.
- While one of its popups is open (its context menu, from a right-click, the toolbar's button, or press and hold on a phone), the row lays `fill-subtle` over itself, the same tier as its hover, so the two never stack. A phone has no hover, so this fill is the sign of which message the menu acts on; it stays lighter than `info-soft`, so the message doesn't look selected.
- The hover toolbar appears on hover, when focus is inside the row, and while one of its popups is open. It rides the top edge of the highlight, on the right. Focus on the row itself counts: when a jump started from the keyboard focuses the row, its toolbar shows, so a keyboard user sees the message's actions and reaches them with Tab, through the message's links and buttons.
- Hover never moves the message. The toolbar floats over the row's top right corner and nothing reflows to make room for it, so the line someone is reading stays where it was.
- The time belongs to the sender: who said it and when read as one, so the time follows the name, its badges and its role, never pushed to the far right.
- The header keeps no room for the toolbar (stdrc, 2026-10-22). At rest the sender line has the full width, so the whole name shows even in a 360px thread; while the toolbar shows, the end of a sender line long enough to reach the corner fades out under it: the header masks everything from 4px left of the toolbar's left edge to its own end, after a 12px fade, so no letter shows cut below or beside the card, which reaches only part of the line's height. `MessageItemToolbar` measures its own width onto the row (`--mi-toolbar-width`), so a toolbar with more or fewer actions masks exactly its width; nothing on the row moves. A row without a toolbar, such as on a phone, masks nothing. Keeping the room cut the name to a few letters in a narrow column all the time, to protect a corner that is covered only while the pointer is on that message; keeping it only on hover would reflow the line every time the pointer crosses a message. Slack and Discord work the same way.
- `MessageItemToolbar` measures its width as the toolbar shows, not when the row mounts. The pointer entering the row, or focus moving into it, writes the width in that event, before the frame that shows the toolbar, so the first frame already fades the right width; a popup opens from the toolbar only after one of the two, so it finds the width written. While the toolbar shows, one observer shared by the whole page watches it, so a button added while it shows is measured again; once the pointer and focus have left the row and no popup is open, it stops watching, and with no toolbar showing no observer is left. Every message renders a toolbar and only the one under the pointer or focus needs its width, so measuring on show keeps long lists cheap: a row mounts in one commit and keeps no observer of its own. Measuring every row on mount took a second commit and a ResizeObserver per row, thousands in a long channel. Until then the toolbar writes the width of five buttons (164px) onto its row when it mounts, a plain write that reads nothing, so should the toolbar ever show before it has measured itself, the row fades too much rather than too little; a row without a toolbar gets no width and masks nothing. The fade shows under exactly the conditions the toolbar shows under, so a width left on the row never fades a header without the toolbar over it: a touch screen without hover shows neither after a tap, and a tap that focuses a button inside the row shows both.
- When the sender line runs out of room, `MessageItemSenderGroup` gives way in a fixed order: the role truncates first, then the name. The badges stay whole beside the name, and the time never truncates ([When a row runs out of room](../../../../../design/patterns/responsive.md#when-a-row-runs-out-of-room)). Show the full name and role in a tooltip when they can truncate.
- `MessageItemDelegatedBy` takes its own width up to 45% of the line; past that, only the assistant's name truncates. When its words alone are wider than that ("sent by a deleted assistant" on a phone), it is as wide as its words and the sender's name gives way instead: the words never truncate and never run under the time. The sender's name keeps at least 3rem, or all of it when shorter; when even that doesn't fit (a 360px thread panel), plain words wrap onto as many lines as they need, their first line on the name's baseline, and the time stays on the first line. The words around the name never truncate: the product's spaces around the name are kept as written, and a translation with words on both sides of the name (Chinese) keeps both whole.

```example
message-item/compositions/delegated-long-names
```

- The toolbar is 36px high: 28px buttons with 16px icons, 4px from the frame and 4px apart, with its hairline drawn inside that height. It rides the top edge of the highlight and reaches 18px above it, half its height; on a group's first row the transparent 8px border takes part of that, so it reaches only 10px beyond the row. Its buttons are `MessageItemToolbarButton`, not [Button](../button/button.md). It stays this compact because it appears on every message under the pointer: at 38px it covered the sender line and was clipped above the first message.
- The toolbar keeps `radius-container`, like every popup. Its buttons are controls embedded in its frame, so they wear `radius-chip`, like the buttons in a field, the composer and a card corner ([Inside a frame](../../../../../design/foundations/shape.md#inside-a-frame)).
- Leave at least 18px above the first message of a scroll area and above the root message of a thread, so the toolbar is never clipped. A timeline that opens with a date line already has the room.
- A task row under a message opens the task. Status changes in the task's details, not from the row ([Tasks in a conversation](../../../../../design/patterns/tasks.md#tasks-in-a-conversation)).

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
- `MessageItem` is an `article` named by its sender and its time: its `aria-labelledby` points at `MessageItemSender` (or `MessageItemSenderButton`) and `MessageItemTime` (or `MessageItemContinuationTime`), whichever the row renders, with ids raft-ui generates. A screen reader that lands on a message, by a jump or by its reading keys, announces an article named "Atlas 2:20 PM" before the text: whose message it is and when, in the order the header shows them. A continuation row shows no name, so it is named by its time. A row with neither, such as a receipt card in the text column, is a plain `div`, not an article: an article with no name is announced as a bare "article", which tells a screen reader user nothing; give it `aria-label` if it should be one. Pass `aria-labelledby` or `aria-label` to name a row yourself, and `role` to change the role, on `MessageItem` or on its `render` element; a `render` function's props can't be read, so with one, pass them on `MessageItem`. An `id` you give a part is the one the row points at. A sender button's name is its visible name, so don't give it an `aria-label` of its own: the row would read that instead.
- Don't put messages in a `list` or render `MessageItem` as an `li`: `role="article"` replaces `listitem`, and a list may hold only list items. The timeline around them takes no list role ([MessageList](../message-list/message-list.md#accessibility)). Don't make it a `feed` either: a feed promises Page Down and Page Up from article to article, which the timeline doesn't implement.
- A row takes focus only when a jump started from the keyboard lands on it ([Located](../../../../../design/foundations/states.md#located)). raft-ui doesn't make the row focusable: the caller sets `tabIndex={-1}` on `MessageItem` before `focus({ preventScroll: true })`, and removes it when focus leaves, so a later click on the row doesn't take focus from the composer. It shows the inset ring then, never the browser's outline, and its toolbar; Tab goes on through the message's links and buttons, the toolbar's included. While the toolbar shows, its card covers part of the ring's top edge at the right, as it covers the highlight's: the ring still reads on the other three sides and most of the top, and moving the toolbar off the row's edge for focus alone would make it jump.
- Give every `MessageItemToolbarButton` an `aria-label` in Title Case: Reply in Thread, Add Reaction, Save. The toolbar shows on keyboard focus, so Tab reaches it.
- `MessageReactionChip` wraps Base UI `Toggle`: `aria-pressed` says whether the person reacted. Give it an `aria-label`; the drawn reaction inside is hidden ([Brand](../../../../../design/foundations/brand.md#reactions)).
- Put the reason a reaction failed in `MessageReactionErrorIndicator`, a visually hidden `role="status"`.
- `MessageTextSelectionToolbar` wraps Base UI `Toolbar`; give it an `aria-label`.
- Give `MessageMultiSelectCheckbox` a label that names the message, such as "Select message from Bugen".
- Render a reference chip that opens something as a link, through `render`; the chip is a `span` by default. An app link opens in a new tab, with `rel="noopener noreferrer"`.
- Give an app's icon in `MessageReferenceIcon` an empty `alt`: the title beside it names the link.
- Give the avatar image an empty `alt`: the name beside it already says who it is.
- `MessageItemDelegatedAvatar` is `aria-hidden`: "sent by Friday" is plain text in the header, read in its order (name, role, "sent by Friday", time). When a product names the whole row (`aria-label`), it uses the same words. `MessageItemDelegatedByButton` is a `<button>`; render it as a link through `render` when it goes to a profile page.
- While the toolbar shows, what fades out under it (the time, "sent by") can't be pointed at: the time's tooltip and `MessageItemDelegatedByButton` are reachable once the pointer leaves the toolbar, and always by keyboard, where they stay in the reading order.
- Give `MessageItemTime` and `MessageItemContinuationTime` the moment in `dateTime` (ISO 8601), and the full date and time in a tooltip. A screen reader reads the header in the order it shows: name, badges, role, time.

## Rules

- Put `MessageItemDelegatedAvatar` only on a person's avatar, never with a presence light ([Avatar](../avatar/avatar.md#rules)).
- Don't frame a message, and don't give agents a bubble color. Only what is embedded (code blocks, attachments, action cards) looks like a card.
- Put the reactions first in the footer, with the add button last.
- Put the tasks created from a message above the footer, as a list of compact rows, not as a marker in the footer ([Rows in a compact list](../../../../../design/patterns/tasks.md#rows-in-a-compact-list)).
- Show one reaction chip per emoji. Put a reaction the person added on `attention-soft`.
- Keep a chip's ink as far from its left edge as from its right ([Alignment](../../../../../design/foundations/alignment.md#chips)). A reference chip with an icon and a reaction split their padding evenly, 4.5px and 7px at each end, the same total and width as before: a Lucide icon leaves about as much space in its box as a letter beside it, and an emoji or an app's icon is drawn to its edges. The saved marker takes 5.5px before its bookmark, which is drawn 2.3px inside its box, and 6.5px after its text.
- Put a note after a reference chip's label in `MessageReferenceSuffix`, not in a span of your own. It stays on the label's baseline in the layout and is drawn a quarter of the size difference higher, so the middles of the two x-heights meet; the label stays on the sentence's baseline.
- Make a reaction chip 24px tall, with a 44px hit area ([Spacing](../../../../../design/foundations/spacing.md#hit-targets)).
