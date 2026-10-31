---
title: Search
summary: 网页顶栏里的搜索入口，以及搜索结果的各个部分：地点和人的行、消息和消息列的命中项，按类型分组，匹配的词带标记。
sourceHash: 63f28710
---

# Search

搜索由一个输入框、几个筛选条件和按类型分组的结果组成。地点和人是一行行的；消息是命中项，写明谁、在哪里、什么时候，匹配的词衬着黄色填充。在网页上，搜索从顶栏的搜索框（`SearchTrigger`）打开；在手机上，它是「搜索」标签页，输入框在标签页的顶栏里。

```example
search/compositions/search-panel
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 找一个要去的地点、人或消息 | Search |
| 在弹出层里找一个要填入的值 | 带搜索的选择框（[ComboboxSelect](../combobox-select/combobox-select.md)）或 [Combobox](../combobox/combobox.md) |
| 缩小屏幕上已有的列表 | 筛选（[选择组件](../../../../../design/components/overview.md#picking-something)） |

## 结构 {#anatomy}

### 入口 {#trigger}

- `SearchTrigger`：顶栏的搜索框。它看起来像输入框，实际是一个打开搜索对话框的按钮。和所有输入框一样，它没有悬停效果；按下时叠加中档（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)）。
  - 先是搜索图标，然后是 `SearchTriggerLabel`（占位文字 Search Raft），最右端是 `SearchTriggerShortcut`（⌘K）。空间不够时先截断标签。

```example
search/compositions/search-trigger
```

### 结果 {#results}

- `SearchShellRoot`：搜索表面，包含 `SearchShellFilters`（筛选条件那一行）和 `SearchShellViewport`（可滚动的结果）。
- `SearchResultsSummary`：关于结果的一行说明："Searching for “launch”…"。
- `SearchResultsSection`：一类结果，包含 `SearchResultsSectionHeading`（Messages 13）和 `SearchResultsList`。
- `SearchEntityResult`：一个频道、一个人或一个 Agent。布局和 [ListRow](../list-row/list-row.md) 一样：`SearchEntityResultLeading`（一个 `SearchEntityResultIcon` 或头像，可选带一盏 `SearchEntityResultActivity` 灯），以及包含 `SearchEntityResultHeader`、`SearchEntityResultTitle` 和 `SearchEntityResultDescription` 的 `SearchEntityResultContent`。它是一个列表单元格：上下都没有线，它的状态画在一个内缩的形状上（见用法）。把结果的测试 id 和 data 属性放在 `SearchEntityResult` 本身上。
- `SearchMessageResult`：一条消息。`SearchMessageResultHeader` 包含 `SearchMessageResultSender`（谁）、`SearchMessageResultMeta`（在哪里）、`SearchMessageResultThreadMeta`（在消息列里）和 `SearchMessageResultTimestamp`（什么时候）；`SearchMessageResultBody` 放摘录，每处匹配放在 `SearchMessageResultMatch` 里。
- `SearchThreadResult`：有多处命中的消息列：`SearchThreadResultHeader`（`SearchThreadResultMeta`、`SearchThreadResultTimestamp`、`SearchThreadResultTitle`）和 `SearchThreadResultMessages`，后者是一组 `SearchThreadMessageResult`。

```example
search/compositions/search-preview
```

## 状态 {#states}

| 状态 | 用于 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 结果上的 `selected` | 键盘高亮：结果内缩形状上的 `brand-soft`，和菜单里一样（[状态](../../../../../design/foundations/states.md#usage)） |
| 菜单打开（结果上的 `data-popup-open`） | 内缩形状上的 `fill-cell-hover`，和悬停用同一种填充，让菜单所作用的结果保持标记；`selected` 的结果保持 `brand-soft`（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)） |
| 实体标题和描述上的 `muted` | 这个人已经不能再发言的地方，比如已归档的频道 |
| 加载中 | 一行概要，加上与结果形状相同的骨架屏（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)） |
| 无结果 | 一个 [EmptyState](../empty-state/empty-state.md)，说明怎样扩大搜索范围 |

```example
search/compositions/search-muted-entity
```

```example
search/compositions/search-loading
```

```example
search/compositions/search-no-results
```

## 行为 {#behavior}

- 在手机上，搜索是「搜索」标签页，输入框在它的导航行里（[页面结构](../../../../../design/patterns/page-structure.md#phone)）。它的键盘、保留的状态、打开结果以及在某个地方内搜索，见[导航](../../../../../design/patterns/navigation.md#search-on-a-phone)。
- 输入框两侧的外边距相同，等于下方内容的边距：20px，也就是结果内容开始的地方，手机上也一样（`SearchShellRoot` 设置 `--column-margin`；[列表](../../../../../design/patterns/lists.md#one-edge)）。`SearchShellFilters` 用同样的边距作内边距。不要为了放图标在一侧留更窄的边。
- 在窄列表里（⌘K 对话框），命中项的标题行按顺序让出空间：先截断地点，直到完全不显示，然后是时间，这样时间不会越过形状内的 12px。发送者、消息列标记和徽标保持自己的宽度；只有这些就比列表还宽的一行，是唯一剩下的情况，目前没有哪个列表这么窄。
- 在网页上，从顶栏的输入框打开搜索，形式是一个 720px 宽的居中对话框，它的上边缘盖住顶栏的输入框，看起来像输入框展开成了对话框。它有遮罩，没有动画，和所有居中浮层一样（[选择组件](../../../../../design/components/overview.md#overlays)）。
- 结果按类型分组（[对话](../../../../../design/patterns/conversation.md#search)）：先是地点和人，然后是消息。
- 结果之间、两个消息列之间都不画线。结果是一个列表单元格（[列表](../../../../../design/patterns/lists.md)）：悬停、按下、菜单打开、键盘高亮和焦点环都画在同一个圆角形状上，和结果一样高，两侧各内缩 8px。`SearchResultsList` 和一个消息列里的消息都是列，间隔 2px，上下各留 8px，所以两个有填充的结果之间露出 2px，第一个结果在它的标题下方 8px。分节标题、概要和消息列的头部把各组分开；它们从往里 20px 的地方开始，也就是结果内容开始的地方。结果的内容从它的形状算内边距：开头和末尾都在形状内 12px，上下也是 12px，所以图标和时间都不会碰到形状（[列表](../../../../../design/patterns/lists.md#rules)）。`SearchShellViewport` 使用 8px 的列表滚动条，并公布它的宽度，这样有经典滚动条时，形状离两边仍然是 8px。
- 范围、发送者、地点和时间范围作为筛选条件放在筛选行里，每个都是选择框或组合框。
- 在侧面板里打开选中的结果（[对话](../../../../../design/patterns/conversation.md#search)）。消息列里的命中项直接打开那个消息列。
- 按下方向键把键盘高亮从输入框移到结果里，按 Enter 打开高亮的结果。

## 内容 {#content}

- 消息摘录最多 2 行，匹配的词放在 `SearchMessageResultMatch` 里。
- 匹配的词用 `you` 填充标出，保持文字本身的字重，没有边（stdrc, 2026-10-24）。命中是衬在词后面的高亮，不是一个东西，所以没有墨色边（[一块颜色就是一张贴纸](../../../../../design/principles/principles.md#3-a-block-of-color-is-a-sticker)）；加了边，它读起来就像行里「DM」或「Channel」标签旁边又多了一个徽标，还会切过下伸部分。它用完整的 `you` 黄色，不用浅色底：40% 的浅色和选中行的填充只差 ΔE 1.2，在深色模式下还发浑；完整的填充让墨色文字在两种模式下都保持 13:1。填充在字形上下各多出 1px，所以下伸部分也在里面。提及你的地方仍然是贴纸，连同它的边。
- 查询匹配用户名（handle）或频道名时，把开头的 `@` 或 `#` 也放进命中里：「@Remy」，而不是把「@」留在填充外面。
- 无结果状态写什么没找到、怎样扩大范围："No results for “launch”"、"Try another word or remove a filter."
- 入口的占位文字写它搜索什么：Search Raft。

## 无障碍 {#accessibility}

- 这些部分通过 Base UI 的 `useRender` 渲染原生元素，不涉及任何 Base UI 基础组件。结果默认是 `button`；会跳转的结果用 `render` 传入一个链接。
- `SearchTrigger` 是一个 `button`，以它的标签命名。它打开一个 [Dialog](../dialog/dialog.md)；给对话框一个标题，给里面的输入框一个无障碍名称（`aria-label="Search"`）。
- 把输入框和筛选条件放在一个 `role="search"` 的元素里，给清除按钮加 `aria-label="Clear search"`。
- `selected` 只是视觉效果。在结果间移动键盘高亮时，焦点留在输入框上，用 `aria-activedescendant` 指向高亮的结果，或者把焦点移过去。
- 给实体的活动灯一个名称：`role="img"` 和 `aria-label="Active"`。
- `SearchMessageResultMatch` 是 `mark`，所以在支持的读屏软件里会播报匹配。
