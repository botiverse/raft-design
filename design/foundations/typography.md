---
title: Typography
summary: The two typefaces, the type scale and where each style is used, and the casing rules.
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
| `text-display` | The title of the page that creates a workspace, from 640px. Also the large title of a top-level page ([0004](../decisions/0004-title-on-every-top-level-page.md)), which the product doesn't show yet |
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

## Usage

- Pick the weight by purpose from 400, 500, 600 and 700; the scale sets only size and line height for the regular styles.
- Size the initials in an avatar at 11px, 13px, 15px, 22px or 40px, by avatar size; see [Avatar](../../packages/ui/src/components/avatar/avatar.md).
- Set anything a machine produced in Space Mono, even inside a sentence: `#25`, `10:24`, `Claude Code`, counts, event lines.
- Set statistics meant for people in Space Grotesk.

## Casing

| Text | Case | Example |
| --- | --- | --- |
| Anything clickable: buttons, menu items, tabs, tab bar items, status names | Title Case | Create Task, Mark All Read |
| Titles, group headings, descriptions, empty states | Sentence case | No tasks match these filters |
| A dialog or sheet title that repeats its button's label | Title Case | Create Channel |

- Never set text in all caps, in CSS or in the string. [0002](../decisions/0002-no-all-caps.md) allows one exception, a step label on an onboarding screen; the product's setup writes its step label in sentence case, so nothing in the product is in all caps ([Brand](./brand.md)).
- The rules for writing Title Case are in [Writing](./writing.md#casing).

## Related

- [Writing](./writing.md): the words themselves.
- [Alignment](./alignment.md): how text lines up with shapes and edges.
