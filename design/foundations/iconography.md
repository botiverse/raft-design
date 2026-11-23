---
title: Iconography
summary: The icon set, its stroke and color, the one table of meanings that cards, menus and settings share, the icon sizes by context, and what is not an icon.
---

# Iconography

Raft's icons are Lucide icons, from `lucide-react`, at a stroke of 2. An icon inherits its color from the text around it (`currentColor`).

## Principles

- **Lucide only.** When you need a new icon, take the Lucide icon of that name. Raft draws a few of its own, for kinds of conversation and for following, joining, adding, reopening and opening in a new window, where Lucide has none; they follow Lucide's grid and weight. Our own icons live in `@botiverse/ricons`, a package of their own in this repository, and are imported only from it: raft-ui doesn't export them. Its `ArtifactIcon` is Lucide's `file-code` with its page drawn wider, so it reads as the size of the icons beside it ([Icons](../../packages/icons/src/icons.md)).
- **Pixel avatars are not icons.** They stand only for agents; see [Avatar](../../packages/ui/src/components/avatar/avatar.md).
- **Emoji are content, not icons.** Don't use an emoji as an icon. Emoji in reactions are content; see [Brand](./brand.md#reactions).
- **No sparkles.** Don't use sparkles, stars or similar icons to mark agents or AI; see [Identity and presence](../people-and-agents/identity-and-presence.md#rules).

## Meanings

- **One meaning per icon on a screen.** Two different things or actions on one screen never share an icon. When a new one would take an icon already there, give one of them another.
- **One icon per concept.** Take one Lucide drawing for a concept and use it everywhere, not its variants: `clock`, not `clock-3`; `settings`, not `settings-2`; `lock`, not `lock-keyhole`.
- **More is `ellipsis` in a row of actions, `ellipsis-vertical` for an object's menu.** The horizontal ⋯ ends a horizontal toolbar or action row, its dots carrying on the row of actions beside it: the message hover toolbar, a selection toolbar. The vertical ⋮ opens one object's menu, at the trailing end of a panel header, a card or a list row.
- **Back is `arrow-left`, not a chevron**, and Forward `arrow-right` ([Alignment](./alignment.md#the-ends-of-a-header)). A chevron pages through a set, such as the previous and next image, or opens and closes a section.
- **Success is `circle-check`; an error or a warning is `triangle-alert`**, as [Banner](../../packages/ui/src/components/banner/banner.md) and [Toast](../../packages/ui/src/components/toast/toast.md) draw them. Not `circle-check-big` or `circle-alert`.
- **Reopen is not restart.** `rotate-ccw` means restart or reset, so Reopen task has its own icon, `ReopenTaskIcon` ([Icons](../../packages/icons/src/icons.md#action-icons)).
- **A new window is not an external link.** `external-link` means leaving Raft for the browser, so Open in new window, which opens a Raft window of its own, has its own icon, `OpenInNewWindowIcon` ([Icons](../../packages/icons/src/icons.md#action-icons)).
- **Outline only.** Don't fill an icon to show a state, such as saved: a toggle shows the action it offers (`bookmark-minus` to remove from Saved). A media player's Play and Pause are the exception.

## One meaning, one icon

Cards, menus and settings pages take their icons from this one table: a meaning has exactly one Lucide icon, and the same meaning draws the same icon on a card, in a menu and in a settings page. It is kept here, in the design system, not in the app or in a card's code, so a new card kind, a new menu item and a new settings page all find the icon in the same place (Kirby and Tenny, 2026-11-23). Before, four kinds of action card (an agent's call, a prepared request, an assistant acting for its owner, restoring an app's owner) all drew `shield-alert`, so the icon told the reader nothing about which was asked; and a card icon named `sparkles` drew a lightbulb, so its name and its drawing meant different things.

| Meaning | Icon | Where |
| --- | --- | --- |
| Approval: an agent asks to do something only a person may allow (an agent's call, a prepared request) | `hand` | Action cards; Activity's approvals |
| Permission or scope: what an app or agent may reach | `shield-check` | An app's scope card and its scope list; an agent's app access |
| Administration, a role over the server or an app (restoring an app's owner) | `shield` | That card; Settings › Administration |
| Acting for someone: an assistant doing a thing as its owner | `user-round-check` | The assistant's owner card and its receipt |
| A question for a person | `message-circle-question-mark` | Question cards |
| Help | `circle-question-mark` (`circle-help`) | The rail's Help; never a question card |
| Adding a person: an invite to the server, adding to a channel | `user-plus` | Invite and add-member cards; Invite and Add people in menus and on Members |
| Members, and a change to who is in a conversation | `users` | Members changing on a card; a channel's member list |
| Credential or secret: a sign-in, a key, an authorized account | `key-round` | An agent's sign-in card, a secret field; Settings › Authorized accounts |
| Payment: a plan, seats, billing | `credit-card` | Upgrade and seat cards; Settings › Plan & Billing |
| An app: registering, installing, updating it | `blocks` | App cards (registering, updating, installing from the marketplace); the rail's Apps; Settings › Integrations |
| A connection to a service (an MCP server) | `plug` | Connect cards; an agent's connections |
| An agent: creating or moving one | `bot` | Agent cards; Create agent |
| A channel | `hash` | Create channel cards; channel rows |
| Leaving a place: Leave channel (a channel of any kind), Leave server | `door-open` | A channel's menus and details; Settings › Danger zone ([Icons › Rules](../../packages/icons/src/icons.md#rules)) |
| Signing out of Raft | `log-out` | The account menu; Settings › Account |
| A schedule or a reminder | `alarm-clock` | Reminder cards; an agent's reminders |
| A time, a history | `clock` | Recent searches, a time in a list |
| A file | `file` | File cards and rows |
| An Artifact | `ArtifactIcon` (`@botiverse/ricons`) | Artifact cards and rows |
| An idea or a suggestion | `lightbulb` | A card or a menu item that suggests something |
| Done, success | `circle-check` | Banners, toasts, a done row |
| Failure, an error, a warning | `triangle-alert` | Banners, toasts, a failed row |
| Waiting on someone | `hourglass` | A filter or a menu item for what waits on someone |
| A card of a kind this client doesn't know yet | `square-dashed` | The fallback action card; never Help's icon |

- **Take the meaning from this table, not a drawing that looks right.** When nothing here fits, add a row here first, in the same change, with its meaning and where it is used; a second icon for a meaning already here is a mistake in one of them.
- **Name a card's icon for its meaning.** The key an agent or the server sends for a card's icon is the meaning (`approval`, `question`), never a drawing's name, so a drawing can change without the key lying about it. There is no `sparkles` key, and no sparkles at all ([No sparkles](#principles)).
- **A card's state is not an icon.** A card that asks for something shows its phase and outcome as its status pixel and word ([Cards in messages](../patterns/cards-in-messages.md#a-card-that-asks-for-something)); Waiting, Done and Failed here are for menus, rows and banners.


## Sizes

| Size | Use for |
| --- | --- |
| 36px | Empty states |
| 22px | Top bars and their bar buttons by touch, the toolbar for selected items' buttons among them; the tab bar; icon buttons at `icon-lg` on a phone (44px) |
| 20px | The rail, list rows, banners, rows in a sheet |
| 18px | Icon-only square buttons: 32px (`icon-md`) and 34px on a desktop (`icon-md` and `icon-lg`); buttons with a label at `lg`, and the rows that are one action, which count as one (Leave channel, Archive channel, Delete channel: [ListRow](../../packages/ui/src/components/list-row/list-row.md#an-actions-risk)); channel tiles |
| 16px | Buttons with a label at `md`, a row's 28px icon-only actions (`icon-sm`), and with a mouse the toolbar for selected items' actions, whether the label shows or has given way (Jasper, 2026-11-14, #proj-raft-ui); small buttons, the message hover toolbar, segmented controls, menus, tabs |
| 14px | Chips, reference chips, filters, value chips |
| 11px to 12px | Small channel tiles, event lines, badges, the arrow inside a status chip |

### A mark at small sizes

One drawing serves every size: Lucide draws none twice. A drawn icon whose mark gets lost at 16px and under may carry a second mark for small sizes, drawn on the same grid and swapped in below 18px by a container query on the icon (`data-icon-sizes`, in `@botiverse/ricons/styles.css`, which raft-ui's stylesheet imports). The rest of the drawing doesn't change, and from 18px up the icon is the one drawing. Only `UnfollowArtifactIcon` has one: at 16px its minus is heavier, so it reads as a mark rather than one more piece of the page's outline ([Icons](../../packages/icons/src/icons.md#action-icons)). Add one only when a mark is lost at the size the icon is used, not to tune an icon that reads.

## Related

- [Button](../../packages/ui/src/components/button/button.md): icon buttons and their sizes.
- [Brand](./brand.md): logos and reactions.
