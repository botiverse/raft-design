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
| 人、Agent、频道或设置的列表 | [ListRow](../list-row/list-row.md) |
| 有人在消息里用 Markdown 写的表格 | `MarkdownTable` 部件，放在代码块的容器里（[用现有部件搭建](../../../../../design/components/overview.md#diagrams-and-markdown-tables)） |

## 结构 {#anatomy}

- `Table`：`table` 元素。它占满容器的宽度，没有外边框。必需。
- `TableCaption`：表格的名称，显示在表格下方，用 `text-caption` 和 `foreground-hint`，或用 `sr-only` 隐藏。必需，除非表格有 `aria-label`。
- `TableColgroup` 和 `TableColumn`：可选的列宽。
- `TableHeader`，内含一个由 `TableHead` 单元格组成的 `TableRow`：列标题。必需。
- `TableSortableHead`（`@botiverse/raft-ui/wip`）：能给行排序的 `TableHead`，能排序的列用它代替 `TableHead`（[排序](#sorting)）。它的文字是一个铺满单元格的按钮。
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

## 排序 {#sorting}

如果某一列的顺序有人会想换，比如用量、日期或名称，点它的列标题就按这一列给行排序。所有列标题行都用这条规则，包括不用 `Table`、自己画表头行的列表，网页和 App 都一样。

`TableSortableHead` 画的就是这样的列标题。行按哪一列、哪个方向排，留在你自己的状态里：给每一列传它的 `sort`（`"ascending"`、`"descending"`，行不按这一列排时不传），在 `onSortChange` 里更新它。

```example
table/compositions/sortable
```

- 列标题的文字做成按钮，铺满标题单元格。`aria-sort` 放在标题单元格上，不放在按钮上：行按哪一列排，那一列就是 `ascending` 或 `descending`，其他列不设。这样读屏会把方向和列名一起读出来，所以文字仍然只写列名："Memory"，不写 "Sort by memory"。不用 `Table` 自己画的表头行，要给每个标题单元格 `role="columnheader"`，外面一层是 `role="row"`，再外面是 `role="table"` 或 `role="grid"`：读屏只在这样的元素上读 `aria-sort`。
- 能排序的列标题平时和其他标题一样，是 `foreground-hint`。指针移上去时变成 `foreground`，不加底色，表头行看起来仍然是一行标签。
- 当前排序的那一列，标题是 `foreground`，文字旁边 4px 处有一个 12px 的 `arrow-down`（降序：越往下数值越小）或 `arrow-up`（升序）。其他列标题都不显示箭头，指针移上去也不显示，所以屏幕上唯一的那个箭头总是说明当前的顺序。
- 箭头放在文字后面。右对齐的列（比如数字）例外，箭头放在文字前面：这样文字仍然对齐在数字的右边缘上方。
- 点当前排序的列会把顺序反过来。点另一列就按那一列排，用它的第一个方向：数字和日期先从大到小、从新到旧，文字先从 A 到 Z。只有两个方向，第三次点击不会回到不排序：一次点击让箭头消失，看起来就像点了没反应。
- 一次只按一列排。值相同的行保持原来的先后，没有值的行（`—`，比如离线 computer 的用量）在两个方向上都排在最后：没有值不等于最小。
- 如果行一开始的顺序不是由任何一列决定的，比如按添加的先后，那么在有人点之前，哪个标题都不显示箭头。如果这个原始顺序值得回去，就把它做成一列，比如「添加时间」，而不是靠第三次点击。选好的排序在这台设备上按列表记住，回到这个页面时不会被重置。
- 在触屏上，标题按钮的点击区域高 44px，和所有控件一样（[无障碍](../../../../../design/foundations/accessibility.md#hit-targets)）。

`TableSortableHead` 根据 `sort` 设置 `aria-sort`，给文字上色，画箭头，并提供触屏点击区域。点击时它用下一个方向调用 `onSortChange`：`sort` 的反方向；行不按这一列排时，是 `firstSort`。`firstSort` 不设时是 `"ascending"`；数字和日期传 `"descending"`。右对齐的列传 `align="right"`，箭头就放在文字前面。给行本身排序（没有值的排在最后）和记住排序由你来做：这个部件看不到行。

不用 `Table` 自己画的表头行，把每个标题渲染成 `row` 里的 `columnheader`：

```tsx
<div role="table" aria-label="Computers">
  <div role="row">
    <TableSortableHead render={<div role="columnheader" />} sort={sort} onSortChange={setSort}>
      Memory
    </TableSortableHead>
  </div>
</div>
```

## 内容 {#content}

- 列标题用 sentence case：Resource、Access、Last run（[写作](../../../../../design/content/writing.md#casing)）。
- `TableCell` 不会把数字设成 Space Mono，也不会对齐数字：在单元格和对应的 `TableHead` 上都设置，让标题对齐在数字上方。`TableSortableHead` 不用类名，改传 `align="right"`，因为箭头放在哪一边取决于它。
- 表格说明用 sentence case，写出这些行是什么：Recent builds。

## 无障碍 {#accessibility}

- 这些部件渲染原生的 `table`、`caption`、`thead`、`tbody`、`tr`、`th` 和 `td` 元素，读屏软件可以按行和列移动。
- `TableHead` 会设置 `scope="col"`。行标题（`scope="row"`）可以用，但没有专门的样式。
- `TableSortableHead` 也设置 `scope="col"`，只在行按它这一列排序时，才在标题单元格上设置 `aria-sort`。它的文字是一个原生 `button`，名称只是列名；箭头是 `aria-hidden`，方向从 `aria-sort` 读出。用 `render` 时，渲染出来的元素保留 `aria-sort`，所以要给它 `role="columnheader"`（[排序](#sorting)）。
- 每个表格都用 `TableCaption` 命名，可见或 `sr-only` 都行。只有在不能有说明时，才在 `Table` 上用 `aria-label`。
- 单元格里控件的名称要包含它所在的行："Access for Messages"。

## 规则 {#rules}

- 即使设计稿上没有表头行，也要保留：用 `sr-only` 隐藏。没有它，各列就没有名称了。
- 不要加竖线、外边框或表头填充。组合组件不增加新的线条或颜色（[用现有部件搭建](../../../../../design/components/overview.md#built-from-existing-parts)）。
