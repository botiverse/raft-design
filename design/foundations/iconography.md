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
| 20px | The rail, list rows, rows in a sheet |
| 18px | Inside buttons, 32px icon buttons (`icon-md`, and `icon-lg` on a desktop), channel tiles |
| 16px | Small buttons, the message hover toolbar, segmented controls, menus, tabs; the icon that leads 14px text in a banner, a toast or a panel notice |
| 14px | Chips, reference chips, filters, value chips; the icon that leads 12px or 13px text, as in a small banner |
| 11px to 12px | Small channel tiles, event lines, badges, the arrow inside a status chip |

- **An icon that leads a line of text takes its size from the text:** 1.15em on an even pixel, so 14px beside 12px and 13px text, 16px beside 14px, 18px beside 16px. It sits in a box one line tall, centered on the first line; see [A mark that leads text](./alignment.md#a-mark-that-leads-text). A banner's icon is 16px for this reason, not 20px: at 20px its ink was nearly twice the height of the capitals beside it.

## Related

- [Button](../../packages/ui/src/components/button/button.md): icon buttons and their sizes.
- [Brand](./brand.md): logos and reactions.
- [Alignment](./alignment.md#a-mark-that-leads-text): where an icon that leads text sits.
