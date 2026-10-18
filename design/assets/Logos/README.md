# Logos

官网（raft.build）原版 SVG，几何形状逐字复制。

- `raft-logo.svg`：亮底用。墨黑 `#141111` 外轮廓，字母和符号内部是奶油色 `#FFFAEF`（官网的纸色，App 里是桌面侧栏的底）。
- `raft-logo-yellow.svg`：暗底用（官网页脚配色）。黄色 `#FFD440` 外轮廓，内部是墨黑。
- `raft-mark.svg` / `raft-mark-yellow.svg`：只有符号的版本，同样两种配色，用于引导页、登录、加载屏、App 图标草图和小尺寸位置。工作界面的外框里放的是你的工作区（手机首页的胶囊、桌面 Rail 顶上的方块），不放 mark。

都是双色 SVG，不能靠 CSS `color` 改色；需要换配色时换文件。CSS 里的 `.rf-logo` 和 `.rf-mark` 会随 `data-theme` 自动选用正确的版本。mark 放在黄底上时直接裸放，不加底块。
