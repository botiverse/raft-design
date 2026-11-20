---
title: PageLoadingLine
summary: The thin line along the bottom edge of a page's top bar while the page under it loads, as a browser draws it.
status: experimental
aliases: [Page loading bar, Loading line, Top loading bar]
layer: core
category: feedback
related: [progress, spinner, skeleton, web-top-bar]
---

# PageLoadingLine

A page loading line shows that the page under a top bar is loading, the way a browser does: a thin line along the bar's bottom edge that follows the progress the page reports and goes away when it has loaded. Use it for a web page opened inside the app (the in-app browser, a web page in settings, the release notes). Which loading indicator fits which wait is in [Choosing a component](../../../../../design/components/overview.md#waiting).

```example
page-loading-line/compositions/preview
```

## When to use

| Situation                                              | Use                                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------- |
| A page or web view loads under its top bar             | PageLoadingLine                                                                   |
| A task with a known percentage, with a label           | [Progress](../progress/progress.md)                                               |
| The duration is unknown, and there is no bar to sit on | [Spinner](../spinner/spinner.md)                                                  |
| The layout of what is loading is known                 | [Skeleton](../skeleton/skeleton.md), with the line above it when a web view loads |

It is not a variant of Progress. A progress bar names its task, sits on a track with an ink edge, turns `success` when it is full and stays where it is read; the line has no label, no track and no complete color, and it sits on an edge and goes away. Drawn as a Progress, it read as a pill across the top of the page (artin, 2026-11-20, #proj-mobile:#228).

## Anatomy

- `PageLoadingLine`: one part. A 2px `info` line, the full width of the bar, with square ends and no track or border. Put it inside the top bar, which must be `relative` and draws its separator as a 1px `border-b`: the line lies on the bar's outer bottom edge, over the separator, so the two never read as a blue line and a gray one.

## Behavior

The app owns the load and passes `loading`, the `value` the page reports and `failed`; the line owns its timing.

- **Shows late.** It appears only when a load is still going after 200ms, so a page that opens at once never flashes a line.
- **With progress**, it follows the value, easing 200ms to each new one, and only moves forward: a lower value never pulls it back. It stops at 95% while the page still loads: a web engine often reports 100 before the load has ended, so only the end fills the line (Lagoon, mobile#5172, 2026-11-20).
- **Without progress**, it rests still at 8%. It doesn't sweep back and forth: status doesn't loop, and the only looping animation is the pixel spinner ([Motion](../../../../../design/foundations/motion.md)).
- **When the page has loaded**, it fills to the end and then fades out over 200ms.
- **When the load fails**, it goes at once, and the page shows its error.
- **Reduced motion**: the width jumps to each value, and the line goes at once when the load ends.
- Turning `loading` on again starts a new load from nothing.

## Accessibility

- It renders `role="progressbar"`, with `aria-valuenow` when the page has reported progress and none while it hasn't. Give it a name with `aria-label` ("Loading page").
- Don't hide it from assistive technology: it is the only sign that the page is loading.

## Rules

- Put it only on the bottom edge of a top bar that spans the page. It is the one bar that lies on an edge; never put it along a rounded container's edge, where a bar stays on its own track ([Shape](../../../../../design/foundations/shape.md#nothing-on-the-edge-of-a-rounded-container)).
- Keep it `info`. Don't color it pink: a load is passive, and pink means something waits for the person.
- One line per page: a web view's own loading line replaces any Progress or spinner at the top.
