import type { MouseEvent } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { tv } from "../lib/tv";
import { useThemeScopeProps } from "../lib/theme/theme-scope";

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

function DismissBackdropPortal(props: Dialog.Portal.Props) {
  return <Dialog.Portal {...useThemeScopeProps(props)} />;
}

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
      <DismissBackdropPortal>
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
      </DismissBackdropPortal>
    </Dialog.Root>
  );
}
