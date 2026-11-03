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

Several lines of code or a log, on a framed code surface. In a message its long lines wrap; where people read code as code, they scroll sideways ([Behavior](#behavior)). An optional header names the file and holds actions such as Copy. You render the code inside, plain or highlighted.

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

- `CodeBlock`: the frame. Required. `defaultWrap` makes its long lines wrap when it appears; it holds whether this one block wraps.
- `CodeBlockHeader`: the optional top bar, with a hairline under it.
  - `CodeBlockTitle`: the file name, in Space Mono.
  - `CodeBlockActions`: the actions at its right end.
    - `CodeBlockWrapToggle`: the toggle, just before Copy, that makes a wrapping block scroll sideways instead. Work in progress: import it from `@botiverse/raft-ui/wip`.
- `CodeBlockBody`: the code panel. Render the code in a `CodeBlockPre` with its `code` inside it. Required.
- `CodeBlockPre`: the code's `pre`, keyboard-reachable while it scrolls ([Accessibility](#accessibility)).
- `CodeBlockAction`: a 32px icon button with `radius-chip` (34px with `radius-control` with a mouse), like every control embedded in a frame. You provide its icon and what it does.

## Variants

| Variant          | Use for                                                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------- |
| With a header    | Code from a file: the header names it                                                                                   |
| Without a header | A snippet or a log without a file name; `CodeBlockActions` placed inside the body takes its own column at its top right |
| Highlighted      | Code in a known language, highlighted with Shiki                                                                        |
| Plain            | Logs and text without a language                                                                                        |
| Wrapping         | Code in a message: `defaultWrap` on `CodeBlock`, and a `CodeBlockWrapToggle` before Copy                                |

```example
code-block/compositions/wrap
```

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

- **In a message, long lines wrap** (`defaultWrap`). A chat column is narrow, and the code people post in a message is mostly commands, logs and text that reads like prose; scrolling sideways hides the end of the line, often the part that matters (the last flag, the error), behind a scrollbar. Slack and Discord wrap the code in a message too.
- **Where people read code as code, long lines scroll sideways** inside the body and don't wrap: a diff, a full code view. This is the default, without `defaultWrap`. Wrapping breaks the columns indented code is aligned in, which is why IDEs and GitHub keep lines unwrapped on wide screens. Plain text opened in the file viewer wraps for a reason of its own ([File viewer](../../../../../design/components/overview.md#file-viewer)).
- A wrapped line goes on at the start of the next line, and a run with no space in it, such as a long URL or token, breaks wherever it has to (`white-space: pre-wrap`, `overflow-wrap: anywhere`). The continuation doesn't keep the line's indentation: CSS has no way to indent each line by its own leading whitespace, and the `pre` holds the code as text, so there is no line element to indent. The code keeps its whitespace, and Copy copies the lines as they are, without the wraps.
- **The wrap toggle.** A block that wraps has a `CodeBlockWrapToggle` in its header, immediately before Copy. Pressing it makes that one block scroll sideways instead; pressing it again wraps it. Pressed, it is the yellow sticker of a pressed toggle, as a `PanelToggleAction` is ([Panel](../panel/panel.md#states)), and like every selected control it keeps that look under the pointer ([States](../../../../../design/foundations/states.md#hover-and-press)). It changes only its own block and isn't remembered: every block starts wrapped, for everyone, and the next message's blocks still wrap. A block that scrolls by default has no toggle.
- After a copy, the copy icon turns into a check, then back after a moment, as in [CopyableCode](../copyable-code/copyable-code.md).

## Content

- Put the file name in the title, with its extension: `raft.config.ts`.
- Leave the header out when there is no file name.

## Accessibility

- Give every `CodeBlockAction` an `aria-label`, such as "Copy code": it is icon-only.
- Announce a completed copy, for example with `aria-live` on the button, so the change of icon isn't the only signal.
- Keep the code in `pre` and `code`, so it is read as code and keeps its whitespace.
- Render the code in `CodeBlockPre`. A long line scrolls inside it, and while it does it is a region the keyboard can reach (`tabindex="0"`, `role="region"`), named by its `aria-label` ("Code" by default; name it after the language, "ts code"): Safari doesn't let the keyboard reach a scroller that can't take focus, and a `pre` with no role can't carry a name. Code that fits adds no Tab stop. It measures again whenever the `pre` resizes or its code changes (highlighting that arrives late, code that streams in), so a line that grows long gets the Tab stop. It shows the inset ink ring on keyboard focus. Wrapping is applied to `CodeBlockPre` (a bare `pre` doesn't wrap): a block that wraps doesn't scroll, so it adds no Tab stop, and it measures again when the toggle switches it.
- `CodeBlockWrapToggle` is a Base UI Toggle: a `button` whose `aria-pressed` says whether the block scrolls instead of wrapping. raft-ui holds no words, so give it an `aria-label` that names what pressing it turns on, such as "Don't Wrap Lines", and the same text as its `title`: it is icon-only.

## Rules

- Set code in Space Mono, `text-mono-code`.
- Put the block on `layer-code`, with a `line-hairline` border and `radius-container`.
- Put the actions 6px from the block's corner, 4px apart. Without a header they sit in a column of their own beside the code, as wide as the actions, so no line runs under them however many there are, and the block is at least tall enough to keep 6px under them. In a header they are centered in its 40px and 6px from its end ([Shape](../../../../../design/foundations/shape.md#inside-a-frame)).
- Wrap code in a message, and give it the wrap toggle. Keep code that is read as code (a diff, a full code view) scrolling, with no toggle.
- Put the wrap toggle immediately before Copy, so Copy stays in the corner where people reach for it.
- Draw the wrap toggle with Lucide `text-wrap` (`TextWrap`; `WrapText` is the same drawing), the same in both states. It is a pressed toggle, so the yellow sticker says it is pressed, as on a `PanelToggleAction`; don't fill the icon or swap in a second drawing ([Iconography](../../../../../design/foundations/iconography.md#meanings): one icon per concept, outline only).
