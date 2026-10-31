---
title: ModeBar
summary: 面板处于人特意进入的某种模式时（比如对 Artifact 发表评论），铺在面板标题栏下方的一条深色横条，带结束这个模式的操作。
sourceHash: 2c79f437
---

# ModeBar

模式条说明一个面板暂时以另一种方式工作，因为是这个人要它这样的：对 Artifact 发表评论时，选中文字会生成一条评论草稿，而不是复制文字。它铺满面板标题栏下方的整个宽度，用深色的 HUD 表面，写明这是什么模式、在模式里该做什么，以及结束模式的操作。

```example
mode-bar/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 人在这个面板里开启了一个模式，并用一个操作关闭它：对 Artifact 发表评论，用 Done 结束 | ModeBar |
| 某个面板里出了错：Agent 启动不了、设置没保存上 | `PanelNotice`（[Panel](../panel/panel.md)），用意图对应的浅色底 |
| 在对话框或表单里操作之前需要知道的事 | [Banner](../banner/banner.md) |
| 人刚做的事情的结果 | [Toast](../toast/toast.md) |
| 选中了几条消息，并有针对它们的操作 | `MessageMultiSelectToolbar`（[MessageItem](../message-item/message-item.md)） |

## 结构 {#anatomy}

- `ModeBar`：这一条。必需。把它直接放在面板标题栏下方，横跨面板的整个宽度。
- `ModeBarContent`：文字，占据剩下的宽度，可以换行。必需。它是一个 polite 实时区域。
  - `ModeBarTitle`：模式和它的状态，粗体：「Commenting · 1 draft.」
  - `ModeBarDescription`：在模式里该做什么，用 HUD 上弱化的墨色，和标题在同一行、跟在标题后面：「Select text to comment on it.」它自己带上前面的空格。
- `ModeBarAction`：结束模式的文字操作，在第一行的末尾。必需。

## 为什么是深色的 {#why-it-is-dark}

模式不是提示。没有出错，也没有什么需要这个人注意，所以它没有意图，也不用意图的浅色底：黄色或蓝色的横条会对一个人自己选的状态说「警告」或「信息」。但它仍然是产品在说话，而不是内容，所以它用产品说话的那种表面，也就是轻提示和工具提示用的 HUD（[颜色](../../../../../design/foundations/color.md#principles)）。在浅色和深色模式下，深色填充都和每一种浅色底、和纸面明显不同，所以只要它在，看起来就是「这个面板处于另一种模式」；它一消失，面板就恢复平常的样子。`fill-muted` 上的中性 `PanelNotice` 会和标题栏太接近，看起来像是关于这个面板的一条说明，而不是面板工作方式的变化。

## 行为 {#behavior}

- 模式开启期间显示它，模式结束时移除；除了这一条的高度，标题栏下方的面板不会移动。
- 它的边距和单行时的高度与 `PanelNotice` 相同：离面板两边 20px（手机上 16px），文字上下各 10px，至少 40px。标题栏下方的这两种横条尺寸一样。
- 文字用 `text-callout`，桌面端 14/22，手机上 14/20。文字会换行；操作留在第一行的末尾。
- 它下方不画接缝线：深色填充就是它的边缘。它上方的接缝线属于标题栏。

在手机上或窄面板里，文字换行，Done 留在原位：

```example
mode-bar/compositions/narrow
```

## 内容 {#content}

- 在标题里写出模式和它的状态，带句号：「Commenting · 1 draft.」把数量放在标题里，让人看到这一批草稿在增加。
- 在描述里用一句短句说明在模式里怎么做：「Select text to comment on it.」
- 操作的标签写模式的结束，一个词：Done。绝不用 Cancel 或 ×：结束模式会保留在模式里做的事（草稿还在）。

## 无障碍 {#accessibility}

- `ModeBarContent` 有 `role="status"`，所以文字的变化（比如草稿数量）会以 polite 方式读出。`ModeBarAction` 放在实时区域之外，所以不会每次变化都读出「Done」。
- `ModeBarAction` 渲染一个 `type="button"` 的 `button`，在文字之后用 Tab 到达。给开启这个模式的控件设置按下状态（`PanelToggleAction`），这样进入和离开模式由它来播报。
- 这一条用 `start` 和 `end` 排版，所以在从右到左书写的语言里会镜像。

## 规则 {#rules}

- 一个面板里最多显示一个模式条，也不要为同一件事再显示一个 `PanelNotice`。
- 只给它一个操作，就是结束模式的那个，做成 HUD 上的文字操作：粗体的 `foreground-on-hud`，悬停时加下划线，和轻提示的操作一样（[可点击文字](../../../../../design/foundations/states.md#clickable-text)）。绝不用 Button：按钮的填充和墨色边框不属于这条深色横条。
- 模式的其他操作（Submit、Discard）放在没有模式条时它们所在的地方，比如面板标题栏，不放在这一条里。
- 文字前面不要放图标：深色横条本身已经说明它是哪一类东西。
