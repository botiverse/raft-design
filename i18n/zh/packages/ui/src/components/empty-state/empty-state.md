---
title: EmptyState
summary: 视图没有内容时显示的东西：一个灰色图标、一个标题、只在有出路或者有要说的后果时才加一句说明，以及最多一个按钮。
sourceHash: 10b827e3
---

# EmptyState

空状态告诉人这个视图没有内容。它在所有地方都是同一个样子：一个不带框的灰色图标、一个灰色标题、只在有出路或者有标题没说到的后果时才加一句说明，以及最多一个按钮。它是一个结论（「这里什么都没有」），所以绝不用来代替加载中或失败。

```example
empty-state/compositions/default
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 这里还什么都没有 | EmptyState：说明为什么是空的，以及怎样让东西出现 |
| 筛选或搜索没有匹配结果 | EmptyState：说明哪些条件在生效，配 Clear all |
| 还在加载 | [Skeleton](../skeleton/skeleton.md)，不用空状态 |
| 加载失败 | 在对应范围显示错误，配 Retry（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)） |

## 结构 {#anatomy}

- `EmptyState`：居中的根元素。必需。
- `EmptyStateContent`：把图标、标题和描述组合在一起。必需。
- `EmptyStateIcon`：一个 Lucide 图标，36px，用 `foreground-hint`。必需。
- `EmptyStateTitle`：标题，用 `foreground-muted`。必需。
- `EmptyStateDescription`：一句辅助文字，用 `foreground-hint`。它只接受一个 `HelperText`，用 `helperText(content, { why, about })` 做出来，它的 `why` 和 `about` 渲染为 `data-why` 和 `data-about`；只用于后果（`consequence`）、谁能看到或影响到谁（`audience`），或怎样恢复（`recovery`）（[写作 › 辅助文字](../../../../../design/content/writing.md#helper-text)）。其中的链接字重 600，静止时没有下划线，悬停时出现墨色下划线（[可点击的文字](../../../../../design/foundations/states.md#clickable-text)）：靠字重把它和灰色的句子区分开。
- `EmptyStateActions`：最多一个按钮。

```example
empty-state/compositions/activity-inbox
```

## 内容 {#content}

- 标题用 sentence case，陈述事实："No tasks yet"、"No tasks match these filters"（[写作](../../../../../design/content/writing.md#voice)）。
- 只有当这个视图有出路（"Try another query or remove one of the active filters"，`recovery`）或者有标题没说到的后果时，才给它写描述。还没有内容的视图只用标题：说明内容会怎样出现在这里的一句（"Conversations you start will show up here"）要删掉。
- 对于没有结果的筛选或搜索，写出哪些条件在生效，按钮标签写 Clear all。

## 无障碍 {#accessibility}

- `EmptyStateIcon` 对辅助技术隐藏（`aria-hidden`）：由标题说明什么是空的。
- 空状态是页面或面板唯一的内容时，把标题渲染成标题元素（`render`），层级按页面需要来定。

## 规则 {#rules}

- 空状态直接放在内容区正中。不要包在卡片里，不要给图标加框，也不要加贴纸：空状态是工作页面（[品牌](../../../../../design/foundations/brand.md#how-much-brand)）。
- 最多给一个按钮：32px 的墨色边框按钮（`variant="default" size="md"`），不要用粉色。
- 保持安静。空状态是提示，不是大标题：用小而淡的字，不和人接下来该按的按钮抢注意力。
