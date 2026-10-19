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

| Situation                                                                              | Use                                                                              |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| A column of the desktop main area, or a side panel beside it (tasks, files, a profile) | Panel                                                                            |
| A conversation: header, tabs, messages and composer                                    | [ConversationPanel](../conversation-panel/conversation-panel.md), built on Panel |
| A thread beside a conversation                                                         | [ThreadPanel](../thread-panel/thread-panel.md)                                   |
| The top bar of a phone's pushed page                                                   | `PanelHeader`                                                                    |
| The list of what a destination contains, next to the rail                              | [Sidebar](../sidebar/sidebar.md)                                                 |
| Details or settings that slide in over the page                                        | [Drawer](../drawer/drawer.md)                                                    |

How the regions of a screen are arranged, and when a side panel sits beside the main area or covers it, is in [Page structure](../../../../../design/patterns/page-structure.md) and [Responsive layout](../../../../../design/patterns/responsive.md).

## Anatomy

- `Panel`: the column. `edge="attached"` draws a `line-seam` on its left edge, for a side panel next to a conversation; `edge="inset"` draws none.
- `PanelHeader`: the 56px header with a `line-seam` under it. Required.
  - `PanelHeaderIcon`: the location tile of a place, or the avatar of a person. Optional.
  - `PanelHeaderContent`: holds `PanelHeading` and `PanelMeta`.
  - `PanelHeading`: the `PanelTitle`, followed by any `PanelStatus` (a tag such as Archived) or `PanelActivity` (a live status, wrapping a [Status](../status/status.md)).
  - `PanelMeta`: one line of description under the title.
  - `PanelActions`: the trailing `PanelAction` and `PanelToggleAction` buttons.
- `PanelSectionHeader`: the same bar for a section-level view. On a phone it sits on the frame.
- `PanelHeaderRoot`: the bare 56px bar both headers are built on, for a header with its own layout.
- `PanelNotice`, with `PanelNoticeContent` and `PanelNoticeActions`: a full-width strip under the header for a problem in this panel. When to use it instead of a banner is in [Banner](../banner/banner.md).
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

### Phone top bars

The structure of a phone's top bars (the large title of a top-level page, Back and up to 2 icon buttons on a pushed page) is in [Page structure](../../../../../design/patterns/page-structure.md#phone). The top bar also follows these rules:

- Show one large title per screen, in `text-display`. When the list scrolls up, it collapses into the 56px top bar as the page name in `text-headline` ([Page structure](../../../../../design/patterns/page-structure.md#phone)). In Raft Chat, Home, Members and Settings show it, and Tasks keeps only the 56px row for now ([Raft Chat](../../../../../design/products/raft-chat/README.md#differences-from-the-shared-patterns)).
- Make the page name the screen's one heading. When the top bar repeats the name, the bar's title is the heading and the large copy is hidden from assistive tech. On Home, where the bar shows the workspace pill, the large title is the heading.
- Don't put New or Search buttons in the top bar of a top-level page.
- Make the bell the entry to the notification center, with a pink pixel when something is new. Which page shows it is the product's choice ([Raft Chat](../../../../../design/products/raft-chat/README.md)).
- Use the `arrow-left` icon for Back, not a chevron: its ink fills the icon box like other icons, so it mirrors the button at the other end without being shifted ([Alignment](../../../../../design/foundations/alignment.md#top-bar-icon-buttons)).

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
- Give an icon-only `PanelStatus` (a muted bell) an accessible name.

## Rules

- Use this header in every panel: conversation, thread, side panel and drawer. Don't give one panel its own header or button sizes.
- Use `PanelAction` for the header's icon buttons: 32px with an 18px icon and a 44px hit area on desktop, 4px apart, the last icon box ending on the 20px edge; 44px with a 22px icon on a phone. A 44px button next to a 17px title looks heavy on desktop; a phone keeps 44px for the thumb.
- Give a `PanelStatus` its own cell on the title's line, and center it by its shape. Don't nudge it: the title's letters already sit on the line's center, so a 1px shift makes it sit high.
- Open a side panel from the header with a `PanelToggleAction`: pressing it again closes the panel.
- Give a side panel next to a conversation `edge="attached"`, so it draws the one line between the two ([Page structure](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)).
