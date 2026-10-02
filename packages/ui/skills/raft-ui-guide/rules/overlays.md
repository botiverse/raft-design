---
name: overlays
description: "Choosing and structuring overlays: Dialog vs AlertDialog vs Drawer, Tooltip vs Popover vs PreviewCard, menu rules, portal structure."
---

# Overlays

## Contents

- Picking an overlay
- Dialog vs AlertDialog
- Dialog vs Drawer
- Tooltip vs Popover vs PreviewCard
- DropdownMenu vs ContextMenu
- Lightbox vs Dialog
- Portals and structure
- Per-component norms

---

## Picking an overlay

Two questions decide almost every case.

1. **Does it block the app until resolved?** Yes → `Dialog` / `AlertDialog` / `Drawer`. No → `Popover` / `Tooltip` / `PreviewCard` / menus.
2. **Is it anchored to a trigger element?** Yes → `Popover` / `Tooltip` / `PreviewCard` / `DropdownMenu`. No → `Dialog` / `Drawer` / `Lightbox`.

| Scenario                                            | Component      |
| --------------------------------------------------- | -------------- |
| Confirm something destructive or irreversible       | `AlertDialog`  |
| A focused task that must finish or be cancelled     | `Dialog`       |
| A side surface for secondary work or a mobile sheet | `Drawer`       |
| Rich, interactive content anchored to a trigger     | `Popover`      |
| One phrase of help on hover or focus                | `Tooltip`      |
| A summary of an entity on hover                     | `PreviewCard`  |
| Actions from a button                               | `DropdownMenu` |
| Actions from a right-click                          | `ContextMenu`  |
| Full-screen media                                   | `Lightbox`     |

---

## Dialog vs AlertDialog

`AlertDialog` is not a red `Dialog`. It carries different semantics and different parts.

Use `AlertDialog` when the user could lose work or cause something irreversible: delete, discard, reset, revoke, disconnect.

```tsx
import { useState } from "react";

function DeleteChannelAlertDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setPending(true);
    setError("");
    try {
      await deleteChannel();
      setOpen(false);
    } catch {
      setError("Could not delete the channel. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) setOpen(nextOpen);
      }}
    >
      <AlertDialogTrigger render={<Button variant="danger-outline" />} onClick={() => setError("")}>
        Delete channel
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete channel</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogBody>
          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          {error ? <p role="alert">{error}</p> : null}
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel size="md" disabled={pending}>
            Keep
          </AlertDialogCancel>
          <AlertDialogAction variant="danger" size="md" loading={pending} onClick={handleDelete}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

`AlertDialogCancel` is a dialog close part and dismisses automatically. `AlertDialogAction` is a named `Button` slot; it does **not** close the dialog. Wire the confirm behavior yourself. `AlertDialogCancel` defaults to `size="sm"` and `AlertDialogAction` to `md`; set the same size on both. For async work, control `open`, show `loading`, close only after success, and leave the dialog open with an error on failure. Disable or block dismissal while pending only when the operation cannot safely be abandoned.

Everything else — a form, a settings pane, a multi-step flow — is `Dialog`.

An `AlertDialog` may still contain an input when the input is part of the confirmation itself — type-to-confirm deletion (`Field` + `Input` asking the user to type the resource name) is a canonical pattern. The line is purpose: confirming stays `AlertDialog`, editing is a `Dialog`.

---

## Dialog vs Drawer

Both block. They differ in where they come from and how long the user stays.

|                | `Dialog`                    | `Drawer`                                    |
| -------------- | --------------------------- | ------------------------------------------- |
| Position       | Centered                    | Anchored to an edge                         |
| Good for       | Short, focused task         | Longer browsing, side detail, mobile sheets |
| Content length | Fits without much scrolling | Expected to scroll                          |

Inside `DrawerFooter`, `DrawerActions` stacks its buttons full width. On small screens prefer `Drawer` over `Dialog` for anything taller than a couple of fields.

---

## Tooltip vs Popover vs PreviewCard

The dividing line is **interactivity**, then **trigger**.

|                              | `Tooltip`     | `PreviewCard`     | `Popover`                 |
| ---------------------------- | ------------- | ----------------- | ------------------------- |
| Opens on                     | hover / focus | hover / focus     | click                     |
| Content                      | one phrase    | read-only summary | anything, including forms |
| Can contain links or buttons | No            | Links only        | Yes                       |
| Explicit close control       | No            | No                | Yes, `PopoverClose`       |

**Incorrect** — interactive content in a tooltip:

```tsx
<Tooltip>
  <TooltipContent>
    <Button onClick={rename}>Rename</Button>
  </TooltipContent>
</Tooltip>
```

A tooltip disappears when the pointer leaves, so the user can never reach that button. Use `Popover`.

**Correct use of each:**

```tsx
<Tooltip>
  <TooltipTrigger render={<Button size="icon-sm" aria-label="Archive" />} />
  <TooltipContent>Archive</TooltipContent>
</Tooltip>

<PreviewCard>
  <PreviewCardTrigger render={<a href="/people/atlas" />}>@Atlas</PreviewCardTrigger>
  <PreviewCardContent>…user card…</PreviewCardContent>
</PreviewCard>

<Popover>
  <PopoverTrigger render={<Button />}>Filters</PopoverTrigger>
  <PopoverContent>…filter form…</PopoverContent>
</Popover>
```

Wrap related tooltips in `TooltipProvider` to share delay and instant-open behavior. `TooltipContent` detects a leading icon and lays it out beside the label automatically — do not add manual icon padding.

A tooltip supplements an accessible name; it never replaces one. Keep it to a phrase, without line breaks.

---

## DropdownMenu vs ContextMenu

Same vocabulary, different trigger. Pick by how the user opens it, never by appearance.

- `DropdownMenu` — opened by clicking a visible trigger. This is the default.
- `ContextMenu` — opened by right-click or long-press on a region.

Both provide `Item`, `ItemLabel`, `CheckboxItem` + `CheckboxItemIndicator`, `RadioGroup` + `RadioItem` + `RadioItemIndicator`, `Label`, `Separator`, `Shortcut`, `Submenu` + `SubmenuTrigger`, and `Footer`.

Rules that apply to both:

- Every interactive row must be a `…Item`. A raw `<button>` inside menu content does not join the keyboard collection and will be skipped by arrow navigation.
- Use `…Shortcut` for key hints instead of right-aligned text in the label.
- Group related rows with `…Separator`, not with margin.
- Right-click is invisible — actions that live only in a `ContextMenu` are hard to discover, so prefer also exposing them somewhere visible.

Keep menu content structural; let the caller own the trigger, and put entity-specific mutations and transient feedback in module-local business item components. Read [composition.md](./composition.md#keep-popup-content-focused-and-triggers-external) for the ownership rules and the cases where a dialog handoff must remain in a stable parent.

`DropdownMenuItemCount` exists for rows carrying a number.

---

## Lightbox vs Dialog

`Lightbox` is for viewing media at full size — images, video, and their navigation. It provides `LightboxStage`, `LightboxMedia`, `LightboxThumbnailStrip`, `LightboxThumbnail`, `LightboxNavigationButton`, `LightboxToolbar`, and `LightboxInfoDock` with `LightboxInfoBar`, `LightboxInfoTitle`, and `LightboxInfoActions`.

Do not build a media viewer out of `Dialog`. Do not use `Lightbox` for non-media content.

---

## Portals and structure

**The `Content` part portals itself.** `DialogContent`, `DropdownMenuContent`, and their siblings already wrap the Base UI portal and popup internally — the canonical usage is just:

```
Root → Trigger → Content → Header / Body / Footer   (blocking)
Root → Trigger → Content                            (anchored)
```

Do not add a `…Portal` or `…Popup` wrapper around `Content` — that double-portals. The exported `…Portal` / `…Overlay` / `…Popup` parts and the `portalProps` prop on `Content` exist for granular control (custom containers, split rendering); reach for them only when the default placement is wrong.

Do not introduce your own portal provider — the primitive's container API already solves placement ownership.

Portaled content escapes the trigger's local stacking context, but it still participates in the portal container's stacking order. Before adding an arbitrary high `z-index`, inspect the selected portal container and the competing top-level layer; use `portalProps.container` when the overlay belongs to a different layer owner.

Every blocking overlay needs a `Title`, even when the design shows no visible heading — it is what screen readers announce. When the design hides it, keep the part and add `className="sr-only"`.

---

## Per-component norms

**`Popover`** — `PopoverViewport` animates content changes when one popover is shared by several triggers; `PopoverArrow` is optional and should be omitted when the popover is wide. `PopoverHeader`, `PopoverTitle`, `PopoverDescription`, and `PopoverSeparator` are available for structured content.

**`Dialog` / `AlertDialog` / `Drawer`** — put actions in the `Footer`, not at the end of the `Body`. `DialogClose` in the `Header` renders the corner dismiss; `DialogClose` in the `Footer` with `render={<Button variant="outline" />}` renders the cancel button. The confirm button uses `variant="accent"` — accent is the core-action color — unless the action is destructive, which stays `danger`.

`NotificationCenter` is an inbox surface, not a generic overlay primitive — see [feedback.md](./feedback.md).
