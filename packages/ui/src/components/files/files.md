---
title: FilesPanel
summary: The list of files shared in a place, one row per file with its type, name, size and time, which opens a preview and offers Jump to Message and Download.
status: stable
aliases: [Files, FileRow, Channel files]
category: content
related: [file-preview, message-attachment, panel, empty-state, lightbox]
---

# FilesPanel

The files panel lists the files shared in a place, such as #launch-week, newest first. Each row shows the file's type, its name, its size and when it was shared; clicking the row opens a preview, and two icon buttons jump to the message it came with and download it. It fills a side panel or a tab of a channel.

```example
files/compositions/default
```

## When to use

| Situation                                         | Use                                                                                        |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| All the files shared in a channel or conversation | FilesPanel                                                                                 |
| A file attached to one message                    | The file card ([MessageAttachment](../message-attachment/message-attachment.md))           |
| A file in the composer, before it is sent         | [FilePreview](../file-preview/file-preview.md), in the [Composer](../composer/composer.md) |
| An image or video opened from a row               | [Lightbox](../lightbox/lightbox.md)                                                        |

Where the files of a place sit on a screen (a tab, a side panel or the channel details) is in [Navigation](../../../../../design/patterns/navigation.md#several-views-of-one-place) and [Page structure](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel).

## Anatomy

- `FilesPanel`: a `section` on `layer-canvas` that fills its column. Required.
- `FilesViewport`: the scroll container. Required.
- `FilesList`: the column of rows, 8px apart.
- `FileRow`: one file, on `layer-card` with a `line-hairline` outline and `radius-container`.
  - `FileRowOpen`: the button that covers the type, name and details and opens the preview.
    - `FileThumbnail`: a 36px box for the file's [FilePreview](../file-preview/file-preview.md), or a thumbnail through `FileImage`.
    - `FileContent`: `FileName`, then `FileMeta` with one `FileMetaItem` per detail (size, time), in `text-mono-meta` and `foreground-hint`.
  - `FileActions`: the row's `FileAction` icon buttons, ghost by default.

```example
files/compositions/file-row
```

## Variants

The file's type changes only its icon: a document, code, an archive or other file, or a thumbnail of an image or video ([FilePreview](../file-preview/file-preview.md#variants)).

```example
files/compositions/file-types
```

## States

How empty, loading and failed differ is in [Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed).

- **Empty:** an [EmptyState](../empty-state/empty-state.md) in the viewport, with a paperclip icon, No files yet, and where files come from.
- **Loading:** a skeleton of rows, the same size as the rows that replace it.
- **Failed:** the error at the panel's scope, with Retry, not an empty state.
- **More to load:** the next page loads as people near the end of the list. A Load More button below the last row covers the case where scrolling can't trigger it.
- **Not available:** disable a `FileAction` or `FileRowOpen` whose action isn't available.

## Content

- Show the file name as it was uploaded, with its extension. A long name is cut off at the end of the row.
- Give the size with its unit (184 KB) and the time as people read it elsewhere (Yesterday, 4:18 PM).

## Accessibility

FilesPanel adds no Base UI primitive; its parts are a `section`, buttons and an image.

- Name `FilesPanel` with `aria-label`: Files.
- Give every `FileAction` an `aria-label` and a tooltip that say what it does: Jump to Original Message, Download File.
- `FileRowOpen` is named by the file name inside it. The type drawing is decorative ([FilePreview](../file-preview/file-preview.md#accessibility)).
- Give a thumbnail in `FileImage` an empty `alt`: the name beside it already says what the file is.

## Rules

- Make the whole row the target for the preview, and keep the actions outside `FileRowOpen` so each is its own button.
- Keep `FileAction` at its default, a ghost 32px icon button, so the row stays quiet ([Button](../button/button.md#icon-buttons)).
- Don't color a row by its file type ([FilePreview](../file-preview/file-preview.md#rules)).
