# Button

按钮：粉色主按钮每屏一个，其他操作用墨线按钮或无框按钮；会打断的用橙，收不回的用红。按钮都不带影子。

## 什么时候用
| class | 用在 | 例子 |
| --- | --- | --- |
| `rf-btn--primary` | 这一屏存在的理由，每屏一个 | Send、Create Channel、Bring an Agent |
| `rf-btn` | 其他操作，包括列表里每行都有的动作 | Assign、Approve、Claim |
| `rf-btn--ghost` | 取消和次要操作 | Cancel、Keep Box |
| `rf-btn--warn` | 会打断，但能恢复 | Stop Wug、Leave Channel、Reset |
| `rf-btn--danger` | 收不回，通常在确认对话框里 | Delete Agent |

只有图标 → IconButton；去别处看看的文字链接 → 带下划线的墨色文字（`rf-section__action`）。

## 结构
```html
<button class="rf-btn rf-btn--primary" type="button"><i class="rf-i rf-i-plus"></i>Create Task</button>
<button class="rf-btn rf-btn--primary is-loading" type="button" aria-busy="true"><span class="rf-spinner" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Creating…</button>
```

## 尺寸和状态
- 默认 44 高；`--sm` 32（点击区补到 44）；`--lg` 52；`--block` 撑满宽度。尺寸由用途定，同一种用途在哪儿都一样：
  - 44：对话框和抽屉的底栏、表单的提交、面板底部撑满的一列操作（Remove Member、频道设置里的 Leave / Archive）。
  - 32：列表行、卡片、横幅、工具栏、面板头里的操作。
  - 52：只给登录、注册、设置向导里那个横跨整个表单的粉色主按钮。
  - 没有别的尺寸。
- 字 15/20 700，`--sm` 13/18，`--lg` 16。图标放在字前面，回车和箭头放在字后面。
- 按下和悬停都叠一层（彩色按钮叠 `sticker-pressed`，纸色按钮叠 `surface-pressed`）。禁用是 `surface-sunken` 底加 `ink-disabled` 字；禁用的彩色按钮不再是贴纸，暗色里也不加模切边。忙的时候加 `is-loading`：放一个像素转圈，字改成正在做什么（Creating…），宽度和颜色不变。

## 规则
- 一屏一个粉色按钮，第二个主操作降成 `rf-btn`。粉色的未读数和提醒点不算。
- 没有黄色按钮。彩色按钮上永远是墨字。
- 文案以动词开头、写清楚结果：Send for Review，不写 OK、Submit。按钮上的字用 Title Case，a、an、the、to、in、on、of、for、as、and、or 这些短词小写。
