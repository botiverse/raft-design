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

The same intent has different spellings across components. TypeScript rejects an unknown value; in untyped code it silently applies no variant class at all.

| Component                    | negative                           | informational                    |
| ---------------------------- | ---------------------------------- | -------------------------------- |
| `Button`                     | `variant="danger"`                 | `variant="information"`          |
| `Badge`                      | `variant="danger"`                 | `variant="information"`          |
| `Status`                     | `variant="danger"`                 | `variant="information"`          |
| `Progress`                   | `variant="danger"`                 | `variant="information"`          |
| `Banner`                     | `status="destructive"`             | `status="info"`                  |
| toast command / object       | `toast.error()` or `type: "error"` | `toast.info()` or `type: "info"` |
| `NotificationCenterItemIcon` | `status="error"`                   | `status="info"`                  |

Rule: **never carry a variant value from one component to another.** Confirm it against the component you are actually using.

`Button` has three negative variants — `danger` (solid), `danger-secondary`, and `danger-outline`.

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
- Saved, copied, message sent, invite revoked → a toast. The user just did it and already knows the context.
- Someone mentioned you, a task was assigned, a build finished → `NotificationCenter`. It happened out of band and needs to persist.

**Incorrect** — a persistent condition announced once:

```tsx
if (isReadOnly) toast.info("This channel is read-only");
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

**`Banner`** — `status` is required: `default` `destructive` `warning` `info` `success`; `size` is `sm` `md` `lg`. Compose `BannerTitle`, `BannerDescription`, `BannerAction`. Use a `BannerAction` when there is a way out of the condition.

**`Toast`** — wrap the application in `ToastProvider`, then fire the default manager with `toast.info()`, `toast.success()`, `toast.warning()`, `toast.error()`, or `toast.add()`. Dismiss with `toast.dismiss()`.

Configure the provider's default viewport with `viewportPlacement` (`bottom-center`, `bottom-right`, `top-center`, or `top-right`) and `viewportStrategy` (`fixed` or `absolute`). For custom anatomy, set `renderViewport={false}`, compose `ToastPortal` and `ToastViewport`, and put `layout="stacked"` or `layout="inline"` on `ToastRoot`. Use `placement="none"` on a custom `ToastViewport` for anchored positioning.

Call `useToastManager()` inside a provider when custom anatomy needs the provider's manager. Create a scoped manager with `createToastManager()`, pass it to `ToastProvider`, and add or close scoped toasts through that manager instead of the default `toast` commands.

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

`Progress` variants are `primary` `information` `accent` `success` `warning` `danger`; sizes `sm` `md` `lg`. Compose `ProgressHeader`, `ProgressLabel`, `ProgressValue`, `ProgressTrack`, `ProgressIndicator`. If you cannot compute a real percentage, use `Spinner` rather than a fake animated bar.

---

## Badge vs Status

Both are small. They say different things.

|          | `Badge`                                           | `Status`                                                 |
| -------- | ------------------------------------------------- | -------------------------------------------------------- |
| Shape    | a sticker with text                               | a square pixel                                           |
| Says     | what something _is_ — a label, count, or category | what state something is _in_ — online, healthy, failing  |
| Has text | yes                                               | no; add an `aria-label` or pair it with text when needed |

Use `Status` for presence, health, and liveness. It never animates: a working agent is a steady light. Do not animate a dot yourself; the DS forbids looping status animation.

Use `Badge` for counts, tags, roles, and environment labels. `appearance` is `solid` (the default) `soft` `outline`:

- `soft` — ambient metadata, the common case; pass it explicitly.
- `solid` — the badge is the primary signal in its row.
- `outline` — the surface is already busy or already tinted.

---

## EmptyState

For a surface with nothing to show. Inside `EmptyState`, group `EmptyStateIcon`, `EmptyStateTitle`, and `EmptyStateDescription` in `EmptyStateContent`; place `EmptyStateActions` after that content group.

An empty state should say why it is empty and what to do next. Include `EmptyStateActions` whenever the user can act.

Distinguish three cases and do not use the same copy for them:

- Nothing created yet → invite the first action.
- A filter or search matched nothing → offer to clear the filter.
- Loading → this is not an empty state, use `Skeleton`.

`NotificationCenterEmptyState` is the inbox-specific variant; use it inside `NotificationCenter` rather than the generic one.

---

## Per-component norms

**`NotificationCenter`** — set `viewport="desktop" | "mobile"` and `size="sm" | "md" | "lg"` on `NotificationCenterPopup`. Pass `read` to `NotificationCenterItem`, and `status="error" | "warning" | "info" | "success"` to `NotificationCenterItemIcon`. `NotificationCenterActionButton` is always an outline button; it takes no `variant`. Compose item structure from `NotificationCenterItemRow`, `NotificationCenterItemIcon`, `NotificationCenterItemContent`, `NotificationCenterItemTitle`, `NotificationCenterItemBody`, and `NotificationCenterItemActions`. Own read state in the application.

**`Status`** — variants are `default` `primary` `information` `muted` `accent` `success` `warning` `danger`; sizes `xs` `sm` `md` `lg`.

**`Progress`** — always give it an accessible label through `ProgressLabel`, even when the design shows only the bar.
