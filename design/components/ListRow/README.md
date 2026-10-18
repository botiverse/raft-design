# ListRow

列表行：频道、私信、设置项共用的一行——前导方块、标题和预览、时间和徽标；行与行之间的发丝线从文字起点开始。列表顶上的几行入口（Search、Activity、Saved 这类）之间不画线。

## 什么时候用
- 手机上的会话列表、设置列表、成员列表，搜索结果里的频道和人。
- 资料页、电脑详情里列 agent 和人：一律是放在 `rf-list--inset` 里的这一种行（产品的 AvatarListRow），不另做。
- 桌面侧栏里的行 → Sidebar；通知和动态 → Inbox。

## 结构
```html
<div class="rf-section"><span class="rf-section__title">Channels</span><button class="rf-section__action" type="button">Browse</button></div>
<a class="rf-row rf-row--unread" href="…">
  <span class="rf-chan"><i class="rf-i rf-i-hash"></i></span>
  <span class="rf-row__body">
    <span class="rf-row__top"><span class="rf-row__title">launch-week</span><span class="rf-row__time">10:42</span></span>
    <span class="rf-row__bottom"><span class="rf-row__sub">Wug: Release notes are drafted.</span><span class="rf-badge" role="img" aria-label="3 unread">3</span></span>
  </span>
</a>
```

## 变体和状态
| class | 样子 |
| --- | --- |
| `rf-row--unread` | 标题 700、预览变成 `ink`、右下粉色徽标；提到你时换成 @ 标记 |
| `is-selected` | 整行 `cyan-soft`：旁边打开的就是这一项 |
| `rf-row--muted` | 标题 `ink-2`，`bell-off` 图标，未读用灰色数字 `rf-count` |
| `rf-row--away` | 还没加入：标题和预览都是 `ink-3` |
| `rf-row--entry` | 入口：一个 20px 图标加名字，右边可以放徽标或灰色数字；48 高，行和行之间不画线——它们是一组按钮，不是一列内容 |
| `rf-row--plain` | 设置项：最少 44 高，可以放 `rf-row__icon`、右边的当前值 `rf-row__value` 加箭头，或者一个开关 |
| `rf-list--inset` | 把一组行包成卡片：`surface` 底、发丝线、`radius-lg` |

## 规则
- 最少 64 高（`size-row`）；标题 16/24 600，预览 14/20 `ink-2`，时间 Space Mono 12。
- 列表是内容：不加墨线、不加硬阴影；整行都能点，按下和悬停叠 `surface-pressed`。
- 预览以说话的人开头（Wug: …）；一行最多一个徽标。
- 分组标题 `rf-section`：13/18 700 `ink-3`，句首大写；能折叠时标题是一个按钮（`aria-expanded`），折起来写数量。右边的动作是带下划线的墨色文字按钮。
