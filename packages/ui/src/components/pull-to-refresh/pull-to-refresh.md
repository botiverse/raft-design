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

It is a hook, `usePullToRefresh`, on the page's existing scroll container, and a part, `PullToRefreshIndicator`, that you render as that container's first child. The browser draws no pull to refresh of its own inside a scroll container or in the installed web app (`display: standalone`), so phone web draws this one. The iOS and Android apps use their own control; this one's indicator, the pixel spinner whose lit pixel walks with the pull, is theirs.

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

- `usePullToRefresh(scrollRef, { onRefresh, disabled })`: required. The gesture on the scroll container `scrollRef` points at. It returns the pull: its state (`idle`, `pulling`, `refreshing`), its distance and its progress towards the threshold.
- `PullToRefreshIndicator`: required. Takes the pull as `pull` and the announcement as `label`. It is the space the pull opens at the top of the list, with the [Spinner](../spinner/spinner.md) in it.

## States

```example
pull-to-refresh/compositions/states
```

- **Pulling**: the spinner stands still and fades in with the pull, and its lit pixel walks clockwise one step for each quarter of the threshold, as in the native apps.
- **Refreshing**: the spinner runs, and the space holds until the promise `onRefresh` returns settles.
- **Failed**: the hook only ends the refresh. In `onRefresh`, keep the content on screen and show a `warning` toast with the same message as a failed first load ([Toast](../toast/toast.md)). Don't show a banner: what is on screen is still useful, only not the newest.

## Behavior

| Value                                                          | Default | Option         |
| -------------------------------------------------------------- | ------- | -------------- |
| Damping: the indicator moves this share of the finger's travel | 0.42    |                |
| Threshold: pulled this far on release, it refreshes            | 56px    | `threshold`    |
| Furthest pull                                                  | 72px    | `maxDistance`  |
| Height while refreshing                                        | 36px    | `holdDistance` |

- It answers a finger only. On a fine pointer (`pointer: fine`) the hook adds no listeners and the indicator stays at 0px.
- A pull starts only when the scroll container is at its top, with one finger. Moving sideways or up first is a swipe or a scroll, not a pull.
- The page scrolls as usual until the finger has moved 6px down; from then on the hook stops the browser scrolling or bouncing for that touch.
- A touch that starts in a text field, a `select`, an editable element or anything inside `[data-pull-to-refresh-ignore]` never pulls. Put the attribute on drag handles and on anything else that moves with a finger, such as a slider or a carousel.
- A finger held still for 500ms before it pulls is a long press: the pull lets go, so a menu or a drag can start ([States](../../../../../design/foundations/states.md#dragging-on-a-touch-screen)). A `contextmenu` or `dragstart` event, or a touch move another handler already took, also ends it.
- While it is on, the scroll container gets `overscroll-behavior-y: contain`, so a browser tab doesn't also reload the whole page. The hook puts the old value back when it turns off.
- A pull during a refresh does nothing.
- With `prefers-reduced-motion`, the space opens and closes without its transition and the spinner doesn't run ([Motion](../../../../../design/foundations/motion.md)).

`disabled` turns it off, such as before the first load has finished or while a search is empty. Don't derive it from the refresh itself: turning it off mid-refresh drops the indicator before the promise settles.

## Accessibility

- The indicator holds a polite live region (`role="status"`) that announces `label` when a refresh starts. Pass the product's own words, such as "Refreshing…": raft-ui holds no copy. The spinner itself is hidden from assistive technology.
- A pull is not reachable without a finger, and that is fine for these pages: each one loads again when it is opened, and screen-reader users can do the same. Don't add a Refresh button on a phone for them ([Navigation](../../../../../design/patterns/navigation.md#refreshing)).

## Rules

- Put the indicator as the first child of the element `scrollRef` points at, so the content moves down with the pull.
- Use one per page, on the page's main list. Nested scroll containers, such as a horizontal row of chips, carry `data-pull-to-refresh-ignore`.
- Return a promise from `onRefresh` that settles when the new content is on screen, not when the request is sent: the indicator stays until then.
