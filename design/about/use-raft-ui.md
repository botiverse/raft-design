---
title: Use raft-ui
summary: How to install raft-ui, set up its stylesheets, Tailwind CSS v4 and dark mode, render a first component, upgrade between versions, turn on its lint rules, and where the tokens and the agent entry points are.
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
| `@botiverse/raft-ui/lint` | The design system's lint rules for app code, as a lint plugin ([Lint rules](#lint-rules)) |

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
- An app without `ThemeProvider` calls `installInputModality()` once on the client (it returns a function that removes it). It sets `data-input-modality` on `document.documentElement` to `pointer`, `keyboard` or `virtual` once there is evidence (no value at first), and only `pointer` hides rings; without it every focus ring shows on `:focus-visible`, as browsers decide.
- An app rendered on the server that keeps the mode has to restore it before the first paint, or the page flashes the other mode.

Two more providers are needed only with their components: `TooltipProvider` for tooltips and `ToastProvider` for the toast API ([Toast](../../packages/ui/src/components/toast/toast.md)).

Base UI overlays portal to `document.body`. Give the app root `isolation: isolate` so its stacking contexts stay below them.

## A first component

```tsx
import { Button } from "@botiverse/raft-ui";

export function CreateTaskButton() {
  return <Button variant="primary">Create task</Button>;
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
| Deprecated | `@botiverse/raft-ui`, marked `@deprecated` | Still works; its page names the replacement. Removed in a later release that lists breaking changes (before 1.0, a minor version) |

### Codemods

The package ships two codemods. Up to 0.6.0 the package was published as `raft-ui`; to move a project to `@botiverse/raft-ui` and the current token names:

```bash
pnpm add @botiverse/raft-ui
node node_modules/@botiverse/raft-ui/codemods/package-name.mjs src
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs src
pnpm remove raft-ui
```

- `package-name.mjs` rewrites imports, CSS `@import` and `@source` paths and the dependency. It lists any bare `"raft-ui"` strings (bundler aliases, path mappings) for you to change by hand.
- `token-names.mjs` rewrites Tailwind utilities and `var(--…)` references from the former token names to the current ones. The former names were deprecated aliases up to 0.56 and are removed after it, so run it before upgrading past 0.56.

After `token-names.mjs`, review two kinds of code by hand:

- **Guards that forbid a name.** A lint rule, a test or an allowlist that bans a former name has that name rewritten too, so it now bans the current one. Put the former name back there.
- **Patterns built from parts.** A regular expression that assembles a token name from parts isn't a literal token, so it keeps the former name and stops matching the rewritten source. Widen it to the current name.

If a package you depend on declares `raft-ui` as a peer dependency, also install `"raft-ui": "npm:@botiverse/raft-ui@<version>"`, so it resolves to the same copy instead of bundling a second one.

## Lint rules

Some of the design system's rules can be checked in an app's own code, such as "every region that scrolls is a ScrollArea". raft-ui ships them as a lint plugin, `@botiverse/raft-ui/lint`, in the ESLint plugin format, which Oxlint loads as a JS plugin. Turn on its recommended config once: it lists every rule the plugin has, so a rule added in a later release reaches the app with the upgrade, without a change to the app's lint config or to the instructions its agents follow (such as AGENTS.md). The changelog lists each new rule under Added; fix what it reports, or explain the exception, when you upgrade.

### Turn them on in Oxlint

Extend the recommended config from the app's `.oxlintrc.json`. Oxlint's `extends` takes a path to a file, relative to the config that extends it, so point it at the installed package:

```jsonc
{
  "extends": ["./node_modules/@botiverse/raft-ui/dist/lint/recommended.json"],
  // The app's own plugins, jsPlugins and rules stay as they are.
}
```

The recommended config adds the plugin to `jsPlugins` and turns every rule on as an error. A rule an app can't pass yet ships off in it, and turns on as an error once the app has moved (the changelog says which; none today). An app can turn such a rule on early in its own `rules`, as `"warn"` or `"error"`; the app's own `jsPlugins` are kept next to it. It sets `plugins` to an empty list, so the app's own `plugins` stay exactly as they are: an extended config that leaves `plugins` out counts as Oxlint's default plugins and would turn back on the ones the app left out, such as `unicorn`. An app that doesn't set `plugins` keeps Oxlint's defaults. A rule set in the app's `rules` overrides it, such as `"raft-ui/prefer-scroll-area": "warn"` while existing reports are cleared. Run Oxlint as before: nothing on the command line changes.

- JS plugins are an alpha feature of Oxlint, outside its semver. The plugin is tested with Oxlint 1.85, 1.87 and 1.91.
- `@botiverse/raft-ui` has to be installed in the package whose config extends it, as a dependency or a dev dependency.

### Turn them on in ESLint

In a flat config, add the recommended config:

```js
import raftUi from "@botiverse/raft-ui/lint";

export default [raftUi.configs.recommended];
```

### Rules

| Rule | Reports | Rule source |
| --- | --- | --- |
| `raft-ui/prefer-scroll-area` | A class that makes an element scroll natively: `overflow-auto`, `overflow-scroll` and their `-x-` and `-y-` forms, with any variant (`md:overflow-y-auto`), as an arbitrary value (`overflow-y-[scroll]`, `overflow-[hidden_auto]`) or as an arbitrary property (`[overflow-y:auto]`, `[overflow:overlay]`). It is read in the value of a `className`, `class`, `classNames`, `…ClassName`, `…ClassNames` or `…Class` attribute, in a property with such a name (a recipe slot's `className` option) and in the default of a parameter with one (`{ className = "…" }`), through one call that isn't a class helper (`className={wrap("overflow-y-auto")}`) and a function that returns the class (`className={(state) => …}`); in an argument of `cn`, `clsx`, `cx`, `tv`, `cva`, `twMerge`, `twJoin` or `classNames`; in an argument of the call a JSX spread spreads (`{...guard("overflow-x-auto")}`); and in a `const` of the same file that is used as a class there: a string, a list joined into one (`[…].join(" ")`), a const built from another (``const b = `p-2 ${a}` ``), or an object or variant map, of which the members read as a class count (`cls.body`), all of them when it is read by a computed key (`VARIANTS[kind]`). Also a `style` whose `overflow`, `overflowX` or `overflowY` has `auto`, `scroll` or `overlay` in it (`"hidden auto"` too): in a `style` attribute, under a `style` key (`{...{ style: { … } }}`), or in a `const` object of the same file that a `style` uses (`style={styles.pre}`) | [ScrollArea, Native scrolling](../../packages/ui/src/components/scroll-area/scroll-area.md#native-scrolling) |
| `raft-ui/no-raw-z-index` | A z-index that isn't a named layer: a Tailwind z class with a number or an arbitrary value (`z-10`, `-z-1`, `z-[60]`, `z-(--x)`, `[z-index:5]`, with any variant or `!`), in a `className`, `class` or `…ClassName` attribute or property, an argument of `cn`, `clsx`, `cx`, `tv`, `cva`, `twMerge`, `twJoin` or `classNames`, or a `const` string of the same file used as a class there; a `zIndex` property whose value is a number or a numeric string, in a style object or any other (`style={{ zIndex: 10 }}`); a `zIndex={n}` JSX attribute; and `el.style.zIndex = "n"`. `z-auto`, the layer names (`z-raised`, `max-md:z-chrome`) and `var(--z-index-…)` are not reported | [Elevation, Layer order](../foundations/elevation.md#layer-order) |

The rules read the code as written, without types, one file at a time. Neither sees a class in a `let`, imported from another file, returned by a function to a variable, added by script (`el.classList.add(…)`, `el.style.overflowY = …`) or written in a CSS file; for a native scroller in a CSS file there is a check of its own ([CSS files](#css-files)). The two read classes in different places: `raft-ui/no-raw-z-index` matches a `const` by its name and doesn't read an object (`styles.log`), a `classNames` or `…Class` prop, or a call that isn't a class helper; `raft-ui/prefer-scroll-area` reads those as the table says, and resolves a `const` by scope, so a parameter of the same name is not the const.

What `raft-ui/prefer-scroll-area` leaves alone on purpose: a string a call that isn't a class helper takes inside a class helper (`cn("p-2", t("overflow-auto"))`, in a class attribute or outside one), a string under a key that isn't a class name or inside a function in a JSX spread (`{...props({ title: "overflow-auto" })}`), a member of an object that nothing reads as a class, and a prop whose name reads as a yes or no (`isClass`, `hasErrorClass`).

Its message follows the direction the hit scrolls in and the element it is on, and says what to write instead:

| Reported | The message says |
| --- | --- |
| `overflow-y-*`, `overflowY`, `overflow: "hidden auto"` | Write `<ScrollArea className="…sizing…" contentClassName="…layout, gap, padding…">` (`PanelScrollViewport` inside a Panel): the sizing classes (`max-h-*`, `flex-1`, `min-h-0`) stay on the area, and grid, flex, gap and padding go on `contentClassName` |
| `overflow-x-*`, `overflowX` | The same, with `orientation="horizontal"` |
| `overflow-auto`, `overflow-scroll`, `overflow: "auto"`, or x and y classes in one string | The same, with `orientation="both"`: a vertical area cuts off content wider than itself. Leave `orientation` out only when nothing inside is wider than the area |
| On a `<textarea>` or a `Textarea` | Write `ScrollAreaTextarea`: a textarea can't hold the scrollbars, so they are drawn over a frame around it |
| On a `<pre>`, `<html>`, `<body>` or `<iframe>` | Nothing to write instead: a ScrollArea can't take the element's place. It scrolls natively only as an allowed case (a `<pre>` of code is one), with the exception comment |
| In a `classNames` or `…ClassNames` object, whose classes go to elements another component renders | Bind that element with `useScrollAreaContainer` and `ScrollAreaGutters` ([Your own container](../../packages/ui/src/components/scroll-area/scroll-area.md#your-own-container)); where the component gives no access to it, the exception comment |
| On a `ScrollArea`, `PanelScrollViewport` or `ScrollAreaTextarea` element's own `className` or `style` | Remove it: the area scrolls already, in the direction its `orientation` names. This message names no exception |

A `const` used on elements of different kinds gets the message for its direction. Every message ends with the address of ScrollArea's page as Markdown, so an agent that reads the report can fix it without another lookup. The steps are in [Replacing a native scroller](../../packages/ui/src/components/scroll-area/scroll-area.md#replacing-a-native-scroller).

### Exceptions

Where a rule's own page allows an exception, say which one in a comment that starts with the rule's marker, followed by the reason, on a line of its own right above what it reports (or at the end of that line):

```tsx
<pre
  // raft-ui: native-scroll a <pre> holds phrasing content only
  className="overflow-x-auto"
>
```

Between JSX children, write it as `{/* raft-ui: native-scroll <reason> */}`. A marker without a reason doesn't count.

The comment covers only the string that starts on the next line (or on its own line), never the rest of the call or attribute that string is in. In a class list split over lines, put the native-scroll class on a line of its own with the comment right above it, so a class added to the list later is still checked:

```tsx
cn(
  "min-w-0 whitespace-nowrap",
  // raft-ui: native-scroll a one-line strip with no scrollbar
  "overflow-x-auto",
  isActive && "text-foreground",
);
```

A comment above a line that opens a call, such as `className={cn(`, covers only a string on that same line, not the strings on the lines after it. For `raft-ui/prefer-scroll-area`, a comment at the end of a line of code covers that line only, never the line after it. The comment is the record of the exception, kept next to the code it is about, where a reviewer or an agent reads it; prefer it to an `oxlint-disable` or `eslint-disable` comment, which hides the rule without saying why.

| Rule | Marker |
| --- | --- |
| `raft-ui/prefer-scroll-area` | `raft-ui: native-scroll <reason>` |
| `raft-ui/no-raw-z-index` | `raft-ui: z-index <reason>` |

### CSS files

The lint rules read JS and TSX only, so a native scroller written in a stylesheet (`.log { overflow-y: auto; }`) passes them. The package ships a check for those, a plain Node script with no dependencies. Run it on the folders that hold the app's CSS, and chain it into the `lint` script so it runs wherever the linter does:

```json
{
  "scripts": {
    "lint": "oxlint && node node_modules/@botiverse/raft-ui/checks/native-scroll-css.mjs src"
  }
}
```

It takes files, folders (read recursively) and globs (`"src/**/*.css"`), and with no path reads every `.css` file under the current directory. Inside a folder it skips `node_modules`, `dist`, `build` and folders whose name starts with a dot, at any depth (`src/build` too), and it never reports raft-ui's own CSS; a folder or a file you name yourself is read whatever it is called. It exits 1 when it reports anything, 0 when it reports nothing, and 2 for a path that doesn't exist or can't be read, a glob that matches no file, or an option it doesn't know, so a mistyped path in a lint script fails instead of passing forever. `--json` prints the reports as JSON, for a program.

| Reported | Not reported |
| --- | --- |
| A declaration of `overflow`, `overflow-x`, `overflow-y`, `overflow-inline` or `overflow-block` whose value has `auto`, `scroll` or `overlay` in it: `hidden auto`, `auto !important` and `var(--x, auto)` too, in minified CSS and at any depth (`@media`, `@layer`, `@supports`, nested rules) | `hidden`, `visible` and `clip`; a value that is only a `var(--x)`; a condition such as `@supports (overflow: auto)` or `@media (overflow-block: scroll)`; anything in a comment, a string or a `url()` |
| In an `@apply`, the classes the lint rule reports: `overflow-auto`, `overflow-scroll`, their `-x-` and `-y-` forms, with any variant or `!`, as an arbitrary value (`overflow-[auto]`) or an arbitrary property (`[overflow:overlay]`) | A class anywhere else in the file, such as a selector or `@source inline(…)` |

Each report is one line, `file:line:column  selector { declaration }`, and the message after them says what to do: the element the rule styles becomes a `ScrollArea`, or, when another component renders it, is bound with `useScrollAreaContainer` and `ScrollAreaGutters`, and the declaration goes ([Replacing a native scroller](../../packages/ui/src/components/scroll-area/scroll-area.md#replacing-a-native-scroller)). It ends with the address of ScrollArea's page as Markdown, as the lint rule's message does.

An allowed exception takes the same marker as in code, in a CSS comment on a line of its own right above the declaration or the `@apply`, or after it at the end of its line. The comment starts with the marker, a marker without a reason doesn't count, and a comment covers one declaration: above a line that holds several declarations or rules, only the first of them, so one comment never allows a minified line. An `@apply` is one declaration however many lines its classes take, so here one comment allows all of it, unlike a class list in code. A `//` line is not a comment in CSS: it allows nothing, and the declaration under it is still reported.

```css
.diagram pre {
  /* raft-ui: native-scroll a <pre> holds phrasing content only */
  overflow-x: auto;
}
```

The check reads `.css` files as CSS: it doesn't read Sass or Less (`//` comments, mixins), a `<style>` block in HTML, or CSS in a JS string.

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
