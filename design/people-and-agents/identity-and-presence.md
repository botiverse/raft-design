---
title: Identity and presence
summary: How an agent is recognized (its pixel face, the agent tag and the runtime chip), how it is treated the same as a person, what its presence light says, what an agent on an offline computer shows, and how a message an assistant sent for a person is marked.
redirectFrom: [decisions/0040-profile-avatar-size]
---

# Identity and presence

An agent is recognized by its face. Agents and people use the same square avatar, the same message and the same rows; an agent's avatar holds its pixel face, a person's holds a photo or initials. Where it has to be explicit that someone is an agent, its profile adds an `agent` tag and a runtime chip. How an agent is doing is the presence light on its avatar.

## When it applies

Anywhere an agent appears: messages, the sidebar and Home, member lists, task assignees, mention suggestions, profile cards and profiles. Where an agent's work shows is in [Working agents](./working-agents.md).

## Recognizing an agent

| Where | What says it is an agent |
| --- | --- |
| Everywhere | The pixel avatar: one of the 72 faces in [`design/assets/Agents`](../assets/Agents/), on the fill that comes with it ([Avatar](../../packages/ui/src/components/avatar/avatar.md)) |
| A message | The pixel avatar and its presence light. No tag. With Appearance › Show agent model on, the agent's model follows its name (`MessageItemMeta`); it is on by default in the desktop app |
| A row in the sidebar, on Home or in Members | The pixel avatar and its presence light, and on the right the runtime it runs on, in Space Mono (`SidebarItemMeta`, [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)) |
| The desktop app's Find a conversation list | The word Agent under the name |
| Its profile | The `agent` tag and the runtime chip under its handle, then its status chip ([Status](../../packages/ui/src/components/status/status.md#agent-tag)) |

```example
profile-panel/compositions/agent-page
```

- The `agent` tag is an outline [Badge](../../packages/ui/src/components/badge/badge.md) holding the word Agent.
- The runtime chip names what the agent runs on (Claude Code, Codex): a soft `info-soft` Badge with a `cpu` icon. raft-ui has no part for it yet. The profile of an agent from another server, met in a Joint channel, shows the tag without the runtime chip.
- An agent without a chosen face shows `robot`. An agent that was deleted keeps its messages; its avatar is grayed and a Deleted badge follows its name.

## The same as people

People and agents are members of the same server, so they use the same parts.

| Both get | Component |
| --- | --- |
| The same message, grouped and threaded the same way | [MessageItem](../../packages/ui/src/components/message-item/message-item.md) |
| The same square sticker, at the same five sizes | [Avatar](../../packages/ui/src/components/avatar/avatar.md) |
| The same row in lists | [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md), [ListRow](../../packages/ui/src/components/list-row/list-row.md) |
| The same profile, with the same 99px avatar: neither profile is a smaller version of the other | [ProfilePanel](../../packages/ui/src/components/profile-panel/profile-panel.md) |
| Mentions by name, task assignment, thread following | [Conversation](../patterns/conversation.md), [Tasks](../patterns/tasks.md) |

```example
message-item/compositions/person-and-agent
```

What differs is only what has to: the face, the presence light, the runtime, and the controls a person has over an agent they manage (Stop agent, Restart / Reset, the Activity tab).

## An App in conversations

An installed App can post in a server under a name of its own, such as Stamp, which helps with releases. It has a pixel face and reads like an agent in a message, but it runs on no computer and no runtime and has no presence: the App answers for it. So its name carries an App label, a soft muted [Badge](../../packages/ui/src/components/badge/badge.md), in place of what only an agent has. It is called App, never bot: bot means too many things (a chatbot, an agent, a script), and the label only has to say that an App is speaking.

- **The label.** App. When the name shown isn't the App's own, App · the App's name. Its tooltip says which App it is. In a sidebar narrower than 259px of content (the default 240px included) it is App alone, the App's name left to the tooltip, so the name keeps more room. It follows the name and never shrinks: a long name truncates first, keeping at least 3 characters, and a row's description gives up its room before the name.
- **Where.** Wherever its name is shown as a name: a message's sender line, its DM's header, every list row that names it (sidebar, Members, Activity, search and Find a conversation, mention suggestions, Forward, member pickers), its hover card and profile.
- **Not shown.** No presence light on its avatar and no Offline, which would be true forever. No runtime on the right of its rows and no model after its name. Where a list labels each result's kind (search and Find a conversation: an outline Agent or Human Badge), App is that same outline Badge, with the same label and tooltip; in mention suggestions, whose kind labels are soft, it is the soft one.
- **Removed.** An App removed from the server keeps its messages; its DM says so in a warning Banner above a read-only composer, with the way back for those who can manage Apps.

## Presence lights

The presence light is the square pixel in the corner of an agent's avatar (`AvatarBadge`). It has five states, with fixed colors ([Color](../foundations/color.md#statuses)):

| Light | Color | The agent is | Written out |
| --- | --- | --- | --- |
| `online` | Lime | Running and idle | Online |
| `busy` | Yellow | Thinking or working | Thinking…, Working…, or what it is doing |
| `error` | Orange | Stopped by an error | Error, or Error and the reason |
| `offline` | Stone | Not running | Offline, or Stopped and why; Computer offline when its computer is offline ([below](#an-agent-on-an-offline-computer)) |
| `external` | Cyan | Not on one of this server's computers, and not seen recently | External, or Last active and the time |

```example
avatar/compositions/badge-presence
```

- The same light shows on the avatar everywhere: the message, the row, the header of a direct message, Working now, the profile. The one exception is a thread row in Activity: its corner holds the thread badge, because the row is about the thread, not about how the agent is doing now ([InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#the-leading-image)).
- Where the state is written out (a profile, a profile card, the header of a direct message), use a status chip: a soft tint, the pixel and the words. The chip for working is on `presence-busy-soft`, which stays yellow in every theme ([Status](../../packages/ui/src/components/status/status.md#agent-state-chips)).
- An external agent that has been seen recently and reports what it is doing gets the same lights as any other agent.
- In the product, presence lights belong to agents. People's avatars have no light; their corner holds the face of an assistant that sent a message for them ([Sent by an assistant](#sent-by-an-assistant)).

## An agent on an offline computer

When the computer an agent runs on goes offline (turned off, asleep, off the network, or Raft Computer closed), the agent isn't running, but it hasn't stopped: it starts again by itself when the computer is back, and the messages sent to it meanwhile are kept and delivered then. So it says "Computer offline" wherever people meet it, with one way to bring the computer back. In one week 3 people couldn't tell why their agents wouldn't start: the agent said Stopped, Start failed with no reason, and only admins saw what to do (cindyz, 2026-11-05, #triage:fb51e3a0; Jasper, #triage:#206).

| Where people meet it | What shows |
| --- | --- |
| Its avatar, everywhere | The `offline` light, as for any agent that isn't running |
| Where its state is written out: its profile, its profile card, the header of a direct message with it | Computer offline, as the status chip's words, linking to that computer |
| The composer, in a direct message with it or once a message mentions it | A notice above the input ([Conversation](../patterns/conversation.md#the-composer)) |
| Its profile | A card that says which computer is offline since when, and what the person looking can do about it ([Raft Chat — Agent profile](../products/raft-chat/agent-profile.md#its-computer-is-offline)) |
| Start, when it fails because the computer is offline | The reason, next to the control |

- Write Computer offline for the agent's state, and link it to the computer: it says what is wrong and where. Never write Stopped for this case: Stopped means "won't receive messages until restarted" ([Writing about agents](./writing-about-agents.md#status-text)), and here the agent restarts by itself and its messages wait.
- Write this state as Computer offline in every English string that names it, never Disconnected, Machine is offline, or Offline alone, which doesn't say why. Inside a sentence the computer is lowercase: "The computer this agent runs on is offline." ([Terminology](../content/terminology.md#how-to-use-a-term)).
- Show Computer offline to everyone who can see the agent. The light and the agent's computer are already shown to everyone; this is not the detail of an agent's error, which only its managers see ([When something fails](./handoffs-and-approvals.md#when-something-fails)).
- Link every place above to the same place to fix it: the offline card on the agent's profile, or the computer's own page. Don't write a separate help page: steps written in two places drift, and the card already knows who is looking.
- Explain a failed Start next to the control that started it, with the same link, and never in a toast or not at all: the failure lasts until the computer is back, and a toast is only for a one-off action with no place of its own ([Feedback](../patterns/feedback.md#errors-by-scope)). The server answers Start with `machine_offline`; that answer is the reason to show.

Planned, not yet a rule (phase 2, #triage:#206): the reason a computer went offline, from the server, and a notification center entry for the computer's owner, "Your computer is offline; its 3 agents can't start". A computer offline is the state of the whole server, so its notice belongs in the notification center ([Choosing a component](../components/overview.md#telling-people-something)).

## Sent by an assistant

A person's assistant (see [Terminology](../content/terminology.md#people-and-agents)) isn't one of the server's agents, but it has a pixel face on the same square sticker, the one its DM's header shows. When its person allows it, it can send a message as that person, in a channel, a thread or a DM. The message stays the person's: their name, their avatar, their place in the timeline. Everyone must still see at a glance that the assistant sent it, so two marks say so, and the words are never left out.

| Where | What shows |
| --- | --- |
| The first message of a group, with its avatar | The assistant's face, `2xs` (19px), on the bottom-right corner of the person's `md` avatar, and "sent by Friday" after the name |
| A continuation row, without an avatar | The words only, at the end of the text: "(sent by Friday)" |
| A one-line preview: an Activity row, a search result | The words only, with the name: "Alice (sent by Friday)" |
| A quoted message | The words only, after the author's name: "(sent by Friday)" |

```example
message-item/compositions/delegated-group
```

- Put the face in the corner a presence light takes, sticking out as far: 2.5px past the avatar's edge on `md`, the same visible overhang as the light, so 15px of it lies over the person's avatar. It reads as a second sticker on the first, in the shape language the presence light already uses, without a new avatar shape. It covers more of the avatar than a light may ([Avatar](../../packages/ui/src/components/avatar/avatar.md#the-corner)).
- Separate the face from the avatar with a 1.5px ring in the surface behind the message: the canvas at rest, the row's fill while it is hovered, selected or jumped to. In dark mode the face keeps its die-cut edge inside the ring, like every sticker ([Dark mode](../foundations/dark-mode.md#the-die-cut-edge)).
- Put the face only on a person's avatar. People have no presence light, so their corner is free; an agent's corner is its presence light, and one corner never holds both.
- Leave the face out of continuations, one-line previews and quotes, and write the words instead: a continuation has no avatar, a quote's avatar is 19px, too small to carry a second face, and a preview row is read along its line, where the words sit next to the name.
- Set the words in `foreground-muted`, one step stronger than the role beside them (`foreground-hint`): who sent the message matters more than the role, and this feature has to be seen at a glance.
- When the name line runs out of room, let the role truncate first, then the person's name; the assistant's name truncates once the label reaches 45% of the line. Never truncate the words "sent by", and never let them run under the time: without them, a name after another name says nothing. When the words alone are wider than 45% (a deleted assistant, on a phone), the label keeps them whole and the person's name gives way.
- Never let the person's name disappear: it keeps at least 3rem (about 4 letters and an ellipsis), or all of it when shorter. When the line can't hold that, the words and the time (a thread panel at 360px, with room kept for the hover toolbar), the label gives way: a name in it truncates, and plain words like "sent by a deleted assistant" wrap onto as many lines as they need. The time stays on the first line, clear of the toolbar.
- When the assistant has been deleted, keep both marks: the default `robot` face on its neutral fill, grayed and faded over the surface (`MessageItemDelegatedAvatar deleted`), never letting the person's avatar show through, and "sent by a deleted assistant", all of it words that never truncate, since there is no name left to cut. Nothing in it opens a profile. Dropping the label would make the message look as if the person wrote it.
- Let the assistant's name open its profile; the product decides whether it does. The face is decoration: the words already say it, so a screen reader hears the header in its visible order ("Alice, Design lead, sent by Friday, 10:42") and not the face.
- A message the assistant sent starts its own group in the timeline ([Conversation](../patterns/conversation.md#dates-and-grouping)).

The words come from the product, in its language: "sent by Friday" after the name, and "sent by a deleted assistant" once it is gone. Chinese puts words on both sides of the name; the layout keeps both whole. raft-ui lays the words out but holds no copy.

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
