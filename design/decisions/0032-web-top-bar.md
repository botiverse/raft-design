---
title: The web app has a 48px frame top bar with search
summary: The desktop web app adds a 48px frame-colored top bar with search in the center.
number: 0032
status: accepted
date: 2026-10-18
---

# 0032. The web app has a 48px frame top bar with search

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. The web app's frame was only the rail, with no top bar.

## Decision

The web app has a 48px top bar with search in the center. It is part of the frame, not content, so it is yellow like the rail.

## Consequences

Yellow still goes only on the frame. The desktop app's title bar uses the same bar.

## Related

- [Page structure](../patterns/page-structure.md#the-web-top-bar)
