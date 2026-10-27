import { cn } from "../../lib/cn";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ArrowLeft, X } from "lucide-react";
import { Children, createContext, isValidElement, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { decisionWidth } from "../../lib/decision-width";
import { headEdgePull } from "../../lib/head-edges";
import { stackedActions, useStackedActions } from "../../lib/stacked-actions";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useParentOverlayKind, withOverlayLayer } from "../../lib/overlay-depth";
import { Button } from "../button/index";
import { TextLink } from "../text-link/index";
import type { ButtonProps } from "../button/index";
import { PanelAction } from "../panel/panel-action";
import type { PanelActionProps } from "../panel/panel-action";
import {
  DialogSheetHeadContext,
  DialogSheetReset,
  dialogSheet,
  useDialogSheet,
  useInDialogSheetHead,
} from "./dialog-sheet-context";

const dialog = tv({
  slots: {
    // A centred modal appears and goes without motion (Raft DS: only sheets
    // slide; a dialog is simply there).
    overlay: ["fixed inset-0 z-50 bg-layer-backdrop"],
    content: [
      "fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] -translate-1/2 flex-col",
      "max-h-[calc(100dvh-2rem)] outline-none",
      "overflow-clip rounded-dialog bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    header: [
      "grid shrink-0 grid-cols-[minmax(0,1fr)_max-content] items-center min-w-0",
      "gap-2 px-5 pt-5",
      headEdgePull,
    ],
    body: [
      "min-w-0 flex-1 overflow-y-auto",
      "px-5 pt-1.5 pb-5 first:pt-5",
      "font-sans text-subhead text-foreground-muted",
    ],
    // One row at the end, Cancel then commit, on a phone as on a desktop
    // (stdrc, 2026-10-22). It stacks full width only when the row doesn't fit
    // on one line (stackedActions, `data-stacked`): the commit button on top.
    footer: [
      "flex shrink-0 items-center justify-end",
      ...stackedActions,
      "gap-2 px-5 pb-5 first:pt-5 [[data-slot=dialog-header]+&]:pt-5",
      "*:data-[slot=text-link]:text-footnote",
    ],
    footerNote: [
      "m-0 md:me-2 md:flex-1",
      "text-start font-sans text-footnote text-pretty text-foreground-muted md:whitespace-nowrap",
    ],
    // With a note or a link at the start, the buttons are one group: it sits
    // beside the start item when both fit on the line and wraps under it,
    // still at the end, when they don't. It stacks only when the buttons
    // alone don't fit. The note is never cut and the buttons never leave the
    // padding.
    footerActions: [
      "ms-auto flex shrink-0 items-center justify-end gap-2",
      ...stackedActions,
      "data-stacked:ms-0 data-stacked:w-full",
    ],
    title: ["m-0 min-w-0 text-foreground", "font-sans text-headline font-bold"],
    description: ["m-0", "font-sans text-subhead text-foreground-muted"],
  },
  variants: {
    size: {
      // Chosen by content (dialog.md#variants): sm a decision, at the width of
      // AlertDialog; md a small task; lg content that needs width.
      sm: { content: [decisionWidth] },
      md: { content: ["max-w-md"] },
      lg: { content: ["max-w-160"] },
      // A bigger form edited in one go: a fixed-height frame whose head and
      // commit row stay put while its body scrolls (use the `bar` parts).
      wide: { content: ["max-w-4xl h-[min(760px,calc(100dvh-2rem))]"] },
    },
    // Pinned bars for a scrolling dialog: the head a 56px row with a seam
    // under it, the footer a commit row with a seam over it, the body flush
    // so the content lays out its own columns and scrolls inside.
    bar: {
      false: {},
      true: {
        header: [
          "flex h-14 shrink-0 items-center gap-2 border-b px-5 py-0",
          "border-line-seam pt-0 [&>[data-slot=dialog-close]]:my-0",
        ],
        body: [
          "flex min-h-0 flex-1 overflow-hidden p-0",
          "px-0 pt-0 pb-0 first:pt-0 text-foreground",
        ],
        footer: [
          "shrink-0 border-t px-5 py-3",
          "border-line-seam pt-3 pb-3 first:pt-3 [[data-slot=dialog-header]+&]:pt-3",
        ],
      },
    },
    layer: {
      0: { overlay: [], content: [] },
      1: { overlay: ["z-60"], content: ["z-60"] },
    },
    // Opened from another modal surface (a sheet or a dialog): a lighter scrim
    // of its own, so what is below steps back without going black.
    nested: {
      false: {},
      true: { overlay: ["bg-layer-backdrop-nested"] },
    },
    start: {
      false: {},
      true: { footer: ["flex-wrap justify-between"] },
    },
  },
  defaultVariants: {
    size: "md",
    bar: false,
  },
});

export type DialogProps = BaseDialog.Root.Props;

export function Dialog({ children, ...props }: DialogProps) {
  return (
    <BaseDialog.Root data-slot="dialog" {...props}>
      {withOverlayLayer("dialog", props.modal !== false, children)}
    </BaseDialog.Root>
  );
}

export type DialogTriggerProps = BaseDialog.Trigger.Props;

export function DialogTrigger(props: DialogTriggerProps) {
  return <BaseDialog.Trigger data-slot="dialog-trigger" {...props} />;
}

export type DialogPortalProps = BaseDialog.Portal.Props;

export function DialogPortal(props: DialogPortalProps) {
  return <BaseDialog.Portal data-slot="dialog-portal" {...useThemeScopeProps(props)} />;
}

export type DialogOverlayProps = StyledProps<BaseDialog.Backdrop.Props> & {
  layer?: 0 | 1;
};

export function DialogOverlay({ className, layer, ...props }: DialogOverlayProps) {
  // Always rendered: Base UI skips the backdrop of a nested dialog, and a
  // top-level one renders it anyway. Nested, it takes the lighter scrim.
  const nested = useParentOverlayKind() != null;
  const { overlay } = dialog({ layer, nested });
  return (
    <BaseDialog.Backdrop
      data-slot="dialog-overlay"
      data-nested={nested ? "" : undefined}
      forceRender
      className={overlay({ className })}
      {...props}
    />
  );
}

// The size of the DialogContent around a part, for the parts whose rules
// depend on it (DialogFooterNote is for lg and wide dialogs only). Undefined
// outside DialogContent and when a className sets the width instead.
const DialogSizeContext = createContext<DialogContentProps["size"]>(undefined);

export type DialogContentProps = StyledProps<BaseDialog.Popup.Props> & {
  portalProps?: DialogPortalProps;
  overlay?: false | DialogOverlayProps;
  size?: "sm" | "md" | "lg" | "wide";
  layer?: 0 | 1;
};

export function DialogContent({
  className,
  children,
  portalProps,
  overlay,
  size,
  layer,
  ...props
}: DialogContentProps) {
  const { content } = dialog({ size, layer });

  const overlayProps = typeof overlay === "object" ? overlay : {};

  return (
    <DialogPortal {...portalProps}>
      {overlay === false ? null : <DialogOverlay layer={layer} {...overlayProps} />}
      <BaseDialog.Popup data-slot="dialog-content" className={content({ className })} {...props}>
        <DialogSizeContext.Provider
          value={size ?? (/(^|\s)max-w-/.test(className ?? "") ? undefined : "md")}
        >
          <DialogSheetReset>{children}</DialogSheetReset>
        </DialogSizeContext.Provider>
      </BaseDialog.Popup>
    </DialogPortal>
  );
}

export type DialogCloseProps = BaseDialog.Close.Props &
  Pick<ButtonProps, "variant" | "size"> & {
    className?: string;
    children?: ReactNode;
  };

export function DialogClose({
  className,
  variant,
  size,
  children,
  render,
  "aria-label": ariaLabel,
  ...props
}: DialogCloseProps) {
  const inSheetHead = useInDialogSheetHead();
  if (render) {
    return (
      <BaseDialog.Close data-slot="dialog-close" render={render} aria-label={ariaLabel} {...props}>
        {children}
      </BaseDialog.Close>
    );
  }

  if (inSheetHead) {
    // A phone sheet's head is a pushed page's head: × is its leading action.
    return (
      <BaseDialog.Close
        data-slot="dialog-close"
        render={<PanelAction aria-label={ariaLabel ?? "Close"} className={className} />}
        {...props}
      >
        {children ?? <X />}
      </BaseDialog.Close>
    );
  }

  return (
    <BaseDialog.Close
      data-slot="dialog-close"
      render={
        <Button
          variant={variant ?? "ghost"}
          size={size ?? "icon-md"}
          aria-label={ariaLabel ?? "Close"}
          className={cn("-my-1.5", className)}
        />
      }
      {...props}
    >
      {children ?? <X className="size-4.5" />}
    </BaseDialog.Close>
  );
}

export type DialogSheetBackProps = PanelActionProps;

/**
 * Back, in a later step of a flow drawn as a phone sheet: it takes the head's
 * start in place of × (stdrc, 2026-10-22). The sheet is a stack of steps, and
 * Back undoes one, as on a pushed page; Esc still closes. Put it in
 * `DialogHeader` beside the `DialogClose`, from the second step on; it draws
 * nothing outside a sheet, where Back stays in the footer. Its icon is
 * `arrow-left`, as every Back (Alignment, "The ends of a header").
 */
export function DialogSheetBack({
  className,
  children,
  "aria-label": ariaLabel,
  ...props
}: DialogSheetBackProps) {
  const inSheetHead = useInDialogSheetHead();
  if (!inSheetHead) return null;
  return (
    <PanelAction
      activateOnTouchEnd
      data-slot="dialog-sheet-back"
      aria-label={ariaLabel ?? "Back"}
      className={className}
      {...props}
    >
      {children ?? <ArrowLeft />}
    </PanelAction>
  );
}

export type DialogHeaderProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogHeader({ className, bar = false, children, ...props }: DialogHeaderProps) {
  const { sheet, setCommitSlot } = useDialogSheet();
  // A phone sheet: × at the start, the title, then the slot DialogCommit
  // moves the commit button into. The leading action goes first in the DOM,
  // so every browser reads and tabs the head in the order it is seen: a
  // DialogSheetBack when the step has one (it stands in for ×), or the
  // DialogClose. Only direct children are found.
  const items = sheet ? Children.toArray(children) : [];
  const backs = items.filter((item) => isValidElement(item) && item.type === DialogSheetBack);
  const closes = items.filter((item) => isValidElement(item) && item.type === DialogClose);
  const missingLeading = sheet && backs.length === 0 && closes.length === 0;
  useEffect(() => {
    if (process.env.NODE_ENV === "production" || !missingLeading) return;
    console.warn(
      "raft-ui: a DialogHeader drawn as a phone sheet has no DialogClose (or DialogSheetBack) as a direct child, so the sheet has no × at the start of its head. Put DialogClose directly in DialogHeader, not inside a Tooltip, a Fragment or a component of your own.",
    );
  }, [missingLeading]);
  if (sheet) {
    const rest = items.filter((item) => !backs.includes(item) && !closes.includes(item));
    const head = dialogSheet();
    return (
      <div
        data-slot="dialog-header"
        data-sheet=""
        className={dialog({ bar: false }).header({ className: cn(head.header(), className) })}
        {...props}
      >
        <DialogSheetHeadContext.Provider value>
          {backs.length > 0 ? backs : closes}
          {rest}
        </DialogSheetHeadContext.Provider>
        <div ref={setCommitSlot} data-slot="dialog-commit-slot" className={head.commitSlot()} />
      </div>
    );
  }
  const { header } = dialog({ bar });
  return (
    <div data-slot="dialog-header" className={header({ className })} {...props}>
      {children}
    </div>
  );
}

export type DialogBodyProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogBody({ className, bar = false, children, ...props }: DialogBodyProps) {
  const { sheet, setBodyEndSlot } = useDialogSheet();
  const { body } = dialog({ bar });
  // In a sheet a wide dialog's body scrolls as one, on the same margin: its
  // DialogNav is hidden below 768px and its sections follow one another.
  const sheetBody = sheet ? cn(bar && dialogSheet().barBody(), dialogSheet().body()) : undefined;
  return (
    <div
      data-slot="dialog-body"
      className={body({ className: sheetBody ? cn(sheetBody, className) : className })}
      {...props}
    >
      {children}
      {sheet ? (
        // The footer is hidden in a sheet: its note or link moves here.
        <div
          ref={setBodyEndSlot}
          data-slot="dialog-sheet-body-end"
          className={dialogSheet().bodyEnd()}
        />
      ) : null}
    </div>
  );
}

export type DialogFooterProps = ComponentPropsWithRef<"div"> & {
  /** A pinned bar of a scrolling (`size="wide"`) dialog. */
  bar?: boolean;
};

export function DialogFooter({
  className,
  bar = false,
  hidden,
  children,
  ref,
  ...props
}: DialogFooterProps) {
  // A phone sheet has no footer: × is Cancel and the commit sits in the head.
  // The footer still renders, hidden, so DialogCommit can move into the head;
  // its note or link moves to the end of the body. While hidden the footer
  // has no width, so useStackedActions measures nothing.
  const { sheet, bodyEndSlot } = useDialogSheet();
  const items = Children.toArray(children);
  // The quiet item at the start: a note anywhere in the footer, or a TextLink
  // written first. The buttons after it become one group.
  const start =
    items.find(
      (item) =>
        isValidElement<DialogFooterNoteProps>(item) &&
        item.type === DialogFooterNote &&
        hasNoteContent(item.props.children),
    ) ?? (isValidElement(items[0]) && items[0].type === TextLink ? items[0] : undefined);
  const [stacked, rowRef] = useStackedActions<HTMLDivElement>(
    start == null ? ref : undefined,
    start != null,
  );
  const { footer, footerActions } = dialog({ bar, start: start != null });
  const stackedProps = stacked ? { "data-stacked": "" } : {};
  if (start == null) {
    return (
      <div
        data-slot="dialog-footer"
        ref={rowRef}
        className={footer({ className })}
        hidden={sheet || hidden}
        {...stackedProps}
        {...props}
      >
        {children}
      </div>
    );
  }
  return (
    <>
      {sheet && bodyEndSlot ? createPortal(start, bodyEndSlot) : null}
      <div
        data-slot="dialog-footer"
        ref={ref}
        className={footer({ className })}
        hidden={sheet || hidden}
        {...props}
      >
        {sheet ? null : start}
        <div
          data-slot="dialog-footer-actions"
          ref={rowRef}
          className={footerActions()}
          {...stackedProps}
        >
          {items.filter((item) => item !== start)}
        </div>
      </div>
    </>
  );
}

export type DialogFooterNoteProps = ComponentPropsWithRef<"p">;

/**
 * Whether a note has anything to show: not only null, false or "", but also
 * whitespace and an empty array (`{items.map(...)}` of nothing). Numbers,
 * 0 included, and elements count.
 */
function hasNoteContent(children: ReactNode) {
  return Children.toArray(children).some(
    (child) => typeof child !== "string" || child.trim() !== "",
  );
}

/**
 * One short line at the start of `DialogFooter` that says what the commit
 * button will do ("You'll be billed $8 per member each month"). Muted footnote
 * text, start-aligned and never cut. Only in a `lg` or `wide` dialog, and at
 * most 40 characters: on a desktop it is one line beside the buttons and never
 * wraps; on a phone it goes above the buttons when they don't fit beside it,
 * and may wrap to 2 lines. In a phone sheet, which has no footer, it moves
 * to the end of the body. Longer copy belongs in the body. A footer holds a note or a `TextLink`,
 * never both.
 */
export function DialogFooterNote({ className, children, ...props }: DialogFooterNoteProps) {
  const { footerNote } = dialog();
  const size = useContext(DialogSizeContext);
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (size === "sm" || size === "md") {
      console.warn(
        `raft-ui: a DialogFooterNote is in a size="${size}" dialog. A footer note fits beside the buttons only in a size="lg" or size="wide" dialog; put the sentence in DialogBody instead.`,
      );
    }
  }, [size]);
  // An empty note draws nothing, not an empty line.
  if (!hasNoteContent(children)) return null;
  return (
    <p data-slot="dialog-footer-note" className={footerNote({ className })} {...props}>
      {children}
    </p>
  );
}

export type DialogTitleProps = StyledProps<BaseDialog.Title.Props>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  const inSheetHead = useInDialogSheetHead();
  const { title } = dialog();
  const classes = inSheetHead ? cn(dialogSheet().title(), className) : className;
  return (
    <BaseDialog.Title
      data-slot="dialog-title"
      className={title({ className: classes })}
      {...props}
    />
  );
}

export type DialogDescriptionProps = StyledProps<BaseDialog.Description.Props>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  const { description } = dialog();
  return (
    <BaseDialog.Description
      data-slot="dialog-description"
      className={description({ className })}
      {...props}
    />
  );
}

const dialogSurface = tv({
  slots: {
    root: [
      "flex min-w-0 flex-col outline-none",
      "overflow-clip rounded-dialog bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
  },
});

export type DialogSurfaceProps = useRender.ComponentProps<"div">;

/**
 * The dialog's frame — the popover layer, the dialog radius, the seam ring
 * and the float shadow — for a centred modal whose lifecycle the app owns
 * (its own backdrop, Escape and focus handling). It neither positions nor
 * animates itself: the host centres it, and a centred modal has no motion.
 * DialogContent draws the same frame for a Base UI dialog.
 */
export function DialogSurface({ className, render, children, ...props }: DialogSurfaceProps) {
  const { root } = dialogSurface();
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      { "data-slot": "dialog-surface", className: root({ className }) } as never,
      props,
      { children: <DialogSheetReset>{children}</DialogSheetReset> },
    ),
  });
}

const dialogNav = tv({
  slots: {
    root: [
      "flex shrink-0 flex-col overflow-y-auto", // A wide dialog's section list: a 208px column of sidebar rows beside
      // the scrolling body, a seam between them; a phone has no room for it.
      "w-52 gap-0.5 border-r border-line-seam p-2 max-md:hidden",
    ],
  },
});

export type DialogNavProps = useRender.ComponentProps<"nav">;

/** The section list of a wide (`size="wide"`) dialog, inside a `bar` body. */
export function DialogNav({ className, render, ...props }: DialogNavProps) {
  const { root } = dialogNav();
  return useRender({
    defaultTagName: "nav",
    render,
    props: mergeProps<"nav">(
      { "data-slot": "dialog-nav", className: root({ className }) } as never,
      props,
    ),
  });
}
