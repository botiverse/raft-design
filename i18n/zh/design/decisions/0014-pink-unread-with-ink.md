---
title: 未读一律用粉色加墨色文字
summary: 所有未读计数都是粉色底、墨色文字，消息列的新回复也一样。
sourceHash: 5d418a1b
---

# 0014. 未读一律用粉色加墨色文字

## 背景 {#context}

产品代码里，未读计数是粉色底上的白字（2.4:1），消息列的新回复用青色。产品里的提醒圆点默认是粉色，代码注释写着 "brutal-pink is the canonical unread color"（brutal-pink 是标准的未读颜色）。黄色在产品里也是「忙碌」的在线状态灯，所以黄色的未读圆点和正在工作的 Agent 分不开。

## 决定 {#decision}

未读一律用粉色加墨色文字。任何色块上的文字都用墨色。

## 影响 {#consequences}

一种含义，一种颜色：粉色就是在等你处理的东西。

## 相关 {#related}

- [Badge](../../packages/ui/src/components/badge/badge.md)
- [状态](../foundations/states.md)
