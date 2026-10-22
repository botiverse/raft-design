---
title: Motion
summary: The durations and easing for press, hover, slides and avatar changes, and the rule that status never animates in a loop.
redirectFrom: [decisions/0028-centered-overlays-no-animation]
---

# Motion

Motion in Raft confirms an action or shows where something came from. It never decorates, and status never moves on its own: a screen people watch for hours stays still.

## Principles

- **Status doesn't loop.** A working agent is a still yellow light. The only looping animation in the working product is the pixel spinner while something loads, and it goes away as soon as loading ends.
- **Press doesn't move.** Hover and press add an overlay; nothing shifts or scales.
- **Reduced motion stops everything.** With `prefers-reduced-motion`, every animation on this page is off.

## Easing

`ease-slide` is the one easing curve for things that move: slides, sheets and changes to an avatar stack.

## Usage

| Motion | How | Duration |
| --- | --- | --- |
| Press and hover | Lay the hover tier's overlay over the control ([Hover and press](./states.md#hover-and-press)). Don't change the fill, move or scale it | 90ms to 120ms |
| Slides and sheets | `ease-slide` | 220ms to 380ms |
| A page pushed or popped on a phone | The platform's default transition, on phone web, iOS and Android alike ([Navigation](../patterns/navigation.md#what-each-platform-draws)) | The platform's |
| The tab bar coming back when the keyboard closes | The platform's default transition, never an instant jump ([MobileNav](../../packages/ui/src/components/mobile-nav/mobile-nav.md#behavior)). The tab bar doesn't move while a page scrolls | The platform's |
| Someone joins or leaves an avatar stack | The faces slide apart and fade in or out, with `ease-slide` | 180ms to 220ms |
| The item a jump lands on (located) | `info-soft` at once, held 1.2s, then faded out with `ease-out`; with reduced motion held still for 2s and then off ([Located](./states.md#located)) | 2s in all |
| Text and numbers that change | Replace the text. Don't roll the digits | None |
| Brand moments (setup only) | Once, never looping: on the last setup step the agent's avatar hops in and two square marks pop beside it and fade; on the page that creates a server, the workspace button in the preview pops when its name changes | 580ms; 180ms |

- Show hover only on devices with a pointer (`@media (hover: hover)`).
- Don't float or tilt the large avatar on a profile. It stays still.
- Centered overlays (dialogs, confirmations, search, task details, large forms) get the scrim and appear and disappear without animation: they are already in place and don't come from anywhere. Of the overlays, only the drawer and the bottom sheet slide in, because the slide shows which edge they came from; on a phone that includes a dialog with fields, which is a sheet there ([Dialog](../../packages/ui/src/components/dialog/dialog.md#on-a-phone)). The rule is the same for every centered overlay, so don't give one of them an animation of its own.
- A scrim moves with its surface: under a centered overlay it appears at once; under a drawer or a bottom sheet it fades in over the same time and with the same easing as the slide, and out as the surface leaves, so the page doesn't go dark in one step while the panel is still on its way. With reduced motion it appears at once. See [Choosing a component](../components/overview.md#overlays).

## Related

- [States](./states.md): the hover tiers.
- [Working agents](../people-and-agents/working-agents.md#motion): how working agents are shown without animation.
- [Brand](./brand.md): where brand illustration is allowed.
