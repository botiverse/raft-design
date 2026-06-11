# Component Token Usage Audit

Generated with [ast-grep](https://ast-grep.github.io/) from current source. This is the v2 completion gate for the migration plan in [token-theme-architecture.md](./token-theme-architecture.md).

**Scope:** `packages/ui/src/components`, `packages/ui/src/styles.css`, and `packages/ui/src/styles-v2.css` only. `packages/ui/src/legacy` and `packages/ui/src/themes` are intentionally excluded because `styles.css` is now the official v2 entrypoint and `styles-v2.css` is the explicit v2 alias.

**Rules:** `packages/ui/docs/ast-grep/token-migration-audit.yml`

**Detection:** AST string literals in TSX (tailwind-variants / `className` recipe strings) and CSS declarations/comments that reference old semantic aliases, component-scoped CSS variables, brutal hardcoded utilities, arbitrary shadow bridges, hex/HSL colors, or old unsuffixed semantic utilities.

**Regenerate:**

```sh
node packages/ui/docs/ast-grep/generate-component-token-audit.mjs
```

## packages/ui/src/components

### `packages/ui/src/components/avatar/avatar.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/badge/badge.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/banner/banner.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/bottom-sheet/bottom-sheet.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/button/button.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/check-indicator/check-indicator.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/checkbox/checkbox.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/context-menu/context-menu.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/conversation-preview-card/conversation-preview-card.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/description-list/description-list.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/dropdown-menu/dropdown-menu.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/empty-state/empty-state.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/field/field.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/input/input.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/input-group/input-group.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/kbd/kbd.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/lightbox/lightbox.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/list-item/list-item.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/media-list-item/media-list-item.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/notification-center/notification-center.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/panel-header/panel-header.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/popover/popover.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/preview-shell/preview-shell.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/quoted-message-card/quoted-message-card.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/section-header/section-header.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/section-label/section-label.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/spinner/spinner.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/status/status.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/tabs/tabs.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/textarea/textarea.tsx` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/components/toggle-group/toggle-group.tsx` (0 hits)

- No direct old-token/style-token migration hits.

## packages/ui/src/style entrypoints

### `packages/ui/src/styles.css` (0 hits)

- No direct old-token/style-token migration hits.

### `packages/ui/src/styles-v2.css` (0 hits)

- No direct old-token/style-token migration hits.

## Summary

| Scope                               | Files scanned | Files with hits | Total hits |
| ----------------------------------- | ------------: | --------------: | ---------: |
| `packages/ui/src/components`        |            31 |               0 |          0 |
| `packages/ui/src/style entrypoints` |             2 |               0 |          0 |
| **Total**                           |            33 |               0 |          0 |

### Hit categories

- **Hardcoded brutal shade utilities** (`border-black`, `text-black`, `bg-white`, `bg-black/*`, `bg-brutal-*-400`, etc.): replace with `line-*`, `foreground-*`, `layer-*`, `primary/accent/secondary-*`, `info/success/warning/danger-*`, or unsuffixed brutal base aliases where the component contract is intentionally palette-specific.
- **Legacy semantic Tailwind aliases** (`surface-*`, `action-*`, `information-*`, `destructive-*`, `neutral-*`, `muted-foreground`, `border-border`): not allowed in v2 components or style entrypoints.
- **Component-scoped CSS variables** (`--input-*`, `--dropdown-*`, `--tabs-*`, `--badge-*`, `--checkbox-*`, `--button-*`, `--list-item-*`, `--kbd-*`, `--banner-*`): not allowed in v2 components.
- **Arbitrary shadow bridges** (`shadow-[var(--shadow*)]`, `[box-shadow:var(--surface-shadow*)]`): replace with unified `shadow-*` scale.
- **Non-OKLCH authored colors** (hex and `hsl/hsla`): remove from v2 CSS and component recipes.

### Completeness status

This audit currently has **0 hits** in the v2 migration scope. Static old-token usage is clean for `styles.css`, `styles-v2.css`, and current component recipes.

What this file proves:

- Every listed hit is a v2 migration blocker in the scanned scope.
- A zero-hit result means component recipes and v2 style entrypoints no longer depend on old alias utilities or component-scoped token variables.

What this file does **not** prove by itself:

- It does not prove brutal visual parity by itself; Browser source comparison is still required.
- It does not prove every variant/state is represented in docs.
- It does not prove old aliases are unused by external package consumers.
- It does not prove elegant parity; elegant may intentionally remain partially degraded while the new token contract stabilizes.

### Brutal parity gate

Brutal is the source-faithful theme. A component is not done until these are true:

- All brutal hardcoded values are replaced by the new token utilities or theme values.
- Default, hover, active/pressed, focus-visible, disabled, selected/checked, invalid, and loading states match the legacy/source appearance where the component supports those states.
- Borders, offset shadows, fills, foreground opacity, focus rings, radius, and spacing are checked against the source comparison for that component.
- Any intentional API difference is documented in the component docs, but visual differences in brutal require an explicit exception.
- The docs app is checked in `theme=brutal` after the component is migrated.

### Elegant tolerance gate

Elegant can lag behind brutal, but its gaps must be explicit:

- Elegant must use the same public token contract as brutal.
- Elegant may use approximate values where there is no approved design source yet.
- Any missing elegant polish should be recorded as WIP/Todo instead of keeping old component aliases alive.
- Elegant dark-mode regressions should be documented if not fixed in the same phase.

### Suggested migration order (components only)

1. **Phase 1** — create `styles-v2.css` as the pure v2 token contract.
2. **Phase 2** — migrate component recipes to v2 utilities.
3. **Phase 3** — switch docs to the v2 contract for Browser comparison.
4. **Phase 4** — promote `@slock/ui/styles.css` to the v2 entrypoint.
5. **Phase 5** — run Browser source/current checks for brutal component pages.

### Post-migration verification (ast-grep)

```sh
sg scan --rule packages/ui/docs/ast-grep/token-migration-audit.yml packages/ui/src/components packages/ui/src/styles.css packages/ui/src/styles-v2.css
rg -n "surface-|action-|information-|destructive-|muted-foreground|neutral-|border-border|ring-ring|shadow-\\[var\\(--|\\[box-shadow:var\\(--" packages/ui/src/components packages/ui/src/styles.css packages/ui/src/styles-v2.css
```
