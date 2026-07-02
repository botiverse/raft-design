---
target: packages/ui/src/components/separator
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-07-02T03-09-03Z
slug: packages-ui-src-components-separator
---

Method: dual-agent (A: 019f20ca-6511-7762-bc19-9e5b4fc827b5 · B: 019f20ca-79d3-7d11-8cf8-68f952daad6d)

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                                                                |
| --------- | ------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1         | Visibility of System Status     | 3         | Non-interactive primitive; docs show orientation and preview states clearly enough.                                      |
| 2         | Match System / Real World       | 3         | Separator maps to normal grouping conventions, but the labeled version blurs whether it is a separator or section label. |
| 3         | User Control and Freedom        | 3         | `className` escape hatch exists; `render` is effectively dropped in labeled mode.                                        |
| 4         | Consistency and Standards       | 2         | Unlabeled mode uses Base UI semantics; labeled mode bypasses them with a plain `div`.                                    |
| 5         | Error Prevention                | 2         | Docs expose `Base UI Separator.Props`, but labeled mode silently supports a smaller prop contract.                       |
| 6         | Recognition Rather Than Recall  | 3         | API and docs examples are straightforward for the common case.                                                           |
| 7         | Flexibility and Efficiency      | 3         | Horizontal, vertical, and labeled horizontal use cases are covered with a narrow API.                                    |
| 8         | Aesthetic and Minimalist Design | 4         | Visually restrained, theme-appropriate, and free of decorative slop.                                                     |
| 9         | Error Recovery                  | 2         | No clear guidance for `children` with `orientation="vertical"` or custom `render` behavior.                              |
| 10        | Help and Documentation          | 2         | API docs overpromise Base UI prop support; source refs still point at historical backup paths.                           |
| **Total** |                                 | **27/40** | **Acceptable, close to good: visually clean, semantically not quite done.**                                              |

## Anti-Patterns Verdict

**LLM assessment:** Separator passes the product slop test. It is restrained, narrow, and appropriately boring for a primitive. It does not show the usual AI tells: no decorative gradients, no invented affordances, no oversized typography, no fake delight. The issue is subtler and more important for a component library: the primitive looks finished, but its labeled mode changes semantic behavior.

**Deterministic scan:** `node .agents/skills/impeccable/scripts/detect.mjs --json packages/ui/src/components/separator` returned exit code `0` with `0` findings. No file locations, no false positives.

**Visual overlays:** Browser overlay was not attempted because this run did not have current-turn Browser authorization under the repo AGENTS boundary. No user-visible overlay is available. Fallback signal used: code-side route/source inspection plus CLI detector.

## Overall Impression

This is visually in the right family: Brutal is square and source-faithful, Elegant is quiet and token-like, and the API stays pleasantly small. The biggest opportunity is to make the most expressive mode, `<Separator>Actions</Separator>`, as semantically trustworthy as the plain Base UI-backed separator.

## What's Working

- The visual recipe matches the design spec: Brutal uses a 2px black rule; Elegant uses a 1px muted rule.
- The API is narrow: one primitive handles horizontal, vertical, and labeled horizontal separators without adding a needless compound surface.
- The docs route gives useful usage guidance, especially the note to use vertical separators only in rows with stable height.

## Priority Issues

**[P1] Labeled separators lose Base UI accessibility semantics**

**Why it matters:** The plain separator path uses `BaseSeparator`, which adds `role="separator"` and `aria-orientation`. The labeled path renders a plain `div`, so adding children silently changes the accessibility contract.

**Fix:** Render the labeled root through `BaseSeparator` too, or manually preserve `role="separator"` and `aria-orientation`. Prefer `BaseSeparator` so `render`, refs, state, and future Base UI behavior stay intact.

**Suggested command:** `$impeccable harden packages/ui/src/components/separator`

**[P1] Public docs overpromise Base UI prop support**

**Why it matters:** The docs say `...props` are `Base UI Separator.Props`, but labeled mode strips `render` and casts props to div props. Product engineers will assume one exported prop contract, then hit a silent behavior fork.

**Fix:** Preserve `render` in labeled mode, or document a smaller labeled-mode contract. The better direction for raft-ui is to preserve the Base UI contract because this is a composition-first library.

**Suggested command:** `$impeccable polish packages/ui/src/components/separator`

**[P2] Brutal styling hardcodes black instead of theme line tokens**

**Why it matters:** `border-black` and `text-black/70` currently match Brutal, but they bypass the product rule that shared visual behavior should flow through theme tokens where possible.

**Fix:** Use `border-line-strong` and `text-foreground/70` or `text-foreground-muted`, unless exact source black is intentionally documented as the token value.

**Suggested command:** `$impeccable colorize packages/ui/src/components/separator`

**[P2] Source comparison references the historical backup repo**

**Why it matters:** The separator docs still point source scenes at `slock-ui-backup`. Current source-parity work should prefer the active `slock` source repo so future audits do not chase stale evidence.

**Fix:** Update source refs to the active source repo and verify line anchors.

**Suggested command:** `$impeccable document apps/doc/src/routes/components/separator.tsx`

## Persona Red Flags

**Alex (Power User / Design-System Engineer):** Alex wants to trust a primitive quickly. The hidden behavioral fork means `<Separator />` and `<Separator>Actions</Separator>` do not share the same underlying prop semantics, so Alex must inspect implementation instead of relying on the API table.

**Sam (Accessibility-Dependent User):** The unlabeled branch inherits Base UI semantics. The labeled branch needs manual repair or verification because it no longer uses the Base UI primitive that supplies `role` and `aria-orientation`.

**Raft Product Engineer:** The component is marked as done and visually looks done. That makes the labeled-mode prop gap more dangerous: engineers may use it in dense dialogs/settings flows without realizing the semantic contract changed.

## Minor Observations

- `children != null` means an empty string triggers labeled layout. That is probably acceptable, but it should be intentional.
- `children` with `orientation="vertical"` silently ignores the label. A docs note or dev warning would reduce confusion.
- `py-3` on labeled separators is a strong spacing opinion for a primitive; consider whether spacing should live on call sites.

## Questions to Consider

- Should a labeled separator be a separator with a name, or a small section label with decorative rules?
- Is `Separator` truly done if its most expressive mode skips the primitive it wraps?
- Would a stricter compound API, like `Separator.Label`, make semantics clearer, or is the current narrow API worth preserving?
