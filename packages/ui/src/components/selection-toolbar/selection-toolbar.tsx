import { mergeProps } from "@base-ui/react/merge-props";
import { Toolbar as BaseToolbar } from "@base-ui/react/toolbar";
import { useRender } from "@base-ui/react/use-render";
import { ChevronDown, MoreHorizontal, X } from "lucide-react";
import { cloneElement, useCallback } from "react";
import type { HTMLProps, ReactElement, ReactNode } from "react";
import { Button } from "../button/index";
import type { ButtonProps } from "../button/index";
import { DropdownMenuItem } from "../dropdown-menu/index";
import type { DropdownMenuItemProps } from "../dropdown-menu/index";
import {
  FitToolbar,
  FitToolbarGroup,
  FitToolbarMoreItems,
  useFitItem,
  useFitMore,
} from "../fit-toolbar/index";
import type { FitToolbarGroupProps, FitToolbarProps } from "../fit-toolbar/index";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip/index";
import { selectionToolbar } from "./selection-toolbar.recipe";

/**
 * The order things give way in as the toolbar runs out of room: the hint,
 * then the secondary actions into More (the last first), then the labels (the
 * last first, so the first action's goes last), then the other actions into
 * More, the last first. The count and × never do.
 */
const HINT_STEP = 10;
const SECONDARY_STEP = 20;
const LABEL_STEP = 30;
const MORE_STEP = 40;

export type SelectionToolbarDockProps = useRender.ComponentProps<"div">;

/**
 * Where the toolbar floats: centered, 12px above the bottom of the list or
 * conversation it sits in (plus the safe area), 20px from its sides. Its
 * parent must be positioned.
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

export type SelectionToolbarProps = Omit<FitToolbarProps, "wrap" | "orientation">;

/**
 * The floating toolbar for selected items (messages, tasks): the count, an
 * optional hint, the actions on the selection, More while some are out of
 * the row, then ×. One row at any width: what doesn't fit gives way, measured
 * in the width it floats in, and never wraps. A `role="toolbar"`, one Tab
 * stop with the arrow keys inside: give it an `aria-label`.
 */
export function SelectionToolbar({ className, ...props }: SelectionToolbarProps) {
  const { root } = selectionToolbar();

  return <FitToolbar data-slot="selection-toolbar" className={root({ className })} {...props} />;
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

/**
 * A short line after the count, such as "1 will be skipped". The first to
 * give way: it is then read by screen readers only.
 */
export function SelectionToolbarHint({ className, render, ...props }: SelectionToolbarHintProps) {
  const { hint } = selectionToolbar();
  const item = useFitItem({ label: HINT_STEP });
  const defaultProps: useRender.ElementProps<"span"> = {
    className: hint({ className }),
    ...item.props,
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

export type SelectionToolbarItemProps = {
  /** The control, such as `<Checkbox />`. It keeps its own role and keys. */
  children: ReactElement<Record<string, unknown>>;
};

/**
 * Any other control of the toolbar, such as a thread's select-all checkbox
 * before the count, so the arrow keys reach it. It takes the toolbar's focus
 * handling only: the control keeps its role and its own keys.
 */
export function SelectionToolbarItem({ children }: SelectionToolbarItemProps) {
  const renderItem = useCallback(
    (itemProps: HTMLProps<HTMLElement>) => {
      const {
        role: _role,
        type: _type,
        onClick: _onClick,
        onKeyDown: _onKeyDown,
        onKeyUp: _onKeyUp,
        onMouseDown: _onMouseDown,
        onPointerDown: _onPointerDown,
        "aria-disabled": _ariaDisabled,
        ...composite
      } = itemProps;
      return cloneElement(
        children,
        mergeProps(children.props as object, { ...composite, "data-selection-toolbar-item": "" }),
      );
    },
    [children],
  );
  return <BaseToolbar.Button nativeButton={false} render={renderItem} />;
}

export type SelectionToolbarActionsProps = Omit<
  FitToolbarGroupProps,
  "wrapOrder" | "firstLine" | "collapseOrder" | "collapsed"
>;

/** The actions on the selection, in one row. */
export function SelectionToolbarActions({ className, ...props }: SelectionToolbarActionsProps) {
  const { actions } = selectionToolbar();

  return (
    <FitToolbarGroup
      data-slot="selection-toolbar-actions"
      className={actions({ className })}
      {...props}
    />
  );
}

export type SelectionToolbarActionProps = Omit<ButtonProps, "variant" | "size" | "children"> & {
  /** The action's 14px icon. */
  icon: ReactNode;
  /** The label. While only the icon shows, the label is its accessible name and its tooltip. */
  children: ReactNode;
  /** Moves into More before the labels give way, the last first. */
  secondary?: boolean;
} & (
    | {
        menu?: false;
        /**
         * What the action is in More's menu while it is there. By default a
         * `DropdownMenuItem` with its icon and label that calls its `onClick`.
         */
        moreItem?: ReactNode;
      }
    | {
        /** The action opens a menu: a 12px chevron follows the label. Open the menu upward. */
        menu: true;
        /**
         * Required: its menu in More's (a `DropdownMenuSubmenu` with the same
         * choices). Its `onClick` only opens its own menu, so it has no
         * default, and without one it would vanish into More.
         */
        moreItem: ReactNode;
      }
  );

let warnedMenuWithoutMoreItem = false;
function warnMenuWithoutMoreItem() {
  if (warnedMenuWithoutMoreItem) return;
  warnedMenuWithoutMoreItem = true;
  console.warn(
    "raft-ui: a SelectionToolbarAction with `menu` has no `moreItem`; it would vanish when it moves into More. Give it its menu as a DropdownMenuSubmenu.",
  );
}

/**
 * One action on the selection: a 14px icon and a label, an `md` ghost button
 * with a mouse on a desktop, a 44px bar button showing its icon alone on a
 * phone and a touch screen.
 */
export function SelectionToolbarAction({
  icon,
  children,
  secondary = false,
  menu = false,
  moreItem,
  className,
  onClick,
  disabled,
  ...props
}: SelectionToolbarActionProps) {
  const { action, actionLabel, actionChevron } = selectionToolbar({ menu });
  if (process.env.NODE_ENV !== "production" && menu && moreItem === undefined) {
    warnMenuWithoutMoreItem();
  }
  const item = useFitItem({
    label: LABEL_STEP,
    more: secondary ? SECONDARY_STEP : MORE_STEP,
    moreItem:
      moreItem !== undefined ? (
        moreItem
      ) : menu ? null : (
        <DropdownMenuItem
          disabled={disabled}
          onClick={onClick as unknown as DropdownMenuItemProps["onClick"]}
        >
          {icon}
          {children}
        </DropdownMenuItem>
      ),
  });

  return (
    <Tooltip disabled={!item.taken("label")}>
      <TooltipTrigger
        data-slot="button"
        render={
          <BaseToolbar.Button
            render={
              <Button
                data-selection-toolbar-action=""
                data-secondary={secondary ? "" : undefined}
                variant="ghost"
                size="md"
                className={action({ className })}
                onClick={onClick}
                disabled={disabled}
                {...item.props}
                {...props}
              />
            }
          />
        }
      >
        {icon}
        <span data-slot="selection-toolbar-action-label" className={actionLabel()}>
          {children}
        </span>
        {menu ? <ChevronDown aria-hidden className={actionChevron()} /> : null}
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  );
}

export type SelectionToolbarMoreProps = Omit<ButtonProps, "variant" | "size" | "aria-label"> & {
  /** Its accessible name, such as "More actions". */
  "aria-label": string;
};

/**
 * More, after the actions, shown only while some are in it. Render it as a
 * `DropdownMenuTrigger` whose menu opens upward (`side="top"`), with
 * `SelectionToolbarMoreItems` in the menu.
 */
export function SelectionToolbarMore({ className, children, ...props }: SelectionToolbarMoreProps) {
  const { more } = selectionToolbar();
  const fit = useFitMore();

  return (
    <BaseToolbar.Button
      render={
        <Button
          data-selection-toolbar-more=""
          variant="ghost"
          size="md"
          className={more({ className })}
          {...fit.props}
          {...props}
        />
      }
    >
      {children ?? <MoreHorizontal />}
    </BaseToolbar.Button>
  );
}

/** The actions in More, in their order, each as its `moreItem`: put it in More's menu. */
export const SelectionToolbarMoreItems = FitToolbarMoreItems;

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
  const { close } = selectionToolbar();

  return (
    <BaseToolbar.Button
      render={
        <Button
          data-selection-toolbar-close=""
          variant="ghost"
          size="icon-md"
          className={close({ className })}
          {...props}
        />
      }
    >
      {children ?? <X />}
    </BaseToolbar.Button>
  );
}
