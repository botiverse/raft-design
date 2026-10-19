---
title: Forms and settings
summary: Settings that apply at once, groups of fields saved together, forms in dialogs, the large one-pass form dialog, validation and the danger zone.
---

# Forms and settings

A control that applies at once has no Save button. Fields that are edited together (a profile, a workspace's name and description) have their own Save at the end of their group. A form in a dialog has Cancel and the submit button in its footer. A large form filled in one pass, such as registering an app, opens as a wide dialog with a section list.

## When it applies

Settings pages, forms in dialogs and drawers, and large configuration forms. Which control to use for a value is in [Choosing a component](../components/overview.md#picking-something).

## Structure

### Fields

- Put the label above the field and the help text below it ([Field](../../packages/ui/src/components/field/field.md)).
- Mark optional fields "(optional)", and required fields with an asterisk.
- Reserve the line under a field for its help text or its error, so the form doesn't move when an error appears.
- Make a setting's description state the result, not repeat the title: the title already names the setting, and people read on to learn what it does.

```example
field/compositions/preview
```

### Settings that apply at once

- Use a switch, a segmented control or a picker for a setting that stands alone (the appearance, the font size, whether the public page is on), and apply each change as it happens. Don't add a Save button: the change already shows.

### Settings saved together

- Put fields that are edited together in one card, with Save at its end: a profile, a password, a workspace's name and description. Save applies only that card, so a half-edited card never saves another one.
- After a save, change the button to "Saved" with a check for a moment.
- Use a checkbox, not a switch, for a yes or no that is saved with its card, such as muting a workspace: a switch looks as if it already applied.

### Forms in a dialog

- Put Cancel and the submit button at the bottom of a form in a dialog. Cancel is a ghost button and comes first; the submit button is the screen's pink button and repeats the words that opened the dialog (Create Channel). Both are 44px ([0038](../decisions/0038-button-names-its-dialog.md)).
- Make a form with a few fields a small dialog, 448px wide: creating a channel, an agent or a task.

### The large form dialog

A large form filled in one pass, such as registering or editing an app, opens as the wide dialog ([Dialog](../../packages/ui/src/components/dialog/dialog.md), [0029](../decisions/0029-large-form-dialog.md)): centered, 896px wide, with a fixed height of 760px or the window less 32px, whichever is smaller. It doesn't go to a settings page or a drawer: a form with many fields has to be seen as one whole, not as a strip along the edge.

- Make the 56px header the item's logo, the title and ×. The title is the words that opened it (Register App), or Edit and the item's name when editing. Don't put the submit button in the header.
- Put a strip under the header for what must stay in view while the form scrolls: the form's error, or a secret shown once.
- Put a section list on the left, 208px wide, so people can jump around a long form (sidebar rows; the section being read is a yellow sticker and follows the scroll), and the sections on the right ([FormSection](../../packages/ui/src/components/form-section/form-section.md): a small heading, a status chip, one line of description, and a hairline between sections).
- Put Cancel first and the pink button last in the footer.
- Don't close the dialog when someone clicks outside it, so a stray click doesn't throw away a long form. ×, Esc and Cancel close it.
- Below 768px, leave out the section list.
- When creating, show only the sections that can be filled in before saving. Sections about an item that already exists (distribution, deletion) appear after it is saved.
- Write an action inside a section as an ordinary row, with the description on the left and the button on the right, not as a card inside a card.

## Rules

### Validation

- Check the fields when the form is submitted, not while people are still typing. A field whose value is wrong when the form opens shows its error at once.
- Show an invalid field with a `danger-strong` border, and put the error in its reserved line, saying how to fix it.
- Put a problem with the whole form, such as a failed request, in an orange banner inside the form ([Banner](../../packages/ui/src/components/banner/banner.md)). Don't repeat the field errors in it.
- Don't show a toast for a validation error: it disappears, and the error has a place of its own under the field.

### Danger zone

- Put the danger zone at the end of the page, away from the settings people change often.
- Use orange for actions that interrupt but can be undone (stop, leave, reset) and red for actions that cannot be undone (delete) ([Color](../foundations/color.md#meanings-of-color)).
- Ask for the workspace's address to be typed before deleting a workspace, because it deletes everything in it for everyone. Confirm other deletions with a dialog that names what is deleted ([Feedback](./feedback.md#confirming)).

### Prerequisites

- Don't show a form that can't be used yet. When something is missing, say what, and offer the way forward: connect a computer first, then create the agent.

## Related

- [Writing](../content/writing.md#actions-and-their-dialogs): titles and button labels.
- [Feedback](./feedback.md): where other errors go.
- [Input](../../packages/ui/src/components/input/input.md), [Switch](../../packages/ui/src/components/switch/switch.md), [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md), [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md), [Select](../../packages/ui/src/components/select/select.md).
