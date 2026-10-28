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
| A signed-out visitor on a public page: sign up                             | The sign-up prompt, not a banner ([see below](#the-sign-up-prompt-on-a-public-page))                     |
| A phone's own browser arrived on a message link: open the Raft app         | The open-in-app offer, not a banner ([see below](#the-open-in-app-offer-on-a-phone))                     |
| The result of something the person just did                                | [Toast](../toast/toast.md)                                                                               |
| The person must decide now                                                 | [Dialog](../dialog/dialog.md) or [AlertDialog](../alert-dialog/alert-dialog.md)                          |

## Anatomy

- `Banner`: the tinted container. Required. It fills the width it is given and lays out its parts by that width, so give it a width (or let it fill its parent); never `w-fit`, which collapses it.
- An icon: the intent's Lucide icon ([Variants](#variants)) as a direct child, before the text. Banner sizes it 20px with 10px before the text (16px and 8px in a `sm` banner) and centers it on the first line ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)). While something is still pending, such as a computer that hasn't connected yet, a `Spinner` takes the icon's place in a `status="info"` banner: waiting is not a problem, so it gets neither the warning tint nor its icon. Banner centers the spinner in the icon's column on the first line, so the text starts where it does after an icon. Never a `Status` light in its place: a status light never says what kind of notice this is (success, info, warning, error). A status light keeps its own meanings, whether an agent, a person or a computer is working or online, a task's status, and the square attention dot that marks something waiting or unread; a notice about one of those things may still show that thing's light inside it ([Status](../status/status.md#sizes)).
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

### Sizes

`size` sets the padding and the icon, never the type: a banner's title and description are `text-callout` at every size, 14/20 on a phone and 14/22 on a desktop ([Typography](../../../../../design/foundations/typography.md#type-scale)).

| Size                  | Padding (top and bottom × sides) | Icon                       |
| --------------------- | -------------------------------- | -------------------------- |
| `size="sm"`           | 8px × 12px                       | 16px, 8px before the text  |
| `size="md"` (default) | 12px × 14px                      | 20px, 10px before the text |
| `size="lg"`           | 14px × 16px                      | 20px, 10px before the text |

- A banner's text is never smaller than its button's label. The text and the button sit side by side, and a banner's button has one size, the 32px button, whose label is `text-control` (14px on a desktop, 13px on a phone). Text smaller than that label makes the button look too big for its banner, so a `sm` banner tightens only its padding and its icon, never its text.
- A `sm` banner with a button or a × keeps it 4px from its top and bottom edges, centered on the last line of text, so the text has (32px − one line) / 2 + 4px above and below it. The × needs the same room: its 32px hover fill on an 18px line would otherwise reach the banner's edge.

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
- Give at most one button, plus Dismiss before it when the banner can be dismissed, and only when there is a way out: a 32px ink-bordered button (`variant="default" size="md"`). Never a pink button: a banner is not the screen's primary action.
- Put the button in `BannerAction`, at the bottom right, so it comes after what it acts on and ends where the eye ends, as a dialog's commit button does. A banner that can be dismissed and has a button puts Dismiss (`variant="ghost" size="md"`) just before the button, in the same `BannerAction`.
- Use `BannerClose` only on a banner with no button, and never put a × in `BannerAction`, where it reads as one of the actions.
- Don't add an ink border. A banner is a soft tint, not a sticker ([Color](../../../../../design/foundations/color.md#soft-tints)); its edge is the container radius and a hairline.

## Inside a panel

When something in one panel goes wrong (an agent won't start, the channel's settings didn't save), use `PanelNotice` from [Panel](../panel/panel.md), not a `Banner`. It is a region of the panel, not a card inside its content:

- Place it directly under the panel header, across the full width of the panel.
- Give it no radius and no hairline. It is closed by seams (`line-seam`) above and below; the one above is the panel header's.
- Line its sides up with the panel's margins ([Spacing](../../../../../design/foundations/spacing.md#layout-widths)).
- Lead the text with the intent's icon, as a banner does ([Variants](#variants)), never a status light that says what kind of notice it is. `PanelNotice` keeps the icon's size and centers it on the first line ([A mark that leads text](../../../../../design/foundations/alignment.md#a-mark-that-leads-text)).
- Write one message of at most 2 lines, in `PanelNoticeContent` (semibold `text-callout`).
- Put the actions in `PanelNoticeActions`, on the right and centered on the first line of text: a small icon button (Copy Details) or a text button (View Logs). A 32px button doesn't make the strip taller.
- Keep the default `status="warning"` for something to fix; use `destructive` only for what cannot be undone.

## The sign-up prompt on a public page

A public page, such as a shared Artifact or a public channel, invites a signed-out visitor to sign up with one prompt. It is not a `Banner`: a banner has a button or a ×, never both, and has no centered neutral strip. Compose it from a `Button` (and, on a phone, an icon `Button`) in a plain container. The rules above stay as they are for banners: a banner with a button closes with a ghost Dismiss, never a ×.

On a desktop (`sm` and up):

- A 48px strip across the full width of the window, above the page header.
- `fill-subtle`, no border.
- The sentence and one 32px outlined button (`variant="default" size="md"`), centered together, 24px apart. Never a pink button.
- It can't be dismissed.

On a phone:

- A block under the page header, on `info-soft`, with `info-strong` text.
- The sentence, over at most 2 lines, and the outlined button under it.
- An × at the top right, with a target of at least 44px. Remember the dismissal on the device.

Rules:

- Show it only to signed-out visitors, and only on public pages; never in the signed-in app.
- Show at most one on a page.
- Never put a status in its place: what is true of this page (it failed to load, it is read-only, it changed) goes where [When to use](#when-to-use) puts it.
- Write one sentence that says what Raft gets the visitor, then the action: "Make pages like this with Raft and your AI agents. Sign up now and start building." Label the button "Sign Up or Log In".

## The open-in-app offer on a phone

A phone's own browser (Safari, Chrome) that landed on a Raft message link offers the Raft app in one row, so the person can go on where replies and notifications already are. Like the sign-up prompt, it is an offer, not a notice, so it is not a `Banner`: compose it from an `IconTile`, a `Button` and an icon `Button` in a plain container.

- One row under the conversation's header, across its full width, on `info-soft`, with a `line-seam` under it; its tile starts on the page's 16px margin.
- From the start: Raft's `IconTile` (`sm`) with the logo; a title, "Open in the Raft app", in semibold `text-callout` with `foreground`, and one line under it in `text-caption` with `foreground-muted` ("Go straight to this message"), each on one line, truncated; then one 32px outlined button (`variant="default" size="md"`), Open, and an × at the end with a target of at least 44px. Never a pink button: the conversation is still the page.
- Open is a real link to the same address on the host the apps claim (`open.raft.build`), so the system hands it to the app; the page never launches anything by itself. When no app takes it, that host sends the person back with a marker, and the page offers the download in a bottom sheet (the tile, "The Raft app isn't installed yet", one line, then Download Raft App and Keep Using the Web) instead of the row.
- × and Keep Using the Web put it away for the browser session. Nothing tries to tell whether the app is installed.

Rules:

- Show it only in a phone's own browser that arrived on a message link, while that conversation is on screen; never in Raft's apps, the web installed as an app, or a chat app's in-app browser, which gets its own guide to the system browser.
- Show at most one: on a computer, the same arrival gets a `Banner` offering Raft Desktop instead, at the top of the conversation.
