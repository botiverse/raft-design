---
title: Every top-level page shows its title, including Home
summary: Every phone top-level page shows a large title with its name, and Home is titled Home.
number: 0004
status: accepted
date: 2026-10-18
---

# 0004. Every top-level page shows its title, including Home

## Context

In the product code, Home's top bar shows only the workspace pill ("show only one Server Name"), and the other top-level pages put their name in the navigation row.

## Decision

Every top-level page shows a large title; Home's title is Home. The workspace pill says which workspace you are in, and the title says which page. The titles of all four tabs sit at the same height.

## Consequences

This overrides a decision the product's owner recorded in code. To return to the product's version, change only what this record names. The version that matches the product is still drawn, and the choice between the two is [open](./open-questions.md).

## Related

- [Panel](../../packages/ui/src/components/panel/panel.md)
- [Raft Chat](../products/raft-chat/README.md)
