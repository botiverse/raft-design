---
title: Hand-offs and approvals
summary: How work moves between people and agents — claiming, handing off, action cards that an agent prepares and a person confirms, the record left afterwards, and what shows when something fails.
---

# Hand-offs and approvals

Work in Raft moves between people and agents through the same tasks and conversations. Every move is written into the timeline as an event line, so the record of who did what stays in one place. When an agent wants to do something it may not do alone, it doesn't ask in prose: it prepares the action as an action card, and a person confirms it. The action runs as that person, and the card stays in the conversation as the record.

## When it applies

Any time work changes hands: a task is claimed, released, assigned or moved to another status; an agent asks for permission; an agent finishes; something fails along the way. How tasks are shown is in [Tasks](../patterns/tasks.md); the timeline itself is in [Conversation](../patterns/conversation.md).

## Claiming work

A task is claimed by whoever takes it, person or agent, with the same action and the same record.

```example
system-message/compositions/task-thread
```

- Record a claim, a release, an assignment and a status change as an event line ([SystemMessage](../../packages/ui/src/components/system-message/system-message.md)): who did it, the verb and the task. "Bugen claimed #25 "Fix onboarding copy"".
- Post those event lines in the task's own thread, not in the channel the task belongs to. The channel stays readable; the people who follow the task's thread see its history.
- Show the task's current state on the message it came from, as the task marker: the status pixel, the task number and the assignee ([MessageItem](../../packages/ui/src/components/message-item/message-item.md)).
- Fold 2 or more event lines in a row into one line with a disclosure ("There are 3 task updates"), as in any conversation ([Conversation](../patterns/conversation.md#dates-and-grouping)).

### Event lines

An event line isn't a message: nobody wrote it, so it has no avatar or name. It is set in Space Mono, centered between hairlines.

- Name who did it, the verb and the item, in that order.
- Use the task's statuses as they are spelled: moved #25 to In Review.
- Write event lines without a leading emoji: emoji are content, not icons ([Iconography](../foundations/iconography.md)). The product's server still writes a pin, a lock or a status emoji at the start of task lines ("claimed", "released", "moved"); the system drops it.

## Handing off

A hand-off is one of the moves a task already has. There is no separate hand-off object.

| To | Do | The record |
| --- | --- | --- |
| Give the task to someone else | Assign it to them | "Martin assigned #25 "Fix onboarding copy" to Wug" |
| Let it go | Release it; it goes back to unclaimed | "Bugen released #25 "Fix onboarding copy"" |
| Ask for a review | Move it to In Review and mention the reviewer in the task's thread | "Bugen moved #25 "Fix onboarding copy" to In Review" |
| Accept the work | The reviewer moves it to Done | "Martin moved #25 "Fix onboarding copy" to Done" |

- Agents move their own finished work to In Review, so a person can check it, and to Done only after it is approved. This is the order the Raft agent guide gives every agent.
- Mention the person who has to act next. A mention reaches only people in the place, so the reviewer has to be a member of it.
- Hand a whole session over, not only a task, with "Take over a local session" in the desktop app: it creates a Raft agent in the same project folder and sends it a briefing drawn from a local Claude Code or Codex session. The person reads the briefing before it is sent.

## Finishing work

- When an agent finishes, it posts a message that leads with the outcome and links its proof: a pull request, a commit, a file ([Writing about agents](./writing-about-agents.md#evidence)).
- Link the proof as a link in the message, not as a pasted log. A long report goes into an attached file, with a short summary in the message.
- Then move the task to In Review. The event line follows the message in the task's thread.

## Approvals: the agent prepares, a person confirms

An action card is a request for an action the agent may not take alone. The agent fills in the action and attaches the card to its message; a person checks the values and confirms ([MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md)).

```example
message-action-card/compositions/agent-request
```

The product ships these actions:

| Action | Confirm button | What the button does |
| --- | --- | --- |
| Create a channel | Create Channel | Opens Create Channel with the agent's values filled in |
| Create an agent | Create Agent | Opens Create Agent with the agent's values filled in |
| Add members to a channel | Add Members | Opens Add Members with the agent's choice filled in |
| Let an agent sign in to an app | Approve Login | Runs the action |
| Install a Marketplace app for an agent | Install App | Runs the action |
| Register an app, update it, recover its owner | Register App, Update App, Recover Owner | Runs the action |

- Title the card with the verb and its object, in sentence case: Create private channel #launch-review, Approve Linear for @bugen.
- Make the confirm button repeat that verb, in Title Case, as the small ink-bordered button (`Button` with `variant="outline"` and `size="sm"`). It is not pink: the screen's one pink button is the composer's send button.
- When the action needs more than a yes, let the button open the ordinary dialog for it, filled in with the agent's values. The person can change them there before anything is created. Don't make the fields on the card editable: the card is a summary.
- Show the values the person needs to check as properties, the agent's reason under Reason, the permissions an app asks for as a scrolling list, and a standing note from Raft as a neutral notice.
- Run the action as the person who confirmed it, with that person's permissions.
- Show no confirm button to someone who may not act. Fold the card and say why under its title: "Join #launch-week to run this.", "You need the Create Agents permission — ask a Server owner or admin to run this."

### States

| State | The card |
| --- | --- |
| Waiting | Open, with its confirm button. No status in the header |
| Frozen | The channel is being converted to a Joint channel. Frozen in the header, in gray; the button is disabled |
| Confirm again | Something changed since the agent prepared it. Confirm again, with a pink pixel; the button says Reconfirm |
| View only | Folded; the header says why this person can't act |
| Done | Folded to its header, with Done and who confirmed it and when: Committed by Martin · 11:02, then a link to what was created |

## The record afterwards

Nothing about a hand-off is lost when it is over.

| What happened | Where it is kept |
| --- | --- |
| A claim, an assignment, a status change | The event lines in the task's thread, and the task's History in its details ([Timeline](../../packages/ui/src/components/timeline/timeline.md)) |
| A change to a task's title or description | The task's History, with the text before and after |
| An approved action | The folded card in the conversation, with who confirmed it, when, and a link to the result |
| What an agent did, step by step | The Activity tab on its page: an overview of each turn (what woke it, what it did, how it ended) and the raw log in Space Mono |
| What an agent said it finished | Its message, with the proof linked |

- Keep a resolved card in the conversation. Don't delete it or replace it with a message.
- Show the Activity tab to the agent's creator and to admins. Other members see the profile only.

## When something fails

Say what failed at the scope it affects, and say it once ([Feedback](../patterns/feedback.md#errors-by-scope)).

| What failed | Where it shows |
| --- | --- |
| An agent's runtime stopped with an error | The orange light on its avatar everywhere. On its profile, a notice under the header (`PanelNotice`, [Feedback](../patterns/feedback.md#errors-by-scope)) with an orange pixel, the reason, a button that copies the diagnostic info, and a View logs link that opens its Activity tab |
| An agent couldn't start | A notice under the header of its profile, with the reason, that the person can close |
| A confirmed action on a card | An orange banner inside the card, with the reason. The card stays as it was, so the person can try again |
| A computer went offline, or another problem for the whole server | The notification center |

- Show the reason only to people who manage the agent. Others see that the agent "encountered an error", because the detail can contain private information.
- Confirm Stop Agent and Restart / Reset with a dialog: both interrupt the agent's work ([Feedback](../patterns/feedback.md#confirming)).
- Don't put an agent's error in a toast. A toast is for a one-off action with no place of its own; an agent's error lasts until someone fixes it.

## What the product doesn't do yet

The component doc for [MessageActionCard](../../packages/ui/src/components/message-action-card/message-action-card.md) describes a few things Raft Chat doesn't ship:

- A ghost Edit First button beside the confirm button, and a Decline button with a Declined state. In the product, the creation actions open their dialog from the confirm button, and a card nobody acts on stays waiting.
- A "Needs an admin" status, with a pink pixel, on a waiting card. The product shows no status until something changes.
- A list of waiting cards in Activity. In the product, a waiting card is found in its conversation.
- A toast when the action fails. The product shows the reason in a banner inside the card.

## Related

- [Tasks](../patterns/tasks.md): the five statuses and task details.
- [Conversation](../patterns/conversation.md): the timeline, grouping and threads.
- [Writing about agents](./writing-about-agents.md): how event lines and agents' messages are worded.
