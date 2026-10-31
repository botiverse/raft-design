---
title: 层级
summary: 哪些东西会浮起并投下阴影，哪些控件浮在对话之上却不带阴影，弹出层如何定位，以及焦点环。
sourceHash: 61b8900b
---

# 层级

控件和卡片平铺在页面上。只有短暂浮在页面之上的东西（菜单、弹出层、对话框、轻提示）才投下阴影，而且它们投下的都是同一种柔和阴影。浮在对话之上、把人带到对话中某处的控件保持平铺（[浮动控件](#floating-controls)）。

## 原则 {#principles}

- **控件和卡片不加阴影。** 控件靠墨色边框来标记，不靠阴影，即使它浮在内容之上也是如此。有两个例外，都是暂时离开原位的东西：拖动任何东西时拿起的副本，以及展开的评论卡片。
- **所有浮起的东西用同一种柔和阴影。**
- **硬朗的贴纸阴影只用于品牌插画。**

## Token {#tokens}

```tokens
elevation
```

```tokens
focus
```

| Token（工具类） | 用于 |
| --- | --- |
| `elevation-float`（`shadow-float`） | 菜单、下拉选择列表、抽屉、底部面板、对话框、个人资料卡、工具提示、轻提示、消息的悬停工具栏和选中文字的工具栏（浮在所操作消息之上的弹出层）、拖动任何东西时拿起的副本，无论是一行、一个标签页、一张卡片还是一个分区的头部，放在 `layer-popover` 表面上，带 `line-seam` 外圈，不缩放也不倾斜（它被从所在的列表中拿起；留在原处、显示为 40% 的那一项不投阴影；[拖放](../patterns/drag-and-drop.md#what-follows-the-hand)）、浮在频道消息上方时的侧边列（[频道的侧边列](../patterns/responsive.md#the-channels-side-columns)）、从栏上拉下来盖在对话上的任务头部，它下面没有分隔线（[任务](../patterns/tasks.md#pulling-the-task-head-down)），以及文档边栏中展开的评论卡片（它被从卡片列中拿起，其他卡片为它让开位置；[评论](../patterns/comments.md)） |
| `elevation-sticker`（`shadow-sticker`） | 仅限品牌插画：个人资料上和初始设置最后一步的 99px 头像，以及创建服务器页面上新服务器的预览（[品牌](./brand.md#how-much-brand)）。其他地方都不用 |
| `focus-ring`（`shadow-focus`） | 所有能用键盘到达的元素，在键盘到达它时 |

## 弹出层 {#popups}

菜单、下拉选择和筛选列表、个人资料卡在打开它们的元素旁边打开。每个组件都遵循同样的规则，所以弹出层不会超出窄屏，也不会让页面在人的眼前移动。

- 弹出层浮在整个页面之上。它们从不占用布局空间。
- 弹出层碰到窗口边缘时，移动它或翻到另一侧；不要让它超过剩余的空间。
- 在手机上，和屏幕差不多宽的弹出层离屏幕两边各 8px：宽度是屏幕宽度减去两边各 8px，最多 480px，被推向哪一边，就停在离那一边 8px 的地方。这 8px 从屏幕边缘量起，而不是从安全区量起，和服务器列表一样；外壳留有窗口安全区时（比如折叠屏手机的系统竖列），从安全区量起（[页面结构](../patterns/page-structure.md#frame-insets)）。这是 stdrc 为服务器列表（在主页的顶栏下方，以及标签栏上方）选定的内缩（[导航](../patterns/navigation.md#the-server-tab-on-a-phone)），每个这么宽的弹出层都用它，无论它是从一个栏里弹出，还是从栏里的某个按钮弹出，比如通知中心（[NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md#behavior)）。这样从同一个顶栏打开的弹出层彼此对齐，并在屏幕两边之间居中。竖着拿的手机永远碰不到 480px 的上限（最宽的也只剩 424px），所以竖屏时它总是居中；这个上限只是让横过来的手机（667px 宽）不会得到一个 650px 宽、比里面的内容宽得多的弹出层。宽度取定位器的 `--available-width`（屏幕宽度减去两边各 8px 的内边距，不含滚动条），而不是 `100vw`：窗口很窄时，`100vw` 会把桌面端窗口的滚动条也算进去。
- 弹出层打开时、有人在里面输入时，不要滚动或移动页面。
- 弹出层始终跟着打开它的元素。弹出层开着时页面在下面滚动或移动（无论是整个窗口滚动，还是窗口里的某个面板滚动），弹出层都随触发它的元素一起移动；停在原地的弹出层会指向滚到那个位置的别的东西。右键菜单例外：它属于打开它的那个点，而不属于某个元素（[ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md#behavior)）。

## 浮动控件 {#floating-controls}

对话中的跳转胶囊，Back to Bottom、"3 New Messages" 和 "Next Unread Thread (3)"，浮在消息列表的底部或顶部（[MessageList](../../packages/ui/src/components/message-list/message-list.md#jump-controls)）。它们是唯一浮在内容之上的控件，而且不带阴影。

- 浮动控件按它本来的控件画：一个 `outline` 样式的 Button，墨色边放在不透明的 `layer-card` 上。不透明的卡片让它在下面滚过的消息之上依然清晰，墨色边像其他地方一样把它标记为控件。
- 不要给它加柔和阴影。阴影的意思是「这东西暂时浮在页面上，用完就会消失」：菜单、弹出层、浮在所操作消息之上的工具栏。跳转胶囊属于对话本身，列表在它下面滚动时它待在原处，无处可跳时自己消失；加了阴影，对话看起来就像有个弹出层开着。
- 不要用浮动控件承载页面上的操作。它只用于在它所浮的列表中移动；操作应放在头部或工具栏里（[FloatButton](../../packages/ui/src/components/float-button/float-button.md)）。

## 叠加的浮层 {#stacked-overlays}

模态表面（对话框、警告对话框、模态面板）用遮罩压暗它下面的一切，这样唯一能用的就是最上面那个。当一个模态表面从另一个打开时，这一点也必须成立：下面的表面要退后一步，否则白色对话框叠在白色面板上，没有任何东西说明两者中哪个是当前可用的。

- 在每个模态表面的正下方放一层遮罩，包括从另一个模态表面打开的那个。遮罩才是说明「这个在最上面」的东西；只有阴影说明不了。
- 所有遮罩画法相同：`layer-backdrop`，在另一个模态表面之上用 `layer-backdrop-nested`，不加模糊，也不加自己的色调，无论它在对话框、抽屉、底部面板还是搜索浮层下面（stdrc，2026-10-21）。它如何出现跟随它的表面（[动效](./motion.md#usage)）。
- 第一个表面用 `layer-backdrop`。从它打开的表面用更浅的 `layer-backdrop-nested`（两种主题下都是 40%），这样下面的表面变暗，而页面不会变黑。浅色模式下，一层遮罩让白色页面剩下约 35% 的亮度，两层完整的遮罩会只剩 12%；用嵌套遮罩则保留约 21%。深色模式下，第一层遮罩是 60%，嵌套的 40% 依然能让下面的深色表面明显退后，又不会和页面融成一片。
- 模态表面最多叠两层。要打开第三层时，替换最上面那层，或者把流程移到一个页面里。
- 从面板打开的面板是例外：下面那个面板自己退后（[Drawer](../../packages/ui/src/components/drawer/drawer.md#behavior)）。

raft-ui 会自动处理这件事。模态的 `Dialog`、`AlertDialog` 或 `Drawer` 会告诉它根节点下的所有内容它已打开，方式与 Base UI 判断对话框是否嵌套相同，所以在它下面打开的对话框、警告对话框或面板会画出嵌套遮罩。非模态的不算：它下面不会被压暗。Base UI 默认不给嵌套对话框画遮罩，这就是从面板打开的确认框曾经叠在一个未压暗的面板上的原因。

应用自己的模态表面（有自己的遮罩、Esc 和焦点）用 raft-ui 的两个部件加入同一个叠放顺序（目前在 `@botiverse/raft-ui/wip` 里）：

- `OverlayLayerProvider`（`kind`、`modal`）：用它包住这个表面的遮罩和内容。从里面打开的 raft-ui 浮层就会在它上面画嵌套遮罩。应用自己的模态框不管长什么样都用 `kind="dialog"`：`"drawer"` 是给 Base UI Drawer 用的，它在另一个抽屉下面会自己嵌套，只在 `"dialog"` 之上才画自己的遮罩。
- `useParentOverlayKind()`：在这个 provider 里面调用，返回打开这个表面的那个表面的类型；如果它是第一层，返回 `null`。不是 `null` 就表示：画 `layer-backdrop-nested`。

两者都只用于模态浮层。非模态的浮层传 `modal={false}`，什么也不加，所以在它里面调用 `useParentOverlayKind` 会把下面那层当成自己的。两者读取的是 React context（portal 也算在内），所以只能看到浮层所在那棵树里的表面：把浮层渲染在打开它的那个表面里面。从另一棵 React 树打开的浮层（比如应用从全局 store 打开的确认框）不会被它们叠放，需要 `layer={1}` 或者应用自己的判断。

## 焦点环 {#focus-ring}

`focus-ring` 是先一道 2px 的表面色间隙，再一道 2px 的墨色。它是墨色，不是黄色：黄色的焦点环在黄色外框和黄色贴纸上会看不见。

- 给每个能用键盘到达的元素一个可见的焦点环。
- 只在键盘导航之后显示，点击或轻触之后不显示（[状态](./states.md#focus)）。根节点标有 `data-input-modality="pointer"` 时，这个 token 本身会被清空，所以 `shadow-focus` 自动遵循这条规则。
- 贴着容器边缘的元素，比如菜单的搜索行，改用向内的 2px 墨色描边。它不是这个 token，所以要加上 `keyboard:` 变体（`focus-visible:keyboard:inset-ring-2`）来遵循同一条规则。
- 贴纸获得焦点时保留它自己的墨色边（提及标记、选中的侧栏行、筛选），把焦点环画在它外面。不要用焦点环替换这条边。
- 复合控件的哪一部分显示焦点环，见[状态](./states.md#focus)。

## 相关 {#related}

- [状态](./states.md)：悬停、按下和焦点。
- [拖放](../patterns/drag-and-drop.md)：被拖动的项拿起后的样子。
- [视觉舒适度](./comfort.md#surfaces)：内容什么时候才需要卡片或边框。
- [品牌](./brand.md)：贴纸阴影可以出现在哪里。
- [选择组件](../components/overview.md#how-to-choose-a-component)：该用哪种弹出层。
