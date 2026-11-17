---
title: OriginBand
summary: The light-blue band across the top of a profile card that says someone comes from another server, with the server's tile, its name and a relation word such as External.
status: experimental
aliases: [ExternalOriginRibbon, external band, origin ribbon, From, Also in]
layer: core
category: identity
related: [preview-card, avatar, corner-tag, badge]
---

# OriginBand

An OriginBand says that the person or agent on a profile card comes from another server: a light-blue band across the card's top with the server's tile and name, and the relation word at its end. It goes with the server's tile on the avatar's top-left corner ([Avatar](../avatar/avatar.md#another-server)); both are blue, which in Raft means "from another server".

```example
origin-band/compositions/profile-card
```

## When to use

| Situation                                                                                        | Use                                                                                  |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| A hover card or profile card of someone from another server                                      | OriginBand, ending in External                                                       |
| Their avatar, anywhere it shows                                                                  | `AvatarOrigin` on its top-left corner ([Avatar](../avatar/avatar.md#another-server)) |
| What someone is on this server: Owner, Admin, Guest                                              | [CornerTag](../corner-tag/corner-tag.md)                                             |
| A detail panel's section about where they come from, a list row, a member of ours also elsewhere | Words, not a band ([Content](#content))                                              |

## Anatomy

- `OriginBand`: the 28px band, the card's first child, above the header.
- `OriginBandSource`: the servers: each server's tile, a `3xs` server [Avatar](../avatar/avatar.md), then `OriginBandName`. It takes the room the relation word leaves.
- `OriginBandName`: the servers' names, separated by " · ", on one line, truncated.
- `OriginBandRelation`: the relation word at the band's end, in `foreground-muted`, never truncated.

```example
origin-band/compositions/several-servers
```

## Content

The words for "comes from another server" are one set, chosen by place. raft-ui holds none of them; the product writes them in its language.

| Place                                                                | Words                                        |
| -------------------------------------------------------------------- | -------------------------------------------- |
| The band on a hover card or profile card                             | The servers' names, then External            |
| A detail panel's section about it                                    | From, as the section's heading               |
| A list row (a channel's members, the @ list)                         | The server's name only, in grey after theirs |
| A member of this server who is also in another server in the channel | Also in, and the servers' names              |

- Name each server by its name, never its slug.
- Show the server's own tile (its logo, or its initial on ink) wherever its name is shown with a picture, never a generic server icon.

## Accessibility

- The tiles, the names and the word are laid out for the eye. Read them as one sentence: give `OriginBandSource` and `OriginBandRelation` `aria-hidden` and put the sentence in visually hidden text inside the band ("External: Acme Corp, Lumen Labs").

## Rules

- Only for someone from another server. A member of this server who is also elsewhere is one of ours: no band, no tile ([Member labels](../../../../../design/people-and-agents/identity-and-presence.md#member-labels)).
- Keep the band `info-soft`: it is the same meaning as the avatar's top-left tile, and the only blue on the card.
- Put it across the card's full width at its top, never inset or on another edge ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
- No role tag on a card with the band: someone from another server has no role shown here.
