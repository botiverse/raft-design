# ChannelIcon

频道标：频道是一个地方，不是一个“谁”。列表里是一块中性的 `#` 方块；只在你所在频道的标题栏里变成黄色位置块。

## 什么时候用
- 列表、搜索结果、引用里的频道。人和 agent → Avatar；没有身份的系统通知 → `rf-tile`（同样的中性方块，换一个图标）。

## 结构
```html
<span class="rf-chan"><i class="rf-i rf-i-hash"></i></span>                           <!-- 列表里 -->
<span class="rf-chan rf-chan--sm rf-chan--here"><i class="rf-i rf-i-hash"></i></span>   <!-- 标题栏：你在这里 -->
```

## 规则
- 尺寸和头像对齐：默认 35，`--sm` 27（标题栏），`--xs` 19。
- 黄色位置块一屏最多一个；列表里的“当前”由选中行表示，不用黄方块。
- 桌面侧栏只放裸的 `#`（`rf-srow__icon`），不放方块。
- 不给频道分配颜色；私有频道把 `#` 换成 `lock`，方块不变。
