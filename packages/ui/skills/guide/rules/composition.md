---
name: composition
description: "Compound-part composition: render vs asChild, theme resolution, overlay container and business-action ownership, state sinking, structure rules, and transparent wrappers."
---

# Composition

## Contents

- Compound parts, never flat props
- Use the `render` prop, not `asChild`
- `theme` is never passed by hand
- Variant names are not consistent across components
- Dialog / AlertDialog / Drawer structure
- Keep overlay containers structural and business actions local
- Use Field for shared field semantics
- Do not re-create a library contract with ad hoc markup
- Product state stays outside reusable primitives
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

## Keep overlay containers structural and business actions local

Treat `Dialog`, `Popover`, `DropdownMenu`, and `ContextMenu` compositions as two layers:

| Layer                   | Owns                                                                                                                                     |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Overlay container       | Root, trigger, content, portal placement, grouping, separators, and only the open/selection state needed to coordinate the whole surface |
| Business item or action | Product copy and icon, entity identity, permission, mutation, pending/confirming/error feedback, and the action's event logic            |

Keep the container readable as an outline of the surface. Do not turn it into a controller that stores every row's `pending`, `copied`, `confirming`, or error state and dispatches actions through a large switch.

```tsx
function ChannelActions({ channelId }: { channelId: string }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <ChannelActionsMenu channelId={channelId} onRequestDelete={() => setDeleteOpen(true)} />
      <DeleteChannelDialog channelId={channelId} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </>
  );
}

function ChannelActionsMenu({
  channelId,
  onRequestDelete,
}: {
  channelId: string;
  onRequestDelete: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button size="icon-sm" aria-label="Channel actions" />} />
      <DropdownMenuContent>
        <MuteChannelMenuItem channelId={channelId} />
        <ArchiveChannelMenuItem channelId={channelId} />
        <DropdownMenuSeparator />
        <RequestDeleteChannelMenuItem onRequestDelete={onRequestDelete} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MuteChannelMenuItem({ channelId }: { channelId: string }) {
  const mute = useMuteChannelMutation(channelId);

  return (
    <DropdownMenuItem closeOnClick={false} disabled={mute.isPending} onClick={() => mute.mutate()}>
      <BellOff />
      <DropdownMenuItemLabel>{mute.isPending ? "Muting…" : "Mute channel"}</DropdownMenuItemLabel>
    </DropdownMenuItem>
  );
}
```

Name business components after the action, such as `MuteChannelMenuItem`, `CopyInviteLinkMenuItem`, or `DeleteWorkspaceDialog`. Keep them in the owning application module. Do not add them to `packages/ui`, and do not hide explicit menu structure behind an `items` configuration array.

Sink state to the smallest stable interaction owner:

- A menu item owns its mutation, pending state, item-specific permission, and local feedback.
- A business dialog owns its form draft, validation, submit mutation, and recoverable error state.
- A popover section or row owns state used only by that section or row.
- The primitive continues to own generic focus, highlight, keyboard navigation, and uncontrolled open/selection behavior.

State sinking does not mean duplicating shared entity reads or expensive work in every item. Several items may read the same query cache or receive a narrow shared permission/entity result from the container; keep each action's transient state machine local.

Lift only the narrow coordination state another part truly needs. For example, a destructive dialog opened from a menu must outlive the menu content after it closes: keep the dialog's `open` handoff in a stable parent, but keep deletion pending/error state inside `DeleteChannelDialog`. Likewise, keep a single form transaction at the dialog/form owner instead of scattering one atomic submit across field components.

Use the same boundary for `ContextMenu`; only the trigger primitive changes. If Dropdown and Context menu items need the same product operation, share the behavior hook or mutation contract, then render the correct `DropdownMenuItem` or `ContextMenuItem` wrapper explicitly. Do not create one adapter that guesses which menu primitive it lives inside.

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

## Product state stays outside reusable primitives

Generic interaction state (open, focus, selection, keyboard navigation, controlled value) belongs to the reusable primitive. Product state does not.

Upload lifecycle, notification policy, saved/followed flags, permissions, and workflow status live in your app. That does not mean putting all product state in a page or overlay container: sink it into the smallest module-local business component that owns the interaction. Pass visible structure through explicit parts instead of adding a product `state` prop to a primitive.

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
