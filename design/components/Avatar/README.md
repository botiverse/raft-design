# Avatar

头像：agent 和人都是同一种方贴纸，脸说明是谁。agent 是产品的 8×8 像素形象，底色是形象自带的；人是照片或首字母，没有照片时是 `lavender`。

## 什么时候用
- 任何指代一个 agent 或一个人的地方：消息、列表、任务负责人、侧栏、@ 联想、资料卡。工作区也用同一种方块（`--ws`）。
- 频道不是“谁”，不用头像 → ChannelIcon。

## 结构
```html
<span class="rf-avatar rf-avatar--agent rf-sprite-crown"></span>                  <!-- agent -->
<span class="rf-avatar rf-avatar--human">A</span>                                 <!-- 人，没有照片 -->
<span class="rf-avatar rf-avatar--human"><img src="…" alt="Alex"></span>          <!-- 人，有照片 -->
<span class="rf-avatar rf-avatar--empty"><i class="rf-i rf-i-plus"></i></span>     <!-- 还没人认领 -->
<span class="rf-avatar rf-avatar--ws">R</span>                                     <!-- 工作区：墨底黄字 -->
<span class="rf-avatar rf-avatar--agent rf-sprite-ghost">
  <span class="rf-avatar__status rf-pixel--busy" role="img" aria-label="working"></span>
</span>
<span class="rf-avatars">…几个头像…<span class="rf-avatars__more">+3</span></span>
```

## 变体
| | 用在 |
| --- | --- |
| `--xs` 19 · `--sm` 27 · 默认 35 · `--lg` 51 · `--xl` 99 | 侧栏和 chip · 搜索结果和标题栏 · 消息和列表 · 设置里自己的那一行、资料卡 · agent 和人的资料页、引导页（`--xl` 自带硬阴影） |
| 状态灯 `--online` `--busy` `--error` `--offline` `--external` | 在线绿 · 正在干活黄 · 出错橙 · 离线石灰 · 外部 agent 青 |
| `rf-avatars`（小号加 `--xs`） | 成员、关注者、多个负责人；多出来的人数放 `rf-avatars__more` |
| `--empty` | 未认领 |
| `--ws` | 工作区：墨底黄字的首字母（或工作区自己的图），桌面 Rail 顶上 |

## 规则
- 尺寸是“8 的倍数加两条 1.5px 边”，像素才整齐；不要改成 32、40。
- 首字母 1–2 个（`xs`、`sm` 只放 1 个），字号按尺寸取 11 / 13 / 15 / 22 / 40。
- 形象和底色是一对（`rf-sprite-<name>` 同时给两样），不单独改底色；没选形象时用 `robot`。16 个形象见 Assets › Agents。演示里固定用 Wug = crown、Bugen = mushroom、Martin = ghost、Noel = flame、Box = robot。
- 状态灯配 `aria-label`，不闪。它外圈那道缝的颜色由 `--rf-ring` 决定，卡片、侧栏、外框、浮层里都已经设好。
- 不用形状区分人和 agent；需要更明确时，在名字后面加 `rf-tag`（agent）。一个 agent 在整个 App 里只用一个形象。
- 能改的头像（自己的、工作区的、你管理的 agent 的）：悬停、键盘焦点到它、上传中时，盖一层 `scrim` 加上动作的图标（上传或编辑），盖满贴纸。键盘焦点也要显示，否则只靠鼠标才知道它能改。
