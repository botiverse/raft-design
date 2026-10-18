---
title: InlineCode
summary: A name from code inside a sentence — a variable, a key, a file name — set in Space Mono on a sunken fill.
status: stable
aliases: []
category: content
related: [copyable-code, code-block, message-item]
---

# InlineCode

A piece of code inside running text: a variable, a key or a file name, such as `RAFT_TOKEN` or `raft.config.ts`. It stays part of the sentence. For a command people copy, use [CopyableCode](../copyable-code/copyable-code.md); for several lines, use [CodeBlock](../code-block/code-block.md).

## When to use

| Situation                                                                            | Use                                                                                                     |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| A variable, key or file name in a sentence                                           | InlineCode                                                                                              |
| One command people copy and run, such as connecting a computer or installing the CLI | [CopyableCode](../copyable-code/copyable-code.md)                                                       |
| Several lines of code, or a log                                                      | [CodeBlock](../code-block/code-block.md)                                                                |
| A task number or another ID in text                                                  | Space Mono text, without the fill ([Typography](../../../../../design/foundations/typography.md#usage)) |

## Anatomy

- `InlineCode`: a `code` element. Its text is the code.

## Variants

| Variant                | Use for                                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `appearance="default"` | Running text outside messages, such as docs and descriptions                                                                |
| `appearance="message"` | Inside a message body: sits on the text baseline and breaks inside long paths and hashes instead of overflowing the message |

## Content

- Write the code exactly as it is typed, with its own casing.
- Don't put a whole command in it. A command people run goes in [CopyableCode](../copyable-code/copyable-code.md).

## Rules

- Set inline code in Space Mono at 0.875 times the size of the text around it, so a run of code doesn't crowd the sentence.
- Put it on `fill-muted` with `radius-sticker` and no border.
