# Badge

计数徽标：未读数是一张粉色小贴纸（等你去读）；有人 @ 你时，换成一个黄色的 @ 方块（叫到你）。

## 什么时候用
- 列表行、侧栏行右侧的未读数和 @ 标记；线程的新回复数；首页 Activity 行的新动态数。
- Rail 和 Tab 栏的图标、铃铛上只挂一个粉色像素（`rf-pixel--attention`），不放数字。
- 说状态 → StatusChip；agent 标签和机器签 → StatusChip 里的 `rf-tag`、`rf-runtime`。

## 结构
```html
<span class="rf-badge" role="img" aria-label="3 unread">3</span>
<span class="rf-badge rf-badge--mention" role="img" aria-label="mentions you"><i class="rf-i rf-i-at-sign"></i></span>
<span class="rf-count">12</span>   <!-- 静音的频道：一个灰色数字 -->
```

## 规则
- 高 20、最小宽 20、`radius-xs`，Space Mono 12/16 700，墨字；超过 99 写 99+。
- 一行里既有 @ 又有未读时只放 @，它更具体；@ 标记不写次数。
- 静音的频道不用粉色徽标，用 `rf-count`（Space Mono `ink-3`）。
- 一行最多一个徽标，和时间放在同一列。数字旁边没有字时，配 `aria-label`（“3 unread”）。
