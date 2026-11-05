---
title: 不用全大写，分组标题和对话框标题也不用
summary: 分组标题、对话框标题和徽标用句首大写（sentence case），不用产品代码里的全大写。
sourceHash: cc443fff
---

# 0002. 不用全大写，分组标题和对话框标题也不用

部分被取代：可点击的文字后来从 Title Case 改为 sentence case（[决策 0044](./0044-sentence-case-for-labels.md)）。本记录的其余部分，也就是不用全大写，仍然有效。

## 背景 {#context}

产品代码把分组标题、对话框标题和徽标设成全大写。全大写抹掉了单词的轮廓，读起来更慢。中文没有大小写，所以在中英混排的文字里，大写的英文会比预想的更扎眼。

## 决定 {#decision}

任何文字都不设成全大写。层次靠字号、字重和颜色来区分。可点击的文字和产品里一样用 Title Case。唯一的全大写文字是引导页上的步骤标签。

## 影响 {#consequences}

这条推翻了产品负责人在代码里记录的一项决定。要改回产品的做法，只改本记录提到的内容。改回产品的做法，就是让分组标题、对话框标题和徽标恢复全大写。

## 被取代 {#superseded-by}

- [0044. 人能点击的一切都用 sentence case](./0044-sentence-case-for-labels.md)，针对可点击的文字。不用全大写的规则仍然有效。

## 相关 {#related}

- [字体排印](../foundations/typography.md#casing)
