---
title: Accessibility
summary: The rules every Raft product follows so it works with any vision, keyboard, screen reader, touch screen or motion setting — contrast, focus, hit targets, motion, semantics, touch and language — and the components that implement them.
---

# Accessibility

Raft is a workspace people keep open all day, next to agents that never stop working. It has to stay readable on every surface, usable with the keyboard alone, clear to a screen reader, comfortable on a touch screen and still for people who turn motion off. This page gathers the rules that apply to every component. Each component doc's "Accessibility" section adds only what that component provides or needs from you ([Writing guide](../authoring/writing.md#accessibility)).

## Principles

- **Meaning never depends on one sense.** A color, an icon, a pixel or a movement always comes with a word, either on screen or in the accessible name. A status chip has a pixel and a word; a banner's icon repeats what its text says.
- **Every action has a keyboard path and a touch path.** Hover, right-click, press and hold, and drag are shortcuts, never the only way.
- **Use the platform's behavior.** raft-ui builds on native elements and [Base UI](https://base-ui.com) primitives, which provide roles, focus handling and keys. raft-ui adds the look and the default names. The product adds names that only it knows.
- **The guarantees hold with no exceptions to remember.** Contrast, the focus ring and hit targets are set by tokens and recipes, so a component that uses them is correct by default.

## Contrast

The token values are chosen so that text never has to be checked again surface by surface; see [Color](./color.md#contrast).

- Text in `foreground`, `foreground-muted` and `foreground-hint` is at least 4.5:1 on every surface, every soft tint and every popup, in light and dark mode. Tertiary text carries times, IDs and counts people need to read, so it gets the same guarantee as body text ([Color](./color.md#contrast)).
- Error text and the border of an invalid input use `danger-strong`, which is at least 4.5:1 on paper. The brighter `danger` is only for the delete button, where the text is ink ([Color](./color.md#contrast)).
- Ink on a sticker (`sticker-ink`) is at least 6.8:1 in both modes. Stickers never carry white type, because white on yellow, lime or cyan fails.
- Controls have a 1.5px ink border (`line-strong`; `line-field` around a field), so the edge of every control is clear on any surface. In light mode `line-seam` is 3.0:1 on white and 2.8:1 on yellow; it separates regions and never marks a control.
- Use the three text tiers, never an alpha variant of them (`text-foreground-muted/70`): the guarantee holds only for the tier tokens.
- `foreground-disabled` is below 4.5:1 on purpose, as allowed for inactive controls. Never use it for text people need to read. When people need to know why an action is unavailable, keep the button focusable with `focusableWhenDisabled` and explain in a [Tooltip](../../packages/ui/src/components/tooltip/tooltip.md) ([Button](../../packages/ui/src/components/button/button.md#accessibility)).
- When you change a text, surface or tint token in `tokens.json`, recheck these ratios for both modes. No automated test checks them yet.

## Focus and keyboard

People who use the keyboard must always see where they are and reach everything a pointer can.

- Give every element that can be reached with the keyboard the `focus-ring` (`shadow-focus`) on `:focus-visible`: a 2px gap in the surface color, then 2px of ink. It is ink, not yellow, so it shows on the yellow frame and on yellow stickers ([Elevation](./elevation.md#focus-ring)).
- Show the ring only after keyboard navigation, never after a click, a tap or typing ([States](./states.md#focus)). Keyboard users see it every time they move, and it shows whenever the input isn't a pointer raft-ui can see (before any input, a screen reader's browse cursor or synthesized press), so [WCAG 2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html) holds; people using a pointer aren't shown a ring that tells them what they just clicked.
- Ring the whole group of a compound control (the composer, an input with an addon) when something inside it has keyboard focus, and the box of a checkbox or radio ([States](./states.md#focus)).
- Make a composite control one Tab stop and move inside it with the arrow keys: [RadioGroup](../../packages/ui/src/components/radio-group/radio-group.md), [SegmentedControl](../../packages/ui/src/components/segmented-control/segmented-control.md), [Tabs](../../packages/ui/src/components/tabs/tabs.md), [ToggleGroup](../../packages/ui/src/components/toggle-group/toggle-group.md) and menus. Base UI provides the keys.
- Trap focus in a modal overlay, close it with Esc, and return focus to its trigger: [Dialog](../../packages/ui/src/components/dialog/dialog.md) and [Drawer](../../packages/ui/src/components/drawer/drawer.md) do this.
- Show on keyboard focus whatever shows on hover: the message toolbar ([MessageItem](../../packages/ui/src/components/message-item/message-item.md)), tooltips, preview cards ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)), the overlay of an editable avatar ([Avatar](../../packages/ui/src/components/avatar/avatar.md#accessibility)).
- Offer every action of a context menu from a visible control as well, such as a ⋯ button: right-click and press and hold can't be done from the keyboard ([ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)).
- Give drag and drop a keyboard path. Task cards are picked up with Space, moved with the arrow keys, dropped with Space and put back with Escape ([TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md), [TaskBoard](../../packages/ui/src/components/task-board/task-board.md)). Sortable tabs have no keyboard reordering yet ([Tabs](../../packages/ui/src/components/tabs/tabs.md#accessibility)).
- Render a row whose only interactive parts are its controls as a `<div>`, so Tab goes to the controls and not to a row that does nothing ([States](./states.md#usage)).
- Show a shortcut with [Kbd](../../packages/ui/src/components/kbd/kbd.md) in the tooltip or menu item of the action. When a shortcut is spelled with symbols (⌘K), give it an `aria-label` in words: Command K.

## Hit targets

Fingers are less precise than a pointer, and a target people miss feels broken.

- Make every touch target at least 44px in both directions ([Spacing](./spacing.md#hit-targets)).
- Reach 44px with the hit area, not the drawing. A 32px [Button](../../packages/ui/src/components/button/button.md) and a 20px [Checkbox](../../packages/ui/src/components/checkbox/checkbox.md) extend a transparent `::after` to 44px, so the layout stays compact and the target stays large.
- Don't extend inline links and reference chips in running text: they follow the line of text.
- Desktop controls used only with a pointer may be smaller: sidebar rows 36px, rail items 40px, the hover toolbar 36px with 28px buttons, and on a desktop (from 768px with a mouse or trackpad) a default control, such as a field, 32px. A touch screen keeps 44px at any width ([Spacing](./spacing.md#heights)), except for the rows of a popup list, which are 36px everywhere ([Spacing](./spacing.md#hit-targets)).
- [ToggleGroup](../../packages/ui/src/components/toggle-group/toggle-group.md) items are 32px and don't extend their hit area. Don't use a toggle group on a touch screen until they do.

## Motion

Raft is watched for hours, and motion can make people dizzy or distract them from what they read. Motion confirms an action or shows where something came from, and nothing depends on seeing it ([Motion](./motion.md)).

- Turn every animation and transition off under `prefers-reduced-motion: reduce`. Components use Tailwind's `motion-reduce:` variant or a `@media (prefers-reduced-motion: reduce)` block; a new animation adds one in the same change.
- With reduced motion, the [Spinner](../../packages/ui/src/components/spinner/spinner.md) stops and keeps its first pixel lit, and the [Skeleton](../../packages/ui/src/components/skeleton/skeleton.md) stops pulsing. Both still say that something is loading.
- Never loop a status. A working agent is a still yellow light, not a pulse.
- Show centered overlays without animation, so nothing slides in for people who didn't ask for it ([Motion](./motion.md#usage)).

## Screen readers

A screen reader announces what the markup says, not what the screen shows. Every control needs a role, a name and a state, and every change people must notice needs to be announced.

### Roles and names

- Use the native element or the Base UI primitive for a role. Don't add an ARIA widget role without the focus, keyboard and close behavior it promises.
- Give every icon-only button an `aria-label` in Title Case, the same words as its tooltip: Add Reaction ([Button](../../packages/ui/src/components/button/button.md#accessibility)).
- Start the accessible name of a control that has visible text with that text. People who use voice control say what they see.
- Give every dialog, drawer and bottom sheet a title; it is what is announced when it opens ([Dialog](../../packages/ui/src/components/dialog/dialog.md#accessibility)).
- Hide decoration from assistive technology (`aria-hidden`) when the words are next to it: a status pixel beside its word, a banner's icon, a toast's icon and progress bar ([Status](../../packages/ui/src/components/status/status.md)).
- Name what stands alone without words: a presence light gets `role="img"` and its state ("Online"); an attention dot says what waits; an avatar stack says the full count ("5 agents working"), since it shows only "+3" ([Avatar](../../packages/ui/src/components/avatar/avatar.md#accessibility)).
- Include the unread state in the name of a trigger that shows a count or a dot: "Notifications, 2 unread" ([NotificationCenter](../../packages/ui/src/components/notification-center/notification-center.md)).
- Mark a region that is loading with `aria-busy="true"`; skeletons are hidden ([Skeleton](../../packages/ui/src/components/skeleton/skeleton.md)).

### Live regions

Announce a change only as urgently as it deserves. A destructive problem interrupts; everything else waits until the screen reader is idle.

| What changes | How it is announced | Component |
| --- | --- | --- |
| A banner with `status="destructive"` | `role="alert"`, interrupts | [Banner](../../packages/ui/src/components/banner/banner.md) |
| Any other banner | `role="status"`, polite | [Banner](../../packages/ui/src/components/banner/banner.md) |
| A toast | Base UI's toast live region; the toast stays open while it has focus | [Toast](../../packages/ui/src/components/toast/toast.md) |
| A field error appears | `role="alert"` on `FieldError` | [Field](../../packages/ui/src/components/field/field.md) |
| Something starts loading | `role="status"` on the spinner, named "Loading" unless you name what loads | [Spinner](../../packages/ui/src/components/spinner/spinner.md) |
| A copy succeeds | `aria-live="polite"` on the copy button | [CopyableCode](../../packages/ui/src/components/copyable-code/copyable-code.md) |
| Agents start or stop working | `aria-live="polite"` on the bar | [LiveAgentActivityBar](../../packages/ui/src/components/live-agent-activity-bar/live-agent-activity-bar.md) |
| A reaction fails | A visually hidden `role="status"` | [MessageItem](../../packages/ui/src/components/message-item/message-item.md) |

- Make the title of a toast or banner carry the whole meaning: its icon is hidden.
- Never put something people must not miss only in a toast: it disappears ([Feedback](../patterns/feedback.md)).

## Touch

A touch screen has no hover, no right-click and no keyboard shortcuts, and fingers cover what they press.

- Show hover styles only on devices that can hover. Tailwind's `hover:` variant applies only under `@media (hover: hover)`, so use it rather than a bare `:hover` ([Motion](./motion.md#usage)).
- Don't show the hover toolbar of a message on a touch screen; press and hold opens the message menu ([Responsive layout](../patterns/responsive.md), [ContextMenu](../../packages/ui/src/components/context-menu/context-menu.md)).
- Don't rely on a tooltip on touch. Write the explanation in the interface, or show it on press and hold ([Tooltip](../../packages/ui/src/components/tooltip/tooltip.md#accessibility)). A preview card doesn't open on touch, so make its trigger a real link ([PreviewCard](../../packages/ui/src/components/preview-card/preview-card.md)).
- Start a drag only after a 200ms press and hold, so scrolling a list doesn't move a card ([TaskDnd](../../packages/ui/src/components/task-dnd/task-dnd.md)).
- Never make a swipe the only way to close something: drawers and sheets keep ×, Back or a button, and toasts close by themselves and with Esc ([Drawer](../../packages/ui/src/components/drawer/drawer.md#accessibility), [Toast](../../packages/ui/src/components/toast/toast.md#behavior)).
- Keep the composer above the on-screen keyboard, and make Return insert a new line on a phone held upright ([Composer](../../packages/ui/src/components/composer/composer.md)).

## Language and casing

- Never set text in all caps, in CSS or in the string. All caps removes the shape of words, so it is slower to read, and some screen readers read a short all-caps string letter by letter, as an abbreviation ([0002](../decisions/0002-no-all-caps.md), [Typography](./typography.md#casing)).
- Use Title Case for anything clickable and sentence case for everything else, so a label reads the same on screen, in a tooltip and in its accessible name ([Writing](../content/writing.md#casing)).
- Set `lang` on the `<html>` element to the interface language. The screen reader chooses its voice and pronunciation from it. The Raft web app sets it whenever the interface language changes.
- Spell out what a symbol means in its accessible name: a shortcut's ⌘, a count's +3, a separator between two facts.
- Write errors and empty states in plain words that say what happened and what to do next ([Voice and tone](../content/voice-and-tone.md)).

## Checking a change

Before a change ships, check it the way people will use it:

- Use it with the keyboard alone: Tab reaches everything, focus is always visible while you move with the keyboard, Esc closes what opened.
- Read the accessibility tree: every control has a role, a name that starts with its visible text, and its state.
- Turn on reduced motion: nothing moves, and loading still reads as loading.
- Try it on a touch screen or in touch emulation: every target is 44px, and nothing needs hover.
- Look at it in dark mode and at 320px wide ([Design system](../README.md)).

## Related

- [Color](./color.md#contrast): the contrast guarantees and the tokens behind them.
- [Elevation](./elevation.md#focus-ring) and [States](./states.md#focus): the focus ring.
- [Spacing](./spacing.md#hit-targets): hit targets and control heights.
- [Motion](./motion.md): what moves, and what never does.
- [Writing](../content/writing.md): labels, casing and error wording.
