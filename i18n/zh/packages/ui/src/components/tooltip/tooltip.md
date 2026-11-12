---
title: Tooltip
summary: 悬停或键盘聚焦时出现的一行文字，给没有可见标签的东西说明名称、后果或快捷键。
sourceHash: 6792be8c
---

# Tooltip

工具提示（Tooltip）是悬停或键盘聚焦时出现的一行文字，给没有可见标签的东西说明名称、后果或键盘快捷键。图标按钮、被截断的名字、运行时标签片和桌面端导航条上的各项都用它。

## 何时使用 {#when-to-use}

| 情况                                                                     | 用                                                                                    |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 图标按钮、被截断的名字、运行时标签片（"Runs on Martin's MacBook"） | Tooltip                                                                                |
| 桌面端导航条上的一项                                                   | 右侧的 Tooltip，写目的地的名称（[AppRail](../app-rail/app-rail.md)） |
| 控件上已经能看到的标签                                | 不用：不要在工具提示里重复它                                  |
| 带链接或按钮的内容                                               | [Popover](../popover/popover.md)                                                       |
| 一个人或一个 Agent                                                          | [PreviewCard](../preview-card/preview-card.md)                                         |

## 结构 {#anatomy}

- `TooltipProvider`：为其中的工具提示设置打开延迟。在 raft-ui 里它们没有延迟，立即打开。
- `Tooltip`：根元素。必需。
- `TooltipTrigger`：工具提示所描述的元素。必需。
- `TooltipContent`：工具提示本身，带一个指向触发元素的小箭头。里面可以放一个前置图标和一个表示快捷键的 `Kbd`。必需。
- `TooltipPortal`：一个更底层的部件。

工具提示用 `layer-hud`，文字用 `foreground-on-hud`，和轻提示（Toast）一样（[颜色](../../../../../design/foundations/color.md#surfaces)）。

## 行为 {#behavior}

- 它在触发元素上方打开，水平居中；上方没有空间时翻到下方。
- 上方的空间到窗口自己的控件为止。桌面端外壳在页面顶部之上绘制标题栏按钮时，会在根元素上把这条带的高度设为 `--raft-frame-inset-top`；会打开到这条带里的工具提示翻到下方，在触发元素旁边的则向下移出这条带。Web 端不设置它。
- 碰到 `--raft-frame-inset-start` 和 `--raft-frame-inset-end` 时也一样往反方向弹：折叠屏手机系统竖列里某一项的提示朝内容打开（[页面结构](../../../../../design/patterns/page-structure.md#frame-insets)）。
- `side="right"` 把它放在触发元素旁边，如在导航条上；`side="bottom"` 把它放在触发元素下方。
- 它在 20rem 处换行，或者在窗口剩余空间处换行。
- 鼠标指针离开、焦点离开或按 Esc 时关闭。

## 内容 {#content}

- 写一个名称或一句短句，用 sentence case：Search、Runs on Martin's MacBook。
- 工具提示里的用词与触发元素的 `aria-label` 相同。
- 快捷键放在文字后面，一键一帽：用键名写的 `sm` 的 `KbdShortcut`，在 Mac 上画成 ⌘ K，其他系统画成 Ctrl K（[Kbd](../kbd/kbd.md)）。
- 禁用控件的工具提示还要说明怎样才能用上它（读者能做的那一步，或者谁能做；不写 Raft 的内部原因，见[写作](../../../../../design/content/writing.md#principles)），并且第一行是控件的名字（触发元素上它的标签被截短了）时，把这一步放在第二行，用 `foreground-on-hud-muted`，在名字下方 4px：先是名字，再是那一步。只有这一步时，它就是工具提示唯一的一行，用工具提示自己的文字颜色。

## 无障碍 {#accessibility}

- Tooltip 封装了 Base UI 的 Tooltip。它提供 `tooltip` 角色，在悬停和键盘聚焦时打开。
- 工具提示是对名称的补充，不能代替名称。每个只有图标的按钮都要有自己的 `aria-label`。
- 触屏没有悬停。在长按时显示工具提示，或者直接在界面里写出说明。
- 行按钮里的标签上的工具提示，只有鼠标够得着。把它那句话作为视觉隐藏文字放进标签里，让它成为行的名称的一部分，工具提示保留作为补充（[无障碍](../../../../../design/foundations/accessibility.md#focus-and-keyboard)）。

## 规则 {#rules}

- 不要在工具提示里放链接、按钮或任何需要人去操作的东西：鼠标指针够不着它。
