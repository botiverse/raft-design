---
title: FilesPanel
summary: 某个地方分享过的文件列表，每个文件一行，显示类型、名称、大小和时间；点击打开预览，并提供 Jump to Message 和 Download。
sourceHash: 2ff9b267
---

# FilesPanel

文件面板列出某个地方（比如 #launch-week）分享过的文件，最新的在前。每一行显示文件的类型、名称、大小和分享时间；点击这一行会打开预览，两个图标按钮分别跳转到它所在的消息和下载它。它填满对话旁边的 Files 卡片，或者一个完整的 Files 视图。

```example
files/compositions/default
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 频道或对话中分享过的所有文件 | FilesPanel |
| 附在某条消息上的文件 | 文件卡片（[MessageAttachment](../message-attachment/message-attachment.md)） |
| 消息输入框里还没发出的文件 | [FilePreview](../file-preview/file-preview.md)，放在 [Composer](../composer/composer.md) 里 |
| 从某一行打开的图片或视频 | [Lightbox](../lightbox/lightbox.md) |

在对话旁边的 Files 卡片里，文件用 Tasks 卡片的那种紧凑行列出（[紧凑列表的行](../../../../../design/patterns/tasks.md#rows-in-a-compact-list)）：类型图标、名字和大小，然后是紧凑写法的时间（今天写 15:00，今年写 Oct 21，更早写 2025-10-21），右端是操作，在卡片默认的 360px 宽度下全在一行，行之间用细线，而不是每个文件一张卡片。Jump to Message 跳到那条消息，消息显示被定位的高亮（[被定位](../../../../../design/foundations/states.md#located)）。`FileRow` 是完整 Files 视图里的卡片行，还没有紧凑变体。

一个地方的文件在界面上放在哪里（侧边卡片或频道详情），见[导航](../../../../../design/patterns/navigation.md#several-views-of-one-place)和[页面结构](../../../../../design/patterns/page-structure.md#sidebar-and-side-panel)。

## 结构 {#anatomy}

- `FilesPanel`：`layer-canvas` 上的一个 `section`，填满所在的列。必需。
- `FilesViewport`：滚动容器。必需。
- `FilesList`：一列行，彼此间隔 8px。
- `FileRow`：一个文件，在 `layer-card` 上，带 `line-hairline` 轮廓和 `radius-container`。
  - `FileRowOpen`：覆盖类型、名称和详情的按钮，打开预览。
    - `FileThumbnail`：一个 36px 的方框，放文件的 [FilePreview](../file-preview/file-preview.md)，或通过 `FileImage` 放缩略图。
    - `FileContent`：`FileName`，然后是 `FileMeta`，每项详情（大小、时间）一个 `FileMetaItem`，使用 `text-mono-meta` 和 `foreground-hint`。
  - `FileActions`：这一行的 `FileAction` 图标按钮，默认是幽灵按钮。

```example
files/compositions/file-row
```

## 变体 {#variants}

文件类型只改变图标：文档、代码、压缩包或其他文件，或者图片、视频的缩略图（[FilePreview](../file-preview/file-preview.md#variants)）。

```example
files/compositions/file-types
```

## 状态 {#states}

空、加载中和失败有什么区别，见[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)。

- **空**：视口里放一个 [EmptyState](../empty-state/empty-state.md)，带回形针图标、No files yet，并说明文件从哪里来。
- **加载中**：一组行的骨架屏，大小与之后替换它的行相同。
- **失败**：在面板范围内显示错误，带 Retry，而不是显示空状态。
- **还有更多**：人们接近列表末尾时加载下一页。最后一行下方放一个 Load More 按钮，用于滚动无法触发加载的情况。
- **菜单打开**：从某个 `FileAction` 打开的菜单显示时，这一行盖上 `fill-subtle`，与悬停时同一个浅层级，让菜单所操作的文件保持标记（[悬停和按下](../../../../../design/foundations/states.md#hover-and-press)）。
- **不可用**：操作不可用时，禁用对应的 `FileAction` 或 `FileRowOpen`。

## 内容 {#content}

- 文件名按上传时的样子显示，带扩展名。名称过长时在行尾截断。
- 大小带单位（184 KB），时间写成人们在其他地方看到的样子（Yesterday, 4:18 PM）。

## 无障碍 {#accessibility}

FilesPanel 不添加 Base UI 原语；它的各部分是一个 `section`、若干按钮和一张图片。

- 用 `aria-label` 给 `FilesPanel` 命名：Files。
- 给每个 `FileAction` 一个说明其作用的 `aria-label` 和工具提示：Jump to Original Message、Download File。
- `FileRowOpen` 的名称来自其中的文件名。类型图示是装饰性的（[FilePreview](../file-preview/file-preview.md#accessibility)）。
- `FileImage` 里的缩略图给一个空的 `alt`：旁边的名字已经说明了这是什么文件。

## 规则 {#rules}

- 让整行都是打开预览的目标，并把操作放在 `FileRowOpen` 外面，让每个操作都是独立的按钮。
- `FileAction` 保持默认样式，即 32px 的幽灵图标按钮，让这一行保持安静（[Button](../button/button.md#icon-buttons)）。
- 不要按文件类型给行上色（[FilePreview](../file-preview/file-preview.md#rules)）。
