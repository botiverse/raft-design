---
title: TextLink
summary: 悬停时显示下划线的文字，是屏幕上最安静的控件，用于一个操作或通往某处；按钮强调层级的最底一级。
sourceHash: 067a3f1f
---

# TextLink

TextLink 是能做某件事或通往某处的文字，鼠标指针移上去之前没有下划线。它是强调层级的最底一级，在无边框按钮之下（[Button](../button/button.md#which-color)）：连无边框按钮都显得太重的地方用它，例如登录页上的 Forgot Password、服务器列表下的 Sign Out，或分区标题旁的 See All。

```example
text-link/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 屏幕上最安静的控件，单独出现或在句子里 | TextLink |
| 对话框、底部面板、菜单、弹出层或卡片里的 Cancel 或次要操作 | [Button](../button/button.md) `variant="ghost"` |
| 页面上的 Cancel 或次要操作 | [Button](../button/button.md) `variant="default"` |
| 渲染出来的消息或文档内容里的链接 | Markdown 链接，用链接蓝（[Markdown](../markdown/markdown.md)） |

## 变体 {#variants}

变体取决于链接所在的位置，而不是操作有多重要。

| 变体 | 用于 |
| --- | --- |
| `variant="muted"`（默认） | 单独出现的链接：Forgot Password、Sign Out、See All。`foreground-muted`，500 字重；悬停时变成墨色并加下划线。 |
| `variant="strong"` | 句子里的链接："Don't have an account? Create One"、横幅里的 "Manage Machines"。墨色，600 字重；悬停时加墨色下划线。 |

**为什么由位置决定。**单独出现时，TextLink 是屏幕上最安静的控件，所以用次要色：它不能和屏幕上的文字或按钮抢注意力。在句子里，同样的灰色会比周围的字更浅，看起来像禁用，所以在那里它用正文的墨色，靠字重突出。两种变体都不用粉色，静止和悬停时都不用：粉色属于唯一的主按钮。

**为什么下划线在悬停时出现。**下划线是 raft-ui 里所有可点击文字的悬停信号，人们学一次就够了（[可点击的文字](../../../../../design/foundations/states.md#clickable-text)）。静止时，上面说的字重、颜色和链接所在的位置已经说明它可以点；如果每个安静的控件都带下划线，在一个要连续读上几个小时的屏幕上，每个控件下面都会多一条线。

## 状态 {#states}

- **悬停：**文字加上与自身同色的下划线，1.5px 粗，在基线下方 3px；次要色的链接还会变成墨色。
- **禁用：**文字变成 `foreground-disabled`，悬停时没有任何变化，所以它不再像可以按的东西。

```example
text-link/compositions/disabled
```

- **焦点：**统一的焦点环（[状态](../../../../../design/foundations/states.md)），圆角 2px。

## 行为 {#behavior}

- TextLink 没有自己的尺寸：它沿用周围文字的字号和行高，所以在句子里它落在基线上，也不会把行撑高。单独出现时，给它的容器设置字号。
- 它没有方框、内边距或最小高度。不要把它放在手机上手指唯一要点的位置；那里要用 [Button](../button/button.md)。

## 内容 {#content}

- 以动词开头，或者写出地点的名称：Forgot Password、Sign Out、See All。
- 用 Title Case，和所有按钮标签一样（[写作](../../../../../design/content/writing.md#casing)）。

## 离开 Raft {#leaving-raft}

去别的网站的 TextLink 以 `TextLinkExternalIcon` 结尾：Lucide 的 `ArrowUpRight`，14px，和文字隔 2px，颜色和文字一样。它放在一个 inline-flex 的盒子里，所以悬停时的下划线只画在文字下面，不会延伸到箭头下面。给读屏传 `label`，比如"（在新标签页打开）"；这是产品文案，所以 raft-ui 不写。所有离开 Raft 的控件的规则见[导航](../../../../../design/patterns/navigation.md#links-that-leave-raft)。

```example
text-link/compositions/leaving-raft
```

## 无障碍 {#accessibility}

TextLink 渲染一个原生的 `button type="button"`。通往某处时，渲染成真正的链接，这样它能在新标签页中打开，也会被读成链接：`render={<a href="…" />}`。

- `disabled` 是原生属性，所以只在按钮形式上有效：按钮会离开 Tab 顺序，并显示禁用样式。链接没有 `disabled`。某个去处不可用时，不要渲染链接；改为在文字里说明原因。

## 规则 {#rules}

- 不要用 TextLink 往拥挤的一行里多塞一个操作。它是屏幕上最安静的控件，不是更小的按钮。
- 不要给它上色，静止时也不要加下划线。强调来自字重和墨色，这样粉色只属于唯一的主按钮，下划线也始终是悬停信号。
