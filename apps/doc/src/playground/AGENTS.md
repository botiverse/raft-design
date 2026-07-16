# Playground Contract

Playground is a coherent mock product application that composes and exercises `raft-ui`. It is not a second component library or a replacement for canonical docs compositions.

## What Belongs Here

- A canonical typed mock domain for actors, channels, messages, threads, navigation, and scenarios.
- TanStack Router coordination for the active channel, thread, tab, and other navigable mock state.
- Business-shaped demo state such as saved, followed, muted, task status, notification dismissal, search match, composer draft, attachment retry, and selection.
- Thin business wrappers that map mock entities and callbacks onto UI primitives or canonical docs compositions.
- Page and shell layout needed to combine rail, sidebar, main panel, thread panel, and composer.
- Deterministic mock behavior needed to verify interactions across components.

Model explicit product state in mock data, but do not use a channel-level discriminator to select unrelated timeline structures. Conversations expose ordinary metadata; messages, threads, and other entities stay in their own indexed collections.

## What Does Not Belong Here

- Reusable component recipes or token definitions.
- Reimplementations of `packages/ui` components.
- Copies of canonical attachment, reaction, selection, context-menu, composer, or message compositions.
- Local utility classes that repair component-internal styling.
- Theme selectors that add, remove, or replace business DOM.
- Scattered scenario/navigation registries or repeated ID-to-state lookups outside the canonical mock model.
- String protocols where a typed union or object models the state directly.
- Hand-written overlays, menus, tooltips, selection widgets, or portal providers when Base UI already provides the behavior.
- Public UI props added only to make one Playground scene convenient.

## Composition Rule

- Prefer importing a canonical composition from `apps/doc/src/compositions`.
- Add a Playground wrapper only when mock domain data, route coordination, or cross-component state must be supplied.
- The wrapper may own business state and product copy; it must not duplicate the UI structure or styling that the canonical composition already owns.
- If the same wrapper becomes useful in docs and Playground, promote it into the canonical compositions layer rather than keeping two copies.

## Mock Data Rule

- Sidebar, route, header, timeline, composer, and thread panel must read from the same canonical mock entities.
- Relationships are represented by stable typed IDs and validated lookup helpers.
- Scenario identity and navigation metadata live on the channel/domain object that owns them, not in parallel registries.
- Cross-channel or invalid thread state must be rejected or cleared by the route boundary.

## Interaction Rule

Every enabled control must produce an observable result:

- Update mock state.
- Navigate to a valid Playground route.
- Open a real Base UI overlay.
- Trigger a deterministic preview/download/copy action.
- Announce a result through an appropriate live region when the result is not otherwise visible.

If a reasonable mock does not exist, render the control disabled. If it is only visual presentation, do not render it as an interactive element.

Base UI collection semantics must remain intact: menu actions render as menu items, combobox/listbox options participate in the owned collection behavior, and portal containers are passed through the primitive API.

## Styling Rule

- Playground may style page layout, scenario grouping, shell dimensions, and demo positioning.
- Playground must not tune a reusable component's typography, color, internal spacing, hover behavior, or theme treatment.
- If a Playground class is required to make the component itself correct, move the style into the component recipe or expose a semantic UI part.
- Theme Switcher is part of Playground and should be preserved, but all themes consume the same business DOM.

## When to Add a Component to Playground

Add a component when at least one is true:

- It participates in the chat/app-shell product scenario.
- It needs cross-component verification that a standalone docs example cannot provide.
- It affects channel, message, thread, composer, task, file, notification, or navigation workflows.
- Its state must stay consistent across multiple Playground regions.

Not every UI component needs a dedicated Playground scene. Standalone visual primitives may remain docs-only.

## Review Checklist

- Does the scene reuse canonical compositions?
- Is there one coherent mock-data source?
- Do sidebar, header, timeline, composer, and thread agree on entity state?
- Does every enabled control work?
- Are business state and copy outside `packages/ui`?
- Are reusable component styles outside Playground?
- Does theme only change styling?
- Are overlays and keyboard collections implemented by Base UI rather than recreated locally?
