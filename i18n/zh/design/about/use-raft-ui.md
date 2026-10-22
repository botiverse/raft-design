---
title: 使用 raft-ui
summary: 如何安装 raft-ui，配置它的样式表、Tailwind CSS v4 和深色模式，渲染第一个组件，在版本之间升级，以及 token 和给 agent 用的入口在哪里。
sourceHash: 557a9bb8
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
  return <Button variant="primary">Create Task</Button>;
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
| 已弃用 | `@botiverse/raft-ui`，标记为 `@deprecated` | 仍然可用；它的页面会写明替代组件。在下一个主版本中移除 |

### Codemod {#codemods}

包里附带两个 codemod。0.6.0 及之前，这个包以 `raft-ui` 的名字发布；要把项目迁移到 `@botiverse/raft-ui` 和当前的 token 名：

```bash
pnpm add @botiverse/raft-ui
node node_modules/@botiverse/raft-ui/codemods/package-name.mjs src
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs src
pnpm remove raft-ui
```

- `package-name.mjs` 改写导入语句、CSS 的 `@import` 和 `@source` 路径以及依赖项。它会列出所有单独的 `"raft-ui"` 字符串（打包工具的别名、路径映射），留给你手动修改。
- `token-names.mjs` 把 Tailwind 工具类和 `var(--…)` 引用从旧 token 名改写成当前的名字。旧名字作为已弃用的别名继续可用，直到 1.0。

运行 `token-names.mjs` 之后，手动检查两类代码：

- **禁止某个名字的检查。** 禁用某个旧名字的 lint 规则、测试或允许列表，里面的名字也会被改写，于是它变成禁止当前的名字。把那里的旧名字改回来。
- **由片段拼出的模式。** 用片段拼出 token 名的正则表达式不是字面的 token，所以它会保留旧名字，从而匹配不上改写后的源码。把它放宽到也匹配当前的名字。

如果你依赖的某个包把 `raft-ui` 声明为 peer dependency，还要安装 `"raft-ui": "npm:@botiverse/raft-ui@<version>"`，让它解析到同一份副本，而不是再打包一份。

## Token {#tokens}

`@botiverse/raft-ui/tokens.json` 以 [Design Tokens Community Group 格式](https://www.designtokens.org/)保存所有颜色、层级和尺寸 token，包含浅色和深色的值。它是 token 值的唯一来源：`foundation.css` 由它生成，这份文档里的 token 表格也是。设计工具和代码生成器都用它。

什么场合用哪个 token，见基础章节，从[颜色](../foundations/color.md)开始。

## 给 agent {#for-agents}

这份文档的每个页面都以 Markdown 形式提供给 agent：

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
