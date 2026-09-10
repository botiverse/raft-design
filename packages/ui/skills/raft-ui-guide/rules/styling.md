---
name: styling
description: "Styling contract: oklch semantic token families, banned palettes, interaction color pairs, tv() recipe conventions, the data-slot protocol, the var-first shadow trap."
---

# Styling

Use theme variables directly in plain CSS. The utility and recipe examples below apply to Tailwind consumers.

## Contents

- Tailwind's default palette is banned
- Semantic token families
- Interaction colors come in pairs
- When a raw oklch literal is allowed
- Never write a var-first shadow
- Writing a `tv()` recipe
- Styling by `data-slot`
- Merging classes

---

## Tailwind's default palette is banned

Raft-ui's theme contract is authored in oklch and exposed through semantic tokens. Tailwind's built-in palette is not part of that contract and will not track the theme.

**Incorrect:**

```tsx
<div className="bg-slate-50 text-gray-500 border-neutral-200" />
```

**Correct:**

```tsx
<div className="border border-line-muted bg-fill-muted text-foreground-muted" />
```

Never write `hex`, `rgb()`, or `hsl()` either.

---

## Semantic token families

Reach for these first. The token contract lives in `raft-ui/foundation.css`; `raft-ui/styles.css` maps it to Tailwind utilities.

| Family         | Purpose                                | Registered suffixes                                                                                        |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `layer-*`      | elevation surfaces                     | `canvas` `canvas-muted` `panel` `popover` `backdrop` `inset` `card` `hud` `hud-foreground`                 |
| `fill-*`       | opaque neutral fills                   | `muted` `strong`                                                                                           |
| `line-*`       | borders                                | bare `line`, then `strong` `muted` `hairline` `field` `field-hover`                                        |
| `foreground-*` | text and icons                         | bare `foreground`, then `strong` `muted` `hint` `icon` `placeholder` `disabled` `inverse` `active` `hover` |
| `ink-*`        | neutral washes on transparent surfaces | bare `ink`, then `2` `4` `6` `8` `10` `16` `20` `30` `40`                                                  |

State families do not share one uniform suffix set. `primary` and `accent` expose numeric ramps plus `strong`, `soft`, `hover`, and `active`; `info` exposes `strong`, `muted`, `soft`, `hover`, and `active`; `success` exposes `foreground`, `strong`, `muted`, and `soft`; `warning` and `danger` expose `foreground`, `strong`, `muted`, `soft`, `hover`, and `active`. Check `foundation.css` for values and `styles.css` for utility names.

The `ink` ramp step is the alpha percentage — `ink-8` is 8% ink. Use it for hairlines, hover fills, and pressed states on transparent backgrounds.

Within the state families, `primary` and `accent` split roles rather than rank:

- **`primary-*` (Source Yellow) — hints and interactive expression.** New-message indicators, attention badges, the active tab, focus rings. This is how the recipes already use it — the tabs active state, the rail's attention badge, and focus rings all draw from the primary family.
- **`accent-*` — core and important actions.** A dialog's confirm, the composer's send. `ComposerSubmit` locks `variant="accent"` at the type level.

Do not use yellow for an action button just because it is the brand color, and do not use accent for a passive indicator.

Opaque tokens and alpha washes composite differently on non-white backdrops. Never swap one for the other during a refactor without checking the actual background.

---

## Interaction colors come in pairs

Hover and active states on solid fills are derived tokens, not opacity hacks.

```tsx
<button className="bg-primary hover:bg-primary-hover active:bg-primary-active" />
```

Not every state family ships the full set — check `foundation.css` before assuming `success-hover` exists. Adding a family to the interaction contract means defining its complete hover/active pair in the token layer, not patching one callsite.

---

## When a raw oklch literal is allowed

One-off precision values — a tuned tint, a glass surface, a terminal black — may be written inline:

```tsx
<div className="bg-[oklch(0.21_0.006_285)]" />
```

Tokenize on the rule of three: once the same value appears in a third component, it earns a token. Do not invent a token for a single consumer.

---

## Never write a var-first shadow

```tsx
// Incorrect — tailwind-merge misreads this as a shadow-color and conflict
// resolution silently breaks.
<div className="shadow-[var(--theme-shadow-sm),0_1px_2px_oklch(0_0_0_/_0.18)]" />
```

Use a registered named shadow utility such as `shadow-raft-sm`, or keep the shadow fully literal:

```tsx
<div className="shadow-[0_1px_2px_oklch(0_0_0_/_0.18)]" />
```

---

## Writing a `tv()` recipe

Long class strings become arrays, one responsibility per entry. Keep a property together with its own state and responsive variants; split unrelated responsibilities apart. No comments — the grouping carries the intent. Group by:

- **layout** — display, grid/flex, gap, min/max size, overflow
- **typography** — font, size, line-height, weight, wrapping
- **surface** — background, border, radius, shadow, ring
- **state** — hover, active, focus-visible, disabled, selected, invalid
- **child/slot selectors** — icon sizing, `has-*`, `data-*` relationships

```ts
const button = tv({
  base: [
    "inline-flex items-center justify-center",
    "rounded-md text-sm font-medium",
    "transition-colors disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary: ["bg-primary hover:bg-primary-hover active:bg-primary-active", "text-primary-950"],
    },
  },
});
```

Add a `theme: { brutal, elegant }` variant when the two families genuinely differ, and resolve it from `useThemeFamily()` inside the component — never from a public prop.

**Never construct Tailwind utilities dynamically.** Tailwind's static extraction cannot see them, and the class silently does nothing:

```ts
// Broken — the class is never generated.
const padding = `px-${size}`;
```

Use static recipe entries (a `size` variant with literal classes) instead.

---

## Styling by `data-slot`

Raft-ui's DOM-rendering parts stamp stable `data-slot` attributes (`data-slot="dialog-content"`, `data-slot="banner-action"`, …). Behavior-only roots and providers that render no element have no slot. Recipes use this DOM protocol for structural relationships (`has-[[data-slot=…]]`).

When your styling depends on a part's presence or identity, target `data-slot`, never the part's class names:

```tsx
// React to a slot's presence from a parent you control:
<div className="grid has-[[data-slot=banner-action]]:grid-cols-[1fr_auto]">
```

Class names are recipe internals and change between releases; `data-slot` values are the stable contract. This is also how the library's own style tests select elements.

---

## Merging classes

```tsx
import { cn } from "raft-ui/cn";
```

`cn` is exported from the package. Do not add `clsx` or `tailwind-merge` as direct dependencies to compose raft-ui classes.

Conditional classes go through `cn`, not template-literal ternaries:

```tsx
// Incorrect
<div className={`px-3 ${active ? "bg-fill-muted" : ""}`} />

// Correct
<div className={cn("px-3", active && "bg-fill-muted")} />
```
