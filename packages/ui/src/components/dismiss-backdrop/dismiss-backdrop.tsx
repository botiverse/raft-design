import type { MouseEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { tv } from "tailwind-variants";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Invisible click-outside catcher for hand-rolled menus / drawers. Rebuilt on
// base-ui Dialog (non-modal): the portal replaces the original's createPortal, and
// no scroll lock / focus trap is applied — it stays a pure backdrop dismiss surface.
const dismissBackdrop = tv({
  slots: {
    popup: ["fixed inset-0"],
  },
  variants: {
    theme: {
      brutal: {},
      // No visual styling to theme; kept as the elegant extension point.
      elegant: {},
    },
  },
});

export type DismissBackdropProps = {
  onDismiss: () => void;
  /** CSS z-index value. Default 50. */
  zIndex?: number;
  /** Also intercept right-click (prevents the native context menu). */
  trapContextMenu?: boolean;
  /** Stop propagation instead of dismissing (iOS phantom-click shield). */
  stopPropagation?: boolean;
};

export function DismissBackdrop({
  onDismiss,
  zIndex = 50,
  trapContextMenu = false,
  stopPropagation = false,
}: DismissBackdropProps) {
  const theme = useTheme();
  const { popup } = dismissBackdrop({ theme });

  return (
    <Dialog.Root
      open
      modal={false}
      onOpenChange={(open) => {
        if (!open) onDismiss();
      }}
    >
      <Dialog.Portal>
        <Dialog.Popup
          data-slot="dismiss-backdrop"
          className={popup()}
          style={{ zIndex }}
          onClick={
            stopPropagation
              ? (event: MouseEvent<HTMLDivElement>) => {
                  event.stopPropagation();
                  event.preventDefault();
                }
              : onDismiss
          }
          onContextMenu={
            trapContextMenu
              ? (event: MouseEvent<HTMLDivElement>) => {
                  event.preventDefault();
                  onDismiss();
                }
              : undefined
          }
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
