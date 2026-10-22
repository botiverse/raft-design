---
title: 颜色
summary: 表面、文字、线和角色的颜色，每种颜色的含义，以及它们保证的对比度。
sourceHash: 7f4e2e4d
---

# 颜色

Raft 里的颜色有两层作用。第一层，表面从外到内颜色越来越少：黄色的外框，然后是奶油色的侧边栏，然后是放内容的白色纸面。第二层，每种品牌色都有一个固定的含义，所以屏幕上出现的颜色总在告诉人一件事：他是谁，什么在等他处理，或者某个东西处于什么状态。一种颜色如果什么都不表示，就去掉。

## 原则 {#principles}

- **黄色只用在外框上。** 外框出现在每个屏幕上，但没人去读它，所以在那里用颜色几乎没有代价。人要读的所有东西（消息、列表、卡片、推入页面的内容）都放在纸面上。外框指桌面端的导航条、网页的顶栏和手机一级页面的顶栏；见[页面结构](../patterns/page-structure.md)。
- **每种颜色只有一个含义。** 黄色是你，粉色是待办，青色是这一项，橙色是打断，红色是不可撤销。状态颜色也是固定的；见[颜色的含义](#meanings-of-color)。
- **一块品牌色就是一张贴纸。** 它有 1.5px 的墨色边，上面是墨色文字，两种模式下都一样；见[贴纸](#stickers)。
- **提示是中性色。** 轻提示（Toast）和工具提示（Tooltip）用深灰色（`layer-hud`），不用品牌色，也没有黄色按钮。提示只是附带的信息：黄色的轻提示会和选中状态抢注意力，而黄色只表示「你」（你在哪里、你选了什么、什么在叫你）。

## Token {#tokens}

### 表面 {#surfaces}

表面的颜色从外框往里一级级递减。在浅色模式下，`layer-canvas`、`layer-card` 和 `layer-popover` 都是白色，靠线来区分；在深色模式下靠明度区分，每一层都比下面那层亮。

```tokens
layer
```

| Token | 用于 |
| --- | --- |
| `layer-frame` | 外框：手机一级页面的顶栏、桌面端导航条、网页顶栏 |
| `layer-sidebar` | 桌面端侧边栏 |
| `layer-canvas` | 纸面：桌面端主区域、手机的每个屏幕 |
| `layer-card` | 凸起的容器：卡片、内嵌分组、输入框、发消息的输入框、标签栏 |
| `layer-popover` | 弹出层：菜单、抽屉、底部面板、对话框、个人资料卡 |
| `fill-muted` | 下沉填充：轨道、行内代码、骨架屏、中性图块、回应、消息列预览 |
| `layer-code` | 代码块和命令行 |
| `layer-hud` | 轻提示和工具提示；上面的文字用 `foreground-on-hud` 和 `foreground-on-hud-muted` |
| `layer-backdrop` | 居中浮层、模态抽屉、底部面板和图片查看器背后的遮罩 |
| `layer-backdrop-nested` | 从一个模态表面里再打开另一个模态表面时，下面那层更浅的遮罩（[叠放的浮层](./elevation.md#stacked-overlays)） |

填充铺在表面里面或上面：下沉填充和悬停叠加层（[悬停叠加层](#hover-overlays)）。

```tokens
fill
```

### 文字和图标 {#text-and-icons}

```tokens
foreground
```

| Token | 用于 |
| --- | --- |
| `foreground` | 墨色：正文、标题、控件边框 |
| `foreground-muted` | 次要文字：预览、描述、标签 |
| `foreground-hint` | 第三级文字：时间、ID、分组标题、占位文字 |
| `foreground-disabled` | 禁用的文字和图标 |
| `foreground-link` | 正文中的链接 |
| `danger-strong` | 错误文字：无效输入框的边框和帮助文字、上传失败 |

### 线 {#lines}

线有三种，每种都有含义。线宽见[形状](./shape.md#stroke-widths)。

```tokens
line
```

| Token | 含义 | 用于 |
| --- | --- | --- |
| `line-hairline` | 在内容里面 | 列表分隔线、卡片轮廓 |
| `line-seam` | 在区域之间 | 导航条和侧边栏之间、标题栏和它的内容之间、菜单、抽屉或对话框的边缘 |
| `line-strong` | 这是一个控件 | 控件 1.5px 的墨色边框，以及贴纸的边 |
| `line-field` | 这是一个字段 | 字段和输入框 1.5px 的墨色外框，墨色和宽度与 `line-strong` 相同 |

线、次要文字和叠加层都由一组半透明的墨色阶梯生成。使用上面的角色 token；这些阶梯列在这里仅供参考。

```tokens
ink
```

### 颜色角色 {#color-roles}

```tokens
brand
```

```tokens
attention
```

```tokens
info
```

```tokens
success
```

```tokens
warning
```

```tokens
danger
```

```tokens
inactive
```

## 颜色的含义 {#meanings-of-color}

| 颜色 | 角色 | 含义 | 用于 |
| --- | --- | --- | --- |
| 黄色 | `brand` | 你 | 外框、导航中的选中项、打开的开关、你所在位置的位置图块、提及你的地方、搜索命中、你打开的评论所对应的段落；你的服务器（工作空间图块，墨色底上的黄色） |
| 粉色 | `attention` | 待办 | 每个屏幕最多一个主按钮；未读计数和提醒圆点 |
| 青色 | `info` | 这一项、信息 | 进行中、运行时、外部 agent、进度条；`info-soft` 用于内容中被单独标出的项、生效中的筛选、信息横幅 |
| 橙色 | `warning` | 打断 | 停止、离开或重置的按钮；警告；「待办」状态；错误状态灯 |
| 红色 | `danger` | 不可撤销 | 删除按钮 |
| 青柠色 | `success` | 完成 | 完成、在线、成功横幅 |
| 薰衣草紫 | `palette-lavender-*` | — | 待确认，以及没有照片的人 |
| 石灰色 | `inactive` | 已关闭 | 已关闭、离线 |

- 出了问题时用橙色：红色只用于无法撤销的后果。
- 蓝色（`foreground-link`）只用于正文中的链接。
- 青柠色、薰衣草紫和石灰色只用来标记状态，不要用在别处。

### 状态 {#statuses}

任务和在线状态各有五种颜色，含义永远不变。任务状态的英文写法是 Todo、In Progress、In Review、Done 和 Closed（中文界面为待办、进行中、待确认、完成、已关闭）。

```tokens
task-status
```

| 任务状态 | Token | 在线状态灯 | Token |
| --- | --- | --- | --- |
| 待办（橙色） | `task-status-todo` | 在线（青柠色） | `presence-online` |
| 进行中（青色） | `task-status-in-progress` | 忙碌（黄色） | `presence-busy` |
| 待确认（薰衣草紫） | `task-status-in-review` | 错误（橙色） | `presence-error` |
| 完成（青柠色） | `task-status-done` | 离线（石灰色） | `presence-offline` |
| 已关闭（石灰色） | `task-status-closed` | 外部 agent（青色） | `presence-external` |

```tokens
presence
```

- 状态标签片放在对应的 `task-status-*-soft` 色调上。
- `presence-busy` 有自己的值，而不是指向 `brand`，这样品牌色变了，忙碌的样子也不会跟着变。
- `presence-offline` 是色板里的石灰色，不是默认的灰色：raft-ui 不使用 Tailwind 的默认色板，所以每个在线状态灯都来自同一个色板。
- 在线状态灯从不闪烁；见[动效](./motion.md)。

### 柔和色调 {#soft-tints}

柔和色调（`*-soft`）是高亮，永远不是贴纸：它没有边框。

- 状态标签片和运行时标签片画成柔和色调，用一个方形像素点或一个图标承载饱和色，而不是画成带墨色边框的饱和色块。一个屏幕上可能有十几个这样的标签片，饱和色只占一个像素点那么大时，屏幕才能保持安静。

| 色调 | 用于 |
| --- | --- |
| `brand-soft` | 菜单高亮、忙碌标签片、文本选区 |
| `info-soft` | 内容中的选中项、筛选、信息横幅、运行时标签片、消息列引用、通知里的消息 |
| `attention-soft` | 频道引用、你添加的回应 |
| `success-soft` | 成功横幅、完成标签片 |
| `warning-soft` | 警告横幅、待办标签片、通知里的错误和警告 |
| `danger-soft` | 危险横幅 |
| `task-status-in-review-soft` | 待确认标签片 |
| `task-status-closed-soft` | 已关闭标签片 |

### 悬停叠加层 {#hover-overlays}

悬停和按下时，在控件上叠一层半透明的叠加层，而不是改变它的填充色，分两档；见[悬停和按下](./states.md#hover-and-press)。

| Token | 档位 | 作用于 |
| --- | --- | --- |
| `fill-subtle` | 轻 | 悬停在行、消息或可阅读的卡片上（评论卡片、附件卡片、任务卡片、回复栏），以及菜单打开着的行 |
| `fill-medium` | 中 | 悬停在纸面色的控件上（按钮、图标按钮、标签片、标签页、分段），以及按下任何东西 |
| `sticker-medium` | 中 | 悬停和按下彩色贴纸 |
| `fill-frame-medium` | 中 | 悬停和按下外框上的任何东西 |

`fill-subtle` 比每种选中色调都浅，所以悬停的行永远不会看起来像被选中，文字也保持原有的对比度。这些 token 在分成两档之前的旧名称作为已弃用的别名继续可用，直到 raft-ui 1.0；`codemods/token-names.mjs` 会把它们改成新名称。

## 贴纸 {#stickers}

贴纸是一块品牌色：头像、选中项、位置图块、主按钮、徽标。

- 给每块品牌色加上 1.5px 的 `line-strong` 边：贴纸和纸面之间的对比度只有 1.4:1 到 2.8:1，没有边的话，贴纸撑不住自己的形状。
- 贴纸上用墨色文字（`sticker-ink`），两种模式下都不用白色。
- 深色模式下不要反转贴纸。贴纸颜色在两种模式下的值相同；深色模式改为加上模切边（见[深色模式](./dark-mode.md)）。
- 不要给控件加阴影。硬朗的贴纸阴影只用于品牌插画；见[层级](./elevation.md)。

```tokens
sticker
```

## 对比度 {#contrast}

- `foreground`、`foreground-muted` 和 `foreground-hint` 在每种表面、每种柔和色调和每种弹出层上，两种模式下，以及在它们之上的悬停行上，对比度都至少是 4.5:1。没有需要记的例外。
- `foreground-hint` 在浅色模式下比 60% 墨色稍深，在深色模式下稍浅。60% 墨色是产品采用这些 token 之前用的值，在某些色调和弹出层上达不到 4.5:1。第三级文字承载着人需要读的时间、ID 和计数，所以它和正文享有同样的保证。
- 错误文字和无效输入框的边框用 `danger-strong`，这是一种深红色，在纸面上的对比度是 6.1:1。产品之前用的较亮的红色在白色上只有 4.2:1 和 2.8:1，低于文字需要的 4.5:1。删除按钮保留 `danger`，因为它上面的文字是墨色。
- 贴纸上的墨色对比度至少是 6.8:1。
- `line-seam` 在白色上是 3.0:1，在黄色上是 2.8:1。

## 色板 {#palette}

角色 token 指向一个小色板。只有在没有合适角色的地方才直接用色板，比如没有照片的人用薰衣草紫。色板 token 的形式是 `palette-<color>-<step>`，对应的简写工具类是 `bg-palette-<color>`。

```tokens
palette
```

## 相关内容 {#related}

- [深色模式](./dark-mode.md)：深色模式下什么会变、什么不变。
- [状态](./states.md)：悬停、选中、未读和错误的颜色。
- [品牌](./brand.md)：每种页面可以用多少品牌色。
- [Button](../../packages/ui/src/components/button/button.md)：什么操作用什么颜色的按钮。
