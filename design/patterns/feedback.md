---
title: Feedback
summary: How to tell people something — what acts at once and what is confirmed, empty versus loading versus failed, where errors go by scope, and how they are worded.
---

# Feedback

The wider the scope of a message, the further out it goes: an input's error sits under the input, a panel's problem under the panel header, a workspace's problem in the notification center. Which component carries each kind of message is in [Choosing a component](./choosing-components.md#telling-people-something).

## When it applies

Every result, problem, empty view and wait that people need to know about.

## Rules

### Confirming

- Act at once, without a dialog or a toast, when the person can reverse the action in the same place: Mark as Done (Reopen Task), Save Message (Remove from Saved).
- Confirm with a dialog any action that stops an agent's work, takes someone out of a place, or archives or deletes something: Stop Agent, Restart or Reset, Archive Agent, Leave Channel, Remove Member, Delete Server ([Dialog](../../packages/ui/src/components/dialog/dialog.md)). The confirm button repeats the action's verb ([0038](../decisions/0038-button-names-its-dialog.md)).
- In a dialog that confirms something that cannot be undone, put the message in a red banner and make the confirm button red. Don't color the action in the menu that opens it.
- When an action has a natural way back in the same moment, act and show a toast with Undo instead of a dialog ([Toast](../../packages/ui/src/components/toast/toast.md)). In Raft Chat this is removing an agent from a thread's followers: the toast stays 5 seconds.

### Empty, loading and failed

Keep these three apart:

| Situation | Show |
| --- | --- |
| There is nothing here | An empty state ([EmptyState](../../packages/ui/src/components/empty-state/empty-state.md)): a gray icon, a title, one sentence that says how something gets here, and at most one button |
| It is loading | A skeleton with the layout of the content, such as task cards or conversation rows ([Skeleton](../../packages/ui/src/components/skeleton/skeleton.md)); the other indicators are in [Choosing a component](./choosing-components.md#waiting) |
| It failed to load | An orange banner where the content would be, which says what happened and offers Retry ([Banner](../../packages/ui/src/components/banner/banner.md)) |

```example
empty-state/compositions/default
```

- Don't show an empty state when loading failed. An empty state is a conclusion ("there is nothing here"); a failure is not. Raft Chat's Activity and Saved don't follow this yet: when their list fails to load, they show their empty state.
- When a filter hides everything, say so in the empty state ("No tasks match this filter") and how to get results back.
- Make the skeleton the same size as the content it stands for, so nothing flashes or jumps when the content arrives. Don't show one placeholder and then swap it for another.

### Errors, by scope

| Scope | Where the error goes |
| --- | --- |
| One input | Under the input; see [Forms](./forms.md#validation) |
| A dialog or a form | An orange banner inside it ([Banner](../../packages/ui/src/components/banner/banner.md)) |
| One panel: an agent won't start, a setting of the conversation didn't save | A full-width notice under the panel header (`PanelNotice`, [Panel](../../packages/ui/src/components/panel/panel.md), [0037](../decisions/0037-panel-notice.md)). Give it a × when the person can dismiss it, and an action when there is a next step, such as View Logs |
| A one-off action that failed and has no place of its own: a copy blocked by the browser, a thread that is no longer available | A toast with an orange pixel ([Toast](../../packages/ui/src/components/toast/toast.md)) |
| The whole workspace | The notification center ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)) |

- Use orange when something goes wrong, not red ([Color](../foundations/color.md#meanings-of-color)).
- Say what happened, why, and what to do next, in plain words ([Writing](../foundations/writing.md)).

### Progress

- Put progress inside the thing it belongs to, on its own thin track. Don't attach it to the edge of a rounded container; see [Shape](../foundations/shape.md#nothing-on-the-edge-of-a-rounded-container).

## Related

- [States](../foundations/states.md): the error and busy states of controls.
- [Agents](./agents.md): an agent that fails.
