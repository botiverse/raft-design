---
title: NotificationCenter
summary: 从铃铛打开的列表，保存整个服务器的状态（计算机离线、配额快满、有更新），直到状态改变。
sourceHash: f15eef2e
---

# NotificationCenter

NotificationCenter 是从铃铛打开的列表。它保存整个服务器的状态（计算机离线、配额快满、有更新），每条提示一直保留到情况改变。铃铛上的提醒圆点表示有未读内容。

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 影响整个服务器的问题或变化 | NotificationCenter |
| 别处发生了这个人应该看到的事 | 动态（[ActivityInbox](../activity-inbox/activity-inbox.md)） |
| 某个面板里有东西失败了 | 面板标题栏下方的 `PanelNotice`（[Panel](../panel/panel.md)） |
| 这个人所做操作的结果 | [Toast](../toast/toast.md) |

按范围区分的错误见[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)。各产品把铃铛放在哪里，见该产品自己的页面。

## 结构 {#anatomy}

- `NotificationCenter`：根组件。一个非模态的弹出层。
- `NotificationCenterTrigger`：铃铛。默认会画出铃铛和提醒圆点。
- `NotificationCenterPopup`：列表的弹出层，在铃铛旁边。
  - `NotificationCenterHeader`：`NotificationCenterTitle`（Notifications）和 `NotificationCenterCount`。
  - `NotificationCenterScroller` 和 `NotificationCenterList`：提示列表。
  - `NotificationCenterEmptyState`：列表为空时显示的内容（[EmptyState](../empty-state/empty-state.md)）。
- `NotificationCenterItem`：一条提示，放在 `NotificationCenterItemRow` 里：
  - `NotificationCenterItemIcon`：带图标的方块。系统发出的提示没有「谁」，所以在头像的位置放一个方块（[InboxItem](../inbox-item/inbox-item.md#rules)）。
  - `NotificationCenterItemContent`：`NotificationCenterItemTitle`、`NotificationCenterItemBody`，以及包含若干 `NotificationCenterActionButton` 的 `NotificationCenterItemActions`。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 图标上的 `status="error"` | 某个东西停止工作了：计算机离线、Agent 无法启动。`warning-soft` 方块，`octagon-alert` 图标 |
| `status="warning"` | 某个东西快要停止工作：配额快满、密钥即将过期。`warning-soft` 方块，`triangle-alert` 图标 |
| `status="info"` | 消息：有更新。`info-soft` 方块，`info` 图标 |
| 弹出层上的 `viewport="mobile"` | 手机上的弹出层：屏幕宽度减去两侧各 8px，与屏幕边缘保持 8px |
| 弹出层上的 `size` | 弹出层的高度：`sm`、`md` 或 `lg` |

## 状态 {#states}

| 状态 | 外观 |
| --- | --- |
| 未读（默认） | 标题用 `foreground`，字重 700，右侧有粉色提醒圆点 |
| `read` | 标题用 `foreground-muted`，字重 600；没有圆点 |

## 行为 {#behavior}

- 按严重程度排序提示：错误在前，然后是警告，然后是信息。
- 这个人关掉一条提示后，在情况改变之前不要再显示它。
- 只在有未读提示时显示铃铛上的提醒圆点。默认的触发按钮总是画出圆点，所以没有未读时，只把铃铛作为触发按钮的 children 传入。
- 弹出层浮在铃铛旁边，不占布局空间（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 在手机上（`viewport="mobile"`），弹出层离屏幕两侧边缘各 8px，和同一个顶栏下的服务器列表一样：它和定位元素的 `--available-width` 一样宽（屏幕减去两侧各 8px 的内边距），最宽 480px，只有横过来的手机才会达到；它的碰撞内边距是 8px，所以虽然它挂在右边的铃铛下，仍然离两侧边缘各 8px（[层级](../../../../../design/foundations/elevation.md#popups)）。要改这个值，传 `collisionPadding`。在桌面端它是 380px，用 Base UI 默认的碰撞内边距。

## 内容 {#content}

- 提示的写法与收件箱条目的顺序相同：先写在哪里（哪台计算机、哪个服务器），再写发生了什么，最后最多 2 行细节（[InboxItem](../inbox-item/inbox-item.md#content)）。

## 无障碍 {#accessibility}

- `NotificationCenter` 封装了 Base UI 的 `Popover`，默认非模态；弹出层打开时不获取焦点。
- 除非传入别的 `aria-label`，弹出层的名称是 "Notification center"，列表的名称是 "Notifications"。
- 给触发按钮一个无障碍名称，并包含未读状态：`aria-label="Notifications, 2 unread"`。铃铛和圆点对辅助技术隐藏。
- `NotificationCenterItemIcon` 是一张图片（`role="img"`），按状态命名（Error、Warning、Info）。

## 规则 {#rules}

- 提示里的操作做成墨色描边的小按钮，不要用粉色；`NotificationCenterActionButton` 已经这样处理（[InboxItem](../inbox-item/inbox-item.md#rules)）。
- 错误和警告用橙色方块，不用红色（[颜色](../../../../../design/foundations/color.md#soft-tints)）。
