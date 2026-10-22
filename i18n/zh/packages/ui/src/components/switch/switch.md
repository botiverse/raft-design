---
title: Switch
summary: 圆形的开关控件，用于拨动后立即生效的设置。
sourceHash: e3c5bab6
---

# Switch

开关打开或关闭一项设置，改动立即生效。打开时，它是一张黄色贴纸，圆钮滑到右侧。开关和单选按钮是系统里仅有的圆形控件。

```example
list-row/compositions/settings
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| ----------------------------------------------- | ------------------------------------------- |
| 拨动后立即生效的设置行 | Switch |
| 保存表单时才生效的是或否 | [Checkbox](../checkbox/checkbox.md) |
| 几个答案中的一个 | [RadioGroup](../radio-group/radio-group.md) |

哪些控件立即生效、哪些需要保存，见[表单](../../../../../design/patterns/forms.md)。

## 结构 {#anatomy}

- `Switch`：50 × 30px 的轨道，手机和桌面端一样。必需。放在标签旁边时，把它放进 `FieldItem`，它对齐标签第一行的中线；或者放在 `ListRow variant="plain"` 的末尾，它以整行居中，无论有没有描述；两种情况都保持完整的 50 × 30 尺寸。只有一行、带开关的设置行在手机上高 54px。不要加 `margin-top`（[对齐](../../../../../design/foundations/alignment.md#a-control-and-its-label)）。
- `SwitchThumb`：圆钮。`Switch` 默认会渲染它。

## 状态 {#states}

- **关：** `fill-muted` 轨道加墨色边框，白色圆钮在左侧。
- **开：** 带墨色边的 `brand` 贴纸，白色圆钮在右侧。深色模式下看起来一样，并加上模切边（[深色模式](../../../../../design/foundations/dark-mode.md#the-die-cut-edge)）。
- **禁用：** 通用的禁用外观，开关状态都一样（[状态](../../../../../design/foundations/states.md)）。

## 行为 {#behavior}

- 圆钮用 `ease-slide` 在 220ms 内滑过去（[动效](../../../../../design/foundations/motion.md)）。
- 把开关放在设置行的末尾（[ListRow](../list-row/list-row.md) 加 `interactive={false}`）。行本身不是按钮，对悬停和按下没有反应；焦点只落在开关上。

## 内容 {#content}

- 描述写这项设置带来的结果，不重复标题：比如 Agents can merge to main 的描述写 "Off: a person approves every merge."

## 无障碍 {#accessibility}

Switch 封装了 Base UI Switch：一个 `role="switch"` 的元素，用 `aria-checked` 表示是否打开，并带一个隐藏的原生 input 供表单使用。

- 用 `aria-labelledby` 指向行的标题来命名。
- 设置不能更改时设 `disabled`。

## 规则 {#rules}

- 尽管其他东西都是方的，开关仍保持胶囊形：人靠圆形认出开关，方形的开关不会被当成开关（[形状](../../../../../design/foundations/shape.md#principles)）。
- 开关绝不用绿色或蓝色：绿色表示完成和在线，打开的开关是黄色。
