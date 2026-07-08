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
