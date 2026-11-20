---
title: CornerTag
summary: The grey tag stuck to a card's top-right corner that says what the person on the card is here (Owner, Admin, Guest, You), with a spacer that keeps a long name from running under it.
status: experimental
aliases: [RoleCornerTag, role tag, corner tag, folded tag]
layer: core
category: identity
related: [preview-card, card, avatar, badge, origin-band]
---

# CornerTag

A CornerTag says what the person on a card is on this server, Owner, Admin, Guest or You, as a grey tag stuck to the card's top-right corner. It lies over the card and takes no row of its own, so the avatar and the name sit where they would without it. It is on a person's or an agent's profile card and on the Members page's tiles.

```example
corner-tag/compositions/profile-card
```

## When to use

| Situation                                                   | Use                                                                                                |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| What the person on a card is here: Owner, Admin, Guest, You | CornerTag                                                                                          |
| Which server someone on a card comes from                   | [OriginBand](../origin-band/origin-band.md), not a tag                                             |
| A role in a list row, which has no card corner              | A small muted word after the name ([Members](../../../../../design/products/raft-chat/members.md)) |
| A promotion on a plan card: Pro, Save 20%                   | A [Badge](../badge/badge.md), as the plan card has it, never a corner tag                          |
| A status: working, failed, merged                           | A status chip ([Status](../status/status.md))                                                      |

## Anatomy

- `CornerTag`: the tag, the card's first child. Its two outer edges are the card's own and only its inner corner is rounded (10px); the card's corner clips the outer one. A `span`, so it may sit inside a card that is a button.
- `CornerTagSpacer`: an invisible copy of the tag's words at the end of the name line. It has no height and is hidden from assistive technology; it only keeps room, so a long name truncates before the tag. Give it the same words as the tag.

```example
corner-tag/compositions/member-tiles
```

## Behavior

- The tag is placed against the card, so the card must be its nearest positioned box and clip its corners: `relative`, with the card's own `overflow-hidden` and radius (`Card` and `PreviewCardPopup` clip already). Inside a list cell whose pressed shape is inset, put the tag in a box with the cell's inset and radius.
- A long name truncates before the tag, and the tag never truncates. The name keeps at least 3 characters (`min-w-[3ch]`) on a tile.

## Content

- Write only what the person is here: Owner, Admin, Guest. On the person's own card, You, with the role after it: "You · Owner".
- A member has no tag. Most of a server are members, so a tag on every card would say nothing; the exceptions stand out because the rest are quiet.
- An agent's tag is only Admin, and only for this server's agents.
- Never for someone from another server: their role on their own server isn't shown ([Member labels](../../../../../design/people-and-agents/identity-and-presence.md#member-labels)).

## Accessibility

- The tag is text and is read where it is in the card. When the card is a button, point the button's `aria-describedby` at the tag, so the role follows the name.
- `CornerTagSpacer` is `aria-hidden`, so the role is not read twice.

## Rules

- Keep the tag grey (`fill-medium`, `foreground`), never a colour: blue already says "from another server" and red, green and yellow say a status.
- Put the tag on the top-right corner only, flush with the card's edges; never inset it or float it outside the card. A tag hanging off the card's edge is a promotion's Badge, a different thing.
- Put a `CornerTagSpacer` at the end of every name line that sits beside a tag, so the name never runs under it.
- One tag per card. "You · Owner" is one tag.
