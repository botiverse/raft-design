---
title: PersonList
summary: The people in a popover, one compact row each (a face, the name and what they are doing), where a row opens that person.
status: experimental
aliases: [PersonRow, Viewers list, Who's here, People in a popover]
layer: core
category: identity
related: [avatar, popover, list-row, dropdown-menu]
---

# PersonList

PersonList lists people and agents in a popover, one compact row each: their `xs` face, their name and what they are doing ("viewing", "read this version"). A row opens that person, or opens nothing for someone who can't be opened. It is the list an avatar stack opens ([Avatar](../avatar/avatar.md#a-stack-that-opens-a-list)): who is viewing a document, who has read it.

```example
person-list/compositions/preview
```

## When to use

| Situation                                                                                                                                                          | Use                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| The people a stack stands for, in the popover it opens, each one to open                                                                                           | PersonList                                                                             |
| People and agents on a page or a panel, with a preview line (a channel's members, a computer's agents)                                                             | [ListRow](../list-row/list-row.md) (64px; 56px on a touch screen)                      |
| Agents at work, with what each is doing on up to 2 lines ([Working agents](../../../../../design/people-and-agents/working-agents.md#the-summary-and-working-now)) | The sidebar row in a popover                                                           |
| Actions on a person (Message, Remove from channel)                                                                                                                 | [DropdownMenu](../dropdown-menu/dropdown-menu.md)                                      |
| Choosing people to add                                                                                                                                             | A [Combobox](../combobox/combobox.md) or a [ChoiceList](../choice-list/choice-list.md) |

## Anatomy

- `PersonList`: the list, a `ul`. Put it straight in `PopoverContent`, under a `PopoverHeader` when the popover has a title, with no `PopoverBody` around it. Required.
- `PersonListItem`: one person, an `li` holding the row. The row is a `button`; `render` makes it a link; `interactive={false}` makes it a `div` that opens nothing. Every prop, `className` and `ref` goes to the row. Required.
- An `Avatar` at `size="xs"`, first in the row, with `aria-hidden`. Required.
- `PersonListItemName`: the name. Required.
- `PersonListItemStatus`: what the person is doing or has done, after the name. Up to 2: the last one ends the row, one before it stays beside the name. Optional.

## Variants

| Row                                  | Use for                                                                            |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| `PersonListItem`                     | Someone the app can open: their profile, an agent's page                           |
| `PersonListItem render={<a />}`      | Someone whose page has an address, so it can open in a new tab                     |
| `PersonListItem interactive={false}` | Someone who can't be opened: a deleted person or agent, a system row (Raft itself) |

```example
person-list/compositions/not-openable
```

A row that opens nothing is a `div`: no hover, no press, no focus, and Tab passes it ([States](../../../../../design/foundations/states.md#usage), Display only). Its words stay ink, since nothing is disabled; a deleted person or agent is shown by their face, gray and dimmed (`grayscale` with `opacity-dimmed`, [States](../../../../../design/foundations/states.md#dimmed)), and by a status that says so.

## Size and spacing

- **A row is one line, as tall as a menu item:** `option-height`, 34px with a mouse on a desktop and 36px on a touch screen. It is a row of a popup list, the one exception to 44px touch targets: the rows span the popover's width and sit 2px apart, so a tap a little off lands on a row, and a wrong tap opens someone people can see and close ([Spacing](../../../../../design/foundations/spacing.md#hit-targets)). ListRow's 64px is for lists people read on a page; in a 300px popover it shows half as many people.
- **The rows are list cells** ([Lists](../../../../../design/patterns/lists.md)): hover, press and keyboard focus are drawn on one shape inside the row, 8px from the popover's sides, with `radius-control`; the rows sit 2px apart, and the first and last shapes 8px from the list's ends.
- **The content sits 8px inside the shape at every input**, so the face starts 16px from the popover's edge, on the line of its title and of any text in a `PopoverBody`. A list on a page puts its content 12px inside the shape on a touch screen, 20px from the edge, because the column's head starts there ([One edge](../../../../../design/patterns/lists.md#one-edge)); a popover's head and text start at 16px on every screen ([Popover](../popover/popover.md#rules)), so its rows do too.
- **8px between the face, the name and a status beside it; at least 16px before the status that ends the row.**

## States

Hover lays `fill-cell-hover` on the shape, press `fill-cell-press`, and keyboard focus draws the 2px inset ring in `foreground` on it, as on every list cell ([Lists](../../../../../design/patterns/lists.md#rules)). The ring shows only after keyboard input ([States](../../../../../design/foundations/states.md#focus)).

- Hover is gray, not the yellow highlight of a menu. The yellow is the cursor of a list the arrow keys move through ([States](../../../../../design/foundations/states.md#hover-and-press)); this list has no such cursor, since each row is its own Tab stop ([Accessibility](#accessibility)).

## Behavior

- Opening a person closes the popover: control its `open` and set it to `false` in the row's handler, then open the profile. The person's page replaces the list, so a list left open would cover it.
- A list longer than the popover's room scrolls: wrap `PersonList` in a [ScrollArea](../scroll-area/scroll-area.md) with a `max-height`. Never cut the list at a count: the stack's count promises everyone.

## Content

- Write the name as the app shows it everywhere else; "You" for the person themselves, in their own row.
- Write a status in lowercase as a short phrase that follows the name ("viewing", "read this version"), or in sentence case as a label ("Viewing", "Updated since"); use one style in a list. A time is short and relative, the way list rows write it ([Lists](../../../../../design/patterns/lists.md#times-in-list-rows)).
- Put the status that changes the most (a time, "viewing") last, at the row's end, where the eye runs down a column of them; a status that marks a few rows ("Updated since") goes beside the name.
- PersonList holds no words of its own: names and statuses come from the app as children.

## Accessibility

- `PersonList` is a `ul` and each `PersonListItem` an `li`, so a screen reader says how many people the list holds. The row inside is a native `button` (or the link passed with `render`), reached with Tab and opened with Enter or Space. Name the popover (`aria-label` on `PopoverContent`, or a `PopoverTitle`), since the list is its content ([Popover](../popover/popover.md#accessibility)).
- Move between rows with Tab, not the arrow keys. Arrow keys move inside a composite control, a menu, a radio group, tabs ([Accessibility](../../../../../design/foundations/accessibility.md#focus-and-keyboard)); a list of people to open is a list of buttons in a dialog, and a `menu` role would promise a menu's keys and typeahead for rows that are not actions.
- A row is named by its words, a comma before each status: "Martin, viewing", "Wug, updated since, 2 hours ago". The comma is drawn by the row, invisible and taking no room, so a screen reader pauses between the name and the status.
- Give the face `aria-hidden`: the name is next to it, and its initials would be read before the name ("M Martin").
- A status that is a short time shows the full date in a tooltip only as a convenience: say the time in words in the status itself, or in a visually hidden part of it, since a tooltip inside a row's button is reached only with a pointer ([Accessibility](../../../../../design/foundations/accessibility.md#focus-and-keyboard)).

## Rules

- Use PersonList for people in a popover, and nowhere else: on a page or a panel, people are [ListRow](../list-row/list-row.md)s, whose 64px row carries a preview line.
- Give every row an `xs` (19px) face: the size of the faces in the stack that opened the list, so a person is the same picture in both.
- Make a row that can't be opened `interactive={false}`, never a disabled button: it isn't unavailable for now, there is no one behind it.
- Don't add buttons to a row: the whole row is the one target. An action on a person goes in their profile or a menu.
- Don't put a `PopoverBody` or padding around the list, or move its rows' content: the rows bring their 8px inset and the 8px inside it.
