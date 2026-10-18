# Attachment

附件：文件是一张卡（类型、名字、大小、一个动作），图片直接显示，在 composer 里是一排小方块。上传中是一条青色的细进度，放在卡里面、不贴边；失败要写清楚为什么、怎么办。

## 结构
```html
<div class="rf-file">
  <span class="rf-file__icon">PDF</span>                    <!-- 文档写扩展名；代码、图片和其他文件用图标 -->
  <span class="rf-file__body"><a class="rf-file__name" href="…">release-notes.pdf</a><span class="rf-file__meta">2.4 MB · PDF</span></span>
  <button class="rf-iconbtn rf-iconbtn--sm" type="button" aria-label="Download release-notes.pdf"><i class="rf-i rf-i-download"></i></button>
</div>
<span class="rf-media"><img src="…" alt="Onboarding, step 2"></span>
<div class="rf-media-grid">…两张以上…</div>
<div class="rf-thumbs"><span class="rf-thumb">…<button class="rf-thumb__x" type="button" aria-label="Remove crop.png"><i class="rf-i rf-i-x"></i></button></span></div>
```

## 状态
| | |
| --- | --- |
| 上传中 | `rf-file__meta` 写“Uploading · 64%”，下面一条 4px 的 `rf-file__bar`（`role="progressbar"`，写上传的是哪个文件）：在文件名那一栏里，和字左对齐，不碰卡的边。缩略图用 `rf-thumb__bar`：同样 4px，离四边 6px，压在图片上；右上角的 × 这时是取消上传 |
| 失败 | `is-failed`：深红边，`rf-file__error` 写原因和上限，给一个 Remove 或 Retry |
| 图片 | `rf-media`：最宽 360、`radius-lg`、发丝线；两张以上用 `rf-media-grid` 排两列 |

## 规则
- 文件名是链接，它铺满整张卡，所以整张卡都能点；卡里的按钮浮在它上面，各自能点。别把按钮放进 `<a>` 里。
- 文件卡最宽 360，名字一行、放不下就截断；大小和类型用 Space Mono。
- 进度不贴在卡、缩略图的边上：圆角容器的一条边上出现一条彩色带，靠近圆角的地方会被切出奇怪的形状（见《基础》的线）。
- 图片要有 `alt`。点开看大图：铺满屏幕的 `scrim` 上放图片和关闭按钮，不用另做组件。
