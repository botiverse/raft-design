# AgentActivity

agent 在干活时怎么显示：写在它出现的地方，不另开一条实时条。页面顶上一行摘要（一叠头像、几个人），它那一行写它正在做的事，它所在的地方写谁在这里干活，点开摘要是 Working now 列表。

## 结构
```html
<!-- 摘要：手机一级页大标题下面 -->
<button class="rf-working" type="button" aria-haspopup="dialog">
  <span class="rf-stack" aria-hidden="true"><span class="rf-avatar rf-avatar--agent rf-sprite-mushroom"></span><span class="rf-avatar rf-avatar--agent rf-sprite-crown"></span></span>
  2 agents working<i class="rf-i rf-i-chevron-right"></i>
</button>

<!-- 摘要的短版：桌面侧栏头、和线上一样的手机首页，只写人数 -->
<button class="rf-working rf-working--count" type="button" aria-haspopup="dialog" aria-label="2 agents working"><span class="rf-stack" aria-hidden="true">…</span>2</button>

<!-- 手机列表里 agent 的那一行：第二行换成它正在做的事 -->
<span class="rf-row__bottom"><span class="rf-row__live">Editing <span class="rf-mono">Flow.tsx</span> · <span class="rf-mono">#25</span></span></span>

<!-- 桌面侧栏的 agent 行：右边的运行时换成它正在做的事 -->
<span class="rf-srow__meta rf-srow__meta--live">Editing Flow.tsx</span>

<!-- 对话里：名字下一行的状态 -->
<p class="rf-msg__status"><span class="rf-pixel rf-pixel--busy"></span>Reviewing <span class="rf-mono">#25</span>…</p>
```

## 放在哪
| 地方 | 用 |
| --- | --- |
| 手机一级页，大标题下面 | `rf-working`：一叠头像、“2 agents working”、箭头；点开从底部升起 Working now |
| 桌面侧栏头、和线上一样的手机首页 | `rf-working--count`：一叠头像加人数；点开是同一份列表 |
| agent 的那一行 | 手机：第二行 `rf-row__live`（墨色），时间写干了多久；桌面侧栏：`rf-srow__meta--live` 代替运行时 |
| 它所在的地方 | 顶栏副标题：一叠头像加“2 agents working · 5 members” |
| 对话里 | 头像上的黄灯，加名字下一行的 `rf-msg__status` |
| Working now 列表 | Sheet 的底部列表（桌面贴着那叠头像弹出）：每个正在干活的 agent 一行，写在做什么（带任务号）、干了多久；点一行跳到它所在的地方 |

## 规则
- 写它在做什么，带上任务号：“Editing Flow.tsx · #25”。不写“Processing…”。
- 一叠头像最多 3 张脸，19px，后一张压前一张 5px；多出来的只在字里说（“5 agents working”）。没有人在干活时，摘要整行收起来，不写 0。
- 灯不闪、不呼吸，也没有“正在输入”的跳动：一屏十几个 agent 一起动，会干扰阅读。
- 有人开始或停下时，那叠头像里的脸滑开、淡入淡出（`--rf-ease-slide`，180–220ms）；字直接换，不做数字滚动。`prefers-reduced-motion` 时直接换。
- 出错的 agent 换成橙灯，它那一行写原因；整个工作区都受影响的（电脑离线）进通知中心。
- 做完了不留在摘要里：agent 发一条消息，附上证据（Message 的 `rf-proof`），它那一行换回最后一条消息。
- 不做贴在 Tab 栏上面、侧栏底部的实时条（产品的 LiveAgentActivityBar）：它占着最好的位置，一直在变，却往往和正在看的这一页无关（见《取舍》）。
