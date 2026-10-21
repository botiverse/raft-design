---
title: Actions and closing
summary: How many actions a dialog, a banner and a toast carry, which color and order each takes, how each one closes and whether that is remembered, and which icon or pixel leads a banner or a toast.
---

# Actions and closing

The longer a surface stays and the more it asks, the more actions it may carry. A dialog asks for a decision, so it has the decision's two answers: Cancel and one commit button, which may be pink. A banner stays on the page while people do something else, so it offers at most one way out, in ink. A toast is gone in seconds, so it carries at most one text action, and only as a shortcut to something people can also reach another way. How each one closes follows the same logic: Cancel abandons a task, × closes something that asks nothing, and a toast closes itself.

## When it applies

Every [Dialog](../../packages/ui/src/components/dialog/dialog.md), [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md), dialog sheet on a phone, [Banner](../../packages/ui/src/components/banner/banner.md), `PanelNotice` ([Panel](../../packages/ui/src/components/panel/panel.md)) and [Toast](../../packages/ui/src/components/toast/toast.md), in every Raft product. Which of them carries a given message is in [Feedback](./feedback.md); a [Drawer](../../packages/ui/src/components/drawer/drawer.md) footer follows the dialog rules below, and the notification center has its own rules in [NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md).

## Structure

| Surface | Actions | Way out | Leads with |
| --- | --- | --- | --- |
| Confirmation (AlertDialog, or a Dialog that confirms) | Cancel and 1 commit button | Cancel and Esc; no × | Nothing; a red [Banner](../../packages/ui/src/components/banner/banner.md) in the body when it cannot be undone |
| Dialog with a task: a form, a picker, steps | Cancel and 1 commit button | × in the header, Cancel and Esc | Nothing |
| Dialog that offers something or is only read: an upgrade, What's New, release notes | 1 commit button or none, and at most 1 text link | × in the header and Esc | Nothing |
| Banner | At most 1 button, and at most 1 text link in the sentence | × at the end of the first line, only for a banner that informs | The intent's icon |
| `PanelNotice` | At most 1 icon button and 1 text action | × in the actions, when the person can dismiss it | A status pixel |
| Toast | At most 1 text action | Closes by itself; swipe; Esc when focused | A status pixel, or the avatar of who did it |

## Rules

### Dialog footers

- Put at most 2 buttons in the footer: Cancel and the commit button. A choice between 3 commits is 2 dialogs or a form with a control in it, not 3 buttons. The one exception is the unsaved-changes alert: Discard (`warning`) at the start, then Keep Editing and Save at the end, as on Apple platforms.
- Align the buttons to the end, Cancel first and the commit button last: the commit button sits where the eye ends, bottom right on a desktop, as in Apple's alerts and sheets and in Material dialogs.
- Make Cancel frameless (`variant="ghost"`) and `size="lg"`, like the commit button ([Button](../../packages/ui/src/components/button/button.md#which-color)).
- Color the commit button by what it does ([AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md#variants)): pink (`variant="primary"`) when it does what the dialog exists for, orange (`warning`) when it interrupts, red (`danger`) only when it cannot be undone. Write `primary`, not `accent`: they look the same, and one name keeps a search for the screen's pink button complete.
- Count the dialog as the screen while it is open: its pink button is the one pink button on the screen, whatever the page behind the scrim shows ([Color](../foundations/color.md#meanings-of-color)).
- Make a button that only closes the dialog (OK, Got It, Done after a result) ink (`variant="default"`), never pink: nothing is left to do, and pink means something waits for the person.
- When a dialog has a second action that doesn't close it, such as View beside Done, make it `default` and put it before the closing button.
- Label Cancel "Cancel". Name what stays instead (Keep Subscription, Keep Migrating) only when the action is itself a cancel or a stop, where "Cancel" would read as the action ([Writing](../content/writing.md#actions-and-their-dialogs)). Never label it Continue or OK: those read as the commit.
- Put a text link that leads elsewhere (Learn About Pricing, What Changed) at the start of the footer, as a muted [TextLink](../../packages/ui/src/components/text-link/text-link.md). Give a footer at most one, and never make it an action that changes anything: a link sits where people don't look first, so it must be safe to miss.
- Build the footer from `DialogFooter`, `AlertDialogFooter` or `DrawerFooter`, never from a row of your own: the part holds the spacing, the order and the phone layout.

### Cancel and the close button

- Give a confirmation Cancel and no ×. A confirmation is a question with two answers, and a × is a third way out that looks like neither: Apple's alerts and Material's dialogs have no close box for the same reason.
- Give every other dialog a × at the end of its header (`DialogClose`), placed by the header's edge rule ([Alignment](../foundations/alignment.md#the-ends-of-a-header)). Never place a × by hand with `absolute` positioning: it lands on the button's edge, not the icon box.
- Leave out Cancel only in a dialog that offers something or is only read, where leaving loses nothing: an upgrade, an announcement, an app's details. Then the × is required, and it is the only way out besides Esc.
- Never leave out Cancel in a confirmation or a form on a desktop: a form's Cancel says that leaving throws the input away.
- Close a small dialog on a click on the scrim only when it holds nothing typed. A form, a picker and a dialog with steps don't close on the scrim (`disablePointerDismissal`), and they ask before closing when something has been typed ([Dialog](../../packages/ui/src/components/dialog/dialog.md#behavior)).

### Confirmations that cannot be undone

- Make the commit button red, repeat the verb in it (Delete Agent), and say what is lost in a red banner (`status="destructive"`) in the body ([Feedback](./feedback.md#confirming)).
- Put the first focus on Cancel, so a stray Return doesn't delete.
- Put a field that asks for the name to be typed under the banner, not inside it: the banner says what happens, the field is the person's answer ([Forms](./forms.md#danger-zone)).
- Use the same color for the same verb everywhere: Disconnect is orange when it can be reconnected, everywhere; Discard is orange, because the draft was never saved.

### The upgrade dialog

When a person on a Free plan reaches a limit (history, uploads, hosting, a feature that needs Pro), every Upgrade entry point opens one upgrade dialog in place, instead of sending them to billing. It departs from the general dialog rules in 3 ways, and only it may:

- **It uses the onboarding Pro step's frame and offer.** It is the same offer people saw while setting up the server, so it looks the same, rather than a second design of the same plan. Raft Chat builds it from the onboarding step frame (`SetupStepFrame` in slock) inside a raft-ui `Dialog`.
- **Its title names what the person was trying to do, not the button's words:** "See your whole chat history", not Upgrade to Pro. It opens from many different Upgrade buttons and links, so the button's words say nothing about why it opened; the limit does. Its first highlighted benefit follows the same limit.
- **Its footer is a muted `TextLink` at the start (Learn About Pricing) and one pink button at the end, with no Cancel.** Leaving loses nothing, and the × in the header closes it ([Cancel and the close button](#cancel-and-the-close-button)). People who can pay see Upgrade to Pro; people who can't see the message to an owner and Send to the owner's name. Both are `variant="primary"`.

Everything else follows the general rules: a `DialogClose` ×, Esc closes it, a click on the scrim doesn't (`disablePointerDismissal`), because it holds a plan, seats or a message being written, and on a phone it is a sheet ([Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)).

These exceptions apply only to a dialog that offers a paid plan after a limit was reached, opened from more than one entry point. A dialog opened from one button keeps that button's words as its title; a dialog that changes or deletes something keeps Cancel; and no other dialog reuses an onboarding frame.

### On a phone

- In a centered dialog below 768px, stack the buttons full width, the commit button on top and Cancel under it, so Cancel is the button nearest the bottom edge, as in iOS alerts and Material's stacked buttons. A footer link goes last, centered. `DialogFooter` doesn't stack yet; until it does, this is the rule its change follows.
- In a dialog sheet, the commit button moves into the head at `size="sm"` and × is Cancel ([Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)).

### Banners

- Give a banner at most 1 button, `variant="default"`: it is a way out of what the banner says (Retry, Reconnect, Enable), not the screen's action. Never make it pink, orange or red: a banner is not where people commit.
- Put a second way out in the sentence as a `TextLink variant="strong"` (View Billing), never as a second button.
- Ask for consent (cookies) with 2 equal `default` buttons, Reject first and Accept last. It is the only banner with 2 buttons: a choice between two answers needs both, at the same weight.
- Don't let a banner that reports a problem or a limit be dismissed: it goes when the cause does. A banner inside a dialog or a form is part of the content and has no × either.
- Give a banner that only informs or suggests (a new version, turning on notifications, a tip) a ×.
- Put the × at the end of the banner's first line (raft-ui has no part for it yet), on the line's center, as a frameless icon button whose icon box ends on the banner's padding: the header's edge rule, at the banner's scale ([Alignment](../foundations/alignment.md#the-ends-of-a-header)). Never put it in the button row under the text, where it reads as one of the actions.
- Remember a dismissal until the situation changes (a new version, a new limit), at least per person and server on the device: a banner that comes back after a reload teaches people that × doesn't work. Don't keep it only in memory or for the session ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md#behavior) follows the same rule).

### Toasts

- Give a toast at most 1 action, a text action (`ToastAction`): View, Undo or Retry. Never a button, never pink ([Toast](../../packages/ui/src/components/toast/toast.md#rules)).
- Only put an action in a toast that people can also reach another way: the message is in the conversation, the agent is in the list, the setting can be changed back. A toast disappears, so it may only shorten a way, never be the only one.
- Keep a toast without an action 5 seconds and a toast with an action 8 seconds, so there is time to read the sentence and then act. Hovering or focusing it pauses the timer. `ToastProvider` uses 5 seconds for both today; pass `timeout` on a toast with an action.
- Don't show Dismiss on a toast that closes by itself: it closes, swipes away, and closes with Esc when focused, and a second text action beside View reads as a second choice. Show it only on a toast that waits (`timeout={0}`), such as a long upload. The `toast` command API shows it unless `dismissible: false` is passed; its default is to change with this rule.
- Let people swipe a toast away on a phone, in the direction it came from, and never make the swipe the only way: it also times out.
- Show one toast at a time. A new one replaces the one on screen.

### Icons and pixels

An icon says the intent of a message; a pixel says the state of a thing; an avatar says who.

| Surface | Leads with |
| --- | --- |
| Banner with a title or a button | The intent's icon |
| Banner of one line, without a title or a button | The intent's icon, or nothing |
| `PanelNotice` | The status pixel of what failed |
| Toast | The intent's pixel; the avatar of the person or agent it is about |

| Intent | Banner tint and icon | Toast pixel |
| --- | --- | --- |
| Information, a limit | `info`, `Info` | `info`, cyan |
| Done, saved | `success`, `CircleCheck` | `success`, lime |
| A problem, an error, a warning | `warning`, `TriangleAlert` | `warning`, orange |
| Cannot be undone | `destructive`, `OctagonAlert` | None: a toast reports something that already happened |

- Use the intent's icon from the table, and only that one. An `info` banner may use the icon of its subject instead (`Bell` for notifications), because `Info` says nothing the tint doesn't.
- Size the banner icon by the banner: 20px at `md` and `lg`, 16px at `sm` ([Iconography](../foundations/iconography.md#sizes)). Don't pass a size of your own.
- Center the icon or the pixel on the first line of text, not on the block, so it stays on the title when the text wraps ([Alignment](../foundations/alignment.md)). `Banner` and `ToastIcon` do this; don't add margins.
- Lead every toast with a pixel or an avatar, so a toast reads the same everywhere. Never use red in a toast.
- Show an avatar in `ToastIcon` when a person or an agent did what the toast reports ([Toast](../../packages/ui/src/components/toast/toast.md#variants)).
- Don't put a pixel in a banner: a pixel belongs to a thing, and a banner is about a situation. A problem with one thing in a panel is a `PanelNotice`, which has the pixel.

## Wide and narrow

| Width | Dialog footer | Banner | Toast |
| --- | --- | --- | --- |
| Below 768px | Stacked full width, commit on top; a sheet moves the commit into its head | The same; the × stays on the first line | Bottom center; swipe down to close |
| 768px and up | One row at the end, Cancel then commit; a link at the start | The same | Bottom center; hover pauses it |

## Related

- [Feedback](./feedback.md): which surface carries a message.
- [Button](../../packages/ui/src/components/button/button.md#which-color): the colors and their order of weight.
- [Writing](../content/writing.md#actions-and-their-dialogs): button labels and dialog titles.
- [Alignment](../foundations/alignment.md#the-ends-of-a-header): where a × sits.
