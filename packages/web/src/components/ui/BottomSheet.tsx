import { type HTMLAttributes, type ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export interface BottomSheetProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: ReactNode;
  onClose: () => void;
  /** CSS z-index. Default 50 to match modal-layer surfaces. */
  zIndex?: number;
  /** Click outside the sheet closes it. Default true. */
  dismissOnBackdrop?: boolean;
  /** Lock body scroll while mounted. Default true. */
  lockBodyScroll?: boolean;
  /** Width class for the sheet card. */
  widthClass?: string;
  /** Extra classes on the sheet card. */
  sheetClassName?: string;
}

/**
 * Mobile bottom sheet primitive.
 *
 * Unlike Lightbox, this has no dim backdrop. The sheet itself carries the
 * dialog affordance via brutal border + shadow while staying anchored to the
 * bottom safe area.
 */
export default function BottomSheet({
  children,
  onClose,
  zIndex = 50,
  dismissOnBackdrop = true,
  lockBodyScroll = true,
  widthClass = "max-w-md",
  sheetClassName = "",
  className = "",
  ...rest
}: BottomSheetProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!lockBodyScroll) return;
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [lockBodyScroll]);

  return createPortal(
    <div
      {...rest}
      className={`fixed inset-x-0 bottom-0 p-3 pb-[max(12px,env(safe-area-inset-bottom))] ${className}`}
      style={{ zIndex, ...rest.style }}
      onClick={
        dismissOnBackdrop
          ? (e) => {
              if (e.target === e.currentTarget) onClose();
            }
          : undefined
      }
    >
      <div
        className={`mx-auto border-2 border-black bg-white shadow-brutal-lg ${widthClass} ${sheetClassName}`}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
