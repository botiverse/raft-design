---
title: 原则
summary: 每个 Raft 界面都遵守的七条规则，每条都附上理由，让你能把它用到文档没写到的情况上。
sourceHash: 3e1d7caa
---

# 原则

七条规则适用于每个 Raft 产品的每个界面。每条都短到可以在评审时逐条核对，每条也都附有理由，因为没有理由的规则，第一次碰到不方便时就会被打破。文档里哪里都没写到的情况，由这些理由来决定。这套外观从哪里来，见[为什么 Raft 长这样](./why-raft-looks-this-way.md)；在新工作中怎么用这些规则，见[设计一个新功能](./designing-a-new-feature.md)。

编号固定不变：其他页面按编号引用原则。

## 1. 黄色只用在外框上 {#1-yellow-goes-on-the-frame-only}

外框（桌面端的导航条、网页的顶栏、手机一级页面的顶栏）是黄色的。人们阅读的内容都放在纸面上。深色模式下，外框是中性的深色。

**为什么。** 外框出现在每个界面上，但没有人读它，所以把颜色放在这里，几乎不占用注意力就能承载品牌。内容要连续读上几个小时；文字背后的饱和黄色会让眼睛疲劳，也让黄色再没有余地表达别的意思。让黄色离开内容，黄色才能表示「你」（原则 4）：只有周围的页面不是黄色，选中的那一行才显得出来。深色模式下外框变成中性色，因为深色模式本来就是为了降低亮度，而黄色外框会是屏幕上最亮的东西（[0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)）。网页顶栏属于外框而不是内容，所以它和导航条一样是黄色（[页面结构](../patterns/page-structure.md#the-web-top-bar)）。

要把这条用到新东西上，就问：人们是在读它，还是它在把界面框起来？出现在每个界面上、不装内容的外层界面是外框；人们阅读的面板、页面或卡片是纸面。

应用于：[颜色](../foundations/color.md#principles)、[页面结构](../patterns/page-structure.md#layers-from-the-outside-in)、[品牌](../foundations/brand.md#how-much-brand)、[深色模式](../foundations/dark-mode.md#what-changes)。

## 2. 三种线，三种含义 {#2-three-lines-three-meanings}

细线在内容内部，接缝线在区域之间，墨色描边标出控件。两个区域之间只有一条线。

**为什么。** 线会被读成结构，所以每种线只回答一个问题：细线说「这些东西是一组」，接缝线说「一个区域在这里结束」，墨色描边说「这里可以点或输入」。卡片如果有墨色描边，看起来就像能点；区域之间如果用粗黑线分隔，整个界面就像一摞盒子（[0009](../decisions/0009-seams-and-no-control-shadows.md)）。接缝线用 45% 的墨色，因为在试过的数值里，这是在白底上达到 3:1 的最浅值，在黄色外框上看起来是深金色；到 50% 就开始像控件的描边了。两条 1px 的线并排会被看成一条 2px 的线，所以两个区域之间的那条线只归其中一个区域所有。

用这条规则时，先说出边界是什么，再画线。如果它不在内容内部、不在区域之间、也不围着控件，就不需要线；改用填充色或间距。

应用于：[颜色](../foundations/color.md#lines)、[形状](../foundations/shape.md#stroke-widths)、[页面结构](../patterns/page-structure.md#one-line-between-two-regions)。

## 3. 一块颜色就是一张贴纸 {#3-a-block-of-color-is-a-sticker}

每一块品牌色都有 1.5px 的墨色边和墨色文字，深色模式下也不反转。柔和的浅色底是高亮，没有边。控件没有阴影。

**为什么。** 贴纸的颜色和纸面之间只有 1.4:1 到 2.8:1 的对比度，没有边，一块颜色就立不住形状。贴纸上的墨色文字至少达到 6.8:1，而粉色上的白字只有 2.4:1（[0014](../decisions/0014-pink-unread-with-ink.md)）。贴纸在两种模式下保持一样，所以粉色按钮或头像在哪里都是同一个东西；深色模式加的是一圈模切边，而不是改变贴纸本身，组件也从不切换样式（[0023](../decisions/0023-stickers-in-dark-mode.md)）。柔和的浅色底用于相反的情况：一个界面可能有十几个状态标签，用浅色底加一个饱和色像素，界面就能保持安静（[颜色](../foundations/color.md#soft-tints)）。控件没有阴影，因为「点这里」已经由墨色描边、粉色和「每个界面一个」的规则说过了；阴影是第四个信号，在深色模式下看不见，而且按下时控件一移动，旁边的东西也会跟着晃（[0009](../decisions/0009-seams-and-no-control-shadows.md)）。

用这条规则时，先判断这块颜色是一个东西（贴纸：有边、墨色文字、两种模式下一样），还是一个东西背后的高亮（柔和浅色底：没有边）。只有浮在页面上方的东西才投下阴影，而且都投同一种柔和的阴影。

应用于：[颜色](../foundations/color.md#stickers)、[深色模式](../foundations/dark-mode.md#the-die-cut-edge)、[层级](../foundations/elevation.md#principles)。

## 4. 黄色是你，粉色是待办，提示是中性色 {#4-yellow-is-you-pink-is-to-do-notices-are-neutral}

黄色表示你在哪里、你选中了什么、什么在叫你、你搜索了什么。粉色每个界面最多用于一个主按钮，以及等着你处理的东西。内容中被单独标出的那一项是青色。轻提示（Toast）和工具提示（Tooltip）是中性的深色。

**为什么。** 每种颜色只有一个含义时，屏幕上的颜色总是在告诉人一件事，而且学一次就能用于所有产品。这些含义经过挑选，彼此从不冲突：

- 「选中」有三种含义，所以有三种样子：在导航里所处的位置是黄色，内容中被单独标出的那一项是青色，选定的值是墨色。如果三者都是黄色，打开一个列表就会满屏黄色（[0011](../decisions/0011-yellow-navigation-selection.md)、[RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md#states)）。
- 粉色标出唯一的主操作，所以第二个粉色按钮不是多了一个主操作，而是让主操作消失了。未读是粉色而不是黄色，因为黄色也是正在工作的 agent 的忙碌灯（[0014](../decisions/0014-pink-unread-with-ink.md)）。
- 提示是附带的信息。黄色的轻提示会和选中状态抢注意力，所以轻提示和工具提示是中性色，也没有任何按钮是黄色（[颜色](../foundations/color.md#principles)）。
- 含义优先于位置：深色模式下外框是中性色，但导航条上选中的那一项仍然是黄色贴纸，因为「你在这里」不属于外框（[0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)）。

用这条规则时，说出颜色的新用法属于哪种含义：你、待办、这一项、打断、不可撤销，或者是身份、状态。如果哪种都不是，就去掉颜色。

应用于：[颜色](../foundations/color.md#meanings-of-color)、[状态](../foundations/states.md#usage)、[Button](../../packages/ui/src/components/button/button.md)。

## 5. 状态色的含义固定 {#5-status-colors-have-fixed-meanings}

五种任务状态和五种在线状态灯，每种一个颜色，都不闪烁。出问题用橙色；红色只用于无法撤销的后果。

**为什么。** 状态是一眼扫过去读的，跨越许多行、许多界面和许多产品，所以它们的颜色在哪里都要表示同一件事，而且长期不变；`presence-busy` 甚至有自己单独的值，这样品牌色变了，忙碌的样子也不会变。红色留给无法撤销的事，这样它在删除按钮上仍然能让人停下来；如果每个错误都是红色，唯一不可撤销的操作就和其他东西没有区别了，所以可恢复的问题、警告，以及停止或重置类的操作都用橙色。状态从不自己动：循环动画会让页面按屏幕刷新率渲染（144fps、80% GPU，停下后是 2fps、3%），十几个闪动的头像也会妨碍阅读（[0006](../decisions/0006-working-agents-in-place.md)）。正在工作的 agent 是一盏静止的黄灯，加一句说明它在做什么的话。

用这条规则时，先把新状态对应到已有的状态，再考虑新造颜色。会循环或闪烁的状态要换一种方式表现：用文字，或者只发生一次的变化。

应用于：[颜色](../foundations/color.md#statuses)、[动效](../foundations/motion.md#principles)、[Agent](../people-and-agents/working-agents.md#where-working-shows)。

## 6. 方形就是 Raft {#6-square-is-raft}

每个身份都是一张方形贴纸，每个圆点都是一个方形像素。只有开关和单选按钮是圆的，它们遵循平台惯例。

**为什么。** 方形像素是品牌自己的形状，从官网的像素网格到 agent 的 8×8 面孔都是它，也是颜色调低之后还能认出 Raft 界面的原因。人和 agent 都用方形头像：面孔已经说明了是谁，形状不需要再说一遍（[0023](../decisions/0023-stickers-in-dark-mode.md)）。圆点和加载指示器（spinner）是方形，也是这个原因（[形状](../foundations/shape.md#principles)）。像素是硬的，容器是软的：卡片、菜单和对话框有圆角，因为它们装着内容，而不是代表某个东西。开关和单选按钮是例外，因为人们靠圆形认出它们；方形的开关不会被当成开关（[Switch](../../packages/ui/src/components/switch/switch.md#rules)）。

用这条规则时，问新元素是代表某个人或某个东西（方形，属于像素家族），还是装着内容（柔和的容器圆角），还是人们只靠圆形认得的控件（圆形，只有这两种）。

应用于：[形状](../foundations/shape.md#radii)、[Avatar](../../packages/ui/src/components/avatar/avatar.md)、[Spinner](../../packages/ui/src/components/spinner/spinner.md)。

## 7. 不用全大写 {#7-no-all-caps}

可点击的文字用 Title Case，其他一律用 sentence case，层次靠字号、字重和颜色区分。Space Grotesk 是人说的话；Space Mono 是机器写的东西。

**为什么。** 全大写抹掉了单词的轮廓，读起来更慢；中文没有大小写，所以在中英混排的文字里，大写的英文会比预想的更扎眼（[0002](../decisions/0002-no-all-caps.md)）。Title Case 留给人们能点击的东西，这样大小写本身就告诉人哪些是控件。两种字体区分两种声音：消息、标签和标题用 Space Grotesk；ID、时间、计数、运行时长、事件行和代码用 Space Mono。在一个 agent 和人写得一样多的服务器里，读者一眼就能分清哪些是人说的、哪些是机器产出的，即使在同一句话里（"Bugen claimed #25"）。

用这条规则时，机器产出的内容一律用 Space Mono，可点击的用 Title Case，其他用 sentence case；让标题突出靠字号或字重，绝不靠大写。

应用于：[字体排印](../foundations/typography.md#casing)、[写作](../content/writing.md#casing)。

## 原则相互拉扯时 {#when-principles-pull-apart}

这些原则很少冲突；看起来冲突时，系统总是用同样的方式解决：

- **含义优先于位置。** 表示「你在这里」的黄色贴纸，在中性深色的外框上仍然是黄色（[0012](../decisions/0012-yellow-rail-selection-in-dark-mode.md)）。
- **易读优先于精确的品牌色值。** 粉色比产品最初的粉色更浅，让上面的墨色文字达到和其他贴纸一样的对比度（[0001](../decisions/0001-softer-pink.md)）；三级文字和错误文字会一直调整，直到在每种表面上都达到 4.5:1（[颜色](../foundations/color.md#contrast)）。
- **少优先于多。** 界面让眼睛疲劳时，先去掉颜色，再去掉线，再去掉动效。

## 相关 {#related}

- [为什么 Raft 长这样](./why-raft-looks-this-way.md)：这些规则所来自的气质。
- [设计一个新功能](./designing-a-new-feature.md)：基于这些规则的问题和检查清单。
- [决策记录](../decisions/)：重大的选择，以及与之权衡过的其他方案。
