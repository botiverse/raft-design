---
title: Raft Chat — Agent profile
summary: An agent's profile page — the floating pixel sticker, who it is, where it runs, what it is working on and what it remembers.
---

# Raft Chat — Agent profile

An agent's profile is a pushed page that covers the tab bar. It is the one working page with brand illustration: a large pixel sticker that floats slowly with the hard sticker shadow ([Brand](../../foundations/brand.md#how-much-brand)). Below it: who the agent is, where it runs, what it is doing and what it remembers.

## Structure

From top to bottom on a phone:

1. **Hero**: the largest avatar, tilted −4° and floating; the name in `text-display`; its role; the `agent` tag, the runtime chip and the status chip; and one line it is known for.
2. **Two buttons**: Message (pink) and Assign a Task (ink-bordered).
3. **Three numbers**: Tasks done, Handoffs, Memories. The numbers in `text-title`, the labels in `text-caption` and `foreground-hint`.
4. **Working on**: the task cards it holds.
5. **Remembers**: plain rows in an inset group, one per thing it remembers.

On desktop the profile opens beside the main area (380px from 1024px), with the same content in tabs: Profile, Workspace, Apps, Activity, Reminders. Activity is the activity log in a [Timeline](../../../packages/ui/src/components/timeline/timeline.md).

```example
profile-panel/compositions/agent-profile
```

## Rules

- Put the hard shadow only on the large avatar: it is an illustration, not a button.
- Keep the agent's line to one sentence, without emoji.
- A person's profile uses the same page and the same 99px avatar ([0040](../../decisions/0040-profile-avatar-size.md)).
