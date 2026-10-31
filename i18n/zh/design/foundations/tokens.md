---
title: Token
summary: 每组 token 及其在两种模式下的值，token 名怎么构成，tokens.json 放在哪里、foundation.css 如何由它生成，以及如何迁移弃用的名称。
sourceHash: c13f6de3
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
| `packages/ui/src/styles.css` | Tailwind 入口。它引入 `foundation.css`，把 token 映射成工具类（`bg-layer-canvas`、`text-foreground-muted`、`shadow-float`），并定义只作为 Tailwind 主题值存在的 token：圆角、文字样式和 `ease-slide`。 |
| `packages/ui/src/fonts.css` | 字体族：Space Grotesk、Space Mono 和 CJK 后备字体（默认简体中文；繁体中文、日文和韩文在各自的 `lang` 下）。 |

使用 Tailwind 的应用引入 `@botiverse/raft-ui/styles.css`。不用 Tailwind 的页面引入 `@botiverse/raft-ui/foundation.css`，读取自定义属性：`var(--layer-canvas)`。

## foundation.css 如何生成 {#how-foundationcss-is-generated}

`packages/ui/scripts/build-tokens.mjs` 读取 `tokens.json`，写出 `foundation.css`。不要手动编辑 `foundation.css`。

```sh
vp run @botiverse/raft-ui#build:tokens          # write src/foundation.css
node packages/ui/scripts/build-tokens.mjs --check   # exit 1 if it is out of date
```

- 在 `tokens.json` 里改一个值，运行 `build:tokens`，然后两个文件一起提交。`foundation.css` 与 `tokens.json` 不一致时，测试（`foundation.generated.test.ts`）会失败。
- token 的路径就是它的属性名：`{layer.canvas}` 对应 `--layer-canvas`。`$root` 表示分组本身：`{foreground.$root}` 对应 `--foreground`。引用（`"{palette.cyan.800}"`）会变成 `var(--palette-cyan-800)`。
- 这个格式没有表示模式的字段，所以 `tokens.json` 加了一个扩展 `build.botiverse.raft`：

| 字段 | 含义 |
| --- | --- |
| `modes.dark` | 深色模式的值。没有这一项的 token 在两种模式下值相同 |
| `desktop` | 桌面端的值：从 768px 起（桌面布局从这里开始），并使用鼠标或触控板（[间距](./spacing.md#hit-targets)）；此时 token 自身的值是手机和触屏的值。用于 `field-font-size` 这类尺寸 token |
| `scope: "root"` | 不随模式变化的值，比如调色板：只在 `:root` 上声明一次 |
| `scope: "every-mode"` | 随模式变化的 token 的别名：在每个模式的作用域里再声明一次，这样它解析的是该模式下的值 |
| `css: true` | 保留为 CSS 表达式的值，格式中没有对应的类型：`color-mix()`、多层阴影 |
| `static: true` | 不随模式变化的值的弃用别名 |

生成的文件依次包含：

1. 调色板，在 `:where(:root)` 上；
2. 浅色模式，在 `:where(:root)` 和 `.light` 上；
3. 深色模式，在 `.dark` 上；
4. 再写一遍深色模式，放在 `@media (prefers-color-scheme: dark)` 下，针对没有 `.light` 或 `.dark` 的根节点，这样在应用设置 class 之前页面的颜色就是对的；
5. 在每个模式中都声明的别名，然后是弃用的名称；
6. 桌面端的值，放在 `@media (width >= 48rem) and (pointer: fine)` 下（也是 `styles.css` 中桌面字号用的查询），选择器与它们所替换的值相同。

深色页面里的 `.light` 元素是一个浅色孤岛，用于预览或传送门（portal）；`styles.css` 中的 `dark:` 变体跟随最近的模式 class。见[深色模式](./dark-mode.md)。

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
| 尺寸 | `{part}-{property}` | `field-font-size`、`card-title-line-height` |

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

**不透明度。** 除了两个遮罩 `layer-backdrop` 和 `layer-backdrop-nested`，以及盖在忙碌中的东西上的那层 `layer-veil`（[表面](./color.md#surfaces)），所有 `layer` token 都是不透明的。`fill-muted` 和 `fill-strong` 是不透明的。`fill-subtle`、`fill-medium`、`fill-frame-medium` 和 `sticker-medium` 是半透明的：它们是悬停层级，叠在控件或行上面（[悬停浮层](./color.md#hover-overlays)）。

**工具类。** Tailwind 工具类由属性前缀加 token 名构成：`bg-layer-card`、`text-foreground-muted`、`border-line-strong`。阴影另有命名：`elevation-float` 对应 `shadow-float`，`elevation-sticker` 对应 `shadow-sticker`，`focus-ring` 对应 `shadow-focus`。带编号的调色板色阶只有自定义属性，没有工具类；不带编号的 `bg-palette-yellow` 及同类是例外。

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

控件尺寸：默认控件的高度、它的图标和点击区域，以及嵌在外框里的控件保持的值：`control-embedded-inset`，即它到外框外边缘和到相邻控件的距离；`control-embedded-size`，即输入框里标签或按钮的高度（[间距](./spacing.md#heights)、[形状](./shape.md#inside-a-frame)）。

```tokens
control
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

## 弃用的名称 {#deprecated-names}

旧名称作为别名保留到 raft-ui 1.0，放在 `tokens.json` 的 `deprecated` 分组里。每个别名都指向应改用的 token，这样旧代码在迁移期间仍能正常工作。

```tokens
deprecated
```

重命名遵循几种模式：

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

### Codemod {#the-codemod}

raft-ui 附带一个 codemod，可以改写 Tailwind 工具类（`bg-…`、`hover:border-…/50`）和 CSS 自定义属性（`var(--…)`）中的旧名称：

```sh
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs <dir-or-file>... [--dry]
```

- 它改写 `.ts`、`.tsx`、`.js`、`.jsx`、`.mjs`、`.cjs`、`.css` 和 `.html` 文件，跳过 `node_modules`、`dist` 和 `build`。`--dry` 列出它会修改的文件。
- 它只重命名引用，不动声明，所以运行两次也是安全的。
- 人工检查结果。原本禁止旧名称的防护（lint 规则、测试、允许列表）现在会禁止新名称；由片段拼出的模式，比如针对 class 名的正则表达式，仍保留旧名称。
- 文档从不使用弃用的名称：页面中出现时，`scripts/check-docs.mjs` 会报错。

## 修改 token {#changing-a-token}

- 只在 `tokens.json` 里添加或修改值，并在同一次改动中重新生成 `foundation.css`。
- 新 token 的名字要遵循上面的命名规则；如果组件需要，在 `styles.css` 里加上它的工具类。
- 重命名 token 时，把旧名称保留在 `deprecated` 分组里并指向新名称，同时把这次重命名加进 codemod。只在大版本中删除别名。
- 文字、表面或淡色的值变化时，在两种模式下重新核对[颜色](./color.md#contrast)中的对比度保证。
- 在同一个 pull request 里更新这个 token 所属的基础页面（[编写指南](../authoring/README.md#changing-the-system)）。

## 相关 {#related}

- [颜色](./color.md)：每个颜色 token 的用途，以及它保证的对比度。
- [字体排印](./typography.md)：文字样式和尺寸 token。
- [层级](./elevation.md)：阴影和焦点环。
- [深色模式](./dark-mode.md)：两种模式之间有哪些变化。
