---
title: MessageItemTranslation
summary: 表明一条消息经过翻译的部件：正文下方一行简短的 Space Mono 状态文字，可在译文和原文之间切换；保留在下方的原文；以及翻译中和翻译失败两种状态。
sourceHash: 5c189009
---

# MessageItemTranslation

翻译过的消息在正文里显示译文，下方一行简短的 Space Mono 文字，说明它经过翻译，并可切换到原文。翻译进行中或失败时，也由这一行说明。需要两种语言同时可见时，原文放在译文下方。这些部件放在 `MessageItemContent` 里（[MessageItem](../message-item/message-item.md)）。

```example
message-translation/compositions/translation-showcase
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 消息已翻译 | 正文下方的 `MessageItemTranslationStatus` 加 `MessageItemTranslationAction` |
| 两种语言都要保持可见 | 正文下方的 `MessageItemTranslationOriginal`，加上状态行 |
| 翻译正在进行 | 正文里的 `MessageItemTranslationProgressTrack`，加上一行说明情况的状态文字 |
| 翻译失败 | `MessageItemTranslationFailedStatus` 加 `MessageItemTranslationRetryAction` |
| 消息已收藏，或已被阅读 | 底部那一行里的 `MessageItemSavedIndicator` 或 `MessageItemReadReceipt`（[MessageItem](../message-item/message-item.md#anatomy)） |

## 结构 {#anatomy}

- `MessageItemTranslationStatus`：正文下方一行 `text-mono-meta`、`foreground-hint` 的文字：一个图标，后面是文字或操作。
- `MessageItemTranslationAction`：状态行里的文字按钮，在译文和原文之间切换。
- `MessageItemTranslationOriginal`：原文，在消息里画成引用样式，上方是 `MessageItemTranslationOriginalLabel`。
- `MessageItemTranslationProgressTrack`：放在 [Progress](../progress/progress.md) 里的一条 4px 轨道，翻译进行时显示在正文里。
- `MessageItemTranslationFailedStatus`：用 `warning-strong` 的状态行，表示失败。
- `MessageItemTranslationRetryAction`：失败那一行里的文字按钮。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 已翻译 | 译文替换原来的文字；操作可以切换回原文 |
| 双语 | 正文里是译文，原文保留在下方 |

```example
message-translation/compositions/translated
```

```example
message-translation/compositions/bilingual
```

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 翻译中 | 正文的位置显示进度轨道，状态行说明翻译正在进行 |
| 失败 | 状态行用 `warning-strong`，写明发生了什么，并提供 Retry。正文保留原文 |

```example
message-translation/compositions/translation-states
```

## 行为 {#behavior}

- 操作在译文和原文之间切换正文；文字由你来替换。raft-ui 不记录当前显示的是哪一个。
- Retry 把失败的那一行换成翻译中状态。

## 内容 {#content}

- 用 Title Case 写明操作做什么：Show Original、Show Translation。
- 原文的标签写 Original。
- 说明翻译正在进行："Translating…"。
- 用几个词说明失败，然后提供 Retry："Translation unavailable · Retry"。

## 无障碍 {#accessibility}

- `MessageItemTranslationAction` 和 `MessageItemTranslationRetryAction` 是原生的 `<button type="button">` 元素；可见文字就是它们的名称。只有图标的 Retry 需要 `aria-label`。
- 给失败和翻译中的状态行加 `aria-live="polite"`，这样 Retry 之后的变化会被读出来。
- 给 `Progress` 一个 `aria-label`，例如 "Translating message"。
- 对读屏软件隐藏状态行里的图标；含义由文字表达。

## 规则 {#rules}

- 状态只用消息下方一行简短的 Space Mono 文字，不要为它加颜色（[用现有部件搭建](../../../../../design/components/overview.md#translation-read-and-saved-markers)）。
- 翻译失败用橙色，和其他任何失败一样（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)）。
