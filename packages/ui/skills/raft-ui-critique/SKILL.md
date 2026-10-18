---
name: raft-ui-critique
description: "Critique raft-ui components and product surfaces from screenshots, live renders, or code evidence in Light and Dark modes. Use when reviewing, auditing, polishing, comparing, or validating visual hierarchy, Raft fidelity, interaction feedback, accessibility, consistency, and user experience in packages/ui, docs compositions, or Playground."
---

# Raft UI Critique

Review the rendered experience, not only implementation compliance. Produce specific, evidence-based findings for each color mode and for the relationships between them.

Use [theme-lenses.md](./references/theme-lenses.md) for every review. Read active repository instructions when they are available, but keep this skill usable from the published `raft-ui` package without requiring sibling skills or repository-only files.

## Theme model

Raft is the only visual language. Treat its two color modes as independent critique presets:

| Critique preset | Runtime configuration |
| --------------- | --------------------- |
| Light           | `mode="light"`        |
| Dark            | `mode="dark"`         |

Do not invent a theme family or a `theme` prop; `mode="system"` resolves to one of these two. Dark still requires its own evidence and verdict because dark surfaces, contrast, elevation, and interaction states fail independently.

## Evidence boundary

Use the strongest evidence available for the claim being made:

1. For visual hierarchy and preset comparison, prefer matched screenshots or renders of both presets.
2. For interaction, focus, responsive behavior, overlays, or motion, prefer a live page when the user and host environment authorize interaction.
3. Use partial screenshots or renders for local observed findings only.
4. Use component code and recipes to trace likely causes, never to claim a rendered result.

Follow the host repository's tool and browser policy. Do not infer permission from this skill. When live interaction is unavailable, continue with supplied evidence and mark unexercised behavior as a coverage gap.

When evidence is incomplete:

- Critique what is visible without blocking useful work.
- Name every missing preset, state, or viewport in `Coverage gaps`.
- Do not issue a cross-mode pass verdict without matched evidence for both presets.
- Label code-only conclusions as inferred. Do not claim pixel accuracy, visual parity, contrast compliance, or interaction quality from static code alone.

## Package evidence lookup

Use the first available evidence source; do not require a source checkout:

1. In the raft-ui repository, inspect `packages/ui/src/foundation.css`, `packages/ui/src/fonts.css`, the component recipe, and its real consumers.
2. In an installed application, inspect `node_modules/raft-ui/dist/foundation.css`, `node_modules/raft-ui/dist/fonts.css`, `node_modules/raft-ui/dist/index.d.mts`, and the application's component usage.
3. If neither code surface is available, rely on supplied screenshots or renders and state that implementation ownership is unverified.

Treat declarations as API evidence and compiled CSS as token evidence.

## Review workflow

Follow this sequence without merging the lenses.

### 1. Establish context

State what the surface is, who uses it, its primary task, and the likely user state of mind. Distinguish an isolated primitive, a canonical composition, and a product workflow; each has a different appropriate density and level of context.

### 2. Normalize the evidence

Compare like for like:

- Use the same component, content, state, viewport dimensions, zoom, and motion frame.
- Keep surrounding context equivalent. A fragment without its normal shell cannot prove page hierarchy.
- Record which interaction states are shown: default, hover, pressed, focus-visible, disabled, selected, open, checked, invalid, loading, or empty, as applicable.
- Separate the live primitive, docs composition, and Playground wrapper. Never treat one as proof for another.

Record an evidence manifest with the route or artifact, preset, exact viewport, browser/platform when known, zoom, font-loading status, UI state, and reduced-motion setting when motion is relevant. For a full product-surface review, include a representative wide and narrow viewport when the layout is responsive; a single isolated primitive may need only its relevant size.

If mismatched evidence prevents a fair comparison, report that before critiquing the modes.

### 3. Exercise interaction when live evidence is available

Use both pointer and keyboard for applicable controls:

1. Observe the resting state and identify the expected action.
2. Exercise hover, pressed, and keyboard focus-visible independently.
3. Open, select, check, expand, drag, validate, load, or disable the control when those states belong to the surface.
4. Inspect overlay placement, clipping, focus return, and preset inheritance.
5. Repeat the material states in both presets; do not assume behavior verified in one preset survives the other.

Capture or record the exact state that supports each interaction finding. If a state cannot be reached safely, mark it `Not exercised`; do not issue a pass or failure verdict for that state.

### 4. Give a first impression

Write one direct paragraph about the overall hierarchy and emotional tone. Identify the visual entry point, the heaviest element, and the most obvious source of friction. Do not pad the critique with generic praise.

### 5. Review the shared interface

Audit the dimensions that should work in every preset:

- Visual hierarchy: color intentionality, typography, weight versus importance, spacing, alignment, density, icons, and media.
- Interface design: focusing mechanism, progressive disclosure, information load, expectation setting, feedback, redundancy, and platform conventions.
- Interaction: visible affordances and distinguishable hover, pressed, focus-visible, disabled, selected, open, checked, invalid, and loading states when relevant.
- User context: emotional burden, time pressure, recoverability, clarity of the next action, and moments where uncommon care is missing.
- Accessibility visible from the evidence: focus visibility, target clarity, state communication, text legibility, and reliance on color alone. Do not claim keyboard behavior without exercising it or a contrast ratio without measured colors.

Count and name what is visible. Prefer "four surfaces compete with equal weight" over "the hierarchy feels off."

### 6. Review each preset independently

Apply the lenses in [theme-lenses.md](./references/theme-lenses.md):

1. Raft, in Light and in Dark
2. Dark mode, in Dark

Dark is not an inverted Light screenshot. Judge whether each preset expresses the same semantic hierarchy through the Raft visual language.

### 7. Compare across presets

Check the cross-mode invariants in [theme-lenses.md](./references/theme-lenses.md).

A shared defect belongs under `Cross-mode`. A defect visible in only one preset belongs under that preset even when the root cause is shared code.

### 8. Trace likely ownership

When code is available, connect each visual issue to the most likely owner without turning the critique into an implementation plan:

- Reusable appearance or interaction styling: `packages/ui` component recipe or semantic tokens.
- Canonical example structure: docs module composition.
- Product state or workflow coordination: Playground or application consumer.
- Global token and font material: `foundation.css` / `fonts.css` (see Package evidence lookup).

State whether the cause is observed, code-verified, or inferred. Do not prescribe a new token for a one-off correction, and do not patch a consumer to compensate for a broken reusable component contract.

### 9. Prioritize findings

Use these severities:

- `P1` — Blocks understanding or task completion; hides focus/state; creates a serious accessibility problem; or breaks structure in a preset.
- `P2` — Material hierarchy, readability, interaction, consistency, or cross-mode defect that should be fixed.
- `P3` — Local polish issue with limited user impact.

Order structural and behavioral problems before visual polish. Do not invent a finding for every preset.

## Finding format

Write every finding as:

`[P2][Dark][Surface separation] — factual observation. User impact. Direction for improvement. Evidence: screenshot, state, or file.`

Keep observation, impact, and direction distinct. If the cause is inferred, say so explicitly.

## Output format

Always include:

```markdown
## Context and evidence

## Overall verdict

## Findings

## Top opportunities

## Coverage gaps
```

Under `Findings`, add `Cross-mode`, `Light`, `Dark`, or `Interaction and user context` subsections only when evidence supports them. Do not create empty preset sections for a partial review. Under `Top opportunities`, rank one to five supported changes and name which presets they affect; there is no minimum finding count.

## Hard boundaries

- Keep review-only requests read-only.
- Do not conflate critique with functional validation, static checks, or test results.
- Do not recommend making Light and Dark visually identical; require equivalent usability and semantic hierarchy.
- Do not let mode-specific polish change component meaning, public API, or business structure.
