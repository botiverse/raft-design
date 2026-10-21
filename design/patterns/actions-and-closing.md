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
| Banner | At most 1 button, and at most 1 text link in the sentence; consent has 2 | Only an informational banner: a Dismiss text button before its button, or × when it has no button. A problem, a required action or a limit goes when its cause does | The intent's icon |
| `PanelNotice` | At most 1 icon button and 1 text action | × in the actions, when the person can dismiss it | A status pixel |
| Toast | At most 1 text action, which can also be reached another way | Closes by itself after 5 seconds, or 8 with an action or an error; swipe; Esc when focused | A status pixel, or the avatar of who did it |

## Rules

### Dialog footers

- Put at most 2 buttons in the footer: Cancel and the commit button. A choice between 3 commits is 2 dialogs or a form with a control in it, not 3 buttons. The one exception is the unsaved-changes alert: Discard (`warning`) at the start, then Keep Editing and Save at the end, as on Apple platforms.
- Align the buttons to the end, Cancel first and the commit button last: the commit button sits where the eye ends, bottom right on a desktop, as in Apple's alerts and sheets and in Material dialogs.
- Make Cancel frameless (`variant="ghost"`) and `size="lg"`, like the commit button ([Button](../../packages/ui/src/components/button/button.md#which-color)).
- Color the commit button by what it does ([AlertDialog](../../packages/ui/src/components/alert-dialog/alert-dialog.md#variants)): pink (`variant="primary"`) when it does what the dialog exists for, orange (`warning`) when it interrupts, red (`danger`) only when it cannot be undone. Write `primary`, not `accent`: they look the same, and one name keeps a search for the screen's pink button complete.
- Count the dialog as the screen while it is open: its pink button is the one pink button on the screen, whatever the page behind the scrim shows ([Color](../foundations/color.md#meanings-of-color)).
- Give every dialog exactly one main button, the last one in the footer, so there is always one obvious way forward. It is pink (`variant="primary"`), or colored by its consequence when it interrupts or can't be undone (`warning`, `danger`). This holds when the main button only closes the dialog (OK, Got It, Done after a result): with nothing else to do, closing is the way forward, and a dialog with no pink button reads as one that has lost its answer.
- When a dialog has a second action that doesn't close it, such as View beside Done, make it `default` and put it before the closing button.
- Label Cancel "Cancel". Name what stays instead (Keep Subscription, Keep Migrating) only when the action is itself a cancel or a stop, where "Cancel" would read as the action ([Writing](../content/writing.md#actions-and-their-dialogs)). Never label it Continue or OK: those read as the commit.
- The start of the footer holds at most one quiet item, never both: a text link that leads elsewhere (Learn About Pricing, What Changed) as a muted [TextLink](../../packages/ui/src/components/text-link/text-link.md), or one short note about what the commit will do ("You'll be billed $8 per member each month", "Its owner is notified"), in muted footnote text, which may itself contain that link. Keep the note to one line on a desktop and never put in it something people need to decide; that belongs in the body. Never make either an action that changes anything: the start of the footer is where people don't look first, so whatever sits there must be safe to miss.
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

- In a centered dialog below 768px, stack the buttons full width in reading order: Cancel (or the secondary ghost button) first and the commit button under it, so the commit is the button nearest the bottom edge and the thumb. With a note, the note comes first, left-aligned above the buttons, because it says what the commit will do and must be read before it. A footer link goes last, centered, under the commit button. The note keeps its muted footnote text and its start alignment; it is never centered, moved under the buttons or truncated. Only `lg` and `wide` dialogs have a footer note, and it is at most about 40 characters: on a desktop it never wraps, one short line beside the buttons; on a phone it may wrap to two lines. Anything longer belongs in the body, so the footer stays compact and the dialog's content keeps the screen.
- In a dialog sheet, the commit button moves into the head at `size="sm"` and × is Cancel ([Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)).

### Banners

A banner says what is true now and stays until that changes, or until the person says they've read it. What it may do depends on what it reports.

| Kind | Examples | Where it sits | Tint and icon | Its button (`variant="default"`) | How it closes | Goes away by itself |
| --- | --- | --- | --- | --- | --- | --- |
| System problem | Can't reach Raft, sync failing | Top of the app frame | `warning`, `TriangleAlert` | Retry Now when Raft retries by itself, Retry when it doesn't; none when there is nothing to do, as when the device is offline | Can't be dismissed | Yes, as soon as the cause clears. It appears only after the cause has lasted 5 seconds, so a short drop doesn't flash it |
| Required action | Verify your email; this version is no longer supported | Top of the app frame | `info` with the subject's icon (`Mail`); `warning` when something has already stopped working | The action, named: Resend Email, Update Raft | Can't be dismissed | Yes, when the action is done, in every open tab |
| Limit | History cut off in this channel; the agent limit on the agents page | Top of the page's content, under the page header | `info`, `Info` | Upgrade, which opens [the upgrade dialog](#the-upgrade-dialog); View Usage goes in the sentence as a link | Can't be dismissed where the limit blocks; the same limit in the notification center can be | Yes, when the limit is lifted |
| Informational | A new feature or a tip on this page, an announcement, turning on notifications, a new version | Top of the page's content | `info`, `Info` or the subject's icon | The next step: Show Me, Turn On, Reload | Dismiss (`variant="ghost"`) just before the button; × when there is no button | Only when it stops being true, such as when the new version is installed |
| Consent | Cookies | Bottom of the viewport, on public pages only, never inside the app | `info`, `Cookie` | Reject and Accept: 2 equal `default` buttons, Reject first; Cookie Settings is a link in the sentence | Answering it closes it; it has no × and no Dismiss | No |
| A problem in one panel | An agent won't start, a setting didn't save | `PanelNotice`, under the panel header | A status pixel, `warning` | A text button or an icon button: View Logs, Copy Details | × in its actions when it only reports something; none while the problem still blocks the panel | Yes, when the problem clears |
| Part of a dialog or a form | Who will see a shared channel, what a delete removes | In the content | By intent ([Icons and pixels](#icons-and-pixels)) | At most 1, as for every banner | It never closes; it belongs to the content | No |

- Keep the top of the app frame for what stops this device or this account from working: a system problem or a required action. The state of the server (a computer offline, a quota nearly full) goes in the [NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md), not in a strip across the app, so the top of the screen doesn't fill up with notices about things the person isn't doing.
- Give a banner at most 1 button, `variant="default"`: it is a way out of what the banner says, not the screen's action. Never make it pink, orange or red: a banner is not where people commit. A second way out goes in the sentence as a `TextLink variant="strong"` (View Usage), never as a second button. Consent is the only banner with 2 buttons: a choice between two answers needs both, at the same weight.
- Label the button with what it does, in Title Case: Retry, Resend Email, Update Raft, Upgrade, Show Me. Never OK, Got It or Learn More: those don't say what happens.
- Don't let a system problem, a required action or a limit be dismissed: each goes when its cause does. Close an informational banner that has a button with Dismiss, placed just before that button; the two are the banner's two answers, side by side in the same order as a dialog's Cancel and commit, as in Material's banners. Use × only on an informational banner with no button.

#### What a dismissal remembers

| Banner | Remembered for | Kept in | Comes back |
| --- | --- | --- | --- |
| About the product: a new feature, a tip, an announcement | The person's account, on every device | The account's settings; until those exist, local storage per person and server | Never for the same item. A new item has a new key, so it shows |
| About this device: notifications, installing the app, a new version | This device and this person | Local storage, per person and server | When the situation changes (a newer version); a suggestion such as turning on notifications comes back once, after 30 days, then never |
| Consent | This browser | The consent cookie | When the cookie policy changes, or after 12 months |

- Key every dismissal by what the banner is about (`new-version:2.14`, `tip:jump-to`), not by the banner's position, so a dismissal ends when the situation changes, as the notification center already does ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md#behavior)).
- Never keep a dismissal only in memory or for the session: a banner that comes back after a reload teaches people that Dismiss and × don't work.

#### How many, in what order

- Show at most one banner in each place: the app frame, the page, a panel, and the bottom of a public page. A phone shows at most 2 at once, the app frame's and the page's: a panel is a screen of its own there.
- When two banners want the same place, show the more severe and hold the other until it goes: a system problem, then a required action, then a limit, then an informational banner. Within one kind, the one shown first stays; banners never rotate or reshuffle while people read them.
- Every banner held back is still in the notification center, so nothing is lost while it waits.

#### Layout

- Put the button, and Dismiss before it, at the bottom right: at the end of the banner's last line, centered on it, when the text fits beside them. A one-line banner's last line is its first; a banner with a title and a sentence puts them beside the sentence, not the title, so the button comes after what it acts on and ends where the eye ends, as a dialog's commit button does. When the sentence wraps, or the banner is narrower than 480px (every phone), put them on a line of their own under the text, aligned to the end. Keep the × at the end of the first line in both cases, on the line's center, as a frameless icon button whose icon box ends on the banner's padding ([Alignment](../foundations/alignment.md#the-ends-of-a-header)). Never put the × in the button row, where it reads as one of the actions. raft-ui has no part for the × or for the end-of-line placement yet (`BannerClose`, and a `BannerAction` that can sit at the end); until it does, this is the rule those parts follow.
- Let a banner's text wrap; never truncate or clamp it, because the end of a sentence is often what to do. Write a banner at the top of the app frame as one sentence that fits on 2 lines at 390px (about 90 characters); write a page banner as a title and at most 2 sentences. Anything longer goes behind a link to where it is explained.
- Run a banner at the top of the app frame across the whole width of the window, above the sidebar and the header, with no radius and a `line-seam` under it, as a `PanelNotice` runs across a panel. It pushes the app down instead of covering it; on a phone it sits under the status bar and above the page header.
- Put a page banner under the page header, inside the page's margins, outside the scrolling content, so it doesn't scroll away while the condition lasts.

#### Keyboard and screen readers

- Use `role="status"` for every banner, so a banner that appears is announced without interrupting. Use `role="alert"` only for a system problem that appears while people are working (Can't reach Raft), passed on the `Banner`, and for a `destructive` banner, which `Banner` makes an alert itself.
- Never move focus to a banner when it appears or changes, and never let Esc close one: Esc belongs to what has focus.
- Keep the DOM in reading order: the icon, the title, the sentence with its link, Dismiss, the button, then the ×. Tab then reaches the link, Dismiss and the button in the order they're read, and the × last. Label the × "Dismiss" (`aria-label`).
- After Dismiss or ×, move focus to the next element that can take focus after where the banner was, or to the page's heading when there is none; never leave it on the document.

### Toasts

A toast is the receipt for what the person just did. It closes itself, so it may only ever shorten a way that exists elsewhere.

| Kind | Example | Leads with | Action | On screen | Announced |
| --- | --- | --- | --- | --- | --- |
| Confirmation | "Channel settings saved." | `success` pixel | None | 5 seconds | Politely |
| Undoable action | "Wug no longer follows this thread." Undo | `info` pixel | Undo | 8 seconds | Politely |
| Where something went | "Moved to #design." View | `success` pixel | View | 8 seconds | Politely |
| Error from a one-off action that has no place of its own | "Couldn't copy the link. Your browser blocked it." | `warning` pixel (`toast.error`), never red | Usually none; Retry only when it repeats the control people just used | 8 seconds, with or without an action | At once (`priority: "high"`, which `toast.error` sets) |
| Result of a long job, when the person has gone elsewhere | "report.pdf uploaded to #design." View | `success` or `warning` pixel | View | 8 seconds | Politely |
| Someone else's work that the person asked for | "Atlas finished reviewing #25." View | Their avatar | View, or none | 5 seconds; 8 with View | Politely |
| Progress | Uploading, migrating, an agent working | Not a toast | | | |

- Report an error in a toast only when it has no place of its own: a copy blocked by the browser, a link that is no longer available. When the failure has a place, put it there: a message that didn't send says so under the message with Retry; a form that didn't save, in a banner in the form; a panel that failed, in its `PanelNotice`; a server that is down, in a banner at the top of the app frame ([Feedback](./feedback.md#errors-by-scope)). A toast is gone in seconds, so it is never the only report of something that stays broken.
- Never show progress in a toast. Put it on the thing it belongs to: the attachment in the composer, the file's row, the agent's status ([Feedback](./feedback.md#progress)). When the job ends after the person has left the place, report the result in a toast with View; when they are still there, the thing itself shows the result and there is no toast. So Raft has no toast that waits (`timeout={0}`).
- Toast someone else's work only when it is the result of something this person asked for: the agent they gave the review to has finished. Anything else that happened elsewhere goes to [ActivityInbox](../../packages/ui/src/components/activity-inbox/activity-inbox.md).

#### Its action

- Only offer an action that people can also reach another way, and know which way before adding it: Undo has the reverse action in place (follow the thread again, move the message back), View has the destination in the navigation. When there is no other way, as with a delete that has no trash, don't offer Undo in a toast: confirm with a dialog first ([Feedback](./feedback.md#confirming)).
- Never put in a toast the only way to reach something, the only report of a failure that stays, or something people must read to decide. A toast can vanish before it is read, a screen reader can be busy, and a swipe closes it.
- When people press the action, close the toast. If the action waits for the server (an Undo that must be saved), show its loading state in place (`loadingLabel`) and close the toast when it is done. After Undo, show no second toast when the restored thing is visible where the person is; when it isn't, confirm with a 5-second toast ("Wug follows this thread again."). When Undo fails, say so in a toast that names where to do it by hand.
- While the device is offline, leave out an action that needs the network rather than offer one that will fail.

#### Timing, closing and arriving

- Pause the timer while the pointer is over the toast, while it or its action has focus, while a finger is on it, and while the window is in the background; resume with the time that was left. The time a toast stays is not a time limit on anything (WCAG 2.2.1): everything it offers can be reached another way, and it can be paused.
- Let people swipe a toast away on a phone, up, the way it came (`ToastRoot` swipes down or right while its viewport is at the bottom). Never make the swipe the only way: it also times out.
- Let F6 move focus to the newest toast and back to where it was; Tab reaches its action, and Esc closes it and returns focus. Esc with the focus elsewhere goes to what has focus: it closes a dialog, not a toast.
- Show one toast at a time. A new toast replaces the one on screen at once; toasts don't queue, because a toast answers the latest thing the person did, and one that arrives later answers something they've moved on from. A replaced Undo loses only its shortcut, never the way back. `ToastProvider` shows up to 3 today (`limit`); pass `limit={1}` until its default changes.
- Don't show Dismiss on a toast: every toast closes by itself, swipes away and closes with Esc, and a second text action beside Undo reads as a second choice. The `toast` command API shows it unless `dismissible: false` is passed; its default is to change with this rule.
- Write the title so it carries the whole meaning without the action, and don't mention the action in it ("Press Undo to restore"): a screen reader announces the toast once, politely, and an `error` toast at once.

#### Where it appears, and next to what

- Show toasts at the top, centered, just under the page's header, on every screen; on a phone under the app's top bar, clear of the system's notification area. The bottom of a Raft screen is the composer, the busiest place people act, and a toast there sits on top of what they are typing into; under the header it stays out of the way while the header itself (where am I, Back, Search) stays visible. A toast is never the only way to an action, so its Undo or View can be out of the thumb's reach: the same action is in place on the item. On a phone it swipes up to close. A toast about a specific control may open next to it instead ([Toast](../../packages/ui/src/components/toast/toast.md)).
- While a modal dialog or a sheet is open, show only the toasts it causes and that leave it open (Copy Link in a share dialog): above the scrim, at the bottom of the screen, without an action, since an action there would act on the page behind the dialog. Don't show other toasts while it is open (an agent's result, a job that finished); what they report has another way in, by the rule above. A toast caused by a commit that closes the dialog appears after the dialog has closed.
- Never let a toast cover a banner. When a banner sits at the top of the page or the app frame, the toast opens under it. Never toast what a banner already says, and don't close a toast because a banner appears.
- When the device is offline, say so once, in the banner at the top of the app frame. Show what waits on each thing, in place (Waiting to send); don't toast each action that couldn't go out. When the connection is back, the banner goes and the waiting things send; announce "Back online" politely, with no toast.

#### Where this comes from

- **Material 3** shows snackbars at the bottom, one at a time, with at most one action, and queues them rather than stacking them; Raft replaces instead, because a later toast answers a later action. Material's banners sit at the top of the content, stay until they are dismissed or their cause is resolved, and close with a Dismiss text button beside the action, which is where Raft's Dismiss comes from.
- **Apple's Human Interface Guidelines** have no toast: status is shown in place, and alerts are kept for what needs a decision. Raft follows the first half by keeping progress and lasting failures in place, and the second by never asking for a decision in a toast or a banner.
- **GOV.UK's notification banner** is one per page, at the top of the main content, not for errors that belong next to a field; its cookie banner gives Accept and Reject equal weight. Raft takes the one-per-place rule and the equal consent buttons. GOV.UK moves focus to a success banner after a form is sent; Raft doesn't, because its banners report states, not the result of a submission, which is a toast's.
- **WCAG 2.2.1, Timing Adjustable**, requires a way to turn off, adjust or extend a time limit. A toast meets it by having nothing that can only be done within its time, and by pausing while people point at it or focus it; 4.1.3, Status Messages, is why every banner and toast is a live region that doesn't take focus.

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
| Below 768px | Stacked full width: the note, then Cancel, then commit, then a link; a sheet moves the commit into its head | Button and Dismiss on their own line under the text, at the end; the × stays on the first line. At most 2 on screen: the app frame's and the page's | Top center, under the app's top bar; swipe up to close; a touch pauses it |
| 768px and up | One row at the end, Cancel then commit; a link or a note at the start | Button and Dismiss at the bottom right, at the end of the last line when the text fits beside them; the × on the first line | Top center, under the page header; hover and focus pause it |

## Related

- [Feedback](./feedback.md): which surface carries a message.
- [Button](../../packages/ui/src/components/button/button.md#which-color): the colors and their order of weight.
- [Writing](../content/writing.md#actions-and-their-dialogs): button labels and dialog titles.
- [Alignment](../foundations/alignment.md#the-ends-of-a-header): where a × sits.
