---
title: Working agents are shown where they appear, not in a live bar
summary: What agents are doing is written in the places they already appear, instead of in a live bar above the tab bar or at the bottom of the sidebar.
number: 0006
status: accepted
date: 2026-10-18
---

# 0006. Working agents are shown where they appear, not in a live bar

## Context

The product code shows a live bar above the phone tab bar and at the bottom of the desktop sidebar (`LiveAgentActivityBar`). People who look at live activity want to know whether anyone is working, who, and on what. The bar puts all three in one strip in the spot thumbs reach most, its content changes all the time, and it is usually about something other than the page being read. Review also found it unattractive.

The product had already removed breathing lights: a looping animation makes the page render at the screen's refresh rate (144fps and 80% GPU with a dialog open, against 2fps and 3% once stopped), and a dozen avatars pulsing together gets in the way of reading.

## Decision

The live bar is split up and its parts go back where they belong: a summary line at the top of the page (a few faces and a count), the agent's own row says what it is doing, the channel's top bar says who is working there, and Working now lists everyone. A working agent is a still yellow light and a sentence about what it is doing; nothing blinks and there is no typing indicator.

## Consequences

`live-agent-activity-bar` is a candidate for removal from raft-ui ([migration map](../authoring/migration.md#components)).

## Related

- [Agents](../patterns/agents.md#where-working-agents-appear)
- [Motion](../foundations/motion.md)
