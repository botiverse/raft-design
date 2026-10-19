---
title: Typography
summary: The two typefaces, the type scale and where each size and weight is used, the three text color tiers, the metric tokens, and the casing rules.
---

# Typography

Raft uses two typefaces with separate jobs: Space Grotesk for what people say, Space Mono for what machines write. Hierarchy comes from size, weight and color, never from capitals.

## Principles

- **Space Grotesk is people; Space Mono is machines.** Space Grotesk (variable, weights 300 to 700) sets messages, labels and titles. Space Mono (400 and 700) sets IDs, times, counts, runtimes, event lines, shortcuts and code.
- **Chinese falls back to the system face**: PingFang SC, then Source Han Sans. Mixed Chinese and English text keeps the numbers, IDs and times in Space Mono.
- **No all caps.** Use Title Case for anything people can click and sentence case for everything else; see [Casing](#casing).

## Type scale

Each style sets a size and a line height; the bold styles also set their weight.

| Token | Use for |
| --- | --- |
| `text-hero` | The name of the service on the Login with Raft page, from 640px |
| `text-display` | The title of the page that creates a server, from 640px. Also the large title of a top-level page ([Page structure](../patterns/page-structure.md#phone)), which the product doesn't show yet |
| `text-title` | The title of a sign-in page and of a setup step |
| `text-headline` | Top bar titles (a top-level page's name, a pushed page's title), panel headers, sidebar headers, dialog and sheet titles, the workspace pill, the name on a profile |
| `text-body` | Message text, inputs; list and task titles at weight 600 |
| `text-subhead` | Buttons, names, radio labels, dialog body text |
| `text-callout` | Previews, menu items, banners, excerpts |
| `text-footnote` | Group headings, field labels, tooltips |
| `text-caption` | Subtitles, status chips, help text |
| `text-label` | Tab bar labels and the labels of the labeled rail |
| `text-mono-meta` | IDs, times, counts, runtimes, event lines, shortcuts (in Space Mono) |
| `text-mono-code` | Code and commands (in Space Mono) |

## Font families

`fonts.css` defines three families. Use them through the Tailwind utilities.

| Utility | Face | Sets |
| --- | --- | --- |
| `font-sans` | Space Grotesk | Everything people say: titles, messages, lists, settings, buttons, status words, the content of a profile |
| `font-heading` | Space Grotesk | Field text (Input, Textarea, InputGroup) and `Text.Heading`, the names on a profile. Titles in recipes use `font-sans`, the same face |
| `font-mono` | Space Mono | What machines write: IDs, hostnames, versions, OS strings, commands, environment variables, URLs, code and credential blocks, times and dates, counts, file metadata, `@handle` |

- Decide by who wrote it: text that is copied character for character, a time, a count or an identity marker is mono; anything a person says is sans.
- The trailing `#channel-name` of a thread's title is sans, at 17px, weight 400 and `foreground-hint`: it belongs to the title.
- The sans families fall back to PingFang SC, Hiragino Sans GB, Microsoft YaHei and Noto Sans SC for Chinese, then the system face.

## Usage

- Pick the weight by purpose from 400, 500, 600 and 700; the scale sets only size and line height for the regular styles.
- Size the initials in an avatar at 11px, 13px, 15px, 22px or 40px, by avatar size; see [Avatar](../../packages/ui/src/components/avatar/avatar.md).
- Set anything a machine produced in Space Mono, even inside a sentence: `#25`, `10:24`, `Claude Code`, counts, event lines.
- Set statistics meant for people in Space Grotesk.

### Sizes by use

The working sizes are 12px to 17px, one step apart, with 22px, 34px and 40px for setup and sign-in pages.

| Size | Style | Used for |
| --- | --- | --- |
| 17px | `text-headline` | Titles, all at 700: panel, thread, dialog, popover, drawer, the top of the sidebar |
| 16px | `text-body` | Message text; field text (`field-*`); card titles at 600 (`card-title-*`); the names on task cards and in search results |
| 15px | `text-subhead` | Senders at 700; sidebar rows at 500, the selected one at 700; titles in Activity; dialog body text and descriptions |
| 14px | `text-callout` | Values in a description list, menu items, card descriptions, file names, the text of a quoted message |
| 13px | `text-footnote` | Field labels at 600; description-list terms at 500, in a label column of `minmax(88px, max-content)`; group headings at 700; 32px buttons |
| 12px | `text-caption`, `text-mono-meta` | The notes on a message (the time in mono, the model and an inline status), the time of a reply preview, counts in mono, list metadata, badges |

### Why message text is 16px

Message text is `text-body`, 16px on a 24px line. The size follows from the font and from what Raft's messages are.

- **The letters, not the number, set how big text reads.** Space Grotesk has a small x-height (0.486 of its size) and wide letters. At 16px its lowercase is 7.8px tall, about what other chat products show at 15px in fonts with taller lowercase. At 15px Space Grotesk would read smaller than they do, and at 14px it is the Small setting.
- **Messages are often long documents.** Agents write multi-paragraph Markdown with lists, tables and code, which people read rather than scan. A 24px line (1.5×) keeps long passages readable, as for body text in a document.
- **Density comes from the person, not from the default.** Someone who wants more messages on screen picks Small (14/20) in the message-size setting. Don't make the default smaller to fit more: the default serves the long message.
- **Wide letters make lines short in narrow columns.** In a 400px thread panel, a line holds about 39 characters. Don't make text smaller to fit more words on a line there; the width of the column is the lever.
- **Field text is 16px for a separate reason**: iOS zooms into an input whose text is smaller than 16px.

The scale follows Apple's text styles one step down for desktop reading: body 16 against iOS's 17, then subhead 15, callout 14, footnote 13 and caption 12.

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

A field and a card title each have tokens for their type metrics, so that the parts laid out with them use the same values.

```tokens
field
```

- `field-*` sets the text of Input, Textarea, the field variant of SelectTrigger and the options of a Select list (utilities `text-field`, `font-field`). An option shares the field's type, so a value doesn't change size when the list opens; its height and padding stay its own, because a list row is not a control.

```tokens
card-title
```

- `card-title-*` sets CardTitle (utilities `text-card-title`, `font-card-title`). A radio or checkbox laid beside a card title uses its line height to line up with it.

## Casing

| Text | Case | Example |
| --- | --- | --- |
| Anything clickable: buttons, menu items, tabs, tab bar items, status names | Title Case | Create Task, Mark All Read |
| Titles, group headings, descriptions, empty states | Sentence case | No tasks match these filters |
| A dialog or sheet title that repeats its button's label | Title Case | Create Channel |

- Never set text in all caps, in CSS or in the string. [0002](../decisions/0002-no-all-caps.md) allows one exception, a step label on an onboarding screen; the product's setup writes its step label in sentence case, so nothing in the product is in all caps ([Brand](./brand.md)).
- The rules for writing Title Case are in [Writing](../content/writing.md#casing).

## Related

- [Writing](../content/writing.md): the words themselves.
- [Tokens](./tokens.md): every token group and how the names are built.
- [Accessibility](./accessibility.md#language-and-casing): why there are no all caps.
- [Alignment](./alignment.md): how text lines up with shapes and edges.
