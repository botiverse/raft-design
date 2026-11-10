import type { ComponentPropsWithRef } from "react";
import { tv } from "../../lib/tv";

// Raft Design System › Forms, "Settings that apply at once": a setting that
// saves itself shows nothing while it saves or once it is stored; the control
// showing its new value is the confirmation. Only a failure takes a line,
// under the control, saying what failed, while the control goes back to its
// old value (cindyz, 2026-11-10, #proj-raft-ui:4ae1a74e; it replaces the
// reserved "Saved" line of stdrc, 2026-10-30). So the line is hidden, with no
// height, while it is empty, and a settings row centres its ends on the whole
// row with nothing to leave out. Shown, it sits 4px under the control,
// whatever the control is: a select, a segmented control, or a settings
// row's text. In a Field (6px between its parts) and in a ListRowBody (2px) it
// makes up the difference itself; anywhere else it is 4px below the block
// before it.
const saveStatus = tv({
  slots: {
    root: [
      "block min-w-0 empty:hidden",
      "mt-1 [[data-slot=field]>&]:-mt-0.5 [[data-slot=list-row-body]>&]:mt-0.5",
      "text-footnote",
    ],
    error: ["block wrap-anywhere", "text-danger-strong"],
  },
});

export type SaveStatusProps = ComponentPropsWithRef<"span">;

/**
 * The line under a setting that applies at once. Render it whatever the
 * setting's state, with `SaveStatusError` inside when the change failed and
 * nothing inside otherwise: empty, it is hidden and takes no height. A `span`
 * (shown as a block), like every ListRow part, so it stays valid inside a
 * row's body; give it an `id` for the control's `aria-describedby`.
 */
export function SaveStatus({ className, ...props }: SaveStatusProps) {
  const { root } = saveStatus();
  return <span data-slot="save-status" className={root({ className })} {...props} />;
}

export type SaveStatusSavedProps = ComponentPropsWithRef<"span">;

/**
 * @deprecated A setting that applies at once no longer says "Saved": the
 * control showing its new value is the confirmation (Forms, settings that
 * apply at once). Renders nothing, whatever its children, so its
 * `SaveStatus` stays empty and takes no height. Leave it out: render
 * `SaveStatusError` when the change failed and nothing otherwise.
 */
export function SaveStatusSaved(_props: SaveStatusSavedProps) {
  return null;
}

export type SaveStatusErrorProps = ComponentPropsWithRef<"span">;

/**
 * What failed. It is an alert, announced when it appears, and stays until
 * the next change. Its line appears with it, so the setting grows by one
 * line while it shows.
 */
export function SaveStatusError({ className, role = "alert", ...props }: SaveStatusErrorProps) {
  const { error } = saveStatus();
  return (
    <span data-slot="save-status-error" role={role} className={error({ className })} {...props} />
  );
}
