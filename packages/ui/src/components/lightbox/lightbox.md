---
title: Lightbox
summary: A full-screen viewer over the scrim for images and attachment previews, with previous and next, thumbnails and one button to close.
status: stable
aliases: [Image viewer, Media viewer, Attachment preview]
layer: core
category: overlays
related: [dialog, message-attachment, file-preview, drawer]
---

# Lightbox

A lightbox shows an image or a file preview at full size over the whole window: the image on a full-screen `layer-backdrop`, previous and next, and one icon button to close ([Built from existing parts](../../../../../design/components/overview.md#file-viewer)). Use it when someone opens an image or an attachment from a message. It is for media and previews only.

```example
lightbox/compositions/image-lightbox-shell
```

## When to use

| Situation                                                           | Use                                                              |
| ------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Viewing an image, a screenshot or a video at full size              | Lightbox, image shell                                            |
| Previewing an attached file (an HTML page, a document) at full size | Lightbox, attachment shell                                       |
| A file read top to bottom (a PDF, Markdown, a long diagram)         | Lightbox, attachment shell in [document mode](#document-mode)    |
| A decision, a form or anything that is not media                    | [Dialog](../dialog/dialog.md)                                    |
| Details people read beside the page                                 | [Drawer](../drawer/drawer.md)                                    |
| The attachment in the message itself                                | [MessageAttachment](../message-attachment/message-attachment.md) |

## Anatomy

- `Lightbox`: the root. It holds whether the lightbox is open. Required.
- `LightboxTrigger`: what opens it, usually the image or the file card in the message.
- `LightboxContent`: the full-screen layer, with the scrim behind it. Required. Popups opened inside it are drawn above it ([Popups inside](#popups-inside)).
- `LightboxTitle`: the file name.
- `LightboxClose`: the close button. Required.
- `LightboxStage`: the area that centers the media. Required.
  - `LightboxMedia`: the image or video, at most 80% of the window's height and 86% of its width.
  - `LightboxNavigationButton`: previous (`direction="previous"`) and next (`direction="next"`), 44px buttons 32px from the left and right edges.
  - `LightboxInfoDock` with `LightboxInfoBar`: a small floating bar near the bottom, on `layer-popover` with `shadow-float`, holding `LightboxInfoTitle` (the file name) and `LightboxInfoActions` (such as Download). It is a floating toolbar, 36px tall at every input, the message hover toolbar's touch size: its buttons are 28px, 4px inside it and 4px apart, with `radius-chip`, and a 44px tall hit area on a touch screen that reaches only half the gap toward a neighbour ([Shape](../../../../../design/foundations/shape.md#inside-a-frame)).
  - `LightboxThumbnailStrip` with `LightboxThumbnail`s: 48px thumbnails along the bottom; `active` marks the one shown.
- `LightboxToolbar`: the attachment shell's top bar instead of the floating close button, on `layer-canvas` with a `line-seam` under it. It holds `LightboxHeaderMeta` (a `LightboxHeaderLabel` or [Badge](../badge/badge.md) naming the preview type, then `LightboxTitle`) and `LightboxActions`, with `LightboxClose` last.
- `LightboxBody`: the scrolling body under `LightboxToolbar` in [document mode](#document-mode), a [ScrollArea](../scroll-area/scroll-area.md) that fills the rest of the content, on `layer-canvas`, the toolbar's surface. Its `className` sets another surface (`bg-layer-sidebar`), and every ScrollArea prop, `render` included, is the area's. Experimental, from `@botiverse/raft-ui/wip`.
- `LightboxHeader`: a plain top row for a title and actions, for shells that need neither toolbar nor floating close.

## Variants

| Variant                                                    | Use for                                                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Image shell: `LightboxClose` directly in `LightboxContent` | Images and video. The close button floats at the top right; the image has the whole window                                                      |
| Attachment shell: `LightboxToolbar` above `LightboxStage`  | A file preview that fills the stage, such as an HTML page in an `iframe`. The toolbar names the file and holds its actions and the close button |

```example
lightbox/compositions/attachment-preview-shell
```

### Document mode

A file read top to bottom, a PDF, a Markdown or text file or a long diagram, opens in the attachment shell with `modal="trap-focus"` on `Lightbox`, and the file's own body under the toolbar scrolls by itself in `LightboxBody`, a [ScrollArea](../scroll-area/scroll-area.md) that fills the rest (`min-h-0 flex-1`). It is on `layer-canvas`, as the toolbar is; the app chooses another surface with `className`. `LightboxContent` lets the pointer through to the scrim, so the body takes it back with `pointer-events-auto`, as the toolbar does. The page's scroll isn't locked, so the body must not pass a scroll on to the page under the scrim: it takes `overscroll-contain`, since a ScrollArea stops a scroll only while it has something to scroll, and a short file's body would otherwise scroll the page behind. A body of your own in place of `LightboxBody` takes `pointer-events-auto`, `min-h-0 flex-1` and `overscroll-contain` itself. Document mode is a value of Base UI's own `modal` prop rather than a prop of its own: it changes how the lightbox holds the page, not which parts it has, and a second switch beside `modal` would allow pairs that mean nothing, such as a document mode that isn't modal.

```example
lightbox/compositions/document-preview-shell
```

## States

- **First and last item:** previous or next is disabled. It stays focusable (`aria-disabled`) and ignores clicks.
- **Thumbnails:** the shown item has a solid edge; the others are dimmed with `layer-backdrop-nested` (40%), 28% on hover. The strip lies on `layer-backdrop`, dark in both modes, so the nested scrim dims a thumbnail the same way in light and dark mode ([Surfaces](../../../../../design/foundations/color.md#surfaces)).

## Behavior

- A lightbox appears and disappears without animation, like the other centered overlays ([Motion](../../../../../design/foundations/motion.md#usage)).
- Esc, the close button, a click on the scrim and Cmd+W (Ctrl+W) close it. Cmd+W closes the lightbox, not the browser tab; pass `closeOnModW={false}` to leave the shortcut to the browser.
- With a popup or a dialog open inside the lightbox, Esc closes only that, and the next Esc the lightbox. Cmd+W closes the whole lightbox, whatever is open inside it.
- The close button and the bars keep clear of the phone's safe areas.
- The caller keeps which item is shown. Previous, next, the thumbnails and the arrow keys all change that index.
- In document mode (`modal="trap-focus"`) focus stays trapped in the lightbox, but the page's scroll isn't locked: the document scrolls in its own body, and Base UI's lock would only rewrite the styles of the page's `<html>` and `<body>` under the scrim, again on every resize. The scrim still covers the page, so a press beside the file lands on the scrim and closes the lightbox, as in the default mode.
- In document mode a scroll in `LightboxBody` stays in it, at its ends and when the file is too short to scroll: the page under the scrim never moves. A Mac trackpad or iOS still bounces the body at its ends; `overscroll-none` in its `className` stops that too.
- The keys stay in it as well. Focus lands on `LightboxBody` when the lightbox opens ([Accessibility](#accessibility)), so the arrow keys, Page Up, Page Down, Space, Home and End scroll the file at once. Pressed anywhere else in the lightbox, on a toolbar button or on the lightbox itself after a tap, a key that would scroll the page under the scrim scrolls the body instead, by the browser's own steps; focus stays where it is. A key a control uses is the control's: a text field's arrows and Space, a button's Space, a menu's arrows. With a body of your own in place of `LightboxBody`, such a key does nothing rather than scroll the page.
- The browser's find in page reaches the lightbox in every mode: its content is never `inert` or hidden while it is open. Focus that lands on something below the fold scrolls the body to it, as on a page.
- A lightbox is drawn above dialogs and sheets ([Layer order](../../../../../design/foundations/elevation.md#layer-order)). It is a modal surface of the [stack](../../../../../design/foundations/elevation.md#stacked-overlays) in every mode: one opened from a dialog draws the lighter `layer-backdrop-nested` over it and is the second of the two modal surfaces allowed, and a Dialog, AlertDialog or Drawer opened inside a lightbox draws the nested scrim over the lightbox. A dialog that opens a lightbox that opens a dialog would be three, which Elevation doesn't allow: replace the top one, or move the flow to a page.
- Toasts are drawn above the lightbox, so a toast fired from inside it (Link copied, a failed download) is seen. While it is open, show only the toasts it causes, without an action, as for a dialog ([Toast](../toast/toast.md#where-it-appears)).

### Popups inside

A Tooltip, Popover, menu and its submenus, Select, Combobox, PreviewCard, Dialog, AlertDialog or Drawer opened inside `LightboxContent` is drawn above the lightbox and works as it does anywhere: a press in it is a press inside the lightbox, Esc closes it first, focus stays trapped, and it is neither `inert` nor hidden from assistive technology. Base UI already puts a popup opened inside the lightbox in the lightbox's portal rather than on the body; the lightbox's portal is a stacking context of its own, at the lightbox's place in the [layer order](../../../../../design/foundations/elevation.md#layer-order), so the popup's own order counts inside it, above the content. Without that context the popup, already in the lightbox's portal, would be stacked against the lightbox's scrim at the popup's own lower order: drawn under the scrim, with a press on it landing on the scrim and closing the lightbox.

A layer of your own (a popup that isn't raft-ui's, a portal you render yourself) gets the same only by being a Base UI popup rendered inside `LightboxContent`. One portaled to the body, with `createPortal` or a library's own portal, is drawn under the lightbox. Render it in place inside `LightboxContent` instead, with `pointer-events-auto` (the content lets the pointer through to the scrim): it is drawn in the lightbox in document order, above the parts before it, and needs no z-index.

## Content

- Title the lightbox with the file name. A long name truncates at the end.
- Name the preview type in the toolbar's label in sentence case: HTML preview.

## Accessibility

- Lightbox wraps the Base UI Dialog. It provides the `dialog` role, the focus trap and Esc; raft-ui adds the Cmd+W shortcut.
- `LightboxTitle` is plain text, not the dialog's name. Name the dialog yourself: `aria-label` on `LightboxContent`, or a `render` element with one.
- In document mode focus moves into the lightbox when it opens and goes back to `LightboxTrigger` when it closes. It lands on `LightboxBody`, so a keyboard user reads and scrolls the file at once and Tab goes on from there; on the first control when there is no body; and after a tap on the lightbox itself, as Base UI does, so a phone shows no ring and opens no keyboard. An `initialFocus` of your own wins over all three. The body is a tab stop even when the file is too short to scroll, and draws the inset ring inside its edge, which is the window's, where a ring outside it couldn't be seen ([Focus ring](../../../../../design/foundations/elevation.md#focus-ring)). In the default mode `LightboxContent` doesn't move focus when it opens or return it when it closes (`initialFocus` and `finalFocus` are `false`); pass them when keyboard users open the lightbox, so focus lands in it and goes back to the trigger. In either mode, a lightbox opened from state, without `LightboxTrigger` (a click on an image in a message, a keyboard shortcut), has no trigger to go back to: pass `finalFocus={openerRef}`, a ref to what opened it, so focus returns there when it closes.
- Focus is trapped in the lightbox in both `modal` and document mode; the page under it is hidden from assistive technology (`aria-hidden`), not made `inert`.
- Give `LightboxClose`, each `LightboxNavigationButton` and each icon-only action an `aria-label`: "Close", "Previous image", "Next image", "Download".
- Bind the Left and Right arrow keys to previous and next while the lightbox is open.
- Give each `LightboxThumbnail` an `aria-label` ("Show product-shot.png"). `active` changes only how it looks: mark the shown one with `aria-current="true"`.
- Give the image an `alt` that describes it, and an `iframe` a `title`.

## Rules

- Don't build a media viewer from a Dialog, and don't put anything other than media or a file preview in a Lightbox.
- Give the lightbox one close button, at the top right ([Navigation](../../../../../design/patterns/navigation.md#closing)).
- In the toolbar, a framed button ends its shape on the 16px margin; a frameless icon button, as the last action or the close, ends its icon box there and its hit area hangs past it ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)).
- In Raft Chat every file opens in the attachment shell, images included, so each file type has the same toolbar ([File viewer](../../../../../design/components/overview.md#file-viewer)).
- Don't give a lightbox or its parts a z-index of your own: raft-ui sets the order of the lightbox, the dialogs, the toasts and the popups inside it ([Layer order](../../../../../design/foundations/elevation.md#layer-order)), and a number of the app's own puts the lightbox above or below popups it doesn't know about.
- Don't add colors or lines beyond the scrim, the info bar and the toolbar ([Built from existing parts](../../../../../design/components/overview.md#built-from-existing-parts)).
