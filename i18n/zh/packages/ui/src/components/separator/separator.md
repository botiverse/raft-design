---
title: Separator
summary: 同一区域内各组内容之间的 1px 细线，可横可竖；横向的中间可以放一个词。
sourceHash: 6a69ab96
---

# Separator

分隔线是同一区域内两组内容之间的一条 1px `line-hairline`：两组设置之间，或一行里的两个控件之间。横向分隔线中间可以带一个短词，给它后面那一组命名，比如 Actions。区域之间的线不是分隔线，它们属于区域本身（[页面结构](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)）。

```example
separator/compositions/horizontal
```

## 何时使用 {#when-to-use}

| 场景 | 用 |
| --- | --- |
| 一个区域内的两组内容 | Separator |
| 固定高度的一行里的两组控件 | `orientation="vertical"` 的 Separator |
| 一组内容前带名称的分隔 | 带一个词的 Separator：Actions |
| 菜单、选择列表或弹出层的分节 | 组件自带的分隔线：`DropdownMenuSeparator`、`SelectSeparator`、`PopoverSeparator` |
| 列表的各行 | 列表自带的分割线（[ListRow](../list-row/list-row.md)） |
| 标题栏和内容、导航条和侧栏、两栏之间 | 区域自己画的 `line-seam`（[颜色](../../../../../design/foundations/color.md#lines)） |
| 大型表单的各节 | [FormSection](../form-section/form-section.md)，它自己画细线 |

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `orientation="horizontal"`（默认） | 上下堆叠的分组。占满整个宽度 |
| `orientation="vertical"` | 一行里并排的分组。高度等于行高，所以这一行需要固定高度 |
| 横向，带子元素 | 两段线之间的一个词，用 `text-footnote`、半粗体、`foreground-hint` |

## 内容 {#content}

- 词要短，用 sentence case：Actions。

## 无障碍 {#accessibility}

- Separator 封装了 Base UI 的 Separator，它提供 `separator` 角色和方向。
- 词两侧的两段线对辅助技术隐藏；词会被读出。

## 规则 {#rules}

- 分隔线只用 `line-hairline`。不要把它改成接缝线或强线：每种线都有自己的含义（[颜色](../../../../../design/foundations/color.md#lines)）。
- 不要紧挨着区域自身的边缘画分隔线。两条并排的 1px 线看起来像一条 2px 的线（[页面结构](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)）。
