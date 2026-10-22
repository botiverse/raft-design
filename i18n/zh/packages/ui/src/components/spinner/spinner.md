---
title: Spinner
summary: 像素加载指示器，四个方形像素轮流亮起，用于时长未知、又没有布局可占的等待。
sourceHash: c0296ae5
---

# Spinner

像素加载指示器是四个轮流亮起的方形像素。当某个东西加载时间未知、又没有布局可占时使用，比如很小的区域，或者正在获取菜单项的菜单。哪种等待用哪种加载指示，见[选择组件](../../../../../design/components/overview.md#waiting)。

```example
spinner/compositions/default
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 时长未知，没有布局可占 | Spinner |
| 正在加载的内容布局已知 | [Skeleton](../skeleton/skeleton.md) |
| 已知百分比 | [Progress](../progress/progress.md) |
| 等待是由按钮触发的 | 按钮的加载状态（[Button](../button/button.md)） |

## 变体 {#variants}

- `size` 缩放像素：`xs` 宽 9.5px，`sm`（默认）12px，`md` 14px，`lg` 19px。按[尺寸](#size)选择。
- 加载指示器采用周围文字的颜色。`variant="inverse"` 让它用反色前景，用于明暗相反的表面。

### 尺寸 {#size}

加载指示器和它所替代的东西相匹配：它为将要出现的东西占位，所以用那个东西的尺寸，旁边那行文字用那个东西的字体样式。

| 它替代的是什么 | 尺寸 | 旁边那行文字 |
| --- | --- | --- |
| 一行文字里的图标：引用的图标、附件行的图标 | 图标的尺寸：14px 图标用 `xs`，16px 用 `sm`，18px 用 `md`，22px 用 `lg`，让像素覆盖原来图标笔画的范围。它位于文字的行框里，所以这一行保持文字的行高 | 没有，或用文字本身的样式 |
| 面板或列表的内容：会话、个人资料、列表的下一页 | `md` 或 `lg`，居中放在内容将要填满的空间里 | `foreground-muted` 的 `text-callout` 或 `text-body`，不用 `text-caption` 或 `foreground-hint`：在内容到达之前，这一行就是内容 |
| 媒体：正在加载的图片或视频 | `md`，在媒体的遮罩上用 `variant="inverse"` | 没有 |

- 不要为了让等待显得不要紧而把占位做小：空面板中间一个 9.5px 的加载指示器加一行提示色的说明文字，看起来就是一个空面板，人在等，却不知道有东西正在发生。

## 加载页 {#loading-screen}

应用正在启动、屏幕上还什么都没有时，加载页用像素加载动画代替加载指示器：各个 agent 的像素小人在 Raft 标志旁轮流亮起。加载页是品牌页面，所以可以显示标志（[品牌](../../../../../design/foundations/brand.md#logo)）。像素加载动画是文档里的一个组合示例，不是 raft-ui 的导出。

```example
spinner/compositions/pixel-loader
```

## 行为 {#behavior}

- 等待超过 1 秒后才显示加载指示器，这样加载快时它不会一闪而过。raft-ui 不会替你做延迟：加载指示器常常放在行内或按钮里，在那里立刻开始才是对的。列表骨架屏只用于慢的加载，所以它默认会等待 1 秒（[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)）。
- 等待一结束就立刻移除它。
- 开启 `prefers-reduced-motion` 时，像素停止，第一个保持亮着（[动效](../../../../../design/foundations/motion.md#principles)）。

## 内容 {#content}

- 在加载指示器旁放一行短文字，说明正在加载什么：写 "Loading messages"，不写 "Loading…"（[写作](../../../../../design/content/writing.md)）。

## 无障碍 {#accessibility}

- `Spinner` 渲染 `role="status"`，无障碍名称为「Loading」。传入一个说明正在加载什么的 `aria-label`。

## 规则 {#rules}

- 不要把加载指示器画成圆环或圆点。Raft 里的每个点都是方形像素（[形状](../../../../../design/foundations/shape.md)）。
- 加载指示器只用于加载，不用来表示状态：工作中的 agent 是一盏静止的灯，不是加载指示器（[动效](../../../../../design/foundations/motion.md#principles)）。
