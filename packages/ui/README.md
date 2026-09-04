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

## Theme bootstrap

Applications that persist a theme should apply it before React starts so a
stored dark theme does not briefly paint as light. Use one product-facing
preset for both the RUI family and color mode:

```ts
import { createThemeBootstrapScript, resolveThemePreset, type ThemePreset } from "raft-ui";

const preset: ThemePreset = "elegant-dark";
const { theme, mode } = resolveThemePreset(preset);

// Render this classic inline script in <head>, before app JavaScript.
const script = createThemeBootstrapScript({
  storageKey: "raft-effective-theme",
  defaultPreset: "brutal",
});

// Account-scoped SPAs can derive the key from an active JWT subject without
// hard-coding their token name into raft-ui:
const accountScript = createThemeBootstrapScript({
  storageKeyPrefix: "raft:theme-preset:v1:",
  account: { kind: "jwt-sub", tokenStorageKey: "app_access_token" },
  defaultPreset: "brutal",
});
```

The four presets are `brutal`, `elegant-light`, `elegant-dark`, and
`elegant-system`. The application owns account scoping and rollout policy; the
storage entry read by the bootstrap must contain the already-effective preset.
Missing, invalid, or inaccessible storage falls back to `defaultPreset`.
Only a JWT payload with `type: "access"` and a non-empty `sub` selects an
account cache namespace; the subject is never used as authorization.
At runtime, an app-level `ThemeProvider` with `syncDom` enabled applies
controlled family and mode changes to the document root before paint; nested
providers with `syncDom={false}` never write the root.

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
