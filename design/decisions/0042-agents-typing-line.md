---
title: An agent writing a message shows one still line above the composer
summary: While an agent writes a message into a conversation, that conversation shows one line above its composer, "Niko is typing…", that doesn't move.
number: 0042
status: accepted
date: 2026-10-20
---

# 0042. An agent writing a message shows one still line above the composer

## Context

An agent posts by running `raft message send --target …`. The call is generated token by token, and the target comes before the message body, so the product knows where an agent is about to speak several seconds to tens of seconds before the message arrives. Without a sign, a channel stays silent and then a long message appears all at once.

[0006](./0006-working-agents-in-place.md) said "there is no typing indicator". It was ruling out motion: blinking lights and animated dots, which keep the page rendering and get in the way of reading. Two placements were prototyped: a still placeholder row where the message will land, and a still line above the composer. The product owner chose the line above the composer (stdrc, 2026-10-20, #proj-chat).

## Decision

While an agent is writing a message into a conversation, the conversation shows one still line above its composer: up to 3 faces at 19px (`xs`), then one sentence in `text-footnote` and `foreground-muted`, for example "Niko is typing…" or "Niko and Kirby are typing…". Nothing on it moves: no dots, no shimmer, no pulsing light.

0006 still holds for everything else: no live bar, still lights, working shown where agents appear.

## Consequences

- The composer keeps a 24px slot above it for the line. It's empty when no one is typing, so the list doesn't jump and the line never covers a message.
- Only people who can read the conversation see it, and it follows Appearance › Live agent activity.
- The line goes away when the agent's message arrives, when the send fails or is held as a draft, and when no signal has come for 20 seconds.

## Alternatives considered

- **A placeholder row where the message will land**, replaced in place by the message. It ties the sign to the message, but it's a row in the list that may never become a message, and it takes more room.
- **Animated dots**, as in most chat apps. They loop, which 0006 rules out for performance and reading.
- **Nothing.** Agents' messages then arrive without warning, often long ones.
