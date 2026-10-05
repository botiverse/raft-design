---
name: lookup
description: "Where to find props, variant values, and tokens for the installed raft-ui version — declarations, stylesheet, and monorepo source. Read before guessing any name."
---

# Looking things up

## Order to try

1. **Editor types** — if you are editing TypeScript in a typed project, hover or autocomplete on the component. Fastest and always matches the installed version.
2. **The bundled declarations** — `node_modules/raft-ui/dist/index.d.mts`. Authoritative for the version actually installed.
3. **The token stylesheet** — `node_modules/raft-ui/dist/foundation.css` for colors, shadows, and theme scopes; `styles.css` for Tailwind mappings.
4. **The recipe source** — only available when working inside the raft-ui monorepo, see below.

## What ships in the package

The published package contains **no `src/`**. Do not look for `.tsx` files in a consumer's `node_modules`.

```
node_modules/raft-ui/
├── CHANGELOG.md
├── package.json
├── README.md
├── dist/
│   ├── index.d.mts     every stable component, part, and prop type
│   ├── index.mjs       stable runtime
│   ├── cn.d.mts        the cn helper
│   ├── cn.mjs
│   ├── wip.d.mts       unstable surface
│   ├── wip.mjs
│   ├── foundation.css  native CSS token contract
│   ├── styles.css      Tailwind mappings
│   └── fonts.css
└── skills/             bundled raft-ui agent skills
```

## Finding a prop type

```bash
rg -n -A6 "^type ButtonProps =" node_modules/raft-ui/dist/index.d.mts
```

Adapt the pattern to how the declarations actually read. The last line of `index.d.mts` is one `export { … }` statement that lists the whole stable surface:

```bash
tail -n 1 node_modules/raft-ui/dist/index.d.mts | tr ',' '\n'
```

If a name is absent from `index.d.mts`, treat it as unavailable on the stable surface. Check `wip.d.mts` only when the user explicitly asks to consider unstable APIs.

## Finding a variant's allowed values

Variant unions come through `VariantProps<typeof <recipe>>`. Read the variant keys in the declared `TVReturnType` above the component props; the bundled declarations preserve those keys.

Do not infer a variant value from another component — the names are not consistent. See the intent table in [feedback.md](./feedback.md).

## Finding a token

```bash
rg -o -- "--color-[a-z0-9-]+" node_modules/raft-ui/dist/styles.css | sort -u
```

Use this before writing any color class. If a token is not in that list, it does not exist — see [styling.md](./styling.md).

## Inside the raft-ui monorepo

When `packages/ui/src/` is present you are working on the library itself, not consuming it. There the `tv()` recipe is the source of truth:

```
packages/ui/src/components/<component>/<component>.recipe.ts   (or <component>.tsx when there is no recipe file)
```

Read the `variants` block for the exact option names and the `compoundVariants` block for theme-specific behavior. The docs compositions under `apps/doc/src/modules/<component>/compositions/` show canonical usage.

## When the answer is not there

Say so and ask, or read the declarations again. Do not invent a prop name that "should" exist because another library has it. A guessed prop is silently dropped onto the DOM or ignored, and the bug surfaces much later as a styling problem.
