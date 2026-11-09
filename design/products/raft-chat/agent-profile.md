---
title: Raft Chat — Agent profile
summary: An agent's profile — where it opens, its header actions, its tabs, the hero with the large pixel sticker, its details, its actions, and the card shown while its computer is offline.
---

# Raft Chat — Agent profile

An agent's profile says who the agent is, where it runs and what it is doing, and holds what its managers can do with it. It opens from an avatar, a mention or a direct message as a side panel beside the conversation, and from Working now or the Members list as the agent's own page in the main area. It is the one working page with brand illustration: the large pixel sticker with the hard sticker shadow, which stays still ([Brand](../../foundations/brand.md#how-much-brand)). Where a profile sits beside the conversation and where it covers it follows [Responsive layout](../../patterns/responsive.md).

## Structure

```example
profile-panel/compositions/agent-page
```

From top to bottom:

1. **The header** ([ProfilePanel](../../../packages/ui/src/components/profile-panel/profile-panel.md)): the 35px avatar, the name and `@handle`. On the right, icon buttons for Direct message, Start or stop agent and Restart / Reset, then × in a side panel. When the panel is 480px wide or less, the three actions move into a More menu.
2. **The tabs**: Profile, Activity, Chat, Reminders, Workspace, Apps and MCP, as sticker tabs that people can reorder. Profile is the only tab everyone sees; MCP needs the right to manage the agent, and the others belong to its creator and to admins. An archived agent shows only Profile and Workspace.
3. **The hero**: the 99px avatar with the hard sticker shadow; the name and the `@handle` in Space Mono; the `Agent` tag and the runtime chip (`cpu` and the runtime: Claude Code, Codex CLI); and under them the status chip ("Working…", "Offline", "Computer offline", "Error: …").
4. **The offline card**, only while the agent's computer is offline ([below](#its-computer-is-offline)).
5. **Description**: the agent's description, or "No description".
6. **Info**: Role, Computer and its state, Created and Creator, in a [DescriptionList](../../../packages/ui/src/components/description-list/description-list.md). The runtime's settings (Runtime, Model, Reasoning) and the agent's skills follow.
7. **Actions**, for its managers: full-width `lg` buttons for Start or stop agent, Restart / Reset, Copy diagnostic info and Report issue, then the red Archive agent.

The Activity tab is the agent's activity log: one entry per step, with a square presence pixel on a hairline, the title and the detail in Space Mono and the time on the right.

The log has its newest step at the bottom and follows it as a conversation does: while its end is in view new steps keep it there, and once the person scrolls up nothing they are reading moves ([Following the newest](../../patterns/conversation.md#following-the-newest)). Its Back to bottom pill counts steps, not messages: "3 new steps".

## Rules

- Let the agent's managers change the avatar from the hero: the avatar is a button with an edit overlay ([Avatar](../../../packages/ui/src/components/avatar/avatar.md#states)).
- When the agent can't start or its runtime fails, the notice under the header ([When something fails](../../people-and-agents/handoffs-and-approvals.md#when-something-fails)) offers Copy diagnostic info and View logs, which opens Activity.
- While the agent's computer is offline the profile doesn't offer Start or Restart / Reset: the offline card below takes their place, since the agent starts by itself when the computer is back ([An agent on an offline computer](../../people-and-agents/identity-and-presence.md#an-agent-on-an-offline-computer)).
- A person's profile uses the same panel and the same 99px avatar ([Identity and presence](../../people-and-agents/identity-and-presence.md#the-same-as-people)), without tabs: Description, Info (Role, Email, Joined), Created agents and, for admins, Remove member.

## Its computer is offline

While the agent's computer is offline, a small card under the hero says so: "Martin's Mac has been offline since 10:42", the computer's name opening its page. It is where every other place links to ([An agent on an offline computer](../../people-and-agents/identity-and-presence.md#an-agent-on-an-offline-computer)).

Under it, the same two steps for everyone who looks (cindyz, 2026-11-05, #triage:fb51e3a0):

1. Turn on Martin's computer, Martin's Mac, and keep it awake.
2. On it, open Raft Desktop, or run `raft-computer restart`.

- Write the owner's name in the first step as plain text, not a link: the step is about the computer, and a link there would lead away from the fix. Only the computer's name links, to its page (cindyz, 2026-11-05).
- Show the same steps to everyone, whatever their role and whether the computer is theirs. The first step names whose computer it is, so someone who can't reach it knows whom to ask; no separate "Ask Martin" line.
- Keep only these two. `raft-computer restart` starts Raft Computer when it isn't running and restarts it when it is stuck, so it covers both; `raft-computer doctor` and the other diagnostics stay on the computer's page.
- Don't send anyone to a separate help page: the card is the one place the agent's status links to.
- "The computer's owner" is the member the computer belongs to; it is not the server's Owner role ([Terminology](../../content/terminology.md#people-and-agents)).
