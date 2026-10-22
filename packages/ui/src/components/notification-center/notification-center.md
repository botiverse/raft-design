---
title: NotificationCenter
summary: The list that opens from the bell and holds the state of the whole server — a computer offline, a quota nearly full, an update — until it changes.
status: stable
aliases: [Notifications]
layer: collaboration
category: inbox
related: [inbox-item, activity-inbox, popover, empty-state, banner, toast]
---

# NotificationCenter

The NotificationCenter is the list that opens from the bell. It holds the state of the whole server (a computer offline, a quota nearly full, an update) and keeps each notice until the situation changes. An attention dot on the bell says that something is unread.

## When to use

| Situation                                               | Use                                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| A problem or a change that affects the whole server     | NotificationCenter                                                |
| Something happened elsewhere that the person should see | Activity ([ActivityInbox](../activity-inbox/activity-inbox.md))   |
| Something in one panel failed                           | `PanelNotice` under the panel header ([Panel](../panel/panel.md)) |
| The result of an action the person took                 | [Toast](../toast/toast.md)                                        |

Errors by scope are in [Feedback](../../../../../design/patterns/feedback.md#errors-by-scope). Where a product puts the bell is on the product's own page.

## Anatomy

- `NotificationCenter`: the root. A non-modal popover.
- `NotificationCenterTrigger`: the bell. By default it draws the bell and the attention dot.
- `NotificationCenterPopup`: the list's popup, next to the bell.
  - `NotificationCenterHeader`: `NotificationCenterTitle` (Notifications) and `NotificationCenterCount`.
  - `NotificationCenterScroller` and `NotificationCenterList`: the notices.
  - `NotificationCenterEmptyState`: what the list says when it is empty ([EmptyState](../empty-state/empty-state.md)).
- `NotificationCenterItem`: one notice, in a `NotificationCenterItemRow`:
  - `NotificationCenterItemIcon`: a tile with an icon. A notice from the system has no who, so a tile stands where an avatar would ([InboxItem](../inbox-item/inbox-item.md#rules)).
  - `NotificationCenterItemContent`: `NotificationCenterItemTitle`, `NotificationCenterItemBody` and `NotificationCenterItemActions` with `NotificationCenterActionButton`s.

## Variants

| Variant                          | Use for                                                                                                                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `status="error"` on the icon     | Something stopped working: a computer offline, an agent that can't start. `warning-soft` tile, `octagon-alert` icon      |
| `status="warning"`               | Something will stop working soon: a quota nearly full, a key about to expire. `warning-soft` tile, `triangle-alert` icon |
| `status="info"`                  | News: an update. `info-soft` tile, `info` icon                                                                           |
| `viewport="mobile"` on the popup | The popup on a phone: the screen's width less 8px on each side, kept 8px from the screen's edges                         |
| `size` on the popup              | The popup's height: `sm`, `md` or `lg`                                                                                   |

## States

| State            | Look                                                                           |
| ---------------- | ------------------------------------------------------------------------------ |
| Unread (default) | The title in `foreground` at weight 700, and a pink attention dot on the right |
| `read`           | The title in `foreground-muted` at weight 600; no dot                          |

## Behavior

- Sort notices by severity: errors first, then warnings, then information.
- When the person dismisses a notice, don't show it again until the situation changes.
- Show the attention dot on the bell only while a notice is unread. The default trigger always draws the dot, so pass the bell alone as the trigger's children when nothing is unread.
- Float the popup next to the bell; it doesn't take space in the layout ([Elevation](../../../../../design/foundations/elevation.md#popups)).
- On a phone (`viewport="mobile"`), the popup is 8px from each screen edge, the same as the server list under the same top bar: it is `calc(100vw - 16px)` wide, with no cap, and its collision padding is 8px, so it sits 8px from both edges although it hangs from a bell at the right ([Elevation](../../../../../design/foundations/elevation.md#popups)). Pass `collisionPadding` to change it. On desktop it is 380px with Base UI's default collision padding.

## Content

- Write the notice in the same order as an inbox item: where (the computer, the server), then what happened, then at most 2 lines of detail ([InboxItem](../inbox-item/inbox-item.md#content)).

## Accessibility

- `NotificationCenter` wraps the Base UI `Popover`, non-modal by default; the popup doesn't take focus when it opens.
- The popup is named "Notification center" and the list "Notifications" unless you pass another `aria-label`.
- Give the trigger an accessible name, and include the unread state: `aria-label="Notifications, 2 unread"`. The bell and the dot are hidden from assistive technology.
- `NotificationCenterItemIcon` is an image (`role="img"`) named by its status (Error, Warning, Info).

## Rules

- Make the actions in a notice ink-outline small buttons, never pink; `NotificationCenterActionButton` does this ([InboxItem](../inbox-item/inbox-item.md#rules)).
- Use orange tiles for errors and warnings, not red ([Color](../../../../../design/foundations/color.md#soft-tints)).
