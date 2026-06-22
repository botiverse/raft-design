import type { MouseEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { tv } from "../lib/tv.ts";

const dismissBackdrop = tv({
  slots: {
    popup: ["fixed inset-0"],
  },
  variants: {
    theme: {
      brutal: {},
      elegant: {},
    },
  },
  defaultVariants: {
    theme: "brutal",
  },
});

export type DismissBackdropProps = {
  onDismiss: () => void;
  zIndex?: number;
  trapContextMenu?: boolean;
  stopPropagation?: boolean;
};

export function DismissBackdrop({
  onDismiss,
  zIndex = 50,
  trapContextMenu = false,
  stopPropagation = false,
}: DismissBackdropProps) {
  const { popup } = dismissBackdrop();

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
