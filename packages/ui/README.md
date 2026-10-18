# raft-ui

Raft Design System foundations for plain HTML, plus React components built with Base UI and Tailwind CSS v4.

## React

```tsx
import { Button } from "@botiverse/raft-ui";
```

```css
@import "tailwindcss";
@import "@botiverse/raft-ui/styles.css";
```

## Plain HTML

Link `dist/foundation.css` directly, or copy it beside your HTML. It exposes the same theme variables used by the components, without React, Tailwind, or a CSS reset.

```html
<link rel="stylesheet" href="./foundation.css" />
<style>
  body {
    background: var(--layer-canvas);
    color: var(--foreground);
  }
  article {
    background: var(--layer-canvas);
  }
</style>
```

Put `class="light"` or `class="dark"` on the root to pick a mode; omit it to follow the system mode. Optional `fonts.css` loads web fonts and defines `--heading-font`, `--sans-font`, and `--mono-font`.

`styles.css` remains the Tailwind integration entry and imports this foundation automatically.

## Tokens

`@botiverse/raft-ui/tokens.json` holds every token in the [Design Tokens Community Group format](https://www.designtokens.org/), with light and dark values, for design tools and code generators. `foundation.css` is generated from it.

## Agent Skills

raft-ui ships two version-matched Agent Skills in the npm package:

- `raft-ui-guide` for adopting raft-ui, looking up its API, and where the design system's guidance is.
- `raft-ui-critique` for visual, interaction, accessibility, and light/dark review.

### TanStack Intent

Allow raft-ui skills in the consuming project's `package.json`:

```json
{
  "intent": {
    "skills": ["@botiverse/raft-ui"]
  }
}
```

Install the project guidance, then inspect or load either skill:

```bash
pnpm dlx @tanstack/intent@latest install --map
pnpm dlx @tanstack/intent@latest load @botiverse/raft-ui#raft-ui-guide
pnpm dlx @tanstack/intent@latest load @botiverse/raft-ui#raft-ui-critique
```

### Other installers

The package uses the standard `skills/*/SKILL.md` layout, so consumers can also use tools such as `skills-npm` or Vercel `skills`. Installer-specific destination names may add their own package namespace.

## Development

- Install dependencies:

```bash
vp install
```

- Build the library:

```bash
vp pack
```

## Upgrading from `raft-ui`

The package was published as `raft-ui` up to 0.6.0. To move a project:

```bash
pnpm add @botiverse/raft-ui
node node_modules/@botiverse/raft-ui/codemods/package-name.mjs src
node node_modules/@botiverse/raft-ui/codemods/token-names.mjs src
pnpm remove raft-ui
```

The first command rewrites imports, CSS `@import` and `@source` paths and the dependency, and lists any bare `"raft-ui"` strings (bundler aliases, path mappings) to change by hand. The second moves to the current token names; the former names keep working until 1.0.

Review two kinds of code by hand after `token-names.mjs`:

- **Guards that forbid a name.** A lint rule, a test or an allowlist that bans a former name (for example a `doesNotMatch(/text-foreground-strong/)`) has that name rewritten too, so it now bans the current one. Put the former name back there.
- **Patterns built from parts.** A regex such as `/bg-brutal-[a-z]+/` is not a literal token, so it keeps the former name and stops matching the rewritten source. Widen it to the current name (`palette-`, `brand-`, `attention-`).

If a package you depend on declares `raft-ui` as a peer dependency, also install `"raft-ui": "npm:@botiverse/raft-ui@<version>"` so it resolves to the same copy instead of bundling a second one.
