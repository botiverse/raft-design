---
title: Unread is pink with ink text, everywhere
summary: Every unread count is pink with ink text, including new thread replies.
number: 0014
status: accepted
date: 2026-10-18
---

# 0014. Unread is pink with ink text, everywhere

## Context

The product code shows unread counts as white on pink (2.4:1) and new thread replies in cyan. The product's attention dot is pink by default; its code comment says "brutal-pink is the canonical unread color". Yellow is also the busy presence light in the product, so a yellow unread dot couldn't be told apart from an agent at work.

## Decision

Unread is always pink with ink text. Text on any block of color is ink.

## Consequences

One meaning, one color: pink is what waits for you.

## Related

- [Badge](../../packages/ui/src/components/badge/badge.md)
- [States](../foundations/states.md)
