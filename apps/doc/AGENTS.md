# `apps/doc` Documentation and Composition Contract

These rules apply to the docs application and extend the repository-level component architecture.

## Pages From Markdown

The site's design record is [DESIGN.md](./DESIGN.md). Documentation pages are Markdown files in the repository (`design/foundations`, `design/patterns`, `design/products`, `design/decisions`, and `packages/ui/src/components/<x>/<x>.md`), written as `design/authoring/` describes. `src/lib/content/` finds them, gives each its URL and renders its `.md` twin; `src/routes/_site/` renders them in the site shell (`src/components/site/`). Do not write page content in a route.

- An `example` block names a composition by its path under `src/modules` without the extension; the page renders the module's `*Content` export and shows that file's source.
- A `tokens` block names a group of `packages/ui/src/tokens.json`.
- `src/lib/content/content.test.ts` fails when a page names an example, a token group, a page or a heading that does not exist.

## Canonical Compositions

`apps/doc/src/modules/<component>` is the canonical executable usage layer for `raft-ui` components.
Each component is a module holding its `compositions/` (one example per file, `<name>.composition.tsx`;
flat `<component>.composition.tsx` for a single example), its interactive `<component>.preview.tsx`,
and supporting constants and fixtures. The top-level `compositions/` bucket no longer exists.

Compositions may contain:

- Realistic example copy and caller-owned icons.
- Explicit combinations of UI compound parts.
- Deterministic local state and mock callbacks needed to demonstrate interaction.
- Ready, loading, pending, failed, unavailable, disabled, selected, and other consumer-chosen structures.
- Local portal containers needed to isolate preview panes.
- Thin reusable example helpers when they represent a meaningful composition rather than a renamed primitive.

Compositions must not contain:

- A second implementation of a component recipe.
- Classes that repair component-internal typography, color, spacing, or interaction styling.
- Real product stores, server queries, permissions, or Playground mock registries.
- Duplicate low-level helpers when another canonical composition already describes the same structure.
- Enabled controls with no observable action.

Use `className` only for example layout and constraints such as preview width, grid, positioning, or spacing between examples. If removing the class makes the component itself look wrong, move the style into `packages/ui` or add a semantic UI part.

## One Current Source of Truth

- Docs routes and Playground should reuse the canonical composition instead of reproducing its Current JSX.
- Prefer importing the canonical composition file with `?raw` when displaying consumer code.
- Do not maintain route-local Current fixtures or hand-written JSX snippet strings that duplicate executable compositions.

## Displayed Code

A code block is documentation a reader copies. What renders and what the reader is _shown_
are two different things, and the gap between them is where this layer regresses.

Pipeline for every `?raw` source: `stripSourceCodeBlocks` removes `@docs-source-strip` blocks,
then `highlightSnippets` emits two entries — `id` (full) and `id + "Body"` (imports removed by
`stripTopLevelImports`). `DocsCodeBlock.Content` shows the `Body` variant behind an
"imports collapsed, click to expand" affordance **only when a collapsed variant is passed**.
See `src/lib/highlight.tsx` and `src/lib/source-code.ts`.

Invariants:

- **Show the real API.** The displayed code must contain the `raft-ui` components the page
  documents. If its only element is a docs-local `<XxxComposition />`, the reader learns
  nothing — repoint the block at the file that holds the parts, or surface that file as a
  `DocsCodeBlock.Files` tab. A part listed in the Parts table with no displayed usage anywhere
  is a documentation gap.
- **Collapse imports.** Any `?raw` block whose source has more than one top-level import line
  must pass `collapsedHtml` / `collapsedCode` / `compositionCollapsedCode`. One import line or
  fewer means `stripTopLevelImports` no-ops and no `Body` key exists, so passing one is dead
  code — remove it instead. `createCompositionPanelProps` wires this automatically; a
  route-local preview component must thread the prop through itself.
- **Strip markers are line-anchored.** `// @docs-source-strip-start` / `-end` at statement
  level, `{/* @docs-source-strip-start */}` / `{/* @docs-source-strip-end */}` inside JSX.
  Each marker alone on its line, pairs balanced and at the same nesting level. The regexes
  anchor with `^\s*` and the `m` flag, so a marker sharing a line with code silently fails to
  strip and leaks scaffolding into the docs. Markers hide code from display; they never stop
  it rendering.
- **Nothing may dangle.** After stripping, no surviving line may reference an identifier whose
  only definition was inside a stripped block. When hiding a definition would strand its
  callers, extract it to a sibling module instead — an imported symbol reads fine once imports
  are collapsed, an undefined one does not.
- **Code must match its canvas.** The block under a preview must correspond to what renders
  above it. Repointing a block at a "cleaner" file that renders something else trades one
  defect for another.
- **Literal over derived.** Prefer literal JSX to a fixture array plus `.map()`, and inline a
  fixture when it _is_ the example's visible content. Gallery wrappers, per-example `<h3>`
  labels and caption chips belong behind strip markers, not in the snippet.
- **No demo narration.** Example copy is realistic product content. Text describing the demo
  itself ("Source activity: online → …", "add enough messages that the viewport overflows")
  never ships to a reader.
- **Paths must resolve.** Every `compositionPath`, `currentPath` and `DocsCodeBlock.Files`
  label names a file that exists.

None of this is enforced by `vp check`, `vp test`, or React Doctor. **When you rewrite or
restructure a module, re-verify these invariants for its route** — a structurally sound
refactor silently drops them, which is exactly how they were lost before.

## Docs Routes

`apps/doc/src/routes/components` owns thin page assembly only:

- Titles, descriptions, differences, and migration notes.
- Props and anatomy tables.
- Importing and arranging its `modules/<component>/` compositions and preview.
- Rendering Preview and Usage code blocks from highlighted `?raw` canonical source.

Routes must not implement another version of the component or business composition. Sandboxed
iframe-only preview routes live under `routes/iframe` and delegate to the module's `<component>.preview.tsx`.

## Theme and Overlay Isolation

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
- Do routes present the canonical composition through Preview and Usage code blocks rather than route-local examples?
- Does displayed code come from canonical `?raw` source where possible?
- Does every code block show real `raft-ui` API rather than a docs-local wrapper?
- Does every `?raw` block with more than one import line pass a collapsed variant, and does
  every collapsed prop that is passed resolve to a real `Body` key?
- Are `@docs-source-strip` pairs balanced, alone on their line, and in the right comment form,
  with no identifier left dangling after stripping?
- Does each code block correspond to the canvas above it?
- Are component visuals owned by `packages/ui` rather than docs classes?
- Are example interactions functional or explicitly disabled?
- Do all preview overlays remain inside their theme/container boundary?
- Does any composition import Playground? If so, reverse the dependency.
