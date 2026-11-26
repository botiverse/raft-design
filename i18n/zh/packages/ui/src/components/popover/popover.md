---
title: Popover
summary: 在人点击的元素旁边打开的小面板，用于少量输入，比如一个选项、一个输入框和一个按钮。
sourceHash: ef1f60c5
---

# Popover

弹出层是在人点击的元素旁边打开的小面板，用来放少量输入：几个选项中选一个、一个输入框、一个按钮。暂缓一条通知或给某样东西改名，一个弹出层就装得下。点击外部或按 Esc 时关闭。

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 悬停时关于某样东西的一句话 | [Tooltip](../tooltip/tooltip.md) |
| 悬停时显示一个人或 Agent 的概要，带链接 | [PreviewCard](../preview-card/preview-card.md) |
| 悬停时显示应用链接到的条目的详情 | 条目卡片（[PreviewCard](../preview-card/preview-card.md#item-card)） |
| 点击后做一个小选择或少量输入（暂缓、改名） | Popover，配合 [RadioGroup](../radio-group/radio-group.md)、[Input](../input/input.md) 和按钮 |
| 一组操作 | [DropdownMenu](../dropdown-menu/dropdown-menu.md) |
| 保持打开、可以滚动的内容 | [Drawer](../drawer/drawer.md) |

哪种浮层适合做什么，见[选择组件](../../../../../design/components/overview.md#overlays)。

## 结构 {#anatomy}

- `Popover`：根组件。管理打开状态。必需。
- `PopoverTrigger`：打开它的元素。必需。
- `PopoverContent`：面板本身，通过 portal 渲染，定位在触发元素旁边，由它的各部分竖着排成一列。`size="item"` 让它成为关于一个应用条目的弹出层（[关于一个条目](#about-an-item)）。必需。
- `PopoverHeader`：一行，放 `PopoverTitle` 和可选的 `PopoverClose`。
- `PopoverTitle` 和 `PopoverDescription`：标题和它下面的一句辅助文字。`PopoverDescription` 只接受一个 `HelperText`，用 `helperText(content, { why, about })` 生成，并把它的 `why` 和 `about` 渲染成 `data-why` 和 `data-about`，只用于后果（`consequence`）、谁会看到或影响到谁（`audience`），或者怎么恢复（`recovery`）（[写作 › 辅助文字](../../../../../design/content/writing.md#helper-text)）；状态（「No comments yet」）或数据是正文。
- `PopoverBody`：面板的文字（一个 `PopoverTitle` 和一个 `PopoverDescription`）或一个列表，离面板边缘 16px（关于条目的弹出层里是 12px）。面板空间不够时，滚动的就是这一部分（[长的弹出层](#a-long-popover)）。实验性，从 `@botiverse/raft-ui/wip` 引入。
- `PopoverActions`：面板末尾的按钮，在 `PopoverBody` 下面：先放离开的按钮，再放确认按钮。实验性，从 `@botiverse/raft-ui/wip` 引入。
- `PopoverSeparator`：面板各部分之间的细线。
- `PopoverClose`：关闭弹出层的按钮。
- `PopoverArrow`：可选的、指向触发元素的箭头，面板从哪一侧打开，它就在哪一侧（`inline-start` 和 `inline-end` 跟随 Base UI 摆放面板时依据的方向，即它的 `DirectionProvider`，没有时为 `ltr`；从右到左的页面会设置它，和所有 Base UI 部件一样）。面板会裁掉超出它的部分，所以带箭头的面板要允许内容超出（`overflow-visible`），[CoachMark](../coach-mark/coach-mark.md) 就是这样做的。
- `PopoverBackdrop`：面板背后的透明层，用来接住面板外部的点击。
- `PopoverPortal`、`PopoverViewport` 和 `PopoverPopup`：更底层的部件。`PopoverPopup` 是不带定位的面板表面。
- `isInsideOverlay(node)`：一个节点是否在 raft-ui 的浮层里，这个弹出层或其他任何浮层；`closestOverlay(node)`：那个浮层的 portal 容器（[在浮层里](#inside-an-overlay)）。
- `PortalContainerProvider` 和 `usePortalContainer()`：provider 下面的每个 raft-ui 浮层渲染在哪里，用于应用里画在另一个窗口里的部分（[在另一个窗口里渲染](#rendering-in-another-window)）。

## 行为 {#behavior}

- 弹出层在触发元素下方打开，与它的起始边对齐，碰到窗口边缘时会移动或翻转（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 在手机上的底部面板或抽屉里，它留在面板头部下方，除非它的触发元素就在头部；设置 `collisionBoundary="clipping-ancestors"` 可以不这样（[Dialog](../dialog/dialog.md#popups-in-a-sheet)）。
- 弹出层避开窗口安全区：外壳为自己保留了窗口的一部分时（`--raft-frame-inset-top`、`--raft-frame-inset-start`、`--raft-frame-inset-end`），它停在离那一部分 8px 的地方，而不是离窗口边缘 8px。start 和 end 两个安全区是顶部那条带的两个角，所以只有触发按钮在这条带里时才算；在这条带下面，弹出层和窗口边缘之间保持它自己的留白（[页面结构](../../../../../design/patterns/page-structure.md#frame-insets)）。网页一个都不设。
- 窗口或任何一层祖先面板滚动或改变大小时，弹出层跟着触发元素走；触发元素滚出它的裁剪区域或离开页面时，弹出层关闭，触发元素仍在页面上时把焦点还给它（[层级](../../../../../design/foundations/elevation.md#popups)）。
- 点击外部和按 Esc 都会关闭它。Cancel 按钮也会关闭它。点进面板外的嵌入框架（`<iframe>`，跨源的也算）算作点击外部；点进面板里的框架不算。导览用的 [CoachMark](../coach-mark/coach-mark.md) 基于这些部件，是个例外：点击外部不会关闭它（[引导提示](../../../../../design/patterns/coach-marks.md#focus-and-keys)）。
- 它没有遮罩；背后的页面保持原样。
- 比可用空间长的弹出层保留头部和操作按钮，在两者之间滚动正文（[长的弹出层](#a-long-popover)）。

### 长的弹出层 {#a-long-popover}

列出长度不固定的东西（比如谁读过一份文档）的弹出层，可能比可用的空间还高。它从不超出窗口，它的头部和按钮也从不被滚走。

- 面板和它的各部分一样高，最高到定位器留给它的空间（`--available-height`）。超过这个高度，`PopoverBody` 滚动：它是一个会缩小的 [ScrollArea](../scroll-area/scroll-area.md)，而 `PopoverHeader`、`PopoverSeparator` 和 `PopoverActions` 保持自己的高度。面板的标题说明列表是什么，按钮对列表进行操作，所以无论列表滚了多远，两者都留在视野里。
- 正文被截断的边缘渐隐：哪个边缘外还有内容，就朝那个边缘在最多 24px 内渐隐（[边缘渐隐](../../../../../design/foundations/spacing.md#edges-fade)）。
- 内容溢出时，正文是一个 Tab 停靠点，这样键盘可以滚动它。它放的是列表而不是文字时，给它命名：`role="region"` 和一个 `aria-label`。
- `PopoverBody` 上的 `className` 属于它的内容，即内边距和间距，和正文能滚动之前一样；`scrollClassName` 属于滚动容器。滚动容器会裁掉内容画到盒子外的部分，所以这样画、又从不需要滚动的正文（面板本身就是一个标记、放在 `overflow-visible` 的弹层里）传 `scrollClassName="overflow-visible"`。
- 把整个列表放在一个 `PopoverBody` 里。用你自己的部件拼成的面板是一个 flex 纵列：里面的 [ScrollArea](../scroll-area/scroll-area.md) 自己会缩小；面板和 ScrollArea 之间的每个盒子都加上 `min-h-0`，让它也能缩小。
- 一直在变长、或者人会一直待在里面的弹出层，改用 [Drawer](../drawer/drawer.md)。

```example
popover/compositions/long-list
```

### 在浮层里 {#inside-an-overlay}

面板被 portal 到打开它的那棵树之外，所以在面板里按下时，`region.contains(event.target)` 为 false，即使这个弹出层属于这个区域。页面自己的处理函数必须不理会浮层的事件时（页面上的快捷键、在区域外按下就关闭区域、从行里开始的拖动），用 `@botiverse/raft-ui` 的 `isInsideOverlay(event.target)` 判断：节点在任何 raft-ui 浮层（弹出层、菜单、选择列表、组合框、工具提示、预览卡片、通知中心、对话框、警告对话框、抽屉、图片查看器或轻提示）里时，它为 `true`；节点属于页面，或为 `null` 时，它为 `false`。文本节点按它的父元素算。

- 处理函数需要的是浮层本身，而不只是有没有浮层时，用 `closestOverlay(event.target)`：节点所在的最内层浮层的 portal 容器，或 `null`。比如，`closestOverlay(target)?.contains(region)` 能判断在浮层里的一次按下，是否和页面画在这个浮层里的某个区域在同一个浮层里。
- 每个 `…Portal` 部件都用 `data-raft-ui-overlay` 标记它的容器，从另一个浮层打开的浮层会被 portal 进那个浮层的容器，所以它同时在两者里面。通过 `isInsideOverlay` 读取它，不要读 Base UI 自己的 `[data-base-ui-portal]`，那是 Base UI 内部的东西。
- 给了页面自己的 `container` 的浮层，仍在它的 portal 容器里。应用自己的 portal（`createPortal`）和 `DragLift` 的副本不是浮层。

### 在另一个窗口里渲染 {#rendering-in-another-window}

Base UI 把每个浮层 portal 到全局的 `document.body`，也就是运行脚本的那个窗口的 body。应用里画在第二个窗口里的部分，比如用 `window.open("about:blank")` 打开、再从主窗口的 React 树用 `createPortal` 填进内容的 Raft Desktop 窗口，会在主窗口里打开它的弹出层、菜单、工具提示和对话框。用 `PortalContainerProvider` 包住这一部分，放在 `createPortal` 里面，并给它第二个窗口的文档里的一个元素：

```tsx
createPortal(
  <PortalContainerProvider container={auxWindow.document.body}>
    <SecondWindowContent />
  </PortalContainerProvider>,
  auxWindow.document.body,
);
```

- 它下面的每个 raft-ui 浮层都渲染在那个元素里：Popover、DropdownMenu、ContextMenu、Tooltip、PreviewCard、Select、Combobox、ComboboxSelect、NotificationCenter、Dialog、AlertDialog、Drawer、Lightbox、`ToastProvider` 的视口、`DragLift` 和 `DragRefusalHint`。没有 provider 时一切照旧：它们渲染在页面的 body 里。
- 每个浮层按这个顺序决定：先是传给它的 `container`（或 `portalProps.container`、`ToastProvider` 的 `portalContainer`），然后是它在里面打开的那个浮层（Base UI 把它渲染在那个浮层的 portal 里，和没有 provider 时一样，所以它留在那个浮层里面），然后是 provider 的容器，最后是页面的 body。
- `container={null}` 表示这个元素还不存在：这时打开的浮层什么都不渲染，等到元素出现为止，而不是在错误的窗口里打开。
- 浮层测量或监听的东西，跟随它渲染所在的文档：窗口的大小和窗口安全区（`--raft-frame-inset-*`，从那个文档的根元素上读取）、它的可视视口、它的媒体查询（对话框在哪里变成手机上的底部面板）、屏幕键盘、在外部的按下、焦点，以及引导提示或图片查看器接管的按键。Base UI 自己的关闭、滚动锁定和焦点归还本来就跟随弹出层的文档。
- 自己测量自己或等待下一帧的组件，在第二个窗口里也能正常工作，并且在主窗口隐藏时继续运行（隐藏的窗口会停掉它的动画帧、降低它的计时器频率，它的尺寸观察器也不再报告）：ScrollArea 的滚动条、VirtualList、CommentMargin 和 `setCommentHighlights`（注册在段落自己的窗口里）、Ellipsis、`useTruncated` 和输入框给截断的值设的 `title`、Dialog 和 AlertDialog 底部按钮的叠放、DescriptionList 和 MessageActionCard 决定标签放在哪里、SegmentedControl、ComboboxSelect、FitToolbar 和 BannerAction。每个组件的帧、计时器、观察器、焦点、选区、字体和按键监听，都取自它所针对的那个元素所在的窗口。
- 对页面自己的元素来说，那个窗口就是全局的 `window`。使用方的测试替换（stub）了 `requestAnimationFrame`、`ResizeObserver` 或计时器时，必须在 `window` 上替换：在 `global-jsdom` 下，`window` 不是 `globalThis`，只设在 `globalThis` 上的替换不会被看到（测试会失败，或者没用上替换就通过了）。
- 在第二个窗口里发出的轻提示，只有通过子树里它自己的 `ToastProvider`，才会显示在那个窗口里（[Toast](../toast/toast.md#toasts-in-another-window)）。
- `usePortalContainer()` 返回 provider 的容器（没有 provider 时为 `undefined`），用于必须遵守同一条规则的应用自己的 portal：`createPortal(node, usePortalContainer() ?? document.body)`。
- 第二个窗口的文档需要自己的一份 raft-ui 样式（`styles.css`，加上主题），和任何文档一样：浮层带着它的主题类（`light` 或 `dark`），不带样式表。

## 内容 {#content}

- 按钮标签用 sentence case，确认按钮重复动词：Snooze、Rename（[写作](../../../../../design/content/writing.md#actions-and-their-dialogs)）。

## 无障碍 {#accessibility}

- Popover 包装 Base UI 的 Popover。它给面板加上 `dialog` 角色，打开时把焦点移进面板，按 Esc 时把焦点还给触发元素。
- 给面板命名：`PopoverTitle` 就是它的标签。没有可见标题时，在 `PopoverContent` 上加 `aria-label`。
- 只有图标的触发元素要有 `aria-label`。

## 规则 {#rules}

- 弹出层宽 300px，内边距 16px。关于一个应用条目的弹出层是例外（`size="item"`，[关于一个条目](#about-an-item)）。
- 不要在弹出层里放粉色按钮。确认用墨色描边按钮（`variant="outline"`），取消用 `variant="ghost"`：弹出层只是一个小步骤，不是屏幕上的主操作。唯一的例外是导览用的 [CoachMark](../coach-mark/coach-mark.md)，它的 Next 和 Done 是粉色的：那一刻它就是唯一要做的事（[引导提示](../../../../../design/patterns/coach-marks.md#the-bubble)）。

## 关于一个条目 {#about-an-item}

关于一个应用条目的弹出层，比如应用的链接在显示预览之前提的那个问题（[PreviewCard](../preview-card/preview-card.md#item-card)），用 `size="item"`：它宽 400px，`PopoverBody`、`PopoverTitle` 和 `PopoverActions` 取消息里卡片的部件，带 12px 内边距和 `text-subhead` 标题。读者允许这个应用之后，标签片打开的是条目卡片，这个弹出层代替的就是它，所以看起来像那张卡片，而不像其他弹出层（stdrc，2026-11-10）：弹出层归属于它讲的东西那一家（[消息里的卡片](../../../../../design/patterns/cards-in-messages.md#popovers)）。其他弹出层，带输入框、选项或简短确认的，保持 300px 和 16px：它是一个独立的小步骤，不是条目。
