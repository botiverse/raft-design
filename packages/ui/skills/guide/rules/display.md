---
name: display
description: "Typography and display: the Text family, InlineCode vs CopyableCode vs CodeBlock, Markdown parts, DescriptionList, Avatar, FilePreview vs Files, Kbd."
---

# Text and display

## Contents

- Never write bare text
- Text vs TextHeading vs TextMono vs TextSans
- InlineCode vs CopyableCode vs CodeBlock
- Markdown and DescriptionList
- Avatar
- FilePreview vs Files
- Kbd
- Per-component norms

---

## Never write bare text

Typography is owned by the recipes. A styled `<p>` or `<span>` will not track the theme families.

**Incorrect:**

```tsx
<p className="text-sm text-gray-500">Last synced 2 minutes ago</p>
```

**Correct:**

```tsx
<Text size="small">Last synced 2 minutes ago</Text>
```

---

## Text vs TextHeading vs TextMono vs TextSans

| Component     | For                                                                       |
| ------------- | ------------------------------------------------------------------------- |
| `Text`        | body copy, labels, descriptions — the default                             |
| `TextHeading` | section and page headings, `level` `1`–`6`                                |
| `TextMono`    | values the user reads character by character                              |
| `TextSans`    | copy that must stay in the sans family where the surrounding scope is not |

**`Text` sizes** — `large` `body` `small` `caption`.

**`TextMono` sizes** — `code` `meta` `eyebrow` `tabular`.

Use `TextMono size="tabular"` for **any number that updates in place** — counts, timers, file sizes, percentages. Proportional digits change width as they change value, so the surrounding layout jitters on every tick.

```tsx
<TextMono size="tabular">{unreadCount}</TextMono>
```

Use `size="meta"` for timestamps and IDs, `size="eyebrow"` for the small label above a section.

`TextHeading` `level` sets the semantic heading level. Pick it from document structure, not from how big you want the text — size comes from the recipe.

---

## InlineCode vs CopyableCode vs CodeBlock

|                | Use                                                     |
| -------------- | ------------------------------------------------------- |
| `InlineCode`   | a token inside a sentence — a prop name, a flag, a key  |
| `CopyableCode` | a single-line command the user is meant to run or paste |
| `CodeBlock`    | multi-line code on display                              |

If the user's next move is to select the text, it should have been `CopyableCode` or `CodeBlock`.

```tsx
<CopyableCodeRoot>
  <CopyableCode truncate>{command}</CopyableCode>
  <CopyableCodeAction ariaLabel="Copy install command" />
</CopyableCodeRoot>
```

`CopyableCode` sizes are `sm` and `md`. Use `truncate` for long single-line commands, and always give `CopyableCodeAction` an `ariaLabel` that says what is being copied.

`CodeBlock` composes `CodeBlockHeader` + `CodeBlockTitle` + `CodeBlockActions` + `CodeBlockAction` above a `CodeBlockBody`. Never render a `<pre>`/`<code>` block with a hand-built header or copy button.

---

## Markdown and DescriptionList

Rendered markdown (message bodies, agent output) is styled by the `Markdown*` part set — `MarkdownParagraph`, `MarkdownHeading`, `MarkdownList` / `MarkdownOrderedList` / `MarkdownListItem`, `MarkdownInlineCode`, `MarkdownLink`, `MarkdownBlockquote`, `MarkdownTable` (with `MarkdownTableScroll`), `MarkdownImage`, `MarkdownCheckbox`, `MarkdownRule`, `MarkdownMark`. Map your markdown renderer's nodes to these parts instead of styling tags by hand.

`DescriptionList` renders term/value pairs: `DescriptionItem` wraps `DescriptionTerm` + `DescriptionDetails`, in `horizontal` or `vertical` layout. Use it for metadata blocks and detail panes instead of a hand-built two-column grid.

---

## Avatar

```tsx
<Avatar type="human" size="sm">
  <AvatarImage src={user.avatarUrl} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

- **`type` is `agent` or `human`.** This is a product-meaningful distinction in Raft and changes the treatment. Set it deliberately; do not leave it to the default when you know which it is.
- Sizes are `3xs` `2xs` `xs` `sm` `md` `lg` `xl`.
- **`AvatarFallback` is required.** Images fail, and an avatar with a broken image and no fallback renders as a hole.
- `AvatarGroup` + `AvatarGroupCount` for stacks — do not hand-build overlap with negative margins.
- `AvatarBadge` for a presence dot attached to the avatar. For a standalone state dot elsewhere, use `Status`.

---

## FilePreview vs Files

`FilePreview` renders **one** file as a tile. It has dedicated shapes rather than a type prop:

| Shape                 | For                |
| --------------------- | ------------------ |
| `FilePreviewMedia`    | images and video   |
| `FilePreviewDocument` | PDFs and documents |
| `FilePreviewCode`     | source files       |
| `FilePreviewFile`     | anything else      |

Pick the shape by what the file is. `FilePreviewBadge` labels the format.

`Files` renders a **list** surface: `FilesPanel`, `FilesViewport`, `FilesList`, and per-row `FileRow`, `FileThumbnail`, `FileContent`, `FileName`, `FileMeta`, `FileMetaItem`, `FileActions`, `FileAction`, `FileRowOpen`, `FileImage`.

Use `FilePreview` for attachments inside a composer or message; use `Files` for a browsable file list.

---

## Kbd

```tsx
<KbdGroup>
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
```

One key per `Kbd`. `KbdGroup` wraps a combination. Do not write `<Kbd>⌘K</Kbd>` — the group handles the spacing and separators.

Inside menus, use `DropdownMenuShortcut` / `ContextMenuShortcut` instead of `Kbd`; they handle the right alignment within the row.

---

## Per-component norms

**`Separator`** — the only divider. Never `<hr>`, never a `border-t` div. It takes an orientation.

**`ScrollArea`** — use when you need styled scrollbars or a scroll region inside a panel. Compose `ScrollAreaViewport` + `ScrollAreaContent` + `ScrollAreaScrollbar` + `ScrollAreaThumb`, and `ScrollAreaCorner` when both axes scroll. Plain `overflow-auto` is fine for full-page scroll; `ScrollArea` is for bounded regions.

**`Badge`** and **`Status`** — see [feedback.md](./feedback.md).
