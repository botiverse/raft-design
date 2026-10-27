---
title: Search
summary: The search trigger in the web top bar, and the parts of search results — rows for places and people, message and thread hits, grouped by kind with the matched words marked.
status: stable
aliases: [SearchTrigger]
layer: collaboration
category: search
related: [list-row, empty-state, select, combobox, dialog, input-group, thread-panel]
---

# Search

Search is a field, a few filters and results grouped by kind. Places and people are rows; messages are hits that say who, where and when, with the matched words on a yellow fill. On the web, search opens from the search field in the top bar (`SearchTrigger`); on a phone it is the Search tab, with the field in the tab's top bar.

```example
search/compositions/search-panel
```

## When to use

| Situation                                       | Use                                                                                                                     |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Finding a place, a person or a message to go to | Search                                                                                                                  |
| Finding a value to fill in, inside a popup      | A select with search ([ComboboxSelect](../combobox-select/combobox-select.md)) or a [Combobox](../combobox/combobox.md) |
| Narrowing a list that is already on screen      | A filter ([Choosing a component](../../../../../design/components/overview.md#picking-something))                       |

## Anatomy

### Trigger

- `SearchTrigger`: the top bar's search field. It looks like a field and is a button that opens the search dialog. Like every field it doesn't hover; a press lays the medium tier ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)).
  - A search icon, then `SearchTriggerLabel` (the placeholder, Search Raft), then `SearchTriggerShortcut` (⌘K) at the right end. The label truncates first.

```example
search/compositions/search-trigger
```

### Results

- `SearchShellRoot`: the search surface, with `SearchShellFilters` (the row of filters) and `SearchShellViewport` (the scrolling results).
- `SearchResultsSummary`: one line about the results: "Searching for “launch”…".
- `SearchResultsSection`: one kind of result, with `SearchResultsSectionHeading` (Messages 13) and `SearchResultsList`.
- `SearchEntityResult`: a channel, a person or an agent. It follows the layout of a [ListRow](../list-row/list-row.md): `SearchEntityResultLeading` (a `SearchEntityResultIcon` or an avatar, with an optional `SearchEntityResultActivity` light), and `SearchEntityResultContent` with `SearchEntityResultHeader`, `SearchEntityResultTitle` and `SearchEntityResultDescription`. It draws the ListRow hairline above itself, from where the text starts, when it follows another result in the same `SearchResultsList`. Put a result's test ids and data attributes on `SearchEntityResult` itself, as its direct child: a wrapper around each result makes every one the first of its parent, and the hairlines are gone.
- `SearchMessageResult`: a message. `SearchMessageResultHeader` holds `SearchMessageResultSender` (who), `SearchMessageResultMeta` (where), `SearchMessageResultThreadMeta` (in a thread) and `SearchMessageResultTimestamp` (when); `SearchMessageResultBody` holds the excerpt, with each match in `SearchMessageResultMatch`.
- `SearchThreadResult`: a thread with several hits: `SearchThreadResultHeader` (`SearchThreadResultMeta`, `SearchThreadResultTimestamp`, `SearchThreadResultTitle`) and `SearchThreadResultMessages`, a list of `SearchThreadMessageResult`.

```example
search/compositions/search-preview
```

## States

| State                                        | Use for                                                                                                                                                                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selected` on a result                       | The keyboard highlight: `brand-soft` on the result's inset shape, as in menus ([States](../../../../../design/foundations/states.md#usage))                                                                                            |
| Menu open (`data-popup-open` on a result)    | `fill-cell-hover` on the inset shape, the same fill as the hover, so the result the menu acts on stays marked; a `selected` result keeps `brand-soft` ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)) |
| `muted` on an entity's title and description | A place the person can't post in any more, such as an archived channel                                                                                                                                                                 |
| Loading                                      | A summary line and skeletons in the shape of the results ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed))                                                                                             |
| No results                                   | An [EmptyState](../empty-state/empty-state.md) that says how to widen the search                                                                                                                                                       |

```example
search/compositions/search-muted-entity
```

```example
search/compositions/search-loading
```

```example
search/compositions/search-no-results
```

## Behavior

- On a phone, search is the Search tab, and the field is in its navigation row ([Page structure](../../../../../design/patterns/page-structure.md#phone)). Its keyboard, its kept state, opening a result and searching inside one place are in [Navigation](../../../../../design/patterns/navigation.md#search-on-a-phone).
- Give the field the same margin on both sides, the content edge of what is under it: 20px, where a result's content starts, on a phone too (`SearchShellRoot` sets `--column-margin`; [Lists](../../../../../design/patterns/lists.md#one-edge)). `SearchShellFilters` pads by the same margin. Don't leave a narrower edge on one side for an icon.
- In a narrow list (the ⌘K dialog) a hit's head line gives way in order: the place truncates first, then the time, so the time never runs past the 12px inside the shape.
- On the web, open search from the top bar's field as a centered dialog, 720px wide, whose top edge covers the top bar's field, so the field seems to grow into it. It has the scrim and no animation, like every centered overlay ([Choosing a component](../../../../../design/components/overview.md#overlays)).
- Group results by kind ([Conversation](../../../../../design/patterns/conversation.md#search)): places and people first, then messages.
- Draw no line between results, or between two threads. A result is a list cell ([Lists](../../../../../design/patterns/lists.md)): hover, press, menu open, the keyboard highlight and the focus ring are drawn on one rounded shape as tall as the result and inset 8px from each side. `SearchResultsList` and a thread's messages are columns with a 2px gap and 8px at their top and bottom, so two filled results show 2px between them and the first sits 8px under its heading. Section headings, the summary and a thread's header separate the groups; they start 20px in, where a result's content starts. A result's content is padded from its shape, 12px inside it at the start and at the end and 12px at the top and bottom, so the icon and the time never touch the shape ([Lists](../../../../../design/patterns/lists.md#rules)). `SearchShellViewport` takes the 8px list scrollbar and publishes its width, so the shape stays 8px from both edges with a classic scrollbar.
- Show the scope, the sender, the place and the time range as filters in the filter row, each a select or combobox.
- Open a selected result in the side panel ([Conversation](../../../../../design/patterns/conversation.md#search)). A hit in a thread opens that thread directly.
- Move the keyboard highlight from the field into the results with the Down arrow, and open the highlighted result with Enter.

## Content

- Make the excerpt of a message at most 2 lines, with the matched words in `SearchMessageResultMatch`.
- Mark the matched words on a `you` fill, in the text's own weight and with no edge (stdrc, 2026-10-24). A hit is a highlight behind words, not a thing, so it has no ink edge ([A block of color is a sticker](../../../../../design/principles/principles.md#3-a-block-of-color-is-a-sticker)); with one it read as one more badge beside a row's "DM" or "Channel" tag and cut through the descenders. It keeps the full `you` yellow rather than a soft tint: a 40% tint was ΔE 1.2 from a selected row's fill and turned muddy in dark mode, where the full fill keeps ink type at 13:1 in both modes. The fill reaches 1px past the glyphs above and below, so descenders stay inside it. A mention of you keeps its sticker, edge and all.
- Include a leading `@` or `#` in the hit when the query matches a handle or a channel name: "@Remy", not "@" outside the fill.
- Write the no-results state as what wasn't found and how to widen it: "No results for “launch”", "Try another word or remove a filter."
- Write the trigger's placeholder as what it searches: Search Raft.

## Accessibility

- The parts render native elements through Base UI's `useRender`; no Base UI primitive is involved. Results are `button`s by default; pass a link with `render` for a result that navigates.
- `SearchTrigger` is a `button` named by its label. It opens a [Dialog](../dialog/dialog.md); give the dialog a title and the field inside it an accessible name (`aria-label="Search"`).
- Put the field and its filters in an element with `role="search"`, and give the clear button `aria-label="Clear search"`.
- `selected` is visual only. When you move a keyboard highlight through the results, keep focus on the field and point to the highlighted result with `aria-activedescendant`, or move focus to it.
- Give an entity's activity light a name: `role="img"` and `aria-label="Active"`.
- `SearchMessageResultMatch` is a `mark`, so matches are announced where the reader supports it.
