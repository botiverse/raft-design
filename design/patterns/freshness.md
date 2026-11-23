---
title: Freshness
summary: How a page stays right after the app was in the background, offline or disconnected — one signal that checks again, content that stays while it does, progress only when someone waits, saying "may be out of date" instead of pretending, when an update is announced, and what each kind of component is responsible for.
---

# Freshness

**What people see should be true. When the product isn't sure it is, it checks by itself, and the check doesn't get in the way.**

Realtime updates keep Raft's pages current ([Navigation](./navigation.md#refreshing)), but while the app is in the background, the phone is locked, the network is gone or a browser tab sleeps, some updates are always missed. This page says how the product catches up, how the screen behaves while it does, and what each kind of component owes. It is the other half of [Refreshing](./navigation.md#refreshing): a page fed by realtime updates has no pull to refresh, so it has to catch up on its own (artin, 2026-11-19, #proj-mobile:#198; draft and survey of the mobile app by Lagoon).

Apple, Android and HarmonyOS say the same: show what you have at once and fetch the new in the background (Apple HIG, Loading), come back to the state people left (Apple HIG, Launching; Android, Save UI states), don't hide old data behind a placeholder (Apple HIG, Widgets), and while a view can't be seen, only note that it is owed an update, then update it once it shows (HarmonyOS, passive refresh of widgets). Android also lets people pull to refresh pages that update by themselves; Raft doesn't, on purpose ([Refreshing](./navigation.md#refreshing)).

## When it applies

Every platform: web, desktop, iOS and Android. Each rule names the moment it applies to on the web as well as in the apps, since the design system is shared.

## Rules

### Coming back checks once

- When the app comes back to the foreground, the realtime connection is joined again, the network returns or the computer wakes, check what is on screen again, once. On the web the same moments are the tab becoming visible, the window taking focus, `online` and a page restored from the back-forward cache.
- One coming back is one check: the events that arrive together (foreground, then reconnect, then online) are merged into one. A return while the connection never dropped, less than a minute after the last check, needs none: on a desktop the window takes focus every time someone switches to it, and checking each time would be work for nothing.
- One signal. Pages and cards don't each listen to the app's lifecycle: the owner of the data subscribes to one "came back" signal, so every place catches up the same way and none is forgotten.
- Check what is on screen and what will show at once (the page Back returns to, badges, widgets). A page that can't be seen only notes that it is owed a check, and is checked when it shows.
- After 15 minutes locked, during which Vault changed an approval card to "Approved by Alice", unlocking the phone shows the card approved within a second, with nothing for the person to do.

### Content stays while it updates

- Keep what is on screen and replace it in place when the new data arrives. Don't go back to a skeleton or "Loading…", and don't empty a list to fill it again.
- Keep the scroll position, what is expanded, drafts and filters: the person comes back to the page they left, then it updates.
- When the check fails, keep the content, never an error page. A check the product started fails silently and is tried at the next coming back; a refresh the person asked for shows the `warning` toast of [Refreshing](./navigation.md#refreshing). If it keeps failing, say so where the data is ([Not sure, say so](#not-sure-say-so)).
- The server's copy wins when it is not older than the one on screen (by revision, update time or sequence). Don't keep "the copy already loaded" and add exceptions field by field.

### Progress only when someone waits

| Situation | Show |
| --- | --- |
| First visit, nothing to show yet | A skeleton, after 1 second ([Feedback](./feedback.md#empty-loading-and-failed)) |
| The person asked: a pull, Retry, a button that reads again | That control's own progress: the pull's indicator, the button's loading |
| The product checks again on its own | Nothing |

A spinner or pull indicator that turns every time the app comes back says "this page can't be trusted until it stops", the opposite of what [Refreshing](./navigation.md#refreshing) promises. The Computers page in the mobile app used to turn both on every return; it now checks silently.

### Not sure, say so

- When data may be out of date and can't be confirmed now (offline, the server says it is serving a stale copy, the check has failed several times), say so on one line in `foreground-hint` where the data is: "Updated 10 min ago" or "May be out of date". It is not an error, so not orange. A computer whose data is past `staleAfter` already shows this way ([Computers](../products/raft-chat/computers.md)).
- Put the line with the data it is about: under a card, at the top of a list, in a widget's corner. Not a banner across the app: what is out of date is that data, and the line next to it says which.
- Something with an expiry (a card button's signed handle, an action card's `expiresAt`, a QR code, an invite link) checks its age before it is used and quietly reads itself again when it has expired, then acts. The person never sees the expiry error first.
- Never show "couldn't read" as "nothing": no "0 unread" and no empty list when the read failed ([Feedback](./feedback.md#empty-loading-and-failed)).

### When an update is announced

- By default it isn't: changing in place is the announcement. At most one fade, as [Motion](../foundations/motion.md) allows for a change of state.
- Announce it only when:
  1. It changes what the person is about to act on. If a card turns "Approved by Alice" while the person is about to press Approve, the button goes and the card says why; nothing changes under the finger without a word.
  2. It arrives out of view while the person reads further up: it moves nothing in view, and the count shows on the way to it, "3 new messages" on Back to bottom ([Conversation](./conversation.md)).
  3. The object has its own mark for a change, such as a channel's announcement strip going bold until each person opens it ([Channel](../products/raft-chat/channel.md)).
- Never a toast saying a refresh finished.

### Reconnecting

- When the connection drops, leave the screen as it is; don't gray it out. Most drops come back within seconds, unseen. Only when it stays down for more than 5 seconds and the person is doing something that needs it, say so there.
- In a conversation that is one line above the composer, "Reconnecting…", the same line as for an agent that can't reply ([Identity and presence](../people-and-agents/identity-and-presence.md#an-agent-that-cant-work-now)), and in its place while it shows: until the connection is back, no message reaches the agent either, so one line says the one thing that is true. The strip offering to add someone a sent message mentioned ([Conversation](./conversation.md)) is about that message, and stays above both.
- Once reconnected, run the same check as coming back. Retry with backoff and jitter so that many clients coming back together don't flood the server.

## What each kind of component owes

The more directly people act on something, the fresher it must be; a summary may lag a little, but never contradict what it summarizes.

| Component | What it is | What it owes |
| --- | --- | --- |
| Card in a message (an App card, an action card) | A live object people act on | Changes in place with the object. Its buttons work only while their credentials are valid, and check them first. After acting it shows the object's new state. It is never older than the messages around it |
| Row in a list (Home, Activity, a task) | A summary of an object and the way into it | Agrees with what opens: a row never says the opposite of the page behind it. A few seconds' lag is fine; after coming back, none |
| Page header (channel, task, agent) | Who or what this is, and its key state | Names and avatars may be cached. The key state (a task's status, an agent's or computer's state) is checked on coming back: people decide whether to act from it |
| Timeline (channel, thread, DM) | Events in order, whose messages may change in place | Appends what is new and replaces what changed. Coming back catches up both: new messages, and changed ones (cards, deletions, reactions, reply counts) |
| Badge or count | A number that sums up a list | Comes from the same source as its list and changes with it: a list read while its badge still counts it is a bug |
| Snapshot page (Saved, search results) | A list read once when it opens | Not live; has pull to refresh ([Refreshing](./navigation.md#refreshing)) |
| Widget, notification | A summary outside the app | Shows old data with its time rather than a placeholder, and updates when the app has checked |

## Don't

- Don't add pull to refresh or a Refresh button to a live page to cover for missed updates.
- Don't give each card or page its own lifecycle listener.
- Don't reload the whole page, scroll to the top or close what was open when the app comes back.
- Don't poll instead of checking on coming back. Poll only facts whose updates aren't reliable (such as an agent's state), and only in the foreground.

## Open

Both are listed in [Open questions](../decisions/open-questions.md), with the default to use until they are settled.

- How old data has to be before a failed check says "may be out of date": one threshold, or one per kind (state 30 seconds, lists 60, cards 5 minutes). Until settled: 60 seconds since the last check that succeeded, for everything.
- Whether hosted pages (Artifacts, App pages) are asked to check again when they become visible, in the App developer guide. Until settled: not asked; Raft checks the card and the frame around them.

## Related

- [Navigation](./navigation.md#refreshing): pull to refresh, only on snapshot pages
- [Feedback](./feedback.md#empty-loading-and-failed): empty, loading and failed
- [Cards in messages](./cards-in-messages.md)
- [Status](./status.md)
