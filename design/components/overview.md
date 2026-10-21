---
title: Components
summary: The two layers of raft-ui (core parts for any app, collaboration parts that carry Raft's product concepts), how to choose a component, and what is built from existing parts.
redirectFrom: [patterns/choosing-components, patterns/composites]
---

# Components

raft-ui's components come in two layers. **Core** holds the parts any app needs: buttons, fields, dialogs, tabs, tables, avatars. **Collaboration** holds the parts that carry Raft's own concepts: messages, threads, tasks, agents, Activity and notifications, search and files. This page says what each layer is for, which component to choose when several look right, and what to assemble from existing parts instead of designing anew. Each component's own doc says how to use it once chosen.

## Two layers

### Core

Core components are generic. They know nothing about messages, tasks or agents: their API speaks in values, items, slots and states, and they would work unchanged in an app that has none of Raft's concepts. Button, Field, Select, Dialog, Drawer, Tabs, Table, Markdown, Avatar and Status are core.

Core is grouped by what a part does:

| Category | What is in it |
| --- | --- |
| Actions | Buttons |
| Inputs | Form controls and the parts around them: inputs, pickers, switches, labels and fields |
| Navigation | Moving between places and sections: the rail, the sidebar, the phone tab bar, tabs, steps, segmented controls |
| Overlays | Everything that floats above the page: dialogs, drawers, menus, popovers, tooltips, the lightbox |
| Feedback | Telling people about a result, a problem, a wait or an empty view |
| Layout | The frame of a screen and its regions: the app shell, panels, cards, separators, resizable columns |
| Data display | Showing content and facts: text, Markdown, code, tables, description lists, list rows, long virtualized lists, badges, status pixels |
| Identity | What stands for someone or something: avatars, icon tiles, the conversation icons, the logo |

### Collaboration

Collaboration components embody Raft's collaboration domain. Each one carries a product concept and the rules that come with it: what a message shows under its body, how a thread is summarized under the message it started, which statuses a task moves through and in what order, what an agent's request for approval records once it is handled. They are built from core parts.

Collaboration is grouped by concept:

| Category | What is in it |
| --- | --- |
| Messages | One message and its parts (attachments, embeds, replies, translation), event lines, the message list, the composer, and the conversation and thread panels |
| Tasks | Task cards, the board and list views, the parts every task view shares, and the timeline that shows a task's history |
| Agents | The profile of a person or an agent, and the card an agent attaches to a message for a person to confirm |
| Inbox | Activity, its rows, and the notification center |
| Search | The search trigger and the rows of search results |
| Files | The files shared in a place, and the icon that shows a file's type |

### Why the split

- **Core can be reused anywhere.** Every Raft product (Raft Chat today; Tasks, Calendar and the others next) and any internal tool can take a core part without taking Raft's data model with it. raft-ui keeps this true in code: a core component never imports a collaboration one, while collaboration components are built on core ones.
- **Each rule lives in one place.** A rule about color, lines, shape or states belongs to a core part, and every product inherits it. A rule about a product concept (how many reply previews a thread shows, the order of the task statuses) belongs to the collaboration part that carries the concept, so changing the concept changes one component, not every screen that shows it.
- **It tells you where to look.** When you build something about messages, tasks, agents, Activity or notifications, start in collaboration: the part you need, or most of it, probably exists, and it already follows the product's rules. When you build something generic, stay in core, and don't borrow a collaboration part because it looks right. An InboxItem is the row for something that happened elsewhere; a list of settings uses [ListRow](../../packages/ui/src/components/list-row/list-row.md), even though both are rows with an icon and a title.

### Which layer a new component belongs to

Ask one question: would the part make sense in an app with no messages, tasks, agents, Activity or notifications?

- **Yes:** it is core. Name it for what it does (`Timeline` would be core if it did not know task statuses), give it no product props, and put it in the category of what it does.
- **No:** its name, its props or its rules mention a Raft concept, so it is collaboration. Build it from core parts and put it in the category of its concept.

A core part that starts to need a product concept has become two parts: keep the generic one in core and build the product one on top of it in collaboration.

## How to choose a component

Several components can look right for the same job. These tables pick one per situation, and each section starts with the question that decides it. Use them whenever you put a control, a message, a popup or a row on a screen. Products don't override these choices; a product-specific case goes on the product's page.

### Picking something

Two questions decide a picker: when the choice takes effect, and how many values there are. A control that applies at once (Switch, a menu) must be safe to flip without a Save; a control saved with a form (Checkbox, RadioGroup, Select) can wait for the person to review it ([Forms](../patterns/forms.md)). Radio buttons show every answer, so they fit only a few; a select hides the values behind one field, so it fits more; past that people need to search.

| You need | Use |
| --- | --- |
| To act on one thing | A menu ([DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md)); press and hold on a phone opens the same menu ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)) |
| Yes or no, applied at once | [Switch](../../packages/ui/src/components/switch/switch.md) |
| Yes or no, applied on Save | [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md) |
| One of 2 to 5 answers, submitted with a form | [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md) |
| Another view of the same content | [SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md) |
| Sections of one page, each with its own content | [Tabs](../../packages/ui/src/components/tabs/tabs.md) |
| One of up to 10 values | [Select](../../packages/ui/src/components/select/select.md) |
| One of many values | A field people type into to filter the list, on a phone too ([ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md)). When people only pick and never type, a [Select](../../packages/ui/src/components/select/select.md): ComboboxSelect always brings up a phone's keyboard |
| A few of several values | A multi-select: a box before each item, and the field shows the chosen values ([Select](../../packages/ui/src/components/select/select.md) with `multiple`) |
| A few of many values (people, agents, labels) | A multi-select with search: chosen values become chips in the field, and typing continues after them ([ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md) with `multiple`, or [Combobox](../../packages/ui/src/components/combobox/combobox.md) with its chips) |
| To filter a list | A filter: a select or combobox opened from a [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md) |
| To change one property of an item in place | The value in a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md) opens a picker |

SegmentedControl and Tabs look alike, and the content decides between them: a segmented control shows the same content another way (Board or List), tabs switch to different content.

### Telling people something

The scope of a message decides where it goes, and how long the situation lasts decides how long the message stays. The wider the scope, the further out it sits: an input's error under the input, a panel's problem under the panel header, a server's problem in the notification center ([Feedback](../patterns/feedback.md)).

| Situation | Use | Stays |
| --- | --- | --- |
| Something the person just did has a result | [Toast](../../packages/ui/src/components/toast/toast.md) | A few seconds |
| They need to know it before acting | [Banner](../../packages/ui/src/components/banner/banner.md), inside a dialog or form | Always |
| Something in one panel failed: an agent won't start, a setting of the conversation didn't save | A full-width notice under the panel header (`PanelNotice`, [Panel](../../packages/ui/src/components/panel/panel.md)) | Until it is fixed or dismissed |
| The state of the whole server: a computer offline, a quota nearly full, an update | The notification center ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)), with an attention dot on the bell | Until it changes |
| Something happened elsewhere that the person should see | Activity ([ActivityInbox](../../packages/ui/src/components/activity-inbox/activity-inbox.md)); its entry point shows an attention dot or a count | Until it is read |
| An agent needs approval | An action card in the conversation ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)) | Until it is handled |
| The person must decide now | [Dialog](../../packages/ui/src/components/dialog/dialog.md) | Until they decide |
| An input is invalid | The input's error state ([Field](../../packages/ui/src/components/field/field.md)) | Until it is fixed |
| What an icon means | [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) | While hovered |

- Never put anything in a toast that would confuse people if they missed it. A toast disappears on its own, so it can only confirm what the person already expects.

### Overlays

The more an overlay asks of people, the more of the screen it takes. What only informs opens on hover; a small choice opens next to what was clicked; something people look at for a while slides in with the page still behind it; what they must finish before going on sits in the center over a scrim.

| Situation | Use |
| --- | --- |
| One sentence on hover | [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) |
| A person or agent, on hover | A profile card ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)) |
| A list of actions, on click or press and hold | [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md) |
| One value, on click | [Select](../../packages/ui/src/components/select/select.md), with search when there are many values |
| Several values, on click | A multi-select, with search when there are many values. Choosing a value doesn't close the list |
| A little input, on click | [Popover](../../packages/ui/src/components/popover/popover.md) |
| Details and settings people look at for a while | [Drawer](../../packages/ui/src/components/drawer/drawer.md) |
| A large form filled in one pass | The wide [Dialog](../../packages/ui/src/components/dialog/dialog.md); see [Forms](../patterns/forms.md#the-large-form-dialog) |
| A short list opened from a top bar: Working now, the notifications, the server list | [Popover](../../packages/ui/src/components/popover/popover.md), on a phone too. On a phone the server list is anchored under the top bar ([Navigation](../patterns/navigation.md#servers)) |
| A short explanation, on a phone | A bottom sheet ([Drawer](../../packages/ui/src/components/drawer/drawer.md)) |
| A dialog with several fields, a long list or steps, on a phone | A sheet 90% of the screen tall; a decision, content that is only read, or a single input stays the centered dialog ([Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)) |
| A confirmation | A [Dialog](../../packages/ui/src/components/dialog/dialog.md#variants) at `size="sm"`, 400px, the width of AlertDialog, with Cancel and the confirm button; see [Feedback](../patterns/feedback.md#confirming). Raft Chat builds its confirmations on Dialog, except two that use [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md): discarding unsaved edits to an agent's profile, and opening a link that hands off to another app |
| Task details | A centered dialog, 960px wide, full screen on a phone: a workspace overlay outside the four Dialog sizes ([Tasks](../patterns/tasks.md), [Dialog](../../packages/ui/src/components/dialog/dialog.md#variants)) |

- Put a scrim behind every centered overlay: dialogs, confirmations, search, task details, large forms. How overlays move is in [Motion](../foundations/motion.md#usage).

### Waiting

The more you know about a wait, the more specific its indicator. A known layout is held by a skeleton, so nothing jumps when the content arrives; a known percentage is a progress bar; a wait with neither is the spinner; and a wait a button started stays on the button, where the person is already looking.

| Situation | Use |
| --- | --- |
| The layout is known | [Skeleton](../../packages/ui/src/components/skeleton/skeleton.md) |
| The duration is unknown, and there is no layout to hold | The pixel spinner ([Spinner](../../packages/ui/src/components/spinner/spinner.md)) |
| The percentage is known | [Progress](../../packages/ui/src/components/progress/progress.md) |
| A button started the wait | The button's loading state ([Button](../../packages/ui/src/components/button/button.md)) |

- Don't use pink for any of these. They are passive, and pink means something waits for the person.
- Raft Chat doesn't follow the skeleton rule in two places yet: the conversation timeline and the profile panel show the word "Loading…" while they wait.

### Rows

A row follows what it stands for, not where it appears: a place looks the same in the sidebar and in a phone list of places, and each other kind of row carries what its subject needs (the attention dot of something to see, the status chip of a task). Rows of the same kind are also the same size across an app's tabs ([The same kind, the same size](../foundations/spacing.md#the-same-kind-the-same-size)).

| Where | Use |
| --- | --- |
| The desktop sidebar | The sidebar row ([Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)) |
| A phone list of places: Home's channels and direct messages, Members, the Settings list | The same sidebar row, 44px high on a phone ([Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)) |
| Agents, people and apps on a detail or profile page, such as a computer's agents | [ListRow](../../packages/ui/src/components/list-row/list-row.md), in an inset group. The product draws this row with its own copy (`AvatarListRow`) |
| Activity and notifications | [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md) |
| A message found by search | The search result row ([Search](../../packages/ui/src/components/search/search.md)) |
| A task | [TaskCard](../../packages/ui/src/components/task-card/task-card.md), on a board or in a list |

## Built from existing parts

Some things in the product have no design of their own: they are assembled from existing components. Build them as described here, without new colors, shapes or lines. Each new container, color or line is one more thing people have to learn and one more thing the system has to keep consistent across light and dark, phone and desktop; a composite inherits its parts' states, dark mode and accessibility for free.

If what you need isn't here and no component fits, follow the six questions in the [README](../principles/designing-a-new-feature.md#the-questions-to-ask) before adding anything.

### Task details

A centered [Dialog](../../packages/ui/src/components/dialog/dialog.md), 960px wide, a workspace overlay outside Dialog's four sizes: a bar with the place and the task number, the title and the description, one row of properties (Status, Assignee, Created by) in a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md), the History in a collapsed [Timeline](../../packages/ui/src/components/timeline/timeline.md), then the task's thread and a [Composer](../../packages/ui/src/components/composer/composer.md). Its size and its bar are in [Tasks](../patterns/tasks.md#structure).

### File viewer

Every file someone opens from a message, whether an image, a PDF, text, Markdown, a table, a web page, a video or audio, opens in the same viewer: a [Lightbox](../../packages/ui/src/components/lightbox/lightbox.md) with a `LightboxToolbar` on top and the file's own body below. Only the body changes with the type. People learn where a file's actions are once, and it holds for every file.

- **The toolbar is the same for every type:** the type badge, the file name, then the actions in a fixed order (Comments, Copy, Download, then Close last). An action that doesn't apply to a file is left out; the rest keep their order.
- **On a phone** the toolbar keeps the file name, one More menu and Close. Comments, Copy and Download move into the menu; when Download is the only action, it stays as its own button. The type badge and the gallery count drop out, because the name needs the room and the thumbnails already show the position.
- **Comments** on a document the viewer renders sit in a margin beside it, level with their passages; on a narrow viewer, markers beside the passages open them in a bottom sheet ([Comments](../patterns/comments.md)).
- **Plain text** sits in the [CodeBlock](../../packages/ui/src/components/code-block/code-block.md) frame, but its lines wrap. A file in the viewer is read top to bottom, and find in page has to reach every line. A snippet in a message still scrolls sideways.
- **Images** keep the stage, previous and next, and the thumbnails below the toolbar.

```example
lightbox/compositions/attachment-preview-shell
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

### Switching servers

- The trigger is the [WorkspaceButton](../../packages/ui/src/components/workspace-button/workspace-button.md) on every surface: the server's avatar, its name and a chevron.
- On desktop, the workspace button at the left of the web top bar opens the list as a menu under it, 256px wide ([Popover](../../packages/ui/src/components/popover/popover.md)). The strip of server avatars beside the button switches with one click.
- On a phone, the workspace button on Home opens the same list as a popover anchored under the top bar, 8px from each side ([Popover](../../packages/ui/src/components/popover/popover.md), [Navigation](../patterns/navigation.md#servers)).
- Make each row the workspace tile, its name and its address in Space Mono (`/launch`). Mark the current server with a check and a bold name; show the unread count of the others as a pink count, or a gray count when the server is muted.
- Give each row a drag handle, so people can reorder the list. The strip follows the same order.
- End the list, after a separator, with Join Community (until the person has joined it), Switch or Create Server and Invite Human.

## Every component

The [component index](../../packages/ui/src/components/) lists every component raft-ui exports, grouped by layer and then by category, with its summary and status. Deprecated components keep their docs but are left out of the navigation. The same list, for agents, is in `components.json` and `llms.txt`.

## Related

- [Feedback](../patterns/feedback.md): errors by scope.
- [Forms](../patterns/forms.md): which controls apply at once and which are saved.
- [Conversation](../patterns/conversation.md): where most of the parts built from existing ones appear.
- [Authoring](../authoring/README.md): the front matter that puts a component in its layer and category.
