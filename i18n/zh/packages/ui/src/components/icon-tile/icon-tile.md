---
title: IconTile
summary: 一个放图标的中性方块，尺寸与头像相同，用于没有面孔的地方或东西：频道、系统提示、文件、应用、计算机。
sourceHash: 119ab8b8
---

# IconTile

IconTile 是一个放着一个图标的中性方块。频道是一个地方，不是某个人，所以在列表里它是一个中性的 `#` 方块，而不是头像；其他没有身份的东西（系统提示、文件、应用、计算机、某一类搜索结果）也用同样的方块，配上各自的图标。方块使用头像的尺寸，所以能放在头像所在的位置。

```example
icon-tile/compositions/sizes
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 列表、搜索结果或引用里的频道 | 带 `hash` 图标的 IconTile |
| 系统提示、文件、应用、计算机、某一类搜索结果 | 带对应图标的 IconTile |
| 通知中心里的错误、警告或消息 | 带 `variant="warning"` 或 `variant="information"` 的 IconTile |
| 人所在的地方，放在它的标题旁边 | 黄色的位置图块 `PanelHeaderIcon`（[Panel](../panel/panel.md)） |
| 桌面端侧边栏行里的频道 | 不带方块的裸图标 `SidebarItemChannelIcon`（[Sidebar](../sidebar/sidebar.md)） |
| agent 或人 | [Avatar](../avatar/avatar.md) |

## 结构 {#anatomy}

- `IconTile`：方块本身。里面放一个 Lucide 图标，并把图标调整到合适的尺寸（[图标](../../../../../design/foundations/iconography.md#sizes)）。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `variant="default"` | 所有情况：频道、文件、应用、计算机、提示。`fill-muted` 方块，`foreground-muted` 图标，没有边框 |
| `variant="warning"` | 通知中心里的错误或警告：`warning-soft`，墨色图标 |
| `variant="information"` | 通知中心里的消息：`info-soft`，墨色图标 |

```example
icon-tile/compositions/variants
```

| `size` | 用于 |
| --- | --- |
| `xs`（19px） | 紧凑的行，放在 19px 头像旁边 |
| `sm`（27px） | 放在 27px 头像旁边，比如搜索结果；操作卡片的图标 |
| `md`（35px） | 列表和搜索结果；默认值 |
| `lg`（51px） | 个人资料页的头部 |

## 无障碍 {#accessibility}

IconTile 渲染一个 `<span>`，不封装任何 Base UI 原语。

- 方块旁边有文字时只起装饰作用，所以默认对辅助技术隐藏。
- 如果方块本身有含义（比如表示频道的类型，旁边没有文字），给它加 `role="img"` 和 `aria-label`，这样读屏软件会读出它。

## 规则 {#rules}

- 不要给频道配颜色：频道是一个地方，不是一个身份。
- 每个屏幕最多一个黄色位置图块，放在人所在地方的标题旁边。在列表里，当前项是选中的那一行，而不是黄色方块（[状态](../../../../../design/foundations/states.md#usage)）。
- `warning` 和 `information` 只用于系统提示。其他地方的方块都是中性色。
- 方块放在同一行里头像该在的位置，尺寸相同，让方块和头像排成一列。
