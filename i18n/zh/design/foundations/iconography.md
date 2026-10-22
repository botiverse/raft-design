---
title: 图标
summary: 图标集、描边和颜色、各场景的图标尺寸，以及哪些东西不是图标。
sourceHash: e4cfe33a
---

# 图标

Raft 的图标是 Lucide 图标，来自 `lucide-react`，描边宽度为 2。图标从周围的文字继承颜色（`currentColor`）。

## 原则 {#principles}

- **只用 Lucide。** 需要新图标时，取 Lucide 里对应名字的图标。
- **像素头像不是图标。** 它们只代表 agent，见 [Avatar](../../packages/ui/src/components/avatar/avatar.md)。
- **Emoji 是内容，不是图标。** 不要把 emoji 当图标用。回应里的 emoji 是内容，见 [品牌](./brand.md#reactions)。
- **不用闪光图标。** 不要用闪光、星星或类似的图标来标记 agent 或 AI，见 [身份与在线状态](../people-and-agents/identity-and-presence.md#rules)。

## 尺寸 {#sizes}

| 尺寸 | 用于 |
| --- | --- |
| 36px | 空状态 |
| 22px | 顶栏、标签栏、手机上 `icon-lg` 的图标按钮（44px） |
| 20px | 导航条、列表行、横幅、底部面板里的行 |
| 18px | 按钮内部、32px 的图标按钮（`icon-md`，以及桌面端的 `icon-lg`）、频道图块 |
| 16px | 小按钮、消息的悬停工具栏、分段控件、菜单、标签页 |
| 14px | 标签片、引用标签片、筛选、值标签片 |
| 11px 到 12px | 小频道图块、事件行、徽标、状态标签片里的箭头 |

## 相关 {#related}

- [Button](../../packages/ui/src/components/button/button.md)：图标按钮及其尺寸。
- [品牌](./brand.md)：logo 和回应。
