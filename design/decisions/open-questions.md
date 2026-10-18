---
title: Open questions
summary: The places where the system has drawn more than one version and the choice is still open, with the current default for each.
---

# Open questions

In these places the same thing is drawn in more than one version, and the choice is still open. Until it is made, use the default. Once a version is chosen, the others are removed from the components and the choice becomes a decision record.

| Where | Versions | Default |
| --- | --- | --- |
| The top bar of a phone's top-level pages | With the page name as a large title, or as the product is today (Home shows only the workspace pill) | With the page name ([0004](./0004-title-on-every-top-level-page.md)) |
| The top bar of a phone's pushed pages | White or yellow. With yellow, the frame extends to the top bar of pushed pages | None |
| The desktop rail | Icons only (56px), or icons with labels (68px) | Icons only |
| Tabs | A yellow sticker, or an underline (ink text and a 2px ink line, as in the product) | Sticker ([0013](./0013-sticker-tabs.md)) |
| Chat, tasks and files in a Raft Chat channel | A: sticker tabs; B: underline tabs; C: a segmented control in the top bar; D: tasks in the side panel next to the conversation | A |

## The labeled rail and the square corner

The labeled rail is 68px wide, so its top-left corner is 68×56 instead of a square. The product pins the square corner with a UI test (`leftrail-square-slot`). Choosing the labeled rail means one of:

- changing that test, or
- making every header 68px high, so the corner stays square.

See [0005](./0005-56px-headers-and-rail.md).

## Related

- [Panel](../../packages/ui/src/components/panel/panel.md): the phone top bar versions.
- [AppRail](../../packages/ui/src/components/app-rail/app-rail.md): the two rails.
- [Tabs](../../packages/ui/src/components/tabs/tabs.md): the two tab styles.
- [Raft Chat](../products/raft-chat/README.md): the channel views.
