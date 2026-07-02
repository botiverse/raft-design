# Product

## Register

product

## Users

raft-ui is used by Raft product engineers building reusable React interfaces for Raft products. The direct users are engineers, but the components ship into user-facing product surfaces, so the library must optimize for both implementation clarity and polished end-user interaction.

## Product Purpose

raft-ui is the component library for Raft. It provides Base UI-powered, Tailwind v4-styled React components that can support two theme families across the same component structure:

- Brutal preserves and migrates the existing slock visual language and semantics as faithfully as possible.
- Elegant is the newer Raft product style and should guide API shape, composition boundaries, and future extensibility.

Success means product engineers can compose consistent, accessible UI without leaking source-app implementation details into public APIs, while both Brutal and Elegant remain first-class supported themes.

## Brand Personality

source-faithful / precise / adaptable

Brutal should feel recognizably tied to slock. Elegant should feel controlled, product-grade, and refined rather than decorative. The shared library should feel deliberate: stable component contracts, explicit composition slots, and theme behavior that can scale across product surfaces.

## Anti-references

- Public APIs shaped around one-off slock implementation details instead of reusable component semantics.
- Components that only work well in Elegant and leave Brutal as an afterthought.
- Components that only preserve Brutal screenshots but cannot support the newer Elegant direction.
- Local style overrides replacing theme tokens when a tokenized solution is possible.
- Monolithic components that block slot-level composition.
- Decorative AI-flavored UI, marketing-page flourishes, or oversized visual gestures in product controls.
- Expanding the main export surface before a component is ready; unfinished work should remain behind the WIP boundary.

## Design Principles

Composition first. Components should expose clear compound parts and slots so callers can build real product structures without forking internal implementation.

Theme tokens over local styling. Shared colors, spacing, shadows, typography, borders, and state values should flow through theme tokens whenever possible.

Elegant shapes the API. Component APIs should be designed for the newer Elegant product style first, while retaining enough structure and theme coverage to faithfully support Brutal.

Brutal preserves source meaning. Brutal theme work should migrate slock semantics and important visual cues rather than merely approximating the surface.

Keep public semantics narrow. Promote stable, reusable primitives; keep unfinished or source-specific surfaces behind `raft-ui/wip` until their contracts are ready.

## Accessibility & Inclusion

Components should target WCAG AA by default. Interactive components need keyboard support, visible focus states, accessible names, disabled and loading semantics, and predictable screen reader behavior. Motion should be purposeful, brief, and respect reduced-motion preferences. Theme variants must preserve usable contrast across default, hover, active, selected, disabled, error, warning, success, and information states.
