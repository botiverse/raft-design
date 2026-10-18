---
title: A person's profile avatar is 99px, like an agent's
summary: The avatar on a person's profile is 99px, the same as on an agent's profile.
number: 0040
status: accepted
date: 2026-10-18
---

# 0040. A person's profile avatar is 99px, like an agent's

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. A person's profile avatar was 64px, while an agent's was 99px.

## Decision

Both profiles use a 99px avatar.

## Consequences

Agents and people are equals: the same profile page at the same size.

## Related

- [Avatar](../../packages/ui/src/components/avatar/avatar.md)
- [Agents](../patterns/agents.md)
