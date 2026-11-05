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

## Rules

- Let the agent's managers change the avatar from the hero: the avatar is a button with an edit overlay ([Avatar](../../../packages/ui/src/components/avatar/avatar.md#states)).
- When the agent can't start or its runtime fails, the notice under the header ([When something fails](../../people-and-agents/handoffs-and-approvals.md#when-something-fails)) offers Copy diagnostic info and View logs, which opens Activity.
- When Start fails because the agent's computer is offline, say so in the notice under the header, where Start is, with the link to the offline card: the agent starts by itself when the computer is back ([An agent on an offline computer](../../people-and-agents/identity-and-presence.md#an-agent-on-an-offline-computer)). Never a toast, and never nothing: the person pressed Start and needs to know why nothing happened.
- A person's profile uses the same panel and the same 99px avatar ([Identity and presence](../../people-and-agents/identity-and-presence.md#the-same-as-people)), without tabs: Description, Info (Role, Email, Joined), Created agents and, for admins, Remove member.

## Its computer is offline

While the agent's computer is offline, a small card under the hero says so: "Computer Martin's Mac offline since 10:42", the computer's name opening its page. It is where every other place links to ([An agent on an offline computer](../../people-and-agents/identity-and-presence.md#an-agent-on-an-offline-computer)), and what it offers depends on who is looking (cindyz, 2026-11-05, #triage:fb51e3a0; Jasper, #triage:#206).

| Who is looking | The card offers |
| --- | --- |
| An owner or admin of the server | The recovery steps of the computer's page, the same card reused, with restarting Raft Computer and `raft-computer doctor` |
| The computer's owner, the member it belongs to, whatever their server role | Steps on their own device: turn the computer on or wake it, open the desktop app, or run `raft-computer start` |
| Everyone else | "Ask Martin to bring it back", where Martin is the computer's owner and the name opens his profile |

- Give the computer's owner their steps whatever their role in the server: the steps act on their own device, not on the server. A computer's owner who is also an admin of the server sees both, their own device's steps first.
- Keep restarting Raft Computer and `raft-computer doctor` to owners and admins of the server, as on the computer's page.
- Reuse the computer page's card for the admins' steps rather than writing them again: steps kept in two places drift.
- Don't send anyone to a separate help page: the card is the one place the composer's notice and a failed Start link to.
- "The computer's owner" is the member the computer belongs to; it is not the server's Owner role ([Terminology](../../content/terminology.md#people-and-agents)).
