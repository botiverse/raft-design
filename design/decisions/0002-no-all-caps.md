---
title: No all caps, including group headings and dialog titles
summary: Group headings, dialog titles and badges use sentence case instead of the product code's all caps.
number: 0002
status: accepted
date: 2026-10-18
---

# 0002. No all caps, including group headings and dialog titles

## Context

The product code sets group headings, dialog titles and badges in all caps. All caps removes the shape of words, which makes them slower to read. Chinese has no case, so in mixed Chinese and English text the capitalized English stands out more than intended.

## Decision

No text is set in all caps. Hierarchy comes from size, weight and color. Clickable text uses Title Case, as in the product. The only all-caps text is the step label on the onboarding screen.

## Consequences

This overrides a decision the product's owner recorded in code. To return to the product's version, change only what this record names. Returning to the product's version means restoring all caps on group headings, dialog titles and badges.

## Related

- [Typography](../foundations/typography.md#casing)
