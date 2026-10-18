# Theme Lenses

Use all three lenses for a full review: the cross-mode lens, the Raft lens in each preset, and the dark-mode lens for Dark. Verify token- or typography-specific claims against `foundation.css` and `fonts.css` (see Package evidence lookup in SKILL.md).

## Cross-mode lens

Check whether Light and Dark preserve:

- The same component identity, content, reading order, and interaction model.
- Equivalent importance for primary actions, destructive actions, status, metadata, and secondary controls.
- Usable geometry: no mode-only clipping, wrapping, crowding, overlay collision, or target shrinkage.
- Component ownership: a mode may restyle structure but must not add, remove, or replace business DOM.
- Semantic color roles: primary is interactive expression and hints; accent is core or important action; state colors communicate state rather than decoration.
- Contextual fit: the component still belongs in the surrounding shell instead of looking like a pasted demo.

Use a comparison matrix when several states are present:

| State or relationship   | Light    | Dark     | Verdict      |
| ----------------------- | -------- | -------- | ------------ |
| Resting hierarchy       | observed | observed | pass/finding |
| Hover and pressed       | observed | observed | pass/finding |
| Focus-visible           | observed | observed | pass/finding |
| Disabled or unavailable | observed | observed | pass/finding |
| Selected/open/checked   | observed | observed | pass/finding |
| Error/loading/empty     | observed | observed | pass/finding |

Include only applicable rows. `Not shown` is evidence status, not a pass.

## Raft lens

Judge whether the surface speaks Raft's material language:

- Every color block is a sticker: an ink edge and ink type on the color. Flag colored fills without the edge, light type on a sticker, and edges that double up with an adjacent border.
- Lines carry roles: ink lines say "control", seams split regions, hairlines sit inside content. Flag a hairline used as a control edge or an ink line used as a region divider.
- Controls cast no shadow; only overlays float, and `--theme-shadow-sticker` is a hard offset under a sticker. Flag soft shadows on controls, cards, or rows, and floating surfaces without the overlay shadow.
- Corners follow the shape scale in `styles.css`: sticker, chip, control, container, dialog; fully round only for switches and radios. Flag corners off the scale or mixed within one group.
- Space Grotesk is what people say; Space Mono is what machines write (ids, times, counts, events, code). Flag machine output set in sans and prose set in mono.
- Yellow and pink must carry semantic roles. Flag decorative yellow/pink fields that compete with primary actions or status.
- Hover and pressed keep a control's resting color under an ink wash; focus-visible is the ink ring. Flag a state that swaps a sticker's color or that is indistinguishable from rest.
- Stickers, ink edges, and bold type create high baseline intensity. Require a clear entry point and quieter secondary information so the surface does not shout uniformly.

Ask: does every sticker, line, and shadow carry a role, or is the surface merely loud?

## Dark-mode lens

Review this independently rather than treating it as color inversion:

- Content stays lighter than the frame and sidebar, and card, popover, and inset surfaces step lighter again. Flag panels, cards, fields, and popovers that collapse into one black plane.
- Preserve the neutral material and text hierarchy. Flag pure-black patches, mismatched neutrals, glowing white text, and muted text that becomes either dominant or unreadable.
- Stickers keep their colors and ink type and gain a die-cut edge. Flag stickers that lose the edge or switch to light type.
- Seams, hairlines, and the overlay shadow must separate adjacent dark surfaces without creating halos, dirty seams, or black fog.
- Semantic colors and translucent state washes must composite cleanly over page, panel, and popover surfaces. Flag oversaturation, muddy status colors, and color-only state communication.
- Hover, pressed, focus-visible, selected, checked, invalid, and disabled states need distinct luminance or structure; a slight color shift that disappears on dark is not enough.
- Overlays and portals must inherit Dark correctly. Check popovers, menus, dialogs, tooltips, native controls, and backdrops for light-mode leakage.
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
