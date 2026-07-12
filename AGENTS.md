<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

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

# Component Architecture Ownership

The component system has three runtime layers with one-way dependencies:

```text
packages/ui
  -> apps/doc/src/compositions
    -> apps/doc/src/playground

apps/doc/src/routes/components
  -> apps/doc/src/compositions
```

- `packages/ui` owns business-agnostic primitives, reusable headless behavior, component recipes, tokens, and public UI contracts.
- `apps/doc/src/compositions` owns the canonical executable examples that show consumers how to combine UI primitives into meaningful states and interactions.
- `apps/doc/src/routes/components` owns documentation prose, props tables, source comparison, and page assembly. Routes must not maintain another Current implementation.
- `apps/doc/src/playground` owns the coherent mock product domain, router coordination, and business-shaped demo state. It consumes UI primitives and canonical docs compositions; it is not a second component library.
- Dependencies must not point upward. `packages/ui` never imports `apps/doc`; docs compositions never import Playground.

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
2. If source parity matters, preserve the source implementation under `packages/ui/source` as reference only. Runtime code must not depend on it.
3. Implement the business-agnostic API in `packages/ui`: Base UI owns headless behavior, `tv()` recipes own reusable styling, and children/parts expose visible structure. Export unstable work through `wip.ts` while refining.
4. Add canonical executable examples under `apps/doc/src/compositions`. Cover the normal structure, meaningful visual states, disabled/error/loading behavior, and relevant overlays.
5. Build the docs route by consuming those compositions and their `?raw` source. Do not copy Current JSX into route-local fixtures or snippet strings.
6. Add the component to Playground only when it participates in a real shell/product scenario or needs cross-component verification. Reuse the canonical composition and add only the thin mock business wrapper or coordinated state Playground needs.
7. Audit all three layers for business leakage, duplicated implementations, theme-controlled business DOM, local component-style repairs, fake ARIA widgets, and enabled-but-inert controls.
8. Run `vp check --fix`, `git diff --check`, and React Doctor for the changed React packages. For cross-layer architecture changes, repeat an independent strict review until no P1/P2 findings remain.

Browser, build, prerender, and test commands remain governed by the validation boundaries in this file; the SOP does not grant extra validation permission.

## Migration Invariants

Hold these whenever you move, collapse, or restyle existing component structure:

- **DOM and className parity.** A structure-preserving refactor must render the same DOM and classes as before. Diff the output against the pre-change callsite (for example the existing Playground assembly) and treat any structural delta as a regression. Brutal stays pixel-identical; elegant may take token-driven adjustments.
- **Push generic boilerplate down as additive sugar.** When a wrapper carries no business content, move it into the `packages/ui` atom instead of leaving it in a composition. Keep the new prop or part additive: it activates only when passed, and the existing granular path stays byte-for-byte unchanged so current callsites keep working.
- **Slots must earn their existence.** Before keeping a slot or part, confirm the rendered DOM shows a real structural or visual difference (a border, spacing, or reflow). If it collapses into a neighbor with no such difference, delete it and merge. Verify against actual output, not the intended design.
- **Inventory every callsite before changing or removing an API.** Grep all consumers across `packages/ui`, `compositions`, `routes/components`, and `playground` first. Backward-compatibility scope is the full callsite set, not the one component you started from.

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

Token contract lives in `packages/ui/src/styles.css`; the docs render it at `/tokens/colors`.

- All colors are authored in oklch. Never use hex/rgb/hsl or Tailwind default palette classes (`gray-*`, `neutral-*`, ...).
- Reach for semantic tokens first: `layer-*` (surfaces), `line-*` (borders), `foreground-*` (text), state families, and the ink overlay ramp (`ink-2`...`ink-40`, step = alpha %) for neutral washes, hairlines, and hover/pressed fills on transparent surfaces.
- Interaction colors on solid fills come from the hover/active pairs (`bg-primary-hover`, `bg-danger-active`, ...), derived as base + ink via `color-mix` in the token layer. Opting a new family in means adding the full hover/active pair.
- One-off precision values (tuned tints, glass surfaces, terminal blacks) are allowed as inline `oklch()` literals — do not invent a token for a single consumer. Tokenize when a value repeats across components (rule of three).
- Opaque values and alpha washes composite differently on non-white backgrounds — never swap one for the other during refactors without checking the actual backdrop.
- Never write `shadow-[var(--x),...]` (tailwind-merge misclassifies var-first shadows as shadow-color and conflict resolution breaks). Use named `@theme inline` shadow utilities (e.g. `shadow-field-hover`) or keep the shadow literal inline.
- Brutal renders must stay pixel-identical when re-expressing styles via tokens; elegant may take small token-driven adjustments.
