---
title: DropdownMenu
summary: 从按钮打开的一列操作，作用于同一个东西；也可以放一个设置式的选择，在当前值旁打勾。
sourceHash: d9e3df4b
---

# DropdownMenu

下拉菜单是作用于同一个东西（一条消息、一个频道、一个任务、一个 Agent）的一列操作，从一个 More 按钮打开（一个对象的菜单用 ⋮，一排操作的末尾用 ⋯；[图标](../../../../../design/foundations/iconography.md#meanings)）。它也可以放一个设置式的选择，比如排序方式或状态，在当前值旁打勾。在桌面端右键、在手机上长按，打开的是同一个菜单，即 [ContextMenu](../context-menu/context-menu.md)。

```example
dropdown-menu/compositions/sidebar-section-header-menu
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 从一个按钮对某个东西执行操作 | DropdownMenu |
| 同样的操作，通过右键或长按触发 | [ContextMenu](../context-menu/context-menu.md)，菜单项相同 |
| 立即生效的设置式选择（排序、状态） | 带单选项的 DropdownMenu |
| 随表单一起提交的值 | [Select](../select/select.md) |
| 点击后的一个小输入（稍后提醒、重命名） | [Popover](../popover/popover.md) |
| 在手机上要去的地方 | 底部面板（[Drawer](../drawer/drawer.md)） |

哪种浮层适合哪种用途，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `DropdownMenu`：根组件。管理打开状态。必需。
- `DropdownMenuTrigger`：打开菜单的按钮。除非传入 `render`，否则渲染为描边 Button。必需。
- `DropdownMenuContent`：菜单本身，通过 portal 渲染，定位在触发按钮旁边，宽度至少 240px。菜单项放不下时在菜单里面滚动（[长菜单](#long-menus)）。`className` 作用于弹出层，用来设它的宽度；菜单项在它的滚动容器里竖着排成一列。必需。
- `DropdownMenuItem`：一个操作。先是 16px 的图标，然后是标签。把标签包在 `DropdownMenuItemLabel` 里可以截断它。
- `DropdownMenuShortcut`：菜单项末尾的键盘快捷键，用 `text-mono-meta` 和 `foreground-hint`。
- `DropdownMenuItemCount`：菜单项末尾的计数。
- `DropdownMenuRadioGroup` 和 `DropdownMenuRadioItem`：一组值，其中一个是当前值，用勾号标出。
- `DropdownMenuLinkItem`（实验性，从 `@botiverse/raft-ui/wip` 导入）：一个本身是另一个页面的选项，比如另一种语言的同一页。它是链接，可以在新标签页打开、可以复制；`current` 标出当前显示的页面，样式和单选项选中时一样（勾和粗体）。
- `DropdownMenuCheckboxItem`：一个独立开关的选项。
- `DropdownMenuLabel`：一组菜单项上方的标题。不可交互。
- `DropdownMenuSeparator`：分区之间的线。
- `DropdownMenuSubmenu` 和 `DropdownMenuSubmenuTrigger`：嵌套菜单，从带 V 形箭头的菜单项打开。
- `DropdownMenuFooter`：底部一行低调的文字，比如计数。它随菜单项一起滚动。
- `DropdownMenuPinnedFooter`（实验性，从 `@botiverse/raft-ui/wip` 导入）：留在长菜单滚动的菜单项下方、一条分隔线之后的菜单项：作用于整个列表的操作，比如 New section 或 Show all（[长菜单](#long-menus)）。把它写成菜单的最后一个子元素。
- `DropdownMenuPortal` 和 `DropdownMenuPopup`：底层部件。`DropdownMenuPopup` 是不带定位的菜单表面。

## 状态 {#states}

悬停、键盘高亮、当前值和禁用项遵循[状态](../../../../../design/foundations/states.md#usage)。在菜单里：

- 高亮和当前值要分开。`brand-soft` 高亮表示鼠标指针或键盘所在的位置；勾号和粗体文字表示选中了哪个值。不要用高亮来标出当前值。
- 禁用项只用 `foreground-disabled` 的文字和图标表示，别的什么都不加。唯一的例外是条目卡片的 More 菜单里被应用禁用的项：它在第二行显示应用给出的原因，因为菜单项没有工具提示，只有看应用给出的原因才能知道它为什么被禁用（[PreviewCard](../preview-card/preview-card.md#item-card)）。

## 行为 {#behavior}

- 菜单在触发按钮下方打开，与触发按钮的起始边对齐，碰到窗口边缘时会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 菜单避开窗口安全区：外壳给自己留了一部分窗口的地方（`--raft-frame-inset-top`、`--raft-frame-inset-start`、`--raft-frame-inset-end`），菜单停在离那部分 8px 处，而不是离窗口边缘 8px 处。start 和 end 两个安全区是顶部那条带的两个角，所以只有触发按钮在这条带里时才算；在这条带下面，菜单和窗口边缘之间保持它自己的留白（[页面结构](../../../../../design/patterns/page-structure.md#frame-insets)）。网页一个都不设。
- 选择一个操作或单选项会关闭菜单。单选项是一组值中的一个，选一次就完成了选择，菜单开着只会挡住它改变的东西。下次打开菜单时，勾号会显示当前值。只有菜单本身会显示结果时（比如新值下面出现一条警告），才在选择单选项后让菜单保持打开（`closeOnClick={false}`）。
- 选择复选项时菜单保持打开：每一项打开或关闭一样东西，人常常一次改好几项。
- 按 Esc 或点击菜单外部会关闭菜单。点进菜单外的嵌入框架（`<iframe>`，跨源的也算）算作点击外部。
- 比可用空间长的菜单在菜单里面滚动，方向键让高亮的菜单项留在视野里（[长菜单](#long-menus)）。
- 菜单项的高度由内容决定：一行是 36px；第二行（比如标签下面的描述）只增加它自己的高度，文字上下的空间不变（[表单和设置](../../../../../design/patterns/forms.md#option-height)）。单选项和复选项也是如此。

## 内容 {#content}

- 菜单项标签用 sentence case：Copy link、Reply in thread（[写作](../../../../../design/content/writing.md#casing)）。
- 打开对话框的菜单项，标签就用对话框的操作。在一个东西自己的菜单里，标签不写这个东西：Rename 打开 Rename Artifact，由对话框的标题说出它的名字（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。

## 无障碍 {#accessibility}

- DropdownMenu 封装了 Base UI 的 Menu。它提供 `menu` 角色、菜单项角色、方向键移动、输入跳转、Esc，以及关闭后焦点回到触发按钮。
- 按菜单作用的对象给菜单命名：在 `DropdownMenuContent` 上加 `aria-label`（"Message from Wug"）。
- 只有图标的触发按钮（比如 More）要加 `aria-label`（"More actions"）。
- 菜单里的每一行都做成菜单项，让方向键能到达。快捷回应也一样：每个都加 `aria-label`（"React with thumbs up"），并对辅助技术隐藏图形。
- 菜单项的图标只作装饰；由标签说明操作是什么。

## 规则 {#rules}

- 不要给 Delete、Stop 这类破坏性的菜单项上色。它们会打开一个确认，也就是 `size="sm"` 的 [Dialog](../dialog/dialog.md#variants)，由对话框里橙色或红色的按钮来表达后果（[反馈](../../../../../design/patterns/feedback.md#confirming)）。警告只在人做决定的地方出现一次，菜单保持为一个安静的列表。iOS、Material 和许多网页应用会把这类菜单项标成红色，macOS 不会；Raft 不给它上色（stdrc，2026-11-12，#proj-raft-ui:95c3f384）。
- 菜单中每两个分区之间用同样的分隔线。
- 不要在菜单里放提交表单值的控件；用 [Select](../select/select.md)。

### 长菜单 {#long-menus}

菜单项来自数据的菜单（分区、服务器、Agent、标签页、版本）可能比窗口还长。它在可用的空间里滚动，从不超出（Artea，#triage:#644，slock #16999 和 #17004：「更多」里的应用列表超出了窗口，最后几项够不到）。

- 菜单和它的菜单项一样高，最高到定位器在触发按钮和窗口边缘之间留给它的空间（`--available-height`，再减去离边缘或窗口安全区的 8px）。超过这个高度，菜单项在菜单里面滚动，用滚轮、触控板、触屏和覆盖式滚动条的滑块都可以，滚动条不占菜单项的空间（[ScrollArea](../scroll-area/scroll-area.md)）。菜单不会长过窗口，也不会为了腾出空间而移动。
- 高亮的菜单项留在视野里。方向键、Home、End 和输入跳转会把它滚进来，它停在离截断边缘 24px 的地方，避开渐隐，所以正要选的那一项从不是被渐隐的那一项。
- 被截断的边缘渐隐：哪个边缘外还有内容，菜单项就朝那个边缘在最多 24px 内渐隐；外面没有内容的边缘不渐隐（[边缘渐隐](../../../../../design/foundations/spacing.md#edges-fade)）。渐隐说明还有更多，而不用在某一项上横切一条硬线；菜单的内边距和圆角保持原样。
- 作用于整个列表的操作要一直看得到，比如分区列表下面的 New section、最近几项下面的 Show all，或放不下的那些位置下面的 Edit：把它放进 `DropdownMenuPinnedFooter`，它让这个操作留在滚动的菜单项下方、一条分隔线之后。不这样做的话，它排在长菜单滚动内容的末尾，菜单藏起的正是唯一与菜单长短无关的那一项。只固定这一类：作用于单个菜单项的操作，或菜单里的一个分区，都和其他菜单项一起滚动。
- 方向键从最后一个滚动的菜单项走到固定的底部，再从那里循环回第一项。
- 短菜单和以前一样：它放得下，所以什么都不滚动、不渐隐、不移动。
- 滚动让长菜单还能用，但不会让长菜单成为合适的控件。人们按名字找一个已知的项、而不是逐个浏览时（一个人、一个 Agent），给他们一个能输入的列表，即 [Combobox](../combobox/combobox.md)（[选择组件](../../../../../design/components/overview.md#picking-something)）。

```example
dropdown-menu/compositions/long-menu
```

### 分区和它们的顺序 {#sections-and-their-order}

菜单是从上往下读的，最前面的几项最容易够到。菜单的分区回答两个不同的问题：哪些操作放在一起（分区），哪个分区排在最前（顺序）。对象决定分区；菜单在哪里打开决定顺序（cindyz，2026-11-22，#proj-raft-ui:edecc8c7）。

**分区。** 作用于同一个对象的操作放在一起，人在哪个对象上打开菜单，哪个对象的操作就放在最前：一条消息、它的消息列、显示它的那一栏。同一个对象的操作，按它们改变什么来分：

1. **用它：** 打开、查看、回复、回应、推进它（Mark as Done、Create task from message）。人仍然待在这个东西上。
2. **把内容带出去：** Quote、Copy link、Copy Markdown、Forward、Download、Open in browser。这个东西本身不变。谁能看到也放在这里，紧跟在 Copy link 后面：人改谁能看到某样东西，是为了分享它。
3. **只对我：** 别人看不到的东西，分成两串：它怎么到我这里（Follow、Mark as unread、Notifications、Mute），以及它在我这里放在哪（Pin、Move to section、Move left 和 Move right）。
4. **它的设置：** 每个人都能看到变化的东西：Rename、Edit、Settle、Start 和 Stop。
5. **结束它：** Leave、Close chat、Archive、Sign out、Delete。
6. **告诉 Raft：** Report abuse、View context。

一个对象只有两三个操作时，把它们放在一个分区里，不按改变什么来拆：Reply in thread、Follow thread 和 Mark thread as unread 是消息菜单里的一个分区。三项的菜单最多需要一条分隔线，放在最常用的那一项下面。

**顺序。** 问一问这个东西在打开菜单的地方是什么，把为这个角色服务的分区放在最前。同一个东西在不同地方扮演不同的角色，所以同样的分区按不同的顺序排：

| 菜单在哪里打开 | 这个东西是 | 第一个分区 |
| --- | --- | --- |
| 对话里的一条消息 | 对话里的一次发言 | 它的消息列和任务 |
| 消息列或任务的头部、Artifact 的 ⋯ | 人在跟进的工作 | Follow，然后是评论和版本 |
| 侧栏里一个对话的那一行 | 一个要不要看的地方 | Mark as read、Notifications |
| 动态里的一行 | 一条要处理的通知 | Mark as read、Mark as Done、Unfollow |
| 收藏、公开的 Artifact、浏览器标签页 | 要带走的内容 | 把内容带出去 |
| Agent 或人的个人资料 | 要联系的人 | Direct message、Call |
| 计算机、连接、侧栏分区 | 要运行或整理的东西 | Create agent、Reauthorize、Sort |

然后按和这个角色的远近，排 1 到 3 里的其他分区，有使用数据的地方再用数据来校正。分区 4、5、6 总是排在最后，按这个顺序：它们用得最少、代价最大，所以没有哪个菜单把它们往前挪。在菜单打开的地方已经有按钮的操作，比如下面有消息输入框的 Reply，或者分区的 +，不需要排在菜单最前。

- 新的操作放在它所在分区的末尾，使用数据显示它比上面的项用得多时，再往上挪。
- 同一个东西不管在哪里打开菜单（头部的 ⋯、右键、长按），都用同样的顺序，即使其中有些显示的项少一些。扮演不同角色的东西（对话里的一条消息、收藏里的一条消息）可以用不同的顺序。
- 一对开关只占一个位置：Follow 和 Unfollow 在原地互换。
- 菜单里的每一项都要有图标，同一个菜单里不要有两项图标长得相像：人是靠图标扫视菜单的（[图标](../../../../../design/foundations/iconography.md#meanings)）。

### 消息菜单 {#the-message-menu}

消息菜单以快捷回应开头（[对话](../../../../../design/patterns/conversation.md#actions)；尺寸见[品牌](../../../../../design/foundations/brand.md#reactions)）。

- 8 个 22px 的快捷回应，每个都是一个作为菜单项的 `MessageReactionQuickButton`，所以方向键能到达它。这一行以一个 `smile-plus` 图标按钮结尾，点它打开全部 emoji。一共 9 个 36px 的按钮，所以菜单和这一行一样宽（348px），比它 240px 的最小宽度更宽，在 360px 宽的屏幕上也放得下；操作也用同样的宽度。
- 让回应和操作对齐：`MessageReactionQuickRow` 两侧各留 3px，这样第一个图案从菜单项图标开始的地方开始（往里 10px），眼睛沿着菜单往下看的那一列在顶部不会向外错出 3px。
- 回应和第一个操作之间放一条分隔线，然后是各个分区（[分区和它们的顺序](#sections-and-their-order)；stdrc 2026-10-20，cindyz 2026-11-22 修订）：
  1. **它的消息列：** Reply in thread；Follow thread 或 Unfollow thread；Mark thread as unread。在消息列里面没有 Reply，Follow 和 Mark as unread 作用于那个消息列。
  2. **它的任务：** Create task from message；在任务的消息上是 Mark as Done 和 Reopen task。任务的讨论在它的消息列里，所以它紧跟在后面。
  3. **它的内容：** Quote、Copy Markdown、Copy link、Forward、Select text（仅触屏）、Select message。这里什么都不会改变。Copy Markdown 保留消息的格式，选中文字再复制会丢掉格式；它是这个菜单里用得最多的一项。
  4. **只给自己：** Save message 或 Remove from Saved，以及 Translate。别人看不到这些。
  5. **告诉 Raft：** View context，在 Agent 的消息上。
- 消息菜单里不放 Mark channel as unread：它作用于整个对话，对话自己的菜单里有它。
- 没有内容的分区不要放，它的分隔线也一起去掉。
