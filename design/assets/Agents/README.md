# Agents

产品自己的 agent 像素形象：raft-source 的 `packages/web/assets/avatars/pixelAvatars.json`（网页端的 `PixelAvatar` 组件读的就是这张表），逐格转成 SVG，透明底。产品里每个形象自带一个底色，这里由 CSS 按 token 画出来：`rf-sprite-<name>` 同时给出像素画（`--sprite`）和底色（`--sprite-bg`），所以底色跟着色板走，暗色模式下和别的贴纸一样加模切边。用在 agent 头像（`rf-avatar--agent rf-sprite-<name>`）和引导页、agent 主页的大贴纸上。

| 文件 | 形象 | 画里用到的颜色 | 底色 |
| --- | --- | --- | --- |
| `robot.svg` | 机器人（产品的默认形象） | 墨、白、cyan | `cyan` |
| `cat.svg` | 猫 | 墨、yellow | `yellow` |
| `ghost.svg` | 幽灵 | 墨、白 | `lavender` |
| `skull.svg` | 骷髅 | 墨、白 | `orange` |
| `alien.svg` | 外星人 | 墨、鼠尾草绿 | `lime` |
| `heart.svg` | 心 | 墨、red | `pink` |
| `star.svg` | 星星 | 墨、yellow | `yellow` |
| `flame.svg` | 火焰 | 墨、orange、yellow、red | `orange` |
| `diamond.svg` | 宝石 | 墨、白、cyan | `cyan` |
| `mushroom.svg` | 蘑菇 | 墨、白、red | `pink` |
| `eye.svg` | 眼睛 | 墨、白 | `lavender` |
| `crown.svg` | 皇冠 | 墨、yellow | `yellow` |
| `cloud.svg` | 云 | 墨、白 | `cyan` |
| `sun.svg` | 太阳 | 墨、yellow | `red` |
| `bell.svg` | 铃铛 | 墨、yellow | 石板灰 `#576574` |
| `tree.svg` | 树 | 墨、orange、鼠尾草绿 | `lime` |

- 顺序就是产品形象选择器里的顺序。产品另有两个保留形象 `finch`、`mug`，不进随机也不进选择器，底色是一次性的色值，这里没有收。
- 画里的颜色是产品原值：墨 `#141111`、白 `#FFFFFF`，其余和同名 token 一致。鼠尾草绿 `#9DCAAA` 和石板灰 `#576574` 只在形象里出现，不进色板。多色 SVG 不继承 `currentColor`。
- cat、star、crown 画里的黄和底色一样，robot、diamond 画里的青和底色一样：产品原图就是这样，那几格和底连成一片，读起来是镂空。
- 渲染时要保持像素整齐：像素区边长取 8 的倍数（16 / 24 / 32 / 48 / 96），并加 `image-rendering: pixelated`。
- 底色是形象的一部分：换形象就换底色，不单独给 agent 指定颜色。
- 新 agent 按产品的规则拿形象：默认是 `robot`，也可以从这 16 个里随机或手选（产品还会用种子随机生成 identicon，那是代码生成的，不在这张表里）。要加新形象，加在产品的形象表里，同样是 8×8、墨色描边，这里跟着同步。
