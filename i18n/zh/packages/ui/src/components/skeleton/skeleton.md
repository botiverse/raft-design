---
title: Skeleton
summary: 按正在加载的内容的形状画出的灰色占位，用于布局已知的列表、卡片和面板。
sourceHash: 93946183
---

# Skeleton

骨架屏为还在加载的内容占位：头像和图块的位置画方块，文字的位置画横条。当列表、卡片或面板第一次加载、且布局已知时使用。哪种等待用哪种加载指示，见[选择组件](../../../../../design/components/overview.md#waiting)。

```example
skeleton/compositions/preview
```

## 何时使用 {#when-to-use}

| 情况 | 使用 |
| --- | --- |
| 正在加载的内容布局已知 | Skeleton |
| 等待时没有布局可占，或发生在很小的区域 | [Spinner](../spinner/spinner.md) |
| 已知百分比 | [Progress](../progress/progress.md) |
| 加载完了，但什么都没有 | [EmptyState](../empty-state/empty-state.md) |
| 加载失败 | 在相应范围显示错误（[反馈](../../../../../design/patterns/feedback.md#errors-by-scope)） |

## 变体 {#variants}

| 变体 | 用于 |
| --- | --- |
| `variant="line"` | 一行文字 |
| `variant="block"` | 缩略图、卡片或其他块；用 `className` 设定尺寸 |
| `variant="circle"` | 头像或图块。虽然叫 circle，它是方形的，和它代表的头像一样 |

```example
skeleton/compositions/basic
```

## 无障碍 {#accessibility}

- `Skeleton` 是 `aria-hidden`。在内容到达之前，给正在加载的区域加上 `aria-busy="true"`，免得辅助技术把一个空着的区域读成「没有内容」。

## 规则 {#rules}

- 骨架屏的形状和它代表的内容一致：头像和图块是方形，文字是横条。尺寸规则、显示前等待 1 秒的规则以及不要替换占位的规则，见[反馈](../../../../../design/patterns/feedback.md#empty-loading-and-failed)。
- 列表的行用这一行自己的骨架屏，而不是自己拼 `Skeleton`：`InboxItemSkeleton`（[InboxItem](../inbox-item/inbox-item.md#loading)）和 `ListRowSkeleton`（[ListRow](../list-row/list-row.md#loading)）用行的部件搭成，所以保持行的大小，也和行一样是平铺的。
