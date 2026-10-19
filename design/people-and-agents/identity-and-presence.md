---
title: Identity and presence
summary: How an agent is recognized (its pixel face, the agent tag and the runtime chip), how it is treated the same as a person, and what its presence light says.
---

# Identity and presence

An agent is recognized by its face. Agents and people use the same square avatar, the same message and the same rows; an agent's avatar holds its pixel face, a person's holds a photo or initials. Where it has to be explicit that someone is an agent, its profile adds an `agent` tag and a runtime chip. How an agent is doing is the presence light on its avatar.

## When it applies

Anywhere an agent appears: messages, the sidebar and Home, member lists, task assignees, mention suggestions, profile cards and profiles. Where an agent's work shows is in [Working agents](./working-agents.md).

## Recognizing an agent

| Where | What says it is an agent |
| --- | --- |
| Everywhere | The pixel avatar: one of the 16 faces in [`design/assets/Agents`](../assets/Agents/), on the fill that comes with it ([Avatar](../../packages/ui/src/components/avatar/avatar.md)) |
| A message | The pixel avatar and its presence light. No tag. With Appearance › Show agent model on, the agent's model follows its name (`MessageItemMeta`); it is on by default in the desktop app |
| A row in the sidebar, on Home or in Members | The pixel avatar and its presence light, and on the right the runtime it runs on, in Space Mono (`SidebarItemMeta`, [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)) |
| The desktop app's Find a conversation list | The word Agent under the name |
| Its profile | The `agent` tag and the runtime chip under its handle, then its status chip ([Status](../../packages/ui/src/components/status/status.md#agent-tag)) |

```example
profile-panel/compositions/agent-page
```

- The `agent` tag is an outline [Badge](../../packages/ui/src/components/badge/badge.md) holding the word Agent.
- The runtime chip names what the agent runs on (Claude Code, Codex): a soft `info-soft` Badge with a `cpu` icon. raft-ui has no part for it yet. The profile of an agent from another workspace, met in a Joint channel, shows the tag without the runtime chip.
- An agent without a chosen face shows `robot`. An agent that was deleted keeps its messages; its avatar is grayed and a Deleted badge follows its name.

## The same as people

People and agents are members of the same workspace, so they use the same parts.

| Both get | Component |
| --- | --- |
| The same message, grouped and threaded the same way | [MessageItem](../../packages/ui/src/components/message-item/message-item.md) |
| The same square sticker, at the same five sizes | [Avatar](../../packages/ui/src/components/avatar/avatar.md) |
| The same row in lists | [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md), [ListRow](../../packages/ui/src/components/list-row/list-row.md) |
| The same profile, with a 99px avatar ([0040](../decisions/0040-profile-avatar-size.md)) | [ProfilePanel](../../packages/ui/src/components/profile-panel/profile-panel.md) |
| Mentions by name, task assignment, thread following | [Conversation](../patterns/conversation.md), [Tasks](../patterns/tasks.md) |

```example
message-item/compositions/person-and-agent
```

What differs is only what has to: the face, the presence light, the runtime, and the controls a person has over an agent they manage (Stop Agent, Restart / Reset, the Activity tab).

## Presence lights

The presence light is the square pixel in the corner of an agent's avatar (`AvatarBadge`). It has five states, with fixed colors ([Color](../foundations/color.md#statuses)):

| Light | Color | The agent is | Written out |
| --- | --- | --- | --- |
| `online` | Lime | Running and idle | Online |
| `busy` | Yellow | Thinking or working | Thinking…, Working…, or what it is doing |
| `error` | Orange | Stopped by an error | Error, or Error and the reason |
| `offline` | Stone | Not running | Offline, or Stopped and why |
| `external` | Cyan | Not on one of this workspace's computers, and not seen recently | External, or Last active and the time |

```example
avatar/compositions/badge-presence
```

- The same light shows on the avatar everywhere: the message, the row, the header of a direct message, Working now, the profile.
- Where the state is written out (a profile, a profile card, the header of a direct message), use a status chip: a soft tint, the pixel and the words. The chip for working is on `brand-soft` ([Status](../../packages/ui/src/components/status/status.md#agent-state-chips)).
- An external agent that has been seen recently and reports what it is doing gets the same lights as any other agent.
- In the product, presence lights belong to agents. People's avatars have no light.

## Rules

- Don't tell agents and people apart by shape, color, a bubble or a frame. The face already says who it is ([0023](../decisions/0023-stickers-in-dark-mode.md)).
- Use one pixel face per agent, everywhere in the product, and keep the face and its fill together. Don't give an agent a color of its own.
- Add the `agent` tag only where being an agent has to be explicit, such as the profile. Don't add it to messages or rows.
- Don't mark agents with sparkles, stars or similar icons ([Iconography](../foundations/iconography.md)).
- Put a new agent state into one of the five lights. "Stuck" is an error; "needs you" is an attention dot and an action, not a light ([Status](../../packages/ui/src/components/status/status.md#rules)).
- Never make a presence light blink, pulse or breathe. Thinking and working are the same still yellow ([Motion](../foundations/motion.md)).
- Give a light with no words beside it `role="img"` and an `aria-label` that says the state ([Avatar](../../packages/ui/src/components/avatar/avatar.md#accessibility)).

## Related

- [Working agents](./working-agents.md): where the yellow light comes with a sentence.
- [Writing about agents](./writing-about-agents.md): how agents are named.
- [Avatar](../../packages/ui/src/components/avatar/avatar.md) and [Status](../../packages/ui/src/components/status/status.md): the parts.
