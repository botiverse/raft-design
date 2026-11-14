---
title: Raft Chat — Onboarding
summary: The first run — creating an account and a server on brand pages, then the server's setup as a blocking dialog of five steps.
---

# Raft Chat — Onboarding

The first run has two parts. Creating an account's identity and a server happens on brand pages, before the person is in a server. Then, until the new server has a computer and its first agent, the app shows its setup as a dialog over the server's pages, with a scrim. The dialog can't be dismissed: Esc doesn't close it and it has no ×. The native apps show the same steps as a full page instead.

## Structure

### Creating an account and a server

- Every page before the person is in a server has one layout: signing up, the account's identity, creating a server, and any page added before or between them. They follow [Brand](../../foundations/brand.md#how-much-brand) for creating an account or a server: from 1024px a brand pane beside the form, and below 1024px a frame bar above it. The pages keep the same frame from one to the next, so they read as one flow (stdrc, 2026-11-11, #wg-onboarding-v3:011ae21f).
- From 1024px, the form takes 2 parts of 5 on the left and the pane 3 parts on the right, on every page; the form itself is at most 448px wide. The form is what the person does, so it comes first in reading order; the pane only shows the result. A page with the pane on the other side reads as a different flow.
- The pane shows what the page creates, where there is something to see: on the account's identity, a message and a profile card with the person's name, handle and picture as they type them; on creating a server, the server with its name and address. The preview is tilted −1° with the hard sticker shadow.
- A page that creates nothing visible yet (sign-up, and onboarding v3's first page, which asks what the agent team should work on) holds a collage of the pixel illustrations a designer drew for Raft and agents' pixel faces, saying nothing in particular (stdrc, 2026-11-11, #wg-onboarding-v3:1628f68a). It is [BrandCollage](../../../packages/ui/src/components/brand-collage/brand-collage.md) (Jasper, 2026-11-11):
  - On the pane's halftone, one illustration in the middle at 8px a cell ([Illustrations](../../foundations/brand.md#illustrations)): `raft` on sign-up, `task-collab` on the first page. Sign-up is joining a team; the first page is handing the team its first work.
  - Four or five agents' pixel faces around it, real agent avatars at `lg` (51px) or `md` (35px), never the brand yellow fill, which would vanish into the light pane.
  - Each face is its own sticker: its own tilt, between 1° and 3° either way, and the hard sticker shadow. Stickers laid on the pane one by one, at different angles, read as a collage; one tilt and one shadow for the group would read as a single card, and a card is what the other pages use for a preview.
  - The illustration stays flat, with no tilt and no shadow. It has no edge for a shadow to follow, so a shadow would draw a box that isn't there, and turned by a degree its pixels stop being square.
  - The collage doesn't change with what the person types. The pages that show the person's data are the ones with a preview.
- Under the form, a line says who is signed in, with Sign out, on every page after sign-up. Sign-up has no account yet: its line is "Already have an account? Sign in".

### The setup dialog

The steps, in order:

1. **Connect a computer** (960px wide): what a computer is, the command to run, and a log that follows the connection. When the server already has computers that are offline, the step becomes Start your computer, with the command that brings one back.
2. **Create the first agent** ("Meet Cindy"), with the same form as Create agent.
3. **Tell the agent about you**: a short survey of option grids.
4. **Choose your display style**.
5. **The handoff**: the agent takes it from here.

Steps 3 to 5 share one frame, 720px wide and about 520px high, so the dialog doesn't change size between them. It is the showcase frame, which only these steps, the Upgrade to Pro dialog and Pro's Add seats dialog use, outside the four Dialog sizes ([Dialog](../../../packages/ui/src/components/dialog/dialog.md#variants)). Every step has:

- **A header**: the step label "Set up your server" in Space Mono, the title in `text-title` and one line of explanation.
- **A body** that scrolls inside the frame.
- **A footer** with muted text links ([TextLink](../../../packages/ui/src/components/text-link/text-link.md)) on the left (Switch server, and on the first two steps Server settings) and the pink button on the right (Next, Continue, Let's Go). On a narrow screen the pink button spans the width.

```example
dialog/compositions/server-setup-step
```

## Rules

- Use the brand only on the handoff step ([Brand](../../foundations/brand.md#how-much-brand)): the agent's 99px avatar hops once, and two square marks pop beside it and fade ([Motion](../../foundations/motion.md#usage)). The other steps are plain dialogs on paper.
- Don't add a Skip button or step dots. The way out of setup is Switch server.
- Write the step label in sentence case. [0002](../../decisions/0002-no-all-caps.md) allows one all-caps step label on an onboarding screen; the product doesn't use it.
