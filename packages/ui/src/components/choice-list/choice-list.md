---
title: ChoiceList
summary: An always-open list to choose one or several from when choosing is a dialog's main content, with a search box and a button of its own at the end of a row.
status: experimental
aliases: [Selection list, Open list, Picker list]
layer: core
category: inputs
related: [radio-group, checkbox, select, combobox-select]
---

# ChoiceList

A choice list keeps every choice open as rows people can compare, for a dialog or page whose job is the choice itself: where to move an agent, whom to add to a channel. Each row has a name and up to two lines under it, a radio circle for one choice or a checkbox for several, and a search box above it when people look for an item by name or the list is longer than a glance. It is exported from `@botiverse/raft-ui/wip`, and its API can change in any release.

```example
choice-list/compositions/migration-target
```

## When to use

The full choice between pickers is in [Choosing a component](../../../../../design/components/overview.md#picking-something).

| Situation                                                                                 | Use                                                                                               |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| One of any number of choices, when choosing is the dialog's main content                  | ChoiceList                                                                                        |
| Several of any number, when choosing is the dialog's main content (Add Members)           | ChoiceList with `multiple` and `search="always"`                                                  |
| One of 2 to 5 answers, as one field among others in a form                                | [RadioGroup](../radio-group/radio-group.md)                                                       |
| One of up to 10 values, as a field in a form                                              | [Select](../select/select.md)                                                                     |
| One or a few of many values, as a field in a form, or values from a server as people type | [ComboboxSelect](../combobox-select/combobox-select.md)                                           |
| One of many, when choosing a row costs something, such as asking the server about it      | [Combobox](../combobox/combobox.md#inline-list) with `inline open`: the arrow keys only highlight |

A field among other fields keeps the choice behind one control, so the form stays short. When the choice is the content, opening a field to see the choices only hides what people came to compare, so the list stays open at every length.

## Anatomy

ChoiceList is one component driven by an `items` array; it draws the parts below from it.

- The search box: an [InputGroup](../input-group/input-group.md) with a search icon and, once there is text, a 32px clear button. Always with `search="always"`; above 5 items with `search="auto"`.
- The frame: a card-colored box with a hairline border around the rows, which scroll inside it at a fixed height once the search box shows.
- A group heading, one per group in `groups`: a small heading over the rows of one kind (Agents, People), in the size and color of a [Select](../select/select.md) group label.
- A row, one per item: the radio circle or checkbox, the item's `media` (an avatar, an icon), its `label` and up to two `description` lines. The whole row is a `<label>`.
- A row's `action`: a button at the end of the row, beside it but outside its `<label>`.
- A note: the caller's `noMatchLabel` under the chosen rows when the search matches nothing else, or its `empty` line when there are no items.
- The footer: the caller's `footer`, inside the frame under the rows, past a seam line. It doesn't scroll with the rows, so it is always in view.

## Variants

| Variant          | Use for                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Single (default) | One choice: a radio circle on each row; `value` is a string, or `null` before anything is chosen |
| `multiple`       | Several choices: a checkbox on each row; `value` is an array                                     |

```example
choice-list/compositions/add-members
```

## States

- **Chosen:** the ink dot or the ink check, with no fill on the row. A chosen value is ink, as everywhere ([States](../../../../../design/foundations/states.md)).
- **Hover and press:** the row fills with `brand-soft` under the pointer, as a select list's options do, and presses with `overlay-medium` ([Hover and press](../../../../../design/foundations/states.md#hover-and-press)).
- **Disabled:** a disabled item, or the whole list with `disabled`, takes the shared disabled look for its mark, name and lines, and no hover fill.
- **No match:** the search matches nothing but the chosen rows: they stay, with the caller's short line under them.

```example
choice-list/compositions/no-match
```

- **Empty:** no items at all: the caller's `empty` line in the frame, no rows and no search box.

## Behavior

- **It is always a list.** At 3 items or at 300, never a dropdown.
- **The whole row chooses.** A click or tap anywhere on a row, its lines included, chooses it; with `multiple` it ticks or unticks it.
- **Search follows how people find the item.** Choose `search` by the list's purpose, not by how long it happens to be:
  - `search="always"` when people **recall** what they want, such as a person they know by name (Add Members, a new channel's members). Typing the name is the fastest way in at any count, so the box shows even with 2 items, and with a mouse or trackpad focus starts in it. On a touch screen it takes no focus, so the keyboard doesn't come up over the list.
  - `search="auto"` (the default) when people **recognise** the right row by comparing what the rows say, such as a migration target by its quota and disk. There the rows are the point; the box shows only once the list is longer than a glance, above 5 items, and never takes focus. When the items drop back to 5 or fewer, the box goes, and its text with it.
  - The count is fixed, not a prop, so every list of the same kind looks the same.
- **Matching.** The search matches each item's `searchText`, or its `label` when that is a string, case-insensitively anywhere in the text: give a person's row `searchText` with both the name and the `@handle`. A product with its own search, such as a ranked people search shared with mentions, passes `searchValue` and the values it found, in its order, as `matchedValues`: the list then shows those, still with the chosen rows first, so a person is found the same way in every place they can be picked. Pass the matches for the text the box shows now; while a slower search is still working on the new text, keep passing the previous matches rather than none, so the list doesn't empty and refill.
- **The choice stays in view while searching.** The rows chosen when the search text last changed come first, then the other matches in the items' order. Searching never changes the choice, and clearing it brings back the full list in order.
- **Rows hold still while you choose.** The rows chosen first are taken when the text changes, not when the choice does, so a row never moves under the pointer or the arrow keys; the order is redrawn at the next keystroke.
- **The list scrolls.** With the search box on, the frame stops at 288px and scrolls inside the dialog; a cut-off last row shows there is more.
- **Row heights.** A row with one line is 36px with a mouse and 44px on a touch screen; each description line adds its own height and nothing else.
- **Groups.** With `groups`, each item names its group, and the rows come under their group's heading in the groups' order; items of no known group follow, with no heading. A group with nothing to show, before or during a search, draws no heading. While searching, the chosen rows come first in their own group, so a person never moves out of the People heading.
- **A way out under the list.** When the item may not be there, put the way to make it in `footer`, such as "Create an agent": it stays under the rows as they scroll. To name it after what people typed ("Create an agent named “Mia”"), pass `searchValue` and `onSearchValueChange`; the caller then owns the search text and can quote it in the footer or in `noMatchLabel`.
- **Filling a sheet.** With `fill`, the list takes the height it is given, such as the rest of a phone sheet, and its rows scroll inside it instead of stopping at 288px.
- **Row actions.** An `action` sits at the end of its row, centered on the name's line. It is laid in a second grid column on the same rows but comes after the whole group in the DOM, so clicking it chooses nothing and Tab reaches it after the group, in row order. Open details in a [Popover](../popover/popover.md), which a tap opens too.

```example
choice-list/compositions/search
```

## Content

- The name is `text-subhead` at weight 600; each description line is `text-footnote` in `foreground-muted`. Each truncates on its own line, and while a line is cut off its whole text is its `title`, so a long description can still be read with a mouse ([Long values in fields](../../../../../design/patterns/forms.md#long-values-in-fields)).
- Give a row a second line only when each line says something people compare across rows ("Claude Max · 5h 72% left · this week 40% left", "3 agents · 120 GB disk free"). Leave a line with nothing to say out (`null`, `false` or `""`): it isn't drawn, never shown empty. A line never wraps: on a narrow screen it is cut at its end, so order it by what people compare first and put the least telling fact last ("3 agents · 12 GB RAM free · 120 GB disk free": how loaded a computer is, then memory, then disk, which there is nearly always enough of). What the cut hides shows on hover (the line's `title`) and in the row's details; on a touch screen only the details have it, which is why the order matters.
- Colour inside a line is the caller's, for a value that needs it: a used-up quota window in `warning-strong`.
- raft-ui holds no copy. The search box's name and placeholder, the clear button's name, the no-match line and the empty line all come from the caller, in the product's words ("No matches", "No one matches").
- Name a row's action after its row ("Studio Mac details"), not just "Details".

## Accessibility

- Single: Base UI RadioGroup through raft-ui [RadioGroup](../radio-group/radio-group.md). The group is one Tab stop, on the chosen row; the arrow keys move the choice and focus among the rows drawn, never to a row the search has hidden. Each row the arrow keys reach is chosen, so where a choice starts work (a request about that row), use an [inline Combobox](../combobox/combobox.md#inline-list), whose arrow keys only highlight.
- `multiple`: Base UI CheckboxGroup with raft-ui [Checkbox](../checkbox/checkbox.md), a `group` of checkboxes. Each checkbox is its own Tab stop and Space ticks it: the WAI-ARIA checkbox pattern. A multi-select listbox would make each row an option, which can't hold a button of its own.
- Name the list with `aria-label`, or `aria-labelledby` pointing at the dialog's question. Each radio or checkbox is named by its row's `label` alone and described by its lines, so a screen reader reads the name first and the quota after it, not the whole row as the name.
- Row actions are outside the group and the rows' labels: they are never read into a radio's name, and the group's arrow keys never land on them.
- Each group is a `group` named by its heading, inside the list's own group, so a screen reader says "Agents" as focus enters it. The arrow keys move across the groups as one list.
- With `search="always"` and a fine pointer, focus starts in the search box, so the list is ready for typing; with `search="auto"` or on a touch screen focus stays where the dialog puts it. It moves there once, when the box first shows, and never out of a field people are typing in: items that load while someone fills in the channel's name leave the focus in the name.
- The search box is `type="search"` (WebKit's own cancel mark is hidden; the clear button replaces it, and clearing puts focus back in the box). The no-match line is a `status` that is there, empty, as long as the box is, and gets its text when nothing matches: screen readers announce a status whose text changes, and often miss one that appears with its text. A chosen row that matches is a match, so it never has "No match" under it.
- On a touch screen each row is at least 44px tall and each 32px action keeps a 44px hit area ([Touch screens](../../../../../design/patterns/responsive.md#touch-screens)).

## Rules

- Pass `action` for a row's own button rather than putting a button in `label` or `description`: inside the row's `<label>`, pressing it would also choose the row, and a screen reader would read a button inside a radio.
- Don't put a ChoiceList in a form among other fields; there, use the field the [When to use](#when-to-use) table names.
- Keep removable chips of the chosen people (Add Members) outside the list, above it; ChoiceList draws only the list.
- Use `groups` for kinds people tell apart at a glance (Agents and People), not to sort a long list into many small sections: a search finds a name faster than headings do.
- Put only the way out of the list in `footer`, one row; a second choice list or a form belongs outside the frame.
