---
title: CodeBlock
summary: Several lines of code or a log on a framed code surface, with an optional header for the file name and a copy action.
status: stable
aliases: []
layer: core
category: data-display
related: [inline-code, copyable-code, message-item]
---

# CodeBlock

Several lines of code or a log, on a framed code surface that scrolls sideways instead of wrapping. An optional header names the file and holds actions such as Copy. You render the code inside, plain or highlighted.

```example
code-block/compositions/shiki
```

## When to use

| Situation                          | Use                                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Several lines of code, or a log    | CodeBlock                                                                                                                   |
| One command people copy and run    | [CopyableCode](../copyable-code/copyable-code.md)                                                                           |
| A name from code inside a sentence | [InlineCode](../inline-code/inline-code.md)                                                                                 |
| A diagram or a Markdown table      | The same container ([Built from existing parts](../../../../../design/components/overview.md#diagrams-and-markdown-tables)) |

## Anatomy

- `CodeBlock`: the frame. Required.
- `CodeBlockHeader`: the optional top bar, with a hairline under it.
  - `CodeBlockTitle`: the file name, in Space Mono.
  - `CodeBlockActions`: the actions at its right end.
- `CodeBlockBody`: the code panel. Render the complete `pre` and `code` inside it. Required.
- `CodeBlockAction`: a 32px icon button with `radius-chip`, like every control embedded in a frame. You provide its icon and what it does.

## Variants

| Variant          | Use for                                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------------------- |
| With a header    | Code from a file: the header names it                                                                     |
| Without a header | A snippet or a log without a file name; `CodeBlockActions` placed inside the body floats at its top right |
| Highlighted      | Code in a known language, highlighted with Shiki                                                          |
| Plain            | Logs and text without a language                                                                          |

```example
code-block/compositions/plain
```

```example
code-block/compositions/without-header
```

```example
code-block/compositions/animated-copy
```

## Behavior

- Long lines scroll sideways inside the body. The code doesn't wrap.
- After a copy, the copy icon turns into a check, then back after a moment, as in [CopyableCode](../copyable-code/copyable-code.md).

## Content

- Put the file name in the title, with its extension: `raft.config.ts`.
- Leave the header out when there is no file name.

## Accessibility

- Give every `CodeBlockAction` an `aria-label`, such as "Copy code": it is icon-only.
- Announce a completed copy, for example with `aria-live` on the button, so the change of icon isn't the only signal.
- Keep the code in `pre` and `code`, so it is read as code and keeps its whitespace.

## Rules

- Set code in Space Mono, `text-mono-code`.
- Put the block on `layer-code`, with a `line-hairline` border and `radius-container`.
- Put the actions 6px from the block's corner. Without a header they sit on the code, so the code keeps their column free on every line: a copy button never covers the first line ([Shape](../../../../../design/foundations/shape.md#inside-a-frame)).
