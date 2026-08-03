---
name: setup
description: "First-time install: stylesheet order, fonts, ThemeProvider props, reading the theme, package entry points."
---

# Setup

## Install

```bash
npm i raft-ui
```

Declared peers: `react@^19` and `react-dom@^19`. Tailwind CSS v4 is not a declared peer but is required in practice — `styles.css` is authored against v4's `@theme inline`.

## Stylesheet

Import Tailwind first, then the raft-ui token layer. Order matters — the token contract layers on top of Tailwind's base.

```css
@import "tailwindcss";
@import "raft-ui/styles.css";
```

`styles.css` defines every oklch token, the `@theme inline` shadow utilities, and the `brutal` / `elegant` family scopes. Without it, components render unstyled.

Optional web fonts:

```css
@import "raft-ui/fonts.css";
```

## Theme provider

Wrap the app once. Components resolve their family from this provider — they never take a `theme` prop themselves.

```tsx
import { ThemeProvider } from "raft-ui";

<ThemeProvider defaultTheme="elegant" defaultMode="system">
  <App />
</ThemeProvider>;
```

| Prop                                       | Purpose                                                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `theme` / `defaultTheme` / `onThemeChange` | Visual family: `"brutal"` or `"elegant"`                                                                                                                                 |
| `mode` / `defaultMode` / `onModeChange`    | `"light"` \| `"dark"` \| `"system"`. Applies to the `elegant` family                                                                                                     |
| `storageKey` / `modeStorageKey`            | Persist uncontrolled selections. The mode key defaults to `storageKey + "-mode"`                                                                                         |
| `syncDom`                                  | Writes the active family/mode onto `document.documentElement`. Defaults to true; set `false` for nested previews and component islands that must not mutate the app root |

Use the controlled `theme` prop with `syncDom={false}` for isolated previews or a component matrix that should not own global DOM state.

## Reading the theme

```tsx
import { useTheme, useThemeFamily, BrutalOnly, ElegantOnly } from "raft-ui";

const { theme, mode, resolvedMode, setTheme } = useTheme();
const family = useThemeFamily();
```

Render family-specific content with the guards rather than branching on a prop:

```tsx
<BrutalOnly>
  <HardEdgedBanner />
</BrutalOnly>
<ElegantOnly>
  <SoftBanner />
</ElegantOnly>
```

## Entry points

| Import               | Contents                                             |
| -------------------- | ---------------------------------------------------- |
| `raft-ui`            | Stable component and hook surface                    |
| `raft-ui/cn`         | `cn` class merger                                    |
| `raft-ui/wip`        | Unstable work in progress — may break in any release |
| `raft-ui/styles.css` | Required token layer                                 |
| `raft-ui/fonts.css`  | Optional web fonts                                   |
