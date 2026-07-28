# Styling

## Contents

- Tailwind's default palette is banned
- Semantic token families
- Interaction colors come in pairs
- When a raw oklch literal is allowed
- Never write a var-first shadow
- Writing a `tv()` recipe
- Merging classes

---

## Tailwind's default palette is banned

Every color in raft-ui is authored in oklch and exposed as a token. Tailwind's built-in palette is not part of the contract and will not track the theme.

**Incorrect:**

```tsx
<div className="bg-slate-50 text-gray-500 border-neutral-200" />
```

**Correct:**

```tsx
<div className="bg-layer-muted text-foreground-muted border-line-subtle" />
```

Never write `hex`, `rgb()`, or `hsl()` either.

---

## Semantic token families

Reach for these first. The token contract lives in `raft-ui/styles.css`.

| Family         | Purpose                                | Members                                                                                      |
| -------------- | -------------------------------------- | -------------------------------------------------------------------------------------------- |
| `layer-*`      | surfaces                               | `page` `panel` `popover` `field` `muted` `hover` `active` `strong` `backdrop`                |
| `line-*`       | borders                                | `line` `line-subtle` `line-muted` `line-strong` `line-field` `line-field-hover` `line-focus` |
| `foreground-*` | text and icons                         | `foreground` `strong` `muted` `placeholder` `disabled` `icon` `inverse`                      |
| `ink-*`        | neutral washes on transparent surfaces | `ink` `ink-2` `ink-4` `ink-6` `ink-8` `ink-10` `ink-16` `ink-20` `ink-30` `ink-40`           |
| state          | intent color                           | `primary-*` `accent-*` `danger-*` `warning-*` `success-*`                                    |

The `ink` ramp step is the alpha percentage — `ink-8` is 8% ink. Use it for hairlines, hover fills, and pressed states on transparent backgrounds.

Opaque tokens and alpha washes composite differently on non-white backdrops. Never swap one for the other during a refactor without checking the actual background.

---

## Interaction colors come in pairs

Hover and active states on solid fills are derived tokens, not opacity hacks.

```tsx
<button className="bg-primary-base hover:bg-primary-hover active:bg-primary-active" />
```

Not every state family ships the full set — check `styles.css` before assuming `success-hover` exists. Adding a family to the interaction contract means defining its complete hover/active pair in the token layer, not patching one callsite.

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
<div className="shadow-[var(--shadow-field-hover),0_1px_2px_black]" />
```

Use a named `@theme inline` shadow utility (`shadow-field-hover`) or keep the shadow fully literal.

---

## Writing a `tv()` recipe

Long class strings become arrays, grouped one concern per entry. Keep a property together with its own state and responsive variants; split unrelated concerns apart. No comments — the grouping carries the intent.

```ts
const button = tv({
  base: [
    "inline-flex items-center justify-center",
    "rounded-md text-sm font-medium",
    "transition-colors disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary: ["bg-primary-base hover:bg-primary-hover", "text-foreground-inverse"],
    },
  },
});
```

Add a `theme: { brutal, elegant }` variant when the two families genuinely differ, and resolve it from `useThemeFamily()` inside the component — never from a public prop.

---

## Merging classes

```tsx
import { cn } from "raft-ui/cn";
```

`cn` is exported from the package. Do not add `clsx` or `tailwind-merge` as direct dependencies to compose raft-ui classes.
