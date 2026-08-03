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
<AlertDialog>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete channel</AlertDialogTitle>
    </AlertDialogHeader>
    <AlertDialogBody>This cannot be undone.</AlertDialogBody>
    <AlertDialogFooter>
      <AlertDialogCancel>Keep</AlertDialogCancel>
      <AlertDialogAction render={<Button variant="danger" />}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Use `AlertDialogAction` and `AlertDialogCancel` — not bare `Button`s. They carry the confirm/cancel roles and the correct dismissal behavior.

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

`Drawer` adds `DrawerActions` for a persistent action row. On small screens prefer `Drawer` over `Dialog` for anything taller than a couple of fields.

---

## Tooltip vs Popover vs PreviewCard

The dividing line is **interactivity**, then **trigger**.

|                              | `Tooltip`     | `PreviewCard`     | `Popover`                 |
| ---------------------------- | ------------- | ----------------- | ------------------------- |
| Opens on                     | hover / focus | hover             | click                     |
| Content                      | one phrase    | read-only summary | anything, including forms |
| Can contain links or buttons | No            | Links only        | Yes                       |
| Dismissable by the user      | No            | No                | Yes, `PopoverClose`       |

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
<Tooltip><TooltipTrigger render={<Button size="icon-sm" />} /><TooltipContent>Archive</TooltipContent></Tooltip>

<PreviewCard><PreviewCardTrigger render={<a />} /><PreviewCardContent>…user card…</PreviewCardContent></PreviewCard>

<Popover><PopoverTrigger render={<Button />} /><PopoverContent>…filter form…</PopoverContent></Popover>
```

`Tooltip` requires a `TooltipProvider` above it. It has a `hasLeadingIcon` state for tooltips that show an icon alongside the label — do not hand-pad an icon in.

Never put a tooltip on something that has no other affordance. If the only way to learn what a button does is to hover, the button needs a label.

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

`DropdownMenuItemCount` exists for rows carrying a number.

---

## Lightbox vs Dialog

`Lightbox` is for viewing media at full size — images, video, and their navigation. It provides `LightboxStage`, `LightboxMedia`, `LightboxThumbnailStrip`, `LightboxThumbnail`, `LightboxNavigationButton`, `LightboxToolbar`, and an info dock (`LightboxInfoBar`, `LightboxInfoTitle`, `LightboxInfoActions`).

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

Every blocking overlay needs a `Title`, even when the design shows no visible heading. It is what screen readers announce.

---

## Per-component norms

**`Popover`** — `PopoverViewport` handles scrolling content; `PopoverArrow` is optional and should be omitted when the popover is wide. `PopoverHeader`, `PopoverTitle`, `PopoverDescription`, and `PopoverSeparator` are available for structured content.

**`Dialog` / `AlertDialog` / `Drawer`** — put actions in the `Footer`, not at the end of the `Body`. `DialogClose` in the `Header` renders the corner dismiss; `DialogClose` in the `Footer` with `render={<Button variant="outline" />}` renders the cancel button.

**`Tooltip`** — keep to a phrase. No punctuation-heavy sentences, no line breaks.

**`NotificationCenter`** — an inbox surface, not an overlay primitive. It has its own trigger, popup, list, and empty state, plus `viewport` of `desktop` or `mobile`. See [feedback.md](./feedback.md).
