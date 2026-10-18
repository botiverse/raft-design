---
title: ActivityInbox
summary: The Activity panel — a list of inbox items with its views, filters and selection toolbar, where selecting an item opens it beside the list.
status: stable
aliases: [Activity]
category: content
related: [inbox-item, notification-center, panel, sidebar, empty-state]
---

# ActivityInbox

ActivityInbox lays out Activity: the panel that lists what happened elsewhere and waits for the person, as [InboxItem](../inbox-item/inbox-item.md) rows. Selecting an item opens it beside the list. The panel has views (Active, Saved, Done), filters, a search field and a toolbar for acting on several items at once.

```example
activity/compositions/activity-inbox
```

## When to use

| Situation                                                        | Use                                                                 |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Mentions, approvals, hand-offs and replies the person should see | ActivityInbox                                                       |
| The state of the whole workspace                                 | [NotificationCenter](../notification-center/notification-center.md) |
| The result of an action the person took                          | [Toast](../toast/toast.md)                                          |

Where a product puts the way into Activity is on the product's own page.

## Anatomy

- `ActivityInboxPanel`: the panel. It holds a [Panel](../panel/panel.md) header with the title Activity. Required.
- `ActivityInboxSidebar`: the column of views and filters on the left, as sidebar rows ([Sidebar](../sidebar/sidebar.md)). Hidden on a phone.
- `ActivityInboxControls`: the row above the list: All / Unread and a search field.
- `ActivityInboxSelectionToolbar`: a select-all checkbox, then either the sort menu or `ActivityInboxSelectionCount` and the actions for the selected items.
- `ActivityInboxViewport`: the scrolling list of [InboxItem](../inbox-item/inbox-item.md) rows.
- `ActivityInboxLoadingMore`: one line at the end of the list while more items load.

## States

| State        | Use for                                                                                                                     |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Loading      | Skeleton rows in the shape of inbox items ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)) |
| Loading more | `ActivityInboxLoadingMore` under the last item                                                                              |
| Empty        | An [EmptyState](../empty-state/empty-state.md) that says what will appear here                                              |

```example
activity/compositions/loading-activity
```

```example
activity/compositions/loading-more-activity
```

```example
activity/compositions/empty-activity
```

## Behavior

- Open a selected item beside the list, and mark it `active` on its row.
- On a phone, replace the sidebar with one button in the panel header that opens the views and filters.
- When items are selected, replace the sort menu with the count and the actions for them.
- Put Mark All Read in the panel header as a small ghost button, when the panel offers it.

## Accessibility

- The parts are plain layout elements; raft-ui adds no Base UI primitive. The views and filters are sidebar rows, the read filter is [Tabs](../tabs/tabs.md), and the sort is a [DropdownMenu](../dropdown-menu/dropdown-menu.md).
- Give the panel title a heading level (`render={<h2 />}`).
- Mark the current view with `aria-current="page"` and a pressed filter with `aria-pressed`.
- Name the select-all checkbox (`aria-label="Select all visible activity"`) and the search field (`aria-label="Search activity"`).
- Set `aria-busy` on `ActivityInboxPanel` while it loads.
