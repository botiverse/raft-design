---
name: technical-overview
description: "rUI's technical foundations, package contents, and integration contracts."
---

# Technical overview

## Foundations

`raft-ui` provides shared CSS foundations and a React 19 component library. The components use Tailwind CSS v4; the foundation works with plain HTML and CSS.

- **Base UI** provides headless interaction behavior where applicable: focus, keyboard navigation, and overlays.
- **Tailwind variants** defines component recipes; semantic CSS tokens supply colors, typography, spacing, and shadows.
- **Brutal and Elegant** share component APIs. Elegant supports light, dark, and system modes.
- **Compound components** expose structure for composition. Content, data, and workflows belong to the consuming app.

## Package contents

| Entry                    | Contents                                |
| ------------------------ | --------------------------------------- |
| `raft-ui`                | Stable components, providers, and hooks |
| `raft-ui/cn`             | Class merger                            |
| `raft-ui/wip`            | Experimental exports                    |
| `raft-ui/foundation.css` | Native CSS theme variables              |
| `raft-ui/styles.css`     | Tailwind integration                    |
| `raft-ui/fonts.css`      | Optional web fonts                      |

Component declarations live in `dist/index.d.mts`. Version-matched Markdown guides and optional `raft-ui-guide` / `raft-ui-critique` skills ship in `skills/`.

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
    border: 2px solid var(--line);
    box-shadow: var(--theme-shadow-md);
  }
</style>
```

Brutal is the default. `data-theme="elegant"` selects Elegant; `.light` / `.dark` set its mode, otherwise it follows the system. The foundation defines variables, not component markup or interactions.

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
| `ThemeProvider`   | Theme family, mode, persistence, and document theme synchronization   |
| `TooltipProvider` | Shared tooltip behavior when using Tooltip                            |
| `ToastProvider`   | Toast manager when using the toast API; see [Feedback](./feedback.md) |

`ThemeProvider` defaults to Brutal and light mode. `theme` / `defaultTheme` select the family; `mode` / `defaultMode` select Elegant's mode. `storageKey` persists uncontrolled selections; `modeStorageKey` defaults to `storageKey + "-mode"`.

`useTheme()` exposes `theme`, `mode`, `resolvedMode`, and `setTheme`. For example, `setTheme("elegant", { mode: "dark" })` switches both family and mode.

## Theme and portal boundaries

- `ThemeProvider` synchronizes `document.documentElement` by default. Nested themes need `syncDom={false}` and matching `data-theme` and `light`/`dark` classes on their root.
- Base UI overlays portal to `document.body`. An app root with `isolation: isolate` keeps its stacking contexts below those surfaces. Embedded previews can use `portalProps.container` to keep overlays inside their scope.
- SSR apps with persisted mode need to restore it before first paint to avoid a theme flash.
- Use semantic tokens for theme differences. `BrutalOnly` and `ElegantOnly` are for decoration, not different workflows.

See [Styling](./styling.md) and [Overlays](./overlays.md) for details.
