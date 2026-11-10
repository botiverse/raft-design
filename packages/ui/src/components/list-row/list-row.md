---
title: ListRow
summary: The row for the people and agents on a detail page, settings and shortcuts — a leading block, a title and a preview, the time and a badge.
status: stable
aliases: [AvatarListRow]
layer: core
category: data-display
related: [sidebar, inbox-item, search, avatar, icon-tile, badge, switch]
---

# ListRow

A ListRow is one row of a list: a person, an agent, a setting or a shortcut into another page. The whole row is the target. Use it for the agents and people on a detail or profile page, and for settings. Raft Chat's phone lists of places (Home, Members, the Settings list) use the sidebar row instead ([Choosing a component](../../../../../design/components/overview.md#rows)).

```example
list-row/compositions/conversations
```

## When to use

| Situation                                                                   | Use                                                                                                                                        |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Channels, direct messages and members in a phone list                       | The sidebar row ([Sidebar](../sidebar/sidebar.md)), as in Raft Chat                                                                        |
| Channels and people among search results                                    | ListRow, through the search result row ([Search](../search/search.md))                                                                     |
| Agents and people on a profile or detail page, such as a computer's details | ListRow in a `ListRowGroup` ([Identity and presence](../../../../../design/people-and-agents/identity-and-presence.md#the-same-as-people)) |
| A row of the desktop sidebar                                                | The sidebar row ([Sidebar](../sidebar/sidebar.md))                                                                                         |
| Activity and notifications                                                  | [InboxItem](../inbox-item/inbox-item.md)                                                                                                   |
| A task                                                                      | [TaskCard](../task-card/task-card.md)                                                                                                      |

## Anatomy

- `ListRow`: the row. A `button` by default; render a link for a row that goes somewhere.
- Leading block: an [Avatar](../avatar/avatar.md), a channel tile ([IconTile](../icon-tile/icon-tile.md)) or a 20px `ListRowIcon`. Optional.
- `ListRowBody`: the text column. Required.
  - `ListRowTop`: `ListRowTitle`, then the time in `ListRowMeta`.
  - `ListRowSubtitle`: data about the row's subject, under the title: an agent's description, a person's role, a channel's topic, an app's byline. Optional.
  - `ListRowBottom`: the preview in `ListRowDescription`, then at most one badge.
- Trailing: a setting's `ListRowValue` and `ListRowChevron`, or a [Switch](../switch/switch.md). Optional.
- `ListRowGroup`: an inset group that wraps rows in a card. Optional. A section can hold more than one ([More than one group in a section](#more-than-one-group-in-a-section)).
- `ListRowSkeleton`: a row that stands in for a `ListRow` while the list loads ([Loading](#loading)). Optional; experimental, from `@botiverse/raft-ui/wip`.

In a `plain` row, both ends center on the whole row, with or without a description: the leading icon, avatar or tile, and the trailing value, chevron, switch, checkbox, radio or button. A setting reads as one unit, and its controls belong to the whole row, not to the title. Each keeps its size, and the row is its padding and its tallest part: 54px on a phone with a switch and a title alone ([Alignment](../../../../../design/foundations/alignment.md#a-control-and-its-label)).

A setting that applies at once ends its `ListRowBody` with a [SaveStatus](../save-status/save-status.md) line, which takes no room until a change fails: the row is as tall as without it, and its ends center on the whole row. When a change fails, the error appears 4px under the description, the row grows by that line, and the ends, still centered on the whole row, move down by half of it.

## Variants

| Variant             | Use for                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `variant="default"` | A conversation, a person or an agent: leading block, title, preview, time and badge. At least 64px tall with a mouse, 56px on a phone and a touch screen. It is denser on touch, the reverse of a control: a control grows to reach a 44px target, but this row is already past 44px and the whole row is the target, so on touch it keeps 8px above and below its content, not 12, and about one more row fits on a phone screen |
| `variant="plain"`   | A setting: an optional icon, a title (and its consequence), then the current value and a chevron, or a switch. 12px above and below its tallest part (`settings-row-inset`): 46px with one line of text and a switch with a mouse, 54px on a touch screen                                                                                                                                                                         |
| `variant="entry"`   | A shortcut into another page at the top of a list (Saved on phone Home): a 20px icon and a name, with a badge or a gray count on the right. 48px tall                                                                                                                                                                                                                                                                             |

```example
list-row/compositions/settings
```

### A row that belongs to the setting above

What a setting opens, such as quiet hours' start and end times or a server's channels that have their own notification level, is a row of its own right under the setting, in the same group. Pass it `attached`: it draws no hairline above it and, as a `plain` row, has no top padding, so the only space between the two is the setting's own 12px bottom inset. A hairline says "another setting", so between a setting and what belongs to it, it would split one thing in two (cindyz, 2026-11-10, #proj-raft-ui:4ae1a74e). The setting's row keeps its height, and its switch stays centered on its own title and description. The row after the attached one is the next setting and draws its hairline as usual. A setting can open several attached rows, such as one row per channel with its own level: none of them draws a hairline, so they read as one list under the setting.

An attached row that is itself a target, a row with a chevron or one that opens a menu, keeps the control height as its least: 44px on a phone and a touch screen, where it would be 36px without its top padding, and 34px with a mouse on a desktop, which it already is ([Hit targets](../../../../../design/foundations/accessibility.md#hit-targets)). Its text then sits a few pixels lower by touch; only the hairline is gone.

Without the hairline, only sight ties the attached row to its setting, so tie them for assistive technology too, with the setting's title as the name ([Accessibility](#accessibility)):

- A display-only attached row (`interactive={false}`) whose controls are its targets, such as the start and end times, takes `role="group"` and `aria-labelledby` the setting's title id. A screen reader moving into it announces the setting, "Quiet hours, group", before "Start time", and the controls keep their own short labels. This is a `fieldset` and its `legend`, without the drawing.
- An interactive attached row is a button or a link, so it can't be a group: give it `aria-describedby` the setting's title id.

```example
list-row/compositions/attached
```

### More than one group in a section

A section of settings can hold more than one `ListRowGroup`, split by topic: in Appearance, the message font size and its preview are one group, and the switches for what the app shows are another. Put the groups under the section's one heading in a column 12px apart (`stack-y-3`), as far apart as the heading is from the first group, with no hairline joining them. A `ListRowGroup` sets no space around itself, so the column sets it (cindyz, 2026-11-10, #proj-raft-ui:4ae1a74e).

```example
list-row/compositions/groups
```

```example
list-row/compositions/entries
```

## States

`tone` says what the place is to the person, or what an action risks ([An action's risk](#an-actions-risk)). The shared states are in [States](../../../../../design/foundations/states.md).

| State           | Use for                                                                                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone="unread"` | Something waits here: bold title, the preview in `foreground`, and a pink count in `ListRowBottom`. When someone mentions the person, the yellow @ marker replaces the count ([Badge](../badge/badge.md)) |
| `tone="muted"`  | The person muted it: the title and a subtitle in `foreground-muted`. Add a `bell-off` icon after the title, and show unread as a gray count in `ListRowMeta` instead of a pink badge                      |
| `tone="away"`   | The person hasn't joined yet: title, subtitle and preview in `foreground-hint`                                                                                                                            |
| `selected`      | The item open beside the list: an `info-soft` wash, and no hover                                                                                                                                          |
| `disabled`      | Every part in `foreground-disabled`; no tone, no unread or muted marks, no hover or press, and the fill doesn't change                                                                                    |

```example
list-row/compositions/tones
```

### An action's risk

A row can be an action rather than a place: the actions at the end of a details page or panel, such as Archive channel, Leave channel and Delete channel at the end of a channel's details. These are the page's danger zone ([Forms](../../../../../design/patterns/forms.md#danger-zone)), and `tone` says what the action risks, with Button's names and meanings ([Which color](../button/button.md#which-color)):

| Tone             | Use for                                                                                                 | Examples                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `tone="warning"` | An action that interrupts but can be undone: the title and the leading icon in `warning-strong`, orange | Archive channel, Leave channel, Stop all agents |
| `tone="danger"`  | An action that cannot be undone: the title and the leading icon in `danger-strong`, red                 | Delete channel, Delete server                   |

- Only the title and the leading `ListRowIcon` take the color. A description, a value, the chevron and the hover and press fills stay as on any row: the color names the risky action, and a red fill or a red explanation would read as an error ([Feedback](../../../../../design/patterns/feedback.md)).
- The color is the strong one text can take, never the sticker `warning` or `danger`, which are fills under ink type and 2:1 to 3:1 on paper. `warning-strong` and `danger-strong` keep at least 4.5:1 on the canvas, a card, a popover and the sidebar, at rest, hovered and pressed, in both modes and every theme (`list-row.risk-contrast.test.ts`).
- A risk tone needs an interactive row (a `button`, or the link you pass with `render`). A display-only row (`interactive={false}`) ignores it: only an action has a risk, and orange or red on a row that does nothing is color without a consequence ([Color](../../../../../design/foundations/color.md#meanings-of-color)). A disabled row ignores it too, as it does every tone: everything is `foreground-disabled`.
- A row is a place or an action, so the two kinds of tone never meet on one row, and `tone` takes either.
- The row still opens its confirmation ([Confirming](../../../../../design/patterns/feedback.md#confirming)): the color warns before the click, and the dialog, with its orange or red button, is where the person commits.
- Don't color an action in a menu ([DropdownMenu](../dropdown-menu/dropdown-menu.md#rules)). A menu is a short-lived list of choices people scan; a danger zone is a fixed place at the end of a page, set apart from the settings people change often, where the color tells them what each action costs before they reach for it.

Why: slock's channel details panel puts its actions in a card of rows, and colored the titles itself (`text-warning-strong` and `text-danger-strong` on the row and `text-current` on the title and icon), so the color, its contrast and the disabled state were each product's to get right (slock channel details, stdrc/Jasper, 2026-11-10, #proj-raft-ui:dae8db07).

```example
list-row/compositions/actions
```

### Loading

While the list loads, show `ListRowSkeleton` rows where the rows will be, in the same `ListRowGroup` if they have one, and mark the list `aria-busy`. Each one is a display-only `ListRow` of the same `variant`, with a bar in its title, time and description, so it has the loaded row's height and dividers ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)). A `default` row has a 35px leading block and a description; turn them on or off with `leading` and `description` to match the rows. Show them only once the wait passes 1 second ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed)); `ListRowSkeleton` doesn't delay itself.

```example
list-row/compositions/loading
```

## Behavior

- Divide rows with `line-hairline`. In the default variant the line starts where the text starts; in a settings list it starts at the row's edge (16px); entry rows have no lines between them, because they are a set of buttons, not a list of content. An `attached` row has no line above it: it belongs to the row above ([A row that belongs to the setting above](#a-row-that-belongs-to-the-setting-above)).
- The whole row is the target: hover lays the subtle tier, `fill-subtle`, over all of it and press the medium tier ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)). While a menu it opened is up (`data-popup-open`: a context menu, or press and hold on a phone), it lays `fill-subtle` too, hovered or not; a selected row keeps its selection.
- A list of places or people on a phone (conversations, members, the entries into other pages) passes `cell`: each row is a list cell ([Lists](../../../../../design/patterns/lists.md)). It draws no line, and hover (`fill-cell-hover`), press (`fill-cell-press`), selection (`fill-cell-selected`), menu open and keyboard focus are drawn on one rounded shape, as tall as the row and inset 8px at the sides. Put the rows in a `flex flex-col gap-0.5 py-2` column, so they sit 2px apart and the first and last shapes 8px from the list's ends. A cell's content is padded from its shape, not from the list: 12px inside it at the start and at the end (20px from the list's edges; with a mouse on a desktop 8px inside it, 16px from the edges), so the icon, the avatar, the time and a badge never touch the shape ([Lists](../../../../../design/patterns/lists.md#rules)). A settings row (no `cell`) keeps its 16px from the card's edges. A column of `cell` rows of your own sets `[--column-margin:20px]` on its root, so its head and toolbar start on the rows' content line on a phone too ([Lists](../../../../../design/patterns/lists.md#one-edge)).
- A settings card (`ListRowGroup`, `variant="plain"`) keeps the look above: lines between rows and the row-wide fills. Its rows are a fixed form read as one card, where the line ties each setting to the next; an inset shape inside the card's own border would draw a third edge.
- A row whose only targets are its own controls (a setting with a switch) takes `interactive={false}`: it renders a plain element with no hover or press. See [States](../../../../../design/foundations/states.md).

## Content

- Start a preview with who spoke: "Wug: Release notes are drafted."
- Show at most one badge in a row.
- Set the time and counts in Space Mono; `ListRowMeta` does this. It stays whole while the title gives way first, then truncates when there is still no room, so a long value in it, such as an email beside a button in a 320px row, is cut instead of running under the button.
- Write a setting's consequence in `ListRowDescription` with `wrap`, so it isn't cut off.

### Data and explanation

A row's text is data (what the row is there to show) or an explanation you write. Each has its own part, so grey text means the same thing on every row ([Color tiers](../../../../../design/foundations/typography.md#color-tiers)).

- Put data about the row's subject in `ListRowSubtitle`: an agent's or a channel's description, a channel's topic, a person's role, an app's byline ("Developer tools · by Linear"). It is primary data, so it is in the title's ink at weight 400 and a size down (`text-footnote`): size and weight set it apart from the title, and a third difference, colour, would be one too many ([Notes on deeper surfaces](../../../../../design/foundations/typography.md#notes-on-deeper-surfaces)). It follows a place's tone and the disabled state with the title, and is cut to one line. A risk tone colors the title alone ([An action's risk](#an-actions-risk)).
- Put a time, a date or a gray count in `ListRowMeta`: the row's secondary data, at the hint tier in Space Mono. A row has no other grey part for data, so a fact that isn't one of these goes in `ListRowSubtitle`, never in a grey class of your own.
- Put a sentence you write to explain a setting in `ListRowDescription`: what turning it on does, who can see it, what is lost. Don't put data there: the description is the row's explanation part.
- A conversation's preview stays in `ListRowDescription`, in `ListRowBottom` with its badge: its ink is how `tone="unread"` marks the row.

```example
list-row/compositions/people
```

### Group headings

A group of rows can have a heading above it, such as Channels.

- Write it in sentence case, in `text-footnote` at weight 700 and `foreground-hint` ([Typography](../../../../../design/foundations/typography.md#casing)).
- Add no hint beside or under it that only restates its name: Your preferences, not Your preferences with "Only for you". A hint goes there only when it tells people something the name doesn't, such as a limit ("Up to 30") ([Writing](../../../../../design/content/writing.md#principles)).
- Make the heading a button with `aria-expanded` when the group can collapse, and show the number of rows when it is collapsed.
- Put the group's action on the right as an ink text button that underlines on hover ([TextLink](../text-link/text-link.md)): Browse.

raft-ui has no exported heading part for these lists yet.

## Accessibility

- `ListRow` uses Base UI's `useRender` and renders a native `button` (or the link you pass with `render`), so the row is reached with Tab and activated with Enter or Space. With `interactive={false}` it is a `div` and only its controls are focusable.
- The accessible name is the row's text. Add an accessible name to a badge that is only a number or an icon: `aria-label="3 unread"`, `aria-label="Mentions you"`.
- `selected` is visual only. Set `aria-current` or `aria-selected` on the row yourself.
- Label a switch in a settings row with the row's title (`aria-labelledby`).
- Name an `attached` row by the setting it belongs to, with that setting's title id: a display-only one takes `role="group"` and `aria-labelledby`, an interactive one `aria-describedby` ([A row that belongs to the setting above](#a-row-that-belongs-to-the-setting-above)). `ListRow` can't do it for you: only you know which title it belongs to.
- `ListRowIcon` and `ListRowChevron` are hidden from assistive technology.

## Rules

- Don't add an ink border or a shadow to a row or a group: a list is content, and an ink border means a control ([Color](../../../../../design/foundations/color.md#lines)).
- Don't color a row's text with a class of your own: an action's risk is `tone="warning"` or `tone="danger"`, which colors the title and the leading icon, keeps their contrast and greys them when the row is disabled ([An action's risk](#an-actions-risk)).
