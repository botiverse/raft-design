---
title: MessageQuotedPreview
summary: A two-line excerpt of the message a link points to, with its author, place and time, shown under the message that links to it.
status: stable
aliases: [Quoted message, Message preview, Permalink preview]
layer: collaboration
category: messages
related: [message-item, message-embed, message-forwarded-bundle, skeleton, badge]
---

# MessageQuotedPreview

When a message links to another message, the quoted preview shows what that message says: its author, where it was posted, when, and the first 2 lines of its text. It sits in `MessageItemEmbedded`, under the body that holds the link ([MessageItem](../message-item/message-item.md)), and opens the quoted message.

```example
message-quoted-preview/compositions/quoted-preview
```

## When to use

| Situation                          | Use                                                                                |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| A message links to another message | MessageQuotedPreview, under the reference chip                                     |
| Several messages passed on in full | [MessageForwardedBundle](../message-forwarded-bundle/message-forwarded-bundle.md)  |
| A link to a page outside Raft      | A link card ([MessageEmbed](../message-embed/message-embed.md))                    |
| A quote typed into the message     | A Markdown blockquote ([MessageItem](../message-item/message-item.md#in-the-body)) |
| The replies to a message           | [MessageReplies](../message-replies/message-replies.md)                            |

## Anatomy

- `MessageQuotedPreview`: the preview: a 2px `line-seam` bar on the left, no fill, `foreground-muted` text. Required.
- `MessageQuotedPreviewHeader`: one line. Required.
  - `MessageQuotedPreviewAuthor`: an `xs` [Avatar](../avatar/avatar.md), `MessageQuotedPreviewAuthorName` and an optional `MessageQuotedPreviewAuthorMeta` (a role).
  - `MessageQuotedPreviewChannel`: where it was posted.
  - `MessageQuotedPreviewThread`: a thread marker. Optional.
  - `MessageQuotedPreviewTimestamp`: at the end of the line, in Space Mono.
- `MessageQuotedPreviewContent`: required.
  - `MessageQuotedPreviewText`: the excerpt, in `text-callout`, cut at 2 lines.
  - `MessageQuotedPreviewAttachments` with `MessageQuotedPreviewAttachment` chips. Optional.
- `MessageQuotedPreviewLoading` and `MessageQuotedPreviewUnavailable`: used in place of the preview while it loads, or when it can't be shown.

The bar is the same mark as a quote in a message ([Shape](../../../../../design/foundations/shape.md#stroke-widths)).

## Variants

| Variant          | Use for                                                                                         |
| ---------------- | ----------------------------------------------------------------------------------------------- |
| Channel message  | A message in a channel, with `MessageQuotedPreviewThread` when it is a reply in a thread        |
| Direct message   | A message in a direct message, with the thread marker when it is a reply in a thread            |
| Archived channel | A message in an archived channel: an Archived [Badge](../badge/badge.md) after the channel name |
| With attachments | A message with files: a chip with the count stays visible under the 2 lines of text             |

```example
message-quoted-preview/compositions/quoted-preview-message
```

```example
message-quoted-preview/compositions/quoted-preview-direct-message
```

```example
message-quoted-preview/compositions/quoted-preview-direct-message-thread
```

```example
message-quoted-preview/compositions/quoted-preview-archived-channel
```

```example
message-quoted-preview/compositions/quoted-preview-long-content
```

## States

| State       | Look                                                                                                                                               |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Loading     | `MessageQuotedPreviewLoading`, pulsing, with a [Skeleton](../skeleton/skeleton.md) of the header and 2 lines of text                               |
| Unavailable | `MessageQuotedPreviewUnavailable`: the bar and one line in `foreground-hint` that says why, when the message is deleted or the person can't see it |

```example
message-quoted-preview/compositions/quoted-preview-loading
```

```example
message-quoted-preview/compositions/quoted-preview-unavailable
```

## Behavior

- The preview fills the width of the message column.
- Text past 2 lines is cut with an ellipsis; the attachment chips stay below it.
- Selecting the preview opens the quoted message.

## Content

- Name a channel with its hash: "#launch-week".
- Name a direct message by the other person's display name, with `DirectMessageIcon` in place of the hash.
- Label the thread marker Thread.
- Write the time in Space Mono, with the day: "Today · 8:24 AM", "May 4 · 3:16 PM".
- Give the number of attachments in the chip: "2 files".
- Say why the message can't be shown: "Message unavailable" ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)).

## Accessibility

- The parts are plain elements built with Base UI `useRender`; `MessageQuotedPreview` is a `div`.
- When the preview opens the message, render it as an `<a>` with an `aria-label` that names the message and where it is: "Open quoted message in #launch-week". It shows the focus ring on keyboard focus.
- Give the author's avatar an empty `alt`: the name beside it says who it is.
- Give `MessageQuotedPreviewLoading` `aria-busy` and an `aria-label`, such as "Loading quoted message".
- Don't render `MessageQuotedPreviewUnavailable` as a link: there is nothing to open.

## Rules

- Render only the parts the quoted message has data for: leave out the thread marker, the role and the attachments when there are none.
- Give the loading skeleton the shape of the preview, so nothing jumps when it loads ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)).
