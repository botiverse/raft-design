---
title: Meter
summary: 显示一份额度还剩多少的计量条，比如会定期重置的用量上限：一开始是满的，用多少就少多少。
sourceHash: e9bcf853
---

# Meter

计量条显示一份额度还剩多少：每隔几小时重置一次的用量上限、每月的配额。它像手机电量一样，一开始是满的，用掉多少就少多少，因为它回答的问题是「我还能不能接着干，还能干多久」。旁边的标签说明这是哪份额度，数值说明还剩多少、什么时候恢复。

```example
meter/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 一份会用完、之后又会恢复的额度还剩多少 | Meter |
| 一项已知百分比的任务进行到了哪里：上传、转换 | [Progress](../progress/progress.md) |
| 没有上限的量，比如到目前为止的花费或 token 数 | 写成 [DescriptionList](../description-list/description-list.md) 里的数字，不画条 |

Meter 与 Progress：计量条是一个范围内会升也会降的量；进度条是一项只会往前走、到 100% 就完成的任务。进度条满了会变成 `success`，所以一份还没动过的额度画成进度条，看起来就像已经完成了。

## 结构 {#anatomy}

- `Meter`：根元素。必需。接收服务商报告的已用量 `used` 和整份额度 `max`（不设时为 100），画出的是剩下的部分，即 `max - used`。接收 `valueText`，即用文字写出的数值，由 `MeterValue` 显示，辅助技术也读它。
- `MeterHeader`：轨道上方可选的一行，放 `MeterLabel` 和 `MeterValue`。
- `MeterLabel`：这是哪份额度。
- `MeterValue`：显示 `valueText`。不想在条旁边写字时可以不放；文字仍然会被读出。
- `MeterTrack`：`fill-muted` 的轨道。必需。
- `MeterIndicator`：填充部分，一张带墨色边的贴纸。必需。

## 尺寸 {#sizes}

| 尺寸 | 用于 |
| --- | --- |
| 默认（`size="md"`），8px 的轨道 | 单独一个计量条：设置页、套餐页 |
| `size="sm"`，6px 的轨道 | 卡片或弹出层里叠放的几个计量条，比如一个账号的各项上限 |

## 状态 {#states}

颜色跟着剩余量走，没有 `variant`。

| 状态 | 什么时候 | 样子 |
| --- | --- | --- |
| 还很多 | 剩余量多于 `low` | `info` 填充，和 Progress 一样，最多到满条。满的计量条仍然是 `info`：它没有「完成」的颜色 |
| 偏少 | 剩余量小于或等于 `low`：不设时为 `max` 的 20% | `warning` 填充，数值用 `warning-strong` |
| 已用完 | `used` 到达 `max` | 空的 `warning-muted` 轨道，带 1px 的 `warning` 边，数值用 `warning-strong` |

```example
meter/compositions/states
```

- `low` 的意思是小于或等于，和 HTML 的 `<meter low>` 不同，后者是严格小于：按默认值，剩 20% 就已经算偏少。它的单位和 `max` 相同，取值限制在 0 到 `max` 之间。
- 已用完的轨道要加上警告色的边，因为空轨道必须自己就能看得清：这条边在浅色模式下对白色的对比度是 2.0:1，在深色模式下对各层表面（从弹出层到画布）是 7.2:1 到 8.5:1；而普通轨道分别只有 1.1:1 和 1.1:1 到 1.5:1。只用 `warning-soft` 的浅色底，在深色画布上测得 1.16:1，比普通轨道还淡。
- 额度偏少或用完时不要用 `danger`：它会在重置时恢复，所以会打断工作，但不是不可撤销的（[颜色](../../../../../design/foundations/color.md#meanings-of-color)）。
- 填充保持 Progress 的颜色 `info`，让计量条和进度条看起来是一家，只在剩得不多时才变成橙色：有需要处理的事时，颜色才变。
- 满的计量条不要变成青柠色：满额度是还没动过，不是完成了。这也是计量条不用 Progress 来画的原因，Progress 到 100% 时会变成 `success`。
- 除非某份额度确实需要别的值，否则保持默认的 `low`：剩下同样多时，在每个界面上看起来都应该一样。

## 内容 {#content}

- 在 `MeterLabel` 里写出额度的名称："5-hour limit"、"Weekly limit"。
- `valueText` 先写还剩多少，再写什么时候恢复："38% left · resets in 3h"。
- 一点都不剩时，用这件事代替百分比："Used up · resets in 3h"。
- 不要写「% used」：读者得拿 100 去减，才知道自己还剩多少。
- 不知道什么时候重置时，去掉后半句："38% left"。

## 无障碍 {#accessibility}

Meter 封装了 Base UI 的 Meter，它提供 `role="meter"`。它的 `aria-valuenow` 是剩余量，`aria-valuetext` 是 `valueText`。

- `MeterLabel` 给计量条提供无障碍名称。没有可见的标签时，给 `Meter` 传 `aria-label`。
- `valueText` 是必需的，也是设置朗读数值的唯一方式。所以读屏软件读出的（"38% left · resets in 3h"）永远就是界面上显示的，不会只读一个光秃秃的「38%」，让人分不清是用了还是剩下。

## 规则 {#rules}

- `used` 按服务商报告的值传入，不要自己算剩余量。Meter 会算，这样条、文字和朗读的数值就不会互相矛盾。
- 计量条放在容器里面，用自己的轨道，不要贴着容器的边（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)）。
