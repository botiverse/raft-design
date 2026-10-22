---
title: 图标
summary: 图标集、描边和颜色、各场景的图标尺寸，以及哪些东西不是图标。
sourceHash: f1fe3fc0
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
| 20px | 导航条、列表行、底部面板里的行 |
| 18px | 按钮内部、32px 的图标按钮（`icon-md`，以及桌面端的 `icon-lg`）、频道图块 |
| 16px | 小按钮、消息的悬停工具栏、分段控件、菜单、标签页；横幅、Toast 或面板提示里引导 14px 文字的图标 |
| 14px | 标签片、引用标签片、筛选、值标签片；引导 12px 或 13px 文字的图标，如小横幅里 |
| 11px 到 12px | 小频道图块、事件行、徽标、状态标签片里的箭头 |

- **引导一行文字的图标，尺寸由文字决定：** 1.15em 取偶数像素，所以 12px 和 13px 文字旁是 14px，14px 旁是 16px，16px 旁是 18px。它放在一个一行高的框里，与第一行居中对齐，见 [引导文字的标记](./alignment.md#a-mark-that-leads-text)。横幅的图标因此是 16px 而不是 20px：20px 时，它的墨迹高度几乎是旁边大写字母的两倍。

## 相关 {#related}

- [Button](../../packages/ui/src/components/button/button.md)：图标按钮及其尺寸。
- [品牌](./brand.md)：logo 和回应。
- [对齐](./alignment.md#a-mark-that-leads-text)：引导文字的图标放在哪里。
