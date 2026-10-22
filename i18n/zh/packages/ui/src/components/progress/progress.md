---
title: Progress
summary: 显示一项可计量的任务进行了多少的进度条，比如上传或用量占上限的比例，带标签和数值。
sourceHash: 957052cc
---

# Progress

进度条显示一件已知百分比的事进行了多少：上传、正在处理的文件、配额的用量。旁边的标签说明它是什么、进行到了哪里。哪种等待用哪种加载指示，见[选择组件](../../../../../design/components/overview.md#waiting)。

```example
progress/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 知道百分比 | Progress |
| 不知道要多久 | [Spinner](../spinner/spinner.md)，不用进度条 |
| 知道加载内容的布局 | [Skeleton](../skeleton/skeleton.md) |

## 结构 {#anatomy}

- `Progress`：根元素；接收 `value`。必需。
- `ProgressHeader`：轨道上方可选的一行，放 `ProgressLabel`（是什么）和 `ProgressValue`（进行了多少，用 Space Mono）。
- `ProgressTrack`：`fill-muted` 的轨道。必需。
- `ProgressIndicator`：填充部分，一张带墨色边的贴纸。必需。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 默认（`variant="primary"`） | 任何一种进度：`info` 填充 |
| `variant="warning"` | 用量达到上限的 90% 或更多 |
| 完成 | `value` 到达最大值时，填充自动变成 `success` |

- 不要用 `variant="danger"`：到达上限是打断，不是不可撤销的（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。
- `information` 和 `accent` 与默认相同。用默认。

```example
progress/compositions/embedded-progress
```

## 状态 {#states}

- 算不出百分比时不要显示进度条。用 [Spinner](../spinner/spinner.md)，不要用假的或不确定进度的进度条。

## 内容 {#content}

- 在 `ProgressLabel` 里写明正在进行的是什么："Uploading design-crop.png"、"Agent hours this month"。
- 在 `ProgressValue` 里显示进行了多少，写成百分比，或者写成已用量与上限。

## 无障碍 {#accessibility}

Progress 包装 Base UI 的 Progress，后者给它 `role="progressbar"` 和数值。

- `ProgressLabel` 提供进度条的无障碍名称。没有可见标签时，给 `Progress` 传 `aria-label`。
- 即使不放 `ProgressValue`，也要保留 `ProgressLabel`。

## 规则 {#rules}

- 文件卡片、缩略图或其他圆角容器里的进度条，放在它自己的细轨道上，永远不要沿着容器边缘放（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)）。
