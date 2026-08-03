# Selection index

One flat lookup from scenario to component. For the reasoning behind a choice, follow the domain file.

Prop signatures are not listed anywhere in this skill — see [lookup.md](./lookup.md) for where to find them.

| Domain                                  | File                                 |
| --------------------------------------- | ------------------------------------ |
| Form controls, option pickers, tabs     | [forms.md](./forms.md)               |
| Dialogs, popovers, menus, tooltips      | [overlays.md](./overlays.md)         |
| Banners, toasts, loading, empty, badges | [feedback.md](./feedback.md)         |
| Typography, code, avatars, files        | [display.md](./display.md)           |
| Shell, panels, navigation, tasks        | [layout.md](./layout.md)             |
| Chat sidebar, conversation, composer    | [conversation.md](./conversation.md) |

---

## The four decisions people get wrong

| Question                    | Answer                                             |
| --------------------------- | -------------------------------------------------- |
| Value or action?            | `Select` for a value, `DropdownMenu` for an action |
| Applies now or on submit?   | `Switch` now, `Checkbox` on submit                 |
| Can the message be missed?  | `Banner` if not, `toast()` if yes                  |
| Is the content interactive? | `Popover` if yes, `Tooltip` if no                  |

---

## Input

| Scenario                                     | Component             |
| -------------------------------------------- | --------------------- |
| Any labelled control                         | `Field` (always wrap) |
| Section caption outside a field              | `Label`               |
| Single line of text                          | `Input`               |
| Text with a prefix, suffix, or inline button | `InputGroup`          |
| Multiple lines                               | `Textarea`            |
| On/off, submitted with the form              | `Checkbox`            |
| On/off, applies immediately                  | `Switch`              |
| One of 2–5, in a form                        | `RadioGroup`          |
| One of 2–5, switching a view                 | `SegmentedControl`    |
| One of many                                  | `Select`              |
| Many, searchable, or multi-select            | `Combobox`            |
| Independent toggles in a toolbar             | `ToggleGroup` _(wip)_ |
| Sending a message                            | `Composer`            |

## Overlays

| Scenario                            | Component      |
| ----------------------------------- | -------------- |
| Destructive confirmation            | `AlertDialog`  |
| Any other modal task                | `Dialog`       |
| Edge-anchored panel or mobile sheet | `Drawer`       |
| Interactive content on a trigger    | `Popover`      |
| One phrase on hover                 | `Tooltip`      |
| Entity summary on hover             | `PreviewCard`  |
| Actions from a button               | `DropdownMenu` |
| Actions from right-click            | `ContextMenu`  |
| Full-screen media                   | `Lightbox`     |

## Feedback

| Scenario                          | Component            |
| --------------------------------- | -------------------- |
| Condition that is still true      | `Banner`             |
| Result of the action just taken   | `toast()`            |
| Something that happened elsewhere | `NotificationCenter` |
| Nothing to show                   | `EmptyState`         |
| Loading with a known layout       | `Skeleton`           |
| Busy, duration unknown            | `Spinner`            |
| Busy, percentage known            | `Progress`           |
| Presence or health                | `Status`             |
| Count, tag, or category           | `Badge`              |

## Text and display

| Scenario                     | Component                 |
| ---------------------------- | ------------------------- |
| Body copy                    | `Text`                    |
| Heading                      | `TextHeading`             |
| Numbers that update in place | `TextMono size="tabular"` |
| Timestamps and IDs           | `TextMono size="meta"`    |
| Code token in a sentence     | `InlineCode`              |
| Command meant to be copied   | `CopyableCode`            |
| Multi-line code display      | `CodeBlock`               |
| Rendered markdown nodes      | `Markdown*` parts         |
| Term/value pairs             | `DescriptionList`         |
| Keyboard shortcut            | `Kbd` / `KbdGroup`        |
| Person or agent              | `Avatar`                  |
| One file as a tile           | `FilePreview`             |
| A browsable file list        | `Files`                   |
| A divider                    | `Separator`               |

## Layout

| Scenario                    | Component              |
| --------------------------- | ---------------------- |
| The application frame       | `AppShellRoot`         |
| Icon rail                   | `AppRail`              |
| Bottom nav on small screens | `MobileNav`            |
| A bounded region            | `Panel`                |
| Shared panel header chrome  | `PanelHeader` set      |
| Profile detail pane         | `ProfilePanel` _(wip)_ |
| User-draggable split        | `ResizableGroup`       |
| Bounded scroll region       | `ScrollArea`           |
| Switching content panels    | `Tabs`                 |

## Conversation

| Scenario                           | Component                                                       |
| ---------------------------------- | --------------------------------------------------------------- |
| Channel and DM list                | `Sidebar`                                                       |
| Main conversation column           | `ConversationPanel`                                             |
| Thread beside the conversation     | `ThreadPanel`                                                   |
| Scrolling message list             | `MessageList` + `MessageItem`                                   |
| One message                        | `MessageItem`                                                   |
| Join/leave/rename event            | `SystemMessage`                                                 |
| Reactions, references, attachments | `MessageReaction*` / `MessageReference*` / `MessageAttachment*` |
| Message input                      | `Composer`                                                      |
| Notification inbox                 | `NotificationCenter`                                            |
| Live agent activity strip          | `LiveAgentActivityBar`                                          |

## Tasks

| Scenario                      | Component                     |
| ----------------------------- | ----------------------------- |
| The task surface with toolbar | `TasksPanelRoot`              |
| Kanban columns                | `TaskBoardRoot`               |
| Grouped list sections         | `TaskListRoot`                |
| One task                      | `TaskCard`                    |
| Drag and drop                 | `TaskDndProvider` and friends |

`TaskCardLegacy` and `LegacyTaskPanel` are for old callsites only.

## Theme

| Scenario                       | API                          |
| ------------------------------ | ---------------------------- |
| Wrap the app                   | `ThemeProvider`              |
| Read family and mode           | `useTheme()`                 |
| Read family only               | `useThemeFamily()`           |
| Render family-specific content | `BrutalOnly` / `ElegantOnly` |
| Merge classes                  | `cn` from `raft-ui/cn`       |
