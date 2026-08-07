# raft-ui

React UI components for rui, styled with Tailwind CSS v4.

## Usage

```tsx
import { Button } from "raft-ui";
```

```css
@import "tailwindcss";
@import "raft-ui/styles.css";
```

## Agent Skills

raft-ui ships two version-matched Agent Skills in the npm package:

- `raft-ui-guide` for installation, component selection, composition, and styling.
- `raft-ui-critique` for visual, interaction, accessibility, and theme review.

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
