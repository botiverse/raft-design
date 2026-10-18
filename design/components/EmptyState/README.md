# EmptyState

空状态：没有内容时，说清楚为什么空、下一步做什么。只有一种样子：灰色的 36 图标，不加框；灰色的标题；一句话；最多一个按钮。

## 什么时候用
| 情况 | 写什么 |
| --- | --- |
| 还没有东西 | 为什么空、怎么让它出现：“Tick As Task when you send a message, and it lands here.” |
| 筛选或搜索没有结果 | 哪些条件在生效，按钮是 Clear All |
| 正在加载 | 这不是空状态 → Loading 的骨架 |

## 结构
```html
<div class="rf-empty">
  <span class="rf-empty__icon" aria-hidden="true"><i class="rf-i rf-i-square-check-big"></i></span>
  <div class="rf-empty__title">No tasks yet</div>
  <p class="rf-empty__body">Tick As Task when you send a message, and it lands here.</p>
  <div class="rf-empty__actions"><button class="rf-btn rf-btn--sm" type="button">Create Task</button></div>
</div>
```

## 规则
- 直接放在内容区正中，不包卡片、不给图标加框、不放贴纸。图标 36 `ink-3`；标题 17/22 700 `ink-2`，句首大写；正文 14/20 `ink-3`。
- 按钮最多一个，用墨线 `rf-btn--sm`，不用粉色。
- 空状态是提示，不是标题：字小、颜色淡，不抢下一步该点的那个按钮。
