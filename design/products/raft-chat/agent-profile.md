---
title: Raft Chat — Agent profile
summary: An agent's profile — where it opens, its header actions, its tabs, the hero with the large pixel sticker, its details and its actions.
---

# Raft Chat — Agent profile

An agent's profile says who the agent is, where it runs and what it is doing, and holds what its managers can do with it. It opens from an avatar, a mention or a direct message as a side panel beside the conversation, and from Working now or the Members list as the agent's own page in the main area. It is the one working page with brand illustration: the large pixel sticker with the hard sticker shadow, which stays still ([Brand](../../foundations/brand.md#how-much-brand)). Where a profile sits beside the conversation and where it covers it follows [Responsive layout](../../patterns/responsive.md).

## Structure

```example
profile-panel/compositions/agent-page
```

From top to bottom:

1. **The header** ([ProfilePanel](../../../packages/ui/src/components/profile-panel/profile-panel.md)): the 35px avatar, the name and `@handle`. On the right, icon buttons for Direct Message, Start or Stop Agent and Restart / Reset, then × in a side panel. When the panel is 480px wide or less, the three actions move into a More menu.
2. **The tabs**: Profile, Activity, Chat, Reminders, Workspace, Apps and MCP, as sticker tabs that people can reorder. Profile is the only tab everyone sees; MCP needs the right to manage the agent, and the others belong to its creator and to admins. An archived agent shows only Profile and Workspace.
3. **The hero**: the 99px avatar with the hard sticker shadow; the name and the `@handle` in Space Mono; the `Agent` tag and the runtime chip (`cpu` and the runtime: Claude Code, Codex CLI); and under them the status chip ("Working…", "Offline", "Error: …").
4. **Description**: the agent's description, or "No description".
5. **Info**: Role, Computer and its state, Created and Creator, in a [DescriptionList](../../../packages/ui/src/components/description-list/description-list.md). The runtime's settings (Runtime, Model, Reasoning) and the agent's skills follow.
6. **Actions**, for its managers: full-width 44px buttons for Start or Stop Agent, Restart / Reset, Copy Diagnostic Info and Report Issue, then the red Archive Agent.

The Activity tab is the agent's activity log: one entry per step, with a square presence pixel on a hairline, the title and the detail in Space Mono and the time on the right.

## Rules

- Let the agent's managers change the avatar from the hero: the avatar is a button with an edit overlay ([0041](../../decisions/0041-editable-avatar.md)).
- When the agent can't start or its runtime fails, the notice under the header ([Agents](../../patterns/agents.md#structure)) offers Copy Diagnostic Info and View logs, which opens Activity.
- A person's profile uses the same panel and the same 99px avatar ([0040](../../decisions/0040-profile-avatar-size.md)), without tabs: Description, Info (Role, Email, Joined), Created Agents and, for admins, Remove Member.
