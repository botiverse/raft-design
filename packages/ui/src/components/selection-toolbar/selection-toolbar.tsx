import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { ChevronDown, MoreHorizontal, X } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";
import { selectionToolbar } from "./selection-toolbar.recipe";

export type SelectionToolbarDockProps = useRender.ComponentProps<"div">;

/**
 * Where the toolbar floats: centered, 16px above the bottom of the list or
 * conversation it sits in (plus the safe area), 20px from its sides. Its
 * parent must be positioned. Its width decides when the toolbar is narrow.
 */
export function SelectionToolbarDock({ className, render, ...props }: SelectionToolbarDockProps) {
  const { dock } = selectionToolbar();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: dock({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "selection-toolbar-dock",
    },
  });
}

/** The arrow keys, Home and End move between the toolbar's buttons; Tab still visits each. */
function moveFocus(event: KeyboardEvent<HTMLDivElement>) {
  const { key } = event;
  if (event.defaultPrevented) return;
  if (key !== "ArrowLeft" && key !== "ArrowRight" && key !== "Home" && key !== "End") return;
  const buttons = Array.from(
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
  ).filter((button) => button.getClientRects().length > 0);
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  if (index < 0) return;
  event.preventDefault();
  const next =
    key === "Home"
      ? 0
      : key === "End"
        ? buttons.length - 1
        : (index + (key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length;
  buttons[next]?.focus();
}

export type SelectionToolbarProps = useRender.ComponentProps<"div">;

/**
 * The floating toolbar for selected items (messages, tasks): the count, an
 * optional hint, the actions on the selection, More on a narrow screen, then
 * ×. One row at any width. A `role="toolbar"`: give it an `aria-label`.
 */
export function SelectionToolbar({ className, render, ...props }: SelectionToolbarProps) {
  const { root } = selectionToolbar();
  const defaultProps: useRender.ElementProps<"div"> = {
    role: "toolbar",
    className: root({ className }),
    onKeyDown: moveFocus,
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "selection-toolbar",
    },
  });
}

export type SelectionToolbarCountProps = useRender.ComponentProps<"span">;

/**
 * What the actions act on ("3 selected"), first. Announced when it changes.
 * Put the number in `SelectionToolbarCountValue`.
 */
export function SelectionToolbarCount({ className, render, ...props }: SelectionToolbarCountProps) {
  const { count } = selectionToolbar();
  const defaultProps: useRender.ElementProps<"span"> = {
    "aria-live": "polite",
    "aria-atomic": true,
    className: count({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "selection-toolbar-count",
    },
  });
}

export type SelectionToolbarCountValueProps = useRender.ComponentProps<"span">;

/** The number in the count, in Space Mono. */
export function SelectionToolbarCountValue({
  className,
  render,
  ...props
}: SelectionToolbarCountValueProps) {
  const { countValue } = selectionToolbar();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: countValue({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "selection-toolbar-count-value",
    },
  });
}

export type SelectionToolbarHintProps = useRender.ComponentProps<"span">;

/** A short line after the count, such as "1 will be skipped". Hidden when narrow. */
export function SelectionToolbarHint({ className, render, ...props }: SelectionToolbarHintProps) {
  const { hint } = selectionToolbar();
  const defaultProps: useRender.ElementProps<"span"> = {
    className: hint({ className }),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
    state: {
      slot: "selection-toolbar-hint",
    },
  });
}

export type SelectionToolbarActionsProps = useRender.ComponentProps<"div">;

/** The actions on the selection, 4px apart, in one row. */
export function SelectionToolbarActions({
  className,
  render,
  ...props
}: SelectionToolbarActionsProps) {
  const { actions } = selectionToolbar();
  const defaultProps: useRender.ElementProps<"div"> = {
    className: actions({ className }),
  };

  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(defaultProps, props),
    state: {
      slot: "selection-toolbar-actions",
    },
  });
}

export type SelectionToolbarActionProps = Omit<ButtonProps, "variant" | "size" | "children"> & {
  /** The action's 14px icon. */
  icon: ReactNode;
  /** The label. When narrow only the icon shows; the label stays its accessible name. */
  children: ReactNode;
  /** Moves into More when narrow: render it in More's menu as well. */
  secondary?: boolean;
  /** The action opens a menu: a 12px chevron follows the label. Open the menu upward. */
  menu?: boolean;
};

/** One action on the selection: an `md` ghost button with a 14px icon and a label. */
export function SelectionToolbarAction({
  icon,
  children,
  secondary = false,
  menu = false,
  className,
  ...props
}: SelectionToolbarActionProps) {
  const { action, actionLabel, actionChevron } = selectionToolbar({ secondary, menu });

  return (
    <Button
      data-selection-toolbar-action=""
      data-secondary={secondary ? "" : undefined}
      variant="ghost"
      size="md"
      className={action({ className })}
      {...props}
    >
      {icon}
      <span data-slot="selection-toolbar-action-label" className={actionLabel()}>
        {children}
      </span>
      {menu ? <ChevronDown aria-hidden className={actionChevron()} /> : null}
    </Button>
  );
}

export type SelectionToolbarMoreProps = Omit<ButtonProps, "variant" | "size" | "aria-label"> & {
  /** Its accessible name, such as "More actions". */
  "aria-label": string;
};

/**
 * More, shown only when narrow: it holds the secondary actions. Render it as
 * a `DropdownMenuTrigger` whose menu opens upward (`side="top"`).
 */
export function SelectionToolbarMore({ className, children, ...props }: SelectionToolbarMoreProps) {
  const { more } = selectionToolbar();

  return (
    <Button
      data-selection-toolbar-more=""
      variant="ghost"
      size="md"
      className={more({ className })}
      {...props}
    >
      {children ?? <MoreHorizontal />}
    </Button>
  );
}

export type SelectionToolbarCloseProps = Omit<ButtonProps, "variant" | "size" | "aria-label"> & {
  /** Its accessible name, such as "Cancel". */
  "aria-label": string;
};

/** ×, last: ends the selection, as Escape does. */
export function SelectionToolbarClose({
  className,
  children,
  ...props
}: SelectionToolbarCloseProps) {
  return (
    <Button
      data-selection-toolbar-close=""
      variant="ghost"
      size="icon-md"
      className={className}
      {...props}
    >
      {children ?? <X />}
    </Button>
  );
}
