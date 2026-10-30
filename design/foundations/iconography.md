---
title: Iconography
summary: The icon set, its stroke and color, the icon sizes by context, and what is not an icon.
---

# Iconography

Raft's icons are Lucide icons, from `lucide-react`, at a stroke of 2. An icon inherits its color from the text around it (`currentColor`).

## Principles

- **Lucide only.** When you need a new icon, take the Lucide icon of that name. raft-ui draws a few of its own, for kinds of conversation, for an Artifact and for following, joining, adding, creating and reopening, where Lucide has none; they follow Lucide's grid and weight ([Icons](../../packages/ui/src/components/icons/icons.md)).
- **Pixel avatars are not icons.** They stand only for agents; see [Avatar](../../packages/ui/src/components/avatar/avatar.md).
- **Emoji are content, not icons.** Don't use an emoji as an icon. Emoji in reactions are content; see [Brand](./brand.md#reactions).
- **No sparkles.** Don't use sparkles, stars or similar icons to mark agents or AI; see [Identity and presence](../people-and-agents/identity-and-presence.md#rules).

## Meanings

- **One meaning per icon on a screen.** Two different things or actions on one screen never share an icon. When a new one would take an icon already there, give one of them another.
- **One icon per concept.** Take one Lucide drawing for a concept and use it everywhere, not its variants: `clock`, not `clock-3` beside it; `settings`, not `settings-2`; `lock`, not `lock-keyhole`.
- **More is `ellipsis` in a row of actions, `ellipsis-vertical` for an object's menu.** The horizontal ⋯ ends a horizontal toolbar or action row, its dots carrying on the row of actions beside it: the message hover toolbar, a selection toolbar. The vertical ⋮ opens one object's menu, at the trailing end of a panel header, a card or a list row.
- **Back is `arrow-left`, not a chevron**, and Forward `arrow-right` ([Alignment](./alignment.md#the-ends-of-a-header)). A chevron pages through a set, such as the previous and next image, or opens and closes a section.
- **Success is `circle-check`; an error or a warning is `triangle-alert`**, as [Banner](../../packages/ui/src/components/banner/banner.md) and [Toast](../../packages/ui/src/components/toast/toast.md) draw them. Not `circle-check-big` or `circle-alert`.
- **Reopen is not restart.** `rotate-ccw` means restart or reset, so Reopen Task has its own icon, `ReopenTaskIcon` ([Icons](../../packages/ui/src/components/icons/icons.md#action-icons)).
- **Outline only.** Don't fill an icon to show a state, such as saved: a toggle shows the action it offers (`bookmark-minus` to remove from Saved). A media player's Play and Pause are the exception.

## Sizes

| Size | Use for |
| --- | --- |
| 36px | Empty states |
| 22px | Top bars, the tab bar, icon buttons at `icon-lg` on a phone (44px) |
| 20px | The rail, list rows, banners, rows in a sheet |
| 18px | Inside buttons, 32px icon buttons (`icon-md`, and `icon-lg` on a desktop), channel tiles |
| 16px | Small buttons, the message hover toolbar, segmented controls, menus, tabs |
| 14px | Chips, reference chips, filters, value chips |
| 11px to 12px | Small channel tiles, event lines, badges, the arrow inside a status chip |

### A mark at small sizes

One drawing serves every size: Lucide draws none twice. A drawn icon whose mark gets lost at 16px and under may carry a second mark for small sizes, drawn on the same grid and swapped in below 18px by a container query on the icon (`data-icon-sizes`, in raft-ui's stylesheet). The rest of the drawing doesn't change, and from 18px up the icon is the one drawing. Only `UnfollowArtifactIcon` has one: at 16px its minus is heavier and longer, so it reads as a mark rather than one more line of the page's text ([Icons](../../packages/ui/src/components/icons/icons.md#action-icons)). Add one only when a mark is lost at the size the icon is used, not to tune an icon that reads.

## Related

- [Button](../../packages/ui/src/components/button/button.md): icon buttons and their sizes.
- [Brand](./brand.md): logos and reactions.
