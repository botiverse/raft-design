---
title: Banner
summary: A soft-tinted notice inside a dialog or form that people read before they act, and, as PanelNotice, a full-width strip under a panel header when something in that panel failed.
status: stable
aliases: [Callout]
layer: core
category: feedback
related: [panel, toast, notification-center, alert-dialog, field]
---

# Banner

A banner is a short notice that people need to read before they act: who can see a shared channel, what a delete removes, a limit they are about to reach, or that something saved. It sits inside the content of a dialog or a form, on a soft tint that says its intent. When something in one panel goes wrong, the same notice runs as a strip under the panel header instead; see [Inside a panel](#inside-a-panel).

```example
banner/compositions/preview
```

## When to use

The wider the scope of a message, the further out it goes; the full table is in [Feedback](../../../../../design/patterns/feedback.md#errors-by-scope).

| Situation                                                                  | Use                                                                                                      |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| One input is invalid                                                       | The input's error ([Field](../field/field.md)), not a banner                                             |
| Something to know before acting in a dialog or a form                      | Banner, in the content                                                                                   |
| Something in one panel failed: an agent won't start, a setting didn't save | `PanelNotice`, under the panel header ([Panel](../panel/panel.md))                                       |
| The state of the whole server: a computer offline, a quota nearly full     | [NotificationCenter](../notification-center/notification-center.md), not a banner at the top of the page |
| The result of something the person just did                                | [Toast](../toast/toast.md)                                                                               |
| The person must decide now                                                 | [Dialog](../dialog/dialog.md) or [AlertDialog](../alert-dialog/alert-dialog.md)                          |

## Anatomy

- `Banner`: the tinted container. Required. It fills the width it is given and lays out its parts by that width, so give it a width (or let it fill its parent); never `w-fit`, which collapses it.
- An icon: the intent's Lucide icon ([Variants](#variants)) as a direct child, before the text. Banner sizes it 20px with 10px before the text (16px and 8px in a `sm` banner) and centers it on the first line ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)). Never a `Status` light: a status light shows the state of a thing (online or busy, a task's status, something needing attention), not which kind a notice is.
- `BannerTitle`: an optional bold first line.
- `BannerDescription`: the message. Required. An inline text action goes inside it as a `TextLink variant="strong"`, because it sits in a sentence ([TextLink](../text-link/text-link.md#variants)).
- `BannerAction`: the banner's button, and Dismiss before it when the banner has one. It sits at the bottom right: at the end of the last line of text, centered on that line, while the text fits beside it on one line. With a title and a description, that line is the description's. When the text would wrap beside it, or the banner is narrower than 480px, it takes a line of its own under the text, aligned to the end. `BannerAction` decides this itself; don't place it. The width is a container query on the banner's content: 452px, which is a 480px banner at `md` (476px at `sm`, 484px at `lg`).
- `BannerClose`: the × of a banner that has no button. A frameless icon button at the end of the first line, centered on it, whose icon box ends on the banner's padding, like a frameless icon button at the end of a header ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)). Its label defaults to "Dismiss". Don't use it with `BannerAction`: a banner with a button closes with Dismiss. If both are there, raft-ui warns in development and puts the actions on a line of their own, so they never share the ×'s place.

## Variants

The `status` prop sets the tint. Each intent has one icon.

| Variant                | Use for                                                               | Icon            |
| ---------------------- | --------------------------------------------------------------------- | --------------- |
| `status="info"`        | Information and limits                                                | `Info`          |
| `status="warning"`     | Something to watch that can be recovered from, including errors       | `TriangleAlert` |
| `status="destructive"` | A consequence that cannot be undone, usually in a delete confirmation | `OctagonAlert`  |
| `status="success"`     | Something finished or saved                                           | `CircleCheck`   |

```example
banner/compositions/info
```

```example
banner/compositions/action-variants
```

Under 480px, as on every phone, the buttons go under the text, at the end:

```example
banner/compositions/narrow
```

A banner with no button closes with `BannerClose`:

```example
banner/compositions/close
```

- Use `status="warning"` when something goes wrong; `destructive` is only for consequences that cannot be undone ([Color](../../../../../design/foundations/color.md#meanings-of-color)).
- raft-ui also has a neutral `status="default"` on `fill-muted`. The system's banners always state an intent, so prefer one of the four above.

## Content

- Say what is happening now and what to do next ([Writing](../../../../../design/content/writing.md), [Feedback](../../../../../design/patterns/feedback.md#errors-by-scope)).
- Put the subject in `BannerTitle` and the consequence in `BannerDescription`: "This channel is shared with Acme" / "People and agents from Acme will see what you post here."
- Label the button with what it does, in Title Case: See Who, Retry, View Logs.

## Accessibility

- `Banner` renders a `div` with `role="alert"` for `status="destructive"` and `role="status"` for the other intents, so a notice that isn't urgent doesn't interrupt a screen reader.
- The icon repeats the intent and is decorative. The title and description must say the intent in words.
- `BannerClose` is labelled "Dismiss"; pass an `aria-label` that names the notice when a page has more than one thing to dismiss.
- `BannerClose` doesn't move focus. When the banner goes, the app moves focus to the next element after where the banner was, or to the page's heading when there is none; never leave it on the document.
- Keep the parts in reading order: the icon, the title, the description with its link, then `BannerAction` (Dismiss, then the button) or `BannerClose`. Tab reaches them in that order.

## Rules

- Show at most one banner in one place.
- Give at most one button, plus Dismiss before it when the banner can be dismissed, and only when there is a way out: a 32px ink-bordered button (`variant="default" size="sm"`). Never a pink button: a banner is not the screen's primary action.
- Put the button in `BannerAction`, at the bottom right, so it comes after what it acts on and ends where the eye ends, as a dialog's commit button does. A banner that can be dismissed and has a button puts Dismiss (`variant="ghost" size="sm"`) just before the button, in the same `BannerAction`.
- Use `BannerClose` only on a banner with no button, and never put a × in `BannerAction`, where it reads as one of the actions.
- Don't add an ink border. A banner is a soft tint, not a sticker ([Color](../../../../../design/foundations/color.md#soft-tints)); its edge is the container radius and a hairline.

## Inside a panel

When something in one panel goes wrong (an agent won't start, the channel's settings didn't save), use `PanelNotice` from [Panel](../panel/panel.md), not a `Banner`. It is a region of the panel, not a card inside its content:

- Place it directly under the panel header, across the full width of the panel.
- Give it no radius and no hairline. It is closed by seams (`line-seam`) above and below; the one above is the panel header's.
- Line its sides up with the panel's margins ([Spacing](../../../../../design/foundations/spacing.md#layout-widths)).
- Lead the text with the intent's icon, as a banner does ([Variants](#variants)), never a status light. `PanelNotice` keeps the icon's size and centers it on the first line ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)).
- Write one message of at most 2 lines, in `PanelNoticeContent` (semibold `text-callout`).
- Put the actions in `PanelNoticeActions`, on the right and centered on the first line of text: a small icon button (Copy Details) or a text button (View Logs). A 32px button doesn't make the strip taller.
- Keep the default `status="warning"` for something to fix; use `destructive` only for what cannot be undone.
