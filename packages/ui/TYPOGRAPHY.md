# Typography & Colour Foundations (v2, 2026-10-11)

Raft UI's type and colour standards. **Code is the truth** — this document lives in the same
repo as the tokens and recipes and is updated in the same PR when a value changes
(`foundation.css` tokens, `fonts.css` families, `src/components/**` recipes).

## A. Font families (theme-level, `fonts.css`)

| family  | elegant    | brutal         | responsibility                                                                                                                                                               |
| ------- | ---------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| heading | Inter      | Hanken Grotesk | Titles and names: panel titles, card titles, profile names, textarea/field                                                                                                   |
| sans    | Geist      | Hanken Grotesk | Global content: messages, lists, settings, meta, buttons, profile content layer                                                                                              |
| mono    | Geist Mono | Geist Mono     | Machine data + identity + status: hostname, versions, OS strings, commands/env/URLs, counts, code/credential blocks, `@handle` (all mono), status words (Connected/Online/…) |

Criterion: **"character-precise machine data worth copy-pasting" and "identity markers / status
words" stay mono; everything human-read is sans.** Recorded exceptions: the Thread title's
trailing `#channel-name` is sans; dates, emails, and the computer display name are sans
(brutal dates/emails are mono — see D).

**Status**: elegant's mono scope is settled as above; **brutal currently uses mono more broadly and
its exact rule is still being calibrated** — this document is updated when that lands (recorded in
the confirmation thread).

## B. Size ladder (elegant baseline)

`11.5 / 12 / 13 / 14 / 15 / 17` (+ hero 20–24):

- **17** — panel titles (17/600 Inter; sidebar top 17/700)
- **15** — ≥15px notes: handles, `(you)`, the Thread channel-name suffix
- **14** — body, values, sender, list names (600), empty values (14 italic placeholder)
- **13** — field labels (both themes; column width 7.75rem in both themes)
- **12** — message notes (time/model/inline status), list smalls, counts (count colour = placeholder)
- **11.5** — reply-preview time (elegant sans / brutal mono; its colour follows each theme's header-time treatment)

**Weights**:

- **400** — the reading default: body, values, notes, field labels
- **500** — interactive controls: buttons, menu items (field inputs keep 400 via `--field-font-weight`; a textarea lifts to 500 only when invalid)
- **600** — titles (panel 600), sender names, list-row names
- **700** — the sidebar anchor (17/700), caps section labels (eyebrows), badges/counts; brutal titles keep 16/700

## C. Colour ladder (elegant, five tiers)

| tier        | meaning                       | typical use                                             |
| ----------- | ----------------------------- | ------------------------------------------------------- |
| strong      | skeleton / anchor             | sidebar title                                           |
| base        | slot names                    | PanelTitle slots + selected tab                         |
| muted       | content                       | message body, sender (+600), values, descriptions       |
| hint        | operable smalls / ≤13px notes | time, model, field labels, unselected tabs, list smalls |
| placeholder | ≥15px notes / empty values    | handles, channel suffix, Default, No description        |

- Dark values: strong 0.92 / muted 0.82 / hint 0.68 / placeholder 0.64; light placeholder token is
  0.55 — the rest live in `foundation.css`.
- Name rules: slot names = base ｜ repeated in-row names (list rows / sender) = muted+600 ｜ sidebar anchor = strong.
- Message two-layer rule: content (sender + body at muted, weight carries the split) ｜ notes
  (time/model/role/description = hint).
- Alpha variants (`muted/70`, `black/40–50%`) are **currently not recommended in elegant** — prefer the token tiers.

## D. Theme clauses (brutal)

- Brutal titles stay 16/700 Hanken (elegant is 17/600 Inter); display names are black — the
  `theme-brutal:text-black` guard is required because tailwind-merge would otherwise strip the
  recipe override.
- Brutal dates, emails, and the computer display name are mono (elegant keeps sans).
- Any elegant change that lands cross-theme (no elegant guard) is decided item-by-item in the
  brutal review round; reverting costs one `theme-brutal:` guard.

## E. Note-colour perceptual rule (memo level)

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
