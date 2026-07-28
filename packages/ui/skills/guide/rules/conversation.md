# Conversation surfaces

These encode the Raft product shape. Reach for them before assembling anything chat-like out of primitives.

## Contents

- Which surface
- ConversationPanel vs ThreadPanel
- Composer vs Textarea
- ChatSidebar structure
- Composer structure
- What stays in your app

---

## Which surface

| Scenario                         | Component            |
| -------------------------------- | -------------------- |
| Channel and DM list              | `ChatSidebar`        |
| The main conversation column     | `ConversationPanel`  |
| A thread beside the conversation | `ThreadPanel`        |
| Message input                    | `Composer`           |
| Notification inbox               | `NotificationCenter` |

---

## ConversationPanel vs ThreadPanel

They are not the same component with a different width.

|                       | `ConversationPanel`            | `ThreadPanel`                      |
| --------------------- | ------------------------------ | ---------------------------------- |
| Shows                 | a channel or DM                | replies to one message             |
| Header                | channel identity, status, tabs | the thread's title and reply count |
| Has an origin message | no                             | yes — `ThreadPanelOriginalMessage` |

`ThreadPanel` carries thread-specific parts that have no equivalent in the conversation column: `ThreadPanelOriginalMessage`, `ThreadPanelReplyCount`, `ThreadPanelReplySummary`, and an in-thread search (`ThreadPanelSearch`, `ThreadPanelSearchCount`, `ThreadPanelSearchTrailing`).

`ConversationPanel` carries the channel-level chrome: `ConversationPanelHeader` with `ConversationPanelHeaderIcon` / `ConversationPanelHeading` / `ConversationPanelTitle` / `ConversationPanelStatus` / `ConversationPanelMeta`, plus `ConversationPanelTabs` and `ConversationPanelSectionHeader`.

Its empty state is `ConversationPanelEmptyState` with `ConversationPanelEmptyStateBrand` / `ConversationPanelEmptyStateBrandMark` — use it rather than the generic `EmptyState` inside a conversation.

---

## Composer vs Textarea

`Textarea` is a form control. `Composer` is a message-sending surface.

Use `Composer` whenever the input sends a message — it already handles attachments, drag-and-drop, mentions, the toolbar, and the submit affordance. Rebuilding those around a `Textarea` reimplements a large amount of behavior badly.

Use `Textarea` for a description field in a form.

---

## ChatSidebar structure

Deeply parted by design. Render the parts you need; do not pass item config objects.

```
ChatSidebarRoot
  ChatSidebarHeader → ChatSidebarHeaderTitle, ChatSidebarControl
  ChatSidebarBody
    ChatSidebarSection
      ChatSidebarSectionHeader → SectionTitle, SectionCount, SectionChevron,
                                 SectionAttention, SectionControls, SectionTrailing
      ChatSidebarSectionDisclosure
      ChatSidebarList
        ChatSidebarItem → ItemIcon | ItemChannelIcon, ItemContent → ItemTitle, ItemSubtitle,
                          ItemMeta → ItemMetaIcon, ItemAside, ItemCount, ItemIndicator, ItemStatus
      ChatSidebarSectionEmpty
  ChatSidebarLiveActivity
```

Naming is regular: section-level parts are `ChatSidebarSection*`, row-level parts are `ChatSidebarItem*`, and menu rows are `ChatSidebarMenu*`. When you need a part you have not seen, guess by that pattern and confirm against the source.

- Unread counts go in `ChatSidebarItemCount`, not appended to the title string.
- Presence goes in `ChatSidebarItemStatus`, not a hand-placed dot.
- `ChatSidebarGroupLabel` labels a group of sections; `ChatSidebarSectionTitle` labels one section.

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
