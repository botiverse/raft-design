# Documentation site proposal

Status: draft for review (step B3). Nothing here is implemented beyond the mocks under `/proposal`. Implementation (B4) starts after approval.

The site at <https://raft-design.botiverse.build> is built from `apps/doc`. Today the Raft Design System lives in two places: the rules are Chinese Markdown and static `preview.html` drawings in `design/`, read on GitHub or from disk, and the site shows raft-ui's live components with their props. This proposal merges them into one site. Every page is written once in Markdown, rendered with live raft-ui examples for people, and served as plain Markdown for agents.

## Contents

1. [Readers and their jobs](#1-readers-and-their-jobs)
2. [What other design-system sites do](#2-what-other-design-system-sites-do)
3. [Information architecture](#3-information-architecture)
4. [Navigation and search](#4-navigation-and-search)
5. [Page anatomy](#5-page-anatomy)
6. [Examples](#6-examples)
7. [Agent surfaces](#7-agent-surfaces)
8. [Written and generated](#8-written-and-generated)
9. [What happens to the current site](#9-what-happens-to-the-current-site)
10. [Implementation plan](#10-implementation-plan)
11. [Decisions needed](#11-decisions-needed)
12. [The mocks in this PR](#12-the-mocks-in-this-pr)

## 1. Readers and their jobs

The authoring guide (`design/authoring/README.md`) names three readers and requires every page to work for all three. Each job below leads to a requirement on the site.

| Reader           | Job                                                      | The site needs                                                                                                                                         |
| ---------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product engineer | Find the right component for a situation                 | Search that knows former and common names (Sheet → Drawer, Snackbar → Toast); a "When to use" table on every component page that names the alternative |
|                  | Copy correct usage                                       | Examples that are the real compositions, with copyable source and the import line                                                                      |
|                  | Check a component's states in light, dark and on a phone | Per-example Light / Dark / Both switch; a phone-width view that runs media queries                                                                     |
|                  | Know whether it is safe to use                           | Lifecycle status from the export (`raft-ui` vs `raft-ui/wip`, `@deprecated`), shown on the page and in lists; the component's changes                  |
| Designer         | Understand why a rule exists                             | Rules and reasons in prose; decisions as their own pages, linked from the rules they shaped                                                            |
|                  | Look up values                                           | Token tables generated from `tokens.json`, both modes side by side, live swatches                                                                      |
|                  | See the system as a whole                                | Foundations and patterns as first-class sections; the seven rules on the home page                                                                     |
| Agent            | Fetch one page and act on it                             | Every page as Markdown at its path plus `.md`, self-contained, with example code inlined and props included                                            |
|                  | Find the page to fetch                                   | `llms.txt` grouped by section, one line per page; `components.json` with names, aliases, status and doc URLs                                           |
|                  | Avoid stale or invented APIs                             | Props generated from types; status in the data; the Markdown says it is the current source                                                             |

Two consequences shape the rest:

- **One source per fact.** Rules are written once (Markdown), values come from `tokens.json`, props from TypeScript, examples from compositions. The site and the Markdown twin render the same sources, so they cannot disagree.
- **One page per thing, one route per page type.** The 85 hand-written component routes become a single route driven by the component's `.md` and generated parts.

## 2. What other design-system sites do

Checked against the live sites and their public source in October 2026. Polaris (polaris.shopify.com) now redirects to shopify.dev, and Polaris React is archived; the notes use its last site's source.

| Topic               | What mature sites do                                                                                                                                                                                                                         | What we take, and why                                                                                                                                                                                          |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IA                  | Carbon and Atlassian: Foundations, Components, Patterns as top-level sections. Primer splits Product UI and Brand UI. shadcn adds Blocks (page compositions) next to Components.                                                             | Foundations / Components / Patterns as in Carbon and Atlassian, because our authoring guide already sorts pages that way. Products is our equivalent of Primer's split: structure that belongs to one product. |
| Component page      | Single scroll in Base UI, Radix and shadcn (demo, usage, anatomy, examples, API). Tabs in Carbon (Guidelines / Code / Accessibility) and Atlassian (Examples / Code / Usage / Changelog). Primer uses sub-pages.                             | **Single scroll.** Tabs hide half the page from search, from Cmd-F and from agents, and our pages are short. Section order follows our component template.                                                     |
| Props               | Generated from TypeScript in Polaris (TS compiler API, `scripts/get-props`) and Base UI; Base UI and Radix add data-attribute and CSS-variable tables. Primer hand-maintains `*.docs.json`.                                                  | Generate from types, as in Polaris and Base UI, so the table cannot drift. Add data attributes later where parts expose them.                                                                                  |
| Live examples       | Rendered inline in Primer, Base UI, Radix, shadcn and Atlassian. Carbon embeds Storybook iframes. shadcn Blocks use iframes with Desktop / Tablet / Mobile toggles.                                                                          | Inline by default (fast, one theme context). An iframe only for the phone view, as shadcn does for blocks, because media queries need a real viewport.                                                         |
| Theme switching     | One global toggle in Primer, Atlassian and shadcn; Carbon has a per-demo theme selector.                                                                                                                                                     | Both: a global mode in the top bar, and a per-example Page / Light / Dark / Both switch, because "check it in dark" is a core engineer job and Both shows the pair at once.                                    |
| Status labels       | Primer: Experimental, Ready, Deprecated, one badge per implementation. Atlassian: lifecycle phases shown in the nav and in llms-full. Carbon: Stable with "last updated".                                                                    | Three statuses from the export (already defined in the authoring guide), shown in the page header and, when not stable, in the nav, as Atlassian does.                                                         |
| Search              | Cmd-K in Base UI and shadcn. Atlassian lists keywords per component (Flag lists "toast"). Polaris kept component keywords in front matter but its search ignored them.                                                                       | Cmd-K over titles, `aliases` and summaries. Aliases feed both search and the agent files, and an alias hit says which name matched.                                                                            |
| Markdown for agents | `.md` versions of pages in Base UI, Radix, shadcn and Shopify. Base UI advertises them with `<link rel="alternate" type="text/markdown">`. shadcn's Copy Page menu: View as Markdown, Open in v0 / ChatGPT / Claude with a prefilled prompt. | Keep our existing `.md` twins and Copy page; add the `rel="alternate"` link. "Open in Claude / ChatGPT" is a cheap addition, listed under decisions.                                                           |
| llms.txt            | Atlassian: llms.txt as an index of topic bundles, plus a large generated llms-full. Base UI: llms.txt links `.md` pages. Primer: an `llms.txt` per component with YAML front matter and props.                                               | Keep llms.txt and llms-full.txt, re-sectioned by our IA. Take Primer's idea through `components.json` rather than one file per component.                                                                      |
| MCP                 | Primer (`@primer/mcp`, local), Atlassian (remote and `npx @atlaskit/ads-mcp`, including a11y checks), Carbon (remote, requires an IBMid login). shadcn has an MCP plus a registry (`registry.json`).                                         | Not in B4. The `.md` twins and `components.json` cover reading; an MCP earns its keep with checks (lint, token lookup), as Primer and Atlassian show. Listed under decisions.                                  |
| Changelog           | Atlassian: a changelog tab per component. Base UI: one entry per version with highlights. shadcn: monthly entries with RSS.                                                                                                                  | Keep the site-wide changelog; add a "Changes" section per component, filtered from the same CHANGELOG.                                                                                                         |

Not taken: Storybook embeds (a second runtime and theme context, Carbon); sub-pages per component (Primer); hand-written prop files (Primer).

## 3. Information architecture

Seven top-level areas. The first five are the authoring guide's page types; Playground and Changelog are tools.

| Area        | URL                                                   | Source                                              | Page type          |
| ----------- | ----------------------------------------------------- | --------------------------------------------------- | ------------------ |
| Home        | `/`                                                   | `apps/doc`                                          | Home               |
| Foundations | `/foundations/<topic>`                                | `design/foundations/<topic>.md`                     | Foundation         |
| Components  | `/components/<component>`                             | `packages/ui/src/components/<x>/<x>.md` + generated | Component          |
| Patterns    | `/patterns/<pattern>`                                 | `design/patterns/<pattern>.md`                      | Pattern            |
| Products    | `/products/<product>[/<area>]`                        | `design/products/<product>/*.md`                    | Product            |
| Decisions   | `/decisions/<NNNN-name>`, `/decisions/open-questions` | `design/decisions/*.md`                             | Decision           |
| Playground  | `/playground`                                         | `apps/doc/src/playground`                           | Tool (full screen) |
| Changelog   | `/changelog`                                          | `packages/ui/CHANGELOG.md`                          | Generated          |

- **Components are grouped by `category`** from front matter (actions, inputs, navigation, identity, status, content, agents, overlays, feedback, layout), in the nav and on a `/components` index page that lists every component with its summary and status.
- **Foundations, patterns and decisions are ordered by a small `nav.json` per folder** (title order is not meaningful for them). Products get one group per product.
- **Every URL has a `.md` twin** at the same path plus `.md`.
- **Old URLs redirect.** `/components/<slug>` keeps its slugs. `/tokens/colors` → `/foundations/color`, `/tokens/typography` → `/foundations/typography`, `/tokens/shadows` → `/foundations/elevation`, `/guides/<x>` → the pattern it merges into (see §9).

## 4. Navigation and search

The site follows the design system's own structure for a web product.

- **Frame: the web top bar.** Yellow (`layer-frame`), 56 tall: the Raft mark and "Raft Design System", the raft-ui version, the search box (`SearchTrigger`, ⌘K) in the middle, then Playground, Changelog, the theme menu (Light / Dark / System) and GitHub, all as `on-frame` buttons. The site counts as a brand page, like sign-in, so the mark is allowed on the frame.
- **Sidebar: cream** (`layer-sidebar`), 240 wide, built from raft-ui's `Sidebar` parts. Overview and "For agents" first, then one collapsible section per area. Components are grouped under category labels. The current page is the yellow sticker row. Non-stable components carry their status label; stable ones carry nothing, so the list stays quiet.
- **Paper: white** (`layer-canvas`). Content column up to 760 wide; the "On this page" list sits to the right from 1280 up.
- **Phone:** the top bar keeps the menu button, the title, search and theme. The sidebar becomes a drawer from the left. Content uses the 16px phone gutter.
- **No rail.** The DS rail is for switching between destinations of a workspace. The docs have one destination with sections, which is what a sidebar with sections expresses. A rail would add a column and icon-only entries that need tooltips. See decision 1.

**Search** opens a dialog from the top bar or ⌘K / Ctrl-K, built from raft-ui's `SearchEntityResult` rows.

- It indexes, in ranking order: page title (exact, prefix, substring), `aliases` (former DS names such as Sheet, NavBar, StatusChip, and names from other systems such as Snackbar, Modal, Kanban), then the summary. B4 adds `##` headings and token names, so "line-seam" lands on the Color section that defines it.
- An alias hit shows the matched name ("Also called Snackbar · Feedback"), so a search for "sheet" explains why it opens Drawer.
- Results show the section or component category. ↑ ↓ and Enter work.
- The index is built at build time from front matter and headings into one small JSON file. At around 120 pages, no search service (Pagefind, Algolia) is needed.

## 5. Page anatomy

All pages share one header: an eyebrow (section, plus category for components), the title, the one-sentence `summary`, and the page actions (Copy Page, plus a menu with View as Markdown, Copy Markdown Link, View Source). Long pages get an "On this page" list built from `##` headings.

### Home

1. Title, a two-sentence description of what the system and raft-ui are, `pnpm add raft-ui`, one pink primary action (Browse Components) and one outline action (Read the Foundations). Next to it, a diagram of the frame, sidebar and paper drawn with the tokens themselves.
2. The sections as cards, with counts and one-line descriptions, plus Playground.
3. The seven rules, one line each, from `design/README.md`.
4. For agents: `llms.txt`, `llms-full.txt`, the `.md` convention and `components.json`, each with what it contains.
5. Latest release: the version and its first entries, linking to the changelog.

The current home page (a gallery of every component) is dropped. The components index and Playground do that job with context.

### Component page

| #   | Part                                                                                                                                              | Source                    |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | Header: eyebrow "Components · Actions", title, summary, status label, "Also called …", the import line (copyable; `raft-ui/wip` for experimental) | Front matter, export      |
| 2   | Lead sentences, then the first example                                                                                                            | `.md`                     |
| 3   | When to use, a table that names the alternative component for each wrong case                                                                     | `.md`                     |
| 4   | Anatomy: the parts by exported name                                                                                                               | `.md`                     |
| 5   | Variants, each with an example                                                                                                                    | `.md` + compositions      |
| 6   | States, Behavior, Content                                                                                                                         | `.md`                     |
| 7   | Accessibility: semantics, keyboard, what the caller must add                                                                                      | `.md`                     |
| 8   | Rules: rules for this component only                                                                                                              | `.md`                     |
| 9   | API: props of the root and of each part, with types and defaults                                                                                  | Generated from TypeScript |
| 10  | Related components                                                                                                                                | Front matter `related`    |
| 11  | Changes: this component's changelog entries                                                                                                       | CHANGELOG.md              |

A deprecated component shows a banner at the top naming `replacedBy`. A component whose `.md` does not exist yet still gets a page: header, API and changes, plus a note naming the file that will fill it, so all 87 components are on the site from the first B4 release.

### Foundation page

1. Header and the idea behind the foundation in two or three sentences.
2. Principles: the few rules everything else follows.
3. One section per token group: a sentence on how the group is used, then the generated `tokens` table (token, light swatch, dark swatch, use). Swatches render inside light and dark islands, so both columns are live whatever the page's mode. B4 adds the values from `tokens.json` next to the swatches.
4. Usage: tables for choosing between tokens.
5. Do and don't pairs, where the wrong choice is common.
6. Related patterns, components and decisions.

### Pattern page

1. Header and the problem in the reader's terms, with the short answer.
2. When it applies, and what covers the cases it doesn't.
3. Choosing a component: when a pattern is a choice between components (feedback, overlays, loading), a table from situation to component, linking each.
4. Structure, with an example for each arrangement.
5. Rules.
6. Wide and narrow: phone, 768–1023, 1024 and up.
7. Related.

Product and decision pages use the same layout with their templates' sections. Decision pages add their number, status and date to the header, and a superseded decision links its successor.

## 6. Examples

An `example` block in Markdown names a composition by path, as the authoring guide defines:

````md
```example
button/compositions/default
```
````

- **What renders.** By the modules' existing convention, a composition file exports `*Content` (the real usage) and `*Composition` (a display shell). The site renders `*Content` in its own canvas and shows that file's source with the display-shell blocks removed, so the code a reader copies is exactly what they see.
- **Toolbar.** The composition path; a theme switch (Page, Light, Dark, Both); Phone; Code.
  - **Page** follows the global mode.
  - **Both** renders light and dark side by side (stacked on a phone).
  - **Phone** loads the composition in a 375px iframe (`/iframe/proposal-example` in the mock), so media queries and viewport units see a phone.
  - **Code** shows the source with a copy button. It is collapsed by default to keep pages short, and is always inlined in the `.md` twin.
- **Interactive previews.** The current per-component controls (for example Button's variant and size pickers) become ordinary compositions with state. There is no separate controls framework.
- **Missing examples fail the build.** A block that names a composition that does not exist fails the build, and so does a composition that no page uses.

## 7. Agent surfaces

| Surface            | Contents                                                                                                                                                                                                                       | Notes                                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `/<page>.md`       | The page's Markdown: front matter removed, the summary as a blockquote under the title, `example` blocks replaced by the composition source, `tokens` blocks by tables with values, and for components the generated API table | Served as `text/markdown`. Every HTML page links it with `<link rel="alternate" type="text/markdown">`, as Base UI does |
| `/llms.txt`        | A title, a two-line description of what raft-ui is and how pages are addressed, then sections Foundations, Components (sub-grouped by category), Patterns, Products, Decisions, each line `- [Title](url.md): summary`         | Summaries come from front matter, not from the first paragraph as today                                                 |
| `/llms-full.txt`   | Every twin in llms.txt order, each preceded by its URL                                                                                                                                                                         | Already exists                                                                                                          |
| `/components.json` | `[{ name, slug, category, status, aliases, summary, import, docs, markdown, source, related, replacedBy }]`                                                                                                                    | For agents and tooling that pick a component by name or alias. The same data drives the nav and search                  |
| Copy Page          | Copies the twin; the menu adds View as Markdown, Copy Markdown Link and View Source                                                                                                                                            | Already exists; moves into the new header                                                                               |

Each `.md` twin starts with a one-line note under the summary: the page is generated from the current release, and its API section wins over anything remembered (Base UI's preamble does the same).

Not in B4: an MCP server, and per-component `llms.txt` files. See decisions 5 and 6.

## 8. Written and generated

| Content                                                  | Source                                  | Status today                     | In B4                                                                                                                                 |
| -------------------------------------------------------- | --------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Rules and reasoning                                      | Markdown (`design/**`, component `.md`) | Chinese, in `design/`            | Rendered as pages; English text arrives from the parallel rewrite                                                                     |
| Token tables                                             | `tokens/tokens.json`                    | Hand-built `/tokens/*` routes    | `tokens` block                                                                                                                        |
| Props                                                    | TypeScript                              | Hand-typed `PropRow[]` per route | Generated at build time with the TypeScript compiler API (Polaris's approach) or `react-docgen-typescript`, into a JSON per component |
| Examples                                                 | Compositions                            | Imported by hand per route       | `example` block                                                                                                                       |
| Component list, nav, search, `components.json`, llms.txt | Front matter                            | Hand-maintained in `sidebar.tsx` | Generated                                                                                                                             |
| Changes per component                                    | `CHANGELOG.md`                          | Not shown                        | Filtered by component name                                                                                                            |

## 9. What happens to the current site

| Current                                                                        | Decision                                                                                                                                                   | Why                                                                                                                                                |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| 85 routes in `routes/components/*.tsx`                                         | **Replace** with one `/components/$slug` route                                                                                                             | Prose moves to the component `.md`; examples are already compositions in `modules/`; props become generated. The route keeps no content of its own |
| `modules/<component>/compositions`, `*.preview.tsx`                            | **Keep**                                                                                                                                                   | They are the `example` sources. Previews with controls become compositions                                                                         |
| `components/doc-page.tsx`, code blocks, `props-table.tsx`, `preview-theme.tsx` | **Keep and adapt**                                                                                                                                         | The new layout reuses them                                                                                                                         |
| `components/sidebar.tsx` (1,264 lines, hand-kept list)                         | **Replace** with the generated nav                                                                                                                         | Today a component must be added in two places                                                                                                      |
| Home gallery (`routes/index.tsx`, 1,462 lines)                                 | **Drop**                                                                                                                                                   | The components index and Playground do this with context                                                                                           |
| `/tokens/colors`, `/tokens/typography`, `/tokens/shadows`                      | **Merge** into Foundations: Color, Typography, Elevation                                                                                                   | A token's value and its rule belong on one page. Redirect the old URLs                                                                             |
| `/components/icons`                                                            | **Merge** into Foundations › Iconography (the gallery stays as an example)                                                                                 | Icons are a foundation in the DS                                                                                                                   |
| `/guides/*` (the `raft-ui-guide` skill's 12 rules)                             | **Merge** into Patterns. The skill keeps shipping in the npm package, and its rules become short pointers to the pattern pages, or are generated from them | Two sets of composition guidance (skill rules and DS patterns) will drift. Decision 4                                                              |
| `/playground`                                                                  | **Keep**, full screen, linked from the top bar                                                                                                             | It is the integration test of the whole system in one product shape                                                                                |
| `/dashboard`                                                                   | **Merge** into a new pattern page on data-dense screens, as its example; drop the route                                                                    | It is a pattern example, not a destination                                                                                                         |
| `/lab` (pixel loader, logo shine, logo snap)                                   | **Merge** into Foundations › Brand (logo treatments) and Motion (pixel loader); drop the route                                                             | These are motion and brand rules with examples. Treatments not adopted go to `design/archived/`                                                    |
| `/changelog`                                                                   | **Keep**, plus per-component Changes                                                                                                                       |                                                                                                                                                    |
| `/iframe/*`                                                                    | **Keep**, as the phone-view and full-screen example frames                                                                                                 |                                                                                                                                                    |
| `design/components/*/preview.html`                                             | **Drop** after each page has compositions (migration step 4)                                                                                               | Two drawings of one component drift; the live raft-ui example is the reference                                                                     |
| `design/*.md` (Chinese pages)                                                  | **Replace** by the English pages (parallel session)                                                                                                        |                                                                                                                                                    |
| `llms.txt`, `llms-full.txt`, `.md` twins (`scripts/build-llms.mjs`)            | **Keep and rework**                                                                                                                                        | Sectioned by the new IA, summaries from front matter, built from Markdown instead of rendering React routes in Markdown mode                       |

## 10. Implementation plan

Each step is one PR and leaves the site working.

1. **Content pipeline.** Load `design/**/*.md` and `packages/ui/src/components/*/*.md`: front matter, `example` and `tokens` blocks, relative-link rewriting. Add the `/$section/$slug` route and the new shell behind `/next`. Fail the build on a missing example. Add tests.
2. **Generated parts.** Props JSON from TypeScript; `tokens` tables from `tokens/tokens.json` (after the token rename lands); nav, search index and `components.json` from front matter.
3. **Agent surfaces.** Rework `build-llms.mjs` to emit twins from Markdown, the new llms.txt sections, `components.json` and the `rel="alternate"` links.
4. **Switch.** Move `/next` to `/`, add redirects, delete the 85 component routes, the old sidebar, the home gallery, `/tokens/*`, `/dashboard` and `/lab`, after their content has moved.
5. **Follow the content rewrite.** As each English area lands, its pages fill in; no site change needed.

Regression guards: unit tests for the pipeline (example resolution, twin output, search ranking with aliases), the existing build-time llms step, and a build failure for unknown `example` / `tokens` references. Visual checks of the shell in light, dark and at 375px are left to the reviewer on the Workers preview.

## 11. Decisions needed

1. **Rail or no rail.** The proposal uses top bar + sidebar, no rail (§4). The alternative is the full desktop Raft shell (rail with section icons + sidebar), which matches the product but adds a column.
2. **URL prefixes.** Keep `/components/<slug>` (no break), and move tokens to `/foundations/*` with redirects. Alternatively keep `/tokens/*` as its own area.
3. **Example code open or collapsed by default.** The proposal collapses it on the page (it is always in the `.md`).
4. **The raft-ui-guide skill.** Its rules overlap the DS patterns. Options: (a) the patterns become the source and the skill links to or is generated from them (proposed); (b) the skill stays separate and hand-kept; (c) drop the skill and point agents at llms.txt.
5. **MCP server.** Not in B4. If wanted later, it should offer checks (token lookup, "is this the right component", a11y), not only reading pages, which the `.md` files already cover.
6. **"Open in Claude / ChatGPT" in the Copy Page menu** (shadcn does this). Cheap; it sends a page URL to a third-party service, so it is your call.
7. **Lab treatments.** Which of logo shine, logo snap and the pixel loader are adopted (and documented under Brand and Motion) and which are archived.
8. **Dashboard.** Keep as a pattern example (proposed) or drop.
9. **Products section with one product.** Show Products now with only Raft Chat (proposed), or fold Raft Chat into Patterns until a second product exists.

## 12. The mocks in this PR

Routes under `/proposal` on the Workers preview, built from raft-ui and following the DS. The current site stays as it is next to them.

| Page type  | Route                                                                                                                                  |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Home       | `/proposal`                                                                                                                            |
| Component  | `/proposal/components/button` (with content); any other component, such as `/proposal/components/toast`, shows the generated-only page |
| Foundation | `/proposal/foundations/color`                                                                                                          |
| Pattern    | `/proposal/patterns/feedback`                                                                                                          |

What is real in the mock: the shell (top bar, cream sidebar with every page, phone drawer), the search with aliases, `example` blocks that load the real compositions with Page / Light / Dark / Both, phone iframe and source, `tokens` blocks with live swatches in both modes, the Markdown twin (Copy Page and View as Markdown build it from the same source), the per-component Changes from CHANGELOG.md, and the status labels.

What is placeholder: the page text (`apps/doc/src/proposal/content/*.md`, marked with a banner until the English docs land), the category and alias data (`catalog.ts`, copied from the migration map; B4 reads front matter), Button's props table (hard-coded; B4 generates it), and token values (B4 reads `tokens.json`).

Checks run: `vp check` (format, lint, types) passes; `apps/doc` builds; `src/proposal/proposal.test.ts` covers alias search, example resolution and the twin output. Every mock route was also rendered once in jsdom to check that it renders without errors. No browser checks were run.
