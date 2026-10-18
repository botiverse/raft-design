---
title: Composites
summary: Things the product needs that are built from existing components instead of having a design of their own — task details, the lightbox, embeds, tables, date picking and more.
---

# Composites

Some things in the product have no design of their own: they are assembled from existing components. Build them as described here, without new colors, shapes or lines.

## When it applies

Whenever you need one of the things below. If what you need isn't here and no component fits, follow the six questions in the [README](../README.md#before-you-build-something-new) before adding anything.

## Structure

### Task details

A wider [Dialog](../../packages/ui/src/components/dialog/dialog.md): the title, one row of properties (Status, Assignee, Created by) in a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md), the History in a collapsed [Timeline](../../packages/ui/src/components/timeline/timeline.md), then the task's thread and a [Composer](../../packages/ui/src/components/composer/composer.md). Its size is in [Tasks](./tasks.md).

### Image viewer

A full-screen `layer-backdrop` holding the image, previous and next, and one icon button to close ([Lightbox](../../packages/ui/src/components/lightbox/lightbox.md)).

```example
lightbox/compositions/image-lightbox-shell
```

### Link cards, forwarded messages, quoted previews

The structure of a file card ([MessageAttachment](../../packages/ui/src/components/message-attachment/message-attachment.md)) with the header of a message ([MessageItem](../../packages/ui/src/components/message-item/message-item.md)): [MessageEmbed](../../packages/ui/src/components/message-embed/message-embed.md), [MessageForwardedBundle](../../packages/ui/src/components/message-forwarded-bundle/message-forwarded-bundle.md), [MessageQuotedPreview](../../packages/ui/src/components/message-quoted-preview/message-quoted-preview.md).

```example
message-forwarded-bundle/compositions/forwarded-bundle
```

```example
message-quoted-preview/compositions/quoted-preview
```

### Diagrams and Markdown tables

The same container as a code block ([CodeBlock](../../packages/ui/src/components/code-block/code-block.md)): `layer-code`, a hairline border, `radius-container`.

### Translation, read and saved markers

One more small chip in the row under the message, or a short line of Space Mono text ([MessageTranslation](../../packages/ui/src/components/message-translation/message-translation.md)). Don't add a color for them.

```example
message-translation/compositions/translation-showcase
```

### Toolbar for selected messages

`MessageMultiSelectToolbar` at the bottom of the conversation ([MessageItem](../../packages/ui/src/components/message-item/message-item.md)).

```example
message-item/compositions/selection-showcase
```

### Resizable columns

The seam between two columns is the only line, and the drag handle sits on it ([Resizable](../../packages/ui/src/components/resizable/resizable.md)).

### Tables

Prefer a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md) or [ListRow](../../packages/ui/src/components/list-row/list-row.md) rows. When it has to be a table, such as usage or billing ([Table](../../packages/ui/src/components/table/table.md)):

- Set the header in `text-footnote`, `foreground-hint`.
- Divide rows with `line-hairline`.
- Set numbers in Space Mono, right-aligned.

### Picking a date

A column of dates inside the popup of a [Select](../../packages/ui/src/components/select/select.md), with the dates in Space Mono.

### A row of toggle buttons

A row of filters ([ToggleGroup](../../packages/ui/src/components/toggle-group/toggle-group.md)), each one selectable on its own.

```example
toggle-group/compositions/formatting
```

### Authorization (OAuth)

The structure of a [Dialog](../../packages/ui/src/components/dialog/dialog.md), with the requested permissions listed in a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md).

### Switching workspaces

- On a phone, the workspace pill opens a bottom sheet with the list ([Drawer](../../packages/ui/src/components/drawer/drawer.md)).
- On desktop, the tile at the top of the rail opens the same list as a menu next to the tile ([DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md)).
- Make each row the workspace tile, its name and its unread count, with a check on the current workspace.

## Related

- [Choosing a component](./choosing-components.md).
- [Conversation](./conversation.md): where most of these appear.
