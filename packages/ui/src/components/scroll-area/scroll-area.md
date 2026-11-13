---
title: ScrollArea
summary: A region with native scrolling and thin overlay scrollbars that look the same on every platform, for lists, strips and panes inside a fixed frame.
status: stable
aliases: [Scrollbar, Scroll view]
layer: core
category: layout
related: [message-list, panel, sidebar, composer]
---

# ScrollArea

ScrollArea scrolls its content natively and draws thin overlay scrollbars in the style of macOS: a rounded thumb in the label color made translucent, with no visible track, that fades in while the area scrolls or is pointed at, thickens when you point at it, and fades out shortly after. The scrollbars take no room from the layout and look the same in every theme and on every platform: a translucent label color is dark on a light page and light on a dark one, so the thumb reads on any content without a track behind it. The wheel, trackpad, touch and keyboard scroll as usual; the thumb can also be dragged, and a press on the empty rail beside it pages. Every region that scrolls uses it, in raft-ui and in the apps built on it, so scrollbars look and behave the same everywhere; native scrolling is kept only for the exceptions listed under [Native scrolling](#native-scrolling). raft-ui uses it for the desktop message list and sidebar, the panel's `PanelScrollViewport`, the Activity, Search, Files and Tasks lists, the composer's input, suggestions and row of attachments, wide Markdown tables, the lists of Select, Combobox and ComboboxSelect (with absolute gutters, since Base UI owns the list's children), and over a VirtualList wherever an app renders one as its container.

ScrollArea follows [react-scroll-area-demo](https://github.com/07akioni/react-scroll-area-demo): it measures a container, the element that scrolls, and draws the gutters (the scrollbars) inside it, as its first child. The area is one element, so a `ref` gets the native `scrollTo` and `scrollBy`, and `onScroll` receives its scroll events. `<ScrollArea>` is the common case, with a `<div>` of its own as the container (or the element `render` gives). For an element you render yourself (a list, VirtualList's own scroller), `useScrollAreaContainer`, the demo's `useContainer` as a hook, binds it, and `<ScrollAreaGutters />` draws its scrollbars ([Your own container](#your-own-container)). `ScrollAreaTextarea` is the same for a `<textarea>`.

```example
scroll-area/compositions/basic
```

## When to use

| Situation                                               | Use                                                                          |
| ------------------------------------------------------- | ---------------------------------------------------------------------------- |
| A list, strip or pane that scrolls inside a fixed frame | ScrollArea                                                                   |
| A `<textarea>` that should show the same scrollbar      | `ScrollAreaTextarea`                                                         |
| An element that scrolls itself (a list's own scroller)  | `useScrollAreaContainer` ([Your own container](#your-own-container))         |
| The content of a panel under its header                 | `PanelScrollViewport` ([Panel](../panel/panel.md#anatomy))                   |
| The messages of a conversation or a thread              | [MessageList](../message-list/message-list.md), which is built on ScrollArea |
| A list long enough that rendering every row is too slow | [VirtualList](../virtual-list/virtual-list.md)                               |
| A row of tabs that doesn't fit                          | [Tabs](../tabs/tabs.md#behavior), which scrolls on its own                   |
| A Markdown table wider than the text                    | `MarkdownTableScroll` ([Markdown](../markdown/markdown.md))                  |

## Anatomy

ScrollArea (sticky gutters):

```text
div.r-scroll-area.r-scroll-area--sticky-gutters   data-slot="scroll-area": the container and the root; it scrolls; ref, className, style, native props
  div.r-scroll-area__gutters                      data-slot="scroll-area-gutters": aria-hidden, sticky, zero high, the first child (in flow)
    div.r-scroll-area__gutter--vertical           data-slot="scroll-area-scrollbar": a gutter for each axis that scrolls right now
      div.r-scroll-area__thumb                    data-slot="scroll-area-thumb"
  div.r-scroll-area__content                      data-slot="scroll-area-content": with contentClassName, contentStyle or fade; else the children themselves
```

Absolute gutters (`useScrollAreaContainer({ guttersPosition: "absolute" })`, `ScrollAreaTextarea`):

```text
div.r-scroll-area.r-scroll-area--absolute-gutters   your frame (frameProps): position relative, a flex column; the root
  (your element).r-scroll-area__container            the container (containerProps): it scrolls and fills the frame
  div.r-scroll-area__gutters                        ScrollAreaGutters: aria-hidden, absolute, inset 0, after the container
    div.r-scroll-area__gutter--vertical > div.r-scroll-area__thumb
```

- `ScrollArea`: give it the size of the region (a height, a `max-height`, or a flex item's share). It is the container, so `ref`, `className`, `style`, `onScroll` and the native props are all on the element that scrolls; `render` puts another element (a `<section>`, a `<nav>`) in its place.
- The content: the children themselves, or with `contentClassName` or `contentStyle` a content element (`ScrollAreaContent`) around them. Pad it and lay it out (grid, flex, `gap`, `stack-y-*`) there, not on the area ([Rules](#rules)).
- The gutters: the scrollbars, over the right edge (vertical) and the bottom edge (horizontal), above everything in the area ([Rules](#rules)), hidden from assistive technology. They are a zero-height layer, but in flow: a child of the container like any other.
- `useScrollAreaContainer` and `ScrollAreaGutters`: the same area for a container you render yourself ([Your own container](#your-own-container)).
- `ScrollAreaTextarea`: a native `<textarea>` as the container, with absolute gutters.

## Variants

| Prop          | Values                                     | Use for                                                                                                                                                                                                 |
| ------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `orientation` | `vertical` (default), `horizontal`, `both` | The directions the area scrolls in, each with its own scrollbar. Content too wide for a vertical area is cut off. With both, each scrollbar stops short of the corner, and the corner stays transparent |
| `trigger`     | `hover` (default), `scroll`, `none`        | When the scrollbars show: while the pointer is over the area or it scrolls; only while it scrolls (the message list, the sidebar, the attachments row); or always                                       |
| `size`        | `medium` (default), `small`                | The thumb's thickness: 7px or 5px at rest, 3px more while pointed at or dragged. `small` for a short strip                                                                                              |
| `fade`        | `false` (default), `true`                  | The content fades out over up to 24px toward each edge with more past it. For short areas: the fade repaints the content while it scrolls                                                               |
| `overscroll`  | `none` (default), `contain`, `auto`        | What a scroll does at the end: stop with no bounce; stop, but let a Mac trackpad or iOS bounce the area; or carry on to the page behind                                                                 |

```example
scroll-area/compositions/orientation
```

```example
scroll-area/compositions/trigger
```

```example
scroll-area/compositions/size
```

```example
scroll-area/compositions/fade
```

## States

| State             | Look                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nothing to scroll | No scrollbar, and the area is no tab stop                                                                                                                                    |
| At rest           | With `trigger="hover"` or `"scroll"`, no scrollbar; with `"none"`, the thumb at 42% of `foreground`                                                                          |
| Hover             | With `trigger="hover"` and a pointer that hovers, the scrollbars fade in over 120ms (none on a touch screen)                                                                 |
| Scrolling         | The scrollbars show with every trigger, and fade out over 400ms once `hideDelay` (600ms by default, at least 100ms with `trigger="scroll"`) has passed since the last scroll |
| Thumb pointed at  | The thumb thickens by 3px and darkens to 58% of `foreground`                                                                                                                 |
| Thumb dragged     | As pointed at, until the drag ends; the area scrolls in proportion                                                                                                           |
| Keyboard focus    | The focus ring (`--focus-ring`) around the area                                                                                                                              |

### Edge state

While there is more content past an edge, the area carries a modifier class for it: `r-scroll-area--overflow-y-start` (above), `--overflow-y-end` (below), `--overflow-x-start` and `--overflow-x-end` (the inline start and end, so the right and left edges in right-to-left layouts). Style dividers or "more" hints from them, such as a hairline under a sticky header once rows have scrolled under it. `onEdgeChange` is called with `{ top, bottom, left, right }` (`true` when the area is scrolled all the way to that edge) whenever one of them flips, and in the first frame after mounting when the content overflows.

A header or footer stuck inside the area (`position: sticky`) covers its ends, so give its height to `railInset`: `railInset={{ top: 40, bottom: 40 }}` starts the vertical scrollbar below the header and ends it above the footer. `left` and `right` do the same for the horizontal scrollbar, such as beside a sticky first column. The same room can come from CSS, set on the area itself: `--r-scroll-area-rail-inset-top`, `-bottom`, `-left` and `-right`. They don't inherit, so a scroll area nested inside doesn't take them.

```example
scroll-area/compositions/edge-state
```

## Behavior

- Scrolling is the browser's own: wheel, trackpad, touch and keyboard scroll the area as usual. Dragging the thumb scrolls in proportion; a press on the rail beside the thumb pages toward the press, by most of a viewport (smoothly, unless the reader asks for reduced motion).
- By default a scroll that reaches the end stops there: it doesn't carry on to the page behind it, and doesn't bounce the area (and its sticky header or footer) on a Mac trackpad or iOS. `none` and `contain` hold only in a direction where the content overflows right now, so an area that only overflows sideways never stops the page from scrolling down.
- With `trigger="scroll"` a hidden scrollbar doesn't catch presses meant for the content under it. A scrollbar the pointer is already on stays visible and usable after `hideDelay`, until the pointer leaves it.
- Hover applies only with a pointer that hovers (`@media (hover: hover)`, [Hover and press](../../../../../design/foundations/states.md#hover-and-press)). On a touch screen the last thing tapped stays hovered, which would leave the scrollbars shown and the thumb thick until the next tap elsewhere. There `trigger="hover"` shows the scrollbars only while the area scrolls or a thumb is dragged, like `"scroll"`, and with either a hidden scrollbar lets a tap through to the content under it: an invisible strip at the edge would otherwise swallow taps on the content. A scrollbar shown by scrolling takes the finger, so its thumb can be dragged, and the drag keeps it shown.
- The thumbs behave like native scrollbars: each frame, a thumb's length and place follow the current scroll and content size, with no transition, so when the content grows or shrinks mid-scroll the thumb takes its new length and place in the same frame. Where the browser has scroll-driven animations, the browser itself moves the thumbs from the scroll, on the compositor, on the scroller's own timeline; the script only sizes them when a size changes. Elsewhere a scroll asks for one animation frame, however many scroll events arrive, which moves each thumb with a `transform`.
- A thumb's length follows the content's and the viewport's size: ScrollArea watches the container (the viewport), the content (each element child of the container, or `contentRef`) and each gutter with a ResizeObserver, and children added or removed with a MutationObserver. It measures in the animation frame after a notification, never in it: measuring resizes the gutters, which are watched too, and doing that inside the notification is a "ResizeObserver loop" error. When the container is a VirtualList, ScrollArea watches the box that holds the rendered rows, not the list's items element: the list resizes that element itself from its own ResizeObserver, so watching it too would raise the same loop error. A size nothing observed reports (rows translated past a list's spacer) is read again on the next scrolled frame, or by `actionsRef.measure()`. It listens to the container's scroll itself, once, however often anything renders.
- Where the browser has scroll-driven animations, the container names its scroll timelines. Sticky gutters are inside it and follow them; absolute gutters are its siblings, so the frame hoists the names (`timeline-scope`). The names are unique to each ScrollArea, so an area nested in another's container takes its own timeline, never its parent's. Arranged any other way, the script moves the thumbs.
- Scrolling renders nothing. Nothing is written on the root while it scrolls (with `fade`, only the mask moves). The edge classes are set on the root directly, and set again when a container rendered by another component replaces its className; the scrolling and dragging classes are set on the gutters layer, so their toggling at each scroll's start and end restyles only the scrollbars, never the content under the root (a long list). `onEdgeChange` is called from the frame. ScrollArea re-renders only when a scrollbar appears or disappears. Where the thumbs are animated by the browser, a scrolled frame still reads the scroll size (to keep each thumb's length current), but writes nothing unless a size changed.
- Resizing writes nothing on the root either. The sizes measuring writes (the viewport's height and the container's padding, with sticky gutters) go on the gutters layer, and with `fade` the viewport's size on the content its mask is on. They are registered not to inherit (`@property`), so a window being resized, which changes the viewport on every frame, restyles only the scrollbars, never every row of a long list under the root. They are internal: read the area's size with a ResizeObserver, not from them.
- A scroll that finds the content overflowing, or no longer overflowing, with nothing observed having resized (text written into a textarea without an input event) measures again, so the scrollbar appears or goes in that frame.

```example
scroll-area/compositions/overscroll
```

### Scrolling from code

`ref` is the container, the element that scrolls, so it gets the native `scrollTo` and `scrollBy`, and `onScroll` receives its events.

```example
scroll-area/compositions/scroll-to
```

`actionsRef` gets `scrollToElement(element, options)`, which scrolls the area, and only the area (`scrollIntoView` would scroll the page too), so that an element inside it is in view. `block` lines the element up at the `start` (the default), `center` or `end`, or `nearest` scrolls only as far as needed. `offset` keeps that many px clear between the element and the edge, such as the height of a sticky header (give the same height to `railInset`, so the scrollbar starts below it too); `behavior: "smooth"` animates the scroll. In a `horizontal` area `block` and `offset` apply to the horizontal axis; with `both`, the horizontal axis scrolls only as far as needed.

```example
scroll-area/compositions/scroll-to-element
```

### Textarea

A `<textarea>` scrolls itself and can't hold children, so `ScrollAreaTextarea` is `useScrollAreaContainer` with absolute gutters whose container is a native textarea (the demo's textarea example). Frame the root (`wrapperClassName`: border, background, focus ring) and pad the textarea (`className`); the scrollbar follows typing, pasting and a controlled `value`. Drag the bottom corner to make the textarea taller: the scrollbar stops above the grip so it stays reachable. `ref`, `className`, `style`, `value`, `onScroll` and every other native prop go to the textarea; it takes `trigger`, `hideDelay`, `size` and `overscroll` as ScrollArea does.

```example
scroll-area/compositions/textarea
```

### Your own container

`useScrollAreaContainer(options)` is ScrollArea without its `<div>` (the demo's `useContainer`, as a hook): call it in the component that renders the element that scrolls, a list or another component's own scroller, and spread what it returns on your elements. It takes ScrollArea's options (`orientation`, `trigger`, `size`, `fade`, `overscroll`, `railInset`, `hideDelay`, `onEdgeChange`, `actionsRef`, `contentRef`), where the gutters go (`guttersPosition`), and your own refs to the element (`containerRef`) and the frame (`frameRef`), and returns:

- `containerProps` for the element that scrolls: `ref` (a callback that forwards to `containerRef`, so there is nothing to merge), `className` before your own, `style` with yours after it, and `tabIndex` unless the element is focusable already. Its classes give the element the overflow of the `orientation`, as ScrollArea's own container has it (vertical: `overflow-y: auto` and `overflow-x: hidden`; horizontal: the other way round; both: `auto`), so don't add an overflow class: a native one is what `raft-ui/prefer-scroll-area` reports. An overflow class of your own still wins over the hook's, which has no specificity, so code that still passes one keeps working.
- `guttersProps` for `<ScrollAreaGutters {...guttersProps} />`, which goes where `guttersPosition` says: as the element's first child (`sticky`), or right after it (`absolute`). Spread it as it is: it is the gutters' binding to the element, with nothing in it to read or build.
- `frameProps`, with absolute gutters only (`undefined` with sticky ones; typed as always there when you pass `guttersPosition: "absolute"`), for the positioned frame you render around the element and the gutters: `ref`, `className` before your own (size, border and focus ring the frame there) and `style`. The frame is a flex column: give the element `flex-1 min-h-0` so it fills the frame and scrolls.
- `measure()`, which measures again for a change nothing observed reports (a textarea's input), `scrollToElement`, as on `actionsRef`, and `scrollable`.

The hook listens to the element's scroll itself, and binds again when a render puts another element in `ref`. Everything it returns is stable until something it draws from changes (an inline `railInset` object with the same numbers is no change), so it can go in a memoized child's props.

Without `contentRef`, each element child of the container is watched for size changes, and children added or removed. For a list with many direct children (a `<ul>` of a thousand `<li>`), wrap them in one element and pass it as `contentRef`, or keep a sentinel element as `contentRef` whose size is the content's: the area then watches one element, not each row.

```example
scroll-area/compositions/sticky-gutters
```

```tsx
function Members({ members }: { members: string[] }) {
  const { containerProps, guttersProps } = useScrollAreaContainer<HTMLDivElement>();
  return (
    <div
      {...containerProps}
      role="region"
      aria-label="Members"
      className={`${containerProps.className} h-48`}
    >
      <ScrollAreaGutters {...guttersProps} />
      <ul className="px-4">
        {members.map((member) => (
          <li key={member}>{member}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Gutters position

`sticky` (the default, and ScrollArea's) adds the least: the area is one element, the gutters a zero-height layer inside it, its first child. A sticky box is always in flow, so the layer is one of the container's children for its own layout:

- in a block, or a flex column with no `gap`, it is a zero-height row and nothing moves;
- in a grid it takes the first cell, so every item moves one cell along;
- in a flex column or a grid with `gap`, one extra gap comes before the first item;
- in a flex row (a horizontal strip) it is a zero-width item, and the gutters collapse with it;
- sibling and structural rules on the container's children count it: `stack-y-*` and `rule-y` (`* + *`) also match the first real child, and `first:` or `only:` on a child no longer match.

So give a sticky container one child that holds the content, and put the grid, flex, `gap`, `stack-*` or `rule-*` classes on that wrapper (with ScrollArea, `contentClassName`). In development the area warns in the console when a sticky container is a grid, a flex row, or a flex column with a gap. Padding on the container is fine, in either direction: the layer reaches over it, so the gutters stay at the container's edges, but padding the wrapper keeps the layout in one place.

`absolute` puts nothing inside the container: a frame holds it and the gutters lie over the frame, so the container's children and its layout are its own. Use it for a container that can't hold children (a textarea), or whose children are laid out by the container itself (a grid of its own, a flex row). With absolute gutters the `fade` mask is on the container; the frame is yours, and so is its focus ring (`has-focus-visible:`).

```example
scroll-area/compositions/absolute-gutters
```

[VirtualList](../virtual-list/virtual-list.md#with-scrollareas-scrollbar) renders its own scroller, so it is used this way, with sticky gutters through its `header`:

```tsx
const { containerProps, guttersProps } = useScrollAreaContainer<HTMLDivElement>({
  overscroll: "auto",
});
<VirtualList
  domRef={containerProps.ref}
  className={containerProps.className}
  style={containerProps.style}
  header={<ScrollAreaGutters {...guttersProps} />}
  {...listProps}
/>;
```

With sticky gutters `className` and `style` carry the root's classes and variables, which the element then holds. With `overscroll="auto"` the container keeps its own `overscroll-behavior`. VirtualList lays its rows out as a block, so its sticky gutters move nothing.

## Styling

ScrollArea is plain CSS (`scroll-area.css`, in the `components` layer, shipped in `styles.css`), so a utility in its `className` overrides it. Its classes are `r-scroll-area` on the root, with the modifiers above, the edge classes and `--rtl`, and `--sticky-gutters` or `--absolute-gutters`; `__container` on an absolute container, `__viewport` on ScrollArea's own `<div>`, `__content`, `__textarea`, and `__gutters` (with `--scrolling` and `--dragging`), `__gutter` (`--vertical`, `--horizontal`, `--shortened`, `--dragging`) and `__thumb`. The gutters layer, each gutter and each thumb also carry `data-slot` (`scroll-area-gutters`, `scroll-area-scrollbar` with `data-orientation`, `scroll-area-thumb`). The look is set by variables on the area: `--r-scroll-area-thumb-size-{small,medium}` and `-thumb-size-hover-{small,medium}`, `--r-scroll-area-thumb-color` and `-thumb-color-hover`, `--r-scroll-area-rail-gap` (3px, between the thumb and the edge) and `--r-scroll-area-fade-size`.

## Accessibility

- ScrollArea is not built on a Base UI primitive: it is a native scroll container, so assistive technology and the keyboard use the browser's own scrolling. The drawn scrollbars are `aria-hidden`.
- The area has no role of its own: it is a `<div>`, and a name on a role-less `<div>` is not announced (ARIA forbids naming the generic role). When there is something to scroll, it is focusable (`tabIndex={0}`, also in `useScrollAreaContainer`'s `containerProps`), so keyboard users can scroll it with the arrow keys, Page Up and Page Down. Name what it holds one of two ways:
  - make it a region with a name, `role="region"` and an `aria-label` (or `render` an element with a role of its own, such as a `<nav>`), so focusing it says what it is;
  - or name the content inside it, such as a list with an `aria-label`.
- Pass `tabIndex={-1}` when every item inside takes focus itself and scrolls into view, as the attachments row does.

## Rules

- Give each region one scroll container: the header stays put and only the content scrolls ([Panel](../panel/panel.md#behavior)).
- Size the area, not the content: a ScrollArea without a height grows with its content and never scrolls.
- Lay the content out in one wrapper inside a sticky container (`contentClassName`): never grid, flex, `gap`, `stack-*` or `rule-*` on the container itself, whose first child is the gutters layer ([Gutters position](#gutters-position)). For a container that must lay out its own children, use absolute gutters.
- Pad the content (`contentClassName`) rather than the area: the gutters reach over a sticky container's padding, but the content's layout stays in one place.
- With `useScrollAreaContainer`, put `<ScrollAreaGutters {...guttersProps} />` where `guttersPosition` says: the container's first child, or right after it.
- Give a sticky header or footer inside the area its height in `railInset`, so the scrollbar doesn't run over it.
- Leave the scrollbars on top. They paint over everything in the area, as native scrollbars do: the gutters layer is at `z-scrollbar` (49), the top in-page layer, over every named layer inside the area up to `z-app`, inside the root, which is a stacking context of its own (`isolation: isolate`) ([Layer order](../../../../../design/foundations/elevation.md#layer-order)). Give what is inside the area a layer name, never a number: a part at an overlay's number (50 and up) is drawn over the scrollbar. Don't raise anything inside the area to cover them; keep a sticky header clear of them with `railInset` instead. Because the root isolates its content, nothing inside it can cover anything outside it either, whatever its `z-index`: render a layer that must (a popup, a dragged copy) through a portal, as raft-ui's overlays and `DragLift` do by default. Keep a control at the inline end clear of the 16px strip the scrollbar takes (14px with `size="small"`), as ChoiceList's row actions are: over it the scrollbar paints and takes the pointer. In an activity list each day's sticky heading, opaque at z-15, covered the thumb as it slid by and cut it into pieces (Artea, 2026-11-09, #proj-raft-ui:21bae128).

### Native scrolling

- Make every region that scrolls a ScrollArea: `ScrollArea`, `useScrollAreaContainer` for an element you render yourself, `ScrollAreaTextarea`, or a part built on one (`PanelScrollViewport` in a panel). Never put `overflow-auto`, `overflow-y-auto`, `overflow-x-auto` or `overflow-scroll` on an element to make it scroll. A native scrollbar differs by platform and theme: a classic one takes room from the layout when it appears (an 8px list inset turns uneven, a row's controls move), and is drawn in the platform's colors, not the label color that reads in light and dark. ScrollArea's scrollbar takes no room and looks the same everywhere, the area is a tab stop only while there is something to scroll, with the focus ring, a scroll stops at the end instead of scrolling the page behind, and the [edge state](#edge-state) and `fade` come with it.
- Keep native scrolling only where a ScrollArea can't go or would draw nothing, and say which exception it is in a comment next to the class. `scroll-area-everywhere.test.ts` fails on any other `overflow-auto` or `overflow-scroll` in the package. In an app, raft-ui's lint rule `raft-ui/prefer-scroll-area` reports them, and the comment is `// raft-ui: native-scroll <reason>` on the line above ([Lint rules](../../../../../design/about/use-raft-ui.md#lint-rules)). The exceptions:

| Where                                                                                                                                              | Why it scrolls natively                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MessageList and the Sidebar below 768px                                                                                                            | On a phone they scroll natively with the platform's own overlay scrollbar, which takes no room ([MessageList](../message-list/message-list.md#behavior), [Sidebar](../sidebar/sidebar.md#anatomy))               |
| A row of [Tabs](../tabs/tabs.md#behavior), a [SegmentedControl](../segmented-control/segmented-control.md) that doesn't fit, a `CopyableCode` line | One-line strips with no scrollbar by design; Base UI's tab list lays its tabs out itself, and a `<code>` line holds only text                                                                                    |
| The `<pre>` of a CodeBlock, and a `<pre>` in an announcement's text                                                                                | A `<pre>` holds phrasing content only, so the gutters can't go inside it, and it is often a highlighter's or the Markdown's own element                                                                          |
| `DialogBody` and `DrawerBody`                                                                                                                      | Callers lay out the body itself (`className="grid gap-4"`), and sticky gutters would take the grid's first cell ([Gutters position](#gutters-position)); they need a content part before they can be ScrollAreas |
| VirtualList's own scroller                                                                                                                         | It hides its scrollbar unless `showScrollbar` is set; for ScrollArea's, bind it with `useScrollAreaContainer` ([Your own container](#your-own-container))                                                        |

- A native scroller scrolls one way: name the other axis `hidden` (`overflow-x-hidden overflow-y-auto`). `overflow-y-auto` alone makes the sideways axis `auto` too, so anything that pokes past the scroller's padding box, such as a separator drawn out to the popup's edge, scrolls it sideways, and a classic scrollbar (Windows, or macOS set to always show them) draws a bar for it. A line that reaches the popup's edge needs that edge inside the scroller: Select's list frame reaches into the popup's inset and the list pads it back. Select's runtimes list, then native, showed a horizontal scrollbar from its 4px separator overhang (Artea, 2026-11-08, #proj-raft-ui:20a421bd).

### Replacing a native scroller

An element that scrolls with `overflow-y-auto` becomes a ScrollArea in three moves: the element turns into `<ScrollArea>`, its overflow class goes, and its layout classes move to `contentClassName`.

```tsx
// Before
<div className="max-h-64 overflow-y-auto grid gap-2 p-4">{rows}</div>

// After
<ScrollArea className="max-h-64" contentClassName="grid gap-2 p-4">
  {rows}
</ScrollArea>
```

| What the element had                                   | Where it goes                                                                                                                                  |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `overflow-auto`, `overflow-y-auto`, `overflow-scroll`  | Removed: the area scrolls already. For `overflow-x-auto` set `orientation="horizontal"`, for both axes `orientation="both"`                    |
| Its size: `h-*`, `max-h-*`, `flex-1`, `min-h-0`, `w-*` | `className`: the area is the element that scrolls, so the size stays on it                                                                     |
| Its border, background and radius                      | `className`: they frame the region and don't scroll                                                                                            |
| Grid, flex, `gap-*`, `stack-*`, `rule-*` and padding   | `contentClassName`: the area's first child is the gutters layer, which would take a grid cell or a gap ([Gutters position](#gutters-position)) |
| `ref`, `onScroll`, `role`, `aria-label`                | The same props on `<ScrollArea>`: they reach the element that scrolls                                                                          |
| `overscroll-contain`                                   | Removed: a scroll already stops at the area's end. Inside another scroller that should carry on when this one ends, set `overscroll="auto"`    |
| Another tag (`<section>`, `<nav>`, `<main>`)           | `render={<section />}`                                                                                                                         |

- Pass `tabIndex={-1}` when everything inside is reachable with the keyboard already, such as a list of links or buttons: the area is a tab stop by default while it has something to scroll, and there that stop is one press of Tab with nothing to do.
- In a Panel use `PanelScrollViewport`, which is this ScrollArea with the panel's sizing and `overscroll="contain"`, so a Mac trackpad or iOS still bounces the panel.
- Don't keep an overflow class on the ScrollArea: it wins over the area's own overflow, and `raft-ui/prefer-scroll-area` reports it.
- For an element you can't replace (another component's scroller, a `<textarea>`), bind it instead ([Your own container](#your-own-container)).

## Testing

ScrollArea renders in jsdom with no setup: where `ResizeObserver` is missing it measures once when it mounts, and where `requestAnimationFrame` is missing it measures at once. jsdom has no layout, so every size reads 0, nothing overflows, and the area draws no scrollbar and is no tab stop. A test of what is inside the area needs nothing more.

| The test                                                                                                                    | What jsdom needs                                                                                                                                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renders content inside a ScrollArea and reads it                                                                            | Nothing                                                                                                                                                                                                                                                        |
| Calls `scrollTo` or `scrollBy` on the area's `ref`, or `actionsRef.scrollToElement`, which calls the container's `scrollTo` | jsdom has neither method: define them, such as `Element.prototype.scrollTo = vi.fn()`                                                                                                                                                                          |
| Expects a scrollbar, an edge class or `onEdgeChange`                                                                        | Sizes that overflow (`clientHeight`, `scrollHeight` and their width pairs on `HTMLElement.prototype`), a `ResizeObserver` stub whose callback the test calls, and `requestAnimationFrame` run by the test: the area measures in the frame after a notification |
| Presses the rail or drags a thumb                                                                                           | `Element.prototype.scrollBy` and `setPointerCapture` as well                                                                                                                                                                                                   |

- Check how the scrollbars look and move in a browser test, not in jsdom: a thumb's length and place come from layout.
- Stub `CSS.supports` to return `false` in a jsdom test that reads a thumb's `transform`: jsdom answers yes to scroll-driven animations it doesn't run, and the script then leaves the thumbs to them.
