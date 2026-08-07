---
name: setup
description: "First-time install: stylesheet order, fonts, ThemeProvider props, reading the theme, package entry points."
---

# Setup

## Install

```bash
pnpm add raft-ui
```

The package declares `react@^19` and `react-dom@^19` as peers. It also requires a Tailwind CSS v4 build pipeline. If the app does not have one yet, install `tailwindcss` and the integration for its build tool; for Vite:

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

Register the Vite plugin rather than stopping after package installation:

```ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
});
```

This is the Vite path. For another framework, use its Tailwind CSS v4 integration and keep the stylesheet contract below; do not copy the Vite plugin into a Next.js or PostCSS setup.

## Stylesheet

Load the package source hint, token layer, and Tailwind once from the global CSS file:

```css
@import "tailwindcss";
@import "raft-ui/styles.css";
@source "../node_modules/raft-ui/dist/**/*.{js,mjs}";
```

`@source` is relative to this CSS file; adjust the path when the file lives at another depth. Without it, Tailwind does not generate the utility classes emitted by components in `node_modules`. `styles.css` supplies the token and theme scopes.

`fonts.css` is optional. It starts with a web-font `@import`, so load it as a separate stylesheet from the application entry instead of nesting it in the global CSS file:

```ts
import "raft-ui/fonts.css";
import "./styles.css";
```

Skip it when providing your own fonts; assign `--heading-font`, `--sans-font`, and `--mono-font` instead.

## First render

Verify the setup with one real component before composing a page:

```tsx
import { Button, ThemeProvider } from "raft-ui";

export function App() {
  return (
    <ThemeProvider>
      <Button variant="primary">Save</Button>
    </ThemeProvider>
  );
}
```

The button should render with raft-ui typography, tokens, and interaction styling rather than native browser button styling. If it does not, check the build integration, stylesheet imports, and `@source` path before adding component-level classes.

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

The isolated layout root keeps the app's stacking contexts below Base UI surfaces portaled to `document.body`. If the layout does not use Tailwind, apply `isolation: isolate` in CSS. Keep body portals by default; set a portal container only for an iframe, preview, or embedded shell.

| Prop                                       | Purpose                                                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `theme` / `defaultTheme` / `onThemeChange` | Visual family: `"brutal"` or `"elegant"`. The default family is `"brutal"`                                                                                               |
| `mode` / `defaultMode` / `onModeChange`    | `"light"` \| `"dark"` \| `"system"`. Applies to the `elegant` family; the default mode is `"light"`                                                                      |
| `storageKey` / `modeStorageKey`            | Persist uncontrolled selections. The mode key defaults to `storageKey + "-mode"`                                                                                         |
| `syncDom`                                  | Writes the active family/mode onto `document.documentElement`. Defaults to true; set `false` for nested previews and component islands that must not mutate the app root |

For a nested theme preview, control `theme` and `mode`, set `syncDom={false}`, and put the matching `data-theme` plus `light`/`dark` class on its layout root. Keep that preview's portals inside its container when they must remain within the embedded stacking or clipping boundary. Pass the container through the overlay content's verified `portalProps.container` API; check the installed declarations because the exact content part differs by overlay.

In server-rendered apps, replay a persisted mode before first paint or use the framework's established theme bootstrap so the initial HTML does not flash the wrong mode. Keep document access inside the client boundary.

## Reading the theme

```tsx
import { useTheme, useThemeFamily, BrutalOnly, ElegantOnly } from "raft-ui";

const { theme, mode, resolvedMode, setTheme } = useTheme();
const family = useThemeFamily();
```

Use `BrutalOnly` and `ElegantOnly` only for non-semantic decoration or a rare family-specific implementation that preserves the same content, reading order, actions, and state. Prefer tokens and component recipes for ordinary visual adaptation. Do not use theme guards to create different workflows or business DOM.

## Entry points

| Import               | Contents                                             |
| -------------------- | ---------------------------------------------------- |
| `raft-ui`            | Stable component and hook surface                    |
| `raft-ui/cn`         | `cn` class merger                                    |
| `raft-ui/wip`        | Unstable work in progress — may break in any release |
| `raft-ui/styles.css` | Required token layer                                 |
| `raft-ui/fonts.css`  | Optional web fonts                                   |
