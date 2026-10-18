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

## 中性图标块 `rf-tile`
没有身份、也不是一个地方的东西（系统通知、文件、应用、电脑、搜索结果里的种类）放在同样的中性方块里，换一个图标：`surface-sunken` 底、`ink-2` 图标，没有边。

```html
<span class="rf-tile"><i class="rf-i rf-i-monitor"></i></span>
<span class="rf-tile rf-tile--warn"><i class="rf-i rf-i-octagon-alert"></i></span>   <!-- 通知中心：出错 -->
```

- 尺寸和头像对齐，放在头像会放的位置：`--xs` 19（图标 11）、`--sm` 27（14）、默认 35（18）、`--lg` 51（22，资料页的头）。
- `--warn`（浅橙）和 `--info`（浅青）只给通知中心的出错、警告和消息，图标是墨。
- 方块是装饰：旁边有字时不读；单独表示一样东西时（比如频道类型）配 `aria-label`。
