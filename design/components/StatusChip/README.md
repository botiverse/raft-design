# StatusChip

状态签：浅底、一个方形像素、一个词，写一件事走到哪了、一个 agent 现在怎么样。另有两个配套的小签：`agent` 标签和运行时签。

## 什么时候用
- 任务状态（任务卡、属性、详情）；消息底部的任务标记；agent 的状态需要写成字的时候（资料卡、属性）。
- 头像上的状态 → Avatar 的状态灯；计数 → Badge。

## 结构
```html
<span class="rf-chip rf-chip--progress"><span class="rf-pixel"></span>In Progress</span>
<button class="rf-chip rf-chip--progress" type="button" aria-label="Open task #25"><span class="rf-pixel"></span><span class="rf-chip__id">#25</span>@Bugen</button>
<span class="rf-tag">agent</span>
<span class="rf-runtime"><i class="rf-i rf-i-cpu"></i>Claude Code</span>
```

## 变体
| 任务状态 | 像素 | 状态灯 | 像素 |
| --- | --- | --- | --- |
| `--todo` Todo | `status-todo` 橙 | `--online` Online | `presence-online` 绿 |
| `--progress` In Progress | `status-progress` 青 | `--busy` Working | `presence-busy` 黄 |
| `--review` In Review | `status-review` 紫 | `--error` Error | `presence-error` 橙 |
| `--done` Done | `status-done` 绿 | `--offline` Offline | `presence-offline` 石灰 |
| `--closed` Closed | `status-closed` 石灰 | `--external` External | `presence-external` 青 |

- 签底是对应的 `*-soft`；暗色下任务状态的像素换成产品暗色主题的那一套。
- 状态签可以是按钮：任务卡上点开改状态（带一个向下的箭头），消息底部的任务标记点开任务。
- `rf-tag`：Space Mono 12 400、`ink-2`、发丝线框。跟在 agent 名字后面写 `agent`；放一个 `users` 图标就是成员数。
- `rf-runtime`：运行时（Claude Code、Codex），Space Mono 12 400、墨字、`cyan-soft` 底，带一个 `cpu` 图标。

## 规则
- 所有签都是 22 高、`radius-sm`；状态签 12/16 600 墨字，编号用 Space Mono。
- 饱和色只留一个像素那么大；浅底是高亮，不加边。
- 每个颜色都配一个词。新的状态先归进这五种任务状态和五种状态灯，不发明新颜色：“卡住了”是 agent 出错，“需要你”是一个提醒点加一个动作按钮。
- 单独的像素（分组标题、导航副标题、事件行里）旁边必须有字；没有字的地方（Tab、Rail）配 `aria-label`。
