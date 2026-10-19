---
name: raft-ui-guide
description: "Build with raft-ui, the React implementation of the Raft Design System: where the guidelines and each component's API are, the API facts that differ from other libraries, and how to check props. Use when choosing, composing or styling raft-ui components."
---

# raft-ui

The package is `@botiverse/raft-ui`. Plain HTML can use `foundation.css` directly; the components are React, built on **Base UI** (`@base-ui/react`), **Tailwind CSS v4** and **tailwind-variants**.

The design guidance (which component to use, how components combine into screens, what each color and size means) lives in the Raft Design System docs, not in this skill. Every page is Markdown:

- **Index:** https://raft-design.botiverse.build/llms.txt lists every page with a one-line summary.
- **Components:** https://raft-design.botiverse.build/components.json lists every component with its status, other names and doc URLs. Each component page, `https://raft-design.botiverse.build/components/<component>.md`, has when to use it, its parts, rules and an API generated from the code.
- **Choosing a component:** https://raft-design.botiverse.build/components/overview.md#how-to-choose-a-component.

This skill keeps what is specific to the code: the [adoption](./rules/adoption.md) order, [looking up](./rules/lookup.md) props and tokens, and the [technical overview](./rules/technical-overview.md) (package contents, stylesheets, providers). Do not register or install skills in a consumer project unless requested.

## Working sequence

1. Find the component in `components.json` or on the choosing page; read only the pages the task needs.
2. Verify every prop, part, variant and token you use with [rules/lookup.md](./rules/lookup.md). The page's API section and `node_modules/@botiverse/raft-ui/dist/index.d.mts` agree; the declarations win for the installed version.
3. Implement the smallest composition that keeps native semantics and uses raft-ui where its behavior or look is needed.
4. Apply the review checklist below after implementation.

When this skill is loaded through TanStack Intent, run `intent load @botiverse/raft-ui#raft-ui-guide --path` before opening a linked rule file, then resolve the link relative to the returned `SKILL.md` directory.

## Override your priors first

raft-ui is not shadcn/ui, not Radix, not MUI. These defaults are wrong here:

| Your instinct                                                    | Reality in raft-ui                                                                                            |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `<Button variant="destructive">`                                 | `variant="danger"`, and only on the confirm button of an `AlertDialog`. See the Button page for every variant |
| `<Button size="icon">`                                           | `size="icon-md"` or `size="icon-lg"`                                                                          |
| `className="text-gray-500 bg-slate-50"`                          | Don't use Tailwind's default palette. Use the semantic tokens: `text-foreground-muted`, `bg-fill-muted`       |
| Flat props: `<Dialog title="x" description="y">`                 | Compound parts: `<Dialog><DialogContent><DialogHeader><DialogTitle>…`; `DialogContent` portals itself         |
| Radix API (`asChild`)                                            | Base UI API: the `render` prop                                                                                |
| Add a `kind`/`state`/`emphasis` prop for a structural difference | Use the dedicated part or component instead                                                                   |
| `<Button loading>` doesn't exist, roll a spinner                 | `loading` and `loadingLabel` are real props on `Button`                                                       |

**Never guess a prop or variant name.** See [rules/lookup.md](./rules/lookup.md).

Intent names are **not** consistent across components: negative is `danger` on `Button`, `Badge`, `Status` and `Progress`, `destructive` on `Banner`, and `error` on toast objects and `NotificationCenterItemIcon`. Never carry a variant value from one component to another.

## Principles

- Composition over configuration. Visible structure lives in `children` and named parts, never in a prop that switches layouts.
- Use semantic tokens, never raw color. Each color has one meaning (yellow is "you", pink is the one primary action); see https://raft-design.botiverse.build/foundations/color.md.
- Base UI owns headless behavior (open state, focus, keyboard, collections). Product state (upload lifecycle, permissions, workflow) belongs in your app, not in a component prop.
- Raft is the only visual language, in light and dark modes; `ThemeProvider` switches the mode globally. Components adapt themselves.

## Common mistakes

| Mistake                                            | Fix                                                                     |
| -------------------------------------------------- | ----------------------------------------------------------------------- |
| `asChild` on a trigger or close part               | Base UI: `render={<Button … />}`                                        |
| Actions menu built out of `Select`                 | `DropdownMenu`                                                          |
| Persistent condition announced with `toast.info()` | `Banner`: toasts expire, conditions don't                               |
| Buttons or links inside a `Tooltip`                | `Popover`: tooltip content is unreachable                               |
| Destructive confirm as a styled `Dialog`           | `AlertDialog` with `AlertDialogAction` / `AlertDialogCancel`            |
| Validation copy disconnected from its control      | `Field` + `FieldError`                                                  |
| `PanelHeader` where you meant the bare frame       | `PanelHeaderRoot`: `PanelHeader` is the composed identity chrome        |
| Re-created raft-ui divider, badge, or type styling | `Separator`, `Badge`, or `Text`; keep native semantics when intentional |

## Where the guidance moved

The guideline rules this skill used to carry are pages of the design system now. Each file in `rules/` that is not listed above points to them.

| For                                               | Read                                                                                                                       |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Which component, which feedback, which overlay    | https://raft-design.botiverse.build/components/overview.md#how-to-choose-a-component                                       |
| Combining parts, things built from existing parts | https://raft-design.botiverse.build/components/overview.md#built-from-existing-parts                                       |
| Forms and settings                                | https://raft-design.botiverse.build/patterns/forms.md                                                                      |
| Feedback, loading, empty and error states         | https://raft-design.botiverse.build/patterns/feedback.md                                                                   |
| Shell, panels, headers, navigation                | https://raft-design.botiverse.build/patterns/page-structure.md, https://raft-design.botiverse.build/patterns/navigation.md |
| Chat, threads, composer, agents                   | https://raft-design.botiverse.build/patterns/conversation.md, https://raft-design.botiverse.build/patterns/agents.md       |
| Color, type, spacing, shape, elevation            | https://raft-design.botiverse.build/foundations/color.md and the other pages under `/foundations/`                         |
| One component's parts, rules and API              | https://raft-design.botiverse.build/components/<component>.md                                                              |

## Review checklist

When reviewing or editing code that uses raft-ui, check:

- [ ] No variant value carried across components; verify against the declarations
- [ ] Controls with raft-ui label, description, or validation treatment use `Field`; simpler native associations remain explicit and accessible
- [ ] No Tailwind default palette (`gray-*`, `slate-*`, …), hex, `rgb()`, or `hsl()`: semantic tokens, raw `oklch()` only for one-offs
- [ ] No `asChild`: element substitution uses `render`
- [ ] Do not recreate a raft-ui component's visual or behavioral contract with ad hoc markup; native semantic elements remain valid when no library contract is needed
- [ ] Every `Avatar` with an `AvatarImage` also has an `AvatarFallback`; every blocking overlay has a `Title`
- [ ] Menu rows are `…Item` parts, not raw `<button>`s; raw buttons drop out of keyboard navigation
- [ ] Product state (upload, permissions, read/unread) lives in the app; the component renders parts, not a `state` prop
- [ ] No shadow written as `shadow-[var(--…)]`: named utility or fully literal

## Stability

`raft-ui` is the stable surface; `@botiverse/raft-ui/wip` is experimental. Import `cn` from `@botiverse/raft-ui/cn`.
