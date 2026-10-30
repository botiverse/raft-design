import type { ComponentPropsWithRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";

// Raft Design System › WorkspaceButton: the server switcher on the frame. One
// shape on every surface (the web top bar, the phone's Home, the mobile app):
// the server's avatar, its name and a chevron, as one on-frame button that
// opens the server list. The chevron is part of the button, so it shows
// whatever else sits beside it (the desktop strip, a narrow window).
//
// It is the on-frame `md` Button (36px, 10px each side, 15/20 bold, the frame
// press under hover, press and while open), shrinking from the name: the
// avatar and the chevron keep their size, the name ellipsizes.

export type WorkspaceButtonProps = Omit<ButtonProps, "variant" | "size">;

export function WorkspaceButton({ className, children, ...props }: WorkspaceButtonProps) {
  return (
    <Button
      {...props}
      variant="on-frame"
      size="md"
      data-slot="workspace-button"
      className={cn(
        "max-w-full min-w-0 shrink justify-start gap-2",
        "*:data-[slot=button-content]:max-w-full [&>[data-slot=button-content]]:min-w-0",
        className,
      )}
    >
      {children}
      <ChevronDown
        aria-hidden
        data-slot="workspace-button-chevron"
        className="-ml-1 size-4 shrink-0"
      />
    </Button>
  );
}

export type WorkspaceButtonNameProps = ComponentPropsWithRef<"span">;

// The server's name: at most 200px, then an ellipsis.
export function WorkspaceButtonName({ className, ...props }: WorkspaceButtonNameProps) {
  return (
    <span
      data-slot="workspace-button-name"
      className={cn("max-w-[200px] min-w-0 truncate", className)}
      {...props}
    />
  );
}
