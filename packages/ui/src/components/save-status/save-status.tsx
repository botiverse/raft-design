import { Check } from "lucide-react";
import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";

// Raft Design System › Forms, "Settings that apply at once": the line under a
// setting that saves itself, which says "Saved" for a moment or what failed
// (stdrc, 2026-10-30). The line is always there, empty while nothing has
// happened, so its result coming and going never moves the card, the row or
// the switch centred on it. It sits 4px under the control whatever the
// control is: a select, a segmented control, or a settings row's text. In a
// Field (6px between its parts) and in a ListRowBody (2px) it makes up the
// difference itself; anywhere else it is 4px below the block before it.
const saveStatus = tv({
  slots: {
    root: [
      "block min-h-lh min-w-0",
      "mt-1 [[data-slot=field]>&]:-mt-0.5 [[data-slot=list-row-body]>&]:mt-0.5",
      "text-footnote",
    ],
    saved: [
      "flex min-w-0 items-center gap-1",
      "text-foreground-muted",
      "[&>svg]:size-3.5 [&>svg]:shrink-0",
    ],
    error: ["block wrap-anywhere", "text-danger-strong"],
  },
});

export type SaveStatusProps = ComponentPropsWithRef<"div">;

/**
 * The reserved line itself. Render it whatever the setting's state, and put
 * `SaveStatusSaved` or `SaveStatusError` inside.
 */
export function SaveStatus({ className, ...props }: SaveStatusProps) {
  const { root } = saveStatus();
  return <div data-slot="save-status" className={root({ className })} {...props} />;
}

export type SaveStatusSavedProps = ComponentPropsWithRef<"span">;

/**
 * The polite live region that says the change is stored. Keep it mounted,
 * empty, while nothing has happened, so a screen reader announces the words
 * when they arrive; the check shows only with them.
 */
export function SaveStatusSaved({ className, children, ...props }: SaveStatusSavedProps) {
  const { saved } = saveStatus();
  const hasContent = children !== null && children !== undefined && children !== false;
  return (
    <span
      data-slot="save-status-saved"
      role="status"
      aria-live="polite"
      className={saved({ className })}
      {...props}
    >
      {hasContent ? <Check aria-hidden="true" data-slot="save-status-icon" /> : null}
      {children}
    </span>
  );
}

export type SaveStatusErrorProps = ComponentPropsWithRef<"span">;

/**
 * What failed, in place of `SaveStatusSaved`. It is an alert, announced when
 * it appears, and stays until the next change.
 */
export function SaveStatusError({ className, role = "alert", ...props }: SaveStatusErrorProps) {
  const { error } = saveStatus();
  return (
    <span data-slot="save-status-error" role={role} className={error({ className })} {...props} />
  );
}
