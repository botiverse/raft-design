---
title: Feedback
summary: How to tell people something — undo instead of confirm, empty versus loading versus failed, where errors go by scope, and how they are worded.
---

# Feedback

The wider the scope of a message, the further out it goes: an input's error sits under the input, a panel's problem under the panel header, a workspace's problem in the notification center. Which component carries each kind of message is in [Choosing a component](./choosing-components.md#telling-people-something).

## When it applies

Every result, problem, empty view and wait that people need to know about.

## Rules

### Undo instead of confirm

- Don't ask for confirmation when an action can be undone. Do it, then show a toast with Undo ([Toast](../../packages/ui/src/components/toast/toast.md)).
- Guard actions that cannot be undone, such as deleting, with a dialog ([AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md)). Don't color them in the menu.

### Empty, loading and failed

Keep these three apart:

| Situation | Show |
| --- | --- |
| There is nothing here | An empty state ([EmptyState](../../packages/ui/src/components/empty-state/empty-state.md)): a gray icon, one sentence, at most one button |
| It is loading | A skeleton with the layout of the content ([Skeleton](../../packages/ui/src/components/skeleton/skeleton.md)); the other indicators are in [Choosing a component](./choosing-components.md#waiting) |
| It failed to load | An error at its scope (below), which says what happened and offers Retry |

```example
empty-state/compositions/default
```

- Don't show an empty state when loading failed. An empty state is a conclusion ("there is nothing here"); a failure is not.
- Make the skeleton the same size as the content it stands for, so nothing flashes or jumps when the content arrives. Don't show one placeholder and then swap it for another.

### Errors, by scope

| Scope | Where the error goes |
| --- | --- |
| One input | Under the input; see [Forms](./forms.md#validation) |
| A dialog or a form | A banner inside it ([Banner](../../packages/ui/src/components/banner/banner.md)) |
| One panel: an agent won't start, a setting didn't save | A full-width banner under the panel header (`PanelNotice`, [Panel](../../packages/ui/src/components/panel/panel.md)) |
| The whole workspace | The notification center ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)) |

- Use orange when something goes wrong, not red ([Color](../foundations/color.md#meanings-of-color)).
- Say what happened, why, and what to do next, in plain words ([Writing](../foundations/writing.md)).

### Progress

- Put progress inside the thing it belongs to, on its own thin track. Don't attach it to the edge of a rounded container; see [Shape](../foundations/shape.md#nothing-on-the-edge-of-a-rounded-container).

## Related

- [States](../foundations/states.md): the error and busy states of controls.
- [Agents](./agents.md): an agent that fails.
