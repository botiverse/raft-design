---
title: Touch
summary: The gestures of a touch screen (swipe, press and hold, pull to refresh, pinch, pan and double tap), the visible control that does the same as each one, and how zoomable content shares the page's scroll.
---

# Touch

On a touch screen people swipe, press and hold, pull, pinch and double tap. A gesture is fast for someone who knows it and invisible to everyone else, so in Raft every gesture is a shortcut: a button or a menu item on screen does the same thing. Messages are the one exception today ([Press and hold](#press-and-hold)). These rules hold on the web on a touch screen, on iOS and on Android alike. Which way a gesture goes and how its feedback looks follow the platform.

## When it applies

Every screen that can be used by touch, at any width. The rest of touch is on the pages that own it:

- How hover, press and focus look on a touch screen: [States](../foundations/states.md#touch-screens).
- Which of a row's hover actions show at rest on a touch screen: [Responsive layout](./responsive.md#touch-screens).
- Which overlay opens on a phone, a bottom sheet or an anchored one: [Page structure](./page-structure.md#overlays-on-a-phone).
- Target sizes and the space between targets: [Spacing](../foundations/spacing.md#hit-targets).

The platforms' own bars (the status bar, a system tab bar) are not covered here.

## Structure

| Gesture | What it does | The visible way to do the same |
| --- | --- | --- |
| Press and hold on something with a menu: a row, a channel, a task | Opens its menu ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)) | A visible control that opens the same menu, usually ⋯ ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md#accessibility)) |
| Press and hold on a message | Opens the message menu | None yet: a message has no ⋯, and its hover toolbar is hidden on a touch screen ([Press and hold](#press-and-hold)) |
| Press and hold on a task card, then move | Drags the card, after 200ms ([TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md)) | The status chip on the card, or Status in the task's details ([Tasks](./tasks.md#rules)) |
| Swipe on a row | The row's main action: Mark as Done on an Activity row | The action's button, at rest at the end of the row ([InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#behavior)) |
| Swipe a drawer, a bottom sheet or a toast toward its edge | Closes it | ×, Back or a button in it; `ToastClose` ([Drawer](../../packages/ui/src/components/drawer/drawer.md#accessibility)) |
| Pull down at the top of a list | Reloads a list loaded from the server | Retry when it failed to load ([Feedback](./feedback.md#empty-loading-and-failed)). The visible way to reload a list that loaded is not decided yet |
| Pinch, pan and double tap on an image or a diagram | Zooms, and moves around a zoomed view | Zoom controls in its toolbar, or a button that opens it full screen ([Zoomable content](#zoomable-content)) |

## Rules

### Gestures

- Give every gesture a visible equivalent: a button or a menu item that does the same thing. A gesture can't be seen and not everyone can perform it, and [WCAG 2.5.1](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) asks that anything done with a swipe or with two fingers can also be done with a single tap. So nobody has to learn a gesture to use Raft.
- Follow the platform for which way a swipe goes and how pull to refresh looks. People bring these from every other app on their phone.

### Swipe

- Use a swipe on a row only for the row's main action, the one its button already does at rest. On an Activity row, a swipe to the left reveals Mark as Done and releasing applies it ([Responsive layout](./responsive.md#touch-screens)).
- Show Undo in a toast after any swipe that changes something ([Toast](../../packages/ui/src/components/toast/toast.md)). A swipe can happen by accident while someone scrolls, and the row it acted on often leaves the list, so it can't be reversed in place. This is the exception to acting without a toast when the action can be reversed in the same place ([Feedback](./feedback.md#confirming)).
- Never put an action on a swipe that is confirmed with a dialog: stopping an agent, removing someone, archiving or deleting ([Feedback](./feedback.md#confirming)). A swipe can't stop to ask, and an Undo toast doesn't replace the question.
- Never make a swipe the only way to close something: drawers and sheets keep ×, Back or a button, and toasts keep `ToastClose` ([Accessibility](../foundations/accessibility.md#touch)).

### Press and hold

- Make press and hold open the thing's menu, the same menu that right-click and ⋯ open ([States](../foundations/states.md#touch-screens)). Press and hold opens a menu only on something that has one.
- A message is the one exception to a visible equivalent today: it has no ⋯, and its hover toolbar is hidden on a touch screen, so there the message menu opens only by press and hold ([Conversation](./conversation.md#actions)). Whether to give messages a visible ⋯ on a touch screen is not decided yet.
- Don't count on press and hold for a tooltip. raft-ui's [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) opens for a mouse and for keyboard focus only (Base UI's trigger ignores touch), so on a touch screen what a tooltip says must also be in the interface or in the thing's accessible name.
- Start a drag only after a 200ms press and hold, so scrolling a list doesn't move a card ([TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md)).

### Pull to refresh

- Offer pull to refresh only on a list loaded from the server. A list held on the device has nothing to reload, and a pull that does nothing reads as broken.
- In the native apps, use the platform's refresh indicator and motion.
- On the web, don't build a pull to refresh. The browser's own pull reloads the page, and a custom pull fights it; the browser's reload is the web's platform behavior. Keep Retry when a load fails.

### Zoomable content

An image in the file viewer or a diagram in a message can be zoomed. It sits in a page that scrolls, and the two must not fight over the same finger.

- Never let zoomable content take the page's scroll until it is zoomed in. At its fitted size, a one-finger drag on it scrolls the page, as anywhere else.
- Pinch to zoom, around the point between the fingers.
- On the web, take a pinch for the content only where it is open on its own, such as the full-screen file viewer. Elsewhere, such as a diagram in a message, leave the pinch to the browser, which zooms the page: taking two-finger gestures there blocks page zoom for anyone whose fingers land on the content.
- Pan with a one-finger drag only while it is zoomed in.
- Double tap to switch between the fitted size and one zoom step, at the point tapped; how far that step goes follows the platform.
- Give zoom a visible control as well, such as zoom buttons in its toolbar or a button that opens it full screen. raft-ui's [Lightbox](../../packages/ui/src/components/lightbox/lightbox.md) doesn't zoom yet.

## Related

- [States](../foundations/states.md#touch-screens): hover, press and focus on a touch screen.
- [Accessibility](../foundations/accessibility.md#touch): touch for everyone, including screen reader users.
- [Responsive layout](./responsive.md#touch-screens): row actions on a touch screen.
- [Page structure](./page-structure.md#overlays-on-a-phone): bottom sheets and anchored overlays on a phone.
- [Spacing](../foundations/spacing.md#hit-targets): target sizes.
