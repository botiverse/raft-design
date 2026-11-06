import { Button as BaseButton } from "@base-ui/react/button";
import type { ComponentPropsWithRef } from "react";
import type { DataAttributes } from "../../lib/data-attributes";
import type { StyledProps } from "../../lib/styled-props";
import { tv } from "../../lib/tv";

// Raft Design System › KbdButton: the control around a shortcut that can be
// changed. Kbd is never a control, so the button wraps the caps. At rest its
// box reaches 4px past the caps on every side and the margin takes that back,
// so the caps sit where a read-only KbdShortcut sits and the row keeps its
// height; the hit area reaches 44px. While recording it is a field, the
// control height, its margin again taking back what it adds over the caps.
const kbdButton = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center gap-1.5 align-middle",
      "-m-1 rounded-chip p-1",
      "cursor-pointer select-none outline-none",
      "transition-[background-color,box-shadow] duration-100",
      "after:absolute after:inset-[min(0px,calc((100%-44px)/2))]",
      "not-data-recording:hover:overlay-medium not-data-recording:hover:inset-ring not-data-recording:hover:inset-ring-line-hairline",
      "focus-visible:shadow-focus",
      "data-recording:mx-0 data-recording:my-[calc((24px-var(--control-height))/2)] data-recording:h-control",
      "data-recording:rounded-(--control-radius) data-recording:px-[calc(--spacing(2)-1.5px)] data-recording:py-0",
      "data-recording:border-[1.5px] data-recording:border-line-field data-recording:bg-layer-card data-recording:shadow-focus",
      "data-recording:data-invalid:border-danger-strong",
      "data-invalid:**:data-[slot=kbd]:bg-danger-soft data-invalid:**:data-[slot=kbd]:text-danger-strong data-invalid:**:data-[slot=kbd]:inset-ring-danger-strong",
    ],
    placeholder: ["px-0.5 whitespace-nowrap", "font-sans text-callout text-foreground-hint"],
    caret: ["block h-[18px] w-[1.5px] shrink-0 bg-foreground"],
  },
});

export type KbdButtonProps = StyledProps<BaseButton.Props> &
  DataAttributes & {
    /**
     * The button is listening for a new shortcut: it draws as a field with the
     * focus ring when it was reached from the keyboard, and sets `data-recording`. Put the held keys in it, then
     * `KbdButtonCaret` while more can come.
     */
    recording?: boolean;
    /**
     * The keys in it can't be used: the caps take the danger tint, the field
     * a danger border, and it sets `data-invalid`. Say why in text the button
     * names with `aria-describedby`.
     */
    invalid?: boolean;
  };

/**
 * A shortcut that can be changed: a native button around a KbdShortcut at
 * `md`. Name it with `aria-label` ("Change the shortcut for Search") and pass
 * the current keys in `aria-keyshortcuts`. A shortcut that can't be changed
 * stays a KbdShortcut, with no button.
 */
export function KbdButton({
  recording = false,
  invalid = false,
  className,
  ...props
}: KbdButtonProps) {
  const { root } = kbdButton();
  return (
    <BaseButton
      data-slot="kbd-button"
      data-recording={recording ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      className={root({ className })}
      {...props}
    />
  );
}

export type KbdButtonPlaceholderProps = ComponentPropsWithRef<"span">;

/** What a recording KbdButton shows before any key: the consumer's prompt. */
export function KbdButtonPlaceholder({ className, ...props }: KbdButtonPlaceholderProps) {
  const { placeholder } = kbdButton();
  return (
    <span data-slot="kbd-button-placeholder" className={placeholder({ className })} {...props} />
  );
}

export type KbdButtonCaretProps = Omit<ComponentPropsWithRef<"span">, "children">;

/** The caret after the held keys, while a recording KbdButton waits for more. */
export function KbdButtonCaret({ className, ...props }: KbdButtonCaretProps) {
  const { caret } = kbdButton();
  return (
    <span
      data-slot="kbd-button-caret"
      aria-hidden="true"
      className={caret({ className })}
      {...props}
    />
  );
}
