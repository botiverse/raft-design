---
name: setup
description: "First-time install: stylesheet order, fonts, ThemeProvider props, reading the theme, package entry points."
---

# Setup

## Install

```bash
pnpm add raft-ui
```

Requires React 19 and Tailwind CSS v4 configured for your framework.

## Stylesheet

In your global CSS:

```css
@import "tailwindcss";
@import "raft-ui/styles.css";
@source "../node_modules/raft-ui/dist/**/*.{js,mjs}";
```

`@source` must point from this CSS file to the installed package so Tailwind generates its utilities.

Optional fonts: import from the app entry, not inside global CSS (`fonts.css` contains a web-font `@import`):

```ts
import "raft-ui/fonts.css";
import "./styles.css";
```

Skip it when providing your own fonts; assign `--heading-font`, `--sans-font`, and `--mono-font` instead.

## App shell

Wrap the app once with `ThemeProvider`. Add `TooltipProvider` only when using Tooltip, and add one `ToastProvider` when using the toast API.

```tsx
import { ThemeProvider, ToastProvider, TooltipProvider } from "raft-ui";

export function AppShell() {
  return (
    <div className="isolate">
      <ThemeProvider>
        <ToastProvider>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </ToastProvider>
      </ThemeProvider>
    </div>
  );
}
```

`isolate` (`isolation: isolate`) keeps app stacking contexts below body portals. Use a custom portal container only for embedded surfaces such as previews and iframes.

| Prop                                       | Purpose                                                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `theme` / `defaultTheme` / `onThemeChange` | Visual family: `"brutal"` or `"elegant"`. The default family is `"brutal"`                                                                                               |
| `mode` / `defaultMode` / `onModeChange`    | `"light"` \| `"dark"` \| `"system"`. Applies to the `elegant` family; the default mode is `"light"`                                                                      |
| `storageKey` / `modeStorageKey`            | Persist uncontrolled selections. The mode key defaults to `storageKey + "-mode"`                                                                                         |
| `syncDom`                                  | Writes the active family/mode onto `document.documentElement`. Defaults to true; set `false` for nested previews and component islands that must not mutate the app root |

Nested themes need `syncDom={false}` and matching `data-theme` and `light`/`dark` classes on their root. Keep embedded overlays in that root with `portalProps.container`; see [Styling](./styling.md) and [Overlays](./overlays.md).

For SSR, restore persisted mode before first paint to avoid a theme flash.

## Reading the theme

```tsx
import { useTheme } from "raft-ui";

const { theme, mode, resolvedMode, setTheme } = useTheme();

setTheme("brutal");
setTheme("elegant", { mode: "dark" }); // light | dark | system
```

Use semantic tokens for theme differences. `BrutalOnly` and `ElegantOnly` are for decoration, not different workflows.

For toast usage, see [Feedback](./feedback.md).

## Optional agent skills

`raft-ui` ships `raft-ui-guide` for implementation and `raft-ui-critique` for review. The Markdown guides also work without a skill loader.

For TanStack Intent, add to `package.json`:

```json
{
  "intent": {
    "skills": ["raft-ui"]
  }
}
```

Load the relevant skill:

```bash
pnpm dlx @tanstack/intent@latest install --map
pnpm dlx @tanstack/intent@latest load raft-ui#raft-ui-guide
pnpm dlx @tanstack/intent@latest load raft-ui#raft-ui-critique
```

## Entry points

| Import               | Contents                                             |
| -------------------- | ---------------------------------------------------- |
| `raft-ui`            | Stable component and hook surface                    |
| `raft-ui/cn`         | `cn` class merger                                    |
| `raft-ui/wip`        | Unstable work in progress — may break in any release |
| `raft-ui/styles.css` | Required token layer                                 |
| `raft-ui/fonts.css`  | Optional web fonts                                   |
