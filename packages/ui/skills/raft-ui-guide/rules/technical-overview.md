---
name: technical-overview
description: "raft-ui's technical foundations, package contents, and integration contracts."
---

# Technical overview

## Foundations

`raft-ui` provides shared CSS foundations and a React 19 component library built on Base UI, Tailwind CSS v4, and tailwind-variants; the foundation also works with plain HTML and CSS. It has one visual language, Raft, with light, dark, and system modes.

## Package contents

| Entry                    | Contents                                |
| ------------------------ | --------------------------------------- |
| `raft-ui`                | Stable components, providers, and hooks |
| `raft-ui/cn`             | Class merger                            |
| `raft-ui/wip`            | Experimental exports                    |
| `raft-ui/foundation.css` | Native CSS theme variables              |
| `raft-ui/styles.css`     | Tailwind integration                    |
| `raft-ui/fonts.css`      | Optional web fonts                      |

Component declarations live in `dist/index.d.mts` (see [API lookup](./lookup.md)). Version-matched Markdown guides and optional `raft-ui-guide` / `raft-ui-critique` skills ship in `skills/`.

## Plain HTML

Link or inline `dist/foundation.css`; no build is required. Optional `fonts.css` supplies web fonts.

```html
<link rel="stylesheet" href="./foundation.css" />
<style>
  body {
    background: var(--layer-canvas);
    color: var(--foreground);
  }
  article {
    border: 2px solid var(--line-seam);
  }
</style>
```

`.light` / `.dark` set the mode; otherwise the document follows the system. The foundation defines variables, not component markup or interactions.

## React stylesheet contract

```css
@import "tailwindcss";
@import "raft-ui/styles.css";
@source "../node_modules/raft-ui/dist/**/*.{js,mjs}";
```

`@source` is relative to this CSS file and must resolve to the installed package for Tailwind to generate its utilities.

Import optional fonts from the app entry, not inside global CSS (`fonts.css` contains a web-font `@import`):

```ts
import "raft-ui/fonts.css";
```

Custom fonts use `--heading-font`, `--sans-font`, and `--mono-font`.

## Providers

| Provider          | Responsibility                                                        |
| ----------------- | --------------------------------------------------------------------- |
| `ThemeProvider`   | Color mode, persistence, and document mode synchronization            |
| `TooltipProvider` | Shared tooltip behavior when using Tooltip                            |
| `ToastProvider`   | Toast manager when using the toast API; see [Feedback](./feedback.md) |

`ThemeProvider` defaults to light mode. `mode` / `defaultMode` select `light`, `dark`, or `system`; `onModeChange` reports changes. `storageKey` persists an uncontrolled mode.

`useTheme()` exposes `mode`, `resolvedMode` (`light` or `dark`, with `system` resolved), and `setMode`.

## Mode and portal boundaries

- `ThemeProvider` synchronizes `document.documentElement` by default. Nested scopes need `syncDom={false}` and the matching `light`/`dark` class on their root.
- Base UI overlays portal to `document.body`. An app root with `isolation: isolate` keeps its stacking contexts below those surfaces. Embedded previews can use `portalProps.container` (toasts: `ToastProvider portalContainer`) to keep overlays inside their scope.
- SSR apps with persisted mode need to restore it before first paint to avoid a theme flash.

See [Styling](./styling.md) and [Overlays](./overlays.md) for details.
