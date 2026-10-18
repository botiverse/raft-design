---
title: MessageEmbed
summary: The card that embedded message content is built on — a header, content and footer in a hairline card — used for link cards and as the base of forwarded bundles, action cards and reply summaries.
status: stable
aliases: [Link card, Embed]
category: content
related:
  [
    message-item,
    message-attachment,
    message-forwarded-bundle,
    message-quoted-preview,
    message-action-card,
    message-replies,
  ]
---

# MessageEmbed

The card for something embedded in a message: a link card, or the base that other embedded cards build on. It has the structure of a file card ([MessageAttachment](../message-attachment/message-attachment.md)) with the header of a message ([MessageItem](../message-item/message-item.md)), and sits in `MessageItemEmbedded`, under the message body. [MessageForwardedBundle](../message-forwarded-bundle/message-forwarded-bundle.md) and [MessageActionCard](../message-action-card/message-action-card.md) render on it, and [MessageReplies](../message-replies/message-replies.md) uses its container.

## When to use

| Situation                                     | Use                                                                                                                                                      |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A link to a page, previewed under the message | MessageEmbed, as a link card                                                                                                                             |
| Messages passed on from another conversation  | [MessageForwardedBundle](../message-forwarded-bundle/message-forwarded-bundle.md)                                                                        |
| A link to one message, shown as an excerpt    | [MessageQuotedPreview](../message-quoted-preview/message-quoted-preview.md)                                                                              |
| An agent needs a person's approval            | [MessageActionCard](../message-action-card/message-action-card.md)                                                                                       |
| A file, an image or a video                   | [MessageAttachment](../message-attachment/message-attachment.md)                                                                                         |
| The replies to a message                      | [MessageReplies](../message-replies/message-replies.md)                                                                                                  |
| Code, a diagram or a Markdown table           | [CodeBlock](../code-block/code-block.md)                                                                                                                 |
| A new kind of embedded card                   | MessageEmbed as its base, not a new container ([Composites](../../../../../design/patterns/composites.md#link-cards-forwarded-messages-quoted-previews)) |

## Anatomy

- `MessageEmbed`: the card, on `layer-card` with a `line-hairline` border and `radius-container`. Required.
- `MessageEmbedHeader`: the top row, with its own padding. Holds what the card is and where it comes from.
- `MessageEmbedContent`: the body. It has no padding of its own: the content inside sets it, so an image or a list of items can run to the card's edges.
- `MessageEmbedFooter`: the bottom row, padded like the header. Holds the card's actions.

Only `MessageEmbed` is required; use the parts the content needs.

## Behavior

- The card and its parts can shrink below the width of their content, so long content wraps or truncates inside the card instead of widening the message.
- A card rendered as a link shows the focus ring on keyboard focus ([States](../../../../../design/foundations/states.md#focus)).

## Accessibility

- `MessageEmbed` and its parts are plain `div` elements built with Base UI `useRender`; use `render` to change the element.
- When the whole card opens something, render `MessageEmbed` as an `<a>` and give it an accessible name that says what opens.
- Don't put a button inside a card rendered as a link: each control must be its own element, as in [MessageAttachment](../message-attachment/message-attachment.md#accessibility).

## Rules

- Build every embedded card on MessageEmbed, without new colors, shapes or lines ([Composites](../../../../../design/patterns/composites.md)).
- Put the card in `MessageItemEmbedded`, after the body and the attachments.
