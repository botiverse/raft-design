---
title: An editable avatar shows its overlay on hover, focus and upload
summary: An editable avatar has one overlay with an action icon, shown on hover, on keyboard focus and while uploading.
number: 0041
status: accepted
date: 2026-10-18
---

# 0041. An editable avatar shows its overlay on hover, focus and upload

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. There were two kinds of overlay, shown only on hover, so keyboard users couldn't tell the avatar was editable.

## Decision

An editable avatar has one overlay, a scrim with an action icon, shown on hover, on keyboard focus and while uploading.

## Consequences

The avatar is discoverable as editable with the keyboard.

## Related

- [Avatar](../../packages/ui/src/components/avatar/avatar.md)
