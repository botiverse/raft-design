---
title: WorkspaceButton
summary: 外框上的服务器切换器：服务器的头像、名称和一个 V 形箭头，组成一个打开服务器列表的按钮。
sourceHash: 9364bfeb
---

# WorkspaceButton

WorkspaceButton 显示你当前所在的服务器，并打开用于切换的列表。它在每个出现的地方都长得一样：网页顶栏左侧、网页版手机主页顶部，以及移动应用主页顶部。

```example
workspace-button/workspace-button
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 外框上的当前服务器，点击打开列表 | WorkspaceButton |
| 按钮旁边、点一下就能进入的另一个服务器 | 工作空间条：只放服务器的 [Avatar](../avatar/avatar.md) |
| 没有顶栏时，桌面端导航条上的服务器 | 导航条上的工作空间图块（[AppRail](../app-rail/app-rail.md)） |

## 结构 {#anatomy}

- `WorkspaceButton`：外框上的 `md` [Button](../button/button.md)：高 36px，左右各 10px，文字为 `text-subhead` 粗体、`foreground-on-frame`，悬停、按下和列表打开时显示 `fill-frame-medium`。末尾是一个 16px 的 V 形箭头，距名称 4px。V 形箭头是按钮的一部分，始终显示。
- 服务器的 [Avatar](../avatar/avatar.md)，`type="server" size="sm"`（27px）：服务器的 logo，或墨色底上黄色的首字母。距名称 8px。
- `WorkspaceButtonName`：服务器名称，最宽 200px，超出显示省略号。
- 可选，放在名称和 V 形箭头之间：服务器的公开页面开启时显示的地球图标。

## 行为 {#behavior}

- 打开列表：桌面端是按钮下方一个 256px 宽的菜单；手机上是锚定在顶栏下方的弹出层，距两侧各 8px（[切换服务器](../../../../../design/components/overview.md#switching-servers)）。
- 按钮变窄时从名称开始收缩。头像和 V 形箭头保持尺寸，所以按钮在任何宽度下都能看出是切换器。
- 旁边显示工作空间条时，按钮仍保留头像。
- 按头像来定位：头像的左边缘对齐页面的内容线（手机上是 16px），按下时的填充按按钮的内边距向外超出（[对齐](../../../../../design/foundations/alignment.md)）。

## 状态 {#states}

- **其他服务器有未读：** 另一个服务器有未读内容时，头像右上角显示一个提醒圆点（`AvatarBadge`，`offset={["100%", 0]}`）。
- **按下和打开：** 整个按钮下面显示 `fill-frame-medium`。

## 无障碍 {#accessibility}

- 按钮的名称就是服务器的名称。另一个服务器有未读内容时，在标签里说明（"Acme, another server has unread items"）。
- V 形箭头是装饰性的（`aria-hidden`）。
