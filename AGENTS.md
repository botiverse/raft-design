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
