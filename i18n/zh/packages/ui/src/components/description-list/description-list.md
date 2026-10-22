---
title: DescriptionList
summary: 关于一个对象的一组信息，每条是一对标签和值，例如任务的 Status、Assignee 和 Created by；可以更改的值会打开一个选择器。
sourceHash: a4fdbc8a
---

# DescriptionList

DescriptionList 展示关于一个对象的几条信息，每条由标签和值组成：任务的 Status、Assignee 和 Created by，或者 agent 的运行时和计算机。可以更改的值在原地打开选择器。

```example
description-list/compositions/member-info
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 关于一个对象的几条信息，放在一起读 | DescriptionList |
| 在原地更改对象的某个属性 | DescriptionList 中的值打开一个选择器（[选择组件](../../../../../design/components/overview.md#picking-something)） |
| 任务详情里的属性行 | DescriptionList；见[用现有部件搭建](../../../../../design/components/overview.md#task-details) |
| 授权请求的权限 | 对话框里的 DescriptionList（[用现有部件搭建](../../../../../design/components/overview.md#authorization-oauth)） |
| 很多列相同的对象 | [ListRow](../list-row/list-row.md) 行，必须是表格时用表格（[用现有部件搭建](../../../../../design/components/overview.md#tables)） |
| 按顺序列出这个对象发生过什么 | [Timeline](../timeline/timeline.md) |

## 结构 {#anatomy}

- `DescriptionList`：列表本身。必需。
- `DescriptionItem`：一条信息。必需，每条信息一个。
  - `DescriptionTerm`：标签。文字后面可以放一个小的帮助按钮。
  - `DescriptionDetails`：值。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `direction="horizontal"` | 两列排列的信息，标签在左。宽度小于 640px 时自动叠成一列 |
| `direction="vertical"` | 标签在值上方的信息，用在侧面板这类窄的地方 |
| `direction="inline"` | 一行里放几条简短的信息，每个标签挨着它的值，放不下时换到下一行：任务的属性 |

```example
description-list/compositions/horizontal
```

### 行内 {#inline}

`direction="inline"` 把这些信息像一行文字那样排开。所有标签和值都落在同一条基线上，所以状态标签、按钮和纯文本读起来是一行；标签与值相距 12px，信息之间相距 24px，换行时行与行之间留 8px。

每条信息都按同样的方式排布，不管它的值是什么：只有在这一行放不下时才换到下一行，间隔和其他信息一样是 24px 和 8px。一条信息最宽 24rem，如果整行比这更窄，就以整行宽度为限。长的值，比如任务来源的那条消息，放进 [Ellipsis](../ellipsis/ellipsis.md)：它在这个宽度处截断文字，悬停时显示全文。列表只限制宽度，不截断文字，所以没有放进 Ellipsis 的纯文本会在 24rem 内换行。不要给长的值单独一行、整行宽度或别的间隔。这是密集元数据（比如任务的属性）的布局：两列网格（`direction="horizontal"`）让每条信息各占一行，几条简短的信息就要占满一屏的高度，而且在手机上反正也会叠成一列。

画在形状里的值，把它的内边距伸进 12px 的间隔里，这样它的文字起点与纯文本相同，填充向外延伸（[对齐](../../../../../design/foundations/alignment.md#a-shape-beside-plain-text)）。当 Badge（6px）、TaskChip 或 TaskStatusBadge（7px）或 Button 是 `DescriptionDetails` 中的第一个元素时，raft-ui 会自动这样处理；Button 改用 Badge 的 6px 内边距来适配。其他形状，或被包在别的元素里的形状，需要调用方自己做同样的偏移：负的左外边距，大小等于它的左内边距，并把它的 `max-width` 加大同样的量。

```example
description-list/compositions/inline
```

## 行为 {#behavior}

- 可以更改的值做成没有外框的触发器：悬停和按下时显示中档的叠加层，并打开 [Select](../select/select.md) 或组合框的弹出层。
- 可以设置但为空的值，写成设置它的操作：Add to a Channel。

raft-ui 还没有无外框的值触发器；member-info 组合用的是渲染成按钮的 [Badge](../badge/badge.md)。

## 内容 {#content}

- 标签写成简短的名词，用 sentence case（句首大写）：Status、Assignee、Created by。
- 值用现有部件搭建：状态标签（[Status](../status/status.md)）、头像加名字（[Avatar](../avatar/avatar.md)）、引用标签片、运行时标签片。ID 和时间用 Space Mono（[字体排印](../../../../../design/foundations/typography.md#usage)）。
- 用显示名称称呼人和 agent（[写作](../../../../../design/content/writing.md#voice)）。

## 无障碍 {#accessibility}

- 这些部件通过 Base UI 的 `useRender` 渲染成原生的 `dl`、`div`、`dt` 和 `dd`，所以读屏软件会把每个标签和它的值配对。
- 打开选择器的值是一个按钮。给它一个说明它改什么的无障碍名称：`aria-label="Change status from In Progress"`。
- 标签里的帮助按钮要有 `aria-label`：`aria-label="Explain member roles"`。

## 规则 {#rules}

- 不能更改的信息不要做得像能点：不要 V 形箭头，不要悬停效果，不要按钮。
- 在 `direction="inline"` 里，所有信息用同一种布局：不让某条信息单独占一行，也不给它单独的宽度或间隔。长的值在信息 24rem 的上限处用省略号截断，并在别处提供完整的值（它的工具提示，或它链接到的地方）。
