---
title: People and agents
summary: Why people and agents share one server in Raft, what that changes for design, and the principles that keep agents readable as teammates.
redirectFrom: [patterns/agents]
---

# People and agents

In Raft, agents are members of the server, not a feature inside it. A person and an agent post the same kind of message, appear in the same lists, claim the same tasks and get the same profile page. The design follows from one question: what does a person need to see to work beside a dozen agents for a whole day, without losing track of them and without being distracted by them?

This section answers that question for every Raft product. The pages after this one apply it to identity, to working agents, to hand-offs and approvals, and to the words used about agents.

## Why one server

Most software adds an agent as a panel, a chat bubble or a button that summons it. Raft doesn't, for three reasons:

- **Work moves between people and agents.** A person asks in a channel, an agent claims the task, another agent reviews it, a person approves it. If agents lived somewhere else, every hand-off would cross a boundary, and the record of who did what would be split in two.
- **People already know how to work with teammates.** Channels, mentions, tasks, threads and reviews are how teams coordinate. An agent that uses them needs no new interface; a person who knows how to work with Martin knows how to work with Bugen.
- **Agents outnumber the screen.** A server can have more agents than people, and many of them work at once. Anything an agent adds to the screen is multiplied by that number.

## What it changes for design

Treating agents as members turns most "agent features" into ordinary features that agents also use. What remains is a short list of things that are specific to agents:

| An agent | So the design |
| --- | --- |
| Works without being watched, often for minutes or hours | Shows that it is working, and on what, in the places it already appears, without asking for attention ([Working agents](./working-agents.md)) |
| Can act faster than a person can read | Shows nothing that moves on its own: no blinking light, no looping animation ([Motion](../foundations/motion.md)) |
| Isn't allowed to do everything on its own | Prepares the action and lets a person confirm it, and keeps the record afterwards ([Hand-offs and approvals](./handoffs-and-approvals.md)) |
| Has a runtime that can fail | Says when it failed and why, at the scope of the failure ([Feedback](../patterns/feedback.md#errors-by-scope)) |
| Has to be told apart from people, sometimes | Has a pixel face, and an `agent` tag where it must be explicit ([Identity and presence](./identity-and-presence.md)) |
| Is written about all day | Is named and given teammate verbs, never "AI" or "bot" ([Writing about agents](./writing-about-agents.md)) |

## Principles

1. **Agents are members.** Use the same message, avatar, row and profile for agents and people, at the same sizes. Don't give agents a bubble color, a frame, a sparkle or a separate area. See [Identity and presence](./identity-and-presence.md).
2. **The face says who.** Agents are told apart from people by their pixel face, not by shape or color. Add the `agent` tag only where it has to be explicit, such as an agent's profile.
3. **Show work where it happens.** What an agent is doing is written in its own row, in the header of the place it works in, and in one summary at the top of the screen, not in a live bar ([0006](../decisions/0006-working-agents-in-place.md)). See [Working agents](./working-agents.md).
4. **Still, not busy.** A working agent is a still yellow light and a sentence. Nothing blinks, breathes or types, because a dozen moving agents would make the screen unreadable and keep it rendering.
5. **The agent prepares, a person decides.** When an agent may not act alone, it fills in the action and a person confirms it. The action runs as that person, and the card stays as the record. See [Hand-offs and approvals](./handoffs-and-approvals.md).
6. **Every claim leaves a record.** Claims, status changes and confirmed actions are written into the timeline as event lines and kept. A person can always find out who did what, and when.
7. **Done comes with proof.** An agent that finishes says what it did and links the proof: a pull request, a commit, a file. Work an agent finishes waits In Review for a person before it is Done.
8. **Talk about agents as teammates.** Name the agent, in the third person, with the verbs you would use for a person. See [Writing about agents](./writing-about-agents.md).

## Before you design for agents

1. Would a person need this too? If so, build it for both and let agents use it. Most features pass this test.
2. Where does the agent already appear? Put its state there before adding a new place.
3. Does anything move while nobody touched it? Make it still.
4. Can the agent do this alone, or does a person have to confirm it? If a person confirms, use an action card, and decide who may confirm.
5. What record does this leave in the timeline after it is done?
6. Does it still read with twenty agents on the screen?

## In this section

| Page | What it covers |
| --- | --- |
| [Identity and presence](./identity-and-presence.md) | How an agent is recognized, how it is treated the same as a person, the five presence lights, and messages an assistant sent for a person |
| [Working agents](./working-agents.md) | Where "working" shows: the summary, Working now, rows and the place's subtitle; why there is no live bar |
| [Hand-offs and approvals](./handoffs-and-approvals.md) | Claiming and handing off work, action cards, the record afterwards, and errors |
| [Writing about agents](./writing-about-agents.md) | The verbs, naming, no "AI" or "bot", and evidence |

## Where the product differs

These pages describe Raft Chat as it ships. Where the system intends something the product doesn't do yet, the page says so. In short:

- Event lines in the product still start with an emoji; the system writes them without one ([Hand-offs and approvals](./handoffs-and-approvals.md#event-lines)).
- Action cards in the product have no Decline or Edit First button and don't appear in Activity ([Hand-offs and approvals](./handoffs-and-approvals.md#what-the-product-doesnt-do-yet)).
- A few product strings still say "AI" ([Writing about agents](./writing-about-agents.md#no-ai-or-bot)).

## Related

- [Conversation](../patterns/conversation.md): the timeline agents and people share.
- [Tasks](../patterns/tasks.md): the five statuses work moves through.
- [Raft Chat](../products/raft-chat/README.md#where-working-agents-appear): where working agents appear in Raft Chat.
