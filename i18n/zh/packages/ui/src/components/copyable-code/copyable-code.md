---
title: CopyableCode
summary: 一条供人复制后运行的命令，放在代码表面上，旁边有复制按钮，复制成功后显示对勾。
sourceHash: e201aaef
---

# CopyableCode

一行供人复制、拿到别处运行的命令：连接计算机、安装 CLI 或登录的那条命令。命令放在代码表面上，旁边是复制按钮；复制之后，按钮会短暂显示一个对勾。

```example
copyable-code/compositions/compact-detail-command
```

## 何时使用 {#when-to-use}

| 场景 | 使用 |
| --- | --- |
| 一条供人复制并运行的命令 | CopyableCode |
| 句子里的一个代码中的名称 | [InlineCode](../inline-code/inline-code.md) |
| 几行代码，或一段日志 | [CodeBlock](../code-block/code-block.md) |

## 结构 {#anatomy}

- `CopyableCodeRoot`：容纳命令和按钮，并处理复制。必需。
- `CopyableCode`：命令。复制的就是它的文字。必需。
- `CopyableCodeAction`：复制按钮，一个图标 [Button](../button/button.md)。必需。

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `size="md"` | 对话框或页面的主要步骤，比如设置计算机 |
| `size="sm"` | 夹在其他信息里的一条命令，比如在面板或列表里 |

## 状态 {#states}

| 状态 | 样子 |
| --- | --- |
| 已复制 | 复制图标变成对勾，片刻后变回 |
| 复制失败 | 组件本身没有变化；会调用 `onError`，由你告诉用户 |

```example
copyable-code/compositions/copy-failure
```

```example
copyable-code/compositions/copy-error-toast
```

## 行为 {#behavior}

- 按钮复制 `CopyableCode` 的文字内容。`onCopy` 只在复制成功后调用。
- 不加 `truncate` 时，长命令会换行；加上后，命令保持一行，可横向滚动。

## 内容 {#content}

- 命令的写法与人实际运行时完全一致。
- 复制失败时，说明失败了，并说明该怎么做："Couldn't copy the command. Copy the text manually, or check the browser's clipboard permission."（无法复制命令。请手动复制文字，或检查浏览器的剪贴板权限。）

## 无障碍 {#accessibility}

- `CopyableCodeAction` 默认的标签是 "Copy code" 和 "Copied code"，并会播报变化（`aria-live="polite"`）。给它一个说明复制的是什么的 `aria-label`："Copy login command"。
- 通过 `onError` 用文字告诉用户复制失败了（用 [Toast](../toast/toast.md) 或一行状态文字）。光靠图标说明不了失败。
- 命令是一个 `code` 元素，所以读屏软件会把它当文字读出。

## 规则 {#rules}

- 命令用 Space Mono，`text-mono-code`，放在 `layer-code` 上，加 `line-hairline` 边框。
- 命令保持一行：用 `truncate`，不要让它换行。
- 不要复制 `$ ` 提示符。把提示符放在 `CopyableCode` 外面，因为里面的所有内容都会被复制。
