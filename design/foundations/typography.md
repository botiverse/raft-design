---
title: Typography
summary: The two typefaces, the type scale and where each size and weight is used, the three text color tiers, the metric tokens, and the casing rules.
---

# Typography

Raft uses two typefaces with separate jobs: Space Grotesk for what people say, Space Mono for what machines write. Hierarchy comes from size, weight and color, never from capitals.

## Principles

- **Space Grotesk is people; Space Mono is machines.** Space Grotesk (variable, weights 300 to 700) sets messages, labels and titles. Space Mono (400 and 700) sets IDs, times, counts, runtimes, event lines, shortcuts and code.
- **CJK falls back to the system face**: PingFang SC, then Source Han Sans, for Chinese. A page in Traditional Chinese, Japanese or Korean (`<html lang="zh-TW">` / `"ja"` / `"ko"`) falls back to its own faces first, because the Simplified Chinese faces draw characters with mainland glyph shapes and have no Hangul. Mixed CJK and English text keeps the numbers, IDs and times in Space Mono.
- **No all caps.** Use Title Case for anything people can click and sentence case for everything else; see [Casing](#casing).

## Type scale

Each style sets a size and a line height; the bold styles also set their weight. The working styles have two sizes: a phone's, and a desktop's, from 768px (where the desktop layout begins, [Responsive layout](../patterns/responsive.md)) when the main pointer is a mouse or a trackpad. A touch screen keeps the phone's sizes at any width ([Spacing](./spacing.md#hit-targets) says why). The utility is the same on both, so a component never states a breakpoint for its type.

| Token | Phone | Desktop | Use for |
| --- | --- | --- | --- |
| `text-hero` | 40/44 | 40/44 | The name of the service on the Login with Raft page, from 640px |
| `text-display` | 34/40 | 34/40 | The title of the page that creates a server, from 640px. Also the large title of a top-level page ([Page structure](../patterns/page-structure.md#phone)), which the product doesn't show yet |
| `text-title` | 22/28 | 22/28 | The title of a sign-in page and of a setup step |
| `text-headline` | 17/22 | 16/24 | Top bar titles (a top-level page's name, a pushed page's title), panel headers, sidebar headers, dialog and sheet titles, the workspace pill, the name on a profile |
| `text-body` | 16/24 | 14/22 | Message text; list and task titles at weight 600 |
| `text-subhead` | 15/20 | 14/22 | Buttons at `lg`, names, radio labels, dialog body text |
| `text-callout` | 14/20 | 14/22 | Previews, menu items, banners, excerpts |
| `text-control` | 13/18 | 14/22 | The label of a 32px or 28px control: a Button at `md`, a panel action, a filter trigger, the text selection toolbar |
| `text-footnote` | 13/18 | 12/18 | Group headings, field labels, tooltips |
| `text-caption` | 12/16 | 12/18 | Subtitles, status chips, help text |
| `text-label` | 11/13 | 11/13 | Tab bar labels and the labels of the labeled rail |
| `text-mono-meta` | 12/16 | 12/18 | IDs, times, counts, runtimes, event lines, shortcuts (in Space Mono) |
| `text-mono-code` | 13/20 | 13/20 | Code and commands (in Space Mono) |

Field text and card titles have their own tokens, with the same two sizes ([Metric tokens](#metric-tokens)).

### Desktop and phone

The desktop scale is Feishu's (Lark's) for PC: 16/24 for titles, 14/22 for everything people read, 12px for notes. The phone scale is Feishu's for mobile, where message text is 16/24 as well. People compare Raft with the chat tools they use all day, and on a desktop those set message text at 14px.

- **A desktop is a wide screen with a mouse or a trackpad.** The sizes switch on `(width >= 48rem) and (pointer: fine)`, the same query as the control heights, so a field's text and its height change together. A tablet used by touch keeps the phone's sizes: 16px field text stops iOS and iPadOS from zooming into a field on focus.
- **A desktop is read from further away, with more on screen.** A conversation sits beside a sidebar and often a thread, so a line of text holds more words and a screen more messages at 14px. On a phone the screen is closer and one column fills it; 16px reads at the same apparent size.
- **Judge a size with Chinese, not only with Latin.** Chinese falls back to the system face, whose glyphs fill the em box: at 16px a line of Chinese reads larger than the same line in Space Grotesk, whose lowercase is about half its size. Check a change with a Chinese conversation open as well as an English one.
- **Body, subhead and callout share 14/22 on a desktop.** Feishu has no 13px or 15px step, and the scale doesn't need one: a name, a message and a preview differ there by weight and color, and a size step on top would make the three differences [Color tiers](#notes-on-deeper-surfaces) rules out. On a phone they stay a step apart.
- **Notes take an 18px line on a desktop, as footnote does on a phone.** Feishu gives 12px notes a 20px line, but a note here is often two or three lines under a setting or a card, and at 20px those lines sit further apart than the 14/22 text above them, so the note reads looser than what it explains. Footnote, caption and mono meta share 12/18, so a time in Space Mono and a status in Space Grotesk on one line have the same box.
- **Mono code stays 13/20.** Space Mono is wider than Space Grotesk, so 13px code already sits level with 14px text, and its 20px line fits inside a 22px line of text.
- **A control's label is 14px on a desktop, 13px on a phone.** Feishu sets button text at 14px; footnote goes down to 12px there, so a 32px control's label has its own style, `text-control`.
- **Hero, display, title and label don't change.** They set sign-in and setup pages, which are the same on both, and the phone's tab bar.
- **Density is the person's choice, not the default's.** Someone who wants more on screen picks Small in the message-size setting. Don't make the default smaller to fit more.

## Larger text

People can set text larger than the scale. The scale's sizes are the sizes at the default text size; this section says what happens when text grows and the layout around it doesn't.

- **The native apps follow the system text size**: Dynamic Type on iOS, the font scale on Android. Text grows with that setting while the layout's widths stay as they are.
- **The web scales text and layout together.** raft-ui sets type in px, and browser zoom scales everything at once, so nothing changes shape. A browser's text-only zoom grows text alone, and then these rules apply on the web too. They hold wherever text can grow on its own.
- **Never clip text.** Control, field and row heights are minimums: a control, a field or a row grows with its text ([Spacing](./spacing.md#heights)). Headers and bars are the exception: they keep their height, and their title truncates.
- **Never shrink text to make it fit.** Shrinking undoes the person's setting; give way as the table says instead.

| Text | When it doesn't fit |
| --- | --- |
| One-line labels: names (a person, an agent, a channel, a server); the title of a header or a bar (a top bar, a panel header), which keeps its height, as the iOS navigation bar and the Material top app bar do; chips; and tab bar labels, whose cells can't grow ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md)) | Stays on one line and ends with an ellipsis. The full text is one step away: on the page or item it opens, or in its press-and-hold menu, and always in its accessible name. A tooltip carries it for a mouse and the keyboard only: raft-ui's Tooltip doesn't open on touch |
| Previews and excerpts: the latest message under a conversation, an Activity item's excerpt, a search result | Wraps up to the lines its row gives it ([InboxItem](../../packages/ui/src/components/inbox-item/inbox-item.md#content): at most 2), then ends with an ellipsis. It is a glimpse of a message; the message itself is one tap away |
| Text people read in full: message text, errors, help text, the title of a settings row or an entry row (ListRow `plain` and `entry`) and its consequence, dialog and sheet text, button labels. iOS Dynamic Type and Android's font scale keep these labels whole too | Wraps, and never truncates: people need every word of it. A button label cut short can hide what the button does |

- Never clip a row's text. Raft sets no text size at which a row of icon, label and trailing value restacks: each row gives way in the order its component sets, and what the row exists to show goes last. In a settings row (ListRow `plain`) the title wraps onto as many lines as it needs and the row grows; the current value keeps up to 45% of the row and truncates at its end, and is never dropped, since it is what the row reports ([ListRow](../../packages/ui/src/components/list-row/list-row.md)). raft-ui's ListRow truncates the title today. In a sidebar row the description gives up its room before the name truncates, since the name is what the row is ([Sidebar](../../packages/ui/src/components/sidebar/sidebar.md)).
- Exception: keep a toolbar's button labels on one line. When the toolbar runs out of room, its buttons give way to their icons, with the label kept as the accessible name and the tooltip ([Responsive layout](../patterns/responsive.md#when-a-row-runs-out-of-room)).
- raft-ui's Button keeps its label on one line at a fixed height today. That holds on the web while zoom scales text and box together; where text grows on its own, a button's label wraps and the button grows.

## Font families

`fonts.css` defines three families. Use them through the Tailwind utilities.

| Utility | Face | Sets |
| --- | --- | --- |
| `font-sans` | Space Grotesk | Everything people say: titles, messages, lists, settings, buttons, status words, the content of a profile |
| `font-heading` | Space Grotesk | Field text (Input, Textarea, InputGroup) and `Text.Heading`, the names on a profile. Titles in recipes use `font-sans`, the same face |
| `font-mono` | Space Mono | What machines write: IDs, hostnames, versions, OS strings, commands, environment variables, URLs, code and credential blocks, times and dates, counts, file metadata, `@handle` |

- Decide by who wrote it: text that is copied character for character, a time, a count or an identity marker is mono; anything a person says is sans.
- The trailing `#channel-name` of a thread's title is sans, in `text-headline` at weight 400 and `foreground-hint`: it belongs to the title.
- The sans families fall back to PingFang SC, Hiragino Sans GB, Microsoft YaHei and Noto Sans SC for Chinese, then the system face. Under `lang="zh-TW"` (also `zh-HK`, `zh-MO` and `zh-Hant`) they fall back to PingFang TC, Microsoft JhengHei and Noto Sans TC; under `lang="ja"` to Hiragino Sans, Yu Gothic UI, Meiryo and Noto Sans JP; under `lang="ko"` to Apple SD Gothic Neo, Malgun Gothic and Noto Sans KR.

## Usage

- Pick the weight by purpose from 400, 500, 600 and 700; the scale sets only size and line height for the regular styles.
- Size the initials in an avatar at 11px, 13px, 15px, 22px or 40px, by avatar size; see [Avatar](../../packages/ui/src/components/avatar/avatar.md).
- Set anything a machine produced in Space Mono, even inside a sentence: `#25`, `10:24`, `Claude Code`, counts, event lines.
- Set statistics meant for people in Space Grotesk.

### Sizes by use

| Style | Used for |
| --- | --- |
| `text-headline` | Titles, all at 700: panel, thread, dialog, popover, drawer, the top of the sidebar |
| `text-body` | Message text; card titles at 600 (`card-title-*`); the names on task cards and in search results |
| `field-*` | The text in a field: Input, Textarea, InputGroup, a Select at `chrome="field"` |
| `text-subhead` | Senders at 700; sidebar rows at 500, the selected one at 700; titles in Activity; dialog body text and descriptions; Buttons at `lg` |
| `text-callout` | Values in a description list, menu items, card descriptions, file names, the text of a quoted message |
| `text-control` | The labels of 32px controls: Button at `md`, panel actions, filter triggers |
| `text-footnote` | Field labels at 600; description-list terms at 500, in a label column of `minmax(88px, max-content)`; group headings at 700 |
| `text-caption`, `text-mono-meta` | The notes on a message (the time in mono, the model and an inline status), the time of a reply preview, counts in mono, list metadata, badges |

### Weights by use

| Weight | Used for |
| --- | --- |
| 400 | Reading text: message body, values, field text, mono notes (times, counts) |
| 500 | Menu items, sidebar rows, description-list terms; `text-caption` sets 500 for the model and an inline status |
| 600 | Names in list rows, card titles, field labels, tabs, badges |
| 700 | Titles, senders, buttons, group headings, solid badges and unread counts, the selected tab, row or menu item; a textarea's counter when the text is invalid or over the limit |

## Color tiers

Text has three tiers. The tokens and their contrast are in [Color](./color.md#text-and-icons).

| Tier | Token | Used for |
| --- | --- | --- |
| Base | `foreground` | Titles (panel, sidebar, thread, dialog), senders and message text, values, names in list rows, menu items, the selected underline tab, ghost buttons |
| Muted | `foreground-muted` | Descriptions (dialog, card, popover), field labels, unselected tabs, the text of a quoted message, sidebar subtitles, icons |
| Hint | `foreground-hint` | Notes: times, the model, an inline status, description-list terms, group headings, counts, list metadata, placeholders, empty values |

- Read titles, the top of the sidebar, senders and names in list rows at the base tier. Let weight make the difference between them: titles and senders at 700, list rows at 600.
- Give a message two layers: its content (sender and text, at the base tier) and its notes (time, model, inline status, at the hint tier).
- Use the tier tokens for text, never an alpha variant such as `text-foreground-muted/70`: the contrast guarantee holds only for the tiers. Alpha is for decorative glyphs, such as the separator in a message footer.

### Notes on deeper surfaces

- How heavy a note looks depends on more than contrast. In a compact row, the closer a note is in size to the text it annotates, the further apart their colors must be.
- When a note sits on a card or popup that is deeper than the canvas, check it once by eye. If it reads heavy, move it half a tier lighter.
- Separate two levels of text by at most two of size, weight and color.
- Fix one case in place, with a class. Turn it into a shared token only after two or three similar cases. APCA (Lc), which accounts for polarity and size, is a better check than the WCAG ratio in dark mode when a case is in doubt.

## Metric tokens

A field and a card title each have tokens for their type metrics, so that the parts laid out with them use the same values. Like the scale, each has a phone value and a desktop value, under the same query.

```tokens
field
```

- `field-*` sets the text of Input, Textarea, the field variant of SelectTrigger and the options of a Select list (utilities `text-field`, `font-field`). An option shares the field's type, so a value doesn't change size when the list opens; its height and padding stay its own, because a list row is not a control.
- Never set field text below 16px on a phone: iOS zooms the page into a field whose text is smaller. A desktop has no such zoom, so field text follows the desktop body size there.

```tokens
card-title
```

- `card-title-*` sets CardTitle (utilities `text-card-title`, `font-card-title`). A radio or checkbox laid beside a card title uses its line height to line up with it.

## Casing

| Text | Case | Example |
| --- | --- | --- |
| Anything clickable: buttons, text links, menu items, tabs, tab bar items, status names | Title Case | Create Task, Mark All Read, Log Out |
| Titles, group headings, descriptions, empty states | Sentence case | No tasks match these filters |
| A dialog or sheet title that repeats its button's label | Title Case | Create Channel |

- Never set text in all caps, in CSS or in the string. [0002](../decisions/0002-no-all-caps.md) allows one exception, a step label on an onboarding screen; the product's setup writes its step label in sentence case, so nothing in the product is in all caps ([Brand](./brand.md)).
- The rules for writing Title Case are in [Writing](../content/writing.md#casing).

## Related

- [Writing](../content/writing.md): the words themselves.
- [Tokens](./tokens.md): every token group and how the names are built.
- [Accessibility](./accessibility.md#language-and-casing): why there are no all caps.
- [Alignment](./alignment.md): how text lines up with shapes and edges.
