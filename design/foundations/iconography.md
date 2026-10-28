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
