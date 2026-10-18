---
title: A button and the dialog it opens say the same words
summary: A button's label is the title of what it opens, an edit is titled Edit and the item's name, and the confirm button repeats the verb.
number: 0038
status: accepted
date: 2026-10-18
---

# 0038. A button and the dialog it opens say the same words

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. There was no rule. In the product, Register App opened New connected app, and New Task opened Create Task.

## Decision

The button's label is the title of the dialog or sheet it opens. Editing is titled Edit and the item's name. The confirm button repeats the same verb.

## Consequences

What people click is what opens; otherwise it looks like they clicked the wrong thing.

## Related

- [Writing](../foundations/writing.md#actions-and-their-dialogs)
