import {
  createContext,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ComponentPropsWithRef, RefObject } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import type { DataAttributes } from "../../lib/data-attributes";
import { usePopupCollisionPadding } from "../../lib/frame-insets";
import { tv } from "../../lib/tv";
import { useOverflowTitle } from "../../lib/use-overflow-title";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { Button } from "../button/index";

const select = tv({
  slots: {
    trigger: [
      "inline-flex select-none items-center justify-between",
      "outline-none transition-colors",
      "data-invalid:focus-visible:ring-[color-mix(in_oklch,var(--danger)_60%,transparent)]",
      "**:data-[slot='button-content']:w-full **:data-[slot='button-content']:justify-between",
      "[&>span[data-slot='select-trigger-content']]:min-w-0 [&>span[data-slot='select-trigger-content']]:flex-1",
      "[&_[data-slot='select-trigger-content']_svg]:shrink-0",
      "h-control w-full gap-2 pr-3 pl-3.5",
      "border-[1.5px] border-line-field",
      "hover:bg-none",
      "text-subhead font-semibold text-foreground",
      "data-placeholder:font-medium data-placeholder:text-foreground-hint",
      "data-invalid:border-danger-strong data-invalid:hover:border-danger-strong",
      "data-invalid:focus-visible:border-danger-strong data-invalid:focus-visible:ring-0",
      "[&_[data-slot='select-trigger-content']_svg:not([class*='size-'])]:size-4",
      "[&_[data-slot='select-trigger-content']_svg:not([class*='stroke-'])]:stroke-2",
    ],
    icon: [
      "ml-auto flex shrink-0 items-center justify-center transition-transform",
      "[&>svg]:shrink-0",
      "text-foreground-hint opacity-100",
      "[&>svg]:size-4 [&>svg]:stroke-2 [&>svg_*]:stroke-2",
    ],
    value: ["flex min-w-0 flex-1 truncate text-left"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "relative max-h-(--available-height) min-w-[max(var(--anchor-width),220px)] overflow-hidden",
      "max-w-[min(var(--available-width),max(var(--anchor-width),24rem))]",
      "outline-none",
      "rounded-container bg-layer-popover p-1 text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    list: ["max-h-64 overflow-y-auto overscroll-contain scroll-py-6", "flex flex-col"],
    item: [
      "flex w-full shrink-0 cursor-default select-none items-center justify-between overflow-hidden",
      "text-left outline-none transition-colors",
      "min-h-option flex-wrap gap-x-2.5 gap-y-0.5 rounded-chip px-2.5 py-option-inset",
      "text-callout font-medium text-foreground",
      "bg-transparent hover:bg-brand-soft data-highlighted:bg-brand-soft",
      "data-selected:font-bold data-selected:**:data-[slot='select-item-text']:font-bold",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:text-foreground-muted",
      "[&>svg:not([class*='size-'])]:size-4",
      "[&>svg:not([class*='stroke-'])]:stroke-2",
    ],
    actionItem: [
      "flex w-full shrink-0 cursor-default select-none items-center gap-2.5 overflow-hidden",
      "text-left outline-none transition-colors",
      "min-h-option rounded-chip px-2.5 py-option-inset",
      "text-callout font-medium text-foreground-muted",
      "bg-transparent hover:bg-brand-soft data-highlighted:bg-brand-soft",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&>svg]:pointer-events-none [&>svg]:shrink-0",
      "[&>svg:not([class*='size-'])]:size-4",
      "[&>svg:not([class*='stroke-'])]:stroke-2",
    ],
    itemLeading: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "size-4 text-foreground-muted",
      "[&>svg]:pointer-events-none [&>svg]:shrink-0",
      "[&>svg:not([class*='size-'])]:size-4",
      "[&>svg:not([class*='stroke-'])]:stroke-2",
    ],
    itemIndicator: [
      "pointer-events-none ml-auto flex shrink-0 items-center justify-center",
      "text-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2",
    ],
    itemText: ["min-w-0 flex-1 line-clamp-2 wrap-anywhere"],
    itemDescription: [
      "order-last min-w-0 basis-full wrap-anywhere",
      "[[data-slot=select-item-leading]~&]:ps-[calc(--spacing(4)+--spacing(2.5))]",
      "font-sans text-caption font-normal text-foreground-hint",
    ],
    label: ["m-0", "font-sans text-footnote font-semibold text-foreground-muted"],
    group: ["flex flex-col"],
    groupLabel: ["py-2", "px-2.5 pt-2 pb-1 text-caption font-bold text-foreground-hint"],
    separator: ["h-px shrink-0 border-0", "-mx-1 my-1 bg-line-hairline"],
    scrollArrow: [
      "absolute inset-x-0 z-10 flex h-6 w-full cursor-default items-center justify-center",
      "outline-none transition-colors",
      "data-[direction=up]:top-0 data-[direction=down]:bottom-0",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "bg-layer-popover text-foreground-hint",
    ],
    empty: ["px-2.5 py-2 text-left text-callout text-foreground-hint"],
  },
  variants: {
    // `field` makes a Select carry the declared field metric axis instead of the
    // Button size scale it is built on. Trigger and options share font-size,
    // weight and line-height so a value does not change size when the list
    // opens; their height and padding stay separate, because a list row is not
    // a control and must not be stretched to the field's height.
    chrome: {
      default: {},
      field: {
        // Typography set on the trigger's parts (`button-content`,
        // `select-value`) outranks a plain `font-field` on the trigger, so the
        // field type restates itself at those targets.
        trigger: [
          "px-3 text-field font-field",
          "**:data-[slot='button-content']:font-field **:data-[slot='select-value']:font-field",
          "h-control py-0",
          "data-placeholder:font-field",
        ],
        item: ["text-field font-field", "**:data-[slot='select-item-text']:font-field"],
        actionItem: ["text-field font-field"],
      },
    },
  },
  defaultVariants: {
    chrome: "default",
  },
});

export type SelectChrome = "default" | "field";

/**
 * Declared once on the root and read by both the trigger and the popup.
 *
 * The popup renders through a portal, so it has no DOM ancestor in common with
 * its trigger. React context follows the component tree rather than the DOM,
 * so both ends read one source instead of each resolving its own — which is
 * what lets a Select keep the same typography whether its content mounts at the
 * document root or into a `portalProps.container`.
 *
 * Deliberately NOT a prop on the trigger and another on the content: that shape
 * asks every callsite to restate the decision, which is exactly the duplication
 * this variant exists to remove.
 */
const SelectChromeContext = createContext<SelectChrome>("default");

export function useSelectChrome(): SelectChrome {
  return useContext(SelectChromeContext);
}

export type SelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple> & {
  /**
   * `field` opts this Select into the field metric axis, so it reads as a form
   * field rather than a button. Defaults to `default`, leaving every existing
   * Select untouched.
   */
  chrome?: SelectChrome;
};

/**
 * The value a `SelectActionItem` gives Base UI, so the row joins the list's
 * navigation and typeahead like any item. The root recognises it and never lets
 * it become the value: a list action changes what the list shows, never what is
 * chosen.
 */
class SelectActionValue {
  readonly onActionRef: RefObject<((event: Event) => void) | undefined>;
  readonly closeOnActionRef: RefObject<boolean>;
  constructor(
    onActionRef: RefObject<((event: Event) => void) | undefined>,
    closeOnActionRef: RefObject<boolean>,
  ) {
    this.onActionRef = onActionRef;
    this.closeOnActionRef = closeOnActionRef;
  }
}

function findActionValue(value: unknown): SelectActionValue | undefined {
  if (value instanceof SelectActionValue) return value;
  if (Array.isArray(value)) return value.find((entry) => entry instanceof SelectActionValue);
  return undefined;
}

type RootChangeDetails = BaseSelect.Root.ChangeEventDetails;

export function Select<Value, Multiple extends boolean | undefined = false>({
  chrome = "default",
  onValueChange,
  onOpenChange,
  isItemEqualToValue,
  itemToStringLabel,
  itemToStringValue,
  ...props
}: SelectProps<Value, Multiple>) {
  // Whether the item press that just ran an action may close the list. Base UI
  // commits a pressed item's value, then asks to close; the value is cancelled
  // below and this decides the close that follows.
  const pendingActionClose = useRef<boolean | undefined>(undefined);

  const handleValueChange = useCallback(
    (next: unknown, details: RootChangeDetails) => {
      const action = findActionValue(next);
      if (!action) {
        pendingActionClose.current = undefined;
        (onValueChange as ((v: unknown, d: RootChangeDetails) => void) | undefined)?.(
          next,
          details,
        );
        return;
      }
      details.cancel();
      // Closed-trigger typeahead and autofill also commit a matched item's
      // value; only a press on the row runs its action.
      if (details.reason !== "item-press") return;
      pendingActionClose.current = action.closeOnActionRef.current;
      action.onActionRef.current?.(details.event);
    },
    [onValueChange],
  );

  const handleOpenChange = useCallback(
    (open: boolean, details: RootChangeDetails) => {
      const closeOnAction = pendingActionClose.current;
      pendingActionClose.current = undefined;
      if (!open && details.reason === "item-press" && closeOnAction === false) {
        details.cancel();
        return;
      }
      onOpenChange?.(open, details);
    },
    [onOpenChange],
  );

  const handleItemEquality = useMemo(
    () =>
      isItemEqualToValue &&
      ((item: Value, value: Value) =>
        item instanceof SelectActionValue || value instanceof SelectActionValue
          ? Object.is(item, value)
          : isItemEqualToValue(item, value)),
    [isItemEqualToValue],
  );
  const handleStringLabel = useMemo(
    () =>
      itemToStringLabel &&
      ((item: Value) => (item instanceof SelectActionValue ? "" : itemToStringLabel(item))),
    [itemToStringLabel],
  );
  const handleStringValue = useMemo(
    () =>
      itemToStringValue &&
      ((item: Value) => (item instanceof SelectActionValue ? "" : itemToStringValue(item))),
    [itemToStringValue],
  );

  return (
    <SelectChromeContext value={chrome}>
      <BaseSelect.Root
        data-slot="select"
        data-chrome={chrome}
        onValueChange={handleValueChange as SelectProps<Value, Multiple>["onValueChange"]}
        onOpenChange={handleOpenChange}
        isItemEqualToValue={handleItemEquality}
        itemToStringLabel={handleStringLabel}
        itemToStringValue={handleStringValue}
        {...props}
      />
    </SelectChromeContext>
  );
}

export type SelectTriggerProps = StyledProps<BaseSelect.Trigger.Props> & DataAttributes;

export function SelectTrigger({
  className,
  children,
  render,
  "data-invalid": dataInvalid,
  ...props
}: SelectTriggerProps) {
  const chrome = useSelectChrome();
  const { trigger } = select({ chrome });

  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      render={render ?? <Button variant="outline" size="md" className={trigger({ className })} />}
      {...props}
      data-invalid={dataInvalid || undefined}
      aria-invalid={dataInvalid ? "true" : undefined}
    >
      <span
        data-slot="select-trigger-content"
        data-picker-trigger-content="select"
        className="flex min-w-0 flex-1 items-center gap-1.5"
      >
        {children}
      </span>
    </BaseSelect.Trigger>
  );
}

export type SelectValueProps = StyledProps<BaseSelect.Value.Props>;

export function SelectValue({ className, ref, title, ...props }: SelectValueProps) {
  const { value } = select();
  const overflowRef = useOverflowTitle(ref, title);
  return (
    <BaseSelect.Value
      ref={overflowRef}
      title={title}
      data-slot="select-value"
      className={value({ className })}
      {...props}
    />
  );
}

export type SelectIconProps = StyledProps<BaseSelect.Icon.Props>;

export function SelectIcon({ className, children, ...props }: SelectIconProps) {
  const { icon } = select();
  return (
    <BaseSelect.Icon
      data-slot="select-icon"
      data-picker-trigger-indicator=""
      className={icon({ className })}
      {...props}
    >
      {children ?? <ChevronDown aria-hidden className="size-3.5 shrink-0" />}
    </BaseSelect.Icon>
  );
}

export type SelectPortalProps = BaseSelect.Portal.Props;

export function SelectPortal(props: SelectPortalProps) {
  return <BaseSelect.Portal data-slot="select-portal" {...useThemeScopeProps(props)} />;
}

export type SelectPopupProps = ComponentPropsWithRef<"div">;

export function SelectPopup({ className, ...props }: SelectPopupProps) {
  const { content } = select();
  return <div data-slot="select-content" className={content({ className })} {...props} />;
}

type SelectFramePositionerProps = BaseSelect.Positioner.Props & {
  container?: SelectPortalProps["container"];
};

// Inside the portal, so it mounts each time the popup opens and reads the
// frame insets then: 8px from each inset, and from the window's edge elsewhere.
function SelectFramePositioner({
  collisionPadding,
  container,
  ...props
}: SelectFramePositionerProps) {
  const padding = usePopupCollisionPadding(collisionPadding, 8, container);
  return <BaseSelect.Positioner collisionPadding={padding} {...props} />;
}

export type SelectContentProps = StyledProps<BaseSelect.Popup.Props> &
  Pick<
    BaseSelect.Positioner.Props,
    | "align"
    | "alignItemWithTrigger"
    | "alignOffset"
    | "anchor"
    | "arrowPadding"
    | "collisionAvoidance"
    | "collisionBoundary"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  > & {
    /**
     * Additional space to maintain from the edge of the collision boundary: 8px
     * from the window's edge, and 8px from a frame inset where a shell keeps one.
     * A value you pass is kept as it is.
     * @default 8
     */
    collisionPadding?: BaseSelect.Positioner.Props["collisionPadding"];
    portalProps?: SelectPortalProps;
  };

export function SelectContent({
  align = "start",
  alignItemWithTrigger = false,
  alignOffset = 0,
  anchor,
  arrowPadding,
  collisionAvoidance,
  collisionBoundary,
  collisionPadding,
  disableAnchorTracking,
  positionMethod = "fixed",
  side = "bottom",
  sideOffset,
  sticky,
  portalProps,
  className,
  ...props
}: SelectContentProps) {
  const { positioner, content } = select();
  const positionerNode = (
    <SelectFramePositioner
      align={align}
      alignItemWithTrigger={alignItemWithTrigger}
      alignOffset={alignOffset}
      anchor={anchor}
      arrowPadding={arrowPadding}
      collisionAvoidance={collisionAvoidance}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      container={portalProps?.container}
      disableAnchorTracking={disableAnchorTracking}
      positionMethod={positionMethod}
      side={side}
      sideOffset={sideOffset ?? 4}
      sticky={sticky}
      className={positioner()}
    >
      <BaseSelect.Popup data-slot="select-content" className={content({ className })} {...props} />
    </SelectFramePositioner>
  );

  return <SelectPortal {...portalProps}>{positionerNode}</SelectPortal>;
}

export type SelectListProps = StyledProps<BaseSelect.List.Props>;

export function SelectList({ className, ...props }: SelectListProps) {
  const { list } = select();
  return <BaseSelect.List data-slot="select-list" className={list({ className })} {...props} />;
}

export type SelectItemProps = StyledProps<BaseSelect.Item.Props>;

// An item with a description is named by its text alone and described by the
// description; without one, Base UI's name from content stays as it is.
interface SelectItemParts {
  readonly setTextId: (id: string | undefined) => void;
  readonly setDescriptionId: (id: string | undefined) => void;
}

const SelectItemPartsContext = createContext<SelectItemParts | null>(null);

export function SelectItem({ className, ...props }: SelectItemProps) {
  const chrome = useSelectChrome();
  const { item } = select({ chrome });
  const [textId, setTextId] = useState<string>();
  const [descriptionId, setDescriptionId] = useState<string>();
  const parts = useMemo(() => ({ setTextId, setDescriptionId }), []);
  return (
    <SelectItemPartsContext.Provider value={parts}>
      <BaseSelect.Item
        data-slot="select-item"
        className={item({ className })}
        aria-labelledby={descriptionId && textId ? textId : undefined}
        aria-describedby={descriptionId}
        {...props}
      />
    </SelectItemPartsContext.Provider>
  );
}

export type SelectItemLeadingProps = StyledProps<ComponentPropsWithRef<"span">>;

export function SelectItemLeading({ className, ...props }: SelectItemLeadingProps) {
  const { itemLeading } = select();
  return <span data-slot="select-item-leading" className={itemLeading({ className })} {...props} />;
}

export type SelectItemIndicatorProps = StyledProps<BaseSelect.ItemIndicator.Props>;

export function SelectItemIndicator({ className, children, ...props }: SelectItemIndicatorProps) {
  const { itemIndicator } = select();
  const defaultIndicator = <Check aria-hidden className="size-3 shrink-0" />;

  return (
    <BaseSelect.ItemIndicator
      data-slot="select-item-indicator"
      className={itemIndicator({ className })}
      {...props}
    >
      {children ?? defaultIndicator}
    </BaseSelect.ItemIndicator>
  );
}

export type SelectItemTextProps = StyledProps<BaseSelect.ItemText.Props>;

export function SelectItemText({ className, id, ref, title, ...props }: SelectItemTextProps) {
  const { itemText } = select();
  const overflowRef = useOverflowTitle(ref, title);
  const generatedId = useId();
  const textId = id ?? generatedId;
  const setTextId = useContext(SelectItemPartsContext)?.setTextId;
  useLayoutEffect(() => {
    setTextId?.(textId);
    return () => setTextId?.(undefined);
  }, [setTextId, textId]);
  return (
    <BaseSelect.ItemText
      ref={overflowRef}
      title={title}
      id={textId}
      data-slot="select-item-text"
      className={itemText({ className })}
      {...props}
    />
  );
}

export type SelectItemDescriptionProps = StyledProps<ComponentPropsWithRef<"span">>;

/**
 * A second line under an option's label: what it means, not its name again.
 * It sits beside `SelectItemText`, not inside it, so the selected value in the
 * trigger stays the label alone. The option grows to fit it.
 */
export function SelectItemDescription({ className, id, ...props }: SelectItemDescriptionProps) {
  const { itemDescription } = select();
  const generatedId = useId();
  const descriptionId = id ?? generatedId;
  const setDescriptionId = useContext(SelectItemPartsContext)?.setDescriptionId;
  useLayoutEffect(() => {
    setDescriptionId?.(descriptionId);
    return () => setDescriptionId?.(undefined);
  }, [setDescriptionId, descriptionId]);
  return (
    <span
      id={descriptionId}
      data-slot="select-item-description"
      className={itemDescription({ className })}
      {...props}
    />
  );
}

export type SelectActionItemProps = StyledProps<
  Omit<BaseSelect.Item.Props, "value" | "label" | "onClick">
> & {
  /**
   * Runs when the row is pressed: clicked, or Enter or Space while it is
   * highlighted. The row never becomes the Select's value and never calls
   * `onValueChange`.
   */
  onAction?: (event: Event) => void;
  /**
   * Whether pressing the row closes the list. Off by default: a list action
   * such as Show All changes what the list shows, so the list stays open.
   * @default false
   */
  closeOnAction?: boolean;
  /**
   * The text typeahead matches, when the row's content is not plain text.
   */
  label?: string;
};

/**
 * An action row inside the list, placed last after a `SelectSeparator`, such as
 * Show All. It is reached by the arrow keys and typeahead like an item, but
 * pressing it runs `onAction` instead of choosing a value. Pass `aria-expanded`
 * when it shows or hides more of the list.
 */
export function SelectActionItem({
  className,
  onAction,
  closeOnAction = false,
  ...props
}: SelectActionItemProps) {
  const chrome = useSelectChrome();
  const { actionItem } = select({ chrome });
  const onActionRef = useRef(onAction);
  const closeOnActionRef = useRef(closeOnAction);
  useLayoutEffect(() => {
    onActionRef.current = onAction;
    closeOnActionRef.current = closeOnAction;
  }, [onAction, closeOnAction]);
  const [value] = useState(() => new SelectActionValue(onActionRef, closeOnActionRef));
  return (
    <BaseSelect.Item
      data-slot="select-action-item"
      className={actionItem({ className })}
      value={value}
      {...props}
    />
  );
}

export type SelectLabelProps = StyledProps<BaseSelect.Label.Props>;

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  const { label } = select();
  return <BaseSelect.Label data-slot="select-label" className={label({ className })} {...props} />;
}

export type SelectGroupProps = StyledProps<BaseSelect.Group.Props>;

export function SelectGroup({ className, ...props }: SelectGroupProps) {
  const { group } = select();
  return <BaseSelect.Group data-slot="select-group" className={group({ className })} {...props} />;
}

export type SelectGroupLabelProps = StyledProps<BaseSelect.GroupLabel.Props>;

export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  const { groupLabel } = select();
  return (
    <BaseSelect.GroupLabel
      data-slot="select-group-label"
      className={groupLabel({ className })}
      {...props}
    />
  );
}

export type SelectSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  const { separator } = select();
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="select-separator"
      className={separator({ className })}
      {...props}
    />
  );
}

export type SelectScrollUpArrowProps = StyledProps<BaseSelect.ScrollUpArrow.Props>;

export function SelectScrollUpArrow({ className, children, ...props }: SelectScrollUpArrowProps) {
  const { scrollArrow } = select();
  return (
    <BaseSelect.ScrollUpArrow
      data-slot="select-scroll-up-arrow"
      data-direction="up"
      className={scrollArrow({ className })}
      {...props}
    >
      {children ?? <ChevronDown aria-hidden className="size-3.5 shrink-0 rotate-180" />}
    </BaseSelect.ScrollUpArrow>
  );
}

export type SelectScrollDownArrowProps = StyledProps<BaseSelect.ScrollDownArrow.Props>;

export function SelectScrollDownArrow({
  className,
  children,
  ...props
}: SelectScrollDownArrowProps) {
  const { scrollArrow } = select();
  return (
    <BaseSelect.ScrollDownArrow
      data-slot="select-scroll-down-arrow"
      data-direction="down"
      className={scrollArrow({ className })}
      {...props}
    >
      {children ?? <ChevronDown aria-hidden className="size-3.5 shrink-0" />}
    </BaseSelect.ScrollDownArrow>
  );
}

export type SelectArrowProps = StyledProps<BaseSelect.Arrow.Props>;

export function SelectArrow({ className, ...props }: SelectArrowProps) {
  return <BaseSelect.Arrow data-slot="select-arrow" className={className} {...props} />;
}
