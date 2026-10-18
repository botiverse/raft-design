---
title: Forms and settings
summary: Settings that apply at once, forms that are saved, the large one-pass form dialog, validation and the danger zone.
---

# Forms and settings

A setting that applies at once has no Save button. A form that must be saved has Cancel and Save at its bottom. A large form filled in one pass (registering an app, configuring an agent) opens as a wide dialog instead of a settings page.

## When it applies

Settings pages, forms in dialogs and drawers, and large configuration forms. Which control to use for a value is in [Choosing a component](./choosing-components.md#picking-something).

## Structure

### Fields

- Put the label above the field and the help text below it ([Field](../../packages/ui/src/components/field/field.md)).
- Mark optional fields "(optional)".

```example
field/compositions/preview
```

### Settings that apply at once

- Use switches, radios and selects on a settings page, and save each change as it happens. Don't add a Save button.

### Forms that are saved

- Put Cancel and Save at the bottom of a form in a dialog or drawer. Save is the screen's pink button, and both buttons are 44px.
- Use a checkbox for yes or no in a saved form, not a switch.

### The large form dialog

A large form filled in one pass, such as registering or editing an app or configuring an agent, opens as the wide dialog ([Dialog](../../packages/ui/src/components/dialog/dialog.md)): centered, 896px wide, with a fixed height. It doesn't go to a settings page.

- Make the 56px header the item's sticker, the title and ×. The title is the words that opened it (Register App), or Edit and the item's name when editing. Don't put the submit button in the header.
- Put a section list on the left (sidebar rows; the section being read is a yellow sticker and follows the scroll) and the sections on the right ([FormSection](../../packages/ui/src/components/form-section/form-section.md): a small heading, a status chip, one line of description, and a hairline between sections).
- Put Cancel first and the pink button last in the footer.
- Don't close the dialog when someone clicks outside it. ×, Esc and Cancel close it.
- On a phone, make it nearly full screen, without the section list.
- When creating, show only the sections that can be filled in before saving. Sections about an item that already exists (sharing, publishing, keys, deletion) appear after it is saved.
- Write an action inside a section as an ordinary row, with the description on the left and the button on the right, not as a card inside a card.

## Rules

### Validation

- Check a field when focus leaves it or when the form is submitted.
- Show an invalid field with a `danger-strong` border, and rewrite its help text to say how to fix it.
- Don't show a toast for a validation error.

### Danger zone

- Put the danger zone at the end of the page.
- Use orange for actions that interrupt but can be undone (stop, leave, reset) and red for actions that cannot be undone (delete).
- Ask for the name to be typed before deleting something large, such as an agent or a workspace ([AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md)).

### Prerequisites

- Don't show a form that can't be used yet. When something is missing, say what, and offer the way forward: connect a computer first, then create the agent.

## Related

- [Writing](../foundations/writing.md#actions-and-their-dialogs): titles and button labels.
- [Feedback](./feedback.md): where other errors go.
- [Input](../../packages/ui/src/components/input/input.md), [Switch](../../packages/ui/src/components/switch/switch.md), [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md), [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md), [Select](../../packages/ui/src/components/select/select.md).
