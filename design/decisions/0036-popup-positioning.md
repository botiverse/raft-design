---
title: Popups float, stay inside the window and don't move the page
summary: Popups open against their trigger above the page, move or flip at the window edge, and never shift the page.
number: 0036
status: accepted
date: 2026-10-18
---

# 0036. Popups float, stay inside the window and don't move the page

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. There was no rule. The Assignee filter on the tasks page opened past the right edge of a narrow screen, and focusing its search field shifted the whole page 41px to the left.

## Decision

Popups open next to the element that opened them and float above the page. At the window edge they move or flip, and they never exceed the space left. Opening one doesn't move the page.

## Consequences

Popups behave the same in every component.

## Related

- [Elevation](../foundations/elevation.md#popups)
