import { Dialog } from "@base-ui/react/dialog";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Mobile bottom sheet, composed from base-ui Dialog parts and slot parts
// (`BottomSheetTrigger`, `BottomSheetContent`, `BottomSheetHeader`,
// `BottomSheetFooter`, `BottomSheetTitle`, `BottomSheetDescription`,
// `BottomSheetClose`). Dialog owns open state, the modal scroll-lock, ESC, and
// native outside-press dismissal, so unlike Lightbox there's no dim layer and
// no manual backdrop onClick: the sheet card carries the brutal frame itself.
//
// All styled parts share one `tv()` slots config so theme styling lives in a
// single place, ready for the elegant family to add per-slot overrides under
// `theme`. Each part resolves its own slot with the active theme, so they stay
// independently composable. `shadow-brutal-lg` maps to the --shadow-lg token.
const bottomSheet = tv({
  slots: {
    content: [
      "fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-50 mx-auto max-w-md",
    ],
    header: ["flex flex-col gap-1 p-4"],
    footer: ["mt-auto flex flex-col gap-2 p-4"],
    title: ["text-base font-bold text-black"],
    description: ["text-sm text-black/60"],
  },
  variants: {
    theme: {
      brutal: { content: ["border-2 border-black bg-white shadow-[var(--shadow-lg)]"] },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type BottomSheetProps = Dialog.Root.Props;

// Composition root: a thin pass-through over Dialog.Root that owns open state.
// Renders no DOM element of its own.
export function BottomSheet(props: BottomSheetProps) {
  return <Dialog.Root {...props} />;
}

export type BottomSheetTriggerProps = Dialog.Trigger.Props;

// Opens the sheet. Compose your own affordance via `render` (e.g. a Button).
export function BottomSheetTrigger(props: BottomSheetTriggerProps) {
  return <Dialog.Trigger data-slot="bottom-sheet-trigger" {...props} />;
}

export type BottomSheetPortalProps = Dialog.Portal.Props;

// Portals the sheet to the document body. BottomSheetContent wraps this for you.
export function BottomSheetPortal(props: BottomSheetPortalProps) {
  return <Dialog.Portal data-slot="bottom-sheet-portal" {...props} />;
}

export type BottomSheetContentProps = StyledProps<Dialog.Popup.Props>;

// The sheet card: portaled, anchored to the bottom safe area, centered up to
// `max-w-md`, carrying the brutal frame. `inset-x-3` + the safe-area bottom inset
// reproduce the original 12px gutter. Close affordances are composed in by the
// caller via `BottomSheetClose`.
export function BottomSheetContent({ className, ...props }: BottomSheetContentProps) {
  const theme = useTheme();
  const { content } = bottomSheet({ theme });
  return (
    <BottomSheetPortal>
      <Dialog.Popup
        data-slot="bottom-sheet-content"
        data-side="bottom"
        className={content({ className })}
        {...props}
      />
    </BottomSheetPortal>
  );
}

export type BottomSheetCloseProps = Dialog.Close.Props;

// Closes the sheet. Compose your own affordance via `render` (e.g. a Button).
export function BottomSheetClose(props: BottomSheetCloseProps) {
  return <Dialog.Close data-slot="bottom-sheet-close" {...props} />;
}

export type BottomSheetHeaderProps = useRender.ComponentProps<"div">;

// Stacks the title + description at the top of the sheet.
export function BottomSheetHeader({ className, render, ...props }: BottomSheetHeaderProps) {
  const theme = useTheme();
  const { header } = bottomSheet({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: header({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-header",
    },
  });
}

export type BottomSheetFooterProps = useRender.ComponentProps<"div">;

// Trailing action area, pushed to the bottom of the sheet.
export function BottomSheetFooter({ className, render, ...props }: BottomSheetFooterProps) {
  const theme = useTheme();
  const { footer } = bottomSheet({ theme });
  const defaultProps: useRender.ElementProps<"div"> = {
    className: footer({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "bottom-sheet-footer",
    },
  });
}

export type BottomSheetTitleProps = StyledProps<Dialog.Title.Props>;

// Accessible heading for the sheet (labels the dialog for screen readers).
export function BottomSheetTitle({ className, ...props }: BottomSheetTitleProps) {
  const theme = useTheme();
  const { title } = bottomSheet({ theme });
  return (
    <Dialog.Title data-slot="bottom-sheet-title" className={title({ className })} {...props} />
  );
}

export type BottomSheetDescriptionProps = StyledProps<Dialog.Description.Props>;

// Secondary supporting copy under the title; also the dialog's a11y description.
export function BottomSheetDescription({ className, ...props }: BottomSheetDescriptionProps) {
  const theme = useTheme();
  const { description } = bottomSheet({ theme });
  return (
    <Dialog.Description
      data-slot="bottom-sheet-description"
      className={description({ className })}
      {...props}
    />
  );
}
