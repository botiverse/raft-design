import { type ReactNode, type MouseEvent, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable modal backdrop with centered content.
 * Backdrop clicks do not close by default to avoid losing in-progress form input.
 * Pass `closeOnBackdrop` to opt specific lightweight modals back in.
 * Use `layer` prop for stacking: layer=0 (default) → z-50, layer=1 → z-[60].
 *
 * Renders via portal to document.body so modals aren't clipped or repositioned
 * by parent containers with CSS transforms (e.g. mobile sidebar drawer).
 */
export default function Modal({
  onClose,
  children,
  layer = 0,
  closeOnBackdrop = false,
}: {
  onClose: () => void;
  children: ReactNode;
  layer?: number;
  closeOnBackdrop?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // keydown-focus-on-open
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Move focus into the overlay on open so a focused background element (e.g.
  // the message composer, which preventDefaults Enter) can't swallow keys meant
  // for this modal. Guarded so we never steal focus from content that already
  // grabbed it — autofocused inputs in `children` run their effect before this
  // parent effect, so document.activeElement is already inside by now. Full
  // Tab-cycle focus-trap is Phase 2 (<FocusTrap> primitive).
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (root && !root.contains(document.activeElement)) root.focus();
  }, []);

  const handleBackdropClick = (e: MouseEvent) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  const zClass = layer >= 1 ? "z-[60]" : "z-50";

  return createPortal(
    <div
      ref={rootRef}
      tabIndex={-1}
      className={`fixed inset-0 ${zClass} overflow-y-auto bg-black/60 outline-none`}
    >
      <div className="flex min-h-full w-full p-4" onClick={handleBackdropClick}>
        <div className="m-auto flex w-full justify-center" onClick={handleBackdropClick}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
