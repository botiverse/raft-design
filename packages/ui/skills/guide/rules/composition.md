# Composition

## Contents

- Compound parts, never flat props
- Use the `render` prop, not `asChild`
- `theme` is never passed by hand
- Variant names are not consistent across components
- Dialog / AlertDialog / Drawer structure
- Form controls always go through Field
- Use the component instead of hand-rolled markup
- Product state stays outside the component

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

Read the active family with `useThemeFamily()`. Render family-specific content with `<BrutalOnly>` / `<ElegantOnly>` rather than branching on a prop.

---

## Variant names are not consistent across components

Do not carry a variant name from one component to another. Verify per component.

| Component | Negative variant       |
| --------- | ---------------------- |
| `Button`  | `variant="danger"`     |
| `Banner`  | `status="destructive"` |

`Banner` statuses are `default` `destructive` `warning` `info` `success`.
`Button` variants are `primary` `default` `information` `muted` `accent` `warning` `outline` `ghost` `link` `danger`.

Note `Button` uses `information` while `Banner` uses `info`. When in doubt, look it up — see [lookup.md](./lookup.md).

---

## Dialog / AlertDialog / Drawer structure

All three share the same part vocabulary: `Header` / `Body` / `Footer` inside `Content`, with `Title` inside `Header`.

- `Dialog` — generic modal.
- `AlertDialog` — destructive confirmation. Adds `AlertDialogAction` and `AlertDialogCancel`; use these instead of raw buttons so the confirm/cancel roles are correct.
- `Drawer` — edge-anchored panel. Adds `DrawerActions`.

A dialog always needs a `Title`. If the design has no visible title, it still needs one for accessibility.

---

## Form controls always go through Field

`Field` wires label, control, description, and error together.

**Incorrect:**

```tsx
<label>Display name</label>
<Input />
<span className="text-danger-base">Required</span>
```

**Correct:**

```tsx
<Field>
  <FieldLabel htmlFor="display-name">Display name</FieldLabel>
  <Input id="display-name" placeholder="you@example.com" />
  <FieldDescription>Use your work email.</FieldDescription>
  <FieldError />
</Field>
```

`FieldError` renders validation state on its own — do not hand-roll an error paragraph. Use `FieldItem` for horizontal label/control rows and `FieldValidity` when you need raw validity state.

---

## Use the component instead of hand-rolled markup

| Do not write                              | Use                                                        |
| ----------------------------------------- | ---------------------------------------------------------- |
| `<hr>` or a `border-t` div                | `Separator`                                                |
| a styled `<span>` for a count or tag      | `Badge`                                                    |
| a colored dot div                         | `Status`                                                   |
| a bare `<p>` / `<span>` with text classes | `Text` (or `TextHeading` / `TextMono` / `TextSans`)        |
| `<code>`                                  | `InlineCode`, or `CopyableCode` when it should be copyable |
| a `<kbd>`                                 | `Kbd` / `KbdGroup`                                         |
| a custom "no results" block               | `EmptyState`                                               |
| a pulsing gray div                        | `Skeleton`                                                 |
| a custom callout box                      | `Banner`                                                   |
| a hand-built avatar circle with initials  | `Avatar` + `AvatarImage` + `AvatarFallback`                |

`Avatar` always needs `AvatarFallback` — images fail.

---

## Product state stays outside the component

Generic interaction state (open, focus, selection, keyboard navigation, controlled value) belongs to the component. Product state does not.

Upload lifecycle, notification policy, saved/followed flags, permissions, and workflow status live in your app. Pass the result down by choosing which parts to render, not by adding a status prop to a primitive.
