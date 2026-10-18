---
title: Large one-pass forms open as a wide centered dialog
summary: A large form filled in one pass opens as an 896px centered dialog with a section list, sections and a footer, instead of a 640px drawer.
number: 0029
status: accepted
date: 2026-10-18
---

# 0029. Large one-pass forms open as a wide centered dialog

## Context

Decided while the web app was redrawn to this system; raised in review and implemented in raft-ui and the web app. Large forms opened in a 640px drawer on the right. They have many fields and need to be seen as one whole form, not a strip along the edge.

## Decision

The large form is a centered wide dialog, 896px: a section list, the sections, and a footer with the submit button.

## Consequences

The section list lets people jump around a long form.

## Related

- [Forms](../patterns/forms.md#the-large-form-dialog)
