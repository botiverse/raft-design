---
title: Raft Chat — Settings
summary: The Settings destination — the person's own row, the Personal, Workspace and Resources groups, and pushed settings pages such as Notifications.
---

# Raft Chat — Settings

Settings is a top-level page in the yellow frame, grouped into Personal, Workspace and Resources. Each setting opens a pushed page that covers the tab bar. The shared rules for settings (apply at once, no Save button) are in [Forms](../../patterns/forms.md#settings-that-apply-at-once).

## Structure

### Settings

1. **The frame**: the large title Settings, with no navigation row.
2. **The person**: their avatar, name and email; it opens Account.
3. **Three inset groups**:
   - Personal: Account, Language & Region, Appearance, Notifications.
   - Workspace: Server Profile, Computers, AI Providers, Plan & Billing, and more.
   - Resources: Documentation, Feedback, Release Notes.

Each row shows its current value and a chevron. Feedback shows a count when there is a new reply, and Settings on the tab bar shows an attention dot.

```example
list-row/compositions/settings
```

### A pushed settings page: Notifications

A top bar with Back and no tab bar (whether the top bar is white or yellow is [still open](../../decisions/open-questions.md)). A radio group sets the notification scope, switches control the kinds of agent notifications, a select sets the quiet hours, and a last row lists the exceptions.

On desktop, the sidebar lists the same groups, and Account opens by default.

## Rules

- Put Sign Out in Account.
- Put deleting the workspace and deleting the account in the danger zone at the bottom of their page: a red button, then a dialog that asks for the name to be typed ([Forms](../../patterns/forms.md#danger-zone)).
- Make a setting's description state the result, not repeat the title: "Off: a person approves every merge".
