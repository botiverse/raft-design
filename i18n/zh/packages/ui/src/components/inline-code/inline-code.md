---
title: InlineCode
summary: 句子里出现的代码名称，比如变量、键或文件名，用 Space Mono 字体，放在下沉填充上。
sourceHash: 26ad954b
---

# InlineCode

正文里的一段代码：一个变量、一个键或一个文件名，比如 `RAFT_TOKEN` 或 `raft.config.ts`。它仍然是句子的一部分。人要复制的命令用 [CopyableCode](../copyable-code/copyable-code.md)；多行代码用 [CodeBlock](../code-block/code-block.md)。

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 句子里的变量、键或文件名 | InlineCode |
| 人要复制并运行的一条命令，比如连接计算机或安装 CLI | [CopyableCode](../copyable-code/copyable-code.md) |
| 多行代码，或一段日志 | [CodeBlock](../code-block/code-block.md) |
| 文字里的任务编号或其他 ID | Space Mono 文字，不加填充（[字体排印](../../../../../design/foundations/typography.md#usage)） |

## 结构 {#anatomy}

- `InlineCode`：一个 `code` 元素。它的文字就是代码。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `appearance="default"` | 消息以外的正文，比如文档和描述 |
| `appearance="message"` | 消息正文里：落在文字基线上，遇到长路径和哈希值时在内部换行，而不是撑出消息 |

## 内容 {#content}

- 代码照输入时的样子写，保留它本来的大小写。
- 不要把整条命令放进去。人要运行的命令放进 [CopyableCode](../copyable-code/copyable-code.md)。

## 规则 {#rules}

- 行内代码用 Space Mono，字号是周围文字的 0.875 倍，这样一串代码不会挤占句子。
- 放在 `fill-muted` 上，用 `radius-sticker`，不加边框。
