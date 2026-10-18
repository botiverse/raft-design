# IconButton

只有图标的按钮：在外框、标题栏、composer 和工具条里不加框；单独放在内容里时加墨线；发送是粉色。

## 什么时候用
- 搜索、更多、返回、关闭、复制、附件这类一看图标就懂的动作。图标说不清楚 → 带字的 Button。

## 结构
`<button class="rf-iconbtn" type="button" aria-label="Search"><i class="rf-i rf-i-search"></i></button>`

## 变体
| class | 用在 |
| --- | --- |
| `rf-iconbtn` | 手机顶栏：无框，44×44，图标 22；有新东西时右上挂一个粉色像素（铃铛）。桌面的面板头里用小号的尺寸（见 Panel） |
| `--outline` | 单独放在内容里的工具：`surface` 底加墨线 |
| `--primary` | 发送：粉色贴纸 |
| `--sm` | 32×32、图标 18：composer 工具、卡片和命令行里的复制；点击区补到 44。桌面悬停工具条里的按钮也是 32，只给鼠标用 |

## 规则
- `aria-label` 必须有，用 Title Case（Add Reaction）；有鼠标时配一个 Tooltip，写同一个名字和快捷键。不能点时加 `disabled`：图标变成 `ink-disabled`。
- 几个按钮放在一起时，装进 `rf-nav__actions`，它负责靠右和间距。
- 发送键算这一屏的粉色按钮。
- 挨着一个 44 高输入框的图标按钮（复制链接、删掉这一行）和输入框一样高：44。
