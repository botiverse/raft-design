# `apps/doc` Documentation and Composition Contract

These rules apply to the docs application and extend the repository-level component architecture.

## Pages From Markdown

The site's design record is [DESIGN.md](./DESIGN.md). Documentation pages are Markdown files in the repository (one folder per section, `design/<section>/*.md` with an optional `README.md` introduction, `design/products/<product>/*.md`, `design/components/overview.md` and `packages/ui/src/components/<x>/<x>.md`), written as `design/authoring/` describes. The sections and their order are `SECTIONS` in `src/lib/content/pages.ts`; a moved page keeps its old URL working with `redirectFrom` in its front matter (`src/lib/content/redirects.ts`). `src/lib/content/` finds them, gives each its URL and renders its `.md` twin; `src/routes/_site/` renders them in the site shell (`src/components/site/`). Do not write page content in a route.

- An `example` block names a composition by its path under `src/modules` without the extension; the page renders the module's `*Content` export and shows that file's source.
- A `tokens` block names a group of `packages/ui/src/tokens.json`.
- A component page adds what is generated from code: the API (`src/data/api/<folder>.json`, written by `scripts/build-api.mjs` from raft-ui's TypeScript; `--check` fails when it is stale), the related components (front matter `related`) and the changes (`packages/ui/CHANGELOG.md` entries naming its exports). A component folder without a doc still gets a page with these.
- `scripts/check-docs.mjs` (CI) fails when a page names an example, a token group or a link that does not exist; `src/lib/content/content.test.ts` checks that the site resolves every relative link to a page and every anchor to a heading; `src/lib/content/api.test.ts` fails when `src/data/api` is stale.

## Canonical Compositions

`apps/doc/src/modules/<component>` is the canonical executable usage layer for `raft-ui` components.
Each component is a module holding its `compositions/` (one example per file, `<name>.composition.tsx`;
flat `<component>.composition.tsx` for a single example) and supporting constants and fixtures.
Pages embed compositions with `example` blocks; an interactive demo is a composition with local
state.

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
- Real product stores, server queries, or permissions.
- Duplicate low-level helpers when another canonical composition already describes the same structure.
- Enabled controls with no observable action.

Use `className` only for example layout and constraints such as preview width, grid, positioning, or spacing between examples. If removing the class makes the component itself look wrong, move the style into `packages/ui` or add a semantic UI part.

## One Current Source of Truth

- Docs pages reuse the canonical composition instead of reproducing its Current JSX.
- Do not maintain hand-written JSX snippets in docs that duplicate executable compositions.

## Displayed Code

A code block is documentation a reader copies. What renders and what the reader is _shown_
are two different things, and the gap between them is where this layer regresses.

An `example` block renders the module's display shell (`*Composition`, or the export named
after the file) and shows the file's source after `stripSourceCodeBlocks`
(`src/lib/source-code.ts`) removes the `@docs-source-strip` blocks. The source is collapsed
behind the Code toggle and is always inlined in the page's `.md` twin
([DESIGN.md](./DESIGN.md) §6).

Invariants:

- **Show the real API.** After stripping, the source must contain the `raft-ui` components the
  page documents: the `*Content` export holds the parts; the display shell around it is
  stripped. A part listed in the doc's Anatomy with no displayed usage anywhere is a
  documentation gap.
- **Render on its own.** An example takes no props. A composition that needs props or a parent
  is a helper, not an example; give the file an export that supplies them.
- **Strip markers are line-anchored.** `// @docs-source-strip-start` / `-end` at statement
  level, `{/* @docs-source-strip-start */}` / `{/* @docs-source-strip-end */}` inside JSX.
  Each marker alone on its line, pairs balanced and at the same nesting level. The regexes
  anchor with `^\s*` and the `m` flag, so a marker sharing a line with code silently fails to
  strip and leaks scaffolding into the docs. Markers hide code from display; they never stop
  it rendering.
- **Nothing may dangle.** After stripping, no surviving line may reference an identifier whose
  only definition was inside a stripped block. When hiding a definition would strand its
  callers, extract it to a sibling module instead.
- **Code must match its canvas.** The source must correspond to what renders above it.
- **Literal over derived.** Prefer literal JSX to a fixture array plus `.map()`, and inline a
  fixture when it _is_ the example's visible content. Gallery wrappers and per-example labels
  belong behind strip markers, not in the snippet.
- **No demo narration.** Example copy is realistic product content. Text describing the demo
  itself never ships to a reader.

`scripts/check-docs.mjs` checks that every `example` names a composition that exists; the
other invariants are not enforced by `vp check` or `vp test`. **When you rewrite or restructure a
module, re-verify them for the pages that embed it.**

## Theme and Overlay Isolation

- The app-level theme provider is the only owner that synchronizes the document root.
- Nested preview scopes use `syncDom={false}`.
- Tooltips, menus, context menus, popovers, and selection overlays inside isolated previews receive a local container through the underlying Base UI portal props.

## Interactive Examples

Every enabled control must do one of the following:

- Update visible or announced local state.
- Navigate to a real page, or to an in-page fragment when the link has no real destination.
- Run a deterministic mock callback.
- Open the real Base UI overlay demonstrated by the example.

Otherwise render it disabled or use a non-interactive element. Static examples must not advertise unavailable behavior to pointer or keyboard users.

## Review Checklist

- Is there exactly one executable Current composition?
- Do pages embed it with an `example` block instead of copying it?
- Does every example render on its own and show real `raft-ui` API after stripping?
- Are `@docs-source-strip` pairs balanced, alone on their line, and in the right comment form,
  with no identifier left dangling after stripping?
- Does each example's source correspond to its canvas?
- Are component visuals owned by `packages/ui` rather than docs classes?
- Are example interactions functional or explicitly disabled?
- Do all preview overlays remain inside their theme/container boundary?
