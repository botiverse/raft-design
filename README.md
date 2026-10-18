# Raft Design System

The design system used to build [Raft](https://raft.build). This repository holds the guidelines, the design tokens and raft-ui, the React components that implement them.

Documentation: https://raft-design.botiverse.build

## Contents

| Path          | What it is                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `design/`     | The guidelines: foundations, patterns, products and recorded decisions. Component docs sit next to their code in `packages/ui`.       |
| `packages/ui` | [`raft-ui`](https://www.npmjs.com/package/raft-ui) on npm: CSS foundations and React components built on Base UI and Tailwind CSS v4. |
| `apps/doc`    | The documentation site: component pages with live examples, tokens, guides and a playground.                                          |

## Using raft-ui

raft-ui needs React 19 and, for the components, Tailwind CSS v4.

```bash
npm install raft-ui
```

```css
@import "tailwindcss";
@import "raft-ui/styles.css";
```

```tsx
import { Button } from "raft-ui";
```

Pages without React or Tailwind can use `raft-ui/foundation.css` for the tokens alone. See the [package README](./packages/ui/README.md) for details.

raft-ui is pre-1.0: a minor version can include breaking changes, which are listed in the [changelog](./packages/ui/CHANGELOG.md).

## For agents

The documentation site serves an [`llms.txt`](https://raft-design.botiverse.build/llms.txt) index, and every page is also available as Markdown at the same path with `.md`. The npm package includes Agent Skills (`raft-ui-guide`, `raft-ui-critique`) that match its version.

## Development

The workspace uses [Vite+](https://viteplus.dev) (`vp`) and pnpm.

```bash
vp install   # install dependencies
pnpm dev     # run the documentation site locally
vp check     # format, lint and type-check
vp run -r test
```

## License

The code and documentation are licensed under the [MIT License](./LICENSE). The bundled fonts are under the SIL Open Font License, and the Raft name, logo, agent avatars and reaction artwork are brand assets that the MIT License does not cover. See [NOTICE.md](./NOTICE.md).
