---
title: Steps
summary: 显示一个人在 3 到 5 步的短流程中走到了哪里：已完成的步骤是墨色，当前步骤是黄色贴纸，后面的步骤只有轮廓。
sourceHash: a9d30da0
---

# Steps

Steps 显示一个人在 3 到 5 步的短流程（比如设置服务器）中走到了哪里。已完成的步骤是墨色，当前步骤是黄色贴纸，后面的步骤只有轮廓。

```example
steps/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 按顺序走完的 3 到 5 步流程 | Steps |
| 超过 5 步的流程 | 拆成 2 个流程，各用一个 Steps |
| 某个操作进行到了哪里 | [Progress](../progress/progress.md) |
| 人可以按任意顺序访问的几个分区 | [Tabs](../tabs/tabs.md) |
| 服务器设置的步骤标签（"Set up your server"） | 对话框标题栏里的一行 Space Mono，不用 Steps；见[新手引导](../../../../../design/products/raft-chat/onboarding.md) |

## 结构 {#anatomy}

- `Steps`：有序列表。`current` 设定当前步骤，从 1 开始数。
- `Step`：一个步骤：一个 20px 的方形标记，里面是 Space Mono 的序号，加上标题和可选的描述。一段短的 `line-seam` 把它和下一步连起来。
- `OtterIndicator`：插图，每种步骤状态一个姿势，尺寸 48px 或更大。它和 Steps 一起导出；设计系统目前还没有关于它的规则。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 横排（默认） | 大多数流程 |
| `vertical` | 步骤排成一列 |
| 可点击（`onUpdateCurrent`） | 人可以回到前面某一步的流程。`disabled` 的步骤不能选 |
| 自定义标记（`icon`、`finishIcon`、`errorIcon`） | 用图标代替步骤的序号、对勾或叉 |

```example
steps/compositions/vertical
```

```example
steps/compositions/clickable
```

```example
steps/compositions/icon
```

## 状态 {#states}

| `status` | 样子 |
| --- | --- |
| `wait` | 后面的步骤：纸面上的 `line-seam` 轮廓，标题用 `foreground-hint` |
| `process` | 当前步骤：黄色贴纸，墨色序号 |
| `finish` | 已完成：实心墨色，带对勾 |
| `error` | 失败：橙色贴纸，带叉，因为出问题用橙色（[颜色](../../../../../design/foundations/color.md#meanings-of-color)） |

```example
steps/compositions/status
```

## 行为 {#behavior}

- 横排宽度放不下所有标题时，只显示当前步骤的标题。

## 内容 {#content}

- 每个步骤的标题用简短的名词短语：Your team、Computer、First agent。用 sentence case；步骤可点击时用 Title Case（[字体排印](../../../../../design/foundations/typography.md#casing)）。

## 无障碍 {#accessibility}

- Steps 不基于 Base UI 的基础组件。`Steps` 渲染为 `ol`；用 `aria-label` 按流程给它命名（"Setup"）。
- 当前步骤带 `aria-current="step"`。
- 已完成或失败的步骤会在标题后读出 `finishLabel` 或 `errorLabel`，因为它的标记只是在视觉上表达状态。
- 在可点击的步骤中，每个标题都是一个按钮，由该步骤的描述来说明。
