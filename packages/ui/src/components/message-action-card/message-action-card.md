---
title: MessageActionCard
summary: A card an agent attaches to its message with an action already filled in, for a person to confirm; afterwards it records who did it and when.
status: stable
aliases: [ActionCard, action card, approval card]
layer: collaboration
category: agents
related: [message-item, description-list, button, icon-tile, activity-inbox, dialog]
---

# MessageActionCard

An action card is how an agent asks for something it may not do alone: create a channel, add people, merge, publish, spend money. The agent fills in the action and attaches the card to its message; a person confirms it. Afterwards the card stays in the conversation as the record of who did it and when. A request waiting for someone is also listed in Activity ([Hand-offs and approvals](../../../../../design/people-and-agents/handoffs-and-approvals.md#approvals-the-agent-prepares-a-person-confirms)).

```example
message-action-card/compositions/action-card-interactive
```

## When to use

| Situation                                              | Use                                                                                   |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------- |
| An agent wants to do something a person must authorize | MessageActionCard                                                                     |
| An agent reports that it finished                      | Its message, with links to its proof ([MessageItem](../message-item/message-item.md)) |
| An agent claimed or handed off work                    | An event line ([SystemMessage](../system-message/system-message.md))                  |
| The person must decide now, outside a conversation     | [Dialog](../dialog/dialog.md)                                                         |

## Anatomy

- `MessageActionCard`: the card, inside the body of the agent's message: an item card, at most 400px wide and the message's width on a phone ([Cards in messages](../../../../../design/patterns/cards-in-messages.md#two-widths)). Required.
- `MessageActionCardHeader`: the top row. Required.
  - `MessageActionCardHeaderIcon`: the kind of action, in a neutral tile like an `sm` [IconTile](../icon-tile/icon-tile.md).
  - `MessageActionCardHeaderTitle`: what will be done. `MessageActionCardHeaderDescription` under it says what happened, or why the person can't act.
  - `MessageActionCardHeaderMeta`: the time the card records, in Space Mono at the hint tier. At the end of the description it closes that line ("Approved by Martin · 10:51"); directly in the title, alone, it is a line of its own under the title. It stays in view while the card is folded.
  - `MessageActionCardStatus`: who or what the card waits on, or how it ended, as a pixel and a word.
  - `MessageActionCardCollapseTrigger`: folds the card to its header and back.
- `MessageActionCardContent`: everything under the header; it folds.
  - `MessageActionCardNotice`: a standing note from Raft about consequences or permissions. At most one.
  - `MessageActionCardProperties`, `MessageActionCardProperty`, `MessageActionCardPropertyLabel`, `MessageActionCardPropertyValue`: the values the person checks, as a description list ([DescriptionList](../description-list/description-list.md)): the label beside its value, and above it only when a value doesn't fit beside its label, at any width, as in a DescriptionList ([Labels go above only when a value doesn't fit](../description-list/description-list.md#labels-go-above-only-when-a-value-doesnt-fit)).
  - `MessageActionCardHintLabel`, `MessageActionCardHint`: the agent's own note, such as its reason or what it filled in.
  - `MessageActionCardScopeList`, `MessageActionCardScopeListLabel`, `MessageActionCardScopeListViewport`, `MessageActionCardScope`, `MessageActionCardScopeName`, `MessageActionCardScopeDescription`: the permissions an app asks for.
  - `MessageActionCardActions`: the buttons, with `MessageActionCardActionsNote` before them.
  - `MessageActionCardCompletion`: the record of who did it and when.

```example
message-action-card/compositions/channel-agent-actions
```

```example
message-action-card/compositions/integration-actions
```

## States

| State         | The card                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------- |
| Waiting       | Open, with its buttons. The status says whom it waits on, with a pink pixel: Needs an admin |
| Paused        | Open; the note before the buttons says why, and the buttons are disabled                    |
| Confirm again | Open; something changed since the agent prepared it, and the note says what                 |
| Done          | Folded to its header; the description says who did it and when                              |
| Declined      | Folded; the description says who declined it and that nothing changed                       |
| Expired       | Folded; the description says no one acted in time and that nothing changed                  |
| View only     | Folded; the description says why the person can't act. No buttons                           |

- When the action fails, show a toast and leave the card as it was, so the person can try again ([Toast](../toast/toast.md)).

```example
message-action-card/compositions/resolution-states
```

## Behavior

- The card is open by default. Fold a resolved or view-only card with `defaultOpen={false}`; the collapse trigger opens it again.
- A long list of permissions scrolls inside its own area, at most 136px tall, so the card doesn't grow with it. The cap cuts through a line of text, so the cut reads as more below: through the third permission's name when the descriptions take one line, through the last line of the second when they take two. A cap that ends between two rows, or under the last pixels of a line, reads as the end of the list.

## Content

- Title the card with a verb and its object, in sentence case: Create channel #launch-week, Merge #26 into main.
- Name people and agents by display name, without @: Approve Linear for Lumen, Created by Ada → Release Bot. The @ handle is for mentions, which notify; a card that names someone notifies no one, and a display name is what the person sees everywhere else (#proj-apps:#41, 2026-11-06).
- Make the confirm button repeat the verb and the object of the title, in sentence case: Create channel. Unlike a dialog's button, it keeps the object, because it appears away from a dialog title and has to say on its own which action it approves ([Writing](../../../../../design/content/writing.md#actions-and-their-dialogs)).
- List only the properties the person needs to check.
- When the agent filled values in itself, say so in the hint: "Bugen filled these in from the thread. You can change them before it's created."
- Record the result with the person and the time: Approved by Martin · 10:51. Put the time in `MessageActionCardHeaderMeta`, not as text of the description: it is data, a note like a message's time ([Color tiers](../../../../../design/foundations/typography.md#color-tiers)), and the description is for the words.

## Accessibility

`MessageActionCard` wraps Base UI's Collapsible: the collapse trigger and the folding content follow it.

- Give `MessageActionCardCollapseTrigger` an `aria-label` ("Show or hide details"); it shows only an icon.
- Give `MessageActionCardScopeListViewport` an `aria-label` that names the list ("Permissions"). It is a Tab stop only while it overflows, so keyboard users can scroll it.
- The header icon is hidden from assistive technology; the title carries the meaning.

## Rules

- Make the confirm button the small ink-bordered button (`Button` at the default `size="md"`), not pink: the screen's one pink button is the composer's send button.
- Put a ghost Edit first button beside it, which opens the ordinary dialog for the action with the agent's values filled in. Don't edit fields on the card: the card is a summary.
- Run the action as the person who confirmed it.
- Keep the card in the conversation after it is resolved, as the record of the action.
- Show no buttons to someone without the permission to act. Say whom the card waits on instead.
- Keep a notice neutral, never in a warning color.
