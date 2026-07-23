import { type HTMLAttributes, type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Full-screen dark-backdrop overlay for lightboxes and bottom sheets.
 *
 * Replaces the recurring pattern:
 *   <div className="fixed inset-0 z-70 flex flex-col bg-black/75" onClick={...}>
 *
 * Used in: ImageLightbox, SelectShareLightbox, MessageItem mobile reaction sheet.
 *
 * Distinct from <Modal> (centered card) — this primitive is content-agnostic:
 * callers control layout via `className` on children. Modal stays for
 * centered-card dialogs (ConfirmDialog, CreateChannelDialog, etc.).
 *
 * Body scroll lock is applied while mounted.
 *
 * Extra HTML attributes (e.g. `data-testid`) are forwarded to the backdrop div.
 */
interface LightboxProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "onClick" | "className" | "children"
> {
  onClose: () => void;
  children: ReactNode;
  /** CSS z-index. Default 70 (above Modal's z-50/z-60). */
  zIndex?: number;
  /** Tailwind bg class for the backdrop. Default "bg-black/75". */
  backdropClass?: string;
  /** Click on backdrop closes. Default true. */
  dismissOnBackdrop?: boolean;
  /** Extra classes on the backdrop div (e.g. "flex flex-col"). */
  className?: string;
  /** Positioning class for the backdrop. Default fixed viewport overlay. */
  positionClass?: string;
  /** Lock body scroll while mounted. Default true. */
  lockBodyScroll?: boolean;
  /** Scroll the overlay root into view after mount. Useful for document-flow overlays. */
  scrollIntoViewOnMount?: boolean;
}

export default function Lightbox({
  onClose,
  children,
  zIndex = 70,
  backdropClass = "bg-black/75",
  dismissOnBackdrop = true,
  className = "",
  positionClass = "fixed inset-0",
  lockBodyScroll = true,
  scrollIntoViewOnMount = false,
  ...rest
}: LightboxProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close the topmost preview before browser-level close shortcuts can close
  // the whole tab/window.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const closeShortcut =
        e.key.toLowerCase() === "w" && (e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey;
      if (e.key !== "Escape" && !closeShortcut) return;
      e.preventDefault();
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Body scroll lock
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
      ref={rootRef}
      {...rest}
      className={`${positionClass} ${backdropClass} ${className}`}
      style={{ zIndex }}
      onClick={
        dismissOnBackdrop
          ? (e) => {
              if (e.target === e.currentTarget) onClose();
            }
          : undefined
      }
    >
      {children}
    </div>,
    document.body,
  );
}
