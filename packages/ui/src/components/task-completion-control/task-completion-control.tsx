import type { ComponentPropsWithRef, KeyboardEvent, MouseEvent } from "react";
import { tv } from "../../lib/tv";
import { CheckboxIndicator } from "../checkbox/checkbox-indicator";

// A task's completion control: the round check that leads every task row and
// card (design/patterns/tasks.md#completing-a-task). A native button with
// checkbox semantics, since it applies at once, as a to-do list's does. Its
// hit area reaches 8px past the 20px circle with a mouse (36px) and 12px on
// a touch screen (44px).
//
// Hovering the control itself previews the check. CheckboxIndicator's own
// preview (`previewOnHover`) answers to any `.group` ancestor, and the rows
// and columns a task sits in are often one (a TaskBoard column is): there a
// hover anywhere would preview every check. So the indicator's group preview
// is switched off and the button previews it on its own hover instead.
const taskCompletionControl = tv({
  slots: {
    root: [
      "relative inline-flex size-5 shrink-0 touch-manipulation items-center justify-center outline-none",
      "cursor-pointer rounded-full disabled:cursor-not-allowed",
      "after:absolute after:-inset-2 after:content-[''] pointer-coarse:after:-inset-3",
      "focus-visible:shadow-focus",
    ],
    indicator: "pointer-events-none",
  },
  variants: {
    preview: {
      true: {
        root: "hover:*:data-[slot=checkbox-indicator-graphic]:text-foreground/20",
        indicator: "group-hover:text-transparent",
      },
      false: {},
    },
  },
});

type TaskCompletionControlName =
  | {
      /** The task, by number and title: "#25 Fix onboarding copy". It stays the
       *  same when the task is completed or reopened. */
      "aria-label": string;
      "aria-labelledby"?: never;
    }
  | {
      /** The id of the element that names the task, such as its title. */
      "aria-labelledby": string;
      "aria-label"?: never;
    };

export type TaskCompletionControlProps = Omit<
  ComponentPropsWithRef<"button">,
  "type" | "role" | "aria-checked" | "aria-disabled" | "aria-label" | "aria-labelledby" | "onChange"
> &
  TaskCompletionControlName & {
    /** Whether the task is done. Only a Done task is checked; every other
     *  status, Backlog and Closed included, is unchecked. */
    checked: boolean;
    /** Called with the state a press asks for: `true` to complete the task,
     *  `false` to reopen it. The caller changes the task. */
    onCheckedChange?: (checked: boolean, event: MouseEvent<HTMLButtonElement>) => void;
    /** For a person who can't change the task. */
    disabled?: boolean;
  };

/**
 * The round control that marks a task Done in one press, or reopens a done
 * one. Controlled: pass `checked` from the task's status and change the task
 * in `onCheckedChange`.
 *
 * It sits on top of a row or card that opens the task, so a press on it stops
 * there: the click, and Space or Enter, never reach the row or the card (nor a
 * TaskBoard card's drag, which Space picks up). Space toggles it; Enter does
 * nothing, as on any checkbox.
 */
export function TaskCompletionControl({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  onClick,
  onKeyDown,
  ...props
}: TaskCompletionControlProps) {
  const preview = !checked && !disabled;
  const { root, indicator } = taskCompletionControl({ preview });

  return (
    <button
      {...props}
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      data-slot="task-completion-control"
      data-checked={checked ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      className={root({ className })}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onClick?.(event);
        if (event.defaultPrevented) return;
        onCheckedChange?.(!checked, event);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => {
        // Space toggles it, as any checkbox; Enter doesn't, so it can't be
        // taken for the row's "open the task".
        if (event.key === " " || event.key === "Enter") event.stopPropagation();
        if (event.key === "Enter") event.preventDefault();
        onKeyDown?.(event);
      }}
    >
      <CheckboxIndicator
        shape="circle"
        checked={checked}
        disabled={disabled}
        previewOnHover={preview}
        className={indicator()}
      />
    </button>
  );
}
