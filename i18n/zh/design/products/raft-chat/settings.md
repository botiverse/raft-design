---
title: Raft Chat — 设置
summary: 设置这个目的地：各个分组，它们打开的页面，搜索设置，通知，Sign out 和危险区。
sourceHash: b059b1e3
---

# Raft Chat — 设置

设置分组列出这个人自己的设置、服务器的设置和 Raft 的资源。在桌面端，这几组就是侧栏，页面在它们旁边打开；在手机上，它们是一个标题为 Settings 的推入页面，从服务器标签的弹出层打开（[导航](../../patterns/navigation.md#the-server-tab-on-a-phone)），每一行再打开一个推入页面，带返回到列表的返回按钮。

## 结构 {#structure}

### 列表 {#the-list}

```example
sidebar/compositions/settings-list
```

1. **标题栏**：手机上是推入页面的标题栏 Settings，带返回；桌面端是 Settings。
2. **一个搜索框**，Search settings，在各组上面（[搜索设置](#searching-settings)）。
3. **各个分组**，每组是一个分组标签加若干带图标和名字的侧栏行。手机上的列表里没有成员和计算机：它们是服务器标签弹出层里的按钮。
   - Personal：Account、Language & region、Appearance、Notifications。
   - 当前服务器，以它的名字命名：它的 Theme 和 Notifications。
   - Workspace：Server profile，然后是这个人有权查看且服务器已开启的项：RaftBench、Plan & billing、Administration、IM bridges、Applications、Labs、AI providers。
   - Resources：About、Documentation（指向文档站的链接）、Feedback、Release notes。

- 有新回复时 Feedback 显示一个粉色像素点；手机上有计算机需要处理时，服务器标签弹出层里的 Computers 按钮也显示一个，反馈有新回复时 Settings 按钮也一样（[Raft Chat](./README.md#attention-dots)）。
- 在桌面端，默认打开 Account，它的行是黄色贴纸。在手机上，打开某一行之前什么都不选中。

### 设置页面 {#a-settings-page}

- 每个页面都用[表单](../../patterns/forms.md)里的卡片搭建。Language & region 没有 Save：每个值选中时就生效（[表单](../../patterns/forms.md#settings-that-apply-at-once)）。

### 搜索设置 {#searching-settings}

列表顶部的搜索框按人们对设置的叫法找到它，不管它在哪一页。它只搜设置，所以要说明这一点：占位文字是 Search settings。这是在一个地方里面开始的搜索，手机上在搜索标签以外也允许（[导航](../../patterns/navigation.md#search-on-a-phone)）（artin，2026-11-06，#proj-raft-ui:#204）。

- **位置：**在各组上面，桌面端在侧栏顶部，手机上在 Settings 页面顶部，触屏上高 44px。它是带搜索图标的 InputGroup，有文字后出现清除按钮（[InputGroup](../../../packages/ui/src/components/input-group/input-group.md)），放在 `role="search"` 里。
- **匹配什么：**每个设置的名字和说明、它所在的分组和页面，以及人们对它的其他叫法，显示语言和英文都算：搜 "Enter" 或「回车」能找到消息怎么发送。不区分大小写和全角半角。只找这个人看得到的设置，也就是列表里显示给他的那些。哪些设置可搜、每个设置有哪些叫法，由实现决定，不在这一页规定。
- **结果：**一有文字，结果就取代各组的位置。每条是设置名，下面一行是它的页面和分组（"Appearance · Message box"），匹配的字照搜索的规则标出（[搜索](../../../packages/ui/src/components/search/search.md#content)）；如果是靠别的叫法匹配到的，第二行也显示那个叫法。名字匹配排前面，然后是别的叫法，最后是说明；同一档按列表里的顺序。手机上一条结果就是列表的行加第二行，约 56px。
- **打开一条：**打开它的页面，把这个设置滚到视野里，并标为已定位（[已定位](../../foundations/states.md#located)）。桌面端结果留在侧栏里，打开的那条处于选中状态，可以接着从那里打开下一条。手机上推入页面，返回时回到结果，搜索词保留。
- **没有匹配：**结果的位置显示一个 EmptyState：No settings match "launch"，Try another word, or search everything for messages and people，只有一个按钮，用同样的搜索词搜全部（[EmptyState](../../../packages/ui/src/components/empty-state/empty-state.md)）。
- **键盘：**在设置里按 ⌘F 或 Ctrl+F 聚焦搜索框，网页和桌面应用都是。焦点已经在搜索框里时再按一次，交给浏览器自带的查找，这样页面上的文字仍然能搜（和 Slack、VS Code 一样；Kirby）。向下键进入结果，Enter 打开高亮的那条（[搜索](../../../packages/ui/src/components/search/search.md#behavior)）。Escape 清空搜索词；搜索框已经是空的时候，离开搜索框。

结果是跳到那个设置，而不是把设置放在结果里原地修改：在原来的位置修改，页面的上下文还在，比如危险区的警告；App 里由网页画的那些页面可以打开到某个设置，但没法拆开。

### 通知 {#notifications}

这个页面包括：

- 一张 Add Raft to Home Screen 卡片，带 Add 按钮，出现在能安装 Raft 但还没安装的手机上；
- 一张 Push Notifications 卡片，说明它推送什么（私信、直接提及和关注的消息列里的回复）以及当前状态，带 Enable push notifications，开启后变成 Disable 和 Send test push。卡片最后是一个 Mute this server 开关，立即生效。

在桌面应用里，这个页面只有一张 Desktop notifications 卡片，说明通知由系统管理，带 Send a test notification。

## 规则 {#rules}

- 把 Sign out 放在 Account 的最后，在一张 Session 卡片里：一个橙色按钮，点击后打开确认。
- 把危险区放在 Server profile 的最后：Leave server，所有者还有 Delete server（[表单](../../patterns/forms.md#danger-zone)）。开启了删除账户的地方，Account 最后有它自己的危险区：Delete account。
