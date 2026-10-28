---
title: AppShell
summary: 应用的最外层布局，有放导航条、侧栏、主区域、侧面板和浮层的插槽，宽度低于 768px 时切换为单列加底部标签栏。
sourceHash: e2f481c1
---

# AppShell

AppShell 负责摆放应用界面的各个区域：桌面端从左到右是导航条、侧栏、主区域和侧面板；低于 768px 时只有主区域，下方是标签栏。插槽只管位置。每个区域长什么样，由放在里面的组件决定。一个界面有哪些区域、随宽度怎么变化，见[页面结构](../../../../../design/patterns/page-structure.md)和[响应式布局](../../../../../design/patterns/responsive.md)。

```example
app-shell/compositions/responsive
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 应用界面的外层框架 | AppShell |
| 一个有头部、主体和底部的独立区域 | [Panel](../panel/panel.md)，放在插槽里 |
| 可以拖动调整的分栏 | [Resizable](../resizable/resizable.md)，插槽放在它的面板里 |
| 桌面端的目的地 | [AppRail](../app-rail/app-rail.md)，放在 `AppShellRailSlot` 里 |
| 手机上的目的地 | [MobileNav](../mobile-nav/mobile-nav.md)，放在 `AppShellMainSlot` 之后 |

## 结构 {#anatomy}

- `AppShellRoot`：框架，在 `layer-canvas` 上。768px 及以上是横排，以下是竖排。必需。
- `AppShellRailSlot`：放 [AppRail](../app-rail/app-rail.md) 的 `aside`。低于 768px 时隐藏。
- `AppShellSidebarSlot`：放 [Sidebar](../sidebar/sidebar.md) 的 `aside`。低于 768px 时隐藏。
- `AppShellMainSlot`：`main` 元素，放主区域。手机上唯一显示的插槽。必需。
- `AppShellPanelSlot`：放主区域旁侧面板的 `aside`。低于 768px 时隐藏。
- `AppShellOverlaySlot`：盖在主区域上而不改变分栏，用于覆盖在主区域上的侧面板。把它放在带 `overlay` 的 `AppShellMainSlot` 里。
- `AppShellSidebarTrigger`：收起和展开侧栏的按钮。它是用在主区域面板头部的 `PanelAction`；要放进导航条（产品就放在这里），就把它渲染成 `AppRailItem`（[导航](../../../../../design/patterns/navigation.md#collapsing-the-sidebar)）。

插槽是位置标记，不要求是直接子元素：插槽可以放在 `ResizablePanel` 里面。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 默认 | 桌面端上一直显示的侧栏 |
| `AppShellRoot` 上的 `sidebarCollapsible` | 可以隐藏、把整个宽度让给主区域的侧栏 |

```example
app-shell/compositions/collapsible-sidebar
```

在导航条里，触发按钮是底部的第一项，它的工具提示显示快捷键：

```example
app-shell/compositions/rail-trigger
```

## 行为 {#behavior}

- 低于 768px 时，导航条、侧栏和面板插槽隐藏。主插槽显示当前打开的页面，可能是列表、会话或消息列；显示哪个由应用的路由决定（[响应式布局](../../../../../design/patterns/responsive.md)）。
- 把 `MobileNav` 放在根元素里、主插槽之后，只在低于 768px 时显示，这样它位于这一列的底部。

```example
app-shell/compositions/mobile-root
```

- 根元素为其中的区域设置标题栏高度：56px，窗口高度低于 600px 时为 48px（[间距](../../../../../design/foundations/spacing.md#heights)）。
- 根元素裁掉溢出的内容而不是滚动，所以移动焦点不会让整个应用左右偏移。
- 在手机上，根元素顶部留出状态栏安全区的内边距。
- 收起和展开侧栏都立刻切换，没有滑动或淡入淡出，无论是用开关按钮还是拖过尽头（[动效](../../../../../design/foundations/motion.md#usage)）。
- 主区域没有 z-index，所以不会盖住应用自己的固定层，比如 z-40 的某个栏。展开的侧栏叠在主区域上方一点，这样伸出边缘的调整大小手柄仍然能抓到。
- 打开状态由应用保存：传入 `sidebarOpen` 和 `onSidebarOpenChange`，并按设备记住这个值，让侧栏恢复成离开时的样子。
- 外壳会测量侧栏的宽度，所以可收起的侧栏也可以调整大小。

## 无障碍 {#accessibility}

- 插槽渲染为地标（landmark）：主区域是 `main`，其他是 `aside`。给里面的导航命名：在导航条的 `nav` 和 `MobileNavRoot` 上设 `aria-label`。
- `AppShellSidebarTrigger` 是展开/收起（disclosure）按钮：`aria-expanded` 表示侧栏是否显示，`aria-controls` 指向侧栏插槽（插槽自己的 `id`，或外壳给它的 id）。它显示和隐藏一个区域，所以不是带 `aria-pressed` 的切换按钮。外壳给它的标签是「Collapse Sidebar」或「Expand Sidebar」，同样的文字也作为原生 `title`；把它包进 [Tooltip](../tooltip/tooltip.md) 时，传入 `title={undefined}`，并在工具提示里重复这个标签。内置标签是英文：要翻译，就传入自己的 `aria-label`（它会覆盖外壳的标签），并在工具提示里用同样的文字。只传入图标，并对辅助技术隐藏。根元素不是 `sidebarCollapsible` 时它什么也不渲染，低于 768px 时它隐藏。
- 收起的侧栏是 `inert`：里面的控件退出 Tab 顺序和无障碍树，也不响应鼠标指针。焦点在侧栏里时，如果用快捷键收起侧栏，会先把焦点移到触发按钮上，这样焦点永远不会丢失。

## 规则 {#rules}

- 每个应用界面都用 AppShell 搭建。不要用 `div` 重新搭框架，因为插槽带着断点、地标和标题栏高度。
- 不要在插槽上设背景、边框、宽度或阴影。把它们放在里面的组件上：带 `edge="attached"` 的 [Panel](../panel/panel.md) 会画出它和前一个区域之间的那一条线（[页面结构](../../../../../design/patterns/page-structure.md#one-line-between-two-regions)）。
- 一个界面只有一个 `AppShellMainSlot`。
- 只有当 `AppShellMainSlot` 里有 `AppShellOverlaySlot` 时，才在它上面设 `overlay`。
