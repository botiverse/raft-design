---
title: A sidebar row looks the same in every group
summary: A sidebar row is one line with an ellipsis in every group, and the description gives way to the name.
number: 0030
status: accepted
date: 2026-10-18
---

# 0030. A sidebar row looks the same in every group

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. Pinned rows wrapped long names to two lines, and pinned and custom groups hid the description. The same conversation looked like a different thing when it moved to another group.

## Decision

A sidebar row is the same in every group: one line, truncated with an ellipsis; the description gives way to the name.

## Consequences

A conversation keeps its look wherever it is listed.

## Related

- [Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)
