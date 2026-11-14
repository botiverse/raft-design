---
title: Coach marks
summary: A tour of a screen the person has just entered, one stop at a time — a Popover anchored to what it is about, the target washed cyan, and the page live underneath.
---

# Coach marks

A coach mark is one stop of a tour: a bubble that points at one thing on the screen, says what it is in a sentence, and moves on with Next. The tour runs once, the first time a person enters a screen they have never seen, and it never stops them from using it. Raft Chat's first entry into the App is the one tour ([Onboarding](../products/raft-chat/onboarding.md#the-tour-v3)).

## When it applies

- A tour of a screen the person enters for the first time, while something else goes on (the first agent at work).
- Not for what the person meets later: a first task, thread, file or result is explained by Cindy or the agent in the conversation, when it appears. The tour is the product's only scripted guidance, so everything after it can answer what the person is actually doing (stdrc, 2026-11-14).
- Not for errors, confirmations or anything the person must answer: those follow [Feedback](./feedback.md).

## Structure

A [Popover](../../packages/ui/src/components/popover/popover.md) anchored to the target, with its arrow:

- `PopoverBody`: `PopoverTitle`, the thing's name, and `PopoverDescription`, one sentence about it.
- Optionally one more action the stop offers, an `outline` button on its own row under the text (Turn on notifications): beside Skip and Next it would wrap at 300px.
- `PopoverActions`: the count "2 of 6" at the start, in Space Mono `text-mono-meta`, `foreground-hint`; then Skip (`ghost`) and Next (`primary`). The last stop has Done (`primary`) and no Skip.

## Rules

### The bubble

- Make it 300px wide, with the popover's surface, shadow and 16px padding, 8px from its target and at least 8px from the window's edge ([Elevation](../foundations/elevation.md)).
- Write a title and one sentence. A stop that needs two sentences is two stops, or something the agent should say.
- Make Next, and Done on the last stop, the pink button: at that moment the bubble is the one thing to do (stdrc, 2026-11-14, replacing the earlier `outline`). If the person types to the agent meanwhile, the composer's send button turns pink too: each answers its own place, and the bubble stays the one thing the tour asks for. This is the one popover with a pink button ([Popover](../../packages/ui/src/components/popover/popover.md#rules)).
- Count the stops on every bubble, so the person knows how long the tour is. Skip ends the whole tour, not the stop.

### The target

- Mark the target with the Located wash, `info-soft`, held at full strength while its stop is open and gone when the stop closes ([Located](../foundations/states.md#located)). The cyan says "this item" and is already what a jump lands on.
- Draw no ring around the target, and no scrim: the page stays live, and the agent working under the tour is never covered.
- Leave a target that is already selected with its selection: a stronger mark wins, as for every located item.
- Anchor each stop to something that is in the same place on every platform: the top bar's bell, not the window's controls, which sit on different sides on macOS and Windows.
- Order the stops so that no bubble covers a target before its own stop.

### Focus and keys

- Move focus into the bubble, onto Next, not Skip, when a stop opens.
- Keep Tab and Shift+Tab inside the bubble's buttons: a stop is short and is answered or skipped.
- End the tour with Esc, Skip or Done, and put focus in the composer of the conversation on screen: what the tour was for is talking to the agent.
- Skip and Esc end it at any stop. A press outside the bubble, or focus leaving it, doesn't close it: the person may be answering the agent.
- Run the tour once per person.

## Wide and narrow

- On a phone, use the same Popover, with fewer stops (3 in Raft Chat) on the screen the person lands on. A bubble there sits under its row and covers the rows below it, so the lower target goes first.

## Built from

raft-ui's [Popover](../../packages/ui/src/components/popover/popover.md) with `PopoverBody` and `PopoverActions` (experimental, from `@botiverse/raft-ui/wip`). raft-ui has no coach mark part yet, and until it does a product builds these over the stock parts:

- `PopoverArrow` is drawn only for a popover below its trigger, and the panel's `overflow-hidden` clips it; the bubble turns it for the other sides and lets the panel overflow.
- The Located wash runs only as the 2-second flash; holding it needs a held form of `data-located`.
- `PopoverContent` has no 300px width of its own; callers set it.
- The popover closes on a press outside, lets Tab leave it, and focuses its first button; the bubble ignores the outside press and focus leaving, keeps Tab inside, and focuses Next.

## Related

- [Popover](../../packages/ui/src/components/popover/popover.md): the panel.
- [States](../foundations/states.md#located): the Located wash.
- [Raft Chat: Onboarding](../products/raft-chat/onboarding.md#the-tour-v3): the tour's stops.
