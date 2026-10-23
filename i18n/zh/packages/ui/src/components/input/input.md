---
title: Input
summary: 单行文本输入框，高度与控件相同，带 1.5px 的墨色边框，用来输入一个值。
sourceHash: d4b1eb9a
---

# Input

输入框接收一行文字。它和默认控件一样高，手机上 44px，桌面端 32px（[间距与尺寸](../../../../../design/foundations/spacing.md#heights)），在 `layer-card` 上带 1.5px 的墨色边框（`line-field`，和按钮的边框一样宽）。它总是放在 [Field](../field/field.md) 里，由 Field 在上方提供标签、在下方提供帮助文字。带前缀或后缀的输入框、多行输入框和搜索框都用同样的框。

```example
input/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 用 |
| --- | --- |
| 一行文字：名字、邮箱、URL | Input |
| 带固定前缀或后缀（域名、`#`、单位）的一行文字，或搜索框 | [InputGroup](../input-group/input-group.md) |
| 表单里的多行文字 | [Textarea](../textarea/textarea.md) |
| 要发送的消息 | [Composer](../composer/composer.md) |
| 从列表里选一个值 | [Select](../select/select.md) |

## 状态 {#states}

状态遵循[状态](../../../../../design/foundations/states.md)。

- **无效：** `data-invalid` 让输入框显示 `danger-strong` 边框。错误信息放在 Field 里（[Field](../field/field.md)）。
- **禁用：** 禁用优先于无效。禁用的输入框保持禁用的边框，因为没人能修改它。

## 内容 {#content}

- 占位文字写成示例值（如 Wug），用 `foreground-hint`。不要用占位文字代替标签：标签始终显示在输入框上方。

## 无障碍 {#accessibility}

Input 封装了 Base UI 的 Input，渲染原生 `<input>`。

- 用 `FieldLabel` 给它命名（[Field](../field/field.md)）。只有放不下可见标签的地方（比如紧凑的工具栏）才用 `aria-label`。
- `data-invalid` 同时会设置 `aria-invalid`。
- 只在不是登录凭据、且密码管理器的浮层会挡住界面的输入框上设置 `suppressPasswordManager`。邮箱和密码输入框不要设置。

## 规则 {#rules}

- 始终画出墨色边框。不要把输入框做成没有边框的灰色填充框：墨色边框正是它作为控件的标志（[颜色](../../../../../design/foundations/color.md#lines)）。
- 输入框文字用字段 token（`text-field`、`font-field`）设置，不要自己定字号：在手机和触屏上它们保持 16px，因为字号更小时 iOS 会把页面放大到输入框；在桌面端（768px 起、使用鼠标或触控板）则是正文字号 14px（[字体排印](../../../../../design/foundations/typography.md#metric-tokens)）。
- 在焦点离开输入框或提交表单时校验值（[表单和设置](../../../../../design/patterns/forms.md#validation)）。
