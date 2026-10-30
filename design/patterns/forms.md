---
title: Forms and settings
summary: When a change takes effect (at once, on Save or through a button that names it), settings that apply at once, groups of fields saved together, forms in dialogs, the large one-pass form dialog, validation, long values in fields, option height and the danger zone.
redirectFrom: [decisions/0029-large-form-dialog]
---

# Forms and settings

What a change is decides when it takes effect: a choice applies the moment it is made, text waits for Save, values that only work together share one Save, and a side effect that can't be taken back is a button that names it. A form in a dialog has Cancel and the submit button in its footer. A large form filled in one pass, such as registering an app, opens as a wide dialog with a section list.

## When it applies

Settings pages, forms in dialogs and drawers, and large configuration forms. Which control to use for a value is in [Choosing a component](../components/overview.md#picking-something).

## Structure

### Fields

- Put the label above the field and the help text below it ([Field](../../packages/ui/src/components/field/field.md)).
- Mark optional fields "(optional)", and required fields with an asterisk.
- Reserve the line under a field for its help text or its error, so the form doesn't move when an error appears.
- Make a setting's description state the result, not repeat the title: the title already names the setting, and people read on to learn what it does.
- Put a checkbox, a radio or a switch 8px before its label, centered on the label's first line, and at the end of a settings row centered on the whole row. raft-ui places it there (`FieldItem`, a checkbox's or radio's `<label>` row, `ListRow`); never nudge it with a margin ([Alignment](../foundations/alignment.md#a-control-and-its-label)). The switch stays 50 × 30 and the checkbox and radio 20px, on a phone and a desktop alike.

```example
field/compositions/preview
```

### When a change takes effect

Ask these in order; the first yes decides (stdrc, 2026-10-29). Each kind of change gets the commit it needs: a choice is complete when it is made, text only when people stop typing, grouped values are invalid halfway, and a side effect can't be taken back.

| If the change | It takes effect |
| --- | --- |
| Has a side effect that can't be taken back: it charges money, sends an email or a message, signs someone out, restarts or disconnects something, or makes an old link or key stop working | When people press a button that names the action: Upgrade, Send Invite, Restart, Rotate Secret. Not a switch and not Save |
| Is text: a name, a description, an address, a key | On Save, or Enter in a one-line field. Saving while people type would store a half-written value |
| Is one of several values that are only valid together: a new password and its confirmation, sending events and the address they go to | On one Save for the group ([Settings saved together](#settings-saved-together)). Creating something (a channel, an agent, a task) is this case: the dialog's submit button |
| Is anything else: a yes or no, or a choice, that stands alone | At once ([Settings that apply at once](#settings-that-apply-at-once)). Choosing a file, such as an avatar, is this case |

- Let how far a change reaches decide whether it is confirmed or can be undone, never whether it needs Save ([Feedback](./feedback.md#confirming)): Save explains nothing about what follows, a confirmation does. A checkbox and Save is not a confirmation.
- Apply filters, sorting and view switches at once, with no Apply button: they change only what the person sees.

### Settings that apply at once

- Use a switch, a segmented control or a select for a setting that stands alone (the appearance, the time zone, muting a server, whether the public page is on), and apply each change as it happens. Don't add a Save button: on one choice it adds a step and checks nothing. This holds when several such settings share a card: each one saves itself, and the card has no Save.
- Show the result under the setting's control: "Saved" for a moment once it is stored. When it fails, put the control back to its old value and say what failed in the same place, so a control never shows a value that isn't true.
- Put the result on a line of its own 4px under the control, the same for a select, a segmented control and a settings row with a switch, where it goes under the description: one distance reads as one kind of line on every setting (stdrc, 2026-10-30).
- Keep that line's height when it is empty, so the card doesn't grow when "Saved" appears and shrink when it goes, and a switch centered on its row doesn't move (stdrc, 2026-10-30). raft-ui draws this line ([SaveStatus](../../packages/ui/src/components/save-status/save-status.md)).

```example
save-status/compositions/preview
```

### Settings saved together

- Put fields that are edited together in one card: a profile, a password, a server's name and description. Put Save under the fields, at the start of the line, before any other button of the card. Save applies only that card, so a half-edited card never saves another one.
- After a save, change the button to "Saved" with a check for a moment.
- Turn on a feature that needs its configuration before it can be on (sending events to an app, which needs an address; asking new members to accept an agreement, which needs its text) with a checkbox, its fields under it and one Save for the group. Don't use a switch that only reveals the fields: a switch that shows on while nothing is on says something untrue.

### Forms in a dialog

- Put Cancel and the submit button at the bottom of a form in a dialog. Cancel is a ghost button there, framed when the buttons stack full width ([Dialog](../../packages/ui/src/components/dialog/dialog.md#the-footer)), and takes an ink border on a page ([Button](../../packages/ui/src/components/button/button.md#which-color)). Cancel comes first; the submit button is the screen's pink button and names the action it performs, usually the title's verb: Create in Create Channel; an Edit title's button is Save ([Writing](../content/writing.md#actions-and-their-dialogs)). Both are `size="lg"`, the height of the fields above them ([Spacing](../foundations/spacing.md#heights)).
- Offer public or private, and any other answer whose result needs saying, as a radio group with one line under each answer: "Anyone in the server can find and join it", "Only people invited can see it". The line puts the result next to the choice, which a segmented control has no room for ([RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md)).
- When one section of a dialog or a drawer saves on its own, because the rest applies at once (a channel's name and description among its switches), put its Save under the section's fields at the start of the line, Save first, as on a settings page. At the end of the footer it would read as saving the whole dialog.
- Make a form with a few fields a small dialog, the default `size="md"`, 448px wide: creating a channel, an agent or a task. A form whose content needs more width, such as key-value rows or a command, takes `size="lg"`, 640px ([Dialog](../../packages/ui/src/components/dialog/dialog.md#variants)).

### The large form dialog

A large form filled in one pass, such as registering or editing an app, opens as the wide dialog ([Dialog](../../packages/ui/src/components/dialog/dialog.md)): centered, 896px wide, with a fixed height of 760px or the window less 32px, whichever is smaller. It doesn't go to a settings page or a drawer: a form with many fields has to be seen as one whole, not as a strip along the edge.

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

### Long values in fields

A value can be any length: a pasted link with no spaces, a long Chinese name, a label translated into long words. Nothing in a form grows wider than its field, and no field grows wider than its dialog, its drawer or the screen, down to 320px ([Responsive layout](./responsive.md#phone)). What gives way depends on whether the part is one line by design.

- **A label, help text or error wraps**, breaking inside a word when the word alone is wider than the line. It's what explains the field, so cutting it off would hide the part people need. This holds for the label beside a checkbox, a radio or a switch too.
- **A value in a one-line control truncates** with an ellipsis: the selected value of a Select, a chip, a text prefix. The control keeps its height, so the form doesn't move as values change ([Spacing](../foundations/spacing.md#heights)). The whole value is the part's `title` while it is cut off, and stays its accessible name.
- **A value people type scrolls inside its field.** An Input keeps its text on one line and scrolls it; a Textarea wraps it.
- **An option in a list wraps to two lines, then truncates**, with its whole text as the `title`. Two lines let people tell apart two long values that begin the same way, which one line can't do, while every option stays short enough to scan. The selected value in the trigger is still one line.
- **A chip truncates** at the width of its field, and its remove button stays visible at its end.
- **A text prefix in an InputGroup takes at most half the field**, and truncates past that, so there is always room to type.
- **A list is never wider than the screen less 8px on each side.** It is at least as wide as its field and at least 220px. A Select's or a Combobox's list grows to fit a longer option up to 24rem (or the field's width, when that is wider); a ComboboxSelect's list stays the field's width. Past that, the option wraps.

Every control holds these rules itself, so a form never adds its own `min-w-0` or `truncate`. A control that truncates a value gets its `title` from `useOverflowTitle` ([`use-overflow-title.ts`](../../packages/ui/src/lib/use-overflow-title.ts)), which sets it only while the value is cut off. Give the hook a stable ref, a ref object or a memoized callback: an inline callback ref rebuilds its observers on every render. A layout that puts a field in a flex row still gives the field's column `min-w-0`, since a flex item won't shrink below its content without it.

### Option height

An option's height follows its content, and its padding is constant. This holds for every row in a popup list: an option of a Select, a Combobox or a ComboboxSelect, and an item of a DropdownMenu or a ContextMenu, with a check mark, a radio mark or neither.

- **One line is 36px, with a mouse and on a touch screen.** The rows of a popup list are the one exception to 44px touch targets: they touch each other, so their hit area can't grow past the row, and a full-width row is easy to hit and a wrong tap is easy to see and change ([Spacing](../foundations/spacing.md#hit-targets)). The space above and below the text is what that row leaves around one line of the option's type: 7px around a desktop's 22px line, 8px around a touch screen's 20px line.
- **A second line adds its own height and nothing else**, whether the label wraps ([Long values in fields](#long-values-in-fields)) or a description sits under it. The space above and below stays the one-line option's, so a two-line option looks as loose as its neighbors instead of cramped, and two of them never touch.
- **A list never sets its options' height.** Options in one list may differ in height; they never differ in padding. Don't give an option a fixed height, a fixed line box or `leading-none`, and don't give a list a fixed row size: one line would fit and the second would be cut off or squeezed. A list that only shows some of its options at a time measures each one.
- **A part beside the text fits the line**: a 16px icon, a check mark, a count. It doesn't make a one-line option taller.
- **The highlight sits 4px inside the popup**, with `radius-chip`: that close to the popup's edge it follows the popup's corner, so the space around it is even at the corner as along the sides. A separator leaves the same 4px above and below it ([Shape](../foundations/shape.md#inside-a-frame)).

```example
select/compositions/option-height
```

The components hold this themselves (`py-option-inset`, the space a 36px row leaves around one line, with `min-h-option` as the floor for an option with no line of text), so a product never pads an option of its own. The menus no longer tighten to `py-1` on a short window (600px tall or less): a one-line item kept its 36px floor there anyway, so the change only squeezed items of two lines, and a short screen, such as a phone held sideways, may now scroll a menu a little more.

### Danger zone

- Put the danger zone at the end of the page, away from the settings people change often.
- Use orange for actions that interrupt but can be undone (stop, leave, reset) and red for actions that cannot be undone (delete) ([Color](../foundations/color.md#meanings-of-color)).
- Ask for the server's address to be typed before deleting a server, because it deletes everything in it for everyone. Confirm other deletions with a dialog that names what is deleted ([Feedback](./feedback.md#confirming)).

### Prerequisites

- Don't show a form that can't be used yet. When something is missing, say what, and offer the way forward: connect a computer first, then create the agent.

## Related

- [Writing](../content/writing.md#actions-and-their-dialogs): titles and button labels.
- [Feedback](./feedback.md): where other errors go.
- [Input](../../packages/ui/src/components/input/input.md), [Switch](../../packages/ui/src/components/switch/switch.md), [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md), [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md), [Select](../../packages/ui/src/components/select/select.md).
