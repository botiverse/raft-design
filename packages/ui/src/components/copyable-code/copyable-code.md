---
title: CopyableCode
summary: One command people copy and run, on a code surface with a copy button that confirms with a check.
status: stable
aliases: [Command line]
layer: core
category: data-display
related: [inline-code, code-block, toast]
---

# CopyableCode

One line that people copy and run elsewhere: the command that connects a computer, installs the CLI or signs in. The command sits on a code surface with a copy button beside it; after a copy, the button shows a check for a moment.

```example
copyable-code/compositions/compact-detail-command
```

## When to use

| Situation                          | Use                                         |
| ---------------------------------- | ------------------------------------------- |
| One command people copy and run    | CopyableCode                                |
| A name from code inside a sentence | [InlineCode](../inline-code/inline-code.md) |
| Several lines of code, or a log    | [CodeBlock](../code-block/code-block.md)    |

## Anatomy

- `CopyableCodeRoot`: holds the command and the button, and handles the copy. Required.
- `CopyableCode`: the command. Its text is what gets copied. Required.
- `CopyableCodeAction`: the copy button, an icon [Button](../button/button.md). Required.

## Variants

| Variant     | Use for                                                            |
| ----------- | ------------------------------------------------------------------ |
| `size="md"` | The main step of a dialog or a page, such as setting up a computer |
| `size="sm"` | A command among other details, such as in a panel or a list        |

## States

| State       | Look                                                                        |
| ----------- | --------------------------------------------------------------------------- |
| Copied      | The copy icon turns into a check, then back after a moment                  |
| Copy failed | Nothing changes in the component; `onError` runs so you can tell the person |

```example
copyable-code/compositions/copy-failure
```

```example
copyable-code/compositions/copy-error-toast
```

## Behavior

- The button copies the text content of `CopyableCode`. `onCopy` runs only after the copy succeeded.
- Without `truncate`, a long command wraps; with it, the command stays on one line and scrolls sideways.

## Content

- Show the command exactly as people run it.
- When a copy fails, say so and say what to do: "Couldn't copy the command. Copy the text manually, or check the browser's clipboard permission."

## Accessibility

- `CopyableCodeAction` is labeled "Copy code" and "Copied code" by default, and announces the change (`aria-live="polite"`). Give it an `aria-label` that names what is copied: "Copy login command".
- Tell the person about a failed copy in words, through `onError` (a [Toast](../toast/toast.md) or a status line). The icon alone doesn't say it failed.
- The command is a `code` element, so screen readers read it as text.

## Rules

- Set the command in Space Mono, `text-mono-code`, on `layer-code` with a `line-hairline` border.
- Keep a command on one line: use `truncate`, don't let it wrap.
- Don't copy the `$ ` prompt. Keep the prompt out of `CopyableCode`, because everything in it is copied.
