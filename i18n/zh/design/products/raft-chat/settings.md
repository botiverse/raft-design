---
title: Raft Chat — 设置
summary: 设置这个目的地：Personal、Workspace 和 Resources 三组，它们打开的页面，通知，Sign Out 和危险区。
sourceHash: 8b7fb292
---

# Raft Chat — 设置

设置分三组列出这个人自己的设置、服务器的设置和 Raft 的资源。在桌面端，这几组就是侧边栏，页面在它们旁边打开；在手机上，它们是一个标题为 Settings 的推入页面，从服务器标签的弹出层打开（[导航](../../patterns/navigation.md#the-server-tab-on-a-phone)），每一行再打开一个推入页面，带返回到列表的返回按钮。

## 结构 {#structure}

### 列表 {#the-list}

```example
sidebar/compositions/settings-list
```

1. **标题栏**：手机上是推入页面的标题栏 Settings，带返回；桌面端是 Settings。
2. **三组**，每组是一个分组标签加若干带图标和名字的侧边栏行。手机上的列表里没有成员和计算机：它们是服务器标签弹出层里的按钮。
   - Personal：Account、Language & Region、Appearance、Notifications。
   - Workspace：Server Profile，然后是这个人有权查看且服务器已开启的项：RaftBench、Plan & Billing、Administration、IM Bridges、Applications、Labs、MCP Servers、AI Providers。
   - Resources：About、Documentation（指向文档站的链接）、Feedback、Release Notes。

- 有新回复时 Feedback 显示一个粉色像素点；手机上有计算机需要处理时，服务器标签弹出层里的 Computers 按钮也显示一个，反馈有新回复时 Settings 按钮也一样（[Raft Chat](./README.md#attention-dots)）。
- 在桌面端，默认打开 Account，它的行是黄色贴纸。在手机上，打开某一行之前什么都不选中。

### 设置页面 {#a-settings-page}

- 每个页面都用[表单](../../patterns/forms.md)里的卡片搭建。Language & Region 是一张卡片，有自己的 Save。

### 通知 {#notifications}

这个页面包括：

- 一张 Add Raft to Home Screen 卡片，带 Add 按钮，出现在能安装 Raft 但还没安装的手机上；
- 一张 Push Notifications 卡片，说明它推送什么（私信、直接提及和关注的消息列里的回复）以及当前状态，带 Enable Push Notifications，开启后变成 Disable 和 Send Test Push。卡片最后是一个 Mute this server 复选框，带 Save。

在桌面应用里，这个页面只有一张 Desktop notifications 卡片，说明通知由系统管理，带 Send a test notification。

## 规则 {#rules}

- 把 Sign Out 放在 Account 的最后，在一张 Session 卡片里：一个橙色按钮，点击后打开确认。
- 把危险区放在 Server Profile 的最后：Leave Server，所有者还有 Delete Server（[表单](../../patterns/forms.md#danger-zone)）。账号不能在设置里删除。
