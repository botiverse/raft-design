---
title: Composer
summary: The message box at the bottom of a conversation, with the input, its tools, attachments, @ suggestions and the pink send button inside one ink border.
status: stable
aliases: []
layer: collaboration
category: messages
related: [button, checkbox, textarea, message-attachment, conversation-panel, thread-panel]
---

# Composer

The composer is where people write a message: at the bottom of a channel, a direct message, a thread or a task's thread. One ink border holds the input, the tools, any attachments and the pink send button. Typing @ opens a list of people and agents above it.

```example
chat-composer/compositions/composer-default
```

## When to use

| Situation                               | Use                                 |
| --------------------------------------- | ----------------------------------- |
| Sending a message in a conversation     | Composer                            |
| Several lines of text saved with a form | [Textarea](../textarea/textarea.md) |
| One line of text                        | [Input](../input/input.md)          |

Where the composer sits in a conversation is in [Conversation](../../../../../design/patterns/conversation.md).

## Anatomy

- `ComposerRoot`: the `<form>` that submits the message. Required.
- `Composer`: the box with the ink border. Required.
- `ComposerAttachments` with one `ComposerAttachment` per file: 64px thumbnails inside the box, above the input. Optional. `SortableComposerAttachments` lets people reorder them.
- `ComposerInput`: the input, a `<textarea>` that grows with its content. Required.
- `ComposerToolbar`: the row under the input, with:
  - `ComposerActions`: the tools at the start, each a `ComposerIconButton` (attach a file, add an image);
  - between them, the room the product fills with who is about to post, when someone is ([Working agents](../../../../../design/people-and-agents/working-agents.md#who-is-about-to-post)): a `flex-1` element with `min-w-0`, so the tools and the send button keep their places;
  - `ComposerMeta`: at the end, an option attached to sending (`ComposerToolbarLabel` with a [Checkbox](../checkbox/checkbox.md)) and `ComposerSubmit`, the send button.
- `ComposerSuggestionList` and its parts, driven by `useComposerSuggestions`: the @ suggestions above the box.
- `ComposerDropOverlay`: what the box shows while files are dragged over it.

## States

```example
chat-composer/compositions/composer-attachment-states
```

- **Uploading:** a thumbnail shows cyan progress on its own track, inset from its edges ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)); × in its corner cancels the upload while it runs and removes the file after. File cards are in [MessageAttachment](../message-attachment/message-attachment.md).
- **Nothing to send:** disable `ComposerSubmit` until there is text or an attachment.
- **Focus:** the whole composer takes the focus ring ([States](../../../../../design/foundations/states.md#focus)).

## Behavior

```example
composer-suggestions/composer-suggestions
```

- Typing @ opens the suggestion list above the composer, as wide as the composer and 8px above it. Group it with members of this conversation first, then the others. Each row shows the avatar, the name and the status in `foreground-hint`.
- Let people drag files into the composer, but not folders.
- Grow the input with its content up to a maximum height, then scroll inside it.
- On a phone, keep the composer on top of the keyboard when the keyboard opens. Return inserts a new line on a phone held upright ([Responsive layout](../../../../../design/patterns/responsive.md#phone)), so sending uses the send button.
- Put the composer's border on the content margin ([Page structure](../../../../../design/patterns/page-structure.md#one-edge-per-column)), with 16px plus the safe area below it.

```example
chat-composer/compositions/composer-drop-overlay
```

## Content

- Make the placeholder say where the message goes: Message #launch-week. Use the same words as the input's `aria-label`.

## Accessibility

Composer has no Base UI primitive: it renders a native `<form>` and `<textarea>`. `useComposerSuggestions` adds the combobox pattern to the input: `aria-controls` points at the listbox, `aria-activedescendant` at the highlighted option. Arrow Up and Arrow Down move the highlight, Enter or Tab picks it, and Esc closes the list.

- Give `ComposerInput` an `aria-label` that names the destination (Message #launch-week).
- Give every `ComposerIconButton` and an icon-only `ComposerSubmit` an `aria-label` (Attach File, Send).
- Give the suggestion list an `aria-label` or `aria-labelledby`.

## Rules

- Count the send button as the screen's pink button ([Button](../button/button.md#which-color)). It is a pink icon button (`size="icon-sm"`) with `aria-label="Send"`, on a phone and on desktop.
- Draw one ink border around the whole group: 1px `line-field`, like a field ([Shape](../../../../../design/foundations/shape.md#stroke-widths)). The tools inside it have none: `ComposerIconButton` is frameless.
- Keep the input text `text-body` at regular weight wherever the composer sits (a channel, a thread, a comment on an attachment, a forward). Don't let it inherit the surrounding type. Make tool icons `foreground-muted`.
- Under a scrolling region, such as a comment on an attachment or a note added to a forward, use a compact composer: a `line-seam` above it, 12px of space around it, and no fill of its own.
