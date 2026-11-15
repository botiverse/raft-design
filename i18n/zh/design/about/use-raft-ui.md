---
title: 使用 raft-ui
summary: 如何安装 raft-ui，配置它的样式表、Tailwind CSS v4 和深色模式，渲染第一个组件，在版本之间升级，开启它的 lint 规则，以及 token 和给 Agent 用的入口在哪里。
sourceHash: 4f2dc2f5
---

# 使用 raft-ui

raft-ui 是 Raft 设计系统的 React 实现，以 `@botiverse/raft-ui` 发布。它包含 CSS 基础（以 CSS 变量形式提供的 token），在纯 HTML 里也能用；还包含基于 Base UI 和 Tailwind CSS v4 构建的 React 组件。产品代码使用 raft-ui，不要自己再复制一份这些组件。

## 安装 {#install}

raft-ui 需要 React 19；使用组件时还需要 Tailwind CSS v4。

```bash
pnpm add @botiverse/raft-ui
```

包的入口：

| 导入路径 | 内容 |
| --- | --- |
| `@botiverse/raft-ui` | 稳定的组件、provider 和 hook |
| `@botiverse/raft-ui/wip` | 实验性组件；API 在任何版本中都可能变化 |
| `@botiverse/raft-ui/cn` | 类名合并函数 `cn` |
| `@botiverse/raft-ui/styles.css` | Tailwind CSS v4 集成；它会导入 `foundation.css` |
| `@botiverse/raft-ui/foundation.css` | 只有主题变量，给不用 React 或 Tailwind 的页面 |
| `@botiverse/raft-ui/fonts.css` | 可选的网页字体：Space Grotesk 和 Space Mono |
| `@botiverse/raft-ui/tokens.json` | 所有 token，采用 Design Tokens Community Group 格式 |
| `@botiverse/raft-ui/lint` | 设计系统检查应用代码的 lint 规则，以 lint 插件的形式提供（[Lint 规则](#lint-rules)） |

## 配置样式 {#set-up-the-styles}

### 使用 React 和 Tailwind CSS v4 {#with-react-and-tailwind-css-v4}

在全局样式表里导入 Tailwind 和 raft-ui 的样式，并让 Tailwind 扫描已安装的包，这样它才会生成组件用到的工具类：

```css
@import "tailwindcss";
@import "@botiverse/raft-ui/styles.css";
@source "../node_modules/@botiverse/raft-ui/dist/**/*.{js,mjs}";
```

`@source` 的路径相对于这个 CSS 文件，必须指向已安装的包。

在应用入口导入字体：

```ts
import "@botiverse/raft-ui/fonts.css";
```

`fonts.css` 开头是一条网页字体的 `@import`。如果改从样式表里导入它，要放在那个文件的最前面，因为 CSS 的 `@import` 必须写在其他规则之前。要换用别的字体，设置 `--heading-font`、`--sans-font` 和 `--mono-font`。

### 不用 React 或 Tailwind {#without-react-or-tailwind}

链接 `foundation.css`，或者把它复制到 HTML 旁边。它定义了组件使用的同一套主题变量，但不含组件结构、交互或 CSS reset：

```html
<link rel="stylesheet" href="./foundation.css" />
<style>
  body {
    background: var(--layer-canvas);
    color: var(--foreground);
  }
</style>
```

## 主题和深色模式 {#theme-and-dark-mode}

Raft 只有一种视觉语言，分浅色和深色两种模式；组件会自己适配模式。在根元素上用 class 选择模式：`class="light"` 或 `class="dark"`。两个都没有时，页面跟随系统设置。

在 React 应用里，用 `ThemeProvider` 包住应用。它会在 `document.documentElement` 上设置模式 class 和 `color-scheme`，并记录这个人最近一次是用键盘还是鼠标指针操作的，从而只在键盘操作之后显示焦点环（[状态](../foundations/states.md#focus)）。

```tsx
import { ThemeProvider } from "@botiverse/raft-ui";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="system" storageKey="theme">
      {children}
    </ThemeProvider>
  );
}
```

- `mode` 或 `defaultMode` 的值是 `light`、`dark` 或 `system`；默认是 `light`。`onModeChange` 报告变化，`storageKey` 把非受控的模式保存在 `localStorage` 里。
- `useTheme()` 返回 `mode`、`resolvedMode`（`light` 或 `dark`，`system` 已解析为其中之一）和 `setMode`。
- 嵌套的作用域（比如预览）使用 `syncDom={false}`，并在自己的根元素上加对应的 `light` 或 `dark` class。它不会改动根元素，包括输入方式。
- 不用 `ThemeProvider` 的应用，在客户端调用一次 `installInputModality()`（它返回一个用来移除它的函数）。有了依据之后，它会把 `document.documentElement` 上的 `data-input-modality` 设为 `pointer`、`keyboard` 或 `virtual`（一开始没有值），只有 `pointer` 会隐藏焦点环；不调用它的话，每个焦点环都按 `:focus-visible` 显示，由浏览器决定。
- 在服务端渲染、又要记住模式的应用，必须在首次绘制前恢复模式，否则页面会闪一下另一种模式。

另外两个 provider 只在用到对应组件时才需要：工具提示要 `TooltipProvider`，轻提示 API 要 `ToastProvider`（[Toast](../../packages/ui/src/components/toast/toast.md)）。

Base UI 的浮层会通过 portal 挂到 `document.body` 上。给应用根元素加上 `isolation: isolate`，让它内部的层叠上下文都留在浮层下面。

## 第一个组件 {#a-first-component}

```tsx
import { Button } from "@botiverse/raft-ui";

export function CreateTaskButton() {
  return <Button variant="primary">Create task</Button>;
}
```

`variant="primary"` 是粉色贴纸，留给这个屏幕存在的那唯一一个操作；其他操作都用默认 variant。每个组件的页面都列出它的 variant、组成部分和 props（由代码生成），以及它的规则。props 要到那里或 `node_modules/@botiverse/raft-ui/dist/index.d.mts` 里查，不要猜：不同组件的命名不一样（表示负面意图的值在 Button 上是 `danger`，在 Banner 上是 `destructive`）。

用 raft-ui 构建的所有东西都遵守两条规则：

- 使用真实的元素。可点击的东西是 `<button>`，或者带 `href` 的 `<a>`；复选框和单选按钮里有原生 input；开关是带 `role="switch"` 的 button。
- 每个只有图标的按钮都要有 `aria-label`。

什么场景用哪个组件，见[组件概览](../components/overview.md)和[如何选择组件](../components/overview.md)。

## 版本和升级 {#versions-and-upgrading}

raft-ui 还没到 1.0：次版本号的更新也可能包含破坏性变更。每次发布都会在[更新日志](../../packages/ui/CHANGELOG.md)里列出这些变更，以及需要怎么改。

组件的状态取决于它从哪里导出：

| 状态 | 导出位置 | 含义 |
| --- | --- | --- |
| 稳定 | `@botiverse/raft-ui` | 破坏性变更遵循上面的版本规则 |
| 实验性 | `@botiverse/raft-ui/wip` | API 在任何版本中都可能变化 |
| 已弃用 | `@botiverse/raft-ui`，标记为 `@deprecated` | 仍然可用；它的页面会写明替代组件。在之后某个列出破坏性变更的版本中移除（1.0 之前是一个次版本） |

### Codemod {#codemods}

包里附带两个 codemod。0.6.0 及之前，这个包以 `raft-ui` 的名字发布；要把项目迁移到 `@botiverse/raft-ui` 和当前的 token 名：

```bash
pnpm add @botiverse/raft-ui
node node_modules/@botiverse/raft-ui/codemods/package-name.mjs src
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs src
pnpm remove raft-ui
```

- `package-name.mjs` 改写导入语句、CSS 的 `@import` 和 `@source` 路径以及依赖项。它会列出所有单独的 `"raft-ui"` 字符串（打包工具的别名、路径映射），留给你手动修改。
- `token-names.mjs` 把 Tailwind 工具类和 `var(--…)` 引用从旧 token 名改写成当前的名字。旧名字在 0.56 及以前的版本里是已弃用的别名，之后的版本里已移除，所以升级到 0.56 以后的版本之前，先运行它。

运行 `token-names.mjs` 之后，手动检查两类代码：

- **禁止某个名字的检查。** 禁用某个旧名字的 lint 规则、测试或允许列表，里面的名字也会被改写，于是它变成禁止当前的名字。把那里的旧名字改回来。
- **由片段拼出的模式。** 用片段拼出 token 名的正则表达式不是字面的 token，所以它会保留旧名字，从而匹配不上改写后的源码。把它放宽到也匹配当前的名字。

如果你依赖的某个包把 `raft-ui` 声明为 peer dependency，还要安装 `"raft-ui": "npm:@botiverse/raft-ui@<version>"`，让它解析到同一份副本，而不是再打包一份。

## Lint 规则 {#lint-rules}

设计系统的一部分规则可以在应用自己的代码里检查，比如「每个会滚动的区域都是 ScrollArea」。raft-ui 把这些规则做成一个 lint 插件 `@botiverse/raft-ui/lint` 发布，采用 ESLint 插件格式，Oxlint 把它作为 JS 插件加载。只需开启一次它的推荐配置：推荐配置列出了插件的全部规则，所以之后的版本新增的规则会随升级进入应用，不需要改应用的 lint 配置，也不需要改应用里 Agent 遵循的说明（比如 AGENTS.md）。更新日志把每条新规则列在 Added 下；升级时，修复新规则报告的问题，或者说明为什么是例外。

### 在 Oxlint 中开启 {#turn-them-on-in-oxlint}

在应用的 `.oxlintrc.json` 里扩展推荐配置。Oxlint 的 `extends` 接受一个文件路径，路径相对于写这个 `extends` 的配置文件，所以让它指向已安装的包：

```jsonc
{
  "extends": ["./node_modules/@botiverse/raft-ui/dist/lint/recommended.json"],
  // The app's own plugins, jsPlugins and rules stay as they are.
}
```

推荐配置把插件加进 `jsPlugins`，并把每条规则都开启为 error。应用暂时还过不了的规则，在推荐配置里发布时是关闭的，等应用迁移完成后再开启为 error（changelog 会写明是哪条；目前没有）。应用可以在自己的 `rules` 里提前开启这样的规则，设为 `"warn"` 或 `"error"`；应用自己的 `jsPlugins` 保留在它旁边。它把 `plugins` 设为空列表，这样应用自己的 `plugins` 完全保持原样：被扩展的配置如果不写 `plugins`，就算作使用 Oxlint 的默认插件，会把应用关掉的插件（比如 `unicorn`）重新打开。没有设置 `plugins` 的应用仍使用 Oxlint 的默认插件。应用的 `rules` 里设置的规则会覆盖推荐配置，比如在清理已有报告期间设成 `"raft-ui/prefer-scroll-area": "warn"`。照常运行 Oxlint：命令行上什么都不用改。

- JS 插件是 Oxlint 的 alpha 功能，不在它的 semver 约定之内。这个插件在 Oxlint 1.85、1.87 和 1.91 上测试过。
- `@botiverse/raft-ui` 必须安装在配置扩展了它的那个包里，作为 dependency 或 dev dependency 都可以。

### 在 ESLint 中开启 {#turn-them-on-in-eslint}

在 flat config 里加入推荐配置：

```js
import raftUi from "@botiverse/raft-ui/lint";

export default [raftUi.configs.recommended];
```

### 规则 {#rules}

| 规则 | 报告什么 | 规则出处 |
| --- | --- | --- |
| `raft-ui/prefer-scroll-area` | 让元素原生滚动的 class：`overflow-auto`、`overflow-scroll` 以及它们的 `-x-` 和 `-y-` 形式，带任意变体（`md:overflow-y-auto`）、写成任意值（`overflow-y-[scroll]`、`overflow-[hidden_auto]`）或写成任意属性（`[overflow-y:auto]`、`[overflow:overlay]`）都算。查找的位置有：`className`、`class`、`classNames`、`…ClassName`、`…ClassNames` 或 `…Class` 属性的值里，同名的对象属性里（如 recipe 插槽的 `className` 选项），以及带这种名字的参数的默认值里（`{ className = "…" }`），中间隔着一层不是 class 辅助函数的调用（`className={wrap("overflow-y-auto")}`）或者是一个返回 class 的函数（`className={(state) => …}`）也算；`cn`、`clsx`、`cx`、`tv`、`cva`、`twMerge`、`twJoin` 或 `classNames` 的参数里；JSX 展开所展开的那个调用的参数里（`{...guard("overflow-x-auto")}`）；以及同一文件中一个当作 class 使用的 `const` 里。另外还有 `overflow`、`overflowX` 或 `overflowY` 中含有 `auto`、`scroll` 或 `overlay` 的 `style`（`"hidden auto"` 也算）：在 `style` 属性里、在 `style` 键下（`{...{ style: { … } }}`），或者在同一文件中被某个 `style` 使用的 `const` 对象里（`style={styles.pre}`）。当作 class 使用的 `const` 可以是：字符串；拼接成一个字符串的列表（`[…].join(" ")`）；对象或变体映射，其中被当作 class 读取的成员算数（`cls.body`），用计算键读取时（`VARIANTS[kind]`）所有成员都算；或者由另一个 const 构造的 const（``const b = `p-2 ${a}` ``） | [ScrollArea：原生滚动](../../packages/ui/src/components/scroll-area/scroll-area.md#native-scrolling) |
| `raft-ui/no-raw-z-index` | 不是命名层的 z-index：带数字或任意值的 Tailwind z class（`z-10`、`-z-1`、`z-[60]`、`z-(--x)`、`[z-index:5]`，带任意变体或 `!` 都算），出现在 `className`、`class` 或 `…ClassName` 属性或对象属性里，`cn`、`clsx`、`cx`、`tv`、`cva`、`twMerge`、`twJoin` 或 `classNames` 的参数里，或者同一文件中一个当作 class 使用的 `const` 字符串里；值为数字或数字字符串的 `zIndex` 属性，无论在 style 对象还是其他对象里（`style={{ zIndex: 10 }}`）；JSX 属性 `zIndex={n}`；以及 `el.style.zIndex = "n"`。`z-auto`、层的名称（`z-raised`、`max-md:z-chrome`）和 `var(--z-index-…)` 不报告 | [层级：层叠顺序](../foundations/elevation.md#layer-order) |

规则读的是代码的字面写法，不看类型，一次只读一个文件。两条规则都检查不到这些 class：放在 `let` 里的、从别的文件导入的、由函数返回给一个变量的、由脚本添加的（`el.classList.add(…)`、`el.style.overflowY = …`），以及写在 CSS 文件里的；CSS 文件里的原生滚动有专门的检查（[CSS 文件](#css-files)）。两条规则读取 class 的位置不同：`raft-ui/no-raw-z-index` 按名字匹配 `const`，不读对象（`styles.log`）、`classNames` 或 `…Class` 属性，也不读不是 class 辅助函数的调用；`raft-ui/prefer-scroll-area` 按上表所说读取这些位置，并按作用域解析 `const`，所以同名的参数不会被当成那个 const。

`raft-ui/prefer-scroll-area` 有意不报告这些：class 辅助函数里、交给一个不是 class 辅助函数的调用的字符串（`cn("p-2", t("overflow-auto"))`，不论在不在 class 属性里）；JSX 展开里，位于不是 class 名的键下、或位于函数里的字符串（`{...props({ title: "overflow-auto" })}`）；没有任何地方当作 class 读取的对象成员；以及名字读起来表示「是或否」的属性（`isClass`、`hasErrorClass`）。

它的报告信息根据命中处的滚动方向和所在的元素而定，并说明应该改成什么写法：

| 报告的内容 | 信息里说的 |
| --- | --- |
| `overflow-y-*`、`overflowY`、`overflow: "hidden auto"` | 写成 `<ScrollArea className="…sizing…" contentClassName="…layout, gap, padding…">`（在 Panel 里用 `PanelScrollViewport`）：尺寸相关的 class（`max-h-*`、`flex-1`、`min-h-0`）留在区域上，grid、flex、间隔和内边距放到 `contentClassName` 上 |
| `overflow-x-*`、`overflowX` | 同上，加上 `orientation="horizontal"`；宽表格则在外面包一层 `TableScroll` |
| `overflow-auto`、`overflow-scroll`、`overflow: "auto"`，或者一个字符串里同时有 x 和 y 的 class | 同上，加上 `orientation="both"`：纵向的区域会截掉比它宽的内容。只有里面没有比区域更宽的内容时，才省略 `orientation` |
| 在 `<textarea>` 或 `Textarea` 上 | 写成 `ScrollAreaTextarea`：textarea 容纳不了滚动条，所以滚动条画在包住它的一个框上 |
| 在 `<pre>`、`<html>`、`<body>` 或 `<iframe>` 上 | 没有可以替换的写法：ScrollArea 无法取代这个元素。它只能作为允许的例外原生滚动（代码的 `<pre>` 就是一种），并加上例外注释 |
| 在 `classNames` 或 `…ClassNames` 对象里，其中的 class 用在另一个组件渲染的元素上 | 用 `useScrollAreaContainer` 和 `ScrollAreaGutters` 绑定那个元素（[自己渲染的容器](../../packages/ui/src/components/scroll-area/scroll-area.md#your-own-container)）；组件不提供访问那个元素的途径时，加例外注释 |
| 在 `ScrollArea`、`PanelScrollViewport` 或 `ScrollAreaTextarea` 元素自己的 `className` 或 `style` 上 | 删掉它：这个区域本来就会滚动，方向由它的 `orientation` 决定。这条信息不提例外 |

用在不同种类元素上的 `const`，得到的是按它的滚动方向给出的信息。每条信息的末尾都附有 ScrollArea 页面的地址（Markdown 格式），读到报告的 Agent 不用再去查找就能修复。具体步骤见[替换原生滚动容器](../../packages/ui/src/components/scroll-area/scroll-area.md#replacing-a-native-scroller)。

### 例外 {#exceptions}

规则自己的页面允许例外时，用一条注释说明是哪种例外。注释以这条规则的标记开头，后面跟着理由，单独占一行，写在规则报告的那一行的正上方（或者写在那一行的末尾）：

```tsx
<pre
  // raft-ui: native-scroll a <pre> holds phrasing content only
  className="overflow-x-auto"
>
```

在 JSX 子元素之间，写成 `{/* raft-ui: native-scroll <reason> */}`。只有标记、没有理由的注释不算数。

注释只覆盖从下一行开始的那个字符串（或者从注释所在那一行开始的字符串），从不覆盖这个字符串所在的调用或属性的其余部分。class 列表分成多行时，把原生滚动的 class 单独放一行，注释紧挨在它上面，这样以后加进列表的 class 仍然会被检查：

```tsx
cn(
  "min-w-0 whitespace-nowrap",
  // raft-ui: native-scroll a one-line strip with no scrollbar
  "overflow-x-auto",
  isActive && "text-foreground",
);
```

注释写在开启一个调用的那一行上方时（比如 `className={cn(`），只覆盖同一行上的字符串，不覆盖后面几行的字符串。对 `raft-ui/prefer-scroll-area` 来说，写在一行代码末尾的注释只覆盖这一行，从不覆盖下一行。这条注释就是例外的记录，放在它所说的代码旁边，审查者或 Agent 读代码时会看到；优先用它，不要用 `oxlint-disable` 或 `eslint-disable` 注释，那样只是关掉规则，却不说明原因。

| 规则 | 标记 |
| --- | --- |
| `raft-ui/prefer-scroll-area` | `raft-ui: native-scroll <reason>` |
| `raft-ui/no-raw-z-index` | `raft-ui: z-index <reason>` |

### CSS 文件 {#css-files}

lint 规则只读 JS 和 TSX，所以写在样式表里的原生滚动（`.log { overflow-y: auto; }`）能通过它们。raft-ui 包为此附带了一个检查，是一个没有依赖的普通 Node 脚本。在存放应用 CSS 的文件夹上运行它，并把它串进 `lint` 脚本，这样凡是运行 linter 的地方都会运行它：

```json
{
  "scripts": {
    "lint": "oxlint && node node_modules/@botiverse/raft-ui/checks/native-scroll-css.mjs src"
  }
}
```

它接受文件、文件夹（递归读取）和 glob（`"src/**/*.css"`），不给路径时读取当前目录下的所有 `.css` 文件。在文件夹里，它跳过任意深度的 `node_modules`、`dist`、`build` 和名字以点开头的文件夹（`src/build` 也跳过），也从不报告 raft-ui 自己的 CSS；你自己点名的文件夹或文件，不管叫什么都会读取。有报告时退出码为 1，没有报告时为 0；路径不存在或无法读取、glob 匹配不到任何文件、或者遇到不认识的选项时为 2，这样 lint 脚本里写错的路径会失败，而不是永远通过。`--json` 把报告输出为 JSON，供程序读取。

| 报告 | 不报告 |
| --- | --- |
| `overflow`、`overflow-x`、`overflow-y`、`overflow-inline` 或 `overflow-block` 的声明，值里含有 `auto`、`scroll` 或 `overlay`：`hidden auto`、`auto !important` 和 `var(--x, auto)` 也算，在压缩过的 CSS 里、在任意深度（`@media`、`@layer`、`@supports`、嵌套规则）都算 | `hidden`、`visible` 和 `clip`；只有一个 `var(--x)` 的值；条件，比如 `@supports (overflow: auto)` 或 `@media (overflow-block: scroll)`；注释、字符串或 `url()` 里的任何内容 |
| `@apply` 里 lint 规则会报告的 class：`overflow-auto`、`overflow-scroll` 以及它们的 `-x-` 和 `-y-` 形式，带任意变体或 `!`、写成任意值（`overflow-[auto]`）或任意属性（`[overflow:overlay]`）都算 | 文件里其他任何地方的 class，比如选择器里的或 `@source inline(…)` 里的 |

每条报告占一行：`file:line:column  selector { declaration }`。报告后面的信息说明怎么做：把这条 CSS 规则所设置样式的元素改成 `ScrollArea`，如果这个元素由另一个组件渲染，就用 `useScrollAreaContainer` 和 `ScrollAreaGutters` 绑定它；然后删掉这条声明（[替换原生滚动容器](../../packages/ui/src/components/scroll-area/scroll-area.md#replacing-a-native-scroller)）。信息末尾附有 ScrollArea 页面的地址（Markdown 格式），和 lint 规则的信息一样。

允许的例外用和代码里相同的标记，写在 CSS 注释里：注释单独占一行，写在声明或 `@apply` 的正上方，或者写在它后面、同一行的末尾。注释以标记开头，只有标记、没有理由的注释不算数；一条注释只覆盖一条声明：写在包含多条声明或规则的一行上方时，只覆盖其中第一条，所以一条注释永远不会允许压缩成一行的 CSS。`@apply` 不论它的 class 占几行，都算一条声明，所以在这里一条注释允许整个 `@apply`，这和代码里的 class 列表不同。`//` 开头的行在 CSS 里不是注释：它不允许任何东西；如果它出现在一条语句的开头（在声明之间单独占一行），它下面的声明仍然会被报告。

```css
.diagram pre {
  /* raft-ui: native-scroll a <pre> holds phrasing content only */
  overflow-x: auto;
}
```

这个检查把 `.css` 文件当作 CSS 读取：它不读 Sass 或 Less（`//` 注释、mixin）、HTML 里的 `<style>` 块，也不读 JS 字符串里的 CSS。

## Token {#tokens}

`@botiverse/raft-ui/tokens.json` 以 [Design Tokens Community Group 格式](https://www.designtokens.org/)保存所有颜色、层级和尺寸 token，包含浅色和深色的值。它是 token 值的唯一来源：`foundation.css` 由它生成，这份文档里的 token 表格也是。设计工具和代码生成器都用它。

什么场合用哪个 token，见基础章节，从[颜色](../foundations/color.md)开始。

## 给 Agent {#for-agents}

这份文档的每个页面都以 Markdown 形式提供给 Agent：

- **[`llms.txt`](https://raft-design.botiverse.build/llms.txt)** 列出每个页面和它的一句话摘要。
- **任意页面的 Markdown**：在页面路径后加 `.md`，例如 `https://raft-design.botiverse.build/components/button.md`。组件页面包含由代码生成的 API。
- **[`components.json`](https://raft-design.botiverse.build/components.json)** 列出每个组件的状态、别名、摘要和文档 URL。
- **Agent Skills** 随 npm 包发布，版本与包一致：`raft-ui-guide` 用于接入 raft-ui 和查阅它的 API，`raft-ui-critique` 用于视觉、交互、无障碍以及浅色和深色模式的评审。

这些 skill 使用标准的 `skills/*/SKILL.md` 目录结构。使用 TanStack Intent 时，在使用方项目的 `package.json` 里允许它们：

```json
{
  "intent": {
    "skills": ["@botiverse/raft-ui"]
  }
}
```

然后安装项目指引并加载 skill：

```bash
pnpm dlx @tanstack/intent@latest install --map
pnpm dlx @tanstack/intent@latest load @botiverse/raft-ui#raft-ui-guide
pnpm dlx @tanstack/intent@latest load @botiverse/raft-ui#raft-ui-critique
```

其他读取同样目录结构的安装工具，比如 `skills-npm` 或 Vercel 的 `skills`，也可以用。

## 相关内容 {#related}

- [设计新功能](../principles/designing-a-new-feature.md)：在新工作中如何选择和组合组件。
- [组件概览](../components/overview.md)：按用途列出的每个组件。
- [包的 README](../../packages/ui/README.md)：同样的配置步骤，放在代码旁边。
