---
title: Meter
summary: 显示一份额度用了多少的计量条，比如会定期重置的用量上限：一开始是空的，用多少就涨多少。
sourceHash: 9b7dd5e0
---

# Meter

计量条显示一份额度用了多少：每隔几小时重置一次的用量上限、每月的配额、一块磁盘。它一开始是空的，用掉多少就填上多少，快到头时变成橙色，所以这条在要紧的时候最显眼。旁边的标签说明这是哪份额度，数值说明用了多少、什么时候恢复。

```example
meter/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 一份额度或一项容量用了多少 | Meter |
| 一项已知百分比的任务进行到了哪里：上传、转换 | [Progress](../progress/progress.md) |
| 没有上限的量，比如到目前为止的花费或 token 数 | 写成 [DescriptionList](../description-list/description-list.md) 里的数字，不画条 |

Meter 与 Progress：计量条是一个范围内会升也会降的量；进度条是一项只会往前走、到 100% 就完成的任务。进度条满了会变成 `success`，所以一份已经用完的额度画成进度条，看起来就像已经完成了。

## 为什么显示已用量 {#why-it-shows-what-is-used}

每个显示资源用量的地方都显示用了多少，而不是还剩多少：运行时上限、磁盘、内存和席位都按同一个方向填（stdrc，2026-10-29）。以前，计量条越用越少，而它旁边的磁盘和内存条越用越满，所以一台计算机的同一行里，几条的方向是反的。所有地方都用一个方向，更满的条就总是更接近上限，警告也随着条变满而加重：在要紧的时候最显眼。颜色没有变：用了 88% 和以前剩 12% 是同一种橙色。

## 结构 {#anatomy}

- `Meter`：根元素。必需。接收服务商报告的已用量 `used` 和整份额度 `max`（不设时为 100），按 `used` 占 `max` 的比例填充这条。接收 `valueText`，即用文字写出的数值，由 `MeterValue` 显示，辅助技术也读它。
- `MeterHeader`：轨道上方可选的一行，放 `MeterLabel` 和 `MeterValue`。
- `MeterLabel`：这是哪份额度。
- `MeterValue`：显示 `valueText`。不想在条旁边写字时可以不放；文字仍然会被读出。
- `MeterTrack`：`fill-muted` 的轨道。必需。
- `MeterIndicator`：填充部分，一张带墨色边的贴纸。必需。

## 尺寸 {#sizes}

| 尺寸 | 用于 |
| --- | --- |
| 默认（`size="md"`），8px 的轨道 | 单独一个计量条：设置页、套餐页 |
| `size="sm"`，6px 的轨道 | 卡片或弹出层里叠放的几个计量条，比如一个账户的各项上限 |

## 状态 {#states}

颜色跟着已用量走，没有 `variant`。根元素上的 `data-level` 写明当前是哪个状态。

| 状态 | 什么时候 | 样子 |
| --- | --- | --- |
| 正常（`normal`） | 已用量少于 `max` 的 `warnAt` | `info` 填充，和 Progress 一样，从空轨道开始 |
| 快用完（`high`） | 已用量达到或超过 `warnAt`：不设时为 `max` 的 80% | `warning` 填充，数值用 `warning-strong` |
| 已用完（`full`） | `used` 到达 `max` | 满的 `warning` 条，数值用 `warning-strong` |

```example
meter/compositions/states
```

- `warnAt` 是已用量占 `max` 的比例，从 0 到 1，意思是大于或等于：按默认值，用了 80% 就已经是橙色。它就是以前的「剩 20% 或更少」反过来说，所以同样的数据得到和以前一样的颜色。
- 额度快用完或用完时不要用 `danger`：它会在重置时恢复，所以会打断工作，但不是不可撤销的（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。
- 填充保持 Progress 的颜色 `info`，让计量条和进度条看起来是一家，只在快到头时才变成橙色：有需要处理的事时，颜色才变。
- 满的计量条不要变成青柠色或红色：用完的额度不是完成了，也不是没了。它保持橙色，配上文字 "Used up"。
- 除非某份额度确实需要别的值，否则保持默认的 `warnAt`：用掉同样的比例时，在每个界面上看起来都应该一样。只在可用空间不到 10% 时才警告的磁盘，是 `warnAt={0.9}`。

## 内容 {#content}

- 在 `MeterLabel` 里写出额度的名称："5-hour limit"、"Weekly limit"、"Disk"。
- `valueText` 先写用了多少，带上 used 这个词，再写什么时候恢复："62% used · resets in 3h"。始终写 "used"；不要只写一个光秃秃的 "62%"，它既可能是用了，也可能是剩下。
- 重置时间紧挨着数值，放在同一个 `valueText` 里，不要放进工具提示或第二行：它是答案的另一半。
- 全部用完时，用这件事代替百分比："Used up · resets in 3h"。
- 不知道什么时候重置时，去掉后半句："62% used"。
- 还剩多少（用绝对单位）可以放在计量条的 [Tooltip](../tooltip/tooltip.md) 里："378 GB free of 994 GB"。不要把它放进 `valueText`、和已用的百分比并排：方向相反的两个数字放在一起，读起来像自相矛盾。

## 无障碍 {#accessibility}

Meter 封装了 Base UI 的 Meter，它提供 `role="meter"`。它的 `aria-valuenow` 是已用量，`aria-valuetext` 是 `valueText`。

- `MeterLabel` 给计量条提供无障碍名称。没有可见的标签时，给 `Meter` 传 `aria-label`。
- `valueText` 是必需的，也是设置朗读数值的唯一方式。所以读屏软件读出的（"62% used · resets in 3h"）永远就是界面上显示的，不会只读一个光秃秃的 "62%"。

## 规则 {#rules}

- `used` 按服务商报告的值传入。服务商报告的是剩余量或可用量时，传 `used={max - left}`；Meter 会把它限制在 0 到 `max` 之间，这样条、颜色和朗读的数值就不会互相矛盾。
- 计量条放在容器里面，用自己的轨道，不要贴着容器的边（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)）。

## 从越用越少的计量条迁移 {#migrating-from-the-draining-meter}

2026-10-29 之前，计量条画的是剩下的部分。属性没有变；变的是条和文字说的内容。

- `used` 和 `max` 不变。现在条按 `used` 填充，`aria-valuenow` 是 `used`，不是 `max - used`。
- 把 `valueText` 从剩余量改写成已用量："38% left · resets in 3h" 变成 "62% used · resets in 3h"。"Used up" 不变。
- `low`，也就是计量条开始警告时的剩余量，已弃用，但仍然有效。把它换成 `warnAt`，也就是已用的比例：`max` 为 100 时，`low={20}` 就是 `warnAt={0.8}`，即默认值，所以大多数调用方直接去掉它。两者都设置时，以 `warnAt` 为准。
- `data-level` 现在是 `normal`、`high` 或 `full`，不再是 `plenty`、`low` 或 `empty`。
- 已用完的计量条是一条满的警告色条；带 `warning` 边的空 `warning-muted` 轨道不再使用。
