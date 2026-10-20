# Product

## Register

product

## Users

The raft-ui documentation app is used by Raft product engineers who are building and reviewing React interfaces. They need to understand stable and WIP component contracts, inspect relevant code paths, and verify realistic composed states before adopting a component.

## Product Purpose

The app documents raft-ui through canonical component examples, interactive demos, and inspectable code paths. Success means engineers can understand component behavior and composition without reconstructing product context from isolated primitives.

## Brand Personality

source-faithful / precise / adaptable

The documentation should feel like a trustworthy product-engineering tool: direct, dense enough for expert use, and visibly aligned with the interfaces the library ships.

## Anti-references

- Showcase pages that flatten realistic product states into decorative component galleries.
- Invented wrapper abstractions or mock states that drift from the source application.
- Decorative AI-flavored UI, marketing flourishes, or oversized gestures inside product examples.
- Documentation that promotes unfinished components beyond the WIP boundary.

## Design Principles

Show real composition. Examples should demonstrate components inside credible product structures and state combinations.

Preserve source meaning. Examples should retain the interaction and information hierarchy of the source application.

Keep one state model. Navigation, routes, panels, and fixtures should resolve from shared canonical records.

Prefer inspectable evidence. Canonical code paths and focused examples should make adoption decisions easy to verify.

## Accessibility & Inclusion

Examples and interactive demos should target WCAG AA. Controls need keyboard support, visible focus states, accessible names, disabled and loading semantics, and predictable screen-reader behavior. Motion should remain purposeful and respect reduced-motion preferences, while light and dark both preserve usable contrast across interactive and semantic states.
