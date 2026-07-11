# Slock Tasks source reference

This directory is reference-only evidence for the Tasks UI migration. Runtime
code must not import from it.

## Provenance

- Repository: `/Users/cuvii/Development/zolplay/slock`
- Branch at capture: `staging` (equal to `origin/staging`)
- Commit: `3283de5f5b2926142f89b3db548e262a6a2a1b11`
- Commit date: `2026-07-10`
- Commit subject: `Repair RW mute allowed activity planner shape (#4468)`

The mounted implementations at this commit are:

- Channel Tasks tab: `packages/web/src/components/message/ChatPanel.tsx` renders
  `<TasksPanel channelId={channel.id} />`.
- Server Tasks page: `packages/web/src/components/layout/MainLayout.tsx` renders
  `<TasksPanel />`.

## Preserved files

The following files are byte-identical copies of their source files at the
provenance commit:

| Snapshot | Source path | Why it is evidence |
| --- | --- | --- |
| `TasksPanel.tsx` | `packages/web/src/components/task/TasksPanel.tsx` | Mounted Board/List structure, toolbar, filters, loading/empty states, collapse behavior, DnD, and Create Task entry point. |
| `TaskCard.tsx` | `packages/web/src/components/task/TaskCard.tsx` | Mounted card DOM, metadata, Legacy label, hover/active treatment, and editable status trigger. |
| `CreateTaskDialog.tsx` | `packages/web/src/components/task/CreateTaskDialog.tsx` | Mounted single/batch creation form, validation, submitting state, and button layout. |
| `taskStatusUi.ts` | `packages/web/src/components/task/taskStatusUi.ts` | Five status labels, source colors, icons, and status-option behavior. |
| `InlineBadgeEditor.tsx` | `packages/web/src/components/InlineBadgeEditor.tsx` | TaskCard status trigger and portaled option-list DOM, placement, selected check, disabled, and busy-adjacent styling. |
| `Modal.tsx` | `packages/web/src/components/Modal.tsx` | Create dialog portal, backdrop, Escape handling, and initial focus behavior. |
| `Banner.tsx` | `packages/web/src/components/ui/Banner.tsx` | Create dialog validation banner DOM and warning treatment. |
| `EmptyState.tsx` | `packages/web/src/components/ui/EmptyState.tsx` | Panel empty and filtered-empty structure. |
| `Skeleton.tsx` | `packages/web/src/components/ui/Skeleton.tsx` | Panel loading-row structure and animation classes. |
| `AvatarSlot.tsx` | `packages/web/src/components/ui/AvatarSlot.tsx` | Creator/Assignee option avatar sizing and identity-specific DOM. |
| `SelectionPopover.tsx` | `packages/web/src/components/ui/SelectionPopover.tsx` | Channel/Creator/Assignee search, selection rows, clear action, disabled rows, and no-results state. |

`sourceStyles.css` preserves verbatim, bounded excerpts from
`packages/web/src/index.css`: lines 1-70 for source palette/font/shadow tokens
and lines 288-377 for `btn-brutal`, `btn-brutal-sm`, `card-brutal`, and
`input-brutal`. The separator comments are snapshot documentation; the CSS
inside each source range is unchanged.

The TS/TSX snapshots intentionally retain their original imports and product
dependencies. They are not made compilable in this repository because doing so
would turn reference evidence into a second implementation.

## Source contracts to preserve

- The panel root is a flex column. The toolbar is a wrapping row above an
  `overflow-auto` content region.
- Board view renders five fixed-width `320px` droppable columns in this order:
  Todo, In Progress, In Review, Done, Closed. The board itself is `min-w-max`
  with a `16px` column gap.
- Done and Closed start collapsed. Every status can be expanded/collapsed in
  Board and List views.
- A droppable column changes from a translucent, low-contrast border to black
  border + Soft Signal wash + hard small shadow. An empty active target changes
  its copy from `No … tasks.` to `Drop to set …`.
- Board cards use dnd-kit pointer/touch sensors. Resting cards have a 2px black
  border and 2px hard shadow; hover lifts 1px and increases the hard shadow;
  active presses right/down and reduces the hard shadow.
- Cards expose channel name when used server-wide, task number, optional
  `LEGACY`, a three-line title, optional two-line description, and an editable
  status control only when source permissions allow it.
- Status editing is a portaled fixed-position option list. It supports click
  outside close, viewport clamping, selected checkmarks, and a busy treatment
  that blocks pointer input and lowers opacity.
- Toolbar state includes inactive/active filter triggers, selected counts,
  searchable option lists, no-results, clear-per-filter, Clear All, and a
  channel-only New Task action. Board/List is a segmented control aligned to
  the trailing edge.
- Panel-level content covers five-row loading skeletons, unfiltered empty,
  filtered empty, Board, and List. Source does not render a fetch-error state.
- Create Task covers one or many title rows, add/remove row, missing-title
  validation, submit-in-progress, request failure, cancel/close, and Escape.

## Deliberate exclusions

- `packages/web/src/components/task/TaskBoard.tsx` and `TaskItem.tsx` are not
  mounted by the current Tasks tab/page and are not a Current baseline.
- `StatusBadge.tsx` and `TaskFilterSegmentedControl.tsx` are not direct DOM or
  behavior dependencies of the mounted `TasksPanel` / `TaskCard` path.
- Store, router, permissions, realtime, and task workflow modules remain visible
  through the original imports but are not copied. They are product behavior,
  not component-library implementation.
- No Elegant style is included or inferred. This snapshot exists solely to
  preserve Source/Brutal fidelity.
