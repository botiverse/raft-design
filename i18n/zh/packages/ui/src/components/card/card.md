---
title: Card
summary: 带细线轮廓的白色容器，在页面上把一个主题归在一起（标题栏里有标题和描述，下面是内容和页脚），或在表单里做成一个可选的选项。
sourceHash: 836cf46c
---

# Card

卡片把页面上的一个主题归在一起：一个标题和一行描述、属于它的内容，以及可选的页脚说明。它平铺在页面上，用 `layer-card`，`line-hairline` 轮廓，`radius-container` 圆角，没有阴影。它的 `option` 变体是表单里的一个可选项。

```example
card/compositions/project-summary
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 页面上的一个主题，有标题和自己的内容或控件 | Card |
| 一个开启某项功能的设置，下面是它的配置 | Card，`variant="inset"` |
| 表单里从几个选项中选择，每个选项是一块 | Card，`variant="option"`，里面放一个 [Checkbox](../checkbox/checkbox.md) 或单选按钮 |
| 一组行：设置、成员、agent | `ListRowGroup`（[ListRow](../list-row/list-row.md)） |
| 一个项目的属性，标签和值 | [DescriptionList](../description-list/description-list.md) |
| 大表单的一部分 | [FormSection](../form-section/form-section.md) |
| 主区域的一栏 | [Panel](../panel/panel.md) |
| 一个任务、消息上的一个文件、悬停时显示的一个人 | [TaskCard](../task-card/task-card.md)、[MessageAttachment](../message-attachment/message-attachment.md)、[PreviewCard](../preview-card/preview-card.md) |

## 结构 {#anatomy}

- `Card`：容器。必需。
- `CardHeader`：顶部一行，用网格排列下面这些部分。
  - `CardLeading`：标题前的图标、头像或开关，跨标题和描述两行。可选。
  - `CardTitle`：标题。可选，但大多数卡片都有。
  - `CardTrailing`：标题行末尾的状态、徽标或开关。可选。
  - `CardDescription`：标题下的一行，用 `text-callout` 和 `foreground-muted`。可选。
- `CardContent`：正文。可选。
- `CardFooter`：一条补充说明或一个链接，用 `text-caption` 和 `foreground-hint`，上方有一条细线。可选。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `variant="default"` | 单独的一张卡片，或里面东西不多的卡片 |
| `variant="inset"` | 里面有很多控件或嵌套组件的卡片：一条细线把标题栏和每个 `CardContent` 隔开 |
| `variant="option"` | 表单里的一个选项：`radius-control` 圆角、字段的边框（1.5px `line-field`），标题与字段标签同样大小，这样它不会盖过上方的标签 |

```example
card/compositions/workspace-mode
```

```example
card/compositions/dense-settings
```

```example
checkbox/compositions/selection
```

## 内容 {#content}

- 标题用 sentence case（句首大写）：Release readiness（[写作](../../../../../design/content/writing.md#casing)）。
- 描述写一行，说明这张卡片是做什么的，或现在处于什么状况。
- 页脚用来写关于整张卡片的说明，比如去哪里了解更多。针对整张卡片的操作放在 `CardContent` 末尾，不要放在页脚。

## 无障碍 {#accessibility}

Card 渲染一个 `div`，不附加任何语义。

- 用 `render` 把 `CardTitle` 渲染成页面需要的那一级标题：`render={<h3 />}`。
- 当 `CardLeading` 或 `CardTrailing` 里的 `Switch` 或 `Checkbox` 以标题为名称时，给标题一个 `id`，把控件的 `aria-labelledby` 指向它。
- 对 `option` 卡片，把整张卡片渲染成 `label`（`render={<label />}`），这样点击卡片上任何地方都能切换控件。

## 规则 {#rules}

- 卡片保持平铺。只有浮起来的东西才有阴影（[层级](../../../../../design/foundations/elevation.md)）；展开的评论卡片是浮起的（[Comment](../comment/comment.md)）。
- 不要在卡片里套卡片。一个分区里的操作就是普通的一行，描述在左，按钮在右（[表单](../../../../../design/patterns/forms.md#the-large-form-dialog)）。
- 卡片里的每条线都用 `line-hairline`；那是内容，不是区域（[颜色](../../../../../design/foundations/color.md#lines)）。
- 不要在卡片边缘贴进度条或彩色条带（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)）。
- 卡片里的开关立即生效，不需要 Save 按钮（[表单](../../../../../design/patterns/forms.md#settings-that-apply-at-once)）。
