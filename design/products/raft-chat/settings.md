---
title: Raft Chat — Settings
summary: The Settings destination — the Personal, Workspace and Resources groups, the pages they open, Notifications, Log Out and the danger zone.
---

# Raft Chat — Settings

Settings lists the person's own settings, the server's settings and Raft's resources in three groups. On desktop the groups are the sidebar and a page opens beside them; on a phone they are the top-level page of the More tab, after a first group of Members and Computers, and each row opens a pushed page that covers the tab bar, with Back to the list.

## Structure

### The list

```example
sidebar/compositions/settings-list
```

1. **The header**: Settings, on the frame on a phone, in the 56px navigation row.
2. **Three groups**, each a group label and sidebar rows with an icon and a name. On a phone, a group of Members and Computers comes first; guests don't have it:
   - Personal: Account, Language & Region, Appearance, Notifications.
   - Workspace: Server Profile, then what the person may see and the server has turned on: RaftBench, Plan & Billing, Administration, IM Bridges, Applications, Labs, MCP Servers, AI Providers.
   - Resources: About, Documentation (a link to the documentation site), Feedback, Release Notes.

- Feedback shows a pink pixel when there is a new reply, and on a phone Computers shows one when a computer needs attention ([Raft Chat](./README.md#attention-dots)).
- On desktop, Account opens by default and its row is the yellow sticker. On a phone, nothing is selected until a row is opened.

### A settings page

- Build each page from the cards in [Forms](../../patterns/forms.md). Language & Region is one card with its own Save.

### Notifications

The page has:

- an Add Raft to Home Screen card, with Add, on a phone that can install Raft and hasn't yet;
- a Push Notifications card that says what it delivers (direct messages, direct mentions and replies in followed threads) and its state, with Enable Push Notifications, or Disable and Send Test Push once it is on. It ends with a Mute this server checkbox, with Save.

In the desktop app the page is one Desktop notifications card saying that the system manages notifications, with Send a test notification.

## Rules

- Put Log Out at the end of Account, in a Session card: an orange button that opens a confirmation.
- Put the danger zone at the end of Server Profile: Leave Server, and for the owner Delete Server ([Forms](../../patterns/forms.md#danger-zone)). The account can't be deleted from Settings.
