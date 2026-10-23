---
title: EmptyState
summary: 视图没有内容时显示的东西：一个灰色图标、一个标题、一句话说明为什么是空的、该做什么，以及最多一个按钮。
sourceHash: ac972b4e
---

# EmptyState

空状态告诉人这个视图为什么没有内容，下一步该做什么。它在所有地方都是同一个样子：一个不带框的灰色图标、一个灰色标题、一句话，以及最多一个按钮。它是一个结论（「这里什么都没有」），所以绝不用来代替加载中或失败。

```example
empty-state/compositions/default
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 这里还什么都没有 | EmptyState：说明为什么是空的，以及怎样让东西出现 |
| 筛选或搜索没有匹配结果 | EmptyState：说明哪些条件在生效，配 Clear All |
| 还在加载 | [Skeleton](../skeleton/skeleton.md)，不用空状态 |
| 加载失败 | 在对应范围显示错误，配 Retry（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)） |

## 结构 {#anatomy}

- `EmptyState`：居中的根元素。必需。
- `EmptyStateContent`：把图标、标题和描述组合在一起。必需。
- `EmptyStateIcon`：一个 Lucide 图标，36px，用 `foreground-hint`。必需。
- `EmptyStateTitle`：标题，用 `foreground-muted`。必需。
- `EmptyStateDescription`：一句话，用 `foreground-hint`。其中的链接字重 600，静止时没有下划线，悬停时出现墨色下划线（[可点击的文字](../../../../../design/foundations/states.md#clickable-text)）：靠字重把它和灰色的句子区分开。
- `EmptyStateActions`：最多一个按钮。

```example
empty-state/compositions/activity-inbox
```

## 内容 {#content}

- 标题用 sentence case，陈述事实："No tasks yet"、"No tasks match these filters"（[写作](../../../../../design/content/writing.md#voice)）。
- 对于还没有内容的视图，在描述里说明内容会怎样出现在这里。
- 对于没有结果的筛选或搜索，写出哪些条件在生效，按钮标签写 Clear All。

## 无障碍 {#accessibility}

- `EmptyStateIcon` 对辅助技术隐藏（`aria-hidden`）：由标题说明什么是空的。
- 空状态是页面或面板唯一的内容时，把标题渲染成标题元素（`render`），层级按页面需要来定。

## 规则 {#rules}

- 空状态直接放在内容区正中。不要包在卡片里，不要给图标加框，也不要加贴纸：空状态是工作页面（[品牌](../../../../../design/foundations/brand.md#how-much-brand)）。
- 最多给一个按钮：32px 的墨色边框按钮（`variant="default" size="md"`），不要用粉色。
- 保持安静。空状态是提示，不是大标题：用小而淡的字，不和人接下来该按的按钮抢注意力。
