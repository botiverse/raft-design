---
title: Token
summary: 每组 token 及其在两种模式下的值，token 名怎么构成，tokens.json 放在哪里，foundation.css 和 tokens.resolved.json 如何由它生成，网页和 App 共用哪些组件尺寸，以及如何迁移以前的名称。
sourceHash: 1ccfbbe6
---

# Token

token 是一个有名字的值：一种颜色、一种阴影、一个尺寸。组件和产品只用名字，从不直接用值，所以一个值只需在一处修改，所有界面在两种模式下都会跟着变。本页是所有 token 的参考。在 token 之间如何选择的规则，归属于各组 token 所属的基础页面，下面每一节都附有链接。

## 原则 {#principles}

- **只有一个来源。** `tokens.json` 里的每个 token 只在那里写一次。`foundation.css` 由它生成，其他任何地方都不定义 token 的值。
- **名字说明角色，不说明颜色。** 写 `attention`，不写粉色；写 `layer-canvas`，不写白色。值变了，token 的名字不变；深色模式的值也放在同一个名字下。
- **先用角色 token，再用调色板。** 只有在没有合适角色时才用 `palette-*`；见[颜色](./color.md#palette)。
- **一个值用到第三次就变成 token。** 只用一次的值可以内联，写成一个墨色阶或一个 `oklch()` 字面量；用到第三次时，添加一个 token。

## token 放在哪里 {#where-tokens-live}

| 文件 | 内容 |
| --- | --- |
| `packages/ui/src/tokens.json` | 颜色、阴影、焦点环和尺寸类 token 的来源，采用 [Design Tokens Community Group 格式](https://www.designtokens.org/tr/2025.10/)（2025.10）。以 `@botiverse/raft-ui/tokens.json` 发布，供 CSS 以外的工具使用。 |
| `packages/ui/src/foundation.css` | 由 `tokens.json` 生成：每个 token 都是一个 CSS 自定义属性，分别用于浅色模式、深色模式和跟随系统设置。以 `@botiverse/raft-ui/foundation.css` 发布，供纯 CSS 使用。 |
| `packages/ui/src/tokens.resolved.json` | 由 `tokens.json` 生成：每个数值类 token 在每种情境下都写成一个普通数字，供不能计算 CSS 的读取方使用，比如 iOS 和 Android App（[解析后的值](#resolved-values)）。以 `@botiverse/raft-ui/tokens.resolved.json` 发布。 |
| `packages/ui/src/styles.css` | Tailwind 入口。它引入 `foundation.css`，把 token 映射成工具类（`bg-layer-canvas`、`text-foreground-muted`、`shadow-float`），并定义只作为 Tailwind 主题值存在的 token：圆角、文字样式和 `ease-slide`。 |
| `packages/ui/src/fonts.css` | 字体族：Space Grotesk、Space Mono 和 CJK 后备字体（默认简体中文；繁体中文、日文和韩文在各自的 `lang` 下）。 |

使用 Tailwind 的应用引入 `@botiverse/raft-ui/styles.css`。不用 Tailwind 的页面引入 `@botiverse/raft-ui/foundation.css`，读取自定义属性：`var(--layer-canvas)`。

## foundation.css 如何生成 {#how-foundationcss-is-generated}

`packages/ui/scripts/build-tokens.mjs` 读取 `tokens.json`，写出 `foundation.css` 和 `tokens.resolved.json`。不要手动编辑这两个文件。

```sh
vp run @botiverse/raft-ui#build:tokens          # write src/foundation.css and src/tokens.resolved.json
node packages/ui/scripts/build-tokens.mjs --check   # exit 1 if either is out of date
```

- 在 `tokens.json` 里改一个值，运行 `build:tokens`，然后三个文件一起提交。`foundation.css` 或 `tokens.resolved.json` 与 `tokens.json` 不一致时，测试（`foundation.generated.test.ts`）会失败。
- token 的路径就是它的属性名：`{layer.canvas}` 对应 `--layer-canvas`。`$root` 表示分组本身：`{foreground.$root}` 对应 `--foreground`。引用（`"{palette.cyan.800}"`）会变成 `var(--palette-cyan-800)`。
- 这个格式没有表示模式的字段，所以 `tokens.json` 加了一个扩展 `build.botiverse.raft`：

| 字段 | 含义 |
| --- | --- |
| `modes.dark` | 深色模式的值。没有这一项的 token 在两种模式下值相同 |
| `fine` | 任何宽度下用鼠标或触控板时的值，`(pointer: fine)`：跟随输入方式、而不跟随宽度的尺寸，比如列表行的最小高度。用鼠标的窄窗口取这个值；桌面端也取它，除非这个 token 还有 `desktop`，768px 起以 `desktop` 为准。token 自身的值仍是手机和触屏的值 |
| `desktop` | 桌面端的值：从 768px 起（桌面布局从这里开始），并使用鼠标或触控板（[间距](./spacing.md#hit-targets)）；此时 token 自身的值是手机和触屏的值。用于 `field-font-size` 这类尺寸 token。它优先于 `fine` |
| `wideTouch` | 768px 起用触屏时的值，`(width >= 48rem) and (pointer: coarse)`：平板、展开的折叠屏手机、横过来有这么宽的手机；也就是 App 从 744pt 起的宽触屏布局。只用于宽触屏和手机画法不同的尺寸，比如头部的高度（artin，#wg-mobile-sync:#265）。token 自身的值仍是手机的值 |
| `scope: "root"` | 不随模式变化的值，比如调色板：只在 `:root` 上声明一次 |
| `scope: "every-mode"` | 随模式变化的 token 的别名：在每个模式的作用域里再声明一次，这样它解析的是该模式下的值 |
| `css: true` | 保留为 CSS 表达式的值，格式中没有对应的类型：`color-mix()`、多层阴影 |
| `static: true` | 不随模式变化的值的弃用别名（在 `deprecated` 分组里） |

生成的文件依次包含：

1. 调色板，在 `:where(:root)` 上；
2. 浅色模式，在 `:where(:root)` 和 `.light` 上；
3. 深色模式，在 `.dark` 上；
4. 再写一遍深色模式，放在 `@media (prefers-color-scheme: dark)` 下，针对没有 `.light` 或 `.dark` 的根节点，这样在应用设置 class 之前页面的颜色就是对的；
5. 在每个模式中都声明的别名，然后是弃用的名称；
6. 用精确指针时的值，放在 `@media (pointer: fine)` 下（Tailwind 的 `pointer-fine:`），选择器与它们所替换的值相同；
7. 桌面端的值，放在 `@media (width >= 48rem) and (pointer: fine)` 下（也是 `styles.css` 中桌面字号用的查询），选择器与它们所替换的值相同。它们排在精确指针的值之后，所以 token 的 `desktop` 优先于它的 `fine`；
8. 宽触屏的值，放在 `@media (width >= 48rem) and (pointer: coarse)` 下，选择器与它们所替换的值相同。这个查询和桌面端的不会同时成立，所以两者的先后顺序无关紧要。

深色页面里的 `.light` 元素是一个浅色孤岛，用于预览或传送门（portal）；`styles.css` 中的 `dark:` 变体跟随最近的模式 class。见[深色模式](./dark-mode.md)。

## 解析后的值 {#resolved-values}

`tokens.resolved.json` 收录每个类型为数字（`dimension`、`number`、`fontWeight`、`duration`）的 token，在四种情境（[组件 token](#component-tokens)）下各解析成一个普通数字。不能计算 CSS 的 App 读它，而不读 `tokens.json`：`tokens.json` 里推导出来的尺寸是 CSS 表达式，比如 `calc(var(--control-height-small) + 2 * var(--list-toolbar-air) + 1px)`。

- 它保留 `tokens.json` 的分组。每个 token 是一个对象，带有它的 `$type`，以及一个 `$value`，每种情境一个数字：`touch`（token 自身的值）、`fine`（`fine`，没有就用 token 自身的值）、`desktop`（`desktop`，没有就用 `fine`，再没有就用 token 自身的值）和 `wideTouch`（`wideTouch`，没有就用 token 自身的值）。
- `dimension` 的单位是 px（1rem 是 16px），`duration` 的单位是 ms；`number` 和 `fontWeight` 没有单位。
- 生成器在它所解析的情境下计算每个引用、`var()` 和 `calc()`，和浏览器在同一个媒体查询下的做法一样：在桌面端，`list-toolbar-height` 是桌面端的头部高度 44。计算不了的值（`var()` 和 `calc()` 以外的函数，px、rem、ms 和 s 以外的单位，缺失的或循环的引用）会让构建失败，报错信息里写明是哪个 token、哪个情境。
- 颜色、阴影和缓动曲线不在里面；从 `tokens.json` 或 `foundation.css` 读取。

```json
{
  "list-toolbar": {
    "height": {
      "$type": "dimension",
      "$value": { "touch": 49, "fine": 49, "desktop": 44, "wideTouch": 49 }
    }
  },
  "list-row": {
    "min-height": {
      "$type": "dimension",
      "$value": { "touch": 56, "fine": 0, "desktop": 0, "wideTouch": 56 }
    }
  },
  "header": {
    "height": {
      "$type": "dimension",
      "$value": { "touch": 56, "fine": 56, "desktop": 44, "wideTouch": 48 }
    }
  }
}
```

实际的文件把每个对象都分行写开。

## token 命名规则 {#token-grammar}

名字由几个部分组成，所以即使是没见过的名字，你也能看出它是做什么的。

| 类别 | 模式 | 示例 |
| --- | --- | --- |
| 中性角色 | `{role}(-{purpose})(-{intensity})` | `layer-canvas`、`foreground-hint`、`line-seam`、`fill-medium`、`foreground-on-hud` |
| 颜色角色 | `{family}(-{slot})` | `brand`、`brand-soft`、`danger-strong`、`info-muted` |
| 信号 | `you`、`selected` | `you`、`selected` |
| 墨色阶 | `ink-{alpha}` | `ink-8`、`ink-40` |
| 调色板 | `palette-{color}-{step}` | `palette-yellow-400`、`palette-lavender-800` |
| 状态 | `task-status-{status}(-soft\|-strong)`、`presence-{state}(-soft)` | `task-status-in-review-soft`、`presence-busy`、`presence-busy-soft` |
| 贴纸 | `sticker-{part}` | `sticker-ink`、`sticker-edge`、`sticker-medium` |
| 阴影 | `elevation-{level}`、`focus-ring` | `elevation-float`、`elevation-sticker` |
| 尺寸 | `{part}-{property}` | `field-font-size`、`card-title-line-height`、`list-row-min-height`（[组件 token](#component-tokens)） |

**中性角色。** 角色是以下四种之一：

- `foreground-*`：文字和图标；
- `layer-*`：表面，按叠放顺序排列（外框、侧栏、画布、卡片、弹出层）；
- `line-*`：线；
- `fill-*`：铺在表面里或表面上的填充。

用途说明 token 用在哪里：`frame`、`sidebar`、`canvas`、`card`、`popover`、`code`、`hud`、`on-frame`、`on-hud`、`link`、`field`。强度从不带后缀的名字往下到 `-muted`，文字再往下是 `-hint`；线则从 `-hairline` 经 `-seam` 到 `-strong`。

**颜色角色。** 色系是 `brand`、`attention`、`info`、`success`、`warning`、`danger` 或 `inactive` 之一。槽位说明是哪个色阶：

| 槽位 | 含义 |
| --- | --- |
| 不带后缀（`info`） | 实色：贴纸的填充 |
| `-strong` | 深色阶，可作为文字阅读 |
| `-muted` | 较浓的淡色 |
| `-soft` | 很淡的淡色，不带边框；见[柔和淡色](./color.md#soft-tints) |
| `-graphic` | 图表标记的填充或描边，和各个表面的对比度为 3:1。只有 `warning` 有；见[图表里的警告](./color.md#warnings-in-charts) |
| `-foreground` | 实色上的文字，仅限有自己文字色的色系 |
| `-hover`、`-active` | 实色填充在悬停和按下时用的一对值。一个色系要么两个都有，要么都没有 |
| `-50` 到 `-950` | 带编号的色阶。只有 `brand` 和 `attention` 有 |

**信号。** `you` 和 `selected` 是发给你的东西和选中的贴纸所用的黄色。它们有自己的值，而不是指向 `brand`，所以没有哪套主题会把它们变灰（[主题](./themes.md#signals)）。

**不透明度。** 除了两个遮罩 `layer-backdrop` 和 `layer-backdrop-nested`，以及盖在忙碌中的东西上的那层 `layer-veil`（[表面](./color.md#surfaces)），所有 `layer` token 都是不透明的。`fill-muted` 和 `fill-strong` 是不透明的。`fill-subtle`、`fill-medium`、`fill-frame-medium` 和 `sticker-medium` 是半透明的：它们是悬停层级，叠在控件或行上面，`fill-medium` 也用作进度条的轨道（[悬停浮层](./color.md#hover-overlays)）。

**工具类。** Tailwind 工具类由属性前缀加 token 名构成：`bg-layer-card`、`text-foreground-muted`、`border-line-strong`。阴影另有命名：`elevation-float` 对应 `shadow-float`，`elevation-sticker` 对应 `shadow-sticker`，`focus-ring` 对应 `shadow-focus`。带编号的调色板色阶只有自定义属性，没有工具类；不带编号的 `bg-palette-yellow` 及同类是例外。

## 组件 token {#component-tokens}

组件 token 是网页和 iOS、Android App 都要画的尺寸：一行的高度、一个控件或工具栏的高度、部件之间的一档间距。它放在 `tokens.json` 里，让两边读同一个值，一处修改就同时到达每个平台。

**放进来的。** 只放网页和 App 都必须遵循的决定：对比手机网页和 App 里同一个页面的人会看出不同的东西。列表行的最小高度、列表上方的工具栏、消息的头像列以及它到文字的间隔。

**不放进来的。** 网页自己绘制所需的像素留在组件的配方（recipe）里：视觉偏移、App 从它的平台得到的点击区域、跟随高度的圆角、只有鼠标才会遇到的尺寸，以及 App 原生绘制的任何东西，比如 iOS 的标签栏（[导航](../patterns/navigation.md#what-each-platform-draws)）。已经存在的值不登记第二次：等于另一个 token 的尺寸写成那个 token（`var(--header-height)`），让它们一起变；由其他 token 推出的尺寸在用到它的地方推导，比如时间线的行档是 `timeline-row-inset` 的两倍。

**四种情境。** token 自身的值（`$value`）是手机上显示的值，也是任何宽度的触屏上显示的值，除非这个 token 有 `wideTouch`；App 读的就是它。`desktop` 是 768px 起用鼠标或触控板时的值。`fine` 是任何宽度下用鼠标或触控板时的值，用于跟随输入方式而不跟随宽度的尺寸：用鼠标的窄窗口取它，桌面端也取它，除非这个 token 还有 `desktop`。`wideTouch` 是 768px 起用触屏时的值（App 从 744pt 起的宽触屏布局），用于宽触屏和手机画法不同的少数尺寸：头部和它的栏按钮（artin，#wg-mobile-sync:#265，Raft 1.29）。不要把手机的值写成扩展：它就是 token 自身的值，这样 App 从来不必读扩展。

| 情境 | 取值 | 在 `tokens.resolved.json` 中 |
| --- | --- | --- |
| 手机，768px 以下的触屏（App 在 744pt 以下） | token 自身的值 | `touch` |
| 768px 起的触屏（App 从 744pt 起） | `wideTouch`，没有就用 token 自身的值 | `wideTouch` |
| 768px 以下、用鼠标或触控板的窗口 | `fine`，没有就用 token 自身的值 | `fine` |
| 桌面端：768px 起，用鼠标或触控板 | `desktop`，没有就用 `fine`，再没有就用 token 自身的值 | `desktop` |

完全没有指针的设备取 token 自身的值。

**命名。** 组件 token 是 `{component}-{property}`：分组是它所决定尺寸的那类东西，用文档里用的词（`list-row`、`list-toolbar`、`avatar-column`、`mobile-nav`）；属性是 `height`、`min-height`、`size`、`width`、`inset`（内容的上方和下方；`inset-bottom` 只指下方）、`gap`（两个部件之间）或 `air`（栏里控件的周围）之一。后缀说明它是哪种界限：`-min` 表示最小值（`mobile-nav-inset-bottom-min`）。和现有分组同类的尺寸加入那个分组（`control-height-small`），而不另开一组；两个组件共用的同一个尺寸是它们都读取的一个分组（`avatar-column`，供消息行和列表行使用），从不在每个组件里各复制一份。

**描述。** 每个组件 token 的 `$description` 都要说明：它决定什么的尺寸，用文字写出它在手机上和桌面端的值，为什么是这个尺寸，以及为什么共用：网页和 App 里哪些屏幕画它。如果有过决定，就写明这个决定（谁、什么时候、在哪里）。说不出 App 为什么需要这个值的描述，说明这个值应该放在配方里。

**使用。** 配方通过组件 token 的工具类读取它（`h-control-small`、`min-h-list-row`、`py-list-row-inset`、`w-avatar-column`、`size-avatar-column`、`gap-avatar-column-gap`、`min-h-list-toolbar`、`py-list-toolbar-air`，在 `styles.css` 中），没有工具类时读它的自定义属性（`min-h-[calc(var(--mobile-nav-height)+…)]`），并且不为这个属性另加自己的断点或指针查询：token 只在 token 层切换一次。网页需要在此之上用不同的值时，比如鼠标下 ListRow 的 64px 最小高度，加断点的那一行紧挨在一条说明原因的注释下面，`// web-only: <reason>`，这是配方的 class 列表里唯一接受的注释，这样检查就能分清有意的细化和 token 出现之前遗留的断点。

```ts
const listRow = tv({
  base: [
    "min-h-list-row py-list-row-inset",
    // web-only: with a mouse ListRow keeps its 64px floor and 12px inset, its current values until someone rules on them
    "pointer-fine:min-h-16 pointer-fine:py-3",
  ],
});
```

`packages/ui/src/size-tokens.test.ts` 检查三件事：手写的 token 值（本该用 `h-control-small` 的地方写成 `h-8 md:pointer-fine:h-control`，在 `calc()` 里也算）；同一个 class 列表里给 token 已经设置的属性加的断点，除非它在 `web-only` 注释下面；以及没有读取 token、却随指针切换的尺寸（`py-3 pointer-fine:py-2`），除非它在 `web-only` 注释下面。第三项检查出现之前写下的指针切换，作为仍待提升为 token 的尺寸列在测试里。这份列表只会变短：新增的切换会让测试失败，已经不在代码里的条目也会。

## token 分组 {#token-groups}

下面每个区块都由 `tokens.json` 生成，显示浅色和深色两种值。

### 调色板 {#palette}

角色所指向的原始颜色。直接使用它们的规则见[颜色](./color.md#palette)。

```tokens
palette
```

### 文字和图标 {#text-and-icons}

`foreground` 及其各层级，以及外框和 HUD 上的文字颜色。用法和对比度：[颜色](./color.md#text-and-icons)、[字体排印](./typography.md#color-tiers)。

```tokens
foreground
```

### 表面 {#surfaces}

用法：[颜色](./color.md#surfaces)。

```tokens
layer
```

### 填充 {#fills}

用法：[颜色](./color.md#surfaces)和[悬停浮层](./color.md#hover-overlays)。

```tokens
fill
```

### 线 {#lines}

用法和宽度：[颜色](./color.md#lines)、[形状](./shape.md#stroke-widths)。

```tokens
line
```

### 墨色阶 {#ink-steps}

半透明的墨色阶梯，线、次要文字和浮层都由它构成。请用角色 token；只有一次性的淡色铺底才用墨色阶。

```tokens
ink
```

### 颜色角色 {#color-roles}

每种颜色的含义：[颜色的含义](./color.md#meanings-of-color)。

```tokens
brand
```

```tokens
attention
```

```tokens
info
```

```tokens
success
```

```tokens
warning
```

```tokens
danger
```

```tokens
inactive
```

### 状态 {#statuses}

任务状态和在线状态灯：[状态](./color.md#statuses)。

```tokens
task-status
```

```tokens
presence
```

### 贴纸 {#stickers}

用法：[贴纸](./color.md#stickers)。

```tokens
sticker
```

### 阴影和焦点环 {#shadows-and-the-focus-ring}

用法：[层级](./elevation.md)、[无障碍](./accessibility.md#focus-and-keyboard)。

```tokens
elevation
```

```tokens
focus
```

### 尺寸 {#metrics}

输入框和卡片标题与旁边并排部件共用的文字尺寸。用法：[字体排印](./typography.md#metric-tokens)。

```tokens
field
```

```tokens
card-title
```

控件尺寸：默认控件的高度、小控件的高度（`control-height-small`）、它的图标和点击区域，以及嵌在外框里的控件保持的值：`control-embedded-inset`，即它到外框外边缘和到相邻控件的距离；`control-embedded-size`，即输入框里标签或按钮的高度（[间距](./spacing.md#heights)、[形状](./shape.md#inside-a-frame)）。

```tokens
control
```

栏和栏里的项：头部的高度和留白、栏按钮和它的图标（`bar-icon-size`）、行上只有图标的操作（`row-action-size`，Button `icon-sm`）、外框上的项、导航条，以及开关的轨道（[间距](./spacing.md#heights)、[响应式布局](../patterns/responsive.md)）。

```tokens
header
```

```tokens
bar-button
```

```tokens
bar-icon
```

```tokens
row-action
```

```tokens
frame-item
```

```tokens
rail
```

```tokens
switch
```

行：侧栏行、弹出列表里的选项，以及设置行的内边距（[间距](./spacing.md#heights)）。

```tokens
row
```

```tokens
option
```

```tokens
settings-row
```

页面：表单两个分区之间的间隔，以及页面的顶部距离和内边距（[页面结构](../patterns/page-structure.md#one-edge-per-column)、[桌面端密度](./desktop-density.md)）。

```tokens
section
```

```tokens
page
```

和 App 共用的组件 token（[组件 token](#component-tokens)）：带头像和预览的行（`list-row`）、列表上方的工具栏（`list-toolbar`）、消息行和列表行开头的头像列（`avatar-column`），以及 Android App 自己绘制的手机标签栏（`mobile-nav`）。

```tokens
list-row
```

```tokens
list-toolbar
```

```tokens
avatar-column
```

```tokens
mobile-nav
```

时间线节奏：对话里各行之间的消息档和分段档，以及每行在文字周围保留的行内距（[间距](./spacing.md#timeline-rhythm)）。

```tokens
timeline
```

渐隐长度：`fade-content` 用在内容在高度方向被截断的地方，`fade-edge` 用在滚动条带的两侧（[边缘渐隐](./spacing.md#edges-fade)）。还有变淡的不透明度，用于存在但不活跃的东西（[变淡](./states.md#dimmed)）。

```tokens
fade
```

```tokens
opacity
```

### 在 styles.css 中定义的 token {#tokens-defined-in-stylescss}

这些是 `styles.css` 里的 Tailwind 主题值，不是 `tokens.json` 中的条目，所以没有生成的表格。

| Token | 归属 |
| --- | --- |
| `radius-sticker`、`radius-chip`、`radius-control`、`radius-container`、`radius-dialog` | [形状](./shape.md#radii) |
| `text-hero` 到 `text-label`、`text-mono-meta`、`text-mono-code`、`text-control`，各有手机和桌面端两个值 | [字体排印](./typography.md#type-scale) |
| `ease-slide` | [动效](./motion.md#easing) |
| `spacing-timeline-message`、`spacing-timeline-section`、`spacing-timeline-row`（时间线 token 对应的间距工具类），以及由它们推出的 `spacing-timeline-turn`、`spacing-timeline-lead`、`spacing-timeline-start`、`spacing-timeline-end`。产品只用 `timeline-start` 和 `timeline-end` | [间距](./spacing.md#timeline-rhythm) |
| `font-sans`、`font-heading`、`font-mono` | [字体排印](./typography.md#font-families) |

## 以前的名称 {#former-names}

token 现在的名称之前用过的名称，在 raft-ui 0.56 及以前是弃用的别名，之后已移除。下面的 codemod 仍会改写它们，所以按旧版 raft-ui 写的代码可以一步迁移过来。重命名遵循几种模式：

```text
primary-*                  ->  brand-*
accent-*                   ->  attention-*
color-brutal-{color}-{n}   ->  palette-{color}-{n}   (purple -> lavender)
secondary-{n}              ->  palette-stone-{n}
layer-panel                ->  layer-canvas
layer-canvas-muted         ->  layer-sidebar
layer-inset                ->  fill-muted
layer-hud-foreground       ->  foreground-on-hud
foreground-strong          ->  foreground
foreground-icon            ->  foreground-muted
foreground-placeholder     ->  foreground-hint
line                       ->  line-seam
line-muted                 ->  line-hairline
theme-shadow-float/lg/xl   ->  elevation-float       (utility: shadow-float)
theme-shadow-sticker       ->  elevation-sticker     (utility: shadow-sticker)
theme-focus-ring           ->  focus-ring            (utility: shadow-focus)
theme-shadow-xs/sm/md      ->  none: controls cast no shadow, drop the class
```

有一个以前的工具类名称仍然保留，因为还有应用在用：`bg-fill-row-hover`，画的是 `fill-subtle`。请改用 `bg-fill-subtle`。

### Codemod {#the-codemod}

raft-ui 附带一个 codemod，可以改写 Tailwind 工具类（`bg-…`、`hover:border-…/50`）和 CSS 自定义属性（`var(--…)`）中的旧名称：

```sh
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <dir-or-file>... [--dry]
```

- 它改写 `.ts`、`.tsx`、`.js`、`.jsx`、`.mjs`、`.cjs`、`.css` 和 `.html` 文件，跳过 `node_modules`、`dist` 和 `build`。`--dry` 列出它会修改的文件。
- 它只重命名引用，不动声明，所以运行两次也是安全的。
- 人工检查结果。原本禁止旧名称的防护（lint 规则、测试、允许列表）现在会禁止新名称；由片段拼出的模式，比如针对 class 名的正则表达式，仍保留旧名称。
- 文档从不使用弃用的名称：页面中出现 `deprecated` 分组里的 token 时，`scripts/check-docs.mjs` 会报错。

## 修改 token {#changing-a-token}

- 只在 `tokens.json` 里添加或修改值，并在同一次改动中重新生成 `foundation.css`。
- 新 token 的名字要遵循上面的命名规则；如果组件需要，在 `styles.css` 里加上它的工具类。
- 只有通过[组件 token](#component-tokens) 里那条规则的尺寸才能加为组件 token，并要附上一段描述，说明网页和 App 为什么共用它。
- 重命名 token 时，把旧名称保留在 `deprecated` 分组里并指向新名称，同时把这次重命名加进 codemod。只在列出破坏性改动的版本中删除别名（1.0 之前就是次版本号），并且要等没有应用再用它们。
- 文字、表面或淡色的值变化时，在两种模式下重新核对[颜色](./color.md#contrast)中的对比度保证。
- 在同一个 pull request 里更新这个 token 所属的基础页面（[编写指南](../authoring/README.md#changing-the-system)）。

## 相关 {#related}

- [颜色](./color.md)：每个颜色 token 的用途，以及它保证的对比度。
- [字体排印](./typography.md)：文字样式和尺寸 token。
- [层级](./elevation.md)：阴影和焦点环。
- [深色模式](./dark-mode.md)：两种模式之间有哪些变化。
