---
name: composition
description: "Compound-part composition: render vs asChild, theme resolution, structure rules, wrapping raft-ui components, and what never to hand-roll."
---

# Composition

## Contents

- Compound parts, never flat props
- Use the `render` prop, not `asChild`
- `theme` is never passed by hand
- Variant names are not consistent across components
- Dialog / AlertDialog / Drawer structure
- Use Field for shared field semantics
- Do not re-create a library contract with ad hoc markup
- Product state stays outside the component
- Wrapping raft-ui components

---

## Compound parts, never flat props

Every non-trivial component exposes named parts. Visible structure is chosen by which parts you render, not by a prop.

**Incorrect:**

```tsx
<Dialog title="Restart Atlas" description="This ends the session." />
```

**Correct:**

```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Restart Atlas</DialogTitle>
      <DialogClose />
    </DialogHeader>
    <DialogBody>This ends the session.</DialogBody>
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

If you want a structural difference, look for a part or a sibling component. Do not expect a `kind`, `state`, or `emphasis` prop to produce it.

---

## Use the `render` prop, not `asChild`

Base UI, not Radix. To change the element a part renders as, pass an element to `render`.

**Incorrect:**

```tsx
<DialogClose asChild>
  <Button variant="outline">Cancel</Button>
</DialogClose>
```

**Correct:**

```tsx
<DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
```

Children stay on the outer part; `render` receives a bare element.

---

## `theme` is never passed by hand

`brutal` and `elegant` are theme families resolved from context. Every component's public props explicitly omit `theme`:

```ts
export type ButtonProps = StyledProps<BaseButton.Props> &
  Omit<VariantProps<typeof buttonVariants>, "theme"> & { … };
```

**Incorrect:**

```tsx
<Button theme="brutal" variant="primary">
  Save
</Button>
```

**Correct:** wrap the app once and let components adapt.

```tsx
<ThemeProvider>
  <Button variant="primary">Save</Button>
</ThemeProvider>
```

Most application composition should not need to read the active family. Use `useThemeFamily()` only when a verified implementation detail cannot be expressed through tokens or recipes. Limit `<BrutalOnly>` / `<ElegantOnly>` to non-semantic decoration or equivalent implementations that preserve content, reading order, actions, and state.

---

## Variant names are not consistent across components

Do not carry a variant name from one component to another. Verify per component.

| Component | Destructive variants                                            |
| --------- | --------------------------------------------------------------- |
| `Button`  | `danger`, `danger-secondary`, or `danger-outline` via `variant` |
| `Banner`  | `destructive` via `status`                                      |

`Banner` statuses are `default` `destructive` `warning` `info` `success`.
`Button` variants are `primary` `default` `information` `muted` `accent` `warning` `outline` `ghost` `link` `danger-secondary` `danger` `danger-outline`.

Note `Button` uses `information` while `Banner` uses `info`. When in doubt, look it up — see [lookup.md](./lookup.md).

---

## Dialog / AlertDialog / Drawer structure

All three share the same part vocabulary: `Header` / `Body` / `Footer` inside `Content`, with `Title` inside `Header`.

- `Dialog` — generic modal.
- `AlertDialog` — destructive confirmation. `AlertDialogCancel` closes automatically; `AlertDialogAction` is a named button slot and must run the confirm action and close controlled state explicitly.
- `Drawer` — edge-anchored panel. Adds `DrawerActions`.

A dialog always needs a `Title`. If the design has no visible title, it still needs one for accessibility.

---

## Use Field for shared field semantics

Use `Field` when a control has raft-ui label, description, required, or validation treatment. It wires those parts together and keeps their state aligned. A simple native label/control pair may remain native when it does not need this shared layout or validation contract; keep the association explicit and accessible.
For exact validation wiring and the complete example, read [forms.md](./forms.md#use-field-when-the-field-contract-applies). Do not hand-roll a visually attached but semantically disconnected error paragraph.

---

## Do not re-create a library contract with ad hoc markup

| When you need this raft-ui treatment     | Use                                                            |
| ---------------------------------------- | -------------------------------------------------------------- |
| a themed divider                         | `Separator`                                                    |
| a styled `<span>` for a count or tag     | `Badge`                                                        |
| a colored dot div                        | `Status`                                                       |
| raft-ui typography                       | `Text.Sans`, `Text.Mono`, `Text.Heading`, or the named exports |
| `<code>`                                 | `InlineCode`, or `CopyableCode` when it should be copyable     |
| a `<kbd>`                                | `Kbd` / `KbdGroup`                                             |
| a custom "no results" block              | `EmptyState`                                                   |
| a pulsing gray div                       | `Skeleton`                                                     |
| a custom callout box                     | `Banner`                                                       |
| a hand-built avatar circle with initials | `Avatar` + `AvatarImage` + `AvatarFallback`                    |

Native elements remain appropriate when their semantics and inherited styling are intentional. The rule is to avoid recreating the library's visual or behavioral contract incompletely, not to wrap every HTML element.

When `Avatar` contains `AvatarImage`, pair it with `AvatarFallback` so a failed image still has an accessible fallback. A childless `Avatar` uses its built-in fallback.

---

## Product state stays outside the component

Generic interaction state (open, focus, selection, keyboard navigation, controlled value) belongs to the component. Product state does not.

Upload lifecycle, notification policy, saved/followed flags, permissions, and workflow status live in your app. Pass the result down by choosing which parts to render, not by adding a status prop to a primitive.

---

## Wrapping raft-ui components

When you build your own component on top of a raft-ui one, the wrapper must stay transparent:

```tsx
import { Button, type ButtonProps } from "raft-ui";
import { cn } from "raft-ui/cn";

export function DangerZoneButton({ className, ...props }: Omit<ButtonProps, "variant">) {
  return <Button {...props} variant="danger-outline" className={cn("w-full", className)} />;
}
```

- **Spread the rest props and keep `className` mergeable via `cn`.** Swallowing either breaks callsites that need an override.
- **Keep `render` working through the wrapper** — it is the element-substitution path, and a wrapper that drops it can no longer be used as a trigger/close target.
- **Do not rebuild variants outside the recipe.** A one-off tweak is `className`; a combination you repeat is a named wrapper component in your module — not a patched copy of the library recipe.
- **Business wrappers live in your app's module, not in a shared UI folder.** The wrapper is where product copy, icons, and policy enter; keep it next to the feature that owns them.
- Base UI `data-*` state attributes and `data-slot` pass through automatically — style against them rather than adding parallel state props ([styling.md](./styling.md)).
