---
title: Use raft-ui
summary: How to install raft-ui, set up its stylesheets, Tailwind CSS v4 and dark mode, render a first component, upgrade between versions, and where the tokens and the agent entry points are.
---

# Use raft-ui

raft-ui is the React implementation of the Raft Design System, published as `@botiverse/raft-ui`. It contains the CSS foundations (the tokens as CSS variables), which work in plain HTML, and React components built on Base UI and Tailwind CSS v4. Product code uses raft-ui instead of its own copies of these components.

## Install

raft-ui needs React 19 and, for the components, Tailwind CSS v4.

```bash
pnpm add @botiverse/raft-ui
```

The package's entry points:

| Import | Contains |
| --- | --- |
| `@botiverse/raft-ui` | Stable components, providers and hooks |
| `@botiverse/raft-ui/wip` | Experimental components; their API can change in any release |
| `@botiverse/raft-ui/cn` | The class merger, `cn` |
| `@botiverse/raft-ui/styles.css` | The Tailwind CSS v4 integration; it imports `foundation.css` |
| `@botiverse/raft-ui/foundation.css` | The theme variables alone, for pages without React or Tailwind |
| `@botiverse/raft-ui/fonts.css` | Optional web fonts: Space Grotesk and Space Mono |
| `@botiverse/raft-ui/tokens.json` | Every token in the Design Tokens Community Group format |

## Set up the styles

### With React and Tailwind CSS v4

Import Tailwind and raft-ui's styles in your global stylesheet, and point Tailwind at the installed package so it generates the utilities the components use:

```css
@import "tailwindcss";
@import "@botiverse/raft-ui/styles.css";
@source "../node_modules/@botiverse/raft-ui/dist/**/*.{js,mjs}";
```

`@source` is relative to this CSS file and must resolve to the installed package.

Import the fonts from the app entry:

```ts
import "@botiverse/raft-ui/fonts.css";
```

`fonts.css` starts with a web-font `@import`. If you import it from a stylesheet instead, put it first in that file, because a CSS `@import` must come before other rules. To use other fonts, set `--heading-font`, `--sans-font` and `--mono-font`.

### Without React or Tailwind

Link `foundation.css`, or copy it beside your HTML. It defines the same theme variables the components use, without component markup, interactions or a CSS reset:

```html
<link rel="stylesheet" href="./foundation.css" />
<style>
  body {
    background: var(--layer-canvas);
    color: var(--foreground);
  }
</style>
```

## Theme and dark mode

Raft has one visual language, in light and dark mode; components adapt to the mode themselves. Pick the mode with a class on the root: `class="light"` or `class="dark"`. Without either, the page follows the system setting.

In a React app, wrap the app in `ThemeProvider`. It sets the mode class and `color-scheme` on `document.documentElement`, and tracks whether the person last navigated with the keyboard or a pointer, so focus rings show only after keyboard navigation ([States](../foundations/states.md#focus)).

```tsx
import { ThemeProvider } from "@botiverse/raft-ui";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultMode="system" storageKey="theme">
      {children}
    </ThemeProvider>
  );
}
```

- `mode` or `defaultMode` is `light`, `dark` or `system`; the default is `light`. `onModeChange` reports changes, and `storageKey` keeps an uncontrolled mode in `localStorage`.
- `useTheme()` returns `mode`, `resolvedMode` (`light` or `dark`, with `system` resolved) and `setMode`.
- A nested scope, such as a preview, uses `syncDom={false}` and puts the matching `light` or `dark` class on its own root. It leaves the root alone, including the modality.
- An app without `ThemeProvider` calls `installInputModality()` once on the client (it returns a function that removes it). It sets `data-input-modality` on `document.documentElement` to `pointer` or `keyboard`; without it every focus ring shows on `:focus-visible`, as browsers decide.
- An app rendered on the server that keeps the mode has to restore it before the first paint, or the page flashes the other mode.

Two more providers are needed only with their components: `TooltipProvider` for tooltips and `ToastProvider` for the toast API ([Toast](../../packages/ui/src/components/toast/toast.md)).

Base UI overlays portal to `document.body`. Give the app root `isolation: isolate` so its stacking contexts stay below them.

## A first component

```tsx
import { Button } from "@botiverse/raft-ui";

export function CreateTaskButton() {
  return <Button variant="primary">Create Task</Button>;
}
```

`variant="primary"` is the pink sticker for the one action a screen exists for; every other action uses the default variant. Each component's page lists its variants, parts and props, generated from the code, and its rules. Check a prop there or in `node_modules/@botiverse/raft-ui/dist/index.d.mts` rather than guessing it: names differ between components (the negative intent is `danger` on Button and `destructive` on Banner).

Two rules hold for everything you build with raft-ui:

- Use real elements. Anything clickable is a `<button>` or an `<a>` with an `href`; checkboxes and radios hold a native input; a switch is a button with `role="switch"`.
- Give every icon-only button an `aria-label`.

Which component to use for which job is in the [components overview](../components/overview.md) and [Choosing a component](../components/overview.md).

## Versions and upgrading

raft-ui is pre-1.0: a minor version can include breaking changes. Each release lists them, with what to change, in the [changelog](../../packages/ui/CHANGELOG.md).

A component's status follows where it is exported:

| Status | Exported from | Meaning |
| --- | --- | --- |
| Stable | `@botiverse/raft-ui` | Breaking changes follow the versioning above |
| Experimental | `@botiverse/raft-ui/wip` | The API can change in any release |
| Deprecated | `@botiverse/raft-ui`, marked `@deprecated` | Still works; its page names the replacement. Removed in the next major version |

### Codemods

The package ships two codemods. Up to 0.6.0 the package was published as `raft-ui`; to move a project to `@botiverse/raft-ui` and the current token names:

```bash
pnpm add @botiverse/raft-ui
node node_modules/@botiverse/raft-ui/codemods/package-name.mjs src
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs src
pnpm remove raft-ui
```

- `package-name.mjs` rewrites imports, CSS `@import` and `@source` paths and the dependency. It lists any bare `"raft-ui"` strings (bundler aliases, path mappings) for you to change by hand.
- `token-names.mjs` rewrites Tailwind utilities and `var(--…)` references from the former token names to the current ones. The former names keep working as deprecated aliases until 1.0.

After `token-names.mjs`, review two kinds of code by hand:

- **Guards that forbid a name.** A lint rule, a test or an allowlist that bans a former name has that name rewritten too, so it now bans the current one. Put the former name back there.
- **Patterns built from parts.** A regular expression that assembles a token name from parts isn't a literal token, so it keeps the former name and stops matching the rewritten source. Widen it to the current name.

If a package you depend on declares `raft-ui` as a peer dependency, also install `"raft-ui": "npm:@botiverse/raft-ui@<version>"`, so it resolves to the same copy instead of bundling a second one.

## Tokens

`@botiverse/raft-ui/tokens.json` holds every color, elevation and metric token in the [Design Tokens Community Group format](https://www.designtokens.org/), with light and dark values. It is the single source for token values: `foundation.css` is generated from it, and so are the token tables in these docs. Use it for design tools and code generators.

Which token to use for what is in the foundations, starting with [Color](../foundations/color.md).

## For agents

Every page of these docs is available to agents as Markdown:

- **[`llms.txt`](https://raft-design.botiverse.build/llms.txt)** lists every page with its one-line summary.
- **Any page as Markdown**: its path plus `.md`, for example `https://raft-design.botiverse.build/components/button.md`. A component page includes its API, generated from the code.
- **[`components.json`](https://raft-design.botiverse.build/components.json)** lists every component with its status, other names, summary and doc URLs.
- **Agent Skills** ship in the npm package and match its version: `raft-ui-guide` for adopting raft-ui and looking up its API, and `raft-ui-critique` for visual, interaction, accessibility and light and dark review.

The skills use the standard `skills/*/SKILL.md` layout. With TanStack Intent, allow them in the consuming project's `package.json`:

```json
{
  "intent": {
    "skills": ["@botiverse/raft-ui"]
  }
}
```

Then install the project guidance and load a skill:

```bash
pnpm dlx @tanstack/intent@latest install --map
pnpm dlx @tanstack/intent@latest load @botiverse/raft-ui#raft-ui-guide
pnpm dlx @tanstack/intent@latest load @botiverse/raft-ui#raft-ui-critique
```

Other installers that read the same layout, such as `skills-npm` or Vercel `skills`, work too.

## Related

- [Designing a new feature](../principles/designing-a-new-feature.md): how to choose and compose components for new work.
- [Components overview](../components/overview.md): every component, by what it is for.
- [Package README](../../packages/ui/README.md): the same setup, next to the code.
