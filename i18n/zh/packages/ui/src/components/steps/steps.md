---
title: Steps
summary: 显示一个人在 3 到 5 步的短流程中走到了哪里：已完成的步骤是墨色，当前步骤是黄色贴纸，后面的步骤只有轮廓。
sourceHash: 0765352b
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
- `OtterIndicator`：Ottie 插画，每种状态一个姿势，尺寸 40px 或更大。它是装饰，状态用旁边的文字说明。休息和轻敲键盘循环播放，疑惑歪头和庆祝跳起各播放一次。这是[动效规则](../../../../../design/foundations/motion.md)中只适用于插画的例外；在线状态灯保持静止。

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

- 一行步骤占满所在的行，按自己的宽度切换，而不是窗口的（[按所在区域的宽度切换](../../../../../design/patterns/responsive.md#switch-on-the-regions-width)）。自身宽度小于 40rem（640px）时，每一步的文字排到标记下面，各步平分宽度，标题换行；在宽窗口里的弹窗或 400px 面板中也和手机上一样。40rem 起标题在标记旁边，一行太长时折到第二行。把它放进宽度确定的父元素里（块级元素、被拉伸的 flex 或 grid 子项，或设了宽度的元素），不要放进按内容收缩的父元素（`inline-block`、`w-fit`、没设宽度的绝对定位框或浮层、`flex-basis: auto` 又没设宽度的 flex 子项）：它是自己的容器，不从内容取宽度，在那里会缩成零宽。
- 横排宽度放不下所有标题时，只显示当前步骤的标题。

## 内容 {#content}

- 每个步骤的标题用简短的名词短语：Your team、Computer、First agent。用 sentence case，步骤可点击时也一样（[字体排印](../../../../../design/foundations/typography.md#casing)）。

## 无障碍 {#accessibility}

- Steps 不基于 Base UI 的基础组件。`Steps` 渲染为 `ol`；用 `aria-label` 按流程给它命名（"Setup"）。
- 当前步骤带 `aria-current="step"`。
- 已完成或失败的步骤会在标题后读出 `finishLabel` 或 `errorLabel`，因为它的标记只是在视觉上表达状态。
- 在可点击的步骤中，每个标题都是一个按钮，由该步骤的描述来说明。

## Ottie 插画 {#ottie-illustration}

```example
steps/compositions/otter
```

四种姿势沿用同一个圆脸 Ottie 和暖色水彩配色：等待时半侧躺，工作时偶尔轻敲键盘，出错时歪头后浮现问号，完成时小跳一次。不要换成另一种画法的水獭，也不要把插画当作在线状态灯。由调用方决定传入哪种状态。

插画离开可见区域或页面隐藏时暂停。所有插画共用一个观察器，没有动画计时器或逐帧 React 更新。减少动态效果时，休息和打字显示静态姿势，出错和完成显示最后一个姿势。重新进入可见区域会继续播放，切换状态则开始新的动作。

透明 WebP 素材在实例之间共用，只加载当前显示的状态。它是固定的品牌插画，不使用主题色：浅色和深色模式沿用相同的金黄色、奶油色嘴鼻和棕色爪子。动作帧为小尺寸插画优化，避免放大到超过 128px。
