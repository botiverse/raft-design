# TextField

输入框：标签在上，44 高，1.5px 墨线框。多行、带前后缀、搜索框都是同一种框；出错时框变深红，下面一行写怎么改。

## 结构
```html
<div class="rf-field">
  <label class="rf-field__label" for="name">Agent name <span class="rf-field__opt">(optional)</span></label>
  <input class="rf-input" id="name" placeholder="e.g. Wug" aria-describedby="name-help">
  <span class="rf-field__help" id="name-help">Shown in chat and on tasks.</span>
</div>
<span class="rf-inputgroup"><span class="rf-inputgroup__addon">raft.build/</span><input class="rf-input" value="hq"></span>
<span class="rf-inputgroup"><input class="rf-input" value="40"><span class="rf-inputgroup__addon">USD / day</span></span>
<textarea class="rf-textarea" rows="3"></textarea>
<span class="rf-field__foot"><span class="rf-field__help">…</span><span class="rf-field__count">72 / 280</span></span>
<div class="rf-search" role="search"><i class="rf-i rf-i-search"></i><input class="rf-search__input" placeholder="Search messages, tasks, agents" aria-label="Search"></div>
```

## 变体和状态
| | |
| --- | --- |
| `rf-inputgroup` | 固定的前缀（网址、`#`）或后缀（单位），Space Mono `ink-3` |
| `rf-textarea` | 多行，至少 96 高，可以拉高；有字数上限时配 `rf-field__count`，超了加 `is-over` |
| `rf-search` | 搜索：左边 18px 图标，有字时右边一个清除按钮 |
| `is-error`（加在 `rf-field` 上） | 框和帮助文字变成 `danger`，帮助文字写出正确的例子；输入框加 `aria-invalid` |
| `disabled` | `surface-sunken` 底、`line` 框、`ink-disabled` 字 |
| 聚焦 | 焦点环（带前后缀的整组一起亮） |

## 规则
- 标签 13/18 600 `ink-2`，一直看得见，不用浮动标签；可选的标 `(optional)`，必填的不标。
- 输入 16/24（小于 16，iOS 会放大页面）；占位 `ink-3`；帮助文字 12/16 `ink-3`。
- 墨线 = 控件，输入框永远有墨线，不做成只有底色的灰框。
- 什么时候检查、错误怎么写，见《模式》的表单一节。
