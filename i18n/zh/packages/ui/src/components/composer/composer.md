---
title: Composer
summary: 对话底部的消息输入框：输入区、工具、附件、@ 建议和粉色发送按钮都在同一圈墨色边框里。
sourceHash: 83bfcd9d
---

# Composer

消息输入框（Composer）是人们写消息的地方：位于频道、私信、消息列或任务讨论的底部。一圈墨色边框里装着输入区、工具、附件和粉色的发送按钮。输入 @ 会在它上方打开一个人和 Agent 的列表。

```example
chat-composer/compositions/composer-default
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 在对话中发送消息 | Composer |
| 随表单保存的多行文字 | [Textarea](../textarea/textarea.md) |
| 一行文字 | [Input](../input/input.md) |

消息输入框在对话中的位置，见[对话](../../../../../design/patterns/conversation.md)。

## 结构 {#anatomy}

- `ComposerRoot`：提交消息的 `<form>`。必需。
- `Composer`：带墨色边框的那个框。必需。
- `ComposerAttachments`，每个文件一个 `ComposerAttachment`：框内、输入区上方的 64px 缩略图。可选。`SortableComposerAttachments` 让人可以调整它们的顺序。
- `ComposerInput`：输入区，一个随内容变高的 `<textarea>`。必需。
- `ComposerToolbar`：输入区下方的一行，包含：
  - `ComposerActions`：开头的工具，每个都是一个 `ComposerIconButton`（附加文件、添加图片）；
  - `ComposerMeta`：末尾，一个和发送相关的选项（`ComposerToolbarLabel` 加一个 [Checkbox](../checkbox/checkbox.md)），以及发送按钮 `ComposerSubmit`。
- `ComposerSuggestionList` 及其各部分，由 `useComposerSuggestions` 驱动：框上方的 @ 建议。
- `ComposerDropOverlay`：文件拖到框上时框里显示的内容。

## 状态 {#states}

```example
chat-composer/compositions/composer-attachment-states
```

- **上传中**：缩略图在自己的轨道上显示青色进度，轨道从缩略图边缘向内缩进（[形状](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)）；角上的 × 在上传过程中取消上传，上传完成后移除文件。文件卡片见 [MessageAttachment](../message-attachment/message-attachment.md)。
- **没有可发送的内容**：在有文字或附件之前，禁用 `ComposerSubmit`。
- **焦点**：焦点环套在整个消息输入框上（[状态](../../../../../design/foundations/states.md#focus)）。

## 行为 {#behavior}

```example
composer-suggestions/composer-suggestions
```

- 输入 @ 会在消息输入框上方打开建议列表，宽度与消息输入框相同，位于它上方 8px。先列出这个对话的成员，再列出其他人，分组显示。每一行显示头像、名字，以及 `foreground-hint` 颜色的状态。
- 允许把文件拖进消息输入框，但不允许拖文件夹。
- 输入区随内容变高，到最大高度后在内部滚动。
- 在手机上，键盘弹出时让消息输入框保持在键盘上方。竖持手机时，回车键插入新行（[响应式布局](../../../../../design/patterns/responsive.md#phone)），所以发送要用发送按钮。
- 它的按钮（包括发送按钮）是嵌在外框里的控件：使用 `radius-chip`，在底部和左右两侧距消息输入框外边缘 6px（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
- 消息输入框的边框对齐内容边距（[页面结构](../../../../../design/patterns/page-structure.md#one-edge-per-column)），下方留 16px 加安全区域。

```example
chat-composer/compositions/composer-drop-overlay
```

## 内容 {#content}

- 占位文字要说明消息发到哪里：Message #launch-week。用词与输入区的 `aria-label` 相同。

## 无障碍 {#accessibility}

Composer 没有 Base UI 原语：它渲染原生的 `<form>` 和 `<textarea>`。`useComposerSuggestions` 给输入区加上组合框（combobox）模式：`aria-controls` 指向列表框，`aria-activedescendant` 指向高亮的选项。上下方向键移动高亮，Enter 或 Tab 选中，Esc 关闭列表。

- 给 `ComposerInput` 一个说明目的地的 `aria-label`（Message #launch-week）。
- 给每个 `ComposerIconButton` 和只有图标的 `ComposerSubmit` 加 `aria-label`（Attach File、Send）。
- 给建议列表加 `aria-label` 或 `aria-labelledby`。

## 规则 {#rules}

- 发送按钮算作这个界面的粉色按钮（[Button](../button/button.md#which-color)）。它是一个粉色的图标按钮（`size="icon-md"`），带 `aria-label="Send"`，手机和桌面端都一样。
- 整组外面只画一圈墨色边框：1.5px 的 `line-field`，和输入框一样（[形状](../../../../../design/foundations/shape.md#stroke-widths)）。里面的工具没有边框：`ComposerIconButton` 是无框的。
- 无论消息输入框放在哪里（频道、消息列、附件评论、转发），输入文字都保持 `text-body`、常规字重。不要让它继承周围的字体样式。工具图标用 `foreground-muted`。
- 在可滚动区域下方，比如附件评论或转发时附加的备注，用紧凑的消息输入框：上方一条 `line-seam`，四周留 12px 空间，自身没有填充色。
