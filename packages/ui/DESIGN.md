---
name: raft-ui
description: Dual-theme React components for Raft product interfaces.
colors:
  source-yellow: "oklch(0.883 0.162 91.89)"
  source-pink: "oklch(0.749 0.162 0.71)"
  signal-cyan: "oklch(0.783 0.135 219.2)"
  signal-red: "oklch(0.711 0.168 28.04)"
  signal-lime: "oklch(0.827 0.135 130.07)"
  slock-stone: "oklch(0.789 0.014 71.29)"
  brutal-ink: "oklch(0.18 0.006 25)"
  brutal-paper: "oklch(1 0 0)"
  brutal-veil: "oklch(0 0 0 / 0.65)"
  elegant-ink: "oklch(0.145 0 0)"
  elegant-ink-strong: "oklch(0.21 0.006 285)"
  elegant-muted: "oklch(0.967 0.001 286)"
  elegant-line: "oklch(0.84 0.006 285)"
  elegant-line-subtle: "oklch(0.92 0.004 286)"
  elegant-veil: "oklch(0 0 0 / 0.15)"
  success: "oklch(0.714 0.176 153.079)"
  warning: "oklch(0.7 0.202 44.441)"
  danger: "oklch(0.616 0.249 26.758)"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "normal"
  headline:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "normal"
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.43
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: "normal"
  label:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  none: "0px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  control-xs-x: "8px"
  control-sm-x: "10px"
  control-md-x: "12px"
  control-lg-x: "14px"
  field-y: "8px"
  panel-x: "24px"
  panel-y: "20px"
components:
  button-brutal-primary:
    backgroundColor: "{colors.source-yellow}"
    textColor: "{colors.elegant-ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "32px"
  button-elegant-primary:
    backgroundColor: "{colors.source-yellow}"
    textColor: "{colors.elegant-ink}"
    rounded: "{rounded.md}"
    padding: "6.75px 12px"
  button-elegant-default:
    backgroundColor: "{colors.elegant-ink-strong}"
    textColor: "{colors.brutal-paper}"
    rounded: "{rounded.md}"
    padding: "6.75px 12px"
  input-brutal:
    backgroundColor: "{colors.brutal-paper}"
    textColor: "{colors.brutal-ink}"
    rounded: "{rounded.none}"
    padding: "8px 12px"
  input-elegant:
    backgroundColor: "{colors.brutal-paper}"
    textColor: "{colors.elegant-ink-strong}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  badge-elegant:
    backgroundColor: "{colors.elegant-muted}"
    textColor: "{colors.elegant-ink-strong}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
---

# Design System: raft-ui

## 1. Overview

**Creative North Star: "Source-to-System Bridge"**

raft-ui turns an existing product language into a reusable component system without flattening its history. Brutal is the source-faithful register: square, high-contrast, tactile, and visibly descended from slock. Elegant is the product-grade register: quieter, more refined, and designed to shape future Raft APIs without abandoning the same semantic components.

Every component must support both themes through composition, slots, and tokenized recipes. The same Button, Dialog, Field, Badge, Separator, and overlay primitives should survive a theme switch without caller-side rewrites. The API belongs to Elegant's cleaner future, but the visual evidence of Brutal must remain first-class.

This system rejects public APIs shaped around one-off slock implementation details, local style overrides that should be theme tokens, monolithic components that block slot-level composition, decorative AI-flavored UI, marketing-page flourishes, oversized visual gestures, and expanding the main export surface before a component is ready.

**Key Characteristics:**

- Dual-register, not dual-library.
- Composition-first component structure.
- Theme tokens over local styling.
- Brutal preserves source meaning.
- Elegant shapes public API direction.
- Dense, product-grade controls over decorative spectacle.

## 2. Colors

The palette is a controlled collision between slock's saturated source colors and Elegant's cool, precise neutral system.

### Primary

- **Source Yellow:** The shared primary action color. In Brutal it reads as a hard block of inherited identity; in Elegant it becomes the one warm accent on otherwise controlled surfaces.
- **Elegant Ink:** The default Elegant text and filled-button anchor. It should feel exact, not heavy.

### Secondary

- **Source Pink:** The accent role for attention, badges, and secondary emphasis. Use it sparingly so it stays recognizably intentional.
- **Slock Stone:** The muted Brutal support color for compact status and neutral affordances.

### Tertiary

- **Signal Cyan:** Information and system-notice color. It carries a readable product signal without becoming the whole interface.
- **Signal Lime, Warning, Danger:** Semantic feedback colors. They are for state communication, not decoration.

### Neutral

- **Brutal Paper and Brutal Ink:** Pure white panels against dense ink borders. This is the Brutal baseline.
- **Elegant Muted, Elegant Line, Elegant Line Subtle:** Quiet separators, fields, and low-emphasis surfaces in Elegant.
- **Brutal Veil and Elegant Veil:** Overlay backdrops. Brutal blocks the room; Elegant dims it.

### Named Rules

**The Dual-Register Rule.** A color token must mean the same semantic thing in both themes even when its visual treatment changes.

**The Yellow Rarity Rule.** Source Yellow is the primary action and brand signal. Do not use it as page wash, large decoration, or background atmosphere.

**The State-Is-Meaning Rule.** Cyan, lime, warning, and danger are reserved for information, success, warning, and destructive states. Never use them just to make a surface louder.

## 3. Typography

**Display Font:** Inter (with system-ui fallback)  
**Body Font:** Geist (with system-ui fallback)  
**Brutal Heading Font:** Hanken Grotesk (with system-ui fallback)  
**Label/Mono Font:** Geist Mono (with ui-monospace fallback)

**Character:** Brutal typography is compact, assertive, and often bold. Elegant typography is smaller, calmer, and more interface-native. The system should feel engineered for repeated product use, not editorial layout.

### Hierarchy

- **Display** (600, 18px, 1.1): Rare in library surfaces; use for component-demo headings or larger product titles only.
- **Headline** (700, 18px, 1): Brutal dialog titles and strong labels. Uppercase is allowed only where source parity requires it.
- **Title** (500, 14px, 1.43): Elegant dialog titles, panel headings, and compact section headers.
- **Body** (400, 14px, 1.43): Descriptions, field help, and general interface copy.
- **Label** (500, 12px, 1): Separators, compact metadata, and code-like UI affordances.

### Named Rules

**The Interface Type Rule.** Type exists to make controls scannable. Do not introduce display-scale typography inside compact panels, cards, dialogs, or tool surfaces.

**The Register Integrity Rule.** Brutal may be bold and square; Elegant must be restrained and antialiased. Do not mix Brutal uppercase force into Elegant unless the component explicitly models a legacy semantic.

## 4. Elevation

raft-ui uses a hybrid elevation system. Brutal depth is structural: hard offset shadows that act like physical displacement. Elegant depth is tonal and ambient: inset hairlines, soft layered shadows, and low-opacity backdrops. Flat surfaces are valid until interaction, overlay, or state demands separation.

### Shadow Vocabulary

- **Brutal Pressed** (`1px 1px 0px var(--line-strong)`): Active controls and compressed tactile states.
- **Brutal Resting** (`2px 2px 0px var(--line-strong)`): Default Brutal buttons and fields.
- **Brutal Hover** (`4px 4px 0px var(--line-strong)`): Raised hover/focus response.
- **Brutal Modal** (`6px 6px 0px var(--line-strong)`): Dialogs and high-priority overlays.
- **Elegant Resting:** A thin inset highlight plus subtle outline. Use for default controls.
- **Elegant Overlay:** A soft multi-stop shadow plus subtle border ring. Use for dialogs, popovers, and floating panels.

### Named Rules

**The Structural-vs-Ambient Rule.** Brutal shadows move like blocks; Elegant shadows breathe like layers. Never give Brutal a soft blur or Elegant a comic-book offset.

**The State Pays for Depth Rule.** Extra depth must correspond to hover, focus, active, popover, modal, or dragged state. Static decoration is forbidden.

## 5. Components

### Buttons

- **Shape:** Brutal buttons are square and bordered (0px radius, 2px stroke). Elegant buttons are compact and gently curved (4-6px radius).
- **Primary:** Brutal primary is Source Yellow with black text and hard shadow. Elegant primary keeps Source Yellow but uses inset highlight, a subtle outline, and compressed vertical padding.
- **Hover / Focus:** Brutal lifts by -1px and increases hard shadow; active states press down and right. Elegant changes tone, uses a precise focus outline variable, and may scale to 0.985 on active press.
- **Secondary / Ghost / Link:** Secondary and ghost variants must remain semantically quiet. Ghost should not inherit a border unless the state demands it.

### Badges

- **Style:** Brutal badges are compact rectangular labels with strong borders. Elegant badges are full pills with softer typography and transparent borders.
- **State:** Solid, soft, and outline appearances must preserve semantic color roles. Experimental status uses the fixed success + uppercase preset.

### Dialogs / Overlays

- **Shape:** Brutal dialogs are bordered blocks with hard modal shadow. Elegant dialogs are rounded 8px panels with clipped content, segmented header/body/footer, and a soft overlay.
- **Backdrop:** Brutal uses a heavy dark veil; Elegant uses a lighter veil with subtle blur.
- **Composition:** Header, Body, Footer, Title, Description, Overlay, Content, Trigger, and Close are separate parts. Do not collapse them into a single monolith.

### Inputs / Fields

- **Style:** Brutal inputs are white rectangular fields with 2px borders and hard resting shadows. Elegant inputs are 6px-radius fields with a hairline border and restrained hover shadow.
- **Focus:** Brutal focus increases hard shadow. Elegant focus uses border/ring refinement without loud glow.
- **Error / Disabled:** Invalid states are driven by `aria-invalid`. Disabled states must mute foreground, placeholder, border, and hover shadow together.

### Separators

- **Style:** Brutal separators are black 2px rules. Elegant separators are 1px muted lines.
- **Labeled separators:** Use mono 12px labels. The label is metadata, not a heading.

### Text and Micro-Primitives

- **Style:** Text, labels, kbd, inline code, status, spinner, and copyable code should inherit the active theme family through tokens.
- **Boundary:** Utility primitives must stay visually narrow. Do not promote source-specific surfaces into the main export surface before their contracts are stable.

## 6. Do's and Don'ts

### Do:

- **Do** build every component as composed parts and slots so callers can assemble real product structures without forking internals.
- **Do** route colors, borders, shadows, typography, disabled states, and feedback states through theme tokens whenever possible.
- **Do** design public APIs for Elegant's cleaner product direction while keeping Brutal faithful to slock semantics.
- **Do** preserve visible focus states, keyboard behavior, accessible names, loading/disabled semantics, and `aria-invalid`-driven error styling.
- **Do** keep unfinished or source-specific surfaces behind `raft-ui/wip` until their contracts are ready.

### Don't:

- **Don't** shape public APIs around one-off slock implementation details instead of reusable component semantics.
- **Don't** make components that only work well in Elegant and leave Brutal as an afterthought.
- **Don't** only preserve Brutal screenshots while breaking the newer Elegant direction.
- **Don't** replace theme tokens with local style overrides when a tokenized solution is possible.
- **Don't** build monolithic components that block slot-level composition.
- **Don't** use decorative AI-flavored UI, marketing-page flourishes, or oversized visual gestures in product controls.
- **Don't** expand the main export surface before a component is ready; unfinished work belongs behind `raft-ui/wip`.
