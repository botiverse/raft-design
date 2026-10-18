# Banner

提示条：要先读它再动手的一段说明。按意图分四种浅底——信息青、警告橙、危险红、成功绿；字和图标一律是墨。放在对话框、表单的内容里；一个面板里的东西出了问题时，是面板头下面的一条通栏。

## 什么时候用
按问题的范围选地方，范围越大，放得越外：

| 范围 | 放在哪 |
| --- | --- |
| 一个输入框填错了 | TextField 的报错，不用提示条 |
| 一次操作：对话框、表单里动手之前要知道的事（共享频道谁能看到、删除的后果、额度的限制、保存好了） | 提示条，放在内容里 |
| 一个面板里的东西：这个 agent 起不来、这个频道的设置没存上 | 通栏 `rf-banner--strip`，贴在面板头下面 |
| 整个工作区：电脑离线、额度快满 | 通知中心（Inbox，铃铛上挂提醒点），不在页面顶上堆横幅 |

刚做完的事的回执 → Toast；要你马上决定 → Dialog。

## 结构
```html
<div class="rf-banner rf-banner--warning" role="status">
  <i class="rf-i rf-i-triangle-alert"></i>
  <div><span class="rf-banner__title">This channel is shared with Acme</span><span class="rf-banner__body">People and agents from Acme will see what you post here.</span></div>
  <div class="rf-banner__actions"><button class="rf-btn rf-btn--sm" type="button">See Who</button></div>
</div>

<!-- 通栏：面板头下面，铺满面板宽 -->
<div class="rf-banner rf-banner--warning rf-banner--strip" role="status">
  <span class="rf-pixel rf-pixel--error"></span>
  <span class="rf-banner__body">Failed to authenticate: the OAuth session expired and could not be refreshed.</span>
  <div class="rf-banner__actions"><button class="rf-iconbtn rf-iconbtn--sm" type="button" aria-label="Copy Details"><i class="rf-i rf-i-copy"></i></button><button class="rf-section__action" type="button">View Logs</button></div>
</div>
```

## 变体
| class | 用在 | 底 | 图标 |
| --- | --- | --- | --- |
| （默认） | 信息、限制 | `cyan-soft` | `info` |
| `--warning` | 要留意、但能恢复 | `orange-soft` | `triangle-alert` |
| `--danger` | 收不回的后果，多半在删除确认里（`role="alert"`） | `red-soft` | `octagon-alert` |
| `--success` | 做完了、保存了 | `lime-soft` | `circle-check` |

## 两种放法
| | 提示条（默认） | 通栏 `--strip`，加在上面任何一种上 |
| --- | --- | --- |
| 放在 | 对话框、表单的内容里 | 面板头下面，铺满面板宽 |
| 边 | 容器圆角加一圈发丝线 | 没有圆角；它是面板里的一个区域，上下都是分区线，上面那条就是面板头的 |
| 内边距 | 12 / 14 | 上下 10；左右和面板一样，20（手机 16） |
| 字 | 14/20，标题 700 | 14/20 600，最多两行；前面一个状态像素代替图标 |
| 动作 | 字下面一行 `rf-btn--sm` | 右边，和第一行字居中：32 的按钮不把它撑高 |

## 规则
- 出了问题用警告橙；红只给收不回的后果。
- 一处最多一条。写清楚现在怎么了、下一步做什么；有出路就给一个 `rf-btn--sm`（通栏里是小号图标按钮或文字按钮），不放粉色按钮。
- 不加墨框：浅底是高亮，不是贴纸。
