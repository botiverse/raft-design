# Conversation surfaces

These encode the Raft product shape. Reach for them before assembling anything chat-like out of primitives.

## Contents

- Which surface
- ConversationPanel vs ThreadPanel
- Composer vs Textarea
- Sidebar structure
- Message surfaces
- Composer structure
- What stays in your app

---

## Which surface

| Scenario                            | Component                     |
| ----------------------------------- | ----------------------------- |
| Channel and DM list                 | `Sidebar`                     |
| The main conversation column        | `ConversationPanel`           |
| A thread beside the conversation    | `ThreadPanel`                 |
| The scrolling list of messages      | `MessageList` + `MessageItem` |
| One human or agent message          | `MessageItem`                 |
| Join/leave/rename event in the flow | `SystemMessage`               |
| Message input                       | `Composer`                    |
| Notification inbox                  | `NotificationCenter`          |
| Live agent activity strip           | `LiveAgentActivityBar`        |

The sidebar family is named `Sidebar*`, not `ChatSidebar*` — it was generalized to shared navigation primitives. If you find `ChatSidebar` anywhere, it is pre-0.2 code.

---

## ConversationPanel vs ThreadPanel

They are not the same component with a different width.

|                       | `ConversationPanel`            | `ThreadPanel`                      |
| --------------------- | ------------------------------ | ---------------------------------- |
| Shows                 | a channel or DM                | replies to one message             |
| Header                | channel identity, status, tabs | the thread's title and reply count |
| Has an origin message | no                             | yes — `ThreadPanelOriginalMessage` |

`ThreadPanel` carries thread-specific parts that have no equivalent in the conversation column: `ThreadPanelOriginalMessage`, `ThreadPanelReplyCount`, `ThreadPanelReplySummary`, and an in-thread search (`ThreadPanelSearch`, `ThreadPanelSearchCount`, `ThreadPanelSearchTrailing`).

`ConversationPanel` keeps its own root, body, tabs, and empty state (`ConversationPanelRoot`, `ConversationPanelBody`, `ConversationPanelContent`, `ConversationPanelFooter`, `ConversationPanelTabs`, `ConversationPanelEmptyState` with `…Brand` / `…BrandMark`), but its **header chrome is the shared `Panel*` set**: `PanelHeader`, `PanelHeaderContent`, `PanelHeaderIcon`, `PanelHeading`, `PanelTitle`, `PanelStatus`, `PanelMeta`, `PanelActions`, `PanelSectionHeader`. These shared header parts are exported for panel-shaped surfaces in general — see the naming warning in [layout.md](./layout.md).

Use `ConversationPanelEmptyState` rather than the generic `EmptyState` inside a conversation.

---

## Composer vs Textarea

`Textarea` is a form control. `Composer` is a message-sending surface.

Use `Composer` whenever the input sends a message — it already handles attachments, drag-and-drop, mentions, the toolbar, and the submit affordance. Rebuilding those around a `Textarea` reimplements a large amount of behavior badly.

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
- `SidebarLiveActivity` is the slot in the sidebar frame; the standalone strip is `LiveAgentActivityBar` (stable) with `…Row` / `…Avatar` / `…Status` / `…Text` parts.

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
| `MessageActionCard*`           | agent action cards with scope and properties                                                                                             |
| `MessageQuotedPreview*`        | quoted message preview, including `…Loading` and `…Unavailable`                                                                          |
| `MessageReplies*`              | the reply summary row under a message                                                                                                    |
| `MessageForwardedBundle*`      | forwarded message bundles                                                                                                                |
| `MessageItemTranslation*`      | translation status, original text, retry                                                                                                 |
| `MessageMultiSelect*`          | multi-select checkboxes and toolbar                                                                                                      |
| `MessageTextSelectionToolbar*` | the toolbar that appears over selected text                                                                                              |

`SystemMessage` is separate from `MessageItem` — join/leave/rename events use `SystemMessage` + `SystemMessageTime`, and consecutive events collapse with the `SystemMessageGroup*` disclosure parts.

Product-state parts follow the library-wide pattern: the consumer decides which state part to render (`MessageReferencePending`, `MessageQuotedPreviewUnavailable`, `MessageItemTranslationFailedStatus`), the root never takes a `state` prop.

For message text content, the `Markdown*` renderer parts (see [display.md](./display.md)) style each markdown node.

---

## Composer structure

```
ComposerRoot
  ComposerAttachments → ComposerAttachment → AttachmentImage | AttachmentFile,
                        AttachmentBody, AttachmentTitle, AttachmentMeta, AttachmentRemove,
                        AttachmentUploadingOverlay, AttachmentUploadProgressBar,
                        AttachmentFailedOverlay
  ComposerInput
  ComposerToolbar → ComposerToolbarLabel, ComposerIconButton
  ComposerActions → ComposerSubmit
  ComposerMeta
  ComposerDropOverlay → DropOverlayLabel, DropOverlayPrompt
```

- Upload state has dedicated overlay parts. Render `ComposerAttachmentUploadingOverlay` while uploading and `ComposerAttachmentFailedOverlay` on failure — do not dim the tile with a className.
- Reorderable attachments use `SortableComposerAttachments` / `SortableComposerAttachment` / `SortableComposerAttachmentsScroll`.
- Mentions and slash commands use the `useComposerSuggestions` hook with `ComposerSuggestionList`, `ComposerSuggestionGroup`, `ComposerSuggestionOption`, `ComposerSuggestionIcon`, `ComposerSuggestionTitle`, `ComposerSuggestionMeta`, `ComposerSuggestionAside`.

The suggestion list recipe exposes `iconVariant` of `avatar` `framed` `auxiliary` and `metaVariant` of `text` `code` — pick `avatar` for people, `framed` for channels and commands, and `code` meta for anything the user types literally.

The suggestion parts are **styling slots**, not a combobox state machine. `useComposerSuggestions` owns matching and keyboard behavior; the parts render it.

---

## What stays in your app

The conversation components are business-agnostic shells. These belong to you, not to a prop on the component:

- Upload lifecycle and retry policy
- Send permissions, read-only channels, rate limits
- Notification and mute policy
- Read/unread tracking
- Which entities exist and what they are called

The pattern throughout is the same: the library exposes the parts, you choose which to render based on your state.
