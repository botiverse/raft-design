---
title: FormSection
summary: One part of a large form, with a small heading, a quiet status chip, a line on what the part is for, and its fields, used in the wide dialog and in drawer forms.
status: stable
aliases: []
category: layout
related: [dialog, drawer, field, badge]
---

# FormSection

A form section is one part of a large form: a small heading, an optional status chip, one line on what the part is for, then its fields. A large form is a stack of them, in the wide [Dialog](../dialog/dialog.md) or in a [Drawer](../drawer/drawer.md); the two use the same section.

## When to use

| Situation                                                  | Use                                                                          |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A part of the large form dialog, listed in its `DialogNav` | FormSection                                                                  |
| A part of a form in a drawer                               | FormSection                                                                  |
| A form of 2 or 3 fields                                    | No sections: put the fields in the body of the [Dialog](../dialog/dialog.md) |

How the large form dialog is built around its sections is in [Forms](../../../../../design/patterns/forms.md#the-large-form-dialog).

## Anatomy

FormSection is one part. It renders, in order:

- The heading: `text-footnote`, bold, in `foreground-muted`. Required.
- The status, at the end of the heading row: a soft, muted [Badge](../badge/badge.md). Optional.
- The description, under the heading: `text-footnote` in `foreground-hint`. Optional.
- Its children: the fields ([Field](../field/field.md)), and any action rows.

## Behavior

- Fields in a section are 12px apart.
- Sections are 16px apart, with a `line-hairline` between two sections. The first section starts flush with the top of the body.

## Content

- Write the status as one quiet word on where the section stands: Complete, Optional, Off, Private.
- Write the description as one line on what the section is for: "Public identity and Marketplace-facing metadata."

## Accessibility

- FormSection renders a `section` with an `h3` heading. Put it under a dialog or drawer title, which is the level above.
- Give each section an `id` when a `DialogNav` links to it, so the section list can jump there.

## Rules

- Write actions inside a section as ordinary rows, and show only the sections that can be filled in before an item is saved, as in [Forms](../../../../../design/patterns/forms.md#the-large-form-dialog).
