---
title: 动效
summary: 按下、悬停、滑入、拖动落定和头像变化的时长与缓动，以及状态从不循环播放动画这条规则。
sourceHash: ab708118
---

# 动效

Raft 里的动效用来确认一个操作，或者说明某样东西从哪里来。它从不用于装饰，状态也从不自己动：人们一盯就是几个小时的屏幕，要保持静止。

## 原则 {#principles}

- **状态不循环。** 正在工作的 Agent 是一盏静止的黄灯。产品中唯一循环的动画是加载时的像素加载指示器，加载一结束它就消失。唯一的例外是 Android 网页上的下拉刷新：刷新时它画 Android 自己的旋转圆弧（[PullToRefresh](../../packages/ui/src/components/pull-to-refresh/pull-to-refresh.md#on-android)）。
- **按下不位移。** 悬停和按下只叠加一层浮层；任何东西都不移动、不缩放。
- **减弱动态效果时全部停止。** 开启 `prefers-reduced-motion` 时，本页的所有动画都关闭。

## 缓动 {#easing}

`ease-slide` 是移动类动效的缓动曲线：滑入、面板，以及头像组的变化。拖动落定有自己的缓动 `ease-drag-settle`（`motion-drag-settle-easing`），是一条 ease-out 曲线：离手时快，落地时轻。

```tokens
motion
```

## 用法 {#usage}

| 动效 | 做法 | 时长 |
| --- | --- | --- |
| 按下和悬停 | 在控件上叠加对应悬停层级的浮层（[悬停和按下](./states.md#hover-and-press)）。不要改变填充，也不要移动或缩放控件 | 90ms 到 120ms |
| 滑入和面板 | `ease-slide` | 220ms 到 380ms |
| 手机上推入或返回一个页面 | 用平台默认的转场，手机网页、iOS 和 Android 都一样（[导航](../patterns/navigation.md#what-each-platform-draws)） | 平台默认 |
| 键盘收起时标签栏重新出现 | 用平台默认的转场，不要瞬间跳出（[MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#behavior)）。页面滚动时标签栏不动 | 平台默认 |
| 拖动落定：放下时，被拿起的副本滑进它的位置，取消时滑回原处；相邻项向两侧滑开，让出位置；放下时布局重新排列，与滑行同步（[拖放](../patterns/drag-and-drop.md#drop-and-cancel)） | `motion-drag-settle-easing` | `motion-drag-settle-duration`，160ms |
| 有人加入或离开头像组 | 头像向两侧滑开并淡入或淡出，使用 `ease-slide` | 180ms 到 220ms |
| 跳转到达的那一项（被定位） | 立即显示 `info-soft`，保持 1.2 秒，再用 `ease-out` 淡出；开启减弱动态效果时静止保持 2 秒后直接消失（[被定位](./states.md#located)） | 共 2 秒 |
| 文字和数字变化 | 直接替换文字。不要做数字滚动 | 无 |
| 品牌时刻（仅限初始设置） | 只播放一次，从不循环：在初始设置的最后一步，Agent 的头像跳入，旁边弹出两个方形标记后淡出；在创建服务器的页面上，预览中的工作空间按钮在名称改变时弹一下 | 580ms；180ms |

- 只在有鼠标指针的设备上显示悬停（`@media (hover: hover)`）。
- 个人资料上的大头像不要漂浮或倾斜。它保持静止。
- 居中的浮层（对话框、确认框、搜索、任务详情、大表单）带遮罩，出现和消失都没有动画：它们本来就在原位，不是从哪里来的。浮层中只有抽屉和底部面板会滑入，因为滑入说明了它们来自哪一边；在手机上这也包括带输入框的对话框，它在手机上就是一个底部面板（[Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)）。所有居中浮层的规则都一样，不要给其中某一个单独加动画。
- App 的各列变化时没有动画：折叠或展开侧栏，让消息列进入或退出专注模式（Focus Mode），无论是用按钮还是拖过尽头。它们立刻切换，因为给整列的位置或宽度加动画会闪烁（[AppShell](../../packages/ui/src/components/app-shell/app-shell.md)、[Resizable](../../packages/ui/src/components/resizable/resizable.md)）。
- 遮罩随它的表面一起动：在居中浮层下面，遮罩立即出现；在抽屉或底部面板下面，遮罩以与滑入相同的时长和缓动淡入，并在表面离开时淡出，这样面板还在途中时页面不会一下子变暗。开启减弱动态效果时，遮罩立即出现。参见[选择组件](../components/overview.md#overlays)。

## 相关 {#related}

- [状态](./states.md)：悬停层级。
- [拖放](../patterns/drag-and-drop.md)：放下和取消时的滑行。
- [正在工作的 Agent](../people-and-agents/working-agents.md#motion)：如何不用动画来表现正在工作的 Agent。
- [品牌](./brand.md)：哪里允许使用品牌插画。
