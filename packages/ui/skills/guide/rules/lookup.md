# Looking things up

This skill deliberately carries no prop signatures — they would go stale. Look them up instead. **Never guess a prop or variant name.**

## Order to try

1. **Editor types** — if you are editing TypeScript in a typed project, hover or autocomplete on the component. Fastest and always matches the installed version.
2. **The bundled declarations** — `node_modules/raft-ui/dist/index.d.mts`. Authoritative for the version actually installed.
3. **The token stylesheet** — `node_modules/raft-ui/dist/styles.css` for every color, shadow, and theme scope.
4. **The docs site** — prose, anatomy, and live examples. <!-- TODO: fill in the docs URL -->
5. **The recipe source** — only available when working inside the raft-ui monorepo, see below.

## What ships in the package

The published package contains **no `src/`**. Do not look for `.tsx` files in a consumer's `node_modules`.

```
node_modules/raft-ui/
├── dist/
│   ├── index.d.mts     every stable component, part, and prop type
│   ├── index.mjs
│   ├── cn.d.mts        the cn helper
│   ├── wip.d.mts       unstable surface
│   ├── styles.css      the full oklch token contract
│   └── fonts.css
└── skills/             this skill
```

## Finding a prop type

```bash
grep -n -A25 "ButtonProps" node_modules/raft-ui/dist/index.d.mts
```

Adapt the pattern to how the declarations actually read — check the surrounding lines first rather than assuming a shape. To see the whole export surface:

```bash
grep -nE "^(declare |export )" node_modules/raft-ui/dist/index.d.mts | head -100
```

If a name is absent from `index.d.mts`, check `wip.d.mts` before concluding it does not exist — it may be unstable rather than missing.

## Finding a variant's allowed values

Variant unions come through `VariantProps<typeof …Variants>`. When the declaration inlines the union you can read the values directly; when it does not, fall back to the docs site or the token stylesheet.

Do not infer a variant value from another component — the names are not consistent. See the intent table in [feedback.md](./feedback.md).

## Finding a token

```bash
grep -oE "\-\-color-[a-z0-9-]+" node_modules/raft-ui/dist/styles.css | sort -u
```

Use this before writing any color class. If a token is not in that list, it does not exist, and a Tailwind default palette class is not an acceptable substitute — see [styling.md](./styling.md).

## Inside the raft-ui monorepo

When `packages/ui/src/` is present you are working on the library itself, not consuming it. There the `tv()` recipe is the source of truth:

```
packages/ui/src/components/<component>/<component>.tsx
```

Read the `variants` block for the exact option names and the `compoundVariants` block for theme-specific behavior. The docs compositions under `apps/doc/src/modules/<component>/compositions/` show canonical usage.

The skill is symlinked from `node_modules/raft-ui/skills`, which resolves to `packages/ui/skills` in this workspace — edits to it take effect immediately.

## When the answer is not there

Say so and ask, or read the declarations again. Do not invent a prop name that "should" exist because another library has it. A guessed prop is silently dropped onto the DOM or ignored, and the bug surfaces much later as a styling problem.
