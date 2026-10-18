---
title: FilePreview
summary: A small icon that shows a file's type — a document, an archive, code or a media thumbnail — with a chip that names the type.
status: stable
aliases: [File icon]
category: content
related: [message-attachment, composer]
---

# FilePreview

A 40px icon that shows what kind of file something is: a page for a document, an archive, a code sheet, or a thumbnail of an image or video, with a small chip that names the type. It stands before a file's name wherever files are listed.

```example
file-preview/compositions/default
```

## When to use

| Situation                                  | Use                                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------------- |
| A file in the composer, before it is sent  | FilePreview, in the composer's attachment ([Composer](../composer/composer.md))  |
| A file in a list of files                  | FilePreview at the start of the row                                              |
| The type, next to a name in a line of text | `FilePreviewBadge` with `placement="inline"`                                     |
| A file attached to a sent message          | The file card ([MessageAttachment](../message-attachment/message-attachment.md)) |

## Anatomy

- `FilePreview`: the 40px box. Required.
- One drawing of the file, required:
  - `FilePreviewDocument`: a page with lines, for documents;
  - `FilePreviewCode`: a sheet of code;
  - `FilePreviewFile`: an archive or any other file;
  - `FilePreviewMedia`: a thumbnail; put the image or a video poster inside.
- `FilePreviewBadge`: the type chip. On the icon it sits at the bottom corner (`placement="corner"`); in a line of text it stands before the name (`placement="inline"`).

## Variants

| Variant  | Use for                                   |
| -------- | ----------------------------------------- |
| Document | PDF, DOCX, TXT and other documents        |
| Code     | Source files, HTML                        |
| File     | Archives and anything else                |
| Media    | Images and video, showing the file itself |

```example
file-preview/compositions/formats
```

```example
file-preview/compositions/media
```

```example
file-preview/compositions/illustrations
```

```example
file-preview/compositions/inline-badge
```

## Content

- Name documents by their extension in the badge: PDF, DOCX, TXT.
- For code, images and other files, let the drawing say the type.
- Write the extension in capitals. It is an abbreviation, not all-caps styling ([Typography](../../../../../design/foundations/typography.md#casing)).

## Accessibility

- The drawings are decorative and hidden from assistive technology. The file name next to the icon says what the file is; don't rely on the icon alone.
- The badge text is read as written.

## Rules

- Keep the type chip neutral: `fill-muted` with a hairline, Space Mono. The name beside it carries the meaning, so the type doesn't get a color.
- Don't color a file by its type: a color that means nothing is removed ([Color](../../../../../design/foundations/color.md)). Only a media thumbnail shows color, because it is the file itself.
