<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Browser Validation Boundary

Do not use Browser, the in-app browser, screenshots, visual browser checks, or browser automation for validation unless the user explicitly asks for browser testing in the current turn.

Browser permission is never sticky. A previous user request to open or test with Browser does not authorize Browser use in later turns. Each Browser validation pass requires a fresh, explicit user instruction in that same turn.

If a visual check would be helpful but the user has not explicitly authorized Browser use, ask first or continue with code-side inspection only.

# Raft Design System

raft-ui implements the Raft Design System, and `design/` is the system itself: start at `design/README.md`, then read the foundation or pattern page and the component doc (`packages/ui/src/components/<component>/<component>.md`) for what you touch before changing how anything looks.

- `design/` is the source. A change that alters how something looks updates the rule it follows in the same PR, and a choice that overrides an earlier decision adds a record in `design/decisions/` and marks the earlier one `superseded`.
- When raft-ui and the DS disagree, one of them is wrong: fix the code or the rule, never leave them apart.
- Writing or moving docs follows `design/authoring/README.md`: where each page lives, the templates and the writing guide. Run `pnpm check:docs` before opening a PR.

# Component Architecture Ownership

The component system has three runtime layers with one-way dependencies:

```text
packages/ui
  -> apps/doc/src/modules/<component>
    -> apps/doc/src/playground

apps/doc/src/routes
  -> apps/doc/src/modules/<component>
```

- `packages/ui` owns business-agnostic primitives, reusable headless behavior, component recipes, tokens, and public UI contracts.
- `apps/doc/src/modules/<component>` owns everything non-route for a component: the canonical executable compositions (`compositions/*.composition.tsx`, or a flat `<component>.composition.tsx` for a single example), constants, and fixtures. This is the canonical executable usage layer; an interactive demo is a composition with local state.
- `apps/doc/src/routes` owns routing only. Every component page is one route, `routes/_site/components/$slug.tsx`, rendered from the component's doc (`packages/ui/src/components/<x>/<x>.md`), whose `example` blocks name the module's compositions, and from its API, generated into `apps/doc/src/data/api` by `apps/doc/scripts/build-api.mjs` (see `apps/doc/AGENTS.md`). `routes/iframe/example.tsx` renders one composition alone, for an example's phone view. Routes must not maintain another Current implementation.
- `apps/doc/src/components` owns shared documentation chrome (DocPage, Sidebar, code blocks, preview panels, ...) reused across modules.
- `apps/doc/src/playground` owns the coherent mock product domain, router coordination, and business-shaped demo state. It consumes UI primitives and canonical docs compositions; it is not a second component library.
- Dependencies must not point upward. `packages/ui` never imports `apps/doc`; docs modules never import Playground.

## State Boundary

- Generic interaction state belongs to the behavior owner or Base UI primitive: open state, focus, selection, keyboard navigation, collection state, and controlled/uncontrolled value.
- Product and workflow state belongs to the consuming composition or Playground: upload lifecycle, notification policy, saved/followed state, task workflow, permissions, and entity-specific actions.
- When product state changes visible structure, `packages/ui` exposes the relevant parts and styles; the consumer chooses which parts to render.
- Do not interpret this as a ban on all state in the component library.

## Structural API Boundary

- Avoid public `kind`, `state`, or `emphasis` props when they select materially different visible structures.
- Prefer explicit semantic components and compound parts such as `MessageReferenceTask`, `MessageReferenceLoading`, or `MessageAttachmentPendingIndicator`.
- This restriction applies to reusable UI APIs, not to discriminated unions in app or Playground domain data.
- Visible content belongs in `children` or explicit parts. Product copy, policy text, business icons, and permissions do not belong in `packages/ui`.

# Component Delivery SOP

Use this sequence when adding or migrating a component:

1. Inventory real source callsites and classify the candidate as a UI primitive, reusable behavior component, docs composition, or Playground business wrapper. Do not infer the boundary from a demo fixture alone.
2. Implement the business-agnostic API in `packages/ui`: Base UI owns headless behavior, `tv()` recipes own reusable styling, and children/parts expose visible structure. Export unstable work through `wip.ts` while refining.
3. Add canonical executable examples under `apps/doc/src/modules/<component>/compositions` (one example per file, `<name>.composition.tsx`; keep it flat as `<component>.composition.tsx` when there is a single example). Cover the normal structure, meaningful visual states, disabled/error/loading behavior, and relevant overlays.
4. Write or update the component's doc, `packages/ui/src/components/<x>/<x>.md` (`design/authoring/`), and embed the compositions with `example` blocks; the docs site renders it with no route of its own. Regenerate the API with `node apps/doc/scripts/build-api.mjs` when exports or props change. Then check the page against the Displayed Code invariants in `apps/doc/AGENTS.md`: real API in every example, strip markers balanced with nothing dangling, code matching its canvas.
5. Add the component to Playground only when it participates in a real shell/product scenario or needs cross-component verification. Reuse the canonical composition and add only the thin mock business wrapper or coordinated state Playground needs.
6. Audit all three layers for business leakage, duplicated implementations, local component-style repairs, fake ARIA widgets, and enabled-but-inert controls.
7. Run `vp check --fix`, `git diff --check`, and React Doctor for the changed React packages. For cross-layer architecture changes, repeat an independent strict review until no P1/P2 findings remain.

Browser, build, prerender, and test commands remain governed by the validation boundaries in this file; the SOP does not grant extra validation permission.

## Migration Invariants

Hold these whenever you move, collapse, or restyle existing component structure:

- **DOM and className parity.** A structure-preserving refactor must render the same DOM and classes as before. Diff the output against the pre-change callsite (for example the existing Playground assembly) and treat any structural delta as a regression.
- **Push generic boilerplate down as additive sugar.** When a wrapper carries no business content, move it into the `packages/ui` atom instead of leaving it in a composition. Keep the new prop or part additive: it activates only when passed, and the existing granular path stays byte-for-byte unchanged so current callsites keep working.
- **Slots must earn their existence.** Before keeping a slot or part, confirm the rendered DOM shows a real structural or visual difference (a border, spacing, or reflow). If it collapses into a neighbor with no such difference, delete it and merge. Verify against actual output, not the intended design.
- **Inventory every callsite before changing or removing an API.** Grep all consumers across `packages/ui`, `modules`, the component docs, and `playground` first. Backward-compatibility scope is the full callsite set, not the one component you started from.

# Styling Conventions

## tailwind-variants

Components are styled with `tailwind-variants` (`tv()`), with `@base-ui/react` as the unstyled component primitive layer.

When a class string gets long, split it into an array (`tv()` accepts arrays for `base` and each variant value). Group by concern, one logical group per array entry:

- Keep a property and its state/responsive variants together in the same entry (e.g. `bg-blue-600 hover:bg-blue-700`).
- Separate unrelated concerns into their own entries (layout, shape/typography, color, interaction).
- No comments — the grouping itself conveys intent.

```ts
const button = tv({
  base: [
    "inline-flex items-center justify-center",
    "rounded-md text-sm font-medium",
    "transition-colors disabled:opacity-50",
  ],
  variants: {
    variant: {
      primary: ["bg-blue-600 hover:bg-blue-700", "text-white"],
    },
  },
});
```

## Color tokens

Token values and their light/dark values live in `packages/ui/src/tokens.json` (DTCG format), the single source. `packages/ui/src/foundation.css` is generated from it: edit tokens.json, then run `vp run @botiverse/raft-ui#build:tokens` (a test fails when the two disagree). `styles.css` imports the foundation and defines the Tailwind mappings. The docs render the tokens at `/tokens/colors`.

- All colors are authored in oklch. Never use hex/rgb/hsl or Tailwind default palette classes (`gray-*`, `neutral-*`, ...).
- Reach for semantic tokens first: `layer-*` (surfaces), `line-*` (borders), `foreground-*` (text), state families, and the ink overlay ramp (`ink-2`...`ink-40`, step = alpha %) for neutral washes, hairlines, and hover/pressed fills on transparent surfaces.
- Interaction colors on solid fills come from the hover/active pairs (`bg-brand-hover`, `bg-danger-active`, ...), derived as base + ink via `color-mix` in the token layer. Opting a new family in means adding the full hover/active pair.
- One-off precision values (tuned tints, glass surfaces, terminal blacks) are allowed as inline `oklch()` literals — do not invent a token for a single consumer. Tokenize when a value repeats across components (rule of three).
- Opaque values and alpha washes composite differently on non-white backgrounds — never swap one for the other during refactors without checking the actual backdrop.
- Never write `shadow-[var(--x),...]` (tailwind-merge misclassifies var-first shadows as shadow-color and conflict resolution breaks). Use named `@theme inline` shadow utilities (e.g. `shadow-field-hover`) or keep the shadow literal inline.
- Renders must stay pixel-identical when re-expressing styles via tokens.
