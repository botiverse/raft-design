---
title: Feedback
summary: How to tell people something — what acts at once, what offers Undo and what is confirmed, empty versus loading versus failed, where errors go by scope, and how they are worded.
redirectFrom: [decisions/0037-panel-notice]
---

# Feedback

The wider the scope of a message, the further out it goes: an input's error sits under the input, a panel's problem under the panel header, a server's problem in the notification center. A message placed next to what it is about needs no explanation of where the problem is. Which component carries each kind of message is in [Choosing a component](../components/overview.md#telling-people-something).

## When it applies

Every result, problem, empty view and wait that people need to know about.

## Rules

### Confirming

How far an action reaches decides whether it is confirmed, offered with Undo or neither (stdrc, 2026-10-29). Whether it waits for Save is a different question, decided by what the change is ([Forms](./forms.md#when-a-change-takes-effect)).

| The action | Do |
| --- | --- |
| Affects only the person, and its way back stays in place: Follow Thread, Save Message | Act at once, with no dialog and no toast |
| Affects only the person, and takes an item out of the list: Done, Unfollow, Close | Act, and show a toast with Undo |
| Affects others and can be changed back: a member's role, an agent removed from a thread's followers | Act, and show a toast with Undo |
| Shows something to a wider audience: making an Artifact or a server public | Confirm |
| Stops work, takes someone out of a place or narrows who can see something, makes a link or key others hold stop working, archives or deletes | Confirm |

- Act at once when the person can reverse the action in the same place: Follow Thread (Unfollow Thread), Save Message (Remove from Saved). A question before an action that is one click to undo only slows people down.
- Offer Undo on every route to an action that takes an item out of the list: the menu, the button on the row and the swipe alike ([Toast](../../packages/ui/src/components/toast/toast.md)). Once the row is gone its way back is gone too, and an action that can be undone from one route and not from another can't be trusted from either.
- Apply a change to others that can be changed back, such as a role, when it is picked, and offer Undo. Confirm it only when people demote themselves, since they may lose the right to change it back, or turn off something others depend on, such as an AI provider their agents use; the dialog lists who is affected.
- Confirm before showing something to a wider audience, and say who will see it: "Anyone with the link can view it." Widening within the same server applies at once. Narrowing who can see something and unpublishing it share one confirmation, which lists who loses access, whichever route starts it.
- Confirm with a dialog any action that stops an agent's work, takes someone out of a place, or archives or deletes something, because none of these can be put back from where it happened: Stop Agent, Restart or Reset, Archive Agent, Leave Channel, Remove Member, Delete Server ([Dialog](../../packages/ui/src/components/dialog/dialog.md)). The confirm button says the action's verb, and keeps the object when it can't be undone: Stop, Delete Server ([Writing](../content/writing.md#actions-and-their-dialogs)).
- In a dialog that confirms something that cannot be undone, put the message in a red banner and make the confirm button red. Don't color the action in the menu that opens it: the warning belongs where the person commits, not in a list of choices.

### Empty, loading and failed

Keep these three apart:

| Situation | Show |
| --- | --- |
| There is nothing here | An empty state ([EmptyState](../../packages/ui/src/components/empty-state/empty-state.md)): a gray icon, a title, one sentence that says how something gets here, and at most one button |
| It is loading | A skeleton with the layout of the content, such as task cards or conversation rows ([Skeleton](../../packages/ui/src/components/skeleton/skeleton.md)); the other indicators are in [Choosing a component](../components/overview.md#waiting) |
| It failed to load | An orange banner where the content would be, which says what happened and offers Retry ([Banner](../../packages/ui/src/components/banner/banner.md)) |

```example
empty-state/compositions/default
```

- Don't show an empty state when loading failed. An empty state is a conclusion ("there is nothing here"); a failure is not. Raft Chat doesn't follow this everywhere yet ([Raft Chat](../products/raft-chat/README.md#differences-from-the-shared-patterns)).
- When a filter hides everything, say so in the empty state ("No tasks match this filter") and how to get results back, so people don't conclude the list is empty.
- Make the skeleton the same size as the content it stands for, so nothing flashes or jumps when the content arrives. Don't show one placeholder and then swap it for another. The same holds for everything around it: the first frame is already the settled one ([Responsive layout](./responsive.md#the-first-frame-is-the-settled-one)).
- Show the skeleton only after the wait passes 1 second, the same as a spinner ([Spinner](../../packages/ui/src/components/spinner/spinner.md#behavior)): a load that finishes sooner goes straight from nothing to the content, without a skeleton flashing in between. Mark the region `aria-busy` from the start: the container that stays when the content arrives, not the skeleton, which goes away before a screen reader could hear it finish. raft-ui doesn't delay a `Spinner` or a single `Skeleton` for you, since a spinner often sits inline or in a button, where starting at once is right. A list skeleton is only for a slow load, so `InboxItemSkeletonList` waits 1 second by default; pass `delay={0}` to show it at once.
- A list of flat rows loads as flat skeleton rows. Give the skeleton nothing the loaded list doesn't have: no border, card or background around a row, and no gap between rows the list doesn't have. A bordered card in place of a flat row is a different size and a different shape, so the list jumps when it arrives. Build skeleton rows from the row's own parts, which keep its padding and line heights: `InboxItemSkeleton` for [InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#states) rows, `ListRowSkeleton` for [ListRow](../../packages/ui/src/components/list-row/list-row.md#states) rows. Cards load as cards, such as `TaskLoadingRow` for task cards ([Tasks](../../packages/ui/src/components/tasks/tasks.md)).

### Errors, by scope

| Scope | Where the error goes |
| --- | --- |
| One input | Under the input; see [Forms](./forms.md#validation) |
| A dialog or a form | An orange banner inside it ([Banner](../../packages/ui/src/components/banner/banner.md)) |
| One panel: an agent won't start, a setting of the conversation didn't save | A full-width notice under the panel header (`PanelNotice`, [Panel](../../packages/ui/src/components/panel/panel.md)), with a `line-seam` above and below: it is a region of the panel, not a banner inside its content. Give it a × when the person can dismiss it, and an action when there is a next step, such as View Logs |
| A one-off action that failed and has no place of its own: a copy blocked by the browser, a thread that is no longer available | A `warning` toast, led by its `TriangleAlert` icon ([Toast](../../packages/ui/src/components/toast/toast.md)) |
| The whole server | The notification center ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)) |

- Give every scope its own place, so an error shows where its cause is: an input, a dialog, a panel, the whole server.
- The prompt that invites a signed-out visitor on a public page to sign up is not feedback, and not a banner ([Banner](../../packages/ui/src/components/banner/banner.md#the-sign-up-prompt-on-a-public-page)). A page's own state never takes its place.
- Use orange when something goes wrong, not red: red means something cannot be undone ([Color](../foundations/color.md#meanings-of-color)).
- Say what happened, why, and what to do next, in plain words ([Writing](../content/writing.md)).

### Progress

- Put progress inside the thing it belongs to, on its own thin track. Don't attach it to the edge of a rounded container; see [Shape](../foundations/shape.md#nothing-on-the-edge-of-a-rounded-container).

## Related

- [Actions and closing](./actions-and-closing.md): when an action goes in a dialog, a banner or a toast, and how each one closes.
- [States](../foundations/states.md): the error and busy states of controls.
- [Hand-offs and approvals](../people-and-agents/handoffs-and-approvals.md#when-something-fails): an agent that fails.
