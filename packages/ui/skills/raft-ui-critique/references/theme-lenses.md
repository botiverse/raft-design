# Theme Lenses

Use all four lenses for a full review: the cross-theme lens plus one independent pass for each presentation preset. Verify token- or typography-specific claims against `foundation.css` and `fonts.css` (see Package evidence lookup in SKILL.md).

## Cross-theme lens

Check whether the three presets preserve:

- The same component identity, content, reading order, and interaction model.
- Equivalent importance for primary actions, destructive actions, status, metadata, and secondary controls.
- Usable geometry: no theme-only clipping, wrapping, crowding, overlay collision, or target shrinkage.
- Component ownership: themes may restyle structure but must not add, remove, or replace business DOM.
- Semantic color roles: primary is interactive expression and hints; accent is core or important action; state colors communicate state rather than decoration.
- Contextual fit: the component still belongs in the surrounding shell instead of looking like a pasted theme demo.

Use a comparison matrix when several states are present:

| State or relationship   | Brutal   | Elegant  | Elegant Dark | Verdict      |
| ----------------------- | -------- | -------- | ------------ | ------------ |
| Resting hierarchy       | observed | observed | observed     | pass/finding |
| Hover and pressed       | observed | observed | observed     | pass/finding |
| Focus-visible           | observed | observed | observed     | pass/finding |
| Disabled or unavailable | observed | observed | observed     | pass/finding |
| Selected/open/checked   | observed | observed | observed     | pass/finding |
| Error/loading/empty     | observed | observed | observed     | pass/finding |

Include only applicable rows. `Not shown` is evidence status, not a pass.

## Brutal lens

Judge deliberate boldness, not conformity to Elegant:

- Strong borders and hard offset shadows must clarify grouping, elevation, or interaction. Flag double seams, clipped shadows, accidental softness, and equal visual weight everywhere.
- Bright palette colors must carry semantic roles. Flag decorative yellow/pink/cyan fields that compete with primary actions or status.
- Rectilinear geometry and typography should feel intentional. Flag isolated rounded corners, mismatched stroke weights, weak alignment, and accidental Elegant residue.
- Bold type, outlines, and color create high baseline intensity. Require a clear entry point and quieter secondary information so the surface does not shout uniformly.
- Hover, pressed, selected, and focus states must remain distinguishable from the already-high-contrast resting state.

Ask: does this feel forceful and legible, or merely loud?

## Elegant lens

Judge restraint, precision, and hierarchy:

- Page, panel, card, inset, and popover surfaces should form a quiet but readable elevation ladder. Flag indistinguishable layers, muddy shadows, or borders that overpower content.
- Typography should create hierarchy through controlled size, weight, spacing, and color. Flag excessive styles, weak headings, and metadata that competes with primary content.
- Neutral fills and hairlines should reduce noise without erasing affordance. Check fields, menus, selected rows, dividers, and secondary buttons closely.
- Primary and accent colors should be scarce and intentional. Flag tinted decoration that dilutes action and state meaning.
- Hover, focus, selected, disabled, and invalid states must be perceptible without borrowing Brutal's heavy outlines everywhere.
- Theme refinement may change visual treatment, not content structure, interaction semantics, or business policy.

Ask: does this feel calm and exact, or washed out and generic?

## Elegant Dark lens

Review this independently rather than treating it as color inversion:

- Elevation should come from the dark surface lightness ladder first and shadow second. Flag panels, cards, fields, and popovers that collapse into one black plane.
- Preserve the warm neutral material and text hierarchy. Flag pure-black patches, cold mismatched neutrals, glowing white text, and muted text that becomes either dominant or unreadable.
- Hairlines, inset rings, and shadows must separate adjacent dark surfaces without creating halos, dirty seams, or black fog.
- Semantic colors and translucent state washes must composite cleanly over page, panel, and popover surfaces. Flag oversaturation, muddy status colors, and color-only state communication.
- Hover, pressed, focus-visible, selected, checked, invalid, and disabled states need distinct luminance or structure; a slight color shift that disappears on dark is not enough.
- Overlays and portals must inherit Elegant Dark correctly. Check popovers, menus, dialogs, tooltips, native controls, and backdrops for light-theme leakage.
- Media, avatars, icons, and illustrations must retain intended contrast without accidental dimming, inversion, or bright edge artifacts.

Ask: does this feel dimensional and composed, or flat, glowing, and fatiguing?

## User-context lens

For every preset, ask:

- Where does the eye land first, and is that the right place for the task?
- What emotion does the visual language add: confidence, urgency, playfulness, calm, pressure, or confusion?
- Does the density suit the user's likely time pressure and expertise?
- Are loading, empty, error, success, and destructive moments handled with appropriate care?
- Does switching presets preserve confidence, or make the product appear to change behavior?

Tie every emotional judgment to visible evidence. Do not substitute taste words for observations.
