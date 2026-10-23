---
title: TextLink
summary: Text that underlines on hover, for the quietest control on a screen, an action or a way somewhere; the bottom step of the button ladder.
status: stable
aliases: [Link button, Text button]
layer: core
category: actions
related: [button]
---

# TextLink

TextLink is text that does something or goes somewhere, with no underline until the pointer is over it. It is the bottom step of the emphasis ladder, below a frameless button ([Button](../button/button.md#which-color)): use it where even a frameless button would be too much weight, such as Forgot Password on a sign-in page, Sign Out under a server list, or a See All beside a section title.

```example
text-link/compositions/preview
```

## When to use

| Situation                                                              | Use                                                                       |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| The quietest control on a screen, alone or inside a sentence           | TextLink                                                                  |
| Cancel or a minor action inside a dialog, sheet, menu, popover or card | [Button](../button/button.md) `variant="ghost"`                           |
| Cancel or a minor action on a page                                     | [Button](../button/button.md) `variant="default"`                         |
| A link inside rendered message or document content                     | The Markdown link, in the link blue ([Markdown](../markdown/markdown.md)) |

## Variants

The variant follows where the link sits, not how important the action is.

| Variant                     | Use for                                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `variant="muted"` (default) | A link that stands on its own: Forgot Password, Sign Out, See All. `foreground-muted`, 500; on hover, ink and underlined.           |
| `variant="strong"`          | A link inside a sentence: "Don't have an account? Create One", a banner's "Manage Machines". Ink, 600; on hover, underlined in ink. |

**Why the position decides.** On its own, a TextLink is the quietest control on the screen, so it is muted: it must not compete with the screen's text or its buttons. Inside a sentence, the same muted grey would sit lighter than the words around it and read as disabled, so there it takes the ink of body text and stands out by weight instead. Neither variant is pink, at rest or on hover: pink belongs to the one primary button.

**Why the underline comes on hover.** The underline is the hover signal for every piece of clickable text in raft-ui, so people learn it once ([Clickable text](../../../../../design/foundations/states.md#clickable-text)). At rest, the weight and color above and where the link sits say it can be clicked; an underline on every quiet control would add a line under each of them on a screen that is read for hours.

## States

- **Hover:** the text underlines in its own color, 1.5px thick, 3px below the baseline; a muted link also turns ink.
- **Disabled:** the text turns `foreground-disabled` and nothing changes on hover, so it no longer reads as something to press.

```example
text-link/compositions/disabled
```

- **Focus:** the shared focus ring ([States](../../../../../design/foundations/states.md)), on a 2px radius.

## Behavior

- TextLink has no size of its own: it takes the size and line height of the text around it, so it sits on the baseline inside a sentence and cannot make the line taller. Standing alone, give its container the text size.
- It has no box, padding or minimum height. Don't put it where it is the only thing a finger must hit on a phone; that needs a [Button](../button/button.md).

## Content

- Start with a verb, or name the place: Forgot Password, Sign Out, See All.
- Use Title Case, like every button label ([Writing](../../../../../design/content/writing.md#casing)).

## Leaving Raft

A TextLink that goes to another site ends in `TextLinkExternalIcon`: Lucide's `ArrowUpRight` at 14px, 2px after the text, in the text's color. It sits in an inline-flex box, so the underline on hover stops at the text and never runs under the arrow. Pass `label` for a screen reader, "(opens in a new tab)"; it is product copy, so raft-ui doesn't write it. The rule for every control that leaves Raft is in [Navigation](../../../../../design/patterns/navigation.md#links-that-leave-raft).

```example
text-link/compositions/leaving-raft
```

## Accessibility

TextLink renders a native `button type="button"`. For a way somewhere, render a real link so it opens in a new tab and announces as a link: `render={<a href="…" />}`.

- `disabled` is the native attribute, so it works only on the button form: the button leaves the tab order and takes the disabled look. A link has no `disabled`. When a way somewhere is unavailable, don't render the link; say why in the text instead.

## Rules

- Don't use TextLink to fit one more action into a crowded row. It is the quietest control on a screen, not a smaller button.
- Don't color it, and don't underline it at rest. Emphasis comes from weight and ink, so pink stays with the one primary button, and the underline stays the hover signal.
