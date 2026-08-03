---
name: feedback
description: "Feedback and status surfaces: Banner vs toast vs NotificationCenter, Skeleton vs Spinner vs Progress, Badge vs Status, and the inconsistent intent names."
---

# Feedback and status

## Contents

- Intent names are inconsistent — check every time
- Banner vs Toast vs NotificationCenter
- Skeleton vs Spinner vs Progress
- Badge vs Status
- EmptyState
- Per-component norms

---

## Intent names are inconsistent — check every time

The same intent has different spellings across components. This is the most reliable way to get a runtime-silent styling bug, because an unknown variant value simply falls back to the default.

| Component            | negative               | informational           |
| -------------------- | ---------------------- | ----------------------- |
| `Button`             | `variant="danger"`     | `variant="information"` |
| `Badge`              | `variant="danger"`     | `variant="information"` |
| `Status`             | `variant="danger"`     | `variant="information"` |
| `Progress`           | `variant="danger"`     | `variant="information"` |
| `Banner`             | `status="destructive"` | `status="info"`         |
| `Toast`              | `tone="error"`         | `tone="info"`           |
| `NotificationCenter` | `status="error"`       | `status="info"`         |

Three different words for the same intent: `danger`, `destructive`, `error`. Two for informational: `information`, `info`.

Rule: **never carry a variant value from one component to another.** Confirm it against the component you are actually using.

Note also that `Button` alone has three negative variants — `danger` (solid), `danger-secondary`, and `danger-outline` — matching its `primary` / `default` / `outline` ladder.

---

## Banner vs Toast vs NotificationCenter

All three deliver a message. They differ in lifetime and ownership.

|                     | `Banner`                       | `Toast`                | `NotificationCenter`              |
| ------------------- | ------------------------------ | ---------------------- | --------------------------------- |
| Lives in            | the page flow                  | a floating viewport    | an inbox popup                    |
| Lifetime            | as long as the condition holds | seconds                | until read or cleared             |
| Caused by           | page state                     | the user's last action | something that happened elsewhere |
| Survives navigation | yes, if the state does         | no                     | yes                               |
| Can be missed       | no                             | yes                    | no                                |

**Decision rule:** if missing the message would leave the user confused, it must not be a toast.

- Quota exceeded, connection lost, read-only mode, unsaved changes → `Banner`. The condition is still true, so the message must still be visible.
- Saved, copied, message sent, invite revoked → `toast()`. The user just did it and already knows the context.
- Someone mentioned you, a task was assigned, a build finished → `NotificationCenter`. It happened out of band and needs to persist.

**Incorrect** — a persistent condition announced once:

```tsx
if (isReadOnly) toast({ title: "This channel is read-only" });
```

The user scrolls away, the toast expires, and the disabled composer now has no explanation.

**Correct:**

```tsx
{
  isReadOnly && (
    <Banner status="info">
      <BannerDescription>This channel is read-only.</BannerDescription>
    </Banner>
  );
}
```

**`Banner`** — `status` is `default` `destructive` `warning` `info` `success`; `size` is `sm` `md` `lg`. Compose `BannerTitle`, `BannerDescription`, `BannerAction`. Use a `BannerAction` when there is a way out of the condition.

**`Toast`** — `tone` is `info` `success` `warning` `error`. `placement` is `bottom-center` `bottom-right` `top-center` `top-right` `none`; `layout` is `stacked` or `inline`; `strategy` is `fixed` or `absolute`. Set these once on `ToastProvider` / `ToastViewport`, not per toast. Fire toasts with `toast()`; use `useToastManager()` when you need to update or dismiss one you created, and `createToastManager()` for a scoped manager.

Never put a destructive confirmation in a toast. Confirmation is `AlertDialog`.

---

## Skeleton vs Spinner vs Progress

|            | Use when                                                                               |
| ---------- | -------------------------------------------------------------------------------------- |
| `Skeleton` | The layout is known and the content is arriving. Prevents the reflow a spinner causes. |
| `Spinner`  | Work is happening, duration unknown, and there is no layout to reserve.                |
| `Progress` | You know the percentage.                                                               |

Prefer `Skeleton` for first paint of a list, card, or panel — it holds the space. Use `Spinner` inside a button, next to an inline action, or in a small region where a skeleton would look wrong.

`Skeleton` variants are `line` `block` `circle`. Match the shape of what is loading: `circle` for an avatar, `line` for text rows, `block` for a card or image. A skeleton that does not match the final layout is worse than a spinner.

`Spinner` sizes are `xs` `sm` `md` `lg`; `variant` is `default` or `inverse` — use `inverse` on a solid/dark fill.

Do not put a `Spinner` in a `Button` by hand — `Button` has `loading` and `loadingLabel` props.

`Progress` variants are `primary` `information` `accent` `success` `warning` `danger`; sizes `sm` `md` `lg`. Compose `ProgressHeader`, `ProgressLabel`, `ProgressValue`, `ProgressTrack`, `ProgressIndicator`. If you cannot compute a real percentage, use `Spinner` rather than a fake animated bar.

---

## Badge vs Status

Both are small. They say different things.

|          | `Badge`                                           | `Status`                                                |
| -------- | ------------------------------------------------- | ------------------------------------------------------- |
| Shape    | a pill with text                                  | a dot                                                   |
| Says     | what something _is_ — a label, count, or category | what state something is _in_ — online, healthy, failing |
| Has text | yes                                               | optional                                                |

Use `Status` for presence, health, and liveness. Its `pulse` boolean marks live activity and `attention` adds an emphasis ring — do not animate a dot yourself.

Use `Badge` for counts, tags, roles, and environment labels. `appearance` is `solid` `soft` `outline`:

- `soft` — ambient metadata, the common case.
- `solid` — the badge is the primary signal in its row.
- `outline` — the surface is already busy or already tinted.

`uppercase` is a boolean; do not `.toUpperCase()` the string yourself.

---

## EmptyState

For a surface with nothing to show. Compose `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateContent`, `EmptyStateActions`.

An empty state should say why it is empty and what to do next. Include `EmptyStateActions` whenever the user can act.

Distinguish three cases and do not use the same copy for them:

- Nothing created yet → invite the first action.
- A filter or search matched nothing → offer to clear the filter.
- Loading → this is not an empty state, use `Skeleton`.

`NotificationCenterEmptyState` is the inbox-specific variant; use it inside `NotificationCenter` rather than the generic one.

---

## Per-component norms

**`NotificationCenter`** — `viewport` is `desktop` or `mobile`; `size` is `sm` `md` `lg`; items take a `read` boolean and a `status` of `error` `warning` `info` `success`; `actionVariant` is `primary` or `secondary`. Compose the item from `NotificationCenterItemIcon`, `NotificationCenterItemContent`, `NotificationCenterItemTitle`, `NotificationCenterItemBody`, `NotificationCenterItemActions`. Read/unread is product state you own — pass it in, do not expect the component to track it.

**`Status`** — variants are `default` `primary` `information` `muted` `accent` `success` `warning` `danger`; sizes `xs` `sm` `md` `lg`.

**`Progress`** — always give it an accessible label through `ProgressLabel`, even when the design shows only the bar.
