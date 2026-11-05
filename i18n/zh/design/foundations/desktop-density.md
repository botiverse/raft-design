---
title: 桌面端密度
summary: 让桌面端屏幕（768px 起、用鼠标或触控板）紧凑而平静的八条规则：每条规则为什么成立，以及由哪个 token 或部件来保证。
sourceHash: 9532d986
---

# 桌面端密度

在 768px 起、用鼠标或触控板的屏幕上，即 `(width >= 48rem) and (pointer: fine)`，Raft 画出比手机更紧凑的界面：人们从更远处、用更精确的指针操作。这些规则来自桌面端密度工作的设计评审（stdrc，2026 年 11 月）。每条规则说明要做什么、为什么，以及由什么来保证，所以新屏幕读 token 就能遵守，而不是照抄数字。手机和触屏保持它们自己的尺寸（[间距与尺寸](spacing.md)）。

## 规则 {#rules}

### 1. 能按的单行，只用一个尺寸 {#1-one-size-for-a-single-line-you-can-press}

侧栏行、菜单和右键菜单的选项、字段、选择框、按钮、标签页、选中的分段、筛选选择器、作为按钮的标签，以及浮动工具栏的按钮，都是 34px 高：控件高度。并排放在一行里的东西高度完全相同。

- **为什么：** 并排的两个可按元素差一两个像素，整行就显得粗糙，眼睛还会把更高的那个读成更重要。
- **由什么保证：** `control-height`（34px）。`row-height` 和 `option-height` 读它；`md` 尺寸的 Button、Tabs、SegmentedControl、ToggleGroup、PickerTriggerButton、FilterChip 和浮动工具栏用 `md:pointer-fine:` 读它。
- **有意的例外：**
  - 头部自己的按钮是栏按钮，28px，圆角 `bar-button-radius`（`bar-button-size`），放在它们中间的东西也一样（AvatarGroupButton、关注者按钮）：头部的操作要比标题轻。
  - 嵌在字段里的控件（清除按钮、标签）是 `control-embedded-size`（22px），离字段边缘 6px。
  - 分区标题旁的排序和新建控件是 24px 的标签控件，配 12px 的标题，点击目标 28px。
  - 行动号召按钮是 `control-height-cta`（40px）。

### 2. 头部是一行，44px {#2-a-head-is-one-line-44px}

每个头部（面板、侧栏、话题、抽屉、对话框的顶栏、侧边分区）都是一行：标题，然后是同一基线上的辅助信息。它的高度是控件高度加上下的头部留白：34 + 2 × 5 = 44。

- **为什么：** 两行的头部让每一栏的接缝高度不同，还把内容往下推。
- **由什么保证：** `header-height`（`control-height` + 2 × `header-air`）；`PanelHeaderContent` 把标题和 `PanelMeta` 排在同一基线上。

### 3. 外层的东西站得更靠外 {#3-the-outer-thing-sits-further-out}

分区的标题、分组标签和容器的边缘，都比它们包住的内容更靠外，绝不更靠里，也绝不比内容更空。

- **为什么：** 向外缩进的标题读起来是它下面内容的框架；缩进相同时，它读起来只是又一行。
- **由什么保证：** `SidebarSectionHeader` 和 `SidebarGroupLabel` 离侧栏边缘 12px，而行的内容保持在 20px。

### 4. 间距说明什么属于一起 {#4-space-says-what-belongs-together}

组内的间距小于组与组之间的间距，两者又都小于容器的内边距。

- **为什么：** 人把靠近读成属于一起。设置项控件下面的空白和到下一个设置项的空白一样大时，这个设置项就散了。
- **由什么保证：** 组内用 `field-gap`，分区之间用 `section-gap`，外围用 `page-inset`（20px）。堆叠设置项的设置卡片内边距 24px，设置项之间 20px，标题到说明 4px，说明到控件 8px（4 和 8 < 20 < 24）。

### 5. 不给不存在的东西留位置 {#5-reserve-no-room-for-what-isnt-there}

不要为通常不在的东西保留空白：空闲的“已保存”一行、一列已读回执、一个空槽位。

- **为什么：** 预留的空白读起来像有人忘了填的缺口，而且每一行都要为大多数行没有的元素付出空间。
- **由什么保证：** 设置卡片里最后一行结果在空闲时不占空间，出现时画在控件下方的空白里，所以什么都不会移动。

### 6. 按视觉中心对齐 {#6-line-things-up-on-their-optical-centre}

同一行里，不同字号的文字共用一条基线；文字旁的图标、图块或头像以文字的大写字母高度为中心，而不是以行盒为中心；`·` 这样的分隔符是文字里的字形，所以落在 x 高度上。

- **为什么：** 两种字号按盒子居中时，看起来像要从这一行滑下去。
- **由什么保证：** `PanelHeaderContent` 里的 `items-baseline`；头部图块的中心离标题大写字母高度的中点不超过 0.5px。

### 7. 分隔线分开的是区域，不是控件和它控制的内容 {#7-a-divider-separates-regions-not-a-control-from-what-it-controls}

控件属于它控制的内容。分段控件或单独的筛选器放在页面背景上，内容紧接在它下面：不给它一条上下都有线的专属栏。

- **为什么：** 开关和它切换的内容之间的一条线把两者切开，还多出一条什么都不承载的界面带。
- **由什么保证：** 只放一个分段控件的行不画接缝（[SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md#behavior)）；有几个工具的工具栏保留接缝。

### 8. 从起点开始；身份不变形 {#8-start-at-the-start-identities-keep-their-shape}

默认对齐到行的起点。只有在有意和其他工具编组时，才把控件放到末端。头像在每个尺寸都保持贴纸形状：身份不改变形态。

- **为什么：** 在宽屏上，单独放在最右端的控件很难找到；角会随尺寸变化的脸，就不再像同一个人。
- **由什么保证：** 单独的分段控件左对齐；Avatar 在每个尺寸都是 `radius-sticker`（[形状](shape.md)）。
