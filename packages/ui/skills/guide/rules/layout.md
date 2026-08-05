---
name: layout
description: "Shell and layout: AppShell slots, Panel and the PanelHeaderRoot vs PanelHeader distinction, AppRail vs Sidebar vs MobileNav, Resizable, ScrollArea, task surfaces."
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

Treat the slots as ownership markers, not required direct children. On desktop, put
`AppShellSidebarSlot` and `AppShellMainSlot` inside adjacent `ResizablePanel`s when the split is
user-adjustable. On mobile, one `AppShellMainSlot` can switch between the sidebar, main content,
and thread from app-owned route state.

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
<ResizableGroup orientation="horizontal">
  <ResizablePanel>…</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel>…</ResizablePanel>
</ResizableGroup>
```

Every adjacent pair of `ResizablePanel`s needs a `ResizableHandle` between them. A group without handles is a layout, not a resizable.

---

## AppRail vs Sidebar vs MobileNav

|                 | For                                           |
| --------------- | --------------------------------------------- |
| `AppRailRoot`   | the narrow icon rail — top-level destinations |
| `SidebarRoot`   | the wide list — channels, DMs, sections       |
| `MobileNavRoot` | bottom navigation on small screens            |

`AppRail` composes `AppRailRoot`, `AppRailHeader`, `AppRailNav`, `AppRailFooter`, and items built from `AppRailItem` + `AppRailItemIcon` + `AppRailItemLabel`. Unread and attention signals have dedicated parts — `AppRailItemBadge`, `AppRailItemIndicator`, `AppRailItemAttention`, `AppRailItemAttentionMask`. Do not position a dot yourself.

`MobileNavRoot` composes `MobileNavItem` + `MobileNavLabel` for small screens. Render its items separately from the rail, but drive selection and navigation from the same app-owned route or view state. Mobile may expose only a subset of destinations; keep shared destinations aligned.

---

## Panel vs a bordered div

`Panel` is the standard bounded region, and it owns the whole header vocabulary.

```tsx
<Panel>
  <PanelHeaderRoot>…</PanelHeaderRoot>
  <PanelBody>…</PanelBody>
  <PanelFooter>…</PanelFooter>
</Panel>
```

**Two headers, pick by need:** `PanelHeaderRoot` is the bare frame — use it when you lay the header out yourself. `PanelHeader` is the composed identity chrome built on top of it, with `PanelHeaderContent` / `PanelHeaderIcon` / `PanelHeading` / `PanelTitle` / `PanelMeta` / `PanelActions` (`PanelAction`, `PanelToggleAction`) — use it when the surface has an identity row, as `ConversationPanel` does. Both type-check inside a `Panel`, so the wrong pick fails silently.

**`PanelStatus` vs `PanelActivity`:** `PanelStatus` is a standalone attribute badge in the header; `PanelActivity` is a live status readout wrapping a `Status`. Do not use one for the other.

When the body scrolls, use `PanelScrollViewport` + `PanelScrollContent` instead of putting `overflow-auto` on `PanelBody` — the scroll parts keep the header and footer pinned correctly. `PanelSection` divides the body into sections; `PanelSectionHeader` labels one.

Reach for `Panel` before writing `rounded-lg border border-line bg-layer-panel`.

Use `ProfilePanel` from `raft-ui` for a profile detail pane built on these parts.

---

## ScrollArea vs overflow

- Page-level scrolling → let the browser do it.
- A component with a specialized viewport → use that viewport: `PanelScrollViewport`,
  `TasksPanelViewport`, `MessageList`, or `SidebarContent`.
- A bounded custom region with no existing scroll owner → compose `ScrollArea`.

Use `ScrollArea` when the region itself owns scrolling and needs the library's scrollbar treatment.
Do not replace a specialized viewport just to get a custom scrollbar; the higher-level component
already owns the layout and overflow contract.

Keep one scroll owner per axis. Do not put `ScrollArea` inside `PanelScrollViewport` or
`TasksPanelViewport`, and do not make task columns or list sections independently scroll.

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

`TasksPanelViewport` is the shared scroll owner for the complete panel. Put `TaskBoardRoot` or
`TaskListRoot` directly under it. A standalone Board or List demo may provide its own `ScrollArea`;
do not carry that wrapper into `TasksPanelViewport`.

`TaskBoardColumn` and `TaskSection` mirror each other — both have `Heading`, `Count`, `Badge`, `Trigger`, `Chevron`, `Panel`, `Items`, `Empty`. The board additionally distinguishes empty states by drop eligibility: `TaskBoardColumnEmptyIdle`, `TaskBoardColumnEmptyAllowed`, `TaskBoardColumnEmptyBlocked`.

Drag and drop is `TaskDndProvider` + `TaskDraggable` + `TaskDropZone` + `TaskDropPlaceholder` + `TaskDragOverlay`. Do not wire `@dnd-kit` directly.

`TaskCardLegacy` and the `LegacyTaskPanel*` family exist for old callsites — never use them in new code.
