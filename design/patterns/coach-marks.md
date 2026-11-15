---
title: Coach marks
summary: A tour of a screen the person has just entered, one stop at a time — a Popover anchored to what it is about, the target washed cyan, and the page live underneath.
---

# Coach marks

A coach mark is one stop of a tour: a bubble that points at one thing on the screen, says what it is in a sentence, and moves on with Next. The tour runs once, the first time a person enters a screen they have never seen, and it never stops them from using it. Raft Chat's first entry into the server is the one tour ([Onboarding](../products/raft-chat/onboarding.md#the-tour-v3)).

## When it applies

- A tour of a screen the person enters for the first time, while something else goes on (the first agent at work).
- Not for what the person meets later: a first task, thread, file or result is explained by Cindy or the agent in the conversation, when it appears. The tour is the product's only scripted guidance, so everything after it can answer what the person is actually doing (stdrc, 2026-11-14).
- Not for errors, confirmations or anything the person must answer: those follow [Feedback](./feedback.md).

## Structure

A [CoachMark](../../packages/ui/src/components/coach-mark/coach-mark.md), a popover anchored to the target, with its arrow:

- `PopoverBody`: `PopoverTitle`, the thing's name, and `PopoverDescription`, one sentence about it.
- Optionally one more action the stop offers, an `outline` button on its own row under the text (`CoachMarkAction`; Turn on notifications): beside Skip and Next it would wrap at 300px.
- `CoachMarkActions`: the count "2 of 6" at the start (`CoachMarkCount`), in Space Mono `text-mono-meta`, `foreground-hint`; then Skip (`ghost`) and Next (`CoachMarkNext`, `primary`). The last stop has Done (`primary`) and no Skip.

## Rules

### The bubble

- Make it 300px wide, with the popover's surface, shadow and 16px padding, 8px from its target and at least 8px from the window's edge ([Elevation](../foundations/elevation.md)).
- Write a title and one sentence. A stop that needs two sentences is two stops, or something the agent should say.
- Make Next, and Done on the last stop, the pink button: at that moment the bubble is the one thing to do (stdrc, 2026-11-14, replacing the earlier `outline`). The composer's send button stays pink under it: this is the one place two pink buttons share a screen, a stated exception to [One pink button](./actions-and-closing.md#one-pink-button), because the tour lies over a live page instead of replacing it. It is also the one popover with a pink button ([Popover](../../packages/ui/src/components/popover/popover.md#rules)).
- Count the stops on every bubble, so the person knows how long the tour is. Skip ends the whole tour, not the stop.
- When a stop's target isn't on screen when its turn comes (the agent's working line has gone), skip that stop and count again without it: "2 of 6" is followed by "3 of 5", not "4 of 6". A missing number reads as a fault; a total that changes once reads as a shorter tour.
- Let nothing else ask for attention while the tour runs: another card or prompt (How did you hear about Raft?) waits until the tour ends or is skipped. Two popups at once leave the person to work out which comes first.

### The target

- Mark the target with the Located wash (`info-soft`; `fill-cell-selected` on a list row), held at full strength while its stop is open and gone when the stop closes ([Located](../foundations/states.md#located)). The cyan says "this item" and is already what a jump lands on.
- Draw no ring around the target, and no scrim: the page stays live, and the agent working under the tour is never covered.
- Leave a target that is already selected with its selection: a stronger mark wins, as for every located item.
- Anchor each stop to something every platform has, such as the bell, wherever that platform puts it, never to the window's controls, which sit on different sides on macOS and Windows.
- Point each stop at one thing. A stop about two things is two stops.
- Order the stops so that no bubble covers a target before its own stop.

### Focus and keys

- Keep the bubble non-modal, like the page under it. When a stop opens, move focus onto Next (not Skip), unless the person is typing in a field: then focus stays where it is ([Accessibility](../foundations/accessibility.md)).
- Tab and Shift+Tab leave the bubble as they leave any popover; the bubble's buttons come right after its target in the tab order, so the person can go back to it.
- End the tour with Esc (while focus is in the bubble), Skip or Done, and put focus in the composer of the conversation on screen: what the tour was for is talking to the agent. A press outside the bubble, or focus leaving it, doesn't close it: the person may be answering the agent. Esc counts as Skip, ending the tour on every device: it can be pressed on any stop, and it means no tour, not that this device's stops are done.
- Run each stop once per account, on any device: the progress is the account's, a record of which stops were shown, so each device shows the stops it has that aren't done yet, and its count counts only those (a desktop opened after the phone showed two shared stops reads "1 of 4", not "3 of 6"). Skip ends the tour on every device: it is the person saying no tour. Done ends it on that device only, since it says that device's stops are finished: a person who finishes the phone's three stops still meets the desktop's own stops (the rail, the composer) there. Tying it to the first device left a second open device showing every stop while none of its steps could be recorded (Ferry, 2026-11-15, end-to-end run of onboarding v3).

## Wide and narrow

- On a phone, use the same Popover, with fewer stops (3 in Raft Chat), all on the screen the person lands on (Raft Chat lands on Home). A bubble there sits under its row and covers the rows below it, so the lower target goes first.

## Built from

raft-ui's [CoachMark](../../packages/ui/src/components/coach-mark/coach-mark.md) (experimental, from `@botiverse/raft-ui/wip`): `CoachMarkContent` is the 300px bubble with its arrow, the target holds the Located wash through `data-located="held"`, and the bubble is non-modal and focuses `CoachMarkNext` as above. Its text is a [Popover](../../packages/ui/src/components/popover/popover.md)'s `PopoverBody`. Esc calls the stop's `onDismiss`; Skip, Next and Done are the product's own handlers, and the product moves focus to the composer when the tour ends.

## Related

- [CoachMark](../../packages/ui/src/components/coach-mark/coach-mark.md): the part.
- [Popover](../../packages/ui/src/components/popover/popover.md): the panel it is built on.
- [States](../foundations/states.md#located): the Located wash.
- [Raft Chat: Onboarding](../products/raft-chat/onboarding.md#the-tour-v3): the tour's stops.
