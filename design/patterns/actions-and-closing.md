---
title: Actions and closing
summary: When an action belongs in a dialog, a banner or a toast, how each one closes, and why a screen has at most one pink button; the specifics are in each component's doc.
---

# Actions and closing

The more a surface asks of people, the more actions it carries and the more deliberately it closes. A dialog asks for a decision, so it has the decision's answers and stays until people give one. A banner stays beside the work while people do something else, so it offers at most one way forward, never the screen's main one. A toast is gone in seconds, so it carries at most one text action, and only as a shortcut. This page says which one to reach for; each component's doc has its parts, sizes and layout.

## When it applies

Every [Dialog](../../packages/ui/src/components/dialog/dialog.md), [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md), [Banner](../../packages/ui/src/components/banner/banner.md) and [Toast](../../packages/ui/src/components/toast/toast.md) that carries an action, in every Raft product. Which surface carries a message with no action, and where an error goes by its scope, is in [Feedback](./feedback.md); a [Drawer](../../packages/ui/src/components/drawer/drawer.md), a `PanelNotice` ([Panel](../../packages/ui/src/components/panel/panel.md)) and the [NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md) follow their own docs.

## Choosing the surface

| The action | Use | Its actions |
| --- | --- | --- |
| People must decide or finish something before they go on: a few fields, a choice, a confirmation | [Dialog](../../packages/ui/src/components/dialog/dialog.md), or [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md) to confirm something that interrupts or can't be undone | Cancel and one commit button |
| A next step for something people need to read before they act, inside a dialog or a form | [Banner](../../packages/ui/src/components/banner/banner.md) | At most one ink-bordered button, plus Dismiss when it can be dismissed |
| A shortcut after something the person just did: View, Undo | [Toast](../../packages/ui/src/components/toast/toast.md) | At most one text action |
| An action people can reverse in the same place | No surface: do it ([Feedback](./feedback.md#confirming)) | None |

- Ask with a dialog only when the action can't be put back from where it happened ([Feedback](./feedback.md#confirming)). A question before an action that is one click to undo only slows people down.
- Never make a toast's action the only way to reach something: the toast goes away by itself, so the same action must also be reachable where the thing lives.
- Never put a decision in a banner or a toast: a banner's button is never the screen's main action, and a toast is gone before people could weigh one.

## How each one closes

| Surface | Closes by | Details |
| --- | --- | --- |
| Dialog | Cancel, the × in its header, Esc; a click on the scrim closes a small centered dialog | [Behavior](../../packages/ui/src/components/dialog/dialog.md#behavior) |
| Dialog as a sheet on a phone | × at the start of its head (Back from the second step of a flow), Esc; not the scrim | [On a phone](../../packages/ui/src/components/dialog/dialog.md#on-a-phone) |
| AlertDialog | Cancel and Esc | [Behavior](../../packages/ui/src/components/alert-dialog/alert-dialog.md#behavior) |
| Banner | It stays while it applies. One that can be dismissed has Dismiss before its button, or a × (`BannerClose`) when it has no button | [Anatomy](../../packages/ui/src/components/banner/banner.md#anatomy) |
| Toast | By itself after a few seconds; people can also swipe it away | [Behavior](../../packages/ui/src/components/toast/toast.md#behavior) |

- In a dialog footer Cancel comes first, as a ghost button, and the commit button last. The row stays one row on a phone too, and stacks only when it doesn't fit, the commit button on top and Cancel framed ([The footer](../../packages/ui/src/components/dialog/dialog.md#the-footer)).
- Label the button that closes without acting Cancel, and the commit button with its verb ([Writing](../content/writing.md#actions-and-their-dialogs)).
- A toast's timing, where toasts appear and whether a toast shows a close action of its own are in [Toast](../../packages/ui/src/components/toast/toast.md#behavior), which owns them.

## One pink button

Pink marks the one thing the screen exists for, so a screen has at most one pink button, and may have none ([Button](../../packages/ui/src/components/button/button.md#which-color), [Color](../foundations/color.md#meanings-of-color)).

- While a dialog is open it is the screen: its commit button is the one pink button, whatever the page behind the scrim shows. A dialog that is only read keeps one pink button, which closes it ([The footer](../../packages/ui/src/components/dialog/dialog.md#the-footer)).
- Color a commit button by its consequence instead when it interrupts (orange) or can't be undone (red) ([AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md#variants)).
- Never make a banner's button pink, orange or red: a banner is not where people commit ([Banner](../../packages/ui/src/components/banner/banner.md#rules)).
- Never put a button in a toast, pink or not: its action is a bold text action ([Toast](../../packages/ui/src/components/toast/toast.md#rules)).

## Not decided yet

These questions are open with cindyz. Until they are answered, follow the component docs as they stand and don't add a rule of your own:

- Whether a confirmation may have a × as well as Cancel. Today `AlertDialogClose` is optional ([AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md#anatomy)).
- Whether and for how long a dismissed banner stays dismissed, and which banners may sit across the top of the app.
- Whether an unsaved-changes warning may have a third button.

## Related

- [Feedback](./feedback.md): which surface carries a message, and where an error goes by its scope.
- [Choosing a component](../components/overview.md#telling-people-something): how long each kind of message stays.
- [Writing](../content/writing.md#actions-and-their-dialogs): the words on dialog buttons.
- [Forms and settings](./forms.md): the buttons of a form in a dialog.
