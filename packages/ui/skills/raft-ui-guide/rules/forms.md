---
name: forms
description: "Choosing and composing form controls: Select vs DropdownMenu, Switch vs Checkbox, Combobox, SegmentedControl vs RadioGroup vs Tabs, Field wiring."
---

# Form controls

## Contents

- Select vs DropdownMenu — the mistake to avoid
- Choosing an option control
- Checkbox vs Switch
- Combobox vs Select
- SegmentedControl vs RadioGroup vs Tabs vs ToggleGroup
- Input vs InputGroup vs Textarea
- Use Field when the field contract applies
- Per-component norms

---

## Select vs DropdownMenu — the mistake to avoid

These look alike and are not interchangeable. The rule is about **what happens on click**, not about appearance.

|                         | `Select`                           | `DropdownMenu`                     |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| Purpose                 | Pick a **value**                   | Run an **action**                  |
| After choosing          | The trigger shows the chosen value | The menu closes, something happens |
| Has a persistent value  | Yes                                | No                                 |
| Can represent form data | Yes, when given a `name`           | No                                 |
| Submitted with the form | When named                         | Never                              |

**Incorrect** — an actions menu built out of `Select`:

```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Actions" />
    <SelectIcon />
  </SelectTrigger>
  <SelectContent>
    <SelectList>
      <SelectItem value="rename">
        <SelectItemText>Rename</SelectItemText>
        <SelectItemIndicator />
      </SelectItem>
      <SelectItem value="delete">
        <SelectItemText>Delete</SelectItemText>
        <SelectItemIndicator />
      </SelectItem>
    </SelectList>
  </SelectContent>
</Select>
```

**Correct:**

```tsx
<DropdownMenu>
  <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label="Actions" />}>
    …
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={rename}>Rename</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onClick={remove}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

`DropdownMenuContent` handles the portal and popup itself — do not wrap it in `DropdownMenuPortal` or `DropdownMenuPopup`. Those parts exist for granular control only.

Quick test: if the trigger should still read "Actions" after the user picks something, it is a menu. If the trigger should now read "Rename", it is a select.

`DropdownMenu` does carry state for _settings-style_ menus — that is what `DropdownMenuCheckboxItem` and `DropdownMenuRadioGroup` / `DropdownMenuRadioItem` are for (view density, sort order). Those still are not form fields and are never submitted.

---

## Choosing an option control

Walk this in order.

1. Is it an action, not a value? → `DropdownMenu` / `ContextMenu`.
2. Is it a single on/off that applies immediately? → `Switch`.
3. Is it a single on/off submitted with a form? → `Checkbox`.
4. Multiple independent on/offs? → several `Checkbox`, or `ToggleGroup` when they are a compact toolbar.
5. One of 2–5, all worth showing, in a form? → `RadioGroup`.
6. One of 2–5, switching a view or filter, space is tight? → `SegmentedControl`.
7. One of many? → `Select`.
8. Many, and the user will want to type to narrow? → `Combobox`.
9. Multiple selections from many? → `Combobox` with chips.

---

## Checkbox vs Switch

|                        | `Checkbox`                             | `Switch`                     |
| ---------------------- | -------------------------------------- | ---------------------------- |
| Takes effect           | On submit                              | Immediately                  |
| Needs a Save button    | Yes                                    | No                           |
| Typical home           | Form, list selection, terms acceptance | Settings row, feature toggle |
| Supports indeterminate | Yes                                    | No                           |

**Incorrect** — a settings toggle that saves instantly, built as a checkbox:

```tsx
<Checkbox checked={muted} onCheckedChange={saveImmediately} />
```

**Correct:**

```tsx
<Switch checked={muted} onCheckedChange={saveImmediately} />
```

If the user would be surprised that nothing needs saving, use `Switch`. If they would be surprised that it saved already, use `Checkbox`.

`Checkbox` sizes are `sm` `md` `lg`. `Switch` sizes are `sm` `md` only — there is no `lg` switch.

---

## Combobox vs Select

Reach for `Combobox` when any of these is true:

- More than roughly 10 options.
- The user knows the value and would rather type it.
- More than one value can be selected.
- Options are grouped and the list would be long to scan.

`Combobox` owns the multi-select story through `ComboboxChips`, `ComboboxChip`, and `ComboboxChipRemove`. Do not build multi-select on `Select`.

`Combobox` also provides `ComboboxEmpty` for the no-match state — render it, otherwise a search that matches nothing shows a blank popup.

`Select` provides `SelectGroup` + `SelectGroupLabel` for grouping, and `SelectScrollUpArrow` / `SelectScrollDownArrow` for long lists.

Use `PickerTriggerButton` as the `render` target for compact filter-bar `SelectTrigger` or
`ComboboxTrigger` controls that need the shared picker treatment. Keep the normal trigger content
parts inside it; use the standard trigger rendering for full-width form fields.

```tsx
<SelectTrigger render={<PickerTriggerButton />}>
  <SelectValue />
  <SelectIcon />
</SelectTrigger>
```

---

## SegmentedControl vs RadioGroup vs Tabs vs ToggleGroup

All four render a row of choices. They differ in what the choice does.

| Component          | The choice…                                         |
| ------------------ | --------------------------------------------------- |
| `RadioGroup`       | is an answer to a question, submitted with the form |
| `SegmentedControl` | changes a view, filter, or mode, in place           |
| `Tabs`             | swaps which panel of content is visible             |
| `ToggleGroup`      | toggles one or more independent options             |

`Tabs` implies panels. If there are no panels — you are only filtering a list that stays in place — use `SegmentedControl`.

`Tabs` variants are `default` and `underline`. Use `TabsIndicator` and `TabsBackground` for the moving marker rather than animating a border yourself. For reorderable tabs use `SortableTabsList` / `SortableTabsTab` with the `useOrderedTabs` hook.

---

## Input vs InputGroup vs Textarea

- `Input` — a bare single-line control.
- `InputGroup` — when the control needs an attached prefix, suffix, icon, or button. Compose `InputGroupAddon` + `InputGroupInput`. On `InputGroupAddon`, `align` is `inline-start` or `inline-end`; `variant` is `default` or `container`.
- `Textarea` — multi-line. Pair with `TextareaGroup` and `TextareaCounter` when there is a character limit. Give the counter `value` (or `count`) and `limit`; it computes and styles the over-limit state itself.

**Incorrect** — faking an addon with absolute positioning:

```tsx
<div className="relative">
  <Input className="pl-8" />
  <SearchIcon className="absolute left-2 top-2" />
</div>
```

**Correct:**

```tsx
<InputGroup>
  <InputGroupAddon>
    <SearchIcon />
  </InputGroupAddon>
  <InputGroupInput placeholder="Search" />
</InputGroup>
```

---

## Use Field when the field contract applies

Default to `Field` when a raft-ui control has a visible label, description, required marker, or validation message. It wires those parts together. A simple native label/control pair may remain native when it needs none of that shared treatment; icon-only or compact toolbar controls may instead use an explicit accessible name. Do not add `Field` only to satisfy a wrapper rule.

```tsx
const emailError = getEmailError(email);

<Field invalid={Boolean(emailError)}>
  <FieldLabel htmlFor="work-email">Email</FieldLabel>
  <Input
    id="work-email"
    type="email"
    data-invalid={Boolean(emailError)}
    value={email}
    onChange={(event) => setEmail(event.currentTarget.value)}
  />
  <FieldDescription>Use your work email.</FieldDescription>
  <FieldError match={Boolean(emailError)}>{emailError}</FieldError>
</Field>;
```

- For externally controlled validation, bind `Field invalid`, the control's `data-invalid` (mirrored to `aria-invalid`), and `FieldError match` to the same error condition. A bare `match` means “always show”; use it only for a deliberately static invalid-state example. Without `match`, `FieldError` follows native, custom `validate`, or enclosing `Form` errors.
- Do not hand-roll an error paragraph; `FieldError` owns the error semantics and styling.
- `FieldItem` is for horizontal label/control rows (settings lists).
- `FieldValidity` exposes raw validity when you need to drive something custom.
- `FieldControl` is the Base UI input part. Use it when you need that primitive directly; `Input`, `Checkbox`, `Select`, and other Base UI controls already integrate with `Field` and do not need a `FieldControl` wrapper.
- `FieldLabel` and standalone `Label` take `size` of `sm` or `md`; `Field` itself has no `size` prop. Keep label sizes consistent within a form.

Standalone `Label` exists for cases outside a field (a section caption above a group). It composes `LabelAsterisk` for required, `LabelOptional` for optional, and `LabelSub` for secondary text — do not type "(optional)" into the label string.

---

## Per-component norms

**`Select`** — compose `SelectValue` and `SelectIcon` inside `SelectTrigger`. Use `PickerTriggerButton` through `render` for compact picker controls. Put `SelectList` and its items inside `SelectContent`; `SelectContent` owns portal and positioning. Items take `SelectItemText` and, when selected state should be visible, `SelectItemIndicator`. `SelectItemLeading` holds an icon.

**`Combobox`** — put `ComboboxInput` in `ComboboxControl` when the searchable field is the anchor control. Use `ComboboxInputGroup` for a search row inside `ComboboxContent`, such as a trigger-led filter popup, and `PickerTriggerButton` through `render` when that popup is opened from a compact filter control. Provide `ComboboxClear` when a value can be cleared. `ComboboxRow` is for grid-style option layouts.

**`RadioGroup`** — each `RadioGroupItem` needs a `RadioGroupIndicator`.

**`Checkbox`** — has both `variant` and `color`, each `default` / `primary`.

**`SegmentedControl`** — compose `SegmentedControlItem` with `SegmentedControlLabel`, and `SegmentedControlCount` when an option carries a number. Do not put a count in the label string.

**`Switch`** — always render `SwitchThumb`.
