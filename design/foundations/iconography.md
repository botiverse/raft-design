---
title: Iconography
summary: The icon set, its stroke and color, the icon sizes by context, and what is not an icon.
---

# Iconography

Raft's icons are Lucide icons, from `lucide-react`, at a stroke of 2. An icon inherits its color from the text around it (`currentColor`).

## Principles

- **Lucide only.** When you need a new icon, take the Lucide icon of that name.
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

## Related

- [Button](../../packages/ui/src/components/button/button.md): icon buttons and their sizes.
- [Brand](./brand.md): logos and reactions.
