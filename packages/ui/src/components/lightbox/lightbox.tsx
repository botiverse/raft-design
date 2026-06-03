import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Full-screen dark-backdrop overlay for lightboxes / bottom sheets. The source
// uses a hand-rolled portal so it can intercept Escape and Cmd/Ctrl+W before the
// browser closes the tab; those close and scroll-lock details are preserved here.
const lightbox = tv({
  slots: {
    popup: [],
  },
  variants: {
    theme: {
      brutal: {},
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
  },
});

export type LightboxProps = Omit<
  ComponentPropsWithRef<"div">,
  "onClick" | "className" | "children"
> & {
  onClose: () => void;
  children: ReactNode;
  /** CSS z-index. Default 70 (above Modal's z-50/z-[60]). */
  zIndex?: number;
  /** Tailwind bg class for the dim. Default "bg-black/75". */
  backdropClass?: string;
  /** Click on the dim area closes. Default true. */
  dismissOnBackdrop?: boolean;
  /** Extra classes on the overlay (e.g. "flex flex-col"). */
  className?: string;
  /** Positioning class for the overlay. Default fixed viewport overlay. */
  positionClass?: string;
  /** Lock body scroll while mounted. Default true. */
  lockBodyScroll?: boolean;
  /** Scroll the overlay root into view after mount. Useful for document-flow overlays. */
  scrollIntoViewOnMount?: boolean;
};

export function Lightbox({
  onClose,
  children,
  zIndex = 70,
  backdropClass = "bg-black/75",
  dismissOnBackdrop = true,
  className,
  positionClass = "fixed inset-0",
  lockBodyScroll = true,
  scrollIntoViewOnMount = false,
  ...rest
}: LightboxProps) {
  const theme = useTheme();
  const { popup } = lightbox({ theme });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const closeShortcut =
        event.key.toLowerCase() === "w" &&
        (event.metaKey || event.ctrlKey) &&
        !event.shiftKey &&
        !event.altKey;
      if (event.key !== "Escape" && !closeShortcut) return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const html = document.documentElement;
    const prevHtmlOverflow = html.style.overflow;
    const prevHtmlHeight = html.style.height;
    const prevBodyOverflow = document.body.style.overflow;
    const prevBodyHeight = document.body.style.height;

    if (lockBodyScroll) {
      document.body.style.overflow = "hidden";
    } else {
      html.style.overflow = "auto";
      html.style.height = "auto";
      document.body.style.overflow = "auto";
      document.body.style.height = "auto";
    }

    return () => {
      html.style.overflow = prevHtmlOverflow;
      html.style.height = prevHtmlHeight;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.height = prevBodyHeight;
    };
  }, [lockBodyScroll]);

  useEffect(() => {
    if (!scrollIntoViewOnMount) return;
    rootRef.current?.scrollIntoView({ block: "start" });
  }, [scrollIntoViewOnMount]);

  return createPortal(
    <div
      {...rest}
      ref={rootRef}
      data-slot="lightbox"
      className={popup({ className: [positionClass, backdropClass, className] })}
      style={{ zIndex }}
      onClick={
        dismissOnBackdrop
          ? (event) => {
              if (event.target === event.currentTarget) onClose();
            }
          : undefined
      }
    >
      {children}
    </div>,
    document.body,
  );
}
