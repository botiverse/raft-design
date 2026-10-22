---
title: Table
summary: 用原生表格元素排列的行列数据，用于少数需要分列的地方，比如用量、账单和权限。
sourceHash: 2935497b
---

# Table

表格把数据排成行和列，有一行表头，行与行之间是细线。只在数据需要按列上下比较时使用，比如用量、账单或一个应用的权限。其他情况用 [DescriptionList](../description-list/description-list.md) 或 [ListRow](../list-row/list-row.md) 行更好读（[用现有部件搭建](../../../../../design/components/overview.md#tables)）。

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 按列比较的数值：每月用量、发票、每项资源的访问权限 | Table |
| 一个条目的属性：Status、Assignee、Created by | [DescriptionList](../description-list/description-list.md) |
| 人、agent、频道或设置的列表 | [ListRow](../list-row/list-row.md) |
| 有人在消息里用 Markdown 写的表格 | `MarkdownTable` 部件，放在代码块的容器里（[用现有部件搭建](../../../../../design/components/overview.md#diagrams-and-markdown-tables)） |

## 结构 {#anatomy}

- `Table`：`table` 元素。它占满容器的宽度，没有外边框。必需。
- `TableCaption`：表格的名称，显示在表格下方，用 `text-caption` 和 `foreground-hint`，或用 `sr-only` 隐藏。必需，除非表格有 `aria-label`。
- `TableColgroup` 和 `TableColumn`：可选的列宽。
- `TableHeader`，内含一个由 `TableHead` 单元格组成的 `TableRow`：列标题。必需。
- `TableBody`，每行一个由 `TableCell` 组成的 `TableRow`。必需。

表头的字体、行间的线以及数字的排法见[用现有部件搭建 › 表格](../../../../../design/components/overview.md#tables)。`Table` 负责画表头和线；最后一行下面没有线。

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 悬停、按下 | 悬停时行上叠一层 `fill-subtle`（浅档），按下时叠 `fill-medium`；选中的行保持 `info-soft`（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)） |
| 菜单打开（`TableRow` 或其中的按钮上有 `data-popup-open`） | `fill-subtle`，与悬停同为浅档，这样菜单所作用的那一行保持标出；选中的行保持 `info-soft`（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)） |
| 选中（`TableRow` 上有 `aria-selected` 或 `data-selected="true"`） | `info-soft`：选中的行就是选中的内容 |

## 行为 {#behavior}

- 列宽随内容而定。如果内容会让列宽跳动（数值会变、行陆续加载），给 `Table` 加上 `table-fixed` 类，并用 `TableColgroup` 和 `TableColumn` 设定宽度。
- 单元格里的文字可以在任意字符处换行，这样没有空格的 ID 或名字会在本列内折行，而不是把表格撑出容器。
- 单元格内容顶部对齐，这样某一行有 2 行描述时，其他值仍在第一行。

## 内容 {#content}

- 列标题用 sentence case：Resource、Access、Last run（[写作](../../../../../design/content/writing.md#casing)）。
- `TableCell` 不会把数字设成 Space Mono，也不会对齐数字：在单元格和对应的 `TableHead` 上都设置，让标题对齐在数字上方。
- 表格说明用 sentence case，写出这些行是什么：Recent builds。

## 无障碍 {#accessibility}

- 这些部件渲染原生的 `table`、`caption`、`thead`、`tbody`、`tr`、`th` 和 `td` 元素，读屏软件可以按行和列移动。
- `TableHead` 会设置 `scope="col"`。行标题（`scope="row"`）可以用，但没有专门的样式。
- 每个表格都用 `TableCaption` 命名，可见或 `sr-only` 都行。只有在不能有说明时，才在 `Table` 上用 `aria-label`。
- 单元格里控件的名称要包含它所在的行："Access for Messages"。

## 规则 {#rules}

- 即使设计稿上没有表头行，也要保留：用 `sr-only` 隐藏。没有它，各列就没有名称了。
- 不要加竖线、外边框或表头填充。组合组件不增加新的线条或颜色（[用现有部件搭建](../../../../../design/components/overview.md#built-from-existing-parts)）。
