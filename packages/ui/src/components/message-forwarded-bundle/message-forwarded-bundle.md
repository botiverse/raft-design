---
title: MessageForwardedBundle
summary: A card under a message that holds one or more messages forwarded from another conversation, with their authors, times and attachments, folded when it runs long.
status: stable
aliases: [Forwarded message, Forwarded bundle]
layer: collaboration
category: messages
related: [message-embed, message-item, message-quoted-preview, message-attachment]
---

# MessageForwardedBundle

A card with the messages someone forwarded: a Forwarded header with the count and where they came from, then each message with its author, time, text and attachments. It is built on [MessageEmbed](../message-embed/message-embed.md) and sits in `MessageItemEmbedded`, under the body of the message that forwarded it ([MessageItem](../message-item/message-item.md)). Long bundles fold on their own.

```example
message-forwarded-bundle/compositions/forwarded-bundle
```

## When to use

| Situation                                                | Use                                                                                |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| One or more messages passed on from another conversation | MessageForwardedBundle                                                             |
| A link to one message, shown as an excerpt               | [MessageQuotedPreview](../message-quoted-preview/message-quoted-preview.md)        |
| A link to a message or a channel, inline in the text     | A reference chip ([MessageItem](../message-item/message-item.md#in-the-body))      |
| A quote typed into the message                           | A Markdown blockquote ([MessageItem](../message-item/message-item.md#in-the-body)) |

## Anatomy

- `MessageForwardedBundle`: the card. Required.
- `MessageForwardedBundleHeader`: the top row; it wraps on a narrow column. Required.
  - `MessageForwardedBundleHeaderContent`, with `MessageForwardedBundleHeaderLabel` (an icon and Forwarded) and `MessageForwardedBundleHeaderCount` (in Space Mono, `foreground-hint`).
  - The source, at the end of the row: `MessageForwardedBundleSource` when it can be opened, `MessageForwardedBundleSourceLabel` when it can't. Optional.
- `MessageForwardedBundleItems`: the list of messages, and the part that folds. Required.
- `MessageForwardedBundleItem`: one forwarded message. At least 1.
  - `MessageForwardedBundleItemMeta`: `MessageForwardedBundleItemAuthor`, then the time in Space Mono.
  - `MessageForwardedBundleItemContent`: the text. Required: the fold measures only this part.
  - `MessageForwardedBundleAttachments`: `MessageForwardedBundleAttachment` chips (`MessageForwardedBundleAttachmentName`, `MessageForwardedBundleAttachmentMeta`), and `MessageForwardedBundleGallery` with a `MessageForwardedBundleGalleryTile` per image. Optional.
- `MessageForwardedBundleFooter` with `MessageForwardedBundleFooterAction`: the action that unfolds the list. Optional.

## Variants

| Variant                                             | Use for                                                                                             |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| A few short messages                                | The common case: shown in full, with no footer                                                      |
| Long content                                        | Text beyond the fold limit: the list folds and the footer appears                                   |
| Source that opens (`MessageForwardedBundleSource`)  | A source the person can open, such as a public channel or a thread in one                           |
| Static source (`MessageForwardedBundleSourceLabel`) | A source that can't be opened, such as a preview in the composer or a message that no longer exists |
| `fullWidth`                                         | A place where the card fills the column instead of keeping its maximum width                        |

```example
message-forwarded-bundle/compositions/forwarded-bundle-compact
```

```example
message-forwarded-bundle/compositions/forwarded-bundle-long-content
```

```example
message-forwarded-bundle/compositions/forwarded-bundle-thread
```

```example
message-forwarded-bundle/compositions/forwarded-bundle-static-source
```

## Behavior

- The card is at most 544px wide, and narrower when the column is.
- By default the bundle folds itself: when the text of all items together runs past `foldLineLimit` lines (8), the list is cut at that height and fades out at the bottom over the content fade, 48px, as a mask (`mask-fade-b`), so a row's fill fades with it; a fold under 60px fades over the edge fade, 24px, so one line stays readable ([Edges fade](../../../../../design/foundations/spacing.md#edges-fade)).
- The footer shows only while the list is folded. Its action unfolds the list and folds it again; `expandedContent` is its label while unfolded.
- The bundle measures again when content arrives or the width changes. Once the person has folded or unfolded it, it stays as they left it, unless the content no longer needs folding.
- Pass `collapsed` to `MessageForwardedBundleItems` to control the fold yourself, as a detail view that shows everything does. The footer then always renders, and you label it.
- To make the footer action open a detail view instead of unfolding, call `preventDefault` in its `onClick`.
- `MessageForwardedBundleGallery` lays images in rows of 3, and 4 images as 2 rows of 2, at the sizes of a message's own gallery ([MessageAttachment](../message-attachment/message-attachment.md)). Below 360px of the gallery's own width a row of 3 is 2 across, by the card's width rather than the window's ([Switch on the region's width](../../../../../design/patterns/responsive.md#switch-on-the-regions-width)). Put it in a parent with a definite width (a block, a stretched flex or grid item, or a set width), not one that shrinks to its content (`inline-block`, `w-fit`, an absolutely positioned box or floating layer with no width, a flex item with `flex-basis: auto` and no width): as its own container it takes no width from what it holds and would collapse to nothing.

## Content

- Label the header Forwarded, and give the count in Space Mono: "3 messages".
- Write the source as "from #launch-week", with "· thread" when it is a thread.
- Show a source only when the person may see it; leave it out for a direct message, a private channel or a missing source.
- Name each author by their display name, not a handle ([Writing](../../../../../design/content/writing.md#voice)).
- Label the footer action with what it does, in Title Case: Show All 6 Messages, then Collapse.
- Give each attachment chip its file name and type: "release-notes.md · markdown".
- An attachment chip takes 5.5px before its icon and 6.5px after its text, 12px in all as before: a file icon is drawn 1.75px inside its box, so its ink and the last letter both sit about 7.2px from the edges ([Alignment](../../../../../design/foundations/alignment.md#chips)).

## Accessibility

- The parts are plain elements built with Base UI `useRender`; each `MessageForwardedBundleItem` is an `<article>`.
- `MessageForwardedBundleSource` is a `<button>`. When it navigates, render it as an `<a>` with an `aria-label` that names the place: "Open source thread in #launch-week".
- While the bundle owns the fold, `MessageForwardedBundleFooterAction` sets `aria-expanded`. With `collapsed`, set it yourself.
- Put each item's time in a `<time>` element with its `dateTime`.
- `interactive` on `MessageForwardedBundleAttachment` only adds the hover and focus look. Render the chip as a `<button>` or `<a>` that opens the file, with an `aria-label` such as "Open release-notes.md".
- Give gallery images an `alt` as in [MessageAttachment](../message-attachment/message-attachment.md#accessibility).

## Rules

- Wrap each item's text in `MessageForwardedBundleItemContent`: text outside it isn't measured, and the bundle won't fold.
- Don't render a bundle with no items.
