# `packages/ui` Component-Library Contract

These rules apply to production component-library code under `packages/ui` and extend the repository-level architecture rules.

What components look like is set by the Raft Design System in [`design/`](../../design/README.md)
(see the root `AGENTS.md`). How this package implements its type and colour — font families, the
size ladder, the colour tiers, and the note-colour rule — lives in
[Typography](../../design/foundations/typography.md). Read it before touching type scales, colour
tiers, or family classes.

## What Belongs Here

- Business-agnostic visual primitives and compound parts.
- Reusable headless interaction behavior built on `@base-ui/react`.
- Component styling expressed through `tv()` recipes and semantic tokens.
- Accessible defaults, native props, refs, `render` substitution, and stable `data-slot` protocols.
- Stable UI semantics such as size, density, visual variant, tone, placement, disabled state, and native ARIA state.

Generic interaction state may live here when the component owns the behavior: open/closed, focus, keyboard navigation, selection collections, and controlled/uncontrolled value. Base UI should own this behavior whenever it provides the matching primitive.

## What Does Not Belong Here

- Product copy, i18n text, policy decisions, permissions, or entity-specific labels.
- Product-selected icons or actions whose meaning belongs to chat, tasks, files, notifications, or another workflow.
- Router, query, store, mock-data, or product-entity dependencies.
- Upload, saved, followed, muted, task, delivery, notification, or other product workflow state.
- Public catch-all `kind`, `state`, or `emphasis` props that choose materially different structures.
- ARIA widget roles without the corresponding focus, keyboard, collection, and close behavior.

Discriminated unions remain valid for internal implementation and application-domain data. The restriction is against hiding visible UI structure behind a generic public component prop.

## API Shape

- Use `children` for visible content.
- Use explicit compound parts for named regions or structural alternatives.
- Preserve native element props and names whenever possible.
- Use `onXxx` and `onXxxChange` for coordination.
- Use native `aria-pressed`, `aria-current`, `disabled`, and Base UI data attributes instead of duplicate styling-state props.
- A styling-only API must be named as a visual slot, such as `SuggestionList` or `SuggestionOption`; it must not imply that it implements a combobox or menu state machine.

## Product-State Styling

When a consumer-owned state needs a visual treatment, expose semantic parts rather than owning the workflow:

```tsx
<MessageAttachmentCard>
  <MessageAttachmentBody />
  <MessageAttachmentLoadingBar />
  <MessageAttachmentPendingIndicator />
  <MessageAttachmentErrorOverlay />
</MessageAttachmentCard>
```

The consumer decides which state part exists. Recipes may derive styling from explicit `data-slot` structure with `has-*` selectors. The root must not require `state="pending"` or equivalent business props.

## Styling Ownership

- Reusable typography, letter spacing, spacing, sizing, colors, hover/active/disabled behavior, and light/dark differences belong in the component recipe.
- Group recipe classes by layout, typography, surface, interaction state, and child/slot relationship.
- Do not rely on docs or Playground classes to complete the component's intended appearance.
- If deleting a docs/Playground `className` makes the component itself incorrect, move that styling into the appropriate UI recipe or add a semantic part.

## Base UI, Overlays, and Portals

- Use Base UI for dialog, menu, dropdown, tooltip, popover, combobox, selection, focus, and collection behavior when a matching primitive exists.
- Menu-like children must register as the corresponding Base UI item; arbitrary buttons inside menu content do not participate in keyboard collection behavior.
- Preserve Base UI portal/container props through wrappers.
- Do not introduce a package-specific portal provider when the primitive's container API solves the ownership problem.

## Exports and Graduation

- Keep component-local exports in the component `index.ts`.
- Export active migrations through `packages/ui/src/wip.ts` while their contract is still being refined.
- Promote a component to the stable package surface only after its API, docs compositions, and consumer usage have stabilized.

## Review Checklist

- Is every public concept business-agnostic?
- Does Base UI own available headless behavior?
- Does the public API expose structure instead of hiding it behind `kind/state/emphasis`?
- Are product copy, icons, policy, and workflow state outside the package?
- Are reusable styles entirely owned by tokens and recipes?
- Do wrappers preserve native props, refs, element substitution, data attributes, and portal control?
- Does every ARIA role have the behavior it promises?
