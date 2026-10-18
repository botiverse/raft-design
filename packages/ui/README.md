# raft-ui

rUI design foundations for plain HTML, plus React components built with Base UI and Tailwind CSS v4.

## React

```tsx
import { Button } from "raft-ui";
```

```css
@import "tailwindcss";
@import "raft-ui/styles.css";
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
    background: var(--layer-panel);
  }
</style>
```

Put `class="light"` or `class="dark"` on the root to pick a mode; omit it to follow the system mode. Optional `fonts.css` loads web fonts and defines `--heading-font`, `--sans-font`, and `--mono-font`.

`styles.css` remains the Tailwind integration entry and imports this foundation automatically.

## Agent Skills

raft-ui ships two version-matched Agent Skills in the npm package:

- `raft-ui-guide` for installation, component selection, composition, and styling.
- `raft-ui-critique` for visual, interaction, accessibility, and light/dark review.

### TanStack Intent

Allow raft-ui skills in the consuming project's `package.json`:

```json
{
  "intent": {
    "skills": ["raft-ui"]
  }
}
```

Install the project guidance, then inspect or load either skill:

```bash
pnpm dlx @tanstack/intent@latest install --map
pnpm dlx @tanstack/intent@latest load raft-ui#raft-ui-guide
pnpm dlx @tanstack/intent@latest load raft-ui#raft-ui-critique
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
