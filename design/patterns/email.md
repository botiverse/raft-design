---
title: Email
summary: Adapt Raft's typography, surfaces, and actions to system-triggered HTML email.
---

# Email

System-triggered email uses Raft's reading surfaces and action hierarchy in table-based HTML. Email clients cannot run raft-ui components; render the same visual roles with inline styles and a usable system-font fallback.

## When it applies

Use this pattern for account verification, password recovery, invitations, security notices, app review notifications, onboarding letters, and lifecycle email. It does not define recipients, schedules, consent, or delivery policy.

## Structure

| Message | Structure |
| --- | --- |
| Account, invitation, security, or lifecycle notification | Small brand lockup above a white reading card, heading, body, at most 1 primary action, required footer |
| Personal onboarding letter | Greeting, paragraphs, signature, required footer; no decorative card or added action button |

Use the roles from [Color](../foundations/color.md), [Typography](../foundations/typography.md), [Shape](../foundations/shape.md), and [Button](../../packages/ui/src/components/button/button.md). The brand lockup identifies the sender; it is not a large promotional hero.

## Rules

- Resolve semantic tokens into inline sRGB colors and pixel dimensions for clients that strip custom properties or stylesheets. Keep the mapping documented beside the email renderer.
- Use `attention-strong` for underlined body links. This email-specific pink-link choice was requested by Cindy on October 29, 2026; in-app links continue to follow `foreground-link`.
- Use `attention-400` with `sticker-ink` for the primary action, the control radius, and an ink border. Keep the action readable when images and web fonts are disabled.
- Use the container radius and a hairline for the reading card. Follow [Elevation](../foundations/elevation.md): no hard shadows on cards or buttons.
- Use a 16px body with 24px line height and a footer of at least 12px. Email readers frequently view the same message on a phone, so do not shrink the reading size for desktop.
- Keep Space Grotesk first in the human-text font stack, followed by system fonts. Do not depend on a remote font loading for the layout to work.
- Preserve the message's existing action destination, sender, reply address, expiry explanation, and required unsubscribe or legal footer. A visual revision does not change delivery policy.
- Provide dark styles where supported, using [Dark mode](../foundations/dark-mode.md). Keep light-mode inline fallbacks; mail clients may strip styles or transform colors independently.

## Wide and narrow

- Limit the reading column to 560px, with a fluid width below that.
- Leave at least 16px beside the message on a phone, and allow long names, identifiers, and URLs to wrap without widening the viewport.
- Verify light and dark browser rendering, narrow screens, disabled images, and long or localized content. Browser screenshots do not establish Gmail, Outlook, or Apple Mail acceptance; record actual mailbox checks separately.

## Accessibility

- Give layout tables `role="presentation"`, use headings for message structure, and provide the brand name as the image's alternative text.
- Render actions as named links that work without JavaScript. Underline body links so color is not the only cue.
- Keep security instructions and expiry information as text, not images.

## Related

- [Writing](../content/writing.md)
- [Brand](../foundations/brand.md)
