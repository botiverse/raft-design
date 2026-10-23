---
title: PullToRefresh
summary: Pull down from the top of a list on a touch screen to reload it, for phone pages that load a snapshot and don't update themselves; never on a page fed by realtime updates.
status: experimental
aliases: [Pull to refresh, Pull-to-refresh, Swipe to refresh, Refresh control]
layer: core
category: feedback
related: [spinner, toast, scroll-area]
---

# PullToRefresh

Pull to refresh reloads a page when a person pulls its list down from the top with a finger. Use it on a phone page that loads a snapshot when it opens and doesn't update by itself, such as Saved. A page that realtime updates keep current never has it ([Navigation](../../../../../design/patterns/navigation.md#refreshing)).

```example
pull-to-refresh/compositions/preview
```

It is a hook, `usePullToRefresh`, on the page's existing scroll container, and a part, `PullToRefreshIndicator`, that you render as that container's first child. The browser draws no pull to refresh of its own inside a scroll container or in the installed web app (`display: standalone`), so phone web draws this one. The iOS and Android apps use their own control, and this one is tuned to feel the same: its numbers are the iOS app's (mobile #3553), and on Android it takes Material 3's shape ([On Android](#on-android)). On Android its indicator is Android's own, Material 3's progress arc on a small disc, so a pull looks the same in Chrome on Android as in any Android app (decided by stdrc on 2026-10-23). Everywhere else, iOS included, the indicator is the design system's loading icon, the [Spinner](../spinner/spinner.md), never the platform's own spinner (decided by artin).

## When to use

| Situation                                                                                                                                                                                     | Use                                                                                                              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| A phone page that loads a snapshot when it opens: Saved, search results once a search is showing, a channel's or a thread's files, the lists in Settings (invites, join links, apps, billing) | PullToRefresh                                                                                                    |
| A page fed by realtime updates: messages, threads, direct messages, Home's conversation list, Activity, Tasks, Members, Computers and a computer's page, a channel's members                  | Nothing. The page stays current by itself and catches up when the app comes back to the foreground or reconnects |
| A search with no results showing yet                                                                                                                                                          | Nothing. There is nothing to refresh                                                                             |
| A mouse or a trackpad                                                                                                                                                                         | Not this component: it answers a finger only                                                                     |
| A first load that failed                                                                                                                                                                      | Retry in the error state ([Feedback](../../../../../design/patterns/feedback.md#empty-loading-and-failed))       |

Never put pull to refresh on a realtime page: a page that needs a pull to show what is new tells people it may be out of date, and then they pull every page to be sure. A realtime page has to be current without one, and when it isn't, that is a bug to fix in its updates, not something for people to work around.

## Anatomy

- `usePullToRefresh(scrollRef, { onRefresh, disabled })`: required. The gesture on the scroll container `scrollRef` points at. It returns the pull: its state (`idle`, `pulling`, `refreshing`), its distance, its progress towards the threshold, and the platform whose shape it takes (`default` or `android`).
- `PullToRefreshIndicator`: required. Takes the pull as `pull` and the announcement as `label`. It is the space the pull opens at the top of the list, with the [Spinner](../spinner/spinner.md) in it; on Android, Material 3's own indicator instead: a 40px disc with a progress arc in it that travels down over the list.

## States

```example
pull-to-refresh/compositions/states
```

The top row is the default shape, with the Spinner; the bottom row is Android's, described under [On Android](#on-android). The states below are the default shape's.

- **Pulling**: the spinner stands still and fades in with the pull, and its lit pixel walks clockwise one step for each quarter of the threshold (25px), so it shows how close a release is to refreshing. At the threshold the pull is armed: the spinner is fully in and the last pixel lit.
- **Refreshing**: the spinner runs, and the indicator holds at 60px until the promise `onRefresh` returns settles.
- **Failed**: the hook only ends the refresh. In `onRefresh`, keep the content on screen and show a `warning` toast with the same message as a failed first load ([Toast](../toast/toast.md)). Don't show a banner: what is on screen is still useful, only not the newest.

## Behavior

| Value                                                                 | Default         | Option         |
| --------------------------------------------------------------------- | --------------- | -------------- |
| Rubber band: the indicator moves this share of the finger's travel    | 0.55            |                |
| Threshold: pulled this far, the pull is armed and a release refreshes | 100px           | `threshold`    |
| Furthest pull                                                         | 140px           | `maxDistance`  |
| Height while refreshing                                               | 60px            | `holdDistance` |
| Snap-back, after the finger lifts or the refresh ends                 | 300ms, ease-out |                |

- It answers a finger only. On a fine pointer (`pointer: fine`) the hook adds no listeners and the indicator stays at 0px.
- A pull starts only when the scroll container is at its top, with one finger. Moving sideways or up first is a swipe or a scroll, not a pull.
- The page scrolls as usual until the finger has moved 6px down; from then on the hook stops the browser scrolling or bouncing for that touch.
- A touch that starts in a text field, a `select`, an editable element or anything inside `[data-pull-to-refresh-ignore]` never pulls. Put the attribute on drag handles and on anything else that moves with a finger, such as a slider or a carousel.
- A finger held still for 500ms before it pulls is a long press: the pull lets go, so a menu or a drag can start ([States](../../../../../design/foundations/states.md#dragging-on-a-touch-screen)). A `contextmenu` or `dragstart` event, or a touch move another handler already took, also ends it.
- While it is on, the scroll container gets `overscroll-behavior-y: contain`, so a browser tab doesn't also reload the whole page. The hook puts the old value back when it turns off.
- An armed pull keeps the touch while it is armed: the page doesn't scroll under it.
- A pull during a refresh does nothing.
- With `prefers-reduced-motion`, the indicator snaps back without its transition and the spinner doesn't run; on Android the arc holds still while refreshing and the disc goes at once ([Motion](../../../../../design/foundations/motion.md)).

`disabled` turns it off, such as before the first load has finished or while a search is empty. Don't derive it from the refresh itself: turning it off mid-refresh drops the indicator before the promise settles.

### Why these numbers

- **They are the iOS app's.** The mobile team settled them for the iOS app (mobile #3553) and the product lead approved them, so a pull feels the same in the app and on phone web.
- **0.55** is the rubber band of iOS's own scroll views: the list lags the finger, so the pull reads as resistance. The threshold takes about 182px of finger travel, so a refresh needs a deliberate pull.
- **The threshold latches, except on Android.** Once the pull passes 100px it stays armed until the finger lifts, even if the finger moves back up first; a release then refreshes, as with iOS's `UIRefreshControl`. People who pull past the point and ease off still get the refresh they asked for. Only a cancel (the browser taking the touch, a second finger) lets an armed pull go. Android doesn't latch: Material 3 lets a pull be taken back; iOS commits once armed ([On Android](#on-android)).
- **140px** is the ceiling: 40px past the threshold shows the pull is armed and still alive, and a hard stop there keeps a long drag from pushing the list off a small phone's screen.
- **60px** while refreshing is the iOS app's height. It is below the threshold, so on release the indicator settles back up and gives the list back some of the room the pull took.
- **The snap-back** takes 300ms with `ease-slide`, an ease-out curve that never passes its end: the indicator settles where it goes, with no overshoot or bounce, because a bounce would read as a second pull. With `prefers-reduced-motion` it snaps at once.

### On Android

On Android (by the user agent) the pull follows Material 3's pull to refresh, and its indicator is Android's own, so it looks like the rest of the phone. Decided by stdrc on 2026-10-23: on Android web the indicator is Material's, which overrides the earlier rule of the Spinner on every platform for Android only; iOS and every other platform keep the Spinner. A pull is a system gesture, and on Android people know it by Material's arc: Chrome draws it for a page, and every Android app draws it for a list. The Spinner there read as a different control.

```example
pull-to-refresh/compositions/android
```

From left to right: pulling, armed, disarmed and refreshing.

- **The disc.** A 40px circle on `layer-popover`, white in light mode and the raised dark surface in dark mode, with the `elevation-float` shadow: it floats over the list for a moment, like a popup ([Elevation](../../../../../design/foundations/elevation.md)). It has no outline, as Material's has none: the shadow sets it off the light page, and in dark mode the raised surface is lighter than the canvas. It travels down over the list, which stays still: no rubber-band stretch of the content. It still moves 0.55 of the finger's travel.
- **Pulling.** Inside the disc a 2.5px arc of radius 7.5px grows with the pull, as Material draws it: nothing for the first 40% of the threshold, then up to 0.8 of the circle at the threshold, turning a little as it grows, with an arrowhead at its end. Until the pull is armed the arc is at 30% opacity.
- **Armed.** Past the threshold the arc is fully opaque, and the phone ticks once (`navigator.vibrate(10)`), where the browser supports it. Elsewhere there is no vibration.
- **Disarmed.** There is no latch: Material 3 lets a pull be taken back; iOS commits once armed. Moving back above the threshold before release disarms the pull: the arc goes back to 30% opacity, the arrowhead stays, and the release then doesn't refresh. Crossing the threshold again arms it again, with another tick.
- **Refreshing.** The disc holds at 60px and the arc runs Material's indeterminate animation: it turns once every 1.4s while it grows and shrinks.
- **Finished.** When the refresh ends, the disc scales down to nothing where it held, in 150ms, as Material's does. A pull released short of the threshold slides back up instead, in the usual 300ms snap-back.
- **The arc is `info-strong`.** Material draws it in the theme's primary color. In Raft, cyan means progress ([Color](../../../../../design/foundations/color.md#meanings-of-color): progress bars, In Progress), and Raft's primary, yellow, means "you", and is 1.3:1 on white. The arc is a thin line with no ink edge, so it takes the strong tier of cyan: 11:1 on the white disc and 8:1 on the dark one, where `info` itself would be 1.9:1, below the 3:1 a graphic needs.
- **Reduced motion.** With `prefers-reduced-motion`, the arc holds still at three quarters of the circle while refreshing, and the disc moves and goes without transitions.

Everything else is the same as the default shape: the numbers and the snap-back. `platform` overrides the detected platform, such as in a preview. Every other touch screen, iOS included, gets the default shape, in which the content moves down with the pull and the Spinner shows it.

## Accessibility

- The indicator holds a polite live region (`role="status"`) that announces `label` when a refresh starts. Pass the product's own words, such as "Refreshing…": raft-ui holds no copy. The spinner, or Android's arc, is hidden from assistive technology.
- A pull is not reachable without a finger, and that is fine for these pages: each one loads again when it is opened, and screen-reader users can do the same. Don't add a Refresh button on a phone for them ([Navigation](../../../../../design/patterns/navigation.md#refreshing)).

## Rules

- Put the indicator as the first child of the element `scrollRef` points at, so the content moves down with the pull.
- Use one per page, on the page's main list. Nested scroll containers, such as a horizontal row of chips, carry `data-pull-to-refresh-ignore`.
- Return a promise from `onRefresh` that settles when the new content is on screen, not when the request is sent: the indicator stays until then.
