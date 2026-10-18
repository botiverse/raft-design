---
name: conversation
description: "Raft conversation surfaces: Sidebar, ConversationPanel vs ThreadPanel, MessageList/MessageItem satellite families, SystemMessage, Composer structure."
---

# Conversation surfaces

These encode the Raft product shape. Reach for them before assembling anything chat-like out of primitives.

## Contents

- Which surface
- ConversationPanel vs ThreadPanel
- Activity inbox and workspace search
- Composer vs Textarea
- Sidebar structure
- Message surfaces
- Composer structure

---

## Which surface

| Scenario                            | Component                     |
| ----------------------------------- | ----------------------------- |
| Channel and DM list                 | `SidebarRoot`                 |
| The main conversation column        | `ConversationPanelRoot`       |
| A thread beside the conversation    | `ThreadPanelRoot`             |
| The scrolling list of messages      | `MessageList` + `MessageItem` |
| One human or agent message          | `MessageItem`                 |
| Join/leave/rename event in the flow | `SystemMessage`               |
| Message input                       | `ComposerRoot` + `Composer`   |
| Notification inbox                  | `NotificationCenter`          |
| Activity or saved-item inbox        | `ActivityInboxPanel`          |
| Workspace search results            | `SearchShellRoot`             |
| Live agent activity strip           | `LiveAgentActivityBar`        |

---

## ConversationPanel vs ThreadPanel

They are not the same component with a different width.

|                       | `ConversationPanel`            | `ThreadPanel`                      |
| --------------------- | ------------------------------ | ---------------------------------- |
| Shows                 | a channel or DM                | replies to one message             |
| Header                | channel identity, status, tabs | the thread's title and reply count |
| Has an origin message | no                             | yes — `ThreadPanelOriginalMessage` |

`ThreadPanel` carries thread-specific parts that have no equivalent in the conversation column: `ThreadPanelOriginalMessage`, `ThreadPanelReplyCount`, `ThreadPanelReplySummary`, and an in-thread search (`ThreadPanelSearch`, `ThreadPanelSearchCount`, `ThreadPanelSearchTrailing`).

`ConversationPanel` keeps its own root, body, tabs, and empty state (`ConversationPanelRoot`, `ConversationPanelBody`, `ConversationPanelContent`, `ConversationPanelFooter`, `ConversationPanelTabs`, `ConversationPanelEmptyState` with `…Brand` / `…BrandMark`), but its **header uses the shared `PanelHeader` chrome** — see [layout.md](./layout.md).

Use `ConversationPanelEmptyState` rather than the generic `EmptyState` inside a conversation.

---

## Activity inbox and workspace search

These are product-shaped presentation surfaces, not state managers.

| Surface            | Compose                                                                                      | Keep in the app                                              |
| ------------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Activity inbox     | `ActivityInboxPanel`, sidebar, controls, selection-toolbar, viewport, and loading-more parts | filters, selection, bulk actions, pagination, loading policy |
| Reusable inbox row | `InboxItem` + `InboxItemTrigger`, content, metadata, trailing, and action parts              | entity data, read/unread state, navigation, permissions      |
| Workspace search   | `SearchShellRoot`, filters, viewport, result sections and lists                              | query, filters, fetching, ranking, result selection          |
| Search result      | `SearchEntityResult*`, `SearchMessageResult*`, or `SearchThreadResult*`                      | result data, destination, domain-specific copy               |

Do not substitute `Combobox` for `SearchShellRoot`; it is a value picker.

`InboxItemTrigger` is the row's primary action and inherits the root's disabled state. Compose
secondary controls inside `InboxItemActions`; do not put navigation policy or bulk-selection state
into the component.

Search result parts own presentation and selected styling, not search semantics. Pick the result
family that matches the rendered entity rather than switching one result component with a `kind`
prop.

---

## Composer vs Textarea

`Textarea` is a form control. `Composer` is a message-sending surface.

Use the `ComposerRoot` / `Composer` family whenever the input sends a message. It provides the attachment, drop-overlay, toolbar, submit, and suggestion parts.

Use `Textarea` for a description field in a form.

---

## Sidebar structure

Deeply parted by design. Render the parts you need; do not pass item config objects.

Naming is regular at three levels — guess by pattern, then confirm against the declarations ([lookup.md](./lookup.md)):

| Level       | Prefix            | Anchor parts                                                         |
| ----------- | ----------------- | -------------------------------------------------------------------- |
| Frame       | `Sidebar*`        | `SidebarRoot`, `SidebarHeader`, `SidebarBody`, `SidebarLiveActivity` |
| Section     | `SidebarSection*` | `…Header`, `…Title`, `…Count`, `…Chevron`, `…Disclosure`, `…Empty`   |
| Row         | `SidebarItem*`    | `…Icon`, `…Title`, `…Subtitle`, `…Meta`, `…Count`, `…Status`         |
| Footer menu | `SidebarMenu*`    | `…Icon`, `…Title`, `…Count`, `…Aside`                                |

- Unread counts go in `SidebarItemCount`, not appended to the title string.
- Presence goes in `SidebarItemStatus`, not a hand-placed dot.
- `SidebarGroupLabel` labels a group of sections; `SidebarSectionTitle` labels one section.
- `SidebarLiveActivity` is the slot in the sidebar frame; the standalone strip is `LiveAgentActivityBar` with `…Row` / `…Avatar` / `…Status` / `…Text` parts.
- `SidebarItem` draws its own active treatment, a yellow sticker; it has no `variant`. `SidebarItemCount` is always the pink sticker and `SidebarItemIndicator` the yellow @; neither takes `variant` or `appearance`.

---

## Message surfaces

The message family is large and satellite-structured: `MessageItem` is the anchor, and each concern is its own part family with a regular prefix. Do not hand-roll any of these — every state below already has a dedicated part.

| Prefix                         | Owns                                                                                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `MessageList*`                 | the scroller: `MessageListDateDivider`, `…Notice`, `…HistoryLimited`                                                                     |
| `MessageItem*`                 | one message: `…Header`, `…Sender`, `…Time`, `…Body`, `…Footer`, `…Gutter`, `…Toolbar`, `…ReadReceipt`, `…SavedIndicator`, `…SearchMatch` |
| `MessageReaction*`             | reaction chips, quick row, picker, tooltip                                                                                               |
| `MessageReference*`            | reference chips: `…Chip`, `…Pending`, `…Unavailable`                                                                                     |
| `MessageAttachment*`           | attachment cards, diff summaries; plus `MessageImageGallery*` and `MessageVideoPreview*`                                                 |
| `MessageEmbed*`                | link embeds                                                                                                                              |
| `MessageActionCard*`           | agent action cards; fold resolved cards with defaultOpen={false}; agent reason = HintLabel + Hint; Raft's note = Notice                  |
| `MessageQuotedPreview*`        | quoted message preview, including `…Loading` and `…Unavailable`                                                                          |
| `MessageReplies*`              | the reply summary row under a message                                                                                                    |
| `MessageForwardedBundle*`      | forwarded message bundles                                                                                                                |
| `MessageItemTranslation*`      | translation status, original text, retry                                                                                                 |
| `MessageMultiSelect*`          | multi-select checkboxes and toolbar                                                                                                      |
| `MessageTextSelectionToolbar*` | the toolbar that appears over selected text                                                                                              |

`SystemMessage` is separate from `MessageItem` — join/leave/rename events use `SystemMessage` + `SystemMessageTime`, and consecutive events collapse with the `SystemMessageGroup*` disclosure parts.

Product-state parts follow the library-wide pattern: the consumer decides which state part to render (`MessageReferencePending`, `MessageQuotedPreviewUnavailable`, `MessageItemTranslationFailedStatus`), the root never takes a `state` prop.

Pass a number as `MessageReactionCount` children to get its built-in 180ms bump on value changes. It skips the initial render and respects reduced motion. Keep the part mounted with a stable key; do not add an application-side animation or key it by the count. Non-numeric children remain supported as static content.

For message text content, the `Markdown*` renderer parts (see [display.md](./display.md)) style each markdown node.

---

## Composer structure

```
ComposerRoot
  ComposerAttachments → ComposerAttachment → ComposerAttachmentImage | ComposerAttachmentFile,
                        ComposerAttachmentBody, ComposerAttachmentTitle,
                        ComposerAttachmentMeta, ComposerAttachmentRemove,
                        ComposerAttachmentUploadingOverlay,
                        ComposerAttachmentUploadProgressBar,
                        ComposerAttachmentFailedOverlay
  ComposerInput
  ComposerToolbar → ComposerToolbarLabel, ComposerIconButton
  ComposerActions → ComposerSubmit
  ComposerMeta
  ComposerDropOverlay → ComposerDropOverlayLabel, ComposerDropOverlayPrompt
```

- `ComposerSubmit` is a `Button` locked to `variant="accent"` — the core-action color. Its props omit `variant`; do not try to restyle it into a yellow or default button.
- Upload state has dedicated overlay parts. Render `ComposerAttachmentUploadingOverlay` while uploading and `ComposerAttachmentFailedOverlay` on failure — do not dim the tile with a className.
- Reorderable attachments use `SortableComposerAttachments` / `SortableComposerAttachment` / `SortableComposerAttachmentsScroll`.
- Mentions and slash commands use the `useComposerSuggestions` hook with `ComposerSuggestionList`, `ComposerSuggestionGroup`, `ComposerSuggestionOption`, `ComposerSuggestionIcon`, `ComposerSuggestionTitle`, `ComposerSuggestionMeta`, `ComposerSuggestionAside`.

Set `ComposerSuggestionIcon variant` to `avatar`, `framed`, or `auxiliary`, and set `ComposerSuggestionMeta variant` to `text` or `code`. Pick `avatar` for people, `framed` for channels and commands, and `code` for anything the user types literally.

The suggestion parts are **styling slots**, not a combobox state machine. `useComposerSuggestions` owns matching and keyboard behavior; the parts render it.
