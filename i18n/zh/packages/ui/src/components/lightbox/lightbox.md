---
title: Lightbox
summary: 盖在遮罩上的全屏查看器，用于图片和附件预览，带上一个和下一个、缩略图，以及一个关闭按钮。
sourceHash: befabc62
---

# Lightbox

图片查看器在整个窗口上以完整尺寸显示一张图片或一个文件预览：图片放在全屏的 `layer-backdrop` 上，配上一个、下一个，以及一个用来关闭的图标按钮（[用现有部件搭建](../../../../../design/components/overview.md#file-viewer)）。有人从消息里打开图片或附件时用它。它只用于媒体和预览。

```example
lightbox/compositions/image-lightbox-shell
```

## 何时使用 {#when-to-use}

| 场景 | 用法 |
| --- | --- |
| 以完整尺寸查看图片、截图或视频 | Lightbox，图片外壳 |
| 以完整尺寸预览附件（HTML 页面、文档） | Lightbox，附件外壳 |
| 决定、表单或任何不是媒体的东西 | [Dialog](../dialog/dialog.md) |
| 人在页面旁边阅读的详情 | [Drawer](../drawer/drawer.md) |
| 消息里的附件本身 | [MessageAttachment](../message-attachment/message-attachment.md) |

## 结构 {#anatomy}

- `Lightbox`：根元素。它保存图片查看器是否打开。必需。
- `LightboxTrigger`：打开图片查看器的东西，通常是消息里的图片或文件卡片。
- `LightboxContent`：全屏的那一层，后面是遮罩。必需。
- `LightboxTitle`：文件名。
- `LightboxClose`：关闭按钮。必需。
- `LightboxStage`：让媒体居中的区域。必需。
  - `LightboxMedia`：图片或视频，最高为窗口高度的 80%，最宽为窗口宽度的 86%。
  - `LightboxNavigationButton`：上一个（`direction="previous"`）和下一个（`direction="next"`），44px 的按钮，距左右边缘 32px。
  - `LightboxInfoDock` 加 `LightboxInfoBar`：靠近底部的一条浮动小栏，用 `layer-popover` 和 `shadow-float`，里面放 `LightboxInfoTitle`（文件名）和 `LightboxInfoActions`（比如 Download）。它是一条浮动工具栏，和消息的悬停工具栏一样高 36px：按钮 28px，距栏内边缘 4px，按钮之间间隔 4px，用 `radius-chip`；在触屏上点击区域高 44px，向相邻按钮方向只延伸到间隔的一半（[形状](../../../../../design/foundations/shape.md#inside-a-frame)）。
  - `LightboxThumbnailStrip` 加若干 `LightboxThumbnail`：沿底部排列的 48px 缩略图；`active` 标出当前显示的那一张。
- `LightboxToolbar`：附件外壳的顶栏，取代浮动的关闭按钮，用 `layer-canvas`，下方有一条 `line-seam`。里面放 `LightboxHeaderMeta`（先是标明预览类型的 `LightboxHeaderLabel` 或 [Badge](../badge/badge.md)，再是 `LightboxTitle`）和 `LightboxActions`，`LightboxClose` 放在最后。
- `LightboxHeader`：放标题和操作的普通顶部行，用于既不需要工具栏、也不需要浮动关闭按钮的外壳。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| 图片外壳：`LightboxClose` 直接放在 `LightboxContent` 里 | 图片和视频。关闭按钮浮在右上角；图片占用整个窗口 |
| 附件外壳：`LightboxToolbar` 放在 `LightboxStage` 上方 | 占满舞台区域的文件预览，比如 `iframe` 里的 HTML 页面。工具栏写出文件名，放文件的操作和关闭按钮 |

```example
lightbox/compositions/attachment-preview-shell
```

## 状态 {#states}

- **第一项和最后一项：**上一个或下一个禁用。它仍可获得焦点（`aria-disabled`），但忽略点击。
- **缩略图：**当前显示的那项边缘为实色；其他项变暗，悬停时恢复。

## 行为 {#behavior}

- 图片查看器出现和消失都没有动画，和其他居中浮层一样（[动效](../../../../../design/foundations/motion.md#usage)）。
- Esc、关闭按钮、点击遮罩和 Cmd+W（Ctrl+W）都会关闭它。Cmd+W 关闭的是图片查看器，不是浏览器标签页；传 `closeOnModW={false}` 可以把这个快捷键留给浏览器。
- 关闭按钮和各条栏都避开手机的安全区域。
- 当前显示哪一项由调用方保存。上一个、下一个、缩略图和方向键都会改变这个索引。

## 内容 {#content}

- 图片查看器的标题用文件名。名字太长时在末尾截断。
- 在工具栏的标签里写出预览类型，用 sentence case：HTML preview。

## 无障碍 {#accessibility}

- Lightbox 封装了 Base UI 的 Dialog。它提供 `dialog` 角色、焦点锁定和 Esc；raft-ui 加上了 Cmd+W 快捷键。
- `LightboxTitle` 只是普通文字，不是对话框的名称。对话框的名称要自己提供：在 `LightboxContent` 上加 `aria-label`，或者用一个带名称的 `render` 元素。
- `LightboxContent` 打开时不移动焦点，关闭时也不归还焦点（`initialFocus` 和 `finalFocus` 为 `false`）。键盘用户会打开图片查看器时，传入这两项，让焦点进入图片查看器，关闭后回到触发元素。
- 给 `LightboxClose`、每个 `LightboxNavigationButton` 和每个只有图标的操作加 `aria-label`："Close"、"Previous image"、"Next image"、"Download"。
- 图片查看器打开时，把左、右方向键绑定到上一个和下一个。
- 给每个 `LightboxThumbnail` 加 `aria-label`（"Show product-shot.png"）。`active` 只改变外观：用 `aria-current="true"` 标出当前显示的那一项。
- 给图片一个描述它的 `alt`，给 `iframe` 一个 `title`。

## 规则 {#rules}

- 不要用 Dialog 搭建媒体查看器，也不要在 Lightbox 里放媒体或文件预览以外的东西。
- 图片查看器只有一个关闭按钮，放在右上角（[导航](../../../../../design/patterns/navigation.md#closing)）。
- 在工具栏里，有框的按钮让形状止于 16px 边距线；无框的图标按钮（作为最后一个操作或关闭按钮）让图标框止于边距线，点击区域伸出边距线之外（[对齐](../../../../../design/foundations/alignment.md#the-ends-of-a-header)）。
- 在 Raft Chat 里，每个文件都在附件外壳里打开，图片也一样，这样每种文件类型都有同样的工具栏（[文件查看器](../../../../../design/components/overview.md#file-viewer)）。
- 除了遮罩、信息栏和工具栏，不要再加颜色或线条（[用现有部件搭建](../../../../../design/components/overview.md#built-from-existing-parts)）。
