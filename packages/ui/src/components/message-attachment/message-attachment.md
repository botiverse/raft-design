---
title: MessageAttachment
summary: Files, images and video attached to a message — a file is a card with its name, size and an action; images and video show inline.
status: stable
aliases: [Attachment, File card]
category: content
related: [message-item, file-preview, composer, progress]
---

# MessageAttachment

What is attached to a message. A file is a card: its name, its size and one or two actions such as Download. Images show inline in a gallery, and a video shows in a player. Attachments sit under the message body, in `MessageItemAttachments` ([MessageItem](../message-item/message-item.md)).

```example
message-attachment/compositions/message-attachments-showcase
```

## When to use

| Situation                             | Use                                                                                                                    |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| A file attached to a sent message     | `MessageAttachmentCard`, in a `MessageAttachmentGroup`                                                                 |
| Images attached to a message          | `MessageImageGallery`                                                                                                  |
| A video attached to a message         | `MessageVideoPreview`                                                                                                  |
| A file waiting to be sent             | A thumbnail in the [Composer](../composer/composer.md)                                                                 |
| A file's type, as an icon             | [FilePreview](../file-preview/file-preview.md)                                                                         |
| A link to a page, a forwarded message | A link card ([Composites](../../../../../design/patterns/composites.md#link-cards-forwarded-messages-quoted-previews)) |

## Anatomy

A file card:

- `MessageAttachmentGroup`: holds the cards, at most 360px wide.
- `MessageAttachmentCard`: one file. Required.
- `MessageAttachmentTitle`: the file name. It can start with the file's type icon. Required.
- `MessageAttachmentSummary`: an optional line about the contents, with `MessageAttachmentCommentSummary` for a comment count or `MessageAttachmentDiffSummary`, `MessageAttachmentDiffAddition` and `MessageAttachmentDiffDeletion` for changed lines.
- `MessageAttachmentMeta`: the bottom line, with `MessageAttachmentMetaStart` (size and type) and `MessageAttachmentMetaEnd` (actions).
- `MessageAttachmentAction`: an icon button, such as Download or Preview.

Images: `MessageImageGallery`, its rows (`MessageImageGalleryRow`, laid out by `buildMessageImageGalleryRows`), and in each `MessageImageGalleryItem` the `MessageImageGalleryMedia`, a `MessageImageGalleryPreview` button that opens the image, an optional `MessageImageGalleryAction` and a `MessageImageGalleryOverlay` while it is pending.

Video: `MessageVideoPreview`, with `MessageVideoPreviewMedia`, `MessageVideoPreviewAction`, `MessageVideoPreviewFallback` and the `MessageVideoPreviewFailure*` parts.

## Variants

| Variant          | Use for                                                    |
| ---------------- | ---------------------------------------------------------- |
| Download         | A file people save                                         |
| Preview          | A file that opens in Raft, such as HTML or audio           |
| With a summary   | A document with comments, or a diff with its changed lines |
| With a type icon | A file whose type the name doesn't make clear              |

```example
message-attachment/compositions/file-attachments
```

```example
message-attachment/compositions/document-summaries
```

```example
message-attachment/compositions/diff-attachment
```

| Images    | Layout                                |
| --------- | ------------------------------------- |
| 1         | Keeps its own proportions             |
| 2 or more | Rows laid out from the images' shapes |

```example
message-media/compositions/image-gallery-single
```

```example
message-media/compositions/image-gallery-pair
```

```example
message-media/compositions/image-gallery-triple
```

## States

| State                 | Look                                                                                                                                                                                                                                |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Uploading             | The meta line says "Uploading · 64%", and a 4px progress track runs under the file name, inside the card and aligned with the text ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)) |
| Opening or processing | `aria-busy` on the card, and a [Spinner](../spinner/spinner.md) in place of the action                                                                                                                                              |
| Pending image         | The image dimmed under `MessageImageGalleryOverlay`                                                                                                                                                                                 |
| Failed                | A `danger-strong` border, a line that says why, and Remove or Retry                                                                                                                                                                 |

```example
message-attachment/compositions/attachment-statuses
```

```example
message-media/compositions/image-gallery-pending
```

```example
message-media/compositions/video-states
```

## Behavior

- The whole card is clickable: the file name is the link, and it covers the card. The action buttons sit above it and work on their own.
- Selecting an image opens it in the image viewer ([Composites](../../../../../design/patterns/composites.md#image-viewer)).
- The gallery's action button shows on hover and on keyboard focus.

## Content

- Show the file name as it is, on one line, truncated when it doesn't fit.
- Write the size and type in Space Mono: "2.4 MB · PDF".
- In a failure, say why and give the limit: "Larger than 25 MB. Remove it, or compress it and try again." Label the buttons Remove and Retry.
- Say what is happening while a file is busy, such as "Uploading · 64%"; don't write "Processing…" ([Writing](../../../../../design/foundations/writing.md#do-and-dont)).

## Accessibility

- Don't put a button inside the file name's `<a>`: lay the actions over the link instead, so each is its own control.
- Give every `MessageAttachmentAction` an `aria-label` with the action and the file name: "Download release-notes.pdf".
- Give the upload progress `role="progressbar"`, labeled with the file it uploads.
- Set `aria-busy` on a card while it uploads or opens.
- Give every image an `alt` that says what it shows. Give `MessageImageGalleryPreview` an `aria-label`, such as "Open onboarding-step-2.png".

## Rules

- Keep a file card at most 360px wide.
- Show images at most 360px wide, with `radius-container` and a `line-hairline` border.
