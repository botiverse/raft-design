---
title: Motion
summary: The durations and easing for press, hover, slides and avatar changes, and the rule that status never animates in a loop.
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
| Press and hover | Lay the pressed overlay over the control. Don't change the fill, move or scale it | 90ms to 120ms |
| Slides and sheets | `ease-slide` | 220ms to 380ms |
| Someone joins or leaves an avatar stack | The faces slide apart and fade in or out, with `ease-slide` | 180ms to 220ms |
| Text and numbers that change | Replace the text. Don't roll the digits | None |
| Brand moments (setup only) | Once, never looping: on the last setup step the agent's avatar hops in and two square marks pop beside it and fade; on the page that creates a workspace, the workspace pill in the preview pops when its name changes | 580ms; 180ms |

- Show hover only on devices with a pointer (`@media (hover: hover)`).
- Don't float or tilt the large avatar on a profile. It stays still.
- Centered overlays (dialogs, confirmations, search, task details, large forms) appear and disappear without animation; of the overlays, only the drawer slides in. See [Choosing a component](../patterns/choosing-components.md#overlays).

## Related

- [States](./states.md): the pressed overlays.
- [Agents](../patterns/agents.md): how working agents are shown without animation.
- [Brand](./brand.md): where brand illustration is allowed.
