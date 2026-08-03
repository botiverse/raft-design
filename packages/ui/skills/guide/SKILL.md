---
name: raft-ui-skill
description: Build UIs with raft-ui, the React component library for Raft (Base UI + Tailwind CSS v4 + tailwind-variants). Use when importing from "raft-ui", picking a component for a scenario, choosing variants, composing compound parts, styling with oklch semantic tokens, or setting up styles.css / fonts.css / ThemeProvider. Keywords: raft-ui, raft ui, RaftUI, Raft design system, brutal theme, elegant theme.
metadata:
  author: raft
---

# raft-ui

React component library for Raft. Built on **Base UI** (`@base-ui/react`), **Tailwind CSS v4**, and **tailwind-variants**. Chat/workspace product domain: rails, sidebars, conversation panels, composers, task boards.

## Override your priors first

raft-ui is not shadcn/ui, not Radix, not MUI. These defaults are wrong here:

| Your instinct                                                    | Reality in raft-ui                                                                                                                                               |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<Button variant="destructive">`                                 | `variant="danger"`. Full set: `primary` `default` `information` `muted` `accent` `warning` `outline` `ghost` `link` `danger` `danger-secondary` `danger-outline` |
| `<Button size="icon">`                                           | `size="icon-xs\|icon-sm\|icon-md\|icon-lg"`. Text sizes are `xs` `sm` `md` `lg`                                                                                  |
| Pass `theme="brutal"` to style a component                       | **`theme` is not a public prop.** It is stripped from every component's props and resolved from `ThemeProvider` via `useThemeFamily()`                           |
| `className="text-gray-500 bg-slate-50"`                          | Tailwind's default palette is banned. Use oklch semantic tokens: `text-foreground-muted`, `bg-layer-muted`                                                       |
| Flat props: `<Dialog title="x" description="y">`                 | Compound parts: `<Dialog><DialogPortal><DialogContent><DialogTitle>…`                                                                                            |
| Radix API (`asChild`, `Portal.Root`)                             | Base UI API. Use the `render` prop, not `asChild`                                                                                                                |
| Add a `kind`/`state`/`emphasis` prop for a structural difference | Use the dedicated part or component instead                                                                                                                      |
| `<Button loading>` doesn't exist, roll a spinner                 | `loading` and `loadingLabel` are real props on `Button`                                                                                                          |

**Never guess a prop or variant name.** This skill carries no signatures on purpose. Look them up in `node_modules/raft-ui/dist/index.d.mts` — see [rules/lookup.md](./rules/lookup.md). Guessed props are the most common failure mode with this library, and they fail silently.

## Principles

- Composition over configuration. Visible structure lives in `children` and named parts, never in a prop that switches layouts.
- Semantic tokens over raw color. Every color is authored in oklch and reached through a token.
- Base UI owns headless behavior (open state, focus, keyboard, collections). Product state (upload lifecycle, permissions, workflow) belongs in your app, not in a component prop.
- Two theme families, `brutal` and `elegant`, are switched globally by `ThemeProvider`. Components adapt themselves.

## Common mistakes

| Mistake                                           | Fix                                                                                                 |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `asChild` on a trigger or close part              | Base UI: `render={<Button … />}`                                                                    |
| Actions menu built out of `Select`                | `DropdownMenu` — see [rules/forms.md](./rules/forms.md)                                             |
| Persistent condition announced with `toast()`     | `Banner` — toasts expire, conditions don't                                                          |
| Buttons or links inside a `Tooltip`               | `Popover` — tooltip content is unreachable                                                          |
| Destructive confirm as a styled `Dialog`          | `AlertDialog` with `AlertDialogAction` / `AlertDialogCancel`                                        |
| Variant value copied from another component       | Look it up — negative is `danger` / `destructive` / `error` depending on the component              |
| Hand-rolled error text under an input             | `Field` + `FieldError`                                                                              |
| `<Panel><PanelHeader>` for a plain bounded region | `PanelHeaderFrame` — `PanelHeader` is conversation chrome, see [rules/layout.md](./rules/layout.md) |
| Spinner hand-placed inside a `Button`             | `loading` / `loadingLabel` props                                                                    |
| `<hr>`, styled `<span>` badge, bare `<p>`         | `Separator`, `Badge`, `Text`                                                                        |

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
Caused by the user's last action, safe to miss? ── toast()
Condition that is still true? ──────────────────── Banner
Happened elsewhere, must persist until read? ───── NotificationCenter
Loading? ── known layout → Skeleton · unknown duration → Spinner · known % → Progress
```

Intent names are **not** consistent across components — negative is `danger` on `Button`/`Badge`/`Status`/`Progress`, `destructive` on `Banner`, and `error` on `Toast`/`NotificationCenter`. Never carry a variant value from one component to another.

## Quick component map

| Need                            | Use                                              |
| ------------------------------- | ------------------------------------------------ |
| Callout / inline status message | `Banner`                                         |
| Transient notification          | `toast()` + `ToastProvider`                      |
| Confirm a destructive action    | `AlertDialog`                                    |
| Generic modal                   | `Dialog`                                         |
| Edge-anchored panel             | `Drawer`                                         |
| Rich hover preview              | `PreviewCard`                                    |
| Plain hover hint                | `Tooltip`                                        |
| Right-click menu                | `ContextMenu`                                    |
| Button-triggered menu           | `DropdownMenu`                                   |
| Single choice, few options      | `RadioGroup` or `SegmentedControl`               |
| Single choice, many options     | `Select`                                         |
| Searchable / multi choice       | `Combobox`                                       |
| Any labelled form control       | `Field` + `FieldLabel` + `FieldError`            |
| Divider                         | `Separator` — never a raw `<hr>` or a border div |
| Loading placeholder             | `Skeleton`                                       |
| Inline busy indicator           | `Spinner`                                        |
| Determinate progress            | `Progress`                                       |
| Small count / tag               | `Badge`                                          |
| Presence or state dot           | `Status`                                         |
| Nothing-here state              | `EmptyState`                                     |
| Keyboard shortcut               | `Kbd` / `KbdGroup`                               |
| Any text                        | `Text` — never a bare styled `<p>`/`<span>`      |

Full scenario map: [rules/selection.md](./rules/selection.md)

## Read these when relevant

| File                                             | Read it when                                                            |
| ------------------------------------------------ | ----------------------------------------------------------------------- |
| [rules/lookup.md](./rules/lookup.md)             | You need a prop, variant value, or token — read this before guessing    |
| [rules/selection.md](./rules/selection.md)       | Flat scenario → component index across every domain                     |
| [rules/composition.md](./rules/composition.md)   | Assembling compound parts, or tempted to hand-roll markup               |
| [rules/forms.md](./rules/forms.md)               | Any input, option picker, or tabs — includes `Select` vs `DropdownMenu` |
| [rules/overlays.md](./rules/overlays.md)         | Dialogs, drawers, popovers, menus, tooltips                             |
| [rules/feedback.md](./rules/feedback.md)         | Banners, toasts, loading, empty states, badges                          |
| [rules/display.md](./rules/display.md)           | Typography, code, avatars, files, keyboard hints                        |
| [rules/layout.md](./rules/layout.md)             | Shell, panels, navigation, resizing, task surfaces                      |
| [rules/conversation.md](./rules/conversation.md) | Chat sidebar, conversation panel, thread, composer                      |
| [rules/styling.md](./rules/styling.md)           | Writing any `className`, color, shadow, or `tv()` recipe                |
| [rules/setup.md](./rules/setup.md)               | First-time install, Tailwind v4 wiring, fonts, theme provider           |

## Review checklist

When reviewing or editing code that uses raft-ui, check:

- [ ] No `theme` prop passed to any component — family comes from `ThemeProvider`
- [ ] No variant value carried across components — verify against the declarations
- [ ] Every labelled control is wrapped in `Field`; errors go through `FieldError`
- [ ] No Tailwind default palette (`gray-*`, `slate-*`, …), hex, `rgb()`, or `hsl()` — semantic oklch tokens only
- [ ] No `asChild` — element substitution uses `render`
- [ ] No hand-rolled markup where a component exists: `<hr>` → `Separator`, styled `<span>` → `Badge`, bare text → `Text`, pulsing div → `Skeleton`
- [ ] Every `Avatar` has an `AvatarFallback`; every blocking overlay has a `Title`
- [ ] Menu rows are `…Item` parts, not raw `<button>`s — raw buttons drop out of keyboard navigation
- [ ] Product state (upload, permissions, read/unread) lives in the app; the component renders parts, not a `state` prop
- [ ] Nothing imported from `raft-ui/wip` unless explicitly requested
- [ ] No shadow written as `shadow-[var(--…)]` — named utility or fully literal

## Stability

`raft-ui` is the stable surface. `raft-ui/wip` is unstable and may break in any release — do not reach for it unless the user explicitly asks.

```tsx
import { Button, Dialog, Field } from "raft-ui";
import { cn } from "raft-ui/cn";
```
