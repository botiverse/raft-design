---
title: Actions and closing
summary: Which surface carries an action, a dialog, a banner or a toast, how each one closes, and why a screen has at most one pink button; the specifics are in each component's doc.
---

# Actions and closing

The more a surface asks of people, the more deliberately it closes. A dialog asks for a decision and stays until people give one. A banner stays beside the work and offers a way forward, never the screen's main one. A toast is gone in seconds, so its one action is only a shortcut. This page says which one to reach for; each component's doc owns its parts, layout and rules.

## When it applies

Every [Dialog](../../packages/ui/src/components/dialog/dialog.md), [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md), [Banner](../../packages/ui/src/components/banner/banner.md) and [Toast](../../packages/ui/src/components/toast/toast.md) that carries an action, in every Raft product. Which surface carries a message with no action, and where an error goes by its scope, is in [Feedback](./feedback.md); a [Drawer](../../packages/ui/src/components/drawer/drawer.md), a `PanelNotice` ([Panel](../../packages/ui/src/components/panel/panel.md)) and the [NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md) follow their own docs.

## Choosing the surface

| The action | Use |
| --- | --- |
| People must finish something before they go on: a few fields, a choice | [Dialog](../../packages/ui/src/components/dialog/dialog.md#when-to-use) |
| A confirmation | A [Dialog](../../packages/ui/src/components/dialog/dialog.md#variants) at `size="sm"`, titled as a question, its confirm button colored by the consequence: "Retract this message?" with Cancel and a red Retract message ([Identity and presence](../people-and-agents/identity-and-presence.md#sent-by-an-assistant)). [AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md) only where the product lists it ([Raft Chat](../products/raft-chat/README.md#overlays)) |
| A next step for something people read before they act, inside a dialog or a form | [Banner](../../packages/ui/src/components/banner/banner.md#when-to-use) |
| A shortcut after something the person just did: View, Undo | [Toast](../../packages/ui/src/components/toast/toast.md) |
| An action people can reverse in the same place | No surface: do it |

- Whether an action is confirmed, offered with Undo or done at once is decided by how far it reaches ([Feedback](./feedback.md#confirming)); the words on the buttons are in [Writing](../content/writing.md#actions-and-their-dialogs).
- Never make a toast's action the only way to reach something: the toast goes away by itself, so the same action must also be reachable where the thing lives.

## How each one closes

| Surface | In short | Owned by |
| --- | --- | --- |
| Dialog | Closes without acting by Cancel, × or Esc; a phone sheet has no Cancel | [Behavior](../../packages/ui/src/components/dialog/dialog.md#behavior), [On a phone](../../packages/ui/src/components/dialog/dialog.md#on-a-phone) |
| AlertDialog | Cancel and Esc | [Behavior](../../packages/ui/src/components/alert-dialog/alert-dialog.md#behavior) |
| Banner | Stays while it applies; one that can be dismissed has Dismiss or a × | [Anatomy](../../packages/ui/src/components/banner/banner.md#anatomy) |
| Toast | By itself after a few seconds | [Behavior](../../packages/ui/src/components/toast/toast.md#behavior) |

## One pink button

Pink marks the one thing the screen exists for, so a screen has at most one pink button, and may have none ([Button](../../packages/ui/src/components/button/button.md#which-color), [Color](../foundations/color.md#meanings-of-color)).

- While a dialog is open it is the screen: its commit button is the one pink button, unless the consequence colors it orange or red ([AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md#variants)).
- A banner's button is never pink ([Banner](../../packages/ui/src/components/banner/banner.md#rules)), and a toast has no button at all ([Toast](../../packages/ui/src/components/toast/toast.md#rules)).

## Not decided yet

These questions are open with cindyz. Until they are answered, follow the component docs as they stand and don't add a rule of your own:

- Whether a confirmation may have a × as well as Cancel. Today `DialogClose` and `AlertDialogClose` are optional.
- Whether and for how long a dismissed banner stays dismissed. Only the sign-up prompt on a public page remembers it ([Banner](../../packages/ui/src/components/banner/banner.md#the-sign-up-prompt-on-a-public-page)).
- Whether an unsaved-changes warning may have a third button. A dialog has at most two ([Dialog](../../packages/ui/src/components/dialog/dialog.md#rules)), while the channel details ask whether to keep editing, discard or save ([Channel](../products/raft-chat/channel.md#the-channel-details)).

## Related

- [Feedback](./feedback.md): which surface carries a message, and what is confirmed.
- [Choosing a component](../components/overview.md#overlays): which overlay fits which job.
- [Writing](../content/writing.md#actions-and-their-dialogs): the words on dialog buttons.
- [Forms and settings](./forms.md): the buttons of a form in a dialog.
