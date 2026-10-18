---
title: Choosing a component
summary: Which component to use when people pick something, when you tell them something, for what floats above the page, while they wait, and for a row.
---

# Choosing a component

Several components can look right for the same job. These tables pick one per situation. Each component's own doc says how to use it once chosen.

## When it applies

Whenever you put a control, a message, a popup or a row on a screen. Products don't override these choices; a product-specific case goes on the product's page.

## Rules

### Picking something

| You need | Use |
| --- | --- |
| To act on one thing | A menu ([DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md)); press and hold on a phone opens the same menu ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)) |
| Yes or no, applied at once | [Switch](../../packages/ui/src/components/switch/switch.md) |
| Yes or no, applied on Save | [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md) |
| One of 2 to 5 answers, submitted with a form | [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md) |
| Another view of the same content | [SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md) |
| Sections of one page, each with its own content | [Tabs](../../packages/ui/src/components/tabs/tabs.md) |
| One of up to 10 values | [Select](../../packages/ui/src/components/select/select.md) |
| One of many values | A select with a search row at the top of its list ([ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md)) |
| A few of several values | A multi-select: a box before each item, and the field shows the chosen values ([ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md) with `multiple`) |
| A few of many values (people, agents, labels) | A multi-select with search: chosen values become chips in the field, and typing continues after them ([ComboboxSelect](../../packages/ui/src/components/combobox-select/combobox-select.md) with `multiple`, or [Combobox](../../packages/ui/src/components/combobox/combobox.md) with its chips) |
| To filter a list | A filter: a select or combobox opened from a [PickerTriggerButton](../../packages/ui/src/components/picker-trigger-button/picker-trigger-button.md) |
| To change one property of an item in place | The value in a [DescriptionList](../../packages/ui/src/components/description-list/description-list.md) opens a picker |

### Telling people something

| Situation | Use | Stays |
| --- | --- | --- |
| Something the person just did has a result | [Toast](../../packages/ui/src/components/toast/toast.md) | A few seconds |
| They need to know it before acting | [Banner](../../packages/ui/src/components/banner/banner.md), inside a dialog or form | Always |
| Something in one panel failed: an agent won't start, a setting didn't save | A full-width banner under the panel header (`PanelNotice`, [Panel](../../packages/ui/src/components/panel/panel.md)) | Until it is fixed |
| The state of the whole workspace: a computer offline, a quota nearly full, an update | The notification center ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)), with an attention dot on the bell | Until it changes |
| Something happened elsewhere that the person should see | Activity ([ActivityInbox](../../packages/ui/src/components/activity-inbox/activity-inbox.md)); its entry point shows an attention dot or a count | Until it is read |
| An agent needs approval | An action card in the conversation ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)), also listed in Activity | Until it is handled |
| The person must decide now | [Dialog](../../packages/ui/src/components/dialog/dialog.md) | Until they decide |
| An input is invalid | The input's error state ([Field](../../packages/ui/src/components/field/field.md)) | Until it is fixed |
| What an icon means | [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) | While hovered |

- Never put anything in a toast that would confuse people if they missed it.

### Overlays

| Situation | Use |
| --- | --- |
| One sentence on hover | [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) |
| A person or agent, on hover | A profile card ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)) |
| A list of actions, on click or press and hold | [DropdownMenu](../../packages/ui/src/components/dropdown-menu/dropdown-menu.md) |
| One value, on click | [Select](../../packages/ui/src/components/select/select.md), with search when there are many values |
| Several values, on click | A multi-select, with search when there are many values. Choosing a value doesn't close the list |
| A little input, on click | [Popover](../../packages/ui/src/components/popover/popover.md) |
| Details and settings people look at for a while | [Drawer](../../packages/ui/src/components/drawer/drawer.md) |
| A large form filled in one pass | The wide [Dialog](../../packages/ui/src/components/dialog/dialog.md); see [Forms](./forms.md#the-large-form-dialog) |
| A place to go, on a phone (switch workspace, Working now) | A bottom sheet ([Drawer](../../packages/ui/src/components/drawer/drawer.md)). Picking a value is still a select list; acting on something is still a menu |
| A short explanation, on a phone | A bottom sheet ([Drawer](../../packages/ui/src/components/drawer/drawer.md)) |
| A confirmation | [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md) |
| Task details | A centered dialog, at most 760px wide, full screen on a phone ([Tasks](./tasks.md)) |

- Put a scrim behind every centered overlay: dialogs, confirmations, search, task details, large forms. How overlays move is in [Motion](../foundations/motion.md#usage).

### Waiting

| Situation | Use |
| --- | --- |
| The layout is known | [Skeleton](../../packages/ui/src/components/skeleton/skeleton.md) |
| The duration is unknown, and there is no layout to hold | The pixel spinner ([Spinner](../../packages/ui/src/components/spinner/spinner.md)) |
| The percentage is known | [Progress](../../packages/ui/src/components/progress/progress.md) |
| A button started the wait | The button's loading state ([Button](../../packages/ui/src/components/button/button.md)) |

- Don't use pink for any of these. They are passive.

### Rows

| Where | Use |
| --- | --- |
| A phone list: channels, direct messages, settings, members | [ListRow](../../packages/ui/src/components/list-row/list-row.md) |
| Agents and people on a detail or profile page | [ListRow](../../packages/ui/src/components/list-row/list-row.md), in an inset group |
| The desktop sidebar | The sidebar row ([Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)) |
| Activity and notifications | [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md) |
| A message found by search | The search result row ([Search](../../packages/ui/src/components/search/search.md)) |
| A task | [TaskCard](../../packages/ui/src/components/task-card/task-card.md), on a board or in a list |

## Related

- [Composites](./composites.md): things built from these components.
- [Feedback](./feedback.md): errors by scope.
- [Forms](./forms.md): which controls apply at once and which are saved.
