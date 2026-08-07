---
name: display
description: "Typography and display: the Text family, InlineCode vs CopyableCode vs CodeBlock, Markdown parts, DescriptionList, Avatar, FilePreview vs Files, Kbd, icons."
---

# Text and display

## Contents

- Use typography primitives for styled text
- Text.Sans vs Text.Heading vs Text.Mono
- InlineCode vs CopyableCode vs CodeBlock
- Markdown and DescriptionList
- Avatar
- FilePreview vs file-list parts
- Kbd
- Icons
- Per-component norms

---

## Use typography primitives for styled text

Use the `Text` namespace when standalone copy needs raft-ui typography. Keep native text elements when their semantics and inherited styles are intentional.

**Incorrect:**

```tsx
<p className="text-sm text-gray-500">Last synced 2 minutes ago</p>
```

**Correct:**

```tsx
<Text.Sans size="small">Last synced 2 minutes ago</Text.Sans>
```

---

## Text.Sans vs Text.Heading vs Text.Mono

| Component      | For                                                   |
| -------------- | ----------------------------------------------------- |
| `Text.Sans`    | body copy, labels, and descriptions                   |
| `Text.Heading` | section and page headings; `level` is `1` through `6` |
| `Text.Mono`    | code-like values, metadata, and tabular numbers       |

Prefer the namespace used by the canonical compositions. The equivalent named exports `TextSans`, `TextHeading`, and `TextMono` also exist.

**`Text.Sans` sizes** — `large` `body` `small` `caption`.

**`Text.Mono` sizes** — `code` `meta` `eyebrow` `tabular`.

Use `Text.Mono size="tabular"` for numbers that update in place — counts, timers, file sizes, and percentages. Proportional digits can change width and make the surrounding layout jitter.

```tsx
<Text.Mono size="tabular">{unreadCount}</Text.Mono>
```

Use `size="meta"` for timestamps and IDs, `size="eyebrow"` for the small label above a section.

`Text.Heading` `level` selects both the heading element and its recipe size. Pick it from document structure. Use `render` only when the surrounding document requires a different element.

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
  <CopyableCodeAction aria-label="Copy install command" />
</CopyableCodeRoot>
```

`CopyableCodeRoot` sizes are `sm` and `md`. Use `truncate` on `CopyableCode` for long single-line commands, and give `CopyableCodeAction` an `aria-label` that says what is being copied. When you omit it, the label swaps between `Copy code` and `Copied code`.

Compose a titled block with `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockActions`, and `CodeBlockAction` above `CodeBlockBody`. In a block without a header, place `CodeBlockActions` inside `CodeBlockBody`. Render the complete `<pre><code>…</code></pre>` as body content.

---

## Markdown and DescriptionList

Rendered markdown is styled by the `Markdown*` part set. Map paragraphs, headings, lists, links, blockquotes, code, tables, images, task checkboxes, rules, and marks to the matching exported parts. Wrap wide tables in `MarkdownTableScroll`, and compose `MarkdownTable`, `MarkdownTableRow`, `MarkdownHeaderCell`, and `MarkdownCell`.

`DescriptionList` renders term/value pairs. Wrap `DescriptionTerm` and `DescriptionDetails` in `DescriptionItem`, and set `direction="horizontal"` or `direction="vertical"`.

---

## Avatar

```tsx
<Avatar type="human" size="sm">
  <AvatarImage src={user.avatarUrl} />
  <AvatarFallback>{initials}</AvatarFallback>
</Avatar>
```

- Pass the required `type` and `size` props. **`type` is `agent` or `human`** and changes the treatment.
- Sizes are `3xs` `2xs` `xs` `sm` `md` `lg` `xl`.
- Include `AvatarFallback` whenever you include `AvatarImage`. When `Avatar` has no children, it renders its built-in fallback automatically.
- Use `AvatarGroup` and `AvatarGroupCount` for stacks. Pass the required avatar `size` to `AvatarGroupCount`.
- `AvatarBadge` for a presence dot attached to the avatar. For a standalone state dot elsewhere, use `Status`.

---

## FilePreview vs file-list parts

`FilePreview` renders **one** file as a tile. It has dedicated shapes rather than a type prop:

| Shape                 | For                |
| --------------------- | ------------------ |
| `FilePreviewMedia`    | images and video   |
| `FilePreviewDocument` | PDFs and documents |
| `FilePreviewCode`     | source files       |
| `FilePreviewFile`     | anything else      |

Pick the shape by what the file is. `FilePreviewBadge` labels the format.

The file-list parts render a **list** surface: `FilesPanel`, `FilesViewport`, `FilesList`, and per-row `FileRow`, `FileThumbnail`, `FileContent`, `FileName`, `FileMeta`, `FileMetaItem`, `FileActions`, `FileAction`, `FileRowOpen`, `FileImage`. There is no `Files` root component.

Use `FilePreview` for attachments inside a composer or message; compose the file-list parts for a browsable list.

---

## Kbd

```tsx
<KbdGroup aria-label="Command K">
  <Kbd>⌘</Kbd>
  <Kbd>K</Kbd>
</KbdGroup>
```

Render one key per `Kbd`. Use `KbdGroup` to apply spacing to a key combination. Add any visible separator as explicit content when the shortcut notation requires one.

Inside menus, use `DropdownMenuShortcut` / `ContextMenuShortcut` instead of `Kbd`; they handle the right alignment within the row.

---

## Icons

Raft-ui's internal recipes and canonical compositions are tuned to Lucide SVGs, but raft-ui does not re-export icons. When application code imports Lucide icons, declare `lucide-react` as a direct application dependency rather than relying on raft-ui's transitive dependency. A consumer may provide another SVG icon set when it preserves the component's expected sizing and stroke treatment.

Let raft-ui components own their icons' default treatment. Buttons, menu items, sidebar items, toasts, and tabs apply recipe-specific sizing and sometimes theme-specific stroke widths. Override those values only when the component's API or a deliberate one-off treatment requires it.

**Incorrect:**

```tsx
<Button size="icon-sm">
  <SearchIcon className="size-4 stroke-2" />
</Button>
```

**Correct:**

```tsx
<Button size="icon-sm">
  <SearchIcon />
</Button>
```

In your own markup — outside any icon-owning component — size icons explicitly (`className="size-4"`).

---

## Per-component norms

**`Separator`** — use it when a divider needs raft-ui's themed visual contract or orientation behavior. Native `<hr>` remains valid when its semantics and inherited styling are intentional; avoid imitating `Separator` with an ad hoc border div.

**`ScrollArea`** — use when you need styled scrollbars or a scroll region inside a panel. Compose `ScrollAreaViewport` + `ScrollAreaContent` + `ScrollAreaScrollbar` + `ScrollAreaThumb`, and `ScrollAreaCorner` when both axes scroll. Plain `overflow-auto` is fine for full-page scroll; `ScrollArea` is for bounded regions.

**`Badge`** and **`Status`** — see [feedback.md](./feedback.md).
