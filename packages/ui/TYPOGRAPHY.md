# Typography & Colour Foundations (v3, 2026-10-18)

Raft UI's type and colour standards. **Code is the truth** — this document lives in the same
repo as the tokens and recipes and is updated in the same PR when a value changes
(`foundation.css` tokens, `fonts.css` families, `styles.css` type styles, `src/components/**` recipes).

## A. Font families (`fonts.css`)

| family  | font          | responsibility                                                                                                                                        |
| ------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| heading | Space Grotesk | `Text.Heading` (profile names) and field text (Input, Textarea, InputGroup); recipe titles use `font-sans`, the same face                             |
| sans    | Space Grotesk | Global content: titles, messages, lists, settings, meta, buttons, status words, profile content layer                                                 |
| mono    | Space Mono    | Machine data + identity: hostname, versions, OS strings, commands/env/URLs, code/credential blocks, times and dates, counts, file metadata, `@handle` |

Criterion: **what machines write stays mono — character-precise data worth copy-pasting, times,
counts and identity markers; everything people say is sans.** Recorded exception: the Thread
title's trailing `#channel-name` is sans (it rides the title at 17/400 hint).

## B. Size ladder

`12 / 13 / 14 / 15 / 16 / 17` (+ title 22, display 34, hero 40) — the `styles.css` type styles
caption / footnote / callout / subhead / body / headline; mono pairs with `mono-meta` 12 and
`mono-code` 13:

- **17** — titles, all 17/700: panel, thread, dialog, popover, drawer, sidebar top
- **16** — message body, field text (16/24, `--field-font-size`), card titles (16/600, `--card-title-*`), task-card and search-entity names
- **15** — sender (700), sidebar rows (500; active 700), inbox titles, dialog body and description
- **14** — values (description-list details), menu items, card descriptions, file names, quoted-message text
- **13** — field labels (`FieldLabel` 13/600; description-list terms 13/500, label column `minmax(88px, max-content)`), section labels (700), 32px buttons
- **12** — message notes (time mono; model and inline status), reply-preview time (the header time's type: mono, tabular, hint), counts (mono), list metadata, badges

**Weights**:

- **400** — the reading default: body, values, field text (`--field-font-weight: 400`), mono notes (times, counts)
- **500** — menu items, sidebar rows, description-list terms; `text-caption` carries 500 (model, inline status)
- **600** — list-row names, card titles, field labels, tabs, badges
- **700** — titles, sender names, buttons, section labels, solid badges and unread counts, the selected tab/row/menu item; a textarea counter lifts to 700 when invalid or over the limit

## C. Colour ladder (three tiers)

| tier  | token              | typical use                                                                                                                               |
| ----- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| base  | `foreground`       | titles (panel, sidebar, thread, dialog), sender + message body, values, list-row names, menu items, selected underline tab, ghost buttons |
| muted | `foreground-muted` | descriptions (dialog, card, popover), field labels, unselected tabs, quoted-message text, sidebar subtitles, icons                        |
| hint  | `foreground-hint`  | notes: time, model, inline status, description-list terms, section labels, counts, list metadata, input placeholders, empty values        |

- Light is one ink at alpha: base opaque, muted 0.678, hint 0.62. Dark lightness: base 0.92 /
  muted 0.82 / hint 0.70 — the rest live in `foundation.css`.
- `foreground-strong`, `foreground-icon` and `foreground-placeholder` are deprecated aliases of
  `foreground`, `foreground-muted` and `foreground-hint`.
- Name rules: titles, the sidebar anchor, senders and list-row names all read at base; weight carries the split (titles and senders 700, list rows 600).
- Message two-layer rule: content (sender + body at base, weight carries the split) ｜ notes
  (time/model/inline status = hint).
- Text takes the token tiers, not alpha variants (`muted/70`, `black/40–50%`); alpha stays on
  decorative glyphs (the message-footer separator, the file-preview code glyph).

## D. Note-colour perceptual rule (memo level)

1. **Criterion** — perceived weight is not contrast alone: in compact areas, the smaller the size
   gap between a row's primary text and its note, the larger the depth gap must be.
2. **Checklist** — when a note lands on a card/overlay deeper than the canvas, look once: does it
   read heavy? If so, step it half a tier. It is a reminder, not a formula.
3. **Engineering order** — cases first, mechanism later: abstract (e.g. card-root token remap)
   only after 2–3 similar cases; a single spot is a one-line class.
4. **Optional scientific criterion** — APCA (Lc), which folds in polarity and size and beats WCAG
   ratios in dark mode.
5. **Two-axis law** (discussion material) — hierarchy differences use at most two axes of
   (size / weight / colour).
