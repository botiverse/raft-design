---
title: Composites
summary: Things the product needs that are built from existing components instead of having a design of their own — task details, the lightbox, embeds, tables, date picking and more.
---

# Composites

Some things in the product have no design of their own: they are assembled from existing components. Build them as described here, without new colors, shapes or lines.

## When it applies

Whenever you need one of the things below. If what you need isn't here and no component fits, follow the six questions in [Designing a new feature](../principles/designing-a-new-feature.md#the-questions-to-ask) before adding anything.

## Structure

### Task details

A centered [Dialog](../../packages/ui/src/components/dialog/dialog.md), 960px wide: a bar with the place and the task number, the title and the description, one row of properties (Status, Assignee, Created by) in a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md), the History in a collapsed [Timeline](../../packages/ui/src/components/timeline/timeline.md), then the task's thread and a [Composer](../../packages/ui/src/components/composer/composer.md). Its size and its bar are in [Tasks](./tasks.md#structure).

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

One more small chip in the row under the message (Saved), or a short line of Space Mono text: a translation under the original, and "Read" as one status line under the last message of a direct message ([MessageTranslation](../../packages/ui/src/components/message-translation/message-translation.md)). Don't add a color for them.

```example
message-translation/compositions/translation-showcase
```

### Toolbar for selected messages

While messages are selected, a toolbar takes the composer's place at the bottom of the conversation: Select All, Cancel, Forward, Copy link, and a More menu with Generate image and Copy MD. Select Message in the message menu starts the selection; each message gets a checkbox ([MessageItem](../../packages/ui/src/components/message-item/message-item.md)).

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

- On desktop, the workspace button at the left of the web top bar opens the list as a menu under it, 256px wide ([Popover](../../packages/ui/src/components/popover/popover.md)). The strip of workspace avatars beside the button switches with one click.
- On a phone, the workspace pill opens the same list as a bottom sheet ([Drawer](../../packages/ui/src/components/drawer/drawer.md), [0007](../decisions/0007-workspace-switcher-sheet.md)). The product doesn't follow this yet: the pill opens the list as a popover under the top bar.
- Make each row the workspace tile, its name and its address in Space Mono (`/launch`). Mark the current workspace with a check and a bold name; show the unread count of the others as a pink count, or a gray count when the workspace is muted.
- Give each row a drag handle, so people can reorder the list. The strip follows the same order.
- End the list, after a separator, with Join Community (until the person has joined it), Switch or Create Server and Invite Human.

## Related

- [Choosing a component](./choosing-components.md).
- [Conversation](./conversation.md): where most of these appear.
