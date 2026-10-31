---
title: Panel
summary: A column of the desktop main area with a 56px panel header and its own scrolling content; its header is also the top bar of a phone's pushed pages.
status: stable
aliases: [NavBar, Top bar, Panel header]
layer: core
category: layout
related: [conversation-panel, thread-panel, banner, icon-tile, drawer]
redirectFrom: [decisions/0031-panel-header-icon-buttons, decisions/0039-panel-header-chip]
---

# Panel

A panel is one column of the desktop main area: a panel header, then content that scrolls inside the column. Every column uses the same header, whether it holds a conversation, a thread, a side panel or a drawer's content. On a phone, `PanelHeader` is the top bar of a pushed page.

```example
panel/panel
```

## When to use

| Situation                                                                          | Use                                                                                                                                                                 |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A column of the desktop main area, or a side panel beside it (a thread, a profile) | Panel                                                                                                                                                               |
| A channel's tasks and files                                                        | Side sections in columns right of the conversation's panel, not a Panel ([Page structure](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)) |
| A conversation: header, tabs, messages and composer                                | [ConversationPanel](../conversation-panel/conversation-panel.md), built on Panel                                                                                    |
| A thread beside a conversation                                                     | [ThreadPanel](../thread-panel/thread-panel.md)                                                                                                                      |
| The top bar of a phone's pushed page                                               | `PanelHeader`                                                                                                                                                       |
| The list of what a destination contains, next to the rail                          | [Sidebar](../sidebar/sidebar.md)                                                                                                                                    |
| Details or settings that slide in over the page                                    | [Drawer](../drawer/drawer.md)                                                                                                                                       |

How the regions of a screen are arranged, and when a side panel sits beside the main area or covers it, is in [Page structure](../../../../../design/patterns/page-structure.md) and [Responsive layout](../../../../../design/patterns/responsive.md).

## Anatomy

- `Panel`: the column. `edge="attached"` draws a `line-seam` on its left edge, for a side panel next to a conversation; `edge="inset"` draws none.
- `PanelHeader`: the 56px header with a `line-seam` under it. Required.
  - `PanelHeaderIcon`: the location tile of a place, or the avatar of a person. Optional.
  - `PanelHeaderContent`: holds `PanelHeading` and `PanelMeta`.
  - `PanelHeading`: the `PanelTitle`, followed by any `PanelStatus` (a tag such as Archived) or `PanelActivity` (a live status, wrapping a [Status](../status/status.md)).
  - `PanelMeta`: one line of description under the title.
  - `PanelActions`: the trailing `PanelAction` and `PanelToggleAction` buttons, and any `PanelSplitAction`.
- `PanelSplitAction`, with `PanelSplitActionMain` (or `PanelSplitActionToggle`) and `PanelSplitActionMenu`: one header action with a menu beside it, such as Comment and its ▾ ([Split actions](#split-actions)). Work in progress: import it from `@botiverse/raft-ui/wip`.
- `PanelSectionHeader`: the same bar for a section-level view. On a phone it sits on the frame.
- `PanelHeaderRoot`: the bare 56px bar both headers are built on, for a header with its own layout.
- `PanelNotice`, with `PanelNoticeContent` and `PanelNoticeActions`: a full-width strip under the header for a problem in this panel. When to use it instead of a banner is in [Banner](../banner/banner.md). The intent's icon placed before `PanelNoticeContent` leads its first line; while something is still pending, a `Spinner` in a `status="info"` notice takes the icon's place, centered on the first line in the icon's 16px column, as in [Banner](../banner/banner.md); never a status light to say what kind of notice it is, since a status light keeps its own meanings ([Status](../status/status.md#sizes)) ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)).
- A panel in a mode the person turned on, such as commenting, shows a [ModeBar](../mode-bar/mode-bar.md) in the same place, dark, instead of a `PanelNotice`.
- `PanelBody`, `PanelScrollViewport` and `PanelScrollContent`: the content and its single scroll container.
- `PanelSection`: a block of content with a hairline above it.
- `PanelFooter`: the bottom action area, padded for the safe area.

```example
conversation-panel/compositions/conversation-panel-header
```

## Variants

| Header               | Use for                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `PanelHeader`        | Every desktop panel header; the white top bar of a phone's pushed page                                                 |
| `PanelSectionHeader` | A section-level view. On a phone it sits on `layer-frame` with `foreground-on-frame` text, and hides `PanelHeaderIcon` |

A phone's pushed page has a white top bar, and its location tile stays a yellow sticker ([Open questions](../../../../../design/decisions/open-questions.md#settled-by-the-product)).

## States

- A pressed `PanelToggleAction`, or a `PanelAction` with `aria-pressed`, is a yellow sticker: it marks the side panel that is open.
- Other states follow [States](../../../../../design/foundations/states.md).

## Behavior

- The header stays put; only `PanelScrollViewport` scrolls.
- The title and the description truncate with an ellipsis on one line each.
- On a phone the header sticks to the top of the page.
- When the window is shorter than 600px, the header shrinks with every other header ([Spacing](../../../../../design/foundations/spacing.md#heights)).
- Give Back `activateOnTouchEnd`: on a touch screen it then goes back when the finger lifts, so a tap that stops a scrolling page still goes back ([Switching on finger lift](../../../../../design/patterns/navigation.md#switching-on-finger-lift)). `DialogSheetBack` sets it. Leave it off the header's other actions: they change things, and the rule is for navigation.

### Split actions

An action that also has a short menu of related choices, such as Comment and its ▾ (Show All Comments), is one control in two parts: `PanelSplitAction` holds the action, a `PanelSplitActionMain` (a button) or a `PanelSplitActionToggle` (an action that stays on, such as commenting), and a `PanelSplitActionMenu`, the narrow chevron that opens the menu. Render the menu part as the trigger of a DropdownMenu or a Popover: `<DropdownMenuTrigger render={<PanelSplitActionMenu aria-label="Comment Options" />} />`.

```example
panel/compositions/panel-split-action
```

- **One shape.** The two parts touch, with no gap and no divider, and together are one `radius-control` shape: the main part is a panel action's square, rounded only on its start side; the menu part is 20px wide on a desktop (with a 16px chevron), rounded only on its end side, as tall as the main part. Two separate buttons, each with its own square hover, read as two unrelated actions.
- **One hover, two tiers.** The part under the pointer takes the medium tier, `fill-medium`, as every small control does; the other part takes the subtle tier, `fill-subtle`, one step lighter, so the whole shape lights up and the darker half says which part a click acts on ([Joined parts hover as one control](../../../../../design/foundations/states.md#hover-and-press)). The tint replaces a divider: a hairline would be a second signal on the same surface, and at rest both parts are frameless, so the icon and the chevron side by side already read as one control.
- **Press** lays `fill-medium` on the pressed part.
- **Pressed toggle.** `PanelSplitActionToggle` is a Base UI Toggle and takes the yellow sticker of a pressed `PanelToggleAction`. While it is pressed the menu part keeps `fill-subtle`, so the sticker and the chevron still read as one control. Like every selected item, the pressed main part doesn't answer hover.
- **Menu open.** The menu part keeps `fill-medium` while its menu is open (`data-popup-open`), and the main part `fill-subtle`, the way a row with its menu open keeps its hover ([States](../../../../../design/foundations/states.md#hover-and-press)).
- **Focus.** Each part is its own button with its own focus ring, drawn above its neighbour: Tab reaches the main part, then the menu part.
- **Disabled.** Either part can be disabled on its own: it turns `foreground-disabled` and neither hovers nor tints the other part.
- **Touch.** On a phone and on a touch screen the main part is the 44px button and the menu part is drawn 24px wide; its hit area extends 20px past its end, and the part keeps that space free, so it is 44px by 44px without overlapping the next action ([Hit targets](../../../../../design/foundations/spacing.md#hit-targets)). On a desktop its hit area overhangs toward the next action by the control's overhang, as a panel action's does.
- Name the group (`aria-label` on `PanelSplitAction`, which is `role="group"`) and each part, and don't give the group its main part's name: the group "Comments", the main part "Comment", the menu part "Comment Options".
- Don't put a split action at the end of `PanelActions`: it declares no icon inset, so it ends on the margin by its shape instead of by its icon box. Keep a panel action (Close) after it.

### Phone top bars

The structure of a phone's top bars (the navigation row of a top-level page, Back and up to 2 icon buttons on a pushed page) is in [Page structure](../../../../../design/patterns/page-structure.md#phone). The top bar also follows these rules:

- On a top-level page, put the page name in the 56px row in `text-headline`, with no large title and no icon tile before it ([Page structure](../../../../../design/patterns/page-structure.md#phone)).
- Don't put New or Search buttons in the top bar of a top-level page: search is the Search tab ([Navigation](../../../../../design/patterns/navigation.md#search-on-a-phone)).
- Make the bell the entry to the notification center, with a pink pixel when something is new. On a phone it is only in the top bar of the first top-level page ([Page structure](../../../../../design/patterns/page-structure.md#phone)).
- Use the `arrow-left` icon for Back, not a chevron: its ink fills the icon box like other icons, so it mirrors the button at the other end without being shifted ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)).

## Content

- Name the place, the person or the view in `PanelTitle`.
- Put a location tile ([IconTile](../icon-tile/icon-tile.md)) in `PanelHeaderIcon` for a place, and the person's avatar for a person. Other pages have no icon: their `PanelMeta` says where they belong, such as the channel a thread is in.
- Start `PanelMeta` with what is live, then the counts: "2 agents working · 5 members" ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)). Set numbers and IDs in Space Mono ([Typography](../../../../../design/foundations/typography.md#usage)).
- Put a tag on the name (Experimental, Archived, Deleted) in `PanelHeading` as a `PanelStatus`, never in `PanelMeta`: the description truncates, and truncation cuts off the tag's edge.

## Accessibility

- `Panel` renders a `section`. Name it with `aria-label` or `aria-labelledby` when several panels sit side by side.
- `PanelTitle` renders a `div`. Render it as the page's heading (`render={<h1 />}`, or `h2` inside a page that has one).
- `PanelAction` wraps the Base UI Button and always renders `type="button"`. `PanelToggleAction` wraps the Base UI Toggle, which sets `aria-pressed`.
- Give every icon-only `PanelAction` and `PanelToggleAction` an `aria-label`: "Back", "Channel Details", "Close Tasks".
- `PanelSplitAction` is a `role="group"`; its two parts are buttons, and the menu part takes `aria-haspopup` and `aria-expanded` from the menu trigger it renders as.
- Give an icon-only `PanelStatus` (a muted bell) an accessible name.

## Rules

- Use this header in every panel: conversation, thread, side panel and drawer. Don't give one panel its own header or button sizes.
- Use `PanelAction` for the header's icon buttons: 32px with an 18px icon and a 44px hit area on desktop (from 768px with a mouse or trackpad), 4px apart; 44px with a 22px icon, 2px apart, on a phone and on a touch screen at any width. They follow the default control height ([Spacing](../../../../../design/foundations/spacing.md#heights)). A 44px button next to a 17px title looks heavy on desktop; a finger needs 44px.
- Put Back first in the header and the actions last, in `PanelActions`: the header pulls its first and last button out so their icon boxes, not the buttons, sit on the content margin, 20px on a desktop and on a touch screen in the desktop layout, 16px on a phone (20px in a column of list cells), at every button size ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)). Don't add margins of your own to move an edge button. The margin is `--column-margin` (16px on a phone, 20px from 768px); a column of list cells sets it to 20px at every width so its head starts where its rows' content does ([Lists](../../../../../design/patterns/lists.md#one-edge)). `PanelNotice` and the panel footer pad by it too. To give a column another margin, set `[--column-margin:…]` on the column; a `px-*` on the head replaces the variable at every width, so the phone's 16px and a list column's 20px no longer apply to it. Keep only `PanelAction`s in `PanelActions`: the group declares their inset, so an action hidden at some width (a thread's Close below 1024px) leaves the next one on the edge. A frameless `Button` at `icon-md` or `icon-lg` as the header's first or last child is pulled the same way; a filled one ends its shape on the margin.
- Give a `PanelStatus` its own cell on the title's line, and center it by its shape. Don't nudge it: the title's letters already sit on the line's center, so a 1px shift makes it sit high.
- Open a side panel from the header with a `PanelToggleAction`: pressing it again closes the panel.
- Give a side panel next to a conversation `edge="attached"`, so it draws the one line between the two ([Page structure](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)).
