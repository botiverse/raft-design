---
name: raft-ui-guide
description: "Build with rUI: native CSS foundations for plain HTML and React components using Base UI and Tailwind CSS v4. Use for design tokens, styling, component selection, composition, and API lookup."
---

# raft-ui

The package is `raft-ui`. Plain HTML can use `foundation.css` directly; the component guidance below applies to React. The React components are built on **Base UI** (`@base-ui/react`), **Tailwind CSS v4**, and **tailwind-variants**. Chat/workspace product domain: rails, sidebars, conversation panels, composers, task boards, activity inboxes, and search.

The rule files are also published at https://rui.botiverse.build/guides/overview. Do not register or install skills in a consumer project unless requested.

## Working sequence

1. Read only the rule files the current surface needs (table below); do not load every rule file by default.
2. Verify unrecognized props, parts, variants, and tokens with [rules/lookup.md](./rules/lookup.md).
3. Implement the smallest composition that preserves native semantics and uses raft-ui where its behavior or visual contract is needed.
4. Apply the review checklist after implementation, not as a reason to add wrappers before they are needed.

When this skill is loaded through TanStack Intent, run `intent load raft-ui#raft-ui-guide --path` before opening a linked rule file, then resolve the link relative to the returned `SKILL.md` directory.

## Override your priors first

raft-ui is not shadcn/ui, not Radix, not MUI. These defaults are wrong here:

| Your instinct                                                    | Reality in raft-ui                                                                                                                                                         |
| ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Button variant="destructive">`                                 | `variant="danger"`. Full set: `primary` `default` `information` `muted` `accent` `warning` `success` `outline` `ghost` `link` `danger` `danger-secondary` `danger-outline` |
| `<Button size="icon">`                                           | `size="icon-md\|icon-lg"`; `icon-xs` and `icon-sm` render as `icon-md`. Text sizes are `md` `lg` `xl` `inline`; `xs` and `sm` render as `md`                               |
| `className="text-gray-500 bg-slate-50"`                          | Tailwind's default palette is banned. Use oklch semantic tokens: `text-foreground-muted`, `bg-fill-muted`                                                                  |
| Flat props: `<Dialog title="x" description="y">`                 | Compound parts: `<Dialog><DialogContent><DialogHeader><DialogTitle>…` — `DialogContent` portals itself                                                                     |
| Radix API (`asChild`)                                            | Base UI API. Use the `render` prop, not `asChild`                                                                                                                          |
| Add a `kind`/`state`/`emphasis` prop for a structural difference | Use the dedicated part or component instead                                                                                                                                |
| `<Button loading>` doesn't exist, roll a spinner                 | `loading` and `loadingLabel` are real props on `Button`                                                                                                                    |

**Never guess a prop or variant name.** The tables below are orientation, not an API reference — see [rules/lookup.md](./rules/lookup.md).

## Principles

- Composition over configuration. Visible structure lives in `children` and named parts, never in a prop that switches layouts.
- Prefer semantic tokens over raw color. Use inline `oklch()` only for a one-off precision value, then tokenize repeated values.
- Base UI owns headless behavior (open state, focus, keyboard, collections). Product state (upload lifecycle, permissions, workflow) belongs in your app, not in a component prop.
- Raft is the only visual language, in light and dark modes; `ThemeProvider` switches the mode globally. Components adapt themselves.
- Yellow and pink split roles: `primary` (Source Yellow) is for hints and interactive expression (indicators, the active tab); `accent` is for core actions (a dialog's confirm, the composer's send). Never use yellow as decoration or background wash — see [rules/styling.md](./rules/styling.md). Focus rings are ink, not yellow: a 2px paper gap and a 2px ink ring (`shadow-raft-focus`).

## Common mistakes

| Mistake                                            | Fix                                                                                                         |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `asChild` on a trigger or close part               | Base UI: `render={<Button … />}`                                                                            |
| Actions menu built out of `Select`                 | `DropdownMenu` — see [rules/forms.md](./rules/forms.md)                                                     |
| Persistent condition announced with `toast.info()` | `Banner` — toasts expire, conditions don't                                                                  |
| Buttons or links inside a `Tooltip`                | `Popover` — tooltip content is unreachable                                                                  |
| Destructive confirm as a styled `Dialog`           | `AlertDialog` with `AlertDialogAction` / `AlertDialogCancel`                                                |
| Validation copy disconnected from its control      | `Field` + `FieldError`                                                                                      |
| `PanelHeader` where you meant the bare frame       | `PanelHeaderRoot` — `PanelHeader` is the composed identity chrome, see [rules/layout.md](./rules/layout.md) |
| Re-created raft-ui divider, badge, or type styling | `Separator`, `Badge`, or `Text`; keep native semantics when intentional                                     |

## Which control? Which feedback channel?

```
Choosing an option control:
Is it an action, not a value? ──────────── DropdownMenu / ContextMenu
└─ No: on/off?
   ├─ Applies immediately ──────────────── Switch
   ├─ Submitted with a form ────────────── Checkbox
   └─ No: one of several?
      ├─ 2–5, form answer ──────────────── RadioGroup
      ├─ 2–5, switches a view in place ─── SegmentedControl
      ├─ Swaps visible content panels ──── Tabs
      ├─ One of many ──────────────────── Select
      └─ Searchable or multi-select ────── Combobox (chips for multi)

Delivering a message:
Caused by the user's last action, safe to miss? ── toast.info() / toast.success() / toast.warning() / toast.error()
Condition that is still true? ──────────────────── Banner
Happened elsewhere, must persist until read? ───── NotificationCenter
Loading? ── known layout → Skeleton · unknown duration → Spinner · known % → Progress
```

Intent names are **not** consistent across components — negative is `danger` on `Button`/`Badge`/`Status`/`Progress`, `destructive` on `Banner`, and `error` on toast objects and `NotificationCenterItemIcon`. Never carry a variant value from one component to another.

## Quick component map

| Need                                             | Use                                                                        |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| Callout / inline status message                  | `Banner`                                                                   |
| Transient notification                           | `toast.info()` etc. + `ToastProvider`                                      |
| Confirm a destructive action                     | `AlertDialog`                                                              |
| Generic modal                                    | `Dialog`                                                                   |
| Edge-anchored panel                              | `Drawer`                                                                   |
| Rich hover preview                               | `PreviewCard`                                                              |
| Plain hover hint                                 | `Tooltip`                                                                  |
| Right-click menu                                 | `ContextMenu`                                                              |
| Button-triggered menu                            | `DropdownMenu`                                                             |
| Workspace search and grouped results             | `SearchShellRoot` + the applicable `Search*Result` parts                   |
| Activity or saved-item inbox                     | `ActivityInboxPanel` + `InboxItem`                                         |
| Label, help, or validation around a form control | `Field` + the applicable field parts                                       |
| Design-system divider                            | `Separator`; keep native semantics when styling is intentionally inherited |
| Loading placeholder                              | `Skeleton`                                                                 |
| Inline busy indicator                            | `Spinner`                                                                  |
| Determinate progress                             | `Progress`                                                                 |
| Small count / tag                                | `Badge`                                                                    |
| Presence or state dot                            | `Status`                                                                   |
| Nothing-here state                               | `EmptyState`                                                               |
| Keyboard shortcut                                | `Kbd` / `KbdGroup`                                                         |
| raft-ui typography treatment                     | `Text.Sans` / `Text.Heading` / `Text.Mono`                                 |

## Read these when relevant

| File                                                         | Read it when                                                                 |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| [rules/lookup.md](./rules/lookup.md)                         | You need a prop, variant value, or token — read this before guessing         |
| [rules/composition.md](./rules/composition.md)               | Assembling compound parts, overlay containers, business actions, or wrappers |
| [rules/forms.md](./rules/forms.md)                           | Any input, option picker, or tabs — includes `Select` vs `DropdownMenu`      |
| [rules/overlays.md](./rules/overlays.md)                     | Dialogs, drawers, popovers, menus, tooltips                                  |
| [rules/feedback.md](./rules/feedback.md)                     | Banners, toasts, loading, empty states, badges                               |
| [rules/display.md](./rules/display.md)                       | Typography, code, avatars, files, keyboard hints                             |
| [rules/layout.md](./rules/layout.md)                         | Shell, panels, navigation, resizing, task surfaces                           |
| [rules/conversation.md](./rules/conversation.md)             | Chat, sidebar, activity inbox, workspace search, composer                    |
| [rules/styling.md](./rules/styling.md)                       | Writing any `className`, color, shadow, or `tv()` recipe                     |
| [rules/technical-overview.md](./rules/technical-overview.md) | Technical foundations, package contents, styles, and providers               |

## Review checklist

When reviewing or editing code that uses raft-ui, check:

- [ ] No variant value carried across components — verify against the declarations
- [ ] Controls with raft-ui label, description, or validation treatment use `Field`; simpler native associations remain explicit and accessible
- [ ] No Tailwind default palette (`gray-*`, `slate-*`, …), hex, `rgb()`, or `hsl()` — semantic tokens, raw `oklch()` only for one-offs
- [ ] No `asChild` — element substitution uses `render`
- [ ] Do not recreate a raft-ui component's visual or behavioral contract with ad hoc markup; native semantic elements remain valid when no library contract is needed
- [ ] Every `Avatar` with an `AvatarImage` also has an `AvatarFallback`; every blocking overlay has a `Title`
- [ ] Menu rows are `…Item` parts, not raw `<button>`s — raw buttons drop out of keyboard navigation
- [ ] Product state (upload, permissions, read/unread) lives in the app; the component renders parts, not a `state` prop
- [ ] No shadow written as `shadow-[var(--…)]` — named utility or fully literal

## Stability

`raft-ui` is the stable surface; `raft-ui/wip` is experimental. Import `cn` from `raft-ui/cn`.
