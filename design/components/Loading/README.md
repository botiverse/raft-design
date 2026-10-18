# Loading

加载：知道布局用骨架，不知道要多久用像素转圈，知道百分比用进度条。它们都是被动的指示，不用粉。

## 什么时候用
| 情况 | 用 |
| --- | --- |
| 列表、卡片、面板第一次加载，布局已知 | `rf-skel` 骨架 |
| 在等，不知道多久，也没有布局可占（按钮里、一小块区域） | `rf-spinner` 像素转圈 |
| 知道进度：上传、用量 | `rf-progress` 进度条 |

## 结构
```html
<span class="rf-progress" role="progressbar" aria-label="Uploading design-crop.png" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100"><span class="rf-progress__bar" style="width:64%"></span></span>
<span class="rf-skel" style="width:46%;height:12px"></span>
<span class="rf-spinner" role="img" aria-label="Loading"><i></i><i></i><i></i><i></i></span>
```

## 规则
- 进度条 8 高：`surface-sunken` 轨道，`cyan` 填充，填充带墨边；快到上限（≥90%）用 `--warn` 橙，做完用 `--done` 绿。旁边写清楚是什么、到了多少（数字用 Space Mono）。算不出百分比就用转圈，不放假的进度。
- 骨架的形状和要来的内容一样：头像是方的，文字是条。
- 转圈是四个方像素依次亮起，配一句在等什么；超过一秒才出现，等完立刻收起。
