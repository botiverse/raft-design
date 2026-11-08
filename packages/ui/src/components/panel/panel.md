---
title: Panel
summary: A column of the desktop main area with a panel header (44px on a desktop, 56px on a phone) and its own scrolling content; its header is also the top bar of a phone's pushed pages.
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
- `PanelHeader`: the header, 44px on a desktop and 56px on a phone, with a `line-seam` under it. Required. On a desktop it is one line: a `PanelMeta` follows the title on its line and gives up its room first; the icon tile and the actions are 28px (`bar-button-size`) at `radius-chip`.
  - `PanelHeaderIcon`: the location tile of a place, or the avatar of a person. Optional.
  - `PanelHeaderContent`: holds `PanelHeading` and `PanelMeta`.
  - `PanelHeading`: the `PanelTitle`, followed by any `PanelStatus` (a tag such as Archived) or `PanelActivity` (a live status, wrapping a [Status](../status/status.md)).
  - `PanelMeta`: one line of description under the title.
  - `PanelActions`: the trailing `PanelAction` and `PanelToggleAction` buttons, and any `PanelSplitAction`.
- `PanelSplitAction`, with `PanelSplitActionMain` (or `PanelSplitActionToggle`) and `PanelSplitActionMenu`: one header action with a menu beside it, such as Comment and its ▾ ([Split actions](#split-actions)). Work in progress: import it from `@botiverse/raft-ui/wip`.
- `PanelSectionHeader`: the same bar for a section-level view. On a phone it sits on the frame.
- `PanelHeaderRoot`: the bare header-height bar both headers are built on, for a header with its own layout.
- `PanelNotice`, with `PanelNoticeContent` and `PanelNoticeActions`: a full-width strip under the header for a problem in this panel. When to use it instead of a banner is in [Banner](../banner/banner.md). The intent's icon placed before `PanelNoticeContent` leads its first line; while something is still pending, a `Spinner` in a `status="info"` notice takes the icon's place, centered on the first line in the icon's 16px column, as in [Banner](../banner/banner.md); never a status light to say what kind of notice it is, since a status light keeps its own meanings ([Status](../status/status.md#sizes)) ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)).
- `PanelBody`, `PanelScrollViewport` and `PanelScrollContent`: the content and its single scroll container. `PanelScrollViewport` is a [ScrollArea](../scroll-area/scroll-area.md) that stops a scroll at its end (`overscroll="contain"`); its `ref` and props are the scrolling element's, and it takes ScrollArea's options.
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
- The title and the description truncate with an ellipsis on one line each, and the head always fits its column ([A head fits its column](#rules)).
- On a phone the header sticks to the top of the page.
- When the window is shorter than 600px, the header shrinks with every other header ([Spacing](../../../../../design/foundations/spacing.md#heights)).
- Give Back `activateOnTouchEnd`: on a touch screen it then goes back when the finger lifts, so a tap that stops a scrolling page still goes back ([Switching on finger lift](../../../../../design/patterns/navigation.md#switching-on-finger-lift)). `DialogSheetBack` sets it. Leave it off the header's other actions: they change things, and the rule is for navigation.

### Split actions

An action that also has a short menu of related choices, such as Comment and its ▾ (Show all comments), is one control in two parts: `PanelSplitAction` holds the action, a `PanelSplitActionMain` (a button) or a `PanelSplitActionToggle` (an action that stays on, such as commenting), and a `PanelSplitActionMenu`, the narrow chevron that opens the menu. Render the menu part as the trigger of a DropdownMenu or a Popover: `<DropdownMenuTrigger render={<PanelSplitActionMenu aria-label="Comment options" />} />`. A split with a frame, a `primary` or `default` Button and its ▾, is `ButtonSplit` ([Split buttons](../button/button.md#split-buttons)).

```example
panel/compositions/panel-split-action
```

- **One shape.** The two parts touch, with no gap and no divider, and together are one `radius-control` shape: the main part is a panel action's square, rounded only on its start side; the menu part is 20px wide on a desktop (with a 16px chevron), rounded only on its end side, as tall as the main part. Two separate buttons, each with its own square hover, read as two unrelated actions.
- **One hover, two tiers.** The part under the pointer takes the medium tier, `fill-medium`, as every small control does; the other part takes the subtle tier, `fill-subtle`, one step lighter, so the whole shape lights up and the darker half says which part a click acts on ([Joined frameless parts hover as one control](../../../../../design/foundations/states.md#hover-and-press)). The tint replaces a divider: a hairline would be a second signal on the same surface, and at rest both parts are frameless, so the icon and the chevron side by side already read as one control.
- **Press** lays `fill-medium` on the pressed part.
- **Pressed toggle.** `PanelSplitActionToggle` is a Base UI Toggle and takes the yellow sticker of a pressed `PanelToggleAction`. While it is pressed the menu part keeps `fill-subtle`, so the sticker and the chevron still read as one control. Like every selected item, the pressed main part doesn't answer hover.
- **Menu open.** The menu part keeps `fill-medium` while its menu is open (`data-popup-open`), and the main part `fill-subtle`, the way a row with its menu open keeps its hover ([States](../../../../../design/foundations/states.md#hover-and-press)).
- **Focus.** Each part is its own button with its own focus ring, drawn above its neighbour: Tab reaches the main part, then the menu part.
- **Disabled.** Either part can be disabled on its own: it turns `foreground-disabled` and neither hovers nor tints the other part.
- **Touch.** On a phone and on a touch screen the main part is the 44px button and the menu part is drawn 24px wide; its hit area extends 20px past its end, and the part keeps that space free, so it is 44px by 44px without overlapping the next action ([Hit targets](../../../../../design/foundations/spacing.md#hit-targets)). On a desktop its hit area overhangs toward the next action by the control's overhang, as a panel action's does.
- Name the group (`aria-label` on `PanelSplitAction`, which is `role="group"`) and each part, and don't give the group its main part's name: the group "Comments", the main part "Comment", the menu part "Comment options".
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
- Keep the icon with the title it belongs to: the icon says what the title names, so nothing goes between them, neither a trail of the places above nor a tag. A computer's head is its device icon, then its name.
- Say in `PanelMeta` where or what this is: a description, the place a thread is in, counts ("5 members"). What is happening right now goes where it happens, not in the header: who is working in a channel floats above its composer ([Working agents](../../../../../design/people-and-agents/working-agents.md#where-working-shows)). Set numbers and IDs in Space Mono ([Typography](../../../../../design/foundations/typography.md#usage)).
- Put a tag on the name (Experimental, Archived, Deleted) in `PanelHeading` as a `PanelStatus`, never in `PanelMeta`: the description truncates, and truncation cuts off the tag's edge.

## Accessibility

- `Panel` renders a `section`. Name it with `aria-label` or `aria-labelledby` when several panels sit side by side.
- `PanelTitle` renders a `div`. Render it as the page's heading (`render={<h1 />}`, or `h2` inside a page that has one).
- `PanelAction` wraps the Base UI Button and always renders `type="button"`. `PanelToggleAction` wraps the Base UI Toggle, which sets `aria-pressed`.
- Give every icon-only `PanelAction` and `PanelToggleAction` an `aria-label`: "Back", "Channel details", "Close tasks".
- `PanelSplitAction` is a `role="group"`; its two parts are buttons, and the menu part takes `aria-haspopup` and `aria-expanded` from the menu trigger it renders as.
- Give an icon-only `PanelStatus` (a muted bell) an accessible name.

## Rules

- Use this header in every panel: conversation, thread, side panel and drawer. Don't give one panel its own header or button sizes.
- Use `PanelAction` for every icon button in a header (a panel's, a sidebar's, a drawer's, a thread's), never a `Button` at `icon-lg` (on a phone a Button at `icon-lg` is the same 44px and may stand in, as a search panel's Back does): the header sizes its actions through `bar-button-size`, 28px at `radius-chip` with an 18px icon and a 44px hit area on desktop (from 768px with a mouse or trackpad), 4px apart, the size of the header's icon tile; 44px with a 22px icon, 2px apart, on a phone and on a touch screen at any width. A `Button` would keep the 34px control and stand out beside 28px actions. A 44px button next to a 17px title looks heavy on desktop; a finger needs 44px.
- When the header's icon is a person's or an agent's avatar (`PanelHeaderIcon` with an avatar), it keeps the 27px `sm` avatar, 1px less than the 28px tile: avatars come in 8n + 3 sizes.
- Put Back first in the header and the actions last, in `PanelActions`: the header pulls its first and last button out so their icon boxes, not the buttons, sit on the content margin, 16px with a mouse on a desktop, 20px on a touch screen in the desktop layout, 16px on a phone (20px in a column of list cells, 16px with a mouse), at every button size ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)). Don't add margins of your own to move an edge button. The margin is `--column-margin` (16px on a phone, 20px from 768px on a touch screen, the page inset, 16px, with a mouse; stdrc, 2026-11-05); a column of list cells sets it to 20px at every width so its head starts where its rows' content does ([Lists](../../../../../design/patterns/lists.md#one-edge)). `PanelNotice` and the panel footer pad by it too. To give a column another margin, set `[--column-margin:…]` on the column; a `px-*` on the head replaces the variable at every width, so the phone's 16px and a list column's 20px no longer apply to it. Keep only `PanelAction`s in `PanelActions`: the group declares their inset, so an action hidden at some width (a thread's Close below 1024px) leaves the next one on the edge. A frameless `Button` at `icon-md` or `icon-lg` as the header's first or last child is pulled the same way; a filled one ends its shape on the margin.
- Order the actions the same way in every header: the panel's own actions shown as buttons, then the overflow menu (⋯), then the window controls, Expand and Close, side by side. ⋯ is always the last of the panel's own actions, because it holds what didn't fit, so whatever is shown comes before it; that is where people look for "more" in any app (the platform convention, as in Material's top app bar and Apple's toolbars). Expand and Close act on the region itself rather than on what is in it: one resizes it, the other leaves it. So they sit side by side at the outer edge, apart from the panel's own actions, as a window's controls do in its title bar and as Back does at the other end (stdrc, 2026-11-03, #proj-raft-ui:#189). Among the panel's own buttons, put the ones that change the view (Open in new page) first, then the ones that act on the content.
- Give a `PanelStatus` its own cell on the title's line, and center it by its shape. Don't nudge it: the title's letters already sit on the line's center, so a 1px shift makes it sit high.
- Open a side panel from the header with a `PanelToggleAction`: pressing it again closes the panel.
- Show Expand and its Restore (`maximize-2` / `minimize-2`, a `PanelToggleAction`, pressed while expanded) as its own header button, never in the overflow menu (⋯). It changes the view itself rather than the thing in it, and people reach for it often, so it is one press away, not two (stdrc, 2026-10-31). It is a window control: it sits right before Close, after ⋯ (see the order above), and ends the head where there is no Close (the conversation's). Open in new page (`arrow-up-right`, a `PanelAction`) is one of the panel's own actions and comes first among them, before ⋯: it opens the thing somewhere else rather than resizing this region. Where a head runs out of room it folds into ⋯ like the panel's other own actions, the last of them to go ([A head fits its column](#rules)); Expand never folds. A column at 160px has no room for it beside the title, ⋯, Expand and Close, so it folds, after the other own actions, rather than keep the head from fitting (decided with stdrc's approval of the #189 layout preview, 2026-11-04, #proj-raft-ui:aedc53e1).
- In a conversation's row, give every column's head Expand: the conversation's, the thread's, Tasks', Files', the Artifact's and every profile's. Expanded, the column fills the row and every other column stays at 160px, clipped: the rest of the row stays in view as narrow strips (stdrc, 2026-11-04). Expand again, or Escape, puts every column back at the exact width it had. One column is expanded at a time ([The channel's side columns](../../../../../design/patterns/responsive.md#the-channels-side-columns)). Where the column stacks several regions (the thread over Tasks, Tasks over Files), the one expanded also fills the column's height, and the others in it show their heads alone, in their order: the person asked for that region, and the heads keep the rest one press away. While it lasts, those heads have no fold chevron and the stack no split to drag; Expand again, or Escape, puts every height and every fold back as it was (stdrc, 2026-11-04, #proj-raft-ui:aedc53e1). Show Expand only when there is something to expand into. When the row has one column, hide it, don't disable it: a conversation open alone, or a thread folded over the conversation with no column beside it. The column that is expanded always shows its Restore, so it can come back. A button that can't do anything in this layout only takes room and asks to be tried (stdrc, 2026-11-03, #proj-raft-ui:#189). On a phone, where the panel already fills the screen, there is nothing to expand either: leave Expand out, and keep Open in new page in ⋯.
- **A head fits its column**, whatever its width, down to a column's 160px (stdrc, 2026-11-03, #proj-raft-ui:#189). The title and the description ellipsize, each keeping at least one letter and its ellipsis (28px); they never drop to a bare letter or wrap. Where the buttons would leave the title less than 56px (the prototype's value, #189), the column's own actions fold into ⋯, the last first; ⋯, Expand and Close never fold, and ⋯ shows only with something in it. In a column clipped under its content's minimum, the head's edge margins tighten to 12px and the gap before its buttons to 4px, so its title keeps its letter at 160px. A head whose title room holds the row's tabs gives them 120px (the prototype's value) before its actions fold. A profile's head drops its avatar under 240px, and the Artifact's head hides its version tag where its title has less than 96px; the version stays in ⋯ › Version history. The head itself is never clipped: only what is under it is.
- Give a side panel next to a conversation `edge="attached"`, so it draws the one line between the two ([Page structure](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)).
