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
| A decision, a form or anything that is not media                    | [Dialog](../dialog/dialog.md)                                    |
| Details people read beside the page                                 | [Drawer](../drawer/drawer.md)                                    |
| The attachment in the message itself                                | [MessageAttachment](../message-attachment/message-attachment.md) |

## Anatomy

- `Lightbox`: the root. It holds whether the lightbox is open. Required.
- `LightboxTrigger`: what opens it, usually the image or the file card in the message.
- `LightboxContent`: the full-screen layer, with the scrim behind it. Required.
- `LightboxTitle`: the file name.
- `LightboxClose`: the close button. Required.
- `LightboxStage`: the area that centers the media. Required.
  - `LightboxMedia`: the image or video, at most 80% of the window's height and 86% of its width.
  - `LightboxNavigationButton`: previous (`direction="previous"`) and next (`direction="next"`), 44px buttons 32px from the left and right edges.
  - `LightboxInfoDock` with `LightboxInfoBar`: a small floating bar near the bottom, on `layer-popover` with `shadow-float`, holding `LightboxInfoTitle` (the file name) and `LightboxInfoActions` (such as Download). It is a floating toolbar, 36px tall like the message hover toolbar: its buttons are 28px, 4px inside it and 4px apart, with `radius-chip`, and a 44px tall hit area on a touch screen that reaches only half the gap toward a neighbour ([Shape](../../../../../design/foundations/shape.md#inside-a-frame)).
  - `LightboxThumbnailStrip` with `LightboxThumbnail`s: 48px thumbnails along the bottom; `active` marks the one shown.
- `LightboxToolbar`: the attachment shell's top bar instead of the floating close button, on `layer-canvas` with a `line-seam` under it. It holds `LightboxHeaderMeta` (a `LightboxHeaderLabel` or [Badge](../badge/badge.md) naming the preview type, then `LightboxTitle`) and `LightboxActions`, with `LightboxClose` last.
- `LightboxHeader`: a plain top row for a title and actions, for shells that need neither toolbar nor floating close.

## Variants

| Variant                                                    | Use for                                                                                                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Image shell: `LightboxClose` directly in `LightboxContent` | Images and video. The close button floats at the top right; the image has the whole window                                                      |
| Attachment shell: `LightboxToolbar` above `LightboxStage`  | A file preview that fills the stage, such as an HTML page in an `iframe`. The toolbar names the file and holds its actions and the close button |

```example
lightbox/compositions/attachment-preview-shell
```

## States

- **First and last item:** previous or next is disabled. It stays focusable (`aria-disabled`) and ignores clicks.
- **Thumbnails:** the shown item has a solid edge; the others are dimmed with `layer-backdrop-nested` (40%), 28% on hover. The strip lies on `layer-backdrop`, dark in both modes, so the nested scrim dims a thumbnail the same way in light and dark mode ([Surfaces](../../../../../design/foundations/color.md#surfaces)).

## Behavior

- A lightbox appears and disappears without animation, like the other centered overlays ([Motion](../../../../../design/foundations/motion.md#usage)).
- Esc, the close button, a click on the scrim and Cmd+W (Ctrl+W) close it. Cmd+W closes the lightbox, not the browser tab; pass `closeOnModW={false}` to leave the shortcut to the browser.
- The close button and the bars keep clear of the phone's safe areas.
- The caller keeps which item is shown. Previous, next, the thumbnails and the arrow keys all change that index.

## Content

- Title the lightbox with the file name. A long name truncates at the end.
- Name the preview type in the toolbar's label in sentence case: HTML preview.

## Accessibility

- Lightbox wraps the Base UI Dialog. It provides the `dialog` role, the focus trap and Esc; raft-ui adds the Cmd+W shortcut.
- `LightboxTitle` is plain text, not the dialog's name. Name the dialog yourself: `aria-label` on `LightboxContent`, or a `render` element with one.
- `LightboxContent` doesn't move focus when it opens or return it when it closes (`initialFocus` and `finalFocus` are `false`). Pass them when keyboard users open the lightbox, so focus lands in it and goes back to the trigger.
- Give `LightboxClose`, each `LightboxNavigationButton` and each icon-only action an `aria-label`: "Close", "Previous image", "Next image", "Download".
- Bind the Left and Right arrow keys to previous and next while the lightbox is open.
- Give each `LightboxThumbnail` an `aria-label` ("Show product-shot.png"). `active` changes only how it looks: mark the shown one with `aria-current="true"`.
- Give the image an `alt` that describes it, and an `iframe` a `title`.

## Rules

- Don't build a media viewer from a Dialog, and don't put anything other than media or a file preview in a Lightbox.
- Give the lightbox one close button, at the top right ([Navigation](../../../../../design/patterns/navigation.md#closing)).
- In the toolbar, a framed button ends its shape on the 16px margin; a frameless icon button, as the last action or the close, ends its icon box there and its hit area hangs past it ([Alignment](../../../../../design/foundations/alignment.md#the-ends-of-a-header)).
- In Raft Chat every file opens in the attachment shell, images included, so each file type has the same toolbar ([File viewer](../../../../../design/components/overview.md#file-viewer)).
- Don't add colors or lines beyond the scrim, the info bar and the toolbar ([Built from existing parts](../../../../../design/components/overview.md#built-from-existing-parts)).
