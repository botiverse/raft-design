---
title: A problem in one panel is a full-width notice under its header
summary: A problem inside one panel is shown as a full-width notice under the panel header, with a seam above and below.
number: 0037
status: accepted
date: 2026-10-18
---

# 0037. A problem in one panel is a full-width notice under its header

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. There were only banners inside content and the workspace-wide notification center. A banner saying an agent couldn't start had the panel header's seam above it and a hairline below, so it looked like two different things.

## Decision

A problem in one panel is a full-width notice directly under the panel header (`PanelNotice`). It is a region of the panel, so both its edges are `line-seam`.

## Consequences

Errors have a place at each scope: input, dialog, panel, workspace.

## Related

- [Feedback](../patterns/feedback.md#errors-by-scope)
- [Banner](../../packages/ui/src/components/banner/banner.md)
