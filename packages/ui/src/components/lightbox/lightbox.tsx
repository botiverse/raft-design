import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useHotkey } from "@tanstack/react-hotkeys";
import { createContext, useCallback, useContext, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode, RefObject } from "react";
import { cn } from "../../lib/cn";
import type { SlotElementProps } from "../../lib/data-attributes";
import { headEdgePull } from "../../lib/head-edges";
import { OverlayLayerProvider, useParentOverlayKind } from "../../lib/overlay-depth";
import { tv } from "../../lib/tv";
import { useMergedRef } from "../../lib/use-merged-ref";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { Button } from "../button/button";
import type { ButtonProps } from "../button/button";
import { ScrollArea } from "../scroll-area/scroll-area";
import type { ScrollAreaProps } from "../scroll-area/types";

const lightbox = tv({
  slots: {
    portal: ["relative isolate z-lightbox"],
    backdrop: ["fixed inset-0 bg-layer-backdrop data-closed:hidden"],
    content: [
      "pointer-events-none fixed inset-0 flex flex-col data-closed:hidden",
      // Image shell: Close as a direct Content child pins top-right.
      // Use data-lightbox-close — Button overwrites data-slot to "button".
      "*:data-lightbox-close:pointer-events-auto *:data-lightbox-close:absolute *:data-lightbox-close:z-raised",
      "*:data-lightbox-close:top-[calc(16px+env(safe-area-inset-top,0px))] *:data-lightbox-close:right-[calc(16px+env(safe-area-inset-right,0px))]",
    ],
    // In-flow chrome: title + actions row.
    header: [
      "pointer-events-auto shrink-0",
      "flex items-center gap-3 pb-3",
      "pt-[calc(env(safe-area-inset-top,0px)+--spacing(3))]",
      "pl-[calc(env(safe-area-inset-left,0px)+--spacing(4))]",
      "pr-[calc(env(safe-area-inset-right,0px)+--spacing(4))]",
      "bg-transparent shadow-none",
      headEdgePull,
    ],
    // Attachment header: left Meta, right Actions. Close stays in-flow here.
    toolbar: [
      "pointer-events-auto shrink-0 flex items-center gap-3",
      // The header height (44px with a mouse on a desktop, 56px otherwise), as every head.
      "h-[calc(var(--header-height)+env(safe-area-inset-top,0px))] pt-[env(safe-area-inset-top,0px)]",
      "pl-[calc(16px+env(safe-area-inset-left,0px))] pr-[calc(16px+env(safe-area-inset-right,0px))]",
      "**:data-lightbox-close:static **:data-lightbox-close:inset-auto",
      "**:data-lightbox-close:top-auto **:data-lightbox-close:right-auto",
      "border-b border-line-seam bg-layer-canvas shadow-none",
      headEdgePull,
    ],
    headerMeta: ["flex min-w-0 flex-1 items-center gap-1.5"],
    headerLabel: [
      "inline-flex shrink-0 items-center px-1.5",
      "h-[22px] rounded-chip bg-fill-muted py-0",
      "font-sans text-caption font-semibold normal-case tracking-normal text-foreground-muted",
    ],
    title: ["min-w-0 flex-1 truncate", "py-0 font-sans text-headline font-bold text-foreground"],
    actions: [
      "flex shrink-0 items-center",
      "gap-1",
      "[&>[data-icon-inset]:nth-last-child(1_of_:not([data-base-ui-focus-guard],[aria-owns]))]:-mr-icon-inset",
    ],
    body: [
      "pointer-events-auto min-h-0 flex-1 overscroll-contain",
      "bg-layer-canvas",
      "focus-visible:shadow-none focus-visible:keyboard:outline-2 focus-visible:keyboard:-outline-offset-2 focus-visible:keyboard:outline-foreground",
    ],
    bodyContent: [
      "pr-[env(safe-area-inset-right,0px)] pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)]",
    ],
    stage: [
      "pointer-events-none relative flex min-h-0 flex-1 items-center justify-center overflow-hidden",
    ],
    media: ["pointer-events-auto max-h-[80vh] max-w-[86vw] border-0 bg-transparent shadow-none"],
    navigationButton: [
      "pointer-events-auto absolute z-raised inline-flex items-center justify-center",
      "transition-[background-color,color,opacity,box-shadow,transform] duration-150",
      "outline-[1px] outline-offset-2 outline-transparent",
      "data-[disabled=true]:cursor-default",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "size-11 rounded-control border-[1.5px] border-line-strong bg-layer-card text-foreground shadow-none",
      "hover:overlay-medium active:overlay-medium",
      "focus-visible:outline-transparent focus-visible:shadow-focus",
      "[&_svg]:size-5.5",
    ],
    infoDock: [
      "pointer-events-none absolute right-6 bottom-20 left-6 z-raised flex justify-center",
    ],
    infoBar: [
      "pointer-events-auto flex items-center",
      "w-[clamp(144px,20vw,224px)] max-w-[calc(100vw-48px)] min-w-36",
      "gap-2 rounded-container py-1 pr-1 pl-2.5",
      "bg-layer-popover text-foreground shadow-float ring-1 ring-line-seam",
    ],
    infoTitle: ["min-w-0 flex-1 truncate", "font-sans text-footnote font-semibold text-foreground"],
    infoActions: [
      "flex shrink-0 items-center",
      "gap-1",
      "*:data-[slot=button]:h-7 *:data-[slot=button]:w-auto *:data-[slot=button]:min-w-7",
      "*:data-[slot=button]:rounded-chip",
      "*:data-[slot=button]:after:inset-x-[-3px] *:data-[slot=button]:first:after:left-[-9.5px] *:data-[slot=button]:last:after:right-[-9.5px]",
      "pointer-coarse:*:data-[slot=button]:after:inset-y-[-9.5px]",
    ],
    thumbnailStrip: [
      "pointer-events-none absolute right-0 bottom-4 left-0 z-raised",
      "flex items-center justify-center gap-1.5",
    ],
    thumbnail: [
      "group/lightbox-thumb pointer-events-auto relative size-12 overflow-hidden",
      "transition-[border-color,opacity,box-shadow] duration-150",
      "[&_img]:pointer-events-none [&_img]:size-full [&_img]:object-cover",
      "rounded-control border-[1.5px] opacity-100 shadow-none",
      "border-sticker-paper/40 hover:border-sticker-paper/80",
      "data-active:border-sticker-paper",
    ],
    thumbnailOverlay: [
      "pointer-events-none absolute inset-0 block transition-colors duration-150",
      "bg-layer-backdrop-nested group-hover/lightbox-thumb:bg-layer-backdrop-nested/70",
      "group-data-active/lightbox-thumb:bg-transparent",
    ],
    close: ["pointer-events-auto"],
  },
  variants: {
    nested: {
      true: { backdrop: ["bg-layer-backdrop-nested"] },
    },
  },
});

// The root's `modal`, for LightboxContent's focus defaults.
const LightboxModalContext = createContext<LightboxProps["modal"]>(true);

export type LightboxProps<Payload = unknown> = Omit<
  Dialog.Root.Props<Payload>,
  "actionsRef" | "children" | "handle" | "modal"
> & {
  children?: ReactNode;
  /**
   * Whether Cmd+W (Ctrl+W) closes the lightbox instead of the browser tab.
   * @default true
   */
  closeOnModW?: boolean;
  /**
   * How the lightbox holds the page while it is open.
   * - `true`: focus is trapped in it and the page's scroll is locked. For an
   *   image or a preview that fits the window.
   * - `"trap-focus"`: document mode, for a file read top to bottom (a PDF, a
   *   document, a diagram). Focus is still trapped, but the page's scroll is
   *   not locked: the document's own body scrolls, and Base UI's lock would
   *   only rewrite the page's `<html>` and `<body>` styles under it, again on
   *   every resize. The scrim still covers the page.
   * - `false`: nothing is held; focus can leave the lightbox.
   *
   * In every mode the content is neither `inert` nor hidden, so the browser's
   * find in page reaches it.
   * @default true
   */
  modal?: boolean | "trap-focus";
};

/**
 * A full-screen viewer over the scrim for images and attachment previews,
 * with previous and next, thumbnails and one button to close. Pass
 * `modal="trap-focus"` for a file read top to bottom (document mode).
 */
export function Lightbox<Payload = unknown>({
  closeOnModW = true,
  defaultOpen = false,
  modal = true,
  onOpenChange,
  open,
  children,
  ...props
}: LightboxProps<Payload>) {
  const dialogRef = useRef<Dialog.Root.Actions>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const effectiveOpen = open ?? uncontrolledOpen;

  const handleOpenChange = useCallback<NonNullable<Dialog.Root.Props<Payload>["onOpenChange"]>>(
    (nextOpen, eventDetails) => {
      if (open === undefined) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen, eventDetails);
    },
    [onOpenChange, open],
  );

  const modWClose =
    closeOnModW && effectiveOpen ? <LightboxModWClose dialogRef={dialogRef} /> : null;

  return (
    <Dialog.Root
      actionsRef={dialogRef}
      defaultOpen={defaultOpen}
      modal={modal}
      onOpenChange={handleOpenChange}
      open={open}
      {...props}
    >
      {modWClose}
      {/* The lightbox draws its scrim in every mode, so it is a modal surface
          for what opens from it, and stacks on the one it opens from
          (elevation.md#stacked-overlays). */}
      <OverlayLayerProvider kind="dialog" modal>
        <LightboxModalContext.Provider value={modal}>{children}</LightboxModalContext.Provider>
      </OverlayLayerProvider>
    </Dialog.Root>
  );
}

type LightboxModWCloseProps = {
  dialogRef: RefObject<Dialog.Root.Actions | null>;
};

function LightboxModWClose({ dialogRef }: LightboxModWCloseProps) {
  useHotkey(
    "Mod+W",
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      dialogRef.current?.close();
    },
    {
      meta: {
        name: "Close lightbox",
        description: "Close the active lightbox before the browser closes the tab.",
      },
    },
  );

  return null;
}

export type LightboxTriggerProps = Dialog.Trigger.Props;

export function LightboxTrigger(props: LightboxTriggerProps) {
  return <Dialog.Trigger data-slot="lightbox-trigger" {...props} />;
}

export type LightboxPortalProps = StyledProps<Dialog.Portal.Props>;

/**
 * The lightbox's own stacking context, at `z-lightbox` (70) above the page's dialogs
 * and popups: the scrim, the content, and every Base UI popup opened from
 * inside, which Base UI portals into this element by default, in DOM order.
 * A popup's own `z-popup` then counts inside the lightbox, so it is drawn above
 * the content instead of under the scrim, and a press on it is a press inside
 * the lightbox.
 */
export function LightboxPortal({ className, ...props }: LightboxPortalProps) {
  const { portal } = lightbox();
  return (
    <Dialog.Portal
      data-slot="lightbox-portal"
      {...useThemeScopeProps({ ...props, className: portal({ className }) })}
    />
  );
}

export type LightboxContentProps = StyledProps<Dialog.Popup.Props>;

const BODY_SELECTOR = '[data-slot="lightbox-body"]';

/** The browser's own steps: an arrow key's line, and the share of the view a page keeps. */
const LINE_STEP = 40;
const PAGE_FRACTION = 0.875;

/**
 * Where a key the browser scrolls with takes the body, or `null` for a key
 * that doesn't scroll (or is the browser's own shortcut, such as Ctrl+Page Down).
 */
function scrollKeyTarget(event: KeyboardEvent<HTMLElement>, body: HTMLElement) {
  const { altKey, ctrlKey, key, metaKey, shiftKey } = event;
  if (altKey) return null;
  const page = body.clientHeight * PAGE_FRACTION;
  const { scrollLeft: left, scrollTop: top } = body;
  const start = { left, top: 0 };
  const end = { left, top: body.scrollHeight };
  if (ctrlKey || metaKey) {
    // Cmd+Up and Cmd+Down on a Mac, Ctrl+Home and Ctrl+End elsewhere.
    if (key === "ArrowUp" || key === "Home") return start;
    if (key === "ArrowDown" || key === "End") return end;
    return null;
  }
  switch (key) {
    case "ArrowUp":
      return { left, top: top - LINE_STEP };
    case "ArrowDown":
      return { left, top: top + LINE_STEP };
    case "ArrowLeft":
      return { left: left - LINE_STEP, top };
    case "ArrowRight":
      return { left: left + LINE_STEP, top };
    case "PageUp":
      return { left, top: top - page };
    case "PageDown":
      return { left, top: top + page };
    case " ":
      return { left, top: shiftKey ? top - page : top + page };
    case "Home":
      return start;
    case "End":
      return end;
    default:
      return null;
  }
}

/** Whether `element` takes the key itself: a text field edits with it, a button presses with Space. */
function takesKey(element: Element, key: string) {
  if (element instanceof HTMLElement && element.isContentEditable) return true;
  if (element.closest("input, textarea, select")) return true;
  return key === " " && element.closest('button, summary, [role="button"]') !== null;
}

/** Whether `element`, or a parent of it inside `popup`, scrolls: the browser scrolls that one. */
function inScroller(element: Element, popup: Element) {
  for (let node: Element | null = element; node && node !== popup; node = node.parentElement) {
    const { overflowX, overflowY } = getComputedStyle(node);
    if (/auto|scroll/.test(overflowY) && node.scrollHeight > node.clientHeight) return true;
    if (/auto|scroll/.test(overflowX) && node.scrollWidth > node.clientWidth) return true;
  }
  return false;
}

/**
 * Document mode doesn't lock the page, so a key that would scroll it from
 * outside the body (focus on a toolbar button, or on the content after a tap)
 * scrolls `LightboxBody` instead, and never the page under the scrim. A key
 * from inside a scroller is that scroller's; a key a control uses, or one a
 * handler already took (a menu's arrows), is left alone. A popup opened
 * inside is portaled beside the content, so its keys never come here.
 */
function routeScrollKey(event: KeyboardEvent<HTMLElement>) {
  const popup = event.currentTarget;
  const target = event.target as Element;
  if (event.defaultPrevented || !popup.contains(target)) return;
  if (takesKey(target, event.key) || inScroller(target, popup)) return;
  const body = popup.querySelector<HTMLElement>(BODY_SELECTOR);
  // Without a body of its own (a ScrollArea of the caller's), the key does nothing.
  const to = scrollKeyTarget(event, body ?? popup);
  if (to === null) return;
  event.preventDefault();
  body?.scrollTo(to);
}

/**
 * The full-screen layer, with the scrim behind it. Popups opened inside it
 * are drawn above it (`LightboxPortal`). `initialFocus` and `finalFocus` are
 * `false` by default, so focus doesn't move when it opens or closes, except
 * in document mode (`modal="trap-focus"`): focus moves into the lightbox when
 * it opens and back to `LightboxTrigger` when it closes. It lands on
 * `LightboxBody`, so the keys that scroll scroll the document at once; on the
 * first control when there is no body; and on the lightbox itself after a
 * tap, so a phone shows no ring and opens no keyboard. A key that would
 * scroll the page under the scrim scrolls the body instead.
 *
 * A lightbox opened from state passes `finalFocus={openerRef}` so focus goes
 * back to what opened it.
 */
export function LightboxContent({
  className,
  initialFocus,
  finalFocus,
  onKeyDown,
  ref,
  ...props
}: LightboxContentProps) {
  const documentMode = useContext(LightboxModalContext) === "trap-focus";
  const nested = useParentOverlayKind() != null;
  const { backdrop, content } = lightbox({ nested });
  const [setRef, getRef] = useMergedRef<HTMLDivElement>(ref);
  // Base UI's own default, with LightboxBody first: the popup after a tap,
  // otherwise the body, otherwise the first control (`true`).
  const documentInitialFocus = useCallback(
    (openType: string) => {
      const popup = getRef();
      if (openType === "touch") return popup;
      return popup?.querySelector<HTMLElement>(BODY_SELECTOR) ?? true;
    },
    [getRef],
  );
  const handleKeyDown = useCallback<NonNullable<LightboxContentProps["onKeyDown"]>>(
    (event) => {
      onKeyDown?.(event);
      if (documentMode) routeScrollKey(event);
    },
    [documentMode, onKeyDown],
  );
  return (
    <LightboxPortal>
      {/* Always rendered: Base UI skips the backdrop of a dialog opened under
          another, which left a lightbox opened from a dialog without a scrim. */}
      <Dialog.Backdrop
        data-slot="lightbox-backdrop"
        data-nested={nested ? "" : undefined}
        forceRender
        className={backdrop()}
      />
      <Dialog.Popup
        data-slot="lightbox-content"
        ref={setRef}
        initialFocus={initialFocus ?? (documentMode ? documentInitialFocus : false)}
        finalFocus={finalFocus ?? documentMode}
        className={content({ className })}
        onKeyDown={handleKeyDown}
        {...props}
      />
    </LightboxPortal>
  );
}

export type LightboxHeaderProps = useRender.ComponentProps<"div">;

export function LightboxHeader({ render, className, ...props }: LightboxHeaderProps) {
  const { header } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-header",
    },
  });
}

export type LightboxToolbarProps = useRender.ComponentProps<"div">;

export function LightboxToolbar({ render, className, ...props }: LightboxToolbarProps) {
  const { toolbar } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: toolbar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-toolbar",
    },
  });
}

export type LightboxHeaderMetaProps = useRender.ComponentProps<"div">;

export function LightboxHeaderMeta({ render, className, ...props }: LightboxHeaderMetaProps) {
  const { headerMeta } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: headerMeta({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-header-meta",
    },
  });
}

export type LightboxHeaderLabelProps = useRender.ComponentProps<"span">;

export function LightboxHeaderLabel({ render, className, ...props }: LightboxHeaderLabelProps) {
  const { headerLabel } = lightbox();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: headerLabel({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "lightbox-header-label",
    },
  });
}

export type LightboxTitleProps = useRender.ComponentProps<"div">;

export function LightboxTitle({ render, className, ...props }: LightboxTitleProps) {
  const { title } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: title({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-title",
    },
  });
}

export type LightboxActionsProps = useRender.ComponentProps<"div">;

export function LightboxActions({ render, className, ...props }: LightboxActionsProps) {
  const { actions } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-actions",
    },
  });
}

export type LightboxBodyProps = Omit<ScrollAreaProps, "overscroll">;

/**
 * The scrolling body of a document-mode lightbox (`modal="trap-focus"`),
 * under `LightboxToolbar`: a ScrollArea that fills the rest of the content
 * (`min-h-0 flex-1`) on `layer-canvas`, the toolbar's surface. Pass a
 * `className` for another surface (`bg-layer-sidebar`). It takes the pointer
 * back from `LightboxContent`, which lets it through to the scrim, and never
 * passes a scroll on to the page under the scrim (`overscroll-contain`, also
 * while it has nothing to scroll; `overscroll-none` in `className` also stops
 * the bounce). Every other ScrollArea prop, `render` included, is the area's.
 *
 * It is a tab stop even when it has nothing to scroll (`tabIndex={0}`), as it
 * takes focus when the lightbox opens, and draws its focus ring inside its
 * edge, which is the window's. Its content keeps clear of a phone's safe
 * areas at the bottom and the sides, around the caller's own content box
 * (`contentClassName`), so the scrollbar stays at the edge.
 */
export function LightboxBody({
  children,
  className,
  contentClassName,
  contentStyle,
  ...props
}: LightboxBodyProps) {
  const { body, bodyContent } = lightbox();
  return (
    <ScrollArea
      data-slot="lightbox-body"
      tabIndex={0}
      {...props}
      className={body({ className })}
      contentClassName={bodyContent()}
    >
      {contentClassName !== undefined || contentStyle !== undefined ? (
        <div data-slot="lightbox-body-content" className={contentClassName} style={contentStyle}>
          {children}
        </div>
      ) : (
        children
      )}
    </ScrollArea>
  );
}

export type LightboxStageProps = useRender.ComponentProps<"div">;

export function LightboxStage({ render, className, ...props }: LightboxStageProps) {
  const { stage } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: stage({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-stage",
    },
  });
}

export type LightboxMediaProps = useRender.ComponentProps<"div">;

export function LightboxMedia({ render, className, ...props }: LightboxMediaProps) {
  const { media } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: media({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-media",
    },
  });
}

export type LightboxNavigationButtonProps = Omit<
  ButtonProps,
  "disabled" | "loading" | "size" | "variant"
> & {
  direction: "next" | "previous";
  disabled?: boolean;
};

export function LightboxNavigationButton({
  className,
  direction,
  disabled,
  onClick,
  type = "button",
  ...props
}: LightboxNavigationButtonProps) {
  const { navigationButton } = lightbox();

  const handleClick = useCallback<NonNullable<ButtonProps["onClick"]>>(
    (event) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    },
    [disabled, onClick],
  );

  return (
    <Button
      aria-disabled={disabled}
      className={navigationButton({
        className: cn(direction === "previous" ? "left-8" : "right-8", className),
      })}
      data-disabled={disabled ? "true" : undefined}
      data-slot="lightbox-navigation-button"
      data-direction={direction}
      onClick={handleClick}
      size="icon-lg"
      type={type}
      variant="outline"
      {...props}
    />
  );
}

export type LightboxInfoDockProps = useRender.ComponentProps<"div">;

export function LightboxInfoDock({ render, className, ...props }: LightboxInfoDockProps) {
  const { infoDock } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoDock({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-dock",
    },
  });
}

export type LightboxInfoBarProps = useRender.ComponentProps<"div">;

export function LightboxInfoBar({ render, className, ...props }: LightboxInfoBarProps) {
  const { infoBar } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoBar({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-bar",
    },
  });
}

export type LightboxInfoTitleProps = useRender.ComponentProps<"div">;

export function LightboxInfoTitle({ render, className, ...props }: LightboxInfoTitleProps) {
  const { infoTitle } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoTitle({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-title",
    },
  });
}

export type LightboxInfoActionsProps = useRender.ComponentProps<"div">;

export function LightboxInfoActions({ render, className, ...props }: LightboxInfoActionsProps) {
  const { infoActions } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: infoActions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-info-actions",
    },
  });
}

export type LightboxThumbnailStripProps = useRender.ComponentProps<"div">;

export function LightboxThumbnailStrip({
  render,
  className,
  ...props
}: LightboxThumbnailStripProps) {
  const { thumbnailStrip } = lightbox();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: thumbnailStrip({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "lightbox-thumbnail-strip",
    },
  });
}

export type LightboxThumbnailProps = useRender.ComponentProps<"button"> & {
  active?: boolean;
};

export function LightboxThumbnail({
  active = false,
  className,
  render,
  type = "button",
  children,
  ...props
}: LightboxThumbnailProps) {
  const { thumbnail, thumbnailOverlay } = lightbox();

  const defaultProps: SlotElementProps<"button"> = {
    type,
    "data-slot": "lightbox-thumbnail",
    "data-active": active ? "true" : undefined,
    className: thumbnail({ className }),
    children: (
      <>
        {children}
        <span
          aria-hidden="true"
          data-slot="lightbox-thumbnail-overlay"
          className={thumbnailOverlay()}
        />
      </>
    ),
  };

  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(defaultProps, props),
  });
}

export type LightboxCloseProps = StyledProps<Dialog.Close.Props>;

export function LightboxClose({ className, render, ...props }: LightboxCloseProps) {
  const { close } = lightbox();

  return (
    <Dialog.Close
      data-lightbox-close=""
      data-slot="lightbox-close"
      className={close({ className })}
      render={render ?? <Button type="button" variant="outline" size="icon-lg" />}
      {...props}
    />
  );
}
