---
title: Raft Chat — Settings
summary: The Settings destination — its groups, the pages they open, searching settings, Notifications, Sign out and the danger zones.
---

# Raft Chat — Settings

Settings lists the person's own settings, the server's settings and Raft's resources in groups. On desktop the groups are the sidebar and a page opens beside them; on a phone they are a pushed page titled Settings, opened from the server tab's popover ([Navigation](../../patterns/navigation.md#the-server-tab-on-a-phone)), and each row opens another pushed page, with Back to the list.

## Structure

### The list

```example
sidebar/compositions/settings-list
```

1. **The header**: on a phone, the pushed page's header, Settings, with Back; on desktop, Settings.
2. **A search field**, Search settings, above the groups ([Searching settings](#searching-settings)).
3. **The groups**, each a group label and sidebar rows with an icon and a name. Members and Computers are not in the list on a phone: they are buttons in the server tab's popover.
   - Personal: Account, Language & region, Appearance, Notifications.
   - On the server, named after it: its Theme and its Notifications.
   - Workspace: Server profile, then what the person may see and the server has turned on: RaftBench, Plan & billing, Administration, IM bridges, Applications, Labs, AI providers.
   - Resources: About, Documentation (a link to the documentation site), Feedback, Release notes.

- Feedback shows a pink pixel when there is a new reply, and on a phone the Computers button in the server tab's popover shows one when a computer needs attention, as does the Settings button for a feedback reply ([Raft Chat](./README.md#attention-dots)).
- On desktop, Account opens by default and its row is the yellow sticker. On a phone, nothing is selected until a row is opened.

### A settings page

- Build each page from the cards in [Forms](../../patterns/forms.md). Language & region has no Save: each value applies when it is chosen ([Forms](../../patterns/forms.md#settings-that-apply-at-once)).

### Searching settings

A search field at the top of the list finds a setting by what people call it, wherever it is. It searches only the settings, so it says so: its placeholder is Search settings. It is a search started inside a place, which a phone allows outside the Search tab ([Navigation](../../patterns/navigation.md#search-on-a-phone)) (artin, 2026-11-06, #proj-raft-ui:#204).

- **Where:** above the groups, on desktop at the top of the sidebar and on a phone at the top of the Settings page, 44px high on touch. It is an InputGroup with the search icon and, once there is text, a clear button ([InputGroup](../../../packages/ui/src/components/input-group/input-group.md)), inside `role="search"`.
- **What it matches:** each setting's name and its description, the section and page it is on, and the other words people use for it, in the display language and in English: "Enter" or "Return" finds how messages are sent. Case and full-width or half-width letters don't matter. Only the settings this person can see are found, the same ones the list shows them. Which settings are searchable and the words for each are the implementation's, not this page's.
- **Results:** as soon as there is text, the results take the groups' place. Each is the setting's name over a line with its page and section ("Appearance · Message box"), the matched words marked as in search ([Search](../../../packages/ui/src/components/search/search.md#content)), and, when the match was another word for it, that word on the second line. Names come first, then other words, then descriptions; within each, the list's order. On a phone a result is the list's row with a second line, about 56px.
- **Opening one:** opens its page, scrolls the setting into view and marks it as located ([Located](../../foundations/states.md#located)). On desktop the results stay in the sidebar with the open one selected, so the next can be opened from there. On a phone the page is pushed, and Back returns to the results with the query kept.
- **No match:** the results' place shows an EmptyState: No settings match "launch", Try another word, or search everything for messages and people, with one button that searches everything with the same query ([EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)).
- **Keyboard:** ⌘F or Ctrl+F in Settings focuses the field, on the web and in the desktop app. Down moves into the results and Enter opens the highlighted one ([Search](../../../packages/ui/src/components/search/search.md#behavior)). Escape clears the query; with an empty field it leaves the field.

Results jump to the setting rather than show it to change in place: a setting changed where it lives keeps its page's context, such as a danger zone's warning, and pages drawn by the web inside the app can be opened at a setting but not taken apart.

### Notifications

The page has:

- an Add Raft to Home Screen card, with Add, on a phone that can install Raft and hasn't yet;
- a Push Notifications card that says what it delivers (direct messages, direct mentions and replies in followed threads) and its state, with Enable push notifications, or Disable and Send test push once it is on. It ends with a Mute this server switch, which applies at once.

In the desktop app the page is one Desktop notifications card saying that the system manages notifications, with Send a test notification.

## Rules

- Put Sign out at the end of Account, in a Session card: an orange button that opens a confirmation.
- Put the danger zone at the end of Server profile: Leave server, and for the owner Delete server ([Forms](../../patterns/forms.md#danger-zone)). Where account deletion is turned on, Account ends with a danger zone of its own: Delete account.
