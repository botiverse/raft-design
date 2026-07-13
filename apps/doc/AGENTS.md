# `apps/doc` Documentation and Composition Contract

These rules apply to the docs application and extend the repository-level component architecture.

## Canonical Compositions

`apps/doc/src/modules/<component>` is the canonical executable usage layer for `raft-ui` components.
Each component is a module holding its `compositions/` (one example per file, `<name>.composition.tsx`;
flat `<component>.composition.tsx` for a single example), its interactive `<component>.preview.tsx`,
and its source comparison. The top-level `compositions/` bucket no longer exists.

Compositions may contain:

- Realistic example copy and caller-owned icons.
- Explicit combinations of UI compound parts.
- Deterministic local state and mock callbacks needed to demonstrate interaction.
- Ready, loading, pending, failed, unavailable, disabled, selected, and other consumer-chosen structures.
- Local portal containers needed to isolate SourceComparison or theme preview panes.
- Thin reusable example helpers when they represent a meaningful composition rather than a renamed primitive.

Compositions must not contain:

- A second implementation of a component recipe.
- Classes that repair component-internal typography, color, spacing, or interaction styling.
- Real product stores, server queries, permissions, or Playground mock registries.
- Duplicate low-level helpers when another canonical composition already describes the same structure.
- Enabled controls with no observable action.

Use `className` only for example layout and constraints such as preview width, grid, positioning, or spacing between examples. If removing the class makes the component itself look wrong, move the style into `packages/ui` or add a semantic UI part.

## One Current Source of Truth

- Docs routes, SourceComparison, and Playground should reuse the canonical composition instead of reproducing its Current JSX.
- Prefer importing the canonical composition file with `?raw` when displaying consumer code.
- Do not maintain route-local Current fixtures or hand-written JSX snippet strings that duplicate executable compositions.
- Source-reference fixtures may remain separate when they intentionally preserve upstream/source DOM for comparison.

## Docs Routes

`apps/doc/src/routes/components` owns thin page assembly only:

- Titles, descriptions, differences, and migration notes.
- Props and anatomy tables.
- SourceComparison configuration.
- Importing and arranging its `modules/<component>/` compositions and preview.
- Rendering highlighted `?raw` canonical source.

Routes must not implement another version of the component or business composition. Sandboxed
iframe-only preview routes live under `routes/iframe` and delegate to the module's `<component>.preview.tsx`.

## Theme and Overlay Isolation

- Brutal, Elegant, and Elegant dark should consume the same business structure. Themes change recipes and tokens, not product DOM.
- The app-level theme provider is the only owner that synchronizes the document root.
- Nested preview scopes use `syncDom={false}`.
- Tooltips, menus, context menus, popovers, and selection overlays inside isolated previews receive a local container through the underlying Base UI portal props.

## Interactive Examples

Every enabled control must do one of the following:

- Update visible or announced local state.
- Navigate to a real example route.
- Run a deterministic mock callback.
- Open the real Base UI overlay demonstrated by the example.

Otherwise render it disabled or use a non-interactive element. Static examples must not advertise unavailable behavior to pointer or keyboard users.

## Review Checklist

- Is there exactly one executable Current composition?
- Do routes import it from the module instead of copying it?
- Does displayed code come from canonical `?raw` source where possible?
- Are component visuals owned by `packages/ui` rather than docs classes?
- Are example interactions functional or explicitly disabled?
- Do all preview overlays remain inside their theme/container boundary?
- Does any composition import Playground? If so, reverse the dependency.
