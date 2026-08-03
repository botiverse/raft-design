---
name: layout
description: "Shell and layout: AppShell slots, Panel and the PanelHeaderFrame naming trap, AppRail vs Sidebar vs MobileNav, Resizable, ScrollArea, task surfaces."
---

# Layout and shell

## Contents

- Use the shell, do not rebuild it
- AppShell vs Panel vs Resizable
- AppRail vs Sidebar vs MobileNav
- Panel vs a bordered div
- ScrollArea vs overflow
- Per-component norms

---

## Use the shell, do not rebuild it

The application frame is `AppShellRoot` with named slots. Fill the slots.

```tsx
<AppShellRoot>
  <AppShellRailSlot>…</AppShellRailSlot>
  <AppShellSidebarSlot>…</AppShellSidebarSlot>
  <AppShellMainSlot>…</AppShellMainSlot>
</AppShellRoot>
```

**Incorrect** — reassembling the frame:

```tsx
<div className="flex h-screen">
  <aside className="w-16 border-r">…</aside>
  <aside className="w-64 border-r">…</aside>
  <main className="flex-1 overflow-auto">…</main>
</div>
```

That loses the responsive behavior, the sidebar collapse protocol, and the theme-family treatments. `AppShellSidebarTrigger` is the paired control for collapsing the sidebar — wire it rather than tracking your own boolean and toggling a width class.

---

## AppShell vs Panel vs Resizable

Three different jobs, often confused.

|                  | For                                                          |
| ---------------- | ------------------------------------------------------------ |
| `AppShellRoot`   | the outermost frame of the application — rail, sidebar, main |
| `Panel`          | one bounded region with a header, body, and footer           |
| `ResizableGroup` | regions whose split the **user** can drag                    |

`Resizable` is only for user-adjustable splits. If the widths are fixed by design, use the shell slots or plain layout — do not wrap everything in a resizable group "just in case".

```tsx
<ResizableGroup direction="horizontal">
  <ResizablePanel>…</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>…</ResizablePanel>
</ResizableGroup>
```

Every adjacent pair of `ResizablePanel`s needs a `ResizableHandle` between them. A group without handles is a layout, not a resizable.

---

## AppRail vs Sidebar vs MobileNav

|             | For                                           |
| ----------- | --------------------------------------------- |
| `AppRail`   | the narrow icon rail — top-level destinations |
| `Sidebar`   | the wide list — channels, DMs, sections       |
| `MobileNav` | bottom navigation on small screens            |

`AppRail` composes `AppRailRoot`, `AppRailHeader`, `AppRailNav`, `AppRailFooter`, and items built from `AppRailItem` + `AppRailItemIcon` + `AppRailItemLabel`. Unread and attention signals have dedicated parts — `AppRailItemBadge`, `AppRailItemIndicator`, `AppRailItemAttention`, `AppRailItemAttentionMask`. Do not position a dot yourself.

`MobileNav` is `MobileNavRoot` + `MobileNavItem` + `MobileNavLabel`. It replaces the rail on small screens; it is not a second navigation to keep in sync by hand.

---

## Panel vs a bordered div

`Panel` is the standard bounded region.

```tsx
<Panel>
  <PanelHeaderFrame>…</PanelHeaderFrame>
  <PanelBody>…</PanelBody>
  <PanelFooter>…</PanelFooter>
</Panel>
```

**Naming trap:** `Panel`'s own header is `PanelHeaderFrame`. A component named `PanelHeader` also exists, but it is the shared _conversation-style_ header chrome (`PanelHeader` / `PanelHeading` / `PanelTitle` / `PanelStatus` / `PanelMeta` / `PanelActions` / `PanelSectionHeader`) used by panel-shaped product surfaces like `ConversationPanel`. Both type-check inside a `Panel`, so picking the wrong one fails silently. For a plain bounded region use `PanelHeaderFrame`; reach for the `PanelHeader` chrome set when the surface has an identity row (icon, title, status, actions).

When the body scrolls, use `PanelScrollViewport` + `PanelScrollContent` instead of putting `overflow-auto` on `PanelBody` — the scroll parts keep the header and footer pinned correctly. `PanelSection` divides the body into sections.

Reach for `Panel` before writing `rounded-lg border border-line bg-layer-panel`.

---

## ScrollArea vs overflow

- Page-level scrolling → let the browser do it.
- A bounded region inside the layout → `ScrollArea`.

`ScrollArea` gives consistent scrollbar treatment across the theme families and platforms. Native `overflow-auto` inside a panel will look different on every OS.

Do not nest scroll regions. If two things scroll inside each other, the layout is usually wrong.

---

## Per-component norms

**`Tabs`** — see [forms.md](./forms.md) for `Tabs` vs `SegmentedControl`. Variants are `default` and `underline`. Use `TabsIndicator` and `TabsBackground` for the moving marker.

**`Separator`** — for dividing content within a region. Structural borders between shell regions come from the shell components themselves; do not add separators between slots.

**Task surfaces** — `TasksPanelRoot` is the outer surface (`TasksPanelToolbar`, `TasksPanelViewport`, `TasksPanelEmpty`). Inside it, choose:

| Component       | For                        |
| --------------- | -------------------------- |
| `TaskBoardRoot` | kanban columns             |
| `TaskListRoot`  | grouped list sections      |
| `TaskCard`      | one task in either surface |

`TaskBoardColumn` and `TaskSection` mirror each other — both have `Heading`, `Count`, `Badge`, `Trigger`, `Chevron`, `Panel`, `Items`, `Empty`. The board additionally distinguishes empty states by drop eligibility: `TaskBoardColumnEmptyIdle`, `TaskBoardColumnEmptyAllowed`, `TaskBoardColumnEmptyBlocked`.

Drag and drop is `TaskDndProvider` + `TaskDraggable` + `TaskDropZone` + `TaskDropPlaceholder` + `TaskDragOverlay`. Do not wire `@dnd-kit` directly.

`TaskCardLegacy` and `LegacyTaskPanel` exist for old callsites — never use them in new code.
