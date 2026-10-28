---
title: Raft Chat — 新手引导
summary: 第一次运行：在品牌页面上创建账户和服务器，然后以一个五步的阻断式对话框完成服务器设置。
sourceHash: de1b5c5e
---

# Raft Chat — 新手引导

第一次运行分两部分。创建账户身份和服务器发生在品牌页面上，那时这个人还没进入任何服务器。之后，在新服务器有了一台计算机和第一个 Agent 之前，应用把设置显示为服务器页面上方的一个对话框，带遮罩。这个对话框无法关闭：按 Esc 不会关闭，也没有 ×。原生应用把同样的步骤显示为一个完整页面。

## 结构 {#structure}

### 创建账户和服务器 {#creating-an-account-and-a-server}

- 创建账户或服务器的页面遵循[品牌](../../foundations/brand.md#how-much-brand)：1024px 起，表单旁边是一块品牌面板；1024px 以下，表单上方是一条外框栏。
- 1024px 起，表单在左侧占 5 份中的 2 份，表单本身最宽 448px。面板里的预览跟着表单变化：输入服务器的名字和地址时，它们就出现在预览里。
- 表单下方有一行文字说明当前登录的是谁，并带有 Sign Out。

### 设置对话框 {#the-setup-dialog}

步骤依次是：

1. **连接一台计算机**（960px 宽）：说明计算机是什么，给出要运行的命令，以及一个跟踪连接过程的日志。如果服务器已经有计算机但都离线了，这一步变成 Start your computer，给出让其中一台重新上线的命令。
2. **创建第一个 Agent**（"Meet Cindy"），表单和 Create Agent 一样。
3. **向 Agent 介绍你自己**：一份由选项网格组成的简短问卷。
4. **选择显示风格**。
5. **交接**：Agent 从这里接手。

第 3 到 5 步共用一个外框，720px 宽、约 520px 高，所以对话框在这几步之间不会改变大小。这是展示外框，只有这几步、Upgrade to Pro 对话框和 Pro 的 Add seats 对话框使用，不属于 Dialog 的四种尺寸（[Dialog](../../../packages/ui/src/components/dialog/dialog.md#variants)）。每一步都有：

- **标题区**：用 Space Mono 写的步骤标签 "Set up your server"，用 `text-title` 的标题，以及一行说明。
- **内容区**，在外框内滚动。
- **底部栏**：左侧是弱化的文字链接（[TextLink](../../../packages/ui/src/components/text-link/text-link.md)）（Switch server，前两步还有 Server settings），右侧是粉色按钮（Next、Continue、Let's Go）。窄屏上粉色按钮占满宽度。

```example
dialog/compositions/server-setup-step
```

## 规则 {#rules}

- 品牌元素只在交接这一步使用（[品牌](../../foundations/brand.md#how-much-brand)）：Agent 99px 的头像跳一下，旁边弹出两个方形标记然后淡出（[动效](../../foundations/motion.md#usage)）。其他步骤都是纸面上的普通对话框。
- 不要加 Skip 按钮或步骤圆点。退出设置的方式是 Switch server。
- 步骤标签用 sentence case。[0002](../../decisions/0002-no-all-caps.md) 允许新手引导屏幕上有一个全大写的步骤标签；产品没有用。
