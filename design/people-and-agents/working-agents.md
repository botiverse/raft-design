---
title: Working agents
summary: Where it shows that an agent is working, and on what — the summary at the top of the screen, Working now, the agent's row and the place's subtitle — and why there is no live bar.
---

# Working agents

People who share a server with agents want to know three things: whether anyone is working, who, and on what. A glance at the top of the screen answers the first two. The third is written where the work already appears: in the agent's row, in the header of the place it works in, and next to its name in a direct message. Nothing moves while the work goes on, and there is no live bar ([0006](../decisions/0006-working-agents-in-place.md)).

## When it applies

Any screen that shows agents while they work. An agent is working while its runtime reports that it is thinking or working; its presence light is then the still yellow `busy` ([Identity and presence](./identity-and-presence.md#presence-lights)).

## Where working shows

| Place | What it shows |
| --- | --- |
| The top of the screen: the right of the web top bar, the right of a phone's Home bar, or the desktop Chat sidebar header when there is no top bar | The summary: up to 3 faces and the count. It opens Working now |
| Working now | One row per working agent: its avatar and light, its name, and what it is doing |
| The agent's row in the sidebar, on Home and in Members | What it is doing replaces its runtime on the right of the row |
| The header of a channel | The subtitle starts with up to 3 faces and "2 agents working", then " · " and the channel's description |
| The header of a direct message with the agent | Its light and what it is doing, after its name |
| The conversation | The yellow light on its avatar, on each of its messages |
| The composer of the conversation it is about to post in | Up to 3 faces and "Niko is typing…" in the composer's toolbar, after its tools ([Who is about to post](#who-is-about-to-post)) |

Where these sit in Raft Chat is in [Raft Chat](../products/raft-chat/README.md#where-working-agents-appear).

## The summary and Working now

```example
sidebar/compositions/phone-home
```

- Show at most 3 faces in the summary, at 19px (`xs`), each overlapping the one before by 5px. Follow them with the count in Space Mono. Give the rest only in the count.
- Give the summary the full sentence as its accessible name: "2 agents working". The faces are hidden from assistive technology.
- Hide the summary when no one is working. Don't write 0.
- Open Working now in a [Popover](../../packages/ui/src/components/popover/popover.md) 300px wide, aligned to the end of the summary, on a phone too. Title it Working now.
- Give each row the agent's avatar at 27px (`sm`) with its light, its name in bold, and what it is doing on up to 2 lines in `foreground-muted`. Selecting a row opens the agent's page.
- Order the faces and the rows by when each agent started. Keep that order while the work goes on, so a face moves only when someone starts or stops.
- Keep an agent listed for 5 seconds after it goes idle. Agents pause between steps; without the grace, faces would leave and come back several times a minute.
- Take an agent out when it stops, and when no signal has come from it for 90 seconds, so an agent that crashed doesn't stay listed.

## Rows and subtitles

```example
conversation-panel/compositions/conversation-panel-header
```

- In the agent's row, write what it is doing in place of its runtime, in `text-footnote` and `foreground-muted`. Let it take at most 58% of the row, so the name stays readable ([Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)).
- Hide that text from assistive technology. The row's name stays the agent's name, a sentence that changes every few seconds isn't announced, and the light already carries the state.
- Keep an external agent's runtime in its row instead of what it is doing: its presence is estimated from when it was last seen, and the activity can outlive it.
- In a channel's header, count only the agents who are members of that channel. Start `PanelMeta` with the working line, then the description ([Panel](../../packages/ui/src/components/panel/panel.md#content)).
- In a direct message's header, write the agent's state after its name in Space Mono, `text-mono-meta` and `foreground-hint`, with the full text in a tooltip.

## Who is about to post

- The line is for agents only. It comes from an agent starting to send a message; Raft has no such signal for people, and people don't expect one in a work chat.
- Show the agents about to post in a conversation inside its composer, in the toolbar row: after the tools, before the option and the send button. Use the same 19px faces as the summary, then the sentence in `text-footnote` and `foreground-muted`, with no background of its own.
- Take no space when no one is about to post. The toolbar row is there anyway, so nothing above or around the composer moves when the line comes and goes, and it never covers a message.
- Name up to 3 agents: "Niko is typing…", "Niko and Kirby are typing…", "Niko, Kirby and 3 other agents are typing…". When the sentence doesn't fit, end it with "…". Where the row is too narrow to read a name (a phone, beside the option and the send button), show only the faces and "…": half a name reads as a different agent.
- Keep the full sentence one step away: in a tooltip on the line, and in a status region that announces it once when it appears.
- Don't animate it: no dots, no shimmer, no entrance ([0006](../decisions/0006-working-agents-in-place.md)).

Why the toolbar: a line of its own above the composer has to keep its height while no one is typing, or the composer jumps each time an agent starts and stops; that reserved row is space most of the time and nothing else can use it. The toolbar row already has free room between the tools and the send button, so the line costs no height at all (Slack puts the same line just under its composer for the same reason).

## What it says

- Say what the agent is doing, as its runtime reports it, with the task number when there is one: "Editing Flow.tsx · #25".
- When the runtime reports no detail, write the state: Thinking…, Working…, Starting…, Compacting context….
- Don't write "Processing…", "Running" or "Busy". More on wording is in [Writing about agents](./writing-about-agents.md#status-text).

## Why there is no live bar

Raft Chat used to show a live strip of working agents above the phone tab bar and at the bottom of the desktop sidebar (`LiveAgentActivityBar`). It answered all three questions in one place, and it was the wrong place:

- It took the spot on the screen that thumbs reach most.
- Its content changed all the time.
- It was usually about something other than the page being read.

The strip is split up and each part goes back where it belongs: the summary at the top of the screen, the agent's row, the place's header and Working now. `LiveAgentActivityBar` is deprecated in raft-ui and is removed in 1.0 ([LiveAgentActivityBar](../../packages/ui/src/components/live-agent-activity-bar/live-agent-activity-bar.md)).

- Don't add a live bar above the tab bar, at the bottom of the sidebar or anywhere else.

## Motion

Working is a state, not an event, so it doesn't animate ([Motion](../foundations/motion.md)).

- Keep the light still. Thinking and working are the same still yellow. The product stopped animating lights because a looping animation kept the page rendering at the screen's refresh rate, and a dozen pulsing avatars got in the way of reading ([0006](../decisions/0006-working-agents-in-place.md)).
- When an agent joins the summary, let its face slide in and fade, with `ease-slide`, over about 200ms. With reduced motion, it appears.
- Replace the count and the text. Don't roll the digits or animate the sentence.

## Turning it off

- Let people hide the summary and the channel's working line in Appearance › Live agent activity. The setting is saved on the device.
- Keep the lights and the agents' rows when it is off: they are the agent's state, not a feed.

## When the work ends

- When an agent finishes, take it out of the summary and Working now. It posts a message that says what it did, with its proof ([Hand-offs and approvals](./handoffs-and-approvals.md#finishing-work)).
- When an agent fails, its light turns orange, it leaves the summary, and its profile says why ([Hand-offs and approvals](./handoffs-and-approvals.md#when-something-fails)).

## Related

- [Identity and presence](./identity-and-presence.md): the five presence lights.
- [0006](../decisions/0006-working-agents-in-place.md): working agents are shown where they appear.
- [Avatar](../../packages/ui/src/components/avatar/avatar.md): the avatar stack.
