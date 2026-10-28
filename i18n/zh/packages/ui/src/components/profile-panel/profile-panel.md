---
title: ProfilePanel
summary: 一个人或一个 Agent 的侧面板：面板标题栏里是头像和名字，下面是几个部分，说明他是谁、做什么、你能和他做什么。
sourceHash: 8b5dc1a2
---

# ProfilePanel

ProfilePanel 在对话旁边显示一个人或一个 Agent 的个人资料：一个 [Panel](../panel/panel.md)，标题栏写出这个人或 Agent 的名字，下面是大头像和几个详情部分。人和 Agent 用同一个面板，大小也一样（[身份与在线状态](../../../../../design/people-and-agents/identity-and-presence.md#the-same-as-people)）。

```example
profile-panel/compositions/member-detail
```

## 何时使用 {#when-to-use}

| 情况                                                  | 用                                                             |
| ---------------------------------------------------------- | --------------------------------------------------------------- |
| 一个人或 Agent 的全部信息，在聊天旁边阅读 | ProfilePanel                                                    |
| 悬停在名字或头像上时，看这人是谁         | 个人资料卡（[PreviewCard](../preview-card/preview-card.md)） |
| 成员或 Agent 的列表                                | [ListRow](../list-row/list-row.md) 行                         |
| 其他任何侧面板 | [Panel](../panel/panel.md) |
| 频道的任务和文件 | 对话面板右边各列里的侧边分区（[页面结构](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)） |

在 Raft Chat 里 Agent 的个人资料包含什么（标题栏操作、标签页、头图区、详情和操作），见 [Raft Chat：Agent 个人资料](../../../../../design/products/raft-chat/agent-profile.md)。

## 结构 {#anatomy}

- `ProfilePanel`：面板，放在 `layer-canvas` 上，填满所在列的高度。
- `ProfilePanelHeader`：56px 的面板标题栏（[Panel](../panel/panel.md#anatomy)），最前面是头像。
  - `ProfilePanelHeaderContent`：`PanelTitle` 里是名字，`PanelMeta` 里是一行信息，例如用户名（handle）或角色。
  - `PanelActions`：图标按钮，例如 Message。
- `ProfilePanelBody`：标题栏下方的内容，和对话面板的内容在同一个表面上。里面放 `PanelScrollViewport` 和 `PanelScrollContent`。
- `ProfilePanelSection`：个人资料的一个部分，上方有一条 `line-hairline`。依次是：
  - 他是谁：`xl` 的 [Avatar](../avatar/avatar.md)、名字和用户名；
  - 详情，用 [DescriptionList](../description-list/description-list.md)：描述、角色、邮箱、加入时间；
  - 属于这个人或 Agent 的 Agent 或人，用内嵌分组里的 [ListRow](../list-row/list-row.md) 行；
  - 操作，放在最后。

## 变体 {#variants}

| 变体                 | 用于                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| 本服务器的成员 | 上面的几个部分                                                                           |
| Agent                | 同样的部分，名字旁边用 [Status](../status/status.md) 显示 Agent 的状态 |
| 来自其他服务器     | 在「他是谁」之前加一个部分，里面有一行 From，写出他所在的服务器                 |

```example
profile-panel/compositions/agent-profile
```

```example
profile-panel/compositions/remote-human
```

## 状态 {#states}

| 状态   | 外观                                                                                                     |
| ------- | -------------------------------------------------------------------------------------------------------- |
| 加载中 | 标题栏和各部分显示为 [Skeleton](../skeleton/skeleton.md) 形状，面板上设 `aria-busy` |

```example
profile-panel/compositions/skeleton
```

## 行为 {#behavior}

- 从消息列打开的个人资料放在消息列旁边；从对话打开时，它替换掉消息列（[页面结构](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)）。
- 它的宽度，以及什么时候放在对话旁边、什么时候盖住对话，见[间距](../../../../../design/foundations/spacing.md#layout-widths)和 [Raft Chat](../../../../../design/products/raft-chat/README.md)。
- 在手机上，个人资料像推入页面一样盖住页面，带返回（[响应式布局](../../../../../design/patterns/responsive.md)）。Agent 自己的页面（从 Working now 或 Members 打开）则填满主区域。
- 标题栏固定不动；只有内容区滚动。

## 内容 {#content}

- 显示名称放在 `PanelTitle` 里，大头像下方再写一次，下面用 Space Mono 写用户名：`@martin`。
- 没有描述时也保留描述部分，用 `foreground-hint` 写 "No description"。
- 部分标题用 sentence case："Created agents"。

## 无障碍 {#accessibility}

- `ProfilePanel` 渲染一个 `section`。按这个人或 Agent 给它命名：`aria-label="Martin"`。
- 大头像下方的名字渲染为标题（`h2`），级别低于面板的标题。
- 头像图片的 `alt` 留空：旁边的名字已经说明了是谁。
- 加载时，在面板上设置 `aria-busy="true"` 和 `aria-label="Loading profile"`。
- 每个只有图标的 `PanelAction` 都要有 `aria-label`："Message"、"Close Profile"。

## 规则 {#rules}

- 人和 Agent 都用 `xl` 头像，99px（[身份与在线状态](../../../../../design/people-and-agents/identity-and-presence.md#the-same-as-people)）。
- 正在工作的 Agent 用一个静止的黄色灯加一个词表示（[Status](../status/status.md)），从不用动画。
- 不可撤销的操作（例如 Remove Member）放在最后，单独成一个部分。
- 面板放在对话旁边时，给它设 `edge="attached"`，让它画出两者之间唯一的那条线（[Panel](../panel/panel.md#rules)）。`ProfilePanel` 默认是 `edge="inset"`。
