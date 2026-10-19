---
title: Raft Chat — Settings
summary: The Settings destination — the Personal, Workspace and Resources groups, the pages they open, Notifications, Log out and the danger zone.
---

# Raft Chat — Settings

Settings lists the person's own settings, the workspace's settings and Raft's resources in three groups. On desktop the groups are the sidebar and a page opens beside them; on a phone they are the Settings tab's top-level page, and each row opens a pushed page that covers the tab bar. Which settings apply at once and which are saved is in [Forms](../../patterns/forms.md).

## Structure

### The list

```example
sidebar/compositions/settings-list
```

1. **The header**: Settings, on the frame on a phone, in the 56px navigation row.
2. **Three groups**, each a group label and sidebar rows with an icon and a name:
   - Personal: Account, Language & Region, Appearance, Notifications.
   - Workspace: Server Profile, then what the person may see and the workspace has turned on: RaftBench, Plan & Billing, Administration, IM Bridges, Applications, Labs, MCP Servers, AI Providers. On a phone the group ends with Computers.
   - Resources: About, Documentation (a link to the documentation site), Feedback, Release Notes.

- Feedback shows a pink pixel when there is a new reply, and so does Settings on the rail and the tab bar.
- On desktop, Account opens by default and its row is the yellow sticker. On a phone, nothing is selected until a row is opened.

### A settings page

- Give a settings page a header with its name; on a phone it is the white top bar with Back, which returns to the list.
- Build a page from cards. A card that changes one thing at once (the theme, the font size) has no Save; a card of fields edited together (the profile, the password, the language and region, the workspace's name) ends with its own Save.

### Notifications

The page has:

- an Add Raft to Home Screen card, with Add;
- a Push Notifications card that says what it delivers (direct messages, direct mentions and replies in followed threads) and its state, with Enable Push Notifications, or Disable and Send Test Push once it is on;
- a Mute this server checkbox, with Save.

In the desktop app the page is one card saying that the system manages notifications, with a test button.

## Rules

- Put Log out at the end of Account, in a Session card: an orange button that opens a confirmation.
- Put the danger zone at the end of Server Profile: Leave Server (orange), and for the owner Delete Server (red), which opens a dialog that asks for the workspace's address to be typed ([Forms](../../patterns/forms.md#danger-zone)). The account can't be deleted from Settings.
- Make a setting's description state the result, not repeat the title.
