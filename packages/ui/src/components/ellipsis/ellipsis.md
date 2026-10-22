---
title: Ellipsis
summary: Text cut to one line or a few with CSS, which shows its whole text in a tooltip, or expands, only when it is actually cut.
status: experimental
aliases: [Truncate, Line clamp, Text overflow, Show more]
layer: core
category: data-display
related: [tooltip, text-link, text]
---

# Ellipsis

Ellipsis cuts a text to one line, or to `lines` lines, and knows whether it did. While the text is cut, hovering it shows the whole text in a [Tooltip](../tooltip/tooltip.md), and an expand control in `after` can show the rest in place. A text that fits gets neither. Use it for names in rows, titles in headers and descriptions under them, anywhere a text can be longer than its room.

```example
ellipsis/compositions/list-row
```

## When to use

| Situation                                                                           | Use                                                                                                              |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A name, a title or a file name in a row or a header, one line                       | Ellipsis                                                                                                         |
| A description or a summary cut to a few lines, that people may want to read in full | Ellipsis with `lines` and an `EllipsisToggle` in `after`                                                         |
| The value of a Select, a Combobox or a chip in a form                               | Nothing: the control cuts its own value ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)) |
| A label, help text or an error                                                      | Wrap it, never cut it: it explains the control                                                                   |
| The body of a message or a document                                                 | A collapse of its own, not a clamp: a clamp cuts mid-sentence and hides blocks                                   |
| A file name cut in the middle (`launch-…-final.pdf`)                                | Not Ellipsis: it only cuts at the end                                                                            |

## Anatomy

- `Ellipsis`: the text and its room. Its children are the text, inline content only (text, links, inline code, mentions). Required.
- `EllipsisToggle`: the expand control, for `after`. A [TextLink](../text-link/text-link.md) button with the caller's label. Optional.

The text is cut with CSS (`text-overflow: ellipsis`, `line-clamp`) and never rewritten: find in page, copy and screen readers get the whole text, and the cut never splits an emoji or a Chinese character.

## Behavior

### Measuring

- Ellipsis compares the text's fractional size with its box, with a 0.5px tolerance. Whole-pixel sizes (`scrollWidth > clientWidth`) miss a cut of up to 1px or more, which still shows an ellipsis, at some widths and page zooms.
- It measures again when its box or its `after` changes size, when the text changes, when `lines` or `expanded` change, and when a web font finishes loading, which widens the text without resizing its box. It doesn't measure on every render.
- Every Ellipsis on a page shares one ResizeObserver, one MutationObserver and one font listener, and all of them are measured in one animation frame, reads first and writes after, so a long list doesn't force layout once per row.
- A text with no box (inside `display: none`, a closed tab or a collapsed panel) is neither cut nor whole until it shows: no tooltip, no expand control.

### Tooltip

- The tooltip opens on hover only while the text is cut. Ellipsis measures again as it is about to open, so a change it missed can neither open it on a text that fits nor keep it shut on one that is cut. It closes when the text stops being cut.
- `tooltip` is the children by default, `false` turns it off, and a node replaces its content. The default isn't announced, since a screen reader already reads the whole text.
- It never opens on a touch screen (`(hover: none), (pointer: coarse)`): a tap there means the row it is in. Give a text that people must read in full an `EllipsisToggle` instead.
- It doesn't open while the pointer is over `after`, which has its own name.

### Expanding

```example
ellipsis/compositions/expand
```

- `after` sits at the end of the last visible line. Give it a function to get `{ truncated, expanded, toggle }`, for an `EllipsisToggle` whose label follows the state: Show More, Show Less.
- `after` shows only while the text is cut or expanded. Its room is kept while it is hidden (`visibility: hidden`), so showing it never changes where the text is cut, and the control can't flicker in and out.
- `EllipsisToggle` stays the same element when it is pressed, so focus stays on it.
- `expanded`, `defaultExpanded` and `onExpandedChange` make it controlled or uncontrolled.
- When printed, the text shows in full.

### Expanding on click

```example
ellipsis/compositions/with-link
```

- `expandOnClick` makes a cut plain text a button that expands it. It becomes one only once it is measured as cut, so a text that fits is never a button or a tab stop, and a click that selects text doesn't expand it.
- A text with a link, a button or another control in it never becomes a button, even with `expandOnClick`: a button can't contain a link, and a click on the link would expand the text too. Give it an `EllipsisToggle` in `after`.

### Resizing

```example
ellipsis/compositions/resizing
```

## Layout

Most texts that don't cut sit in a layout that won't let them shrink:

- In a flex or grid row, Ellipsis shrinks by itself (`min-w-0`), but every flex or grid item between it and the row needs `min-w-0` too.
- In a table, use `table-layout: fixed` or give the column a width.
- Don't put block elements (`<p>`, `<div>`) in the children of a multi-line Ellipsis: they break the clamp.
- A long URL or a run of digits with no spaces breaks anywhere in a multi-line Ellipsis.

## Accessibility

- The whole text is in the DOM, so a screen reader reads all of it; the tooltip adds nothing it would announce.
- `EllipsisToggle` is a `<button>` with `aria-expanded` and `aria-controls` pointing at the text. It comes before the text in the DOM, because it floats to the end of the last line.
- With `expandOnClick`, a cut text is `role="button"`, in the tab order, `aria-expanded="false"`, and expands on Enter and Space.
- The tooltip is the Base UI Tooltip, through [Tooltip](../tooltip/tooltip.md). The text isn't focusable, so the tooltip opens on hover only; the expand control is how a keyboard reaches the rest.

## Rules

- Never cut a label, help text or an error: wrap them ([Forms](../../../../../design/patterns/forms.md#long-values-in-fields)).
- Don't add a `title` to an Ellipsis: it shows its own tooltip only when needed, and a `title` shows always and doubles it.
- Put the expand label in the product's words, in Title Case: Show More, Show Less.
