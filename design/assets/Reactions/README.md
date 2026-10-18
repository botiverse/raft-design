# Reactions

Raft 的 7 个快捷回应：thumbs_up 👍、heart ❤️、party_popper 🎉、eyes 👀、fire 🔥、joy 😂、check_mark ✅。来自产品自己画的那一套（raft-source 的 `packages/web/assets/reactions`），题材、顺序和造型照旧，按这套系统改了三处：

- 颜色都取自色板：大拇指的袖口是青（产品是浅钢蓝），对勾是绿 `lime`（产品是鼠尾草绿），彩带加了粉和青；黄、橙、红、紫和产品一样。
- 高光是白色方像素（产品是奶油色的弧形高光）：所有的点都是像素。
- 24 网格、2px 墨线；暗色模式由 CSS 在外面加一圈 `sticker-edge` 模切边，和贴纸、像素头像一样。

在页面里用 `<span class="rf-emoji rf-emoji--thumbs_up" aria-hidden="true"></span>`（图已经内嵌在 `components/bundle.css` 里），外面的按钮写 `aria-label`。回应里 16px，菜单的快捷回应 22px，单独放 18px。这 7 个以外的回应用系统 emoji，不另画。
