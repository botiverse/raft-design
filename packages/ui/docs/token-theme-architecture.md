# Token / Theme Architecture Proposal

Status: WIP proposal. Do not treat this as implemented CSS yet.

## Goals

- Keep primitive colors, brand palettes, state semantics, and component usage separate.
- Avoid vague names like `surface` and awkward utilities like `border-border` or `text-text`.
- Use Tailwind utilities directly in components instead of growing global component aliases.
- Support both `brutal` and `elegant` themes without shadcn compatibility aliases.
- Use OKLCH values for all authored colors.
- Fully replace the current mixed shadow system with one Tailwind shadow scale.

## References

- Align UI style: semantic color roles are exposed through Tailwind `@theme inline`, while state colors use tone names such as `dark`, `base`, `light`, and `lighter` instead of numeric shades.
- Cloudflare Kumo style: structural tokens are layered and physical, with minimal component aliases. Border-like concepts are separated from component names, and regular components use Tailwind utilities directly.

## Token Layers

### Primitive Colors

Primitive colors are raw palettes. They are not component roles and do not imply behavior.

Each primitive palette should use Tailwind's shade scale:

- `50`
- `100`
- `200`
- `300`
- `400`
- `500`
- `600`
- `700`
- `800`
- `900`
- `950`

Required primitive palettes:

- `brutal-yellow-*`
- `brutal-purple-*`
- `brutal-pink-*`
- `brutal-cyan-*`
- `brutal-orange-*`
- `brutal-lime-*`
- `brutal-red-*`
- `brutal-stone-*`
- `brutal-cream-*`

Rules:

- Author every value as `oklch(...)`.
- Do not use hex values in final theme CSS.
- Do not use state names such as `success-500` for primitive palettes.
- Regenerate the palettes with OKLCH tooling before implementation.

### Brand Palettes

Brand palettes are full shade aliases over primitive palettes. They are not action or behavior tokens.

Mapping:

```css
--color-primary-50: var(--color-brutal-yellow-50);
--color-primary-100: var(--color-brutal-yellow-100);
--color-primary-200: var(--color-brutal-yellow-200);
--color-primary-300: var(--color-brutal-yellow-300);
--color-primary-400: var(--color-brutal-yellow-400);
--color-primary-500: var(--color-brutal-yellow-500);
--color-primary-600: var(--color-brutal-yellow-600);
--color-primary-700: var(--color-brutal-yellow-700);
--color-primary-800: var(--color-brutal-yellow-800);
--color-primary-900: var(--color-brutal-yellow-900);
--color-primary-950: var(--color-brutal-yellow-950);

--color-accent-50: var(--color-brutal-purple-50);
--color-accent-100: var(--color-brutal-purple-100);
--color-accent-200: var(--color-brutal-purple-200);
--color-accent-300: var(--color-brutal-purple-300);
--color-accent-400: var(--color-brutal-purple-400);
--color-accent-500: var(--color-brutal-purple-500);
--color-accent-600: var(--color-brutal-purple-600);
--color-accent-700: var(--color-brutal-purple-700);
--color-accent-800: var(--color-brutal-purple-800);
--color-accent-900: var(--color-brutal-purple-900);
--color-accent-950: var(--color-brutal-purple-950);

--color-secondary-50: var(--color-brutal-stone-50);
--color-secondary-100: var(--color-brutal-stone-100);
--color-secondary-200: var(--color-brutal-stone-200);
--color-secondary-300: var(--color-brutal-stone-300);
--color-secondary-400: var(--color-brutal-stone-400);
--color-secondary-500: var(--color-brutal-stone-500);
--color-secondary-600: var(--color-brutal-stone-600);
--color-secondary-700: var(--color-brutal-stone-700);
--color-secondary-800: var(--color-brutal-stone-800);
--color-secondary-900: var(--color-brutal-stone-900);
--color-secondary-950: var(--color-brutal-stone-950);
```

Usage:

- `primary-*`: current brutal main visual color, especially primary CTA and active emphasis.
- `accent-*`: purple brand accent, focus accents, selected highlights, and decorative emphasis.
- `secondary-*`: neutral supporting palette.

Do not add behavior names such as `brand-primary-hover` at this layer. Components choose shade changes directly, for example `bg-primary-400 hover:bg-primary-500`.

### Foreground Roles

Foreground roles describe text and icon color intensity.

```css
--foreground
--foreground-strong
--foreground-muted
--foreground-placeholder
--foreground-disabled
--foreground-inverse
```

Tailwind exposure:

```css
--color-foreground: var(--foreground);
--color-foreground-strong: var(--foreground-strong);
--color-foreground-muted: var(--foreground-muted);
--color-foreground-placeholder: var(--foreground-placeholder);
--color-foreground-disabled: var(--foreground-disabled);
--color-foreground-inverse: var(--foreground-inverse);
```

Usage:

- `text-foreground`: default body and component copy.
- `text-foreground-strong`: headings, active labels, high-emphasis menu items.
- `text-foreground-muted`: descriptions, meta text, shortcuts, helper copy.
- `placeholder:text-foreground-placeholder`: form placeholder text.
- `text-foreground-disabled`: disabled text and disabled icons.
- `text-foreground-inverse`: text on saturated or dark fills.

### Layer Roles

Layer roles describe background depth. The token is named `layer` instead of `bg` to avoid utilities like `bg-bg-page`.

```css
--layer-page
--layer-panel
--layer-muted
--layer-field
--layer-popover
--layer-backdrop
```

Tailwind exposure:

```css
--color-background: var(--layer-page);
--color-layer-page: var(--layer-page);
--color-layer-panel: var(--layer-panel);
--color-layer-muted: var(--layer-muted);
--color-layer-field: var(--layer-field);
--color-layer-popover: var(--layer-popover);
--color-layer-backdrop: var(--layer-backdrop);
```

Usage:

- `bg-layer-page`: document body, app shell, docs preview background.
- `bg-layer-panel`: cards, panels, list containers, section blocks.
- `bg-layer-muted`: hover backgrounds, weak highlights, disabled backgrounds, skeletons, code, kbd.
- `bg-layer-field`: inputs, textareas, select triggers, unchecked form controls.
- `bg-layer-popover`: dropdowns, context menus, command menus, popovers, tooltips, dialogs, sheets.
- `bg-layer-backdrop`: modal, sheet, drawer, and lightbox backdrops.

### Line Roles

Line roles replace border color roles to avoid `border-border` utilities.

```css
--line-strong
--line
--line-subtle
--line-muted
--line-focus
```

Tailwind exposure:

```css
--color-line-strong: var(--line-strong);
--color-line: var(--line);
--color-line-subtle: var(--line-subtle);
--color-line-muted: var(--line-muted);
--color-line-focus: var(--line-focus);
```

Usage:

- `border-line-strong`: brutal black outlines, selected high-contrast outlines, strong separators.
- `border-line`: default component border.
- `border-line-subtle`: card, input, and panel borders that should not dominate.
- `divide-line-muted`: list dividers and table-like separators.
- `ring-line-focus`: keyboard focus ring and focus-visible emphasis.
- `stroke-line`: SVG strokes when the SVG should match the UI line color.

Do not name the token `stroke`; in Tailwind and CSS that primarily reads as SVG stroke, while the main use here is component borders.

### State Roles

State roles use Align UI style tone names, not Tailwind numeric shades.

```css
--state-info-dark
--state-info-base
--state-info-light
--state-info-lighter

--state-success-dark
--state-success-base
--state-success-light
--state-success-lighter

--state-warning-dark
--state-warning-base
--state-warning-light
--state-warning-lighter

--state-danger-dark
--state-danger-base
--state-danger-light
--state-danger-lighter
```

Tailwind exposure:

```css
--color-info-dark: var(--state-info-dark);
--color-info-base: var(--state-info-base);
--color-info-light: var(--state-info-light);
--color-info-lighter: var(--state-info-lighter);

--color-success-dark: var(--state-success-dark);
--color-success-base: var(--state-success-base);
--color-success-light: var(--state-success-light);
--color-success-lighter: var(--state-success-lighter);

--color-warning-dark: var(--state-warning-dark);
--color-warning-base: var(--state-warning-base);
--color-warning-light: var(--state-warning-light);
--color-warning-lighter: var(--state-warning-lighter);

--color-danger-dark: var(--state-danger-dark);
--color-danger-base: var(--state-danger-base);
--color-danger-light: var(--state-danger-light);
--color-danger-lighter: var(--state-danger-lighter);
```

Usage:

- `bg-info-lighter text-info-dark border-info-light`
- `bg-success-lighter text-success-dark border-success-light`
- `bg-warning-lighter text-warning-dark border-warning-light`
- `bg-danger-base text-foreground-inverse border-danger-dark`

Rules:

- Use `danger`, not `destructive`.
- Do not expose `success-500` or `danger-600`; state is semantic, not a palette.
- Do not use state colors as brand colors.

### Shadows

The theme should fully replace Tailwind's default shadow scale.

```css
@theme {
  --shadow-*: initial;
}

@theme inline {
  --shadow-2xs: var(--theme-shadow-2xs);
  --shadow-xs: var(--theme-shadow-xs);
  --shadow-sm: var(--theme-shadow-sm);
  --shadow-md: var(--theme-shadow-md);
  --shadow-lg: var(--theme-shadow-lg);
  --shadow-xl: var(--theme-shadow-xl);
  --shadow-2xl: var(--theme-shadow-2xl);
}
```

Use an internal `--theme-shadow-*` bridge to avoid self-referential variables.

Scale usage:

- `shadow-2xs`: pressed, active, tiny chips.
- `shadow-xs`: very subtle small surfaces.
- `shadow-sm`: default resting component shadow.
- `shadow-md`: hover, lifted card, selected card.
- `shadow-lg`: dropdown, popover, floating panel.
- `shadow-xl`: dialog, bottom sheet, notification popup.
- `shadow-2xl`: lightbox and large overlay media.

Migration target:

- Remove `shadow-brutal-*`.
- Remove `shadow-[var(--shadow)]`, `shadow-[var(--shadow-hover)]`, `shadow-[var(--shadow-active)]`, and `shadow-[var(--shadow-lg)]`.
- Remove `surface-shadow-*`.
- Remove global component shadow aliases like `dropdown-shadow` and `tabs-chip-active-shadow`.

### Radius

Do not add theme radius tokens.

Use Tailwind directly:

- `rounded-none`
- `rounded-sm`
- `rounded-md`
- `rounded-lg`
- `rounded-xl`

Theme-specific shape belongs in component variants, for example brutal variants can use `rounded-none` while elegant variants use `rounded-md`.

### Component Aliases

The target architecture should not keep global component aliases such as:

- `--input-background`
- `--dropdown-shadow`
- `--tabs-chip-active-shadow`
- `--list-item-border`
- `--badge-primary`
- `--checkbox-checked-primary`
- `--button-outline-hover-border`

Components should use semantic utilities directly:

```tsx
"bg-layer-field text-foreground placeholder:text-foreground-placeholder";
"border border-line-subtle focus-visible:border-line-focus focus-visible:ring-line-focus";
"bg-layer-popover text-foreground border border-line shadow-lg";
"bg-primary-400 text-primary-950 hover:bg-primary-500 active:shadow-2xs";
"bg-info-lighter text-info-dark border border-info-light";
```

Component-local CSS variables are allowed only for special mechanics or third-party integration where Tailwind utilities cannot express the relationship cleanly.

## Final Theme Shape

```css
@theme {
  --shadow-*: initial;
}

@theme inline {
  --color-background: var(--layer-page);

  --color-foreground: var(--foreground);
  --color-foreground-strong: var(--foreground-strong);
  --color-foreground-muted: var(--foreground-muted);
  --color-foreground-placeholder: var(--foreground-placeholder);
  --color-foreground-disabled: var(--foreground-disabled);
  --color-foreground-inverse: var(--foreground-inverse);

  --color-layer-page: var(--layer-page);
  --color-layer-panel: var(--layer-panel);
  --color-layer-muted: var(--layer-muted);
  --color-layer-field: var(--layer-field);
  --color-layer-popover: var(--layer-popover);
  --color-layer-backdrop: var(--layer-backdrop);

  --color-line-strong: var(--line-strong);
  --color-line: var(--line);
  --color-line-subtle: var(--line-subtle);
  --color-line-muted: var(--line-muted);
  --color-line-focus: var(--line-focus);

  --color-info-dark: var(--state-info-dark);
  --color-info-base: var(--state-info-base);
  --color-info-light: var(--state-info-light);
  --color-info-lighter: var(--state-info-lighter);

  --color-success-dark: var(--state-success-dark);
  --color-success-base: var(--state-success-base);
  --color-success-light: var(--state-success-light);
  --color-success-lighter: var(--state-success-lighter);

  --color-warning-dark: var(--state-warning-dark);
  --color-warning-base: var(--state-warning-base);
  --color-warning-light: var(--state-warning-light);
  --color-warning-lighter: var(--state-warning-lighter);

  --color-danger-dark: var(--state-danger-dark);
  --color-danger-base: var(--state-danger-base);
  --color-danger-light: var(--state-danger-light);
  --color-danger-lighter: var(--state-danger-lighter);

  --shadow-2xs: var(--theme-shadow-2xs);
  --shadow-xs: var(--theme-shadow-xs);
  --shadow-sm: var(--theme-shadow-sm);
  --shadow-md: var(--theme-shadow-md);
  --shadow-lg: var(--theme-shadow-lg);
  --shadow-xl: var(--theme-shadow-xl);
  --shadow-2xl: var(--theme-shadow-2xl);
}
```

## Component Migration Plan

Migration should happen in layers first, then component by component. The goal is to avoid compatibility aliases becoming permanent.

### Phase 1: Token Foundation

Files:

- `packages/ui/src/styles.css`
- `packages/ui/src/themes/brutal.css`
- `packages/ui/src/themes/elegant.css`

Tasks:

- Add OKLCH primitive palettes and brand palette aliases.
- Add `foreground-*`, `layer-*`, `line-*`, and `state-*` tokens.
- Replace `destructive` with `danger` in the new token API.
- Replace shadow tokens with `--theme-shadow-*` and Tailwind `shadow-*` exposure.
- Do not add new component aliases.
- Keep old aliases only temporarily if needed to keep the package compiling during migration; remove them before the token migration is considered done.

Validation:

- Search for accidental hex colors in theme files.
- Search for accidental `surface-*`, `action-*`, `destructive-*`, and `border-border` in new code.
- Confirm `shadow-*` utilities are generated from the new theme scale.

### Phase 2: Forms and Field Primitives

Components:

- `input`
- `textarea`
- `input-group`
- `field`
- `checkbox`

Migration focus:

- Replace field backgrounds with `bg-layer-field`.
- Replace labels and help text with `foreground-*` roles.
- Replace placeholder color with `foreground-placeholder`.
- Replace disabled states with `layer-muted` and `foreground-disabled`.
- Replace borders with `line-subtle`, `line`, or `line-focus`.
- Replace checkbox checked color with `primary-*` or `accent-*` shades, not `checkbox-*` aliases.

Example targets:

```tsx
"bg-layer-field text-foreground placeholder:text-foreground-placeholder";
"border border-line-subtle focus-visible:border-line-focus focus-visible:ring-line-focus";
"disabled:bg-layer-muted disabled:text-foreground-disabled";
```

Validation:

- Verify default, hover, focus-visible, invalid, disabled, and required/optional states.
- Verify keyboard focus ring is visible in brutal and elegant themes.
- Verify placeholder is visually weaker than muted helper text.

### Phase 3: Action Components

Components:

- `button`
- `toggle-group`
- `tabs`
- `badge`

Migration focus:

- Replace `action-*`, `button-*`, `badge-*`, `tabs-*`, and `checkbox-*` aliases.
- Use `primary-*` for the main brutal yellow visual.
- Use `accent-*` for purple emphasis and selected/focus accents where appropriate.
- Use `state-*` only for `info`, `success`, `warning`, and `danger` variants.
- Use `line-*` for outlines and active separators.
- Use the unified `shadow-*` scale for pressed, default, hover, and floating states.

Example targets:

```tsx
"bg-primary-400 text-primary-950 border border-line-strong shadow-sm";
"hover:bg-primary-500 hover:shadow-md active:shadow-2xs";
"bg-danger-base text-foreground-inverse border border-danger-dark";
"bg-info-lighter text-info-dark border border-info-light";
```

Validation:

- Verify every variant and size.
- Verify loading, disabled, pressed, selected, and icon-only states.
- Verify danger actions are clearly distinct from brand actions.
- Verify brutal theme keeps strong outlines and offset-like shadow behavior where intended.

### Phase 4: Floating and Overlay Components

Components:

- `dropdown-menu`
- `context-menu`
- `popover`
- `bottom-sheet`
- `notification-center`
- `lightbox`

Migration focus:

- Replace floating backgrounds with `bg-layer-popover`.
- Replace overlays with `bg-layer-backdrop`.
- Replace floating borders with `border-line` or `border-line-subtle`.
- Replace global shadow aliases with `shadow-lg`, `shadow-xl`, or `shadow-2xl`.
- Replace item hover backgrounds with `bg-layer-muted`.
- Replace shortcuts and metadata with `foreground-muted`.

Example targets:

```tsx
"bg-layer-popover text-foreground border border-line shadow-lg";
"data-[highlighted]:bg-layer-muted data-[highlighted]:text-foreground-strong";
"data-[disabled]:text-foreground-disabled";
```

Validation:

- Verify open/close, keyboard navigation, highlighted item, disabled item, submenu, and collision behavior.
- Verify shadows feel distinct between dropdown/popover, dialog/sheet, and lightbox.
- Verify dark mode in elegant theme if the component is theme-sensitive.

### Phase 5: Content and List Surfaces

Components:

- `banner`
- `list-item`
- `media-list-item`
- `conversation-preview-card`
- `preview-shell`

Migration focus:

- Replace `surface-*` with `layer-*` and `line-*`.
- Replace selected/highlighted backgrounds with `state-*` or `layer-muted` depending on semantics.
- Replace card/list shadows with `shadow-sm`, `shadow-md`, or `shadow-lg`.
- Replace destructive naming with danger variants.

Example targets:

```tsx
"bg-layer-panel text-foreground border border-line-subtle shadow-sm";
"data-[highlighted=true]:bg-info-lighter data-[highlighted=true]:border-info-light";
"data-[selected=true]:border-accent-500 data-[selected=true]:shadow-md";
```

Validation:

- Verify normal, hover, selected, highlighted, disabled, unread, and empty-content states.
- Verify long text truncation and media fallback still work.
- Verify state banners use `info/success/warning/danger` consistently.

### Phase 6: Cleanup

Tasks:

- Remove temporary compatibility aliases from theme files.
- Remove unused old theme tokens:
  - `surface-*`
  - `action-*`
  - `information-*`
  - `destructive-*`
  - component aliases such as `input-*`, `dropdown-*`, `tabs-*`, `badge-*`, `checkbox-*`, `button-*`, and `list-item-*`
- Remove old arbitrary shadow references.
- Update docs examples to use new tokens.

Validation searches:

```sh
rg -n "surface-|action-|information-|destructive-|muted-foreground|neutral-|border-border|shadow-brutal|surface-shadow|dropdown-shadow|tabs-chip-active-shadow" packages/ui/src
rg -n "#[0-9a-fA-F]{3,8}" packages/ui/src/styles.css packages/ui/src/themes
rg -n "shadow-\[var\(--|\[box-shadow:var\(--" packages/ui/src
```

## Verification Plan

### Static Checks

Run after each migrated component group:

```sh
vp check
```

Run when behavior or variants are touched:

```sh
vp test
```

If Vite+ behavior looks wrong:

```sh
vp env doctor
```

### Visual Checks

Use the docs app for visual verification after each phase.

Minimum checks per component:

- brutal theme default state.
- elegant theme default state.
- elegant dark mode if supported by the docs surface.
- hover state.
- focus-visible state.
- selected or checked state.
- disabled state.
- long text or dense content where relevant.

### Token Regression Checks

Before considering the migration complete:

- No new `surface-*` usage.
- No new `action-*` usage.
- No `destructive-*` usage.
- No global component aliases needed for normal styling.
- No `border-border` utilities.
- No arbitrary shadow CSS variables for normal shadows.
- No hex colors in theme files.
- Primitive colors are complete `50~950` shade scales.
- `primary`, `accent`, and `secondary` are complete brand palette aliases.

### Acceptance Criteria

The migration is complete when:

- Components use `foreground-*`, `layer-*`, `line-*`, `state-*`, brand shade palettes, and the unified `shadow-*` scale directly.
- `brutal` and `elegant` themes define the same token contract.
- Old aliases are removed rather than left as a hidden second API.
- `vp check` passes.
- `vp test` passes, or any failures are confirmed unrelated and documented.
- The docs app visually confirms migrated components in relevant themes and states.
