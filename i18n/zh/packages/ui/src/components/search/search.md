---
title: Search
summary: 网页顶栏里的搜索入口，以及搜索结果的各个部分：地点和人的行、消息和消息列的命中项，按类型分组，匹配的词带标记。
sourceHash: 61f31bc7
---

# Search

搜索由一个输入框、几个筛选条件和按类型分组的结果组成。地点和人是一行行的；消息是命中项，写明谁、在哪里、什么时候，匹配的词是黄色的小贴纸。在网页上，搜索从顶栏的搜索框（`SearchTrigger`）打开；在手机上，它是「搜索」标签页，输入框在标签页的顶栏里。

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
- `SearchEntityResult`：一个频道、一个人或一个 agent。布局和 [ListRow](../list-row/list-row.md) 一样：`SearchEntityResultLeading`（一个 `SearchEntityResultIcon` 或头像，可选带一盏 `SearchEntityResultActivity` 灯），以及包含 `SearchEntityResultHeader`、`SearchEntityResultTitle` 和 `SearchEntityResultDescription` 的 `SearchEntityResultContent`。
- `SearchMessageResult`：一条消息。`SearchMessageResultHeader` 包含 `SearchMessageResultSender`（谁）、`SearchMessageResultMeta`（在哪里）、`SearchMessageResultThreadMeta`（在消息列里）和 `SearchMessageResultTimestamp`（什么时候）；`SearchMessageResultBody` 放摘录，每处匹配放在 `SearchMessageResultMatch` 里。
- `SearchThreadResult`：有多处命中的消息列：`SearchThreadResultHeader`（`SearchThreadResultMeta`、`SearchThreadResultTimestamp`、`SearchThreadResultTitle`）和 `SearchThreadResultMessages`，后者是一组 `SearchThreadMessageResult`。

```example
search/compositions/search-preview
```

## 状态 {#states}

| 状态 | 用于 |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 结果上的 `selected` | 键盘高亮：`brand-soft`，和菜单里一样（[状态](../../../../../design/foundations/states.md#usage)） |
| 菜单打开（结果上的 `data-popup-open`） | `fill-subtle`，和悬停同为浅档，让菜单所作用的结果保持标记；`selected` 的结果保持 `brand-soft`（[悬停与按下](../../../../../design/foundations/states.md#hover-and-press)） |
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
- 输入框两侧的外边距相同，等于下方内容的边距（手机上 16px）。不要为了放图标在一侧留更窄的边。
- 在网页上，从顶栏的输入框打开搜索，形式是一个 720px 宽的居中对话框，它的上边缘盖住顶栏的输入框，看起来像输入框展开成了对话框。它有遮罩，没有动画，和所有居中浮层一样（[选择组件](../../../../../design/components/overview.md#overlays)）。
- 结果按类型分组（[对话](../../../../../design/patterns/conversation.md#search)）：先是地点和人，然后是消息。
- 范围、发送者、地点和时间范围作为筛选条件放在筛选行里，每个都是选择框或组合框。
- 在侧面板里打开选中的结果（[对话](../../../../../design/patterns/conversation.md#search)）。消息列里的命中项直接打开那个消息列。
- 按下方向键把键盘高亮从输入框移到结果里，按 Enter 打开高亮的结果。

## 内容 {#content}

- 消息摘录最多 2 行，匹配的词放在 `SearchMessageResultMatch` 里。
- 无结果状态写什么没找到、怎样扩大范围："No results for “launch”"、"Try another word or remove a filter."
- 入口的占位文字写它搜索什么：Search Raft。

## 无障碍 {#accessibility}

- 这些部分通过 Base UI 的 `useRender` 渲染原生元素，不涉及任何 Base UI 基础组件。结果默认是 `button`；会跳转的结果用 `render` 传入一个链接。
- `SearchTrigger` 是一个 `button`，以它的标签命名。它打开一个 [Dialog](../dialog/dialog.md)；给对话框一个标题，给里面的输入框一个无障碍名称（`aria-label="Search"`）。
- 把输入框和筛选条件放在一个 `role="search"` 的元素里，给清除按钮加 `aria-label="Clear search"`。
- `selected` 只是视觉效果。在结果间移动键盘高亮时，焦点留在输入框上，用 `aria-activedescendant` 指向高亮的结果，或者把焦点移过去。
- 给实体的活动灯一个名称：`role="img"` 和 `aria-label="Active"`。
- `SearchMessageResultMatch` 是 `mark`，所以在支持的读屏软件里会播报匹配。
