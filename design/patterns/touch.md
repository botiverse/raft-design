---
title: Touch
summary: The gestures of a touch screen (swipe, press and hold, pull to refresh, pinch, pan and double tap), the visible control that does the same as each one, and how zoomable content shares the page's scroll.
---

# Touch

On a touch screen people swipe, press and hold, pull, pinch and double tap. A gesture is fast for someone who knows it and invisible to everyone else, so in Raft every gesture is a shortcut: a button or a menu item on screen does the same thing. Three follow the convention of phone apps instead: press and hold opens a message's menu ([Press and hold](#press-and-hold)), an Activity row is marked done, or stops being followed, with a swipe each way or from its press-and-hold menu, as in mail apps ([Swipe](#swipe)), and pull to refresh only hurries a list that updates on its own ([Pull to refresh](#pull-to-refresh)). These rules hold on the web on a touch screen, on iOS and on Android alike. Which way a gesture goes and how its feedback looks follow the platform.

## When it applies

Every screen that can be used by touch, at any width. The rest of touch is on the pages that own it:

- How hover, press and focus look on a touch screen: [States](../foundations/states.md#touch-screens).
- Where a row's hover actions go on a touch screen: [Responsive layout](./responsive.md#touch-screens).
- Which overlay opens on a phone, a bottom sheet or an anchored one: [Page structure](./page-structure.md#overlays-on-a-phone).
- Target sizes and the space between targets: [Spacing](../foundations/spacing.md#hit-targets).

The platforms' own bars (the status bar, a system tab bar) are not covered here.

## Structure

| Gesture | What it does | The visible way to do the same |
| --- | --- | --- |
| Press and hold on something with a menu: a row, a channel, a task | Opens its menu ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)) | A visible control that opens the same menu, usually ⋯ ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md#accessibility)) |
| Press and hold on a message | Opens the message menu: the platform convention for reaching it on a touch screen | None: press and hold is how people reach a message's menu ([Press and hold](#press-and-hold)) |
| Press and hold on a task card, then move | Drags the card, after 200ms ([TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md)) | The status chip on the card, or Status in the task's details ([Tasks](./tasks.md#rules)) |
| Swipe left or right on an Activity row | Mark as Done to the left; to the right, stop following it: Unfollow Thread on a thread, Mute Activity on a channel. People can change both in Settings ([Swipe](#swipe)) | The same action in the row's press-and-hold menu, which screen readers also offer as an action of the row ([Swipe](#swipe)) |
| Swipe a drawer, a bottom sheet or a toast toward its edge | Closes it | ×, Back or a button in it; `ToastClose` ([Drawer](../../packages/ui/src/components/drawer/drawer.md#accessibility)) |
| Pull down at the top of a list, in the native apps | Reloads a list loaded from the server, as an extra | None needed: Raft's lists update on their own, and a list that failed to load offers Retry ([Feedback](./feedback.md#empty-loading-and-failed)) |
| Pinch, pan and double tap on an image or a diagram | Zooms, and moves around a zoomed view | Zoom controls in its toolbar, or a button that opens it full screen ([Zoomable content](#zoomable-content)) |

## Rules

### Gestures

- Give every gesture a visible equivalent: a button or a menu item that does the same thing. A gesture can't be seen and not everyone can perform it, and [WCAG 2.5.1](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) asks that anything done with a swipe or with two fingers can also be done with a single tap. So nobody has to learn a gesture to use Raft. The exceptions are press and hold on a message, the swipe on an Activity row, whose equivalent is in the row's press-and-hold menu, and pull to refresh, for the reasons below.
- Follow the platform for which way a swipe goes and how pull to refresh looks. People bring these from every other app on their phone.

### Swipe

- Put swipes only on Activity rows, one action each way, as mail apps do (Mail, Gmail, Outlook). By default a swipe to the left marks the row done, and a swipe to the right stops following it: Unfollow Thread on a thread, Mute Activity on a channel ([Responsive layout](./responsive.md#touch-screens)). Both only change what the person gets, and both are undone from the same menu (Follow Thread, Unmute Activity). A DM can't be muted and a mention always reaches the person, so their rows don't move to the right.
- Put every swipe action in the row's press-and-hold menu, on every kind of row it acts on: a channel's row has Mute Activity in its menu because its swipe does.
- Let people choose each side's action in Settings (Swipe actions), from the actions that can go on a swipe, or None: Mark as Done, Mark as Read or Unread, and Unfollow or Mute. An action can go on a swipe when it needs no confirmation, since a swipe can't stop to ask, and when most rows have it, under its own name for each kind of row if need be. A row that doesn't have the action doesn't move on that side: a swipe never reveals a button that does nothing. Don't add an action to the menu only to put it on a swipe. The setting is in the native apps; the web has no swipes.
- Say in the Undo toast what the swipe did, naming the conversation: "Muted activity in #launch-week". A swipe to the right does different things on different rows.
- Follow the platform for how a swipe looks and ends: how far it goes, whether a full swipe applies the action or reveals its button first, and the action's icon on the revealed side.
- Don't also put the swipe's action as a button on every row: on a touch screen, an Activity row's Mark as Done is on the swipe and in its press-and-hold menu, and the row shows no button at rest, as in Mail, Gmail and Outlook. A check on every row makes a phone's list a column of buttons, and most rows of Activity are unread, so showing it only on unread rows wouldn't help. Press and hold is a single touch with no path, so the menu is the alternative [WCAG 2.5.1](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) asks for. Offer the action to screen readers as an action of the row as well: a custom accessibility action in the native apps (`accessibilityCustomActions` on iOS, `customActions` on Android), and on the web the hidden button, which stays in the focus order ([InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#accessibility)).
- Show Undo in a toast after any swipe that changes something ([Toast](../../packages/ui/src/components/toast/toast.md)). A swipe can happen by accident while someone scrolls, and the row it acted on often leaves the list, so it can't be reversed in place. This is the exception to acting without a toast when the action can be reversed in the same place ([Feedback](./feedback.md#confirming)).
- Never put an action on a swipe that is confirmed with a dialog: stopping an agent, removing someone, archiving or deleting ([Feedback](./feedback.md#confirming)). A swipe can't stop to ask, and an Undo toast doesn't replace the question.
- Never make a swipe the only way to close something: drawers and sheets keep ×, Back or a button, and toasts keep `ToastClose` ([Accessibility](../foundations/accessibility.md#touch)).

### Press and hold

- Make press and hold open the thing's menu, the same menu that right-click and ⋯ open ([States](../foundations/states.md#touch-screens)). Press and hold opens a menu only on something that has one.
- Open a message's menu by press and hold, with no ⋯ on the message ([Conversation](./conversation.md#actions)). It is the convention of the chat apps people already use (Slack, Discord, Telegram, WeChat), so they know it, and a ⋯ on every message would clutter the conversation. Press and hold is a single touch with no path, so it is not one of the gestures [WCAG 2.5.1](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) asks to replace; screen readers perform it too. Everything else with a menu keeps a visible control for it, except an Activity row, for the same reason ([Swipe](#swipe)).
- Never make a tooltip the only explanation. On a touch screen it may not open: put what it says in the interface, and give every icon button its accessible name.
- On the web, don't build a press-and-hold tooltip: raft-ui's [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) opens for a mouse and for keyboard focus only (Base UI's trigger ignores touch). In the native apps, follow the platform: on Android, a long press on an icon button shows its Material tooltip.
- Never give a press-and-hold tooltip to something whose press and hold opens a menu: press and hold means one thing on one target, and the menu wins. A platform tooltip that opens on press and hold (Material's, in the Android app) goes only on things without a menu.
- Start a drag only after a 200ms press and hold, so scrolling a list doesn't move a card ([TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md)).

### Pull to refresh

Raft's lists update on their own, and a list that failed to load offers Retry ([Feedback](./feedback.md#empty-loading-and-failed)), so no list needs a visible refresh control. Phone chat apps such as Slack and Feishu have none.

- In the native apps, offer pull to refresh as an extra, only on a list loaded from the server. A list held on the device has nothing to reload, and a pull that does nothing reads as broken.
- Use the platform's refresh indicator and motion.
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
