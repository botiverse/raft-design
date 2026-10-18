# Sidebar

桌面侧栏：Rail 选中哪个入口，侧栏就列它的内容（Raft Chat 的 Chat 列频道、agent 和私信，Members 列成员）。头上写入口的名字，右边可以放谁在干活的那叠头像；选中行是黄贴纸，未读是粉色数字，@你 是黄色 @ 标记。

## 结构
```html
<aside class="rf-side" aria-label="Chat">
  <div class="rf-side__head">Chat<span class="rf-chead__spacer"></span><button class="rf-working rf-working--count" type="button" aria-haspopup="dialog" aria-label="2 agents working">…</button></div>
  <div class="rf-side__body">
    <div class="rf-section"><button class="rf-section__title" type="button" aria-expanded="true"><i class="rf-i rf-i-chevron-down"></i>Channels</button><button class="rf-section__action" type="button">New</button></div>
    <a class="rf-srow is-on" href="…" aria-current="page"><span class="rf-srow__icon"><i class="rf-i rf-i-hash"></i></span><span class="rf-srow__name">wg-landing-features</span></a>
    <a class="rf-srow rf-srow--unread" href="…"><span class="rf-srow__icon"><i class="rf-i rf-i-hash"></i></span><span class="rf-srow__name">release-review</span><span class="rf-badge" role="img" aria-label="2 unread">2</span></a>
    <a class="rf-srow" href="…"><span class="rf-avatar rf-avatar--agent rf-avatar--xs rf-sprite-crown">…</span><span class="rf-srow__name">Wug</span><span class="rf-srow__meta rf-srow__meta--live">Drafting launch notes</span></a>   <!-- 在干活：写它在做什么 -->
    <a class="rf-srow" href="…"><span class="rf-avatar rf-avatar--agent rf-avatar--xs rf-sprite-ghost">…</span><span class="rf-srow__name">Martin</span><span class="rf-srow__meta">Codex</span></a>
  </div>
</aside>
```

## 行的状态
| class | 样子 |
| --- | --- |
| `is-on` | 黄贴纸：你在这里 |
| `rf-srow--unread` | 名字 700，加粉色数字；提到你时换成 @ 标记 |
| `rf-srow--muted` | `bell-off` 图标，名字 `ink-2`，未读用灰色数字 `rf-count` |
| `rf-srow--away` | 离线或没加入：名字 `ink-3` |

## 规则
- 默认 240 宽，可以拖到 180–320；`sidebar` 奶油底，右沿 `line-seam`。头部 56 高，写入口的名字（17/22 700），和主区的面板头对齐；工作区切换在 Rail 顶上，不在这里。
- 头的右边放谁在干活（AgentActivity 的 `rf-working--count`）：一叠头像加人数，点开 Working now。没人在干活时不放。侧栏底下不放实时条。
- 每行 36 高、15/20。频道放裸的 `#`（私有频道是 `lock`），agent 和人放 19px 头像；agent 行右边写运行时（Space Mono），它在干活时换成它正在做的事（`rf-srow__meta--live`，Grotesk 13/18 `ink-2`），最多占这一行的 58%。
- **一行在任何分组里都一样。**同一个对话不管列在原分组、置顶还是自定义分组里，画法完全相同：分组不能改变行的样子（不在某个分组里折行、不在某个分组里藏描述）。
- 名字永远一行，放不下用省略号；置顶也不折行。名字后面可以跟一句描述（`rf-srow__sub`，13/18 `ink-2`）：地方不够时**描述先让出位置**，描述没了名字才开始省略。
- 内容天然两行的行（电脑：名字 + 运行状态，`rf-srow--two`）从 36 往下长，文字离行边仍是 8，图标对齐第一行；名字照样一行省略。
- 哪个入口有侧栏、侧栏里列什么，由产品定（Raft Chat 见那一页）。
- 分组标题是能折叠的按钮，折起来时写数量。
