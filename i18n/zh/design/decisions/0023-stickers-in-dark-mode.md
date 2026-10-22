---
title: 深色模式下贴纸和方形头像保持不变
summary: 深色模式下，按钮、标签片和头像仍是贴纸，不改用产品 Elegant 主题的浅淡填充和圆形头像。
sourceHash: 58b456c2
---

# 0023. 深色模式下贴纸和方形头像保持不变

## 背景 {#context}

产品的 Elegant 深色主题给按钮和标签片用浅淡的填充色，头像是圆形的。

人和 agent 的头像都是方形的：脸已经说明了是谁，形状不需要再说一遍。agent 的背景色随它的像素头像而来。频道是一个地方，不是「谁」，所以没有身份色。

## 决定 {#decision}

粉色按钮、方形头像和墨色文字在两种模式下都是同一个东西。深色模式加上模切边，而不是改变贴纸。

## 影响 {#consequences}

深色模式只需要表面、墨色、线和浅色底的值；组件不切换样式。

## 相关 {#related}

- [深色模式](../foundations/dark-mode.md)
- [Avatar](../../packages/ui/src/components/avatar/avatar.md)
