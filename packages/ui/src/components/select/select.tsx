import { createContext, useContext } from "react";
import type { ComponentPropsWithRef } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
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
      "h-11 w-full gap-2 pr-3 pl-3.5",
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
      "outline-none",
      "rounded-container bg-layer-popover p-1.5 text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    list: ["max-h-64 overflow-y-auto overscroll-contain scroll-py-6", "flex flex-col"],
    item: [
      "flex w-full shrink-0 cursor-default select-none items-center justify-between overflow-hidden",
      "text-left outline-none transition-colors",
      "min-h-9 gap-2.5 rounded-control px-2.5 py-0",
      "text-callout font-medium text-foreground",
      "bg-transparent hover:bg-brand-soft data-highlighted:bg-brand-soft",
      "data-selected:font-bold data-selected:**:data-[slot='select-item-text']:font-bold",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&>svg]:pointer-events-none [&>svg]:shrink-0 [&>svg]:text-foreground-muted",
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
    itemText: ["min-w-0 flex-1 truncate"],
    label: ["m-0", "font-sans text-footnote font-semibold text-foreground-muted"],
    group: ["flex flex-col"],
    groupLabel: ["py-2", "px-2.5 pt-2 pb-1 text-caption font-bold text-foreground-hint"],
    separator: ["h-px shrink-0 border-0", "-mx-1.5 my-1.5 bg-line-hairline"],
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
          "h-11 py-0",
          "data-placeholder:font-field",
        ],
        item: ["text-field font-field", "**:data-[slot='select-item-text']:font-field"],
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

export function Select<Value, Multiple extends boolean | undefined = false>({
  chrome = "default",
  ...props
}: SelectProps<Value, Multiple>) {
  return (
    <SelectChromeContext value={chrome}>
      <BaseSelect.Root data-slot="select" data-chrome={chrome} {...props} />
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

export function SelectValue({ className, ...props }: SelectValueProps) {
  const { value } = select();
  return <BaseSelect.Value data-slot="select-value" className={value({ className })} {...props} />;
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
    | "collisionPadding"
    | "disableAnchorTracking"
    | "positionMethod"
    | "side"
    | "sideOffset"
    | "sticky"
  > & {
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
  disableAnchorTracking = true,
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
    <BaseSelect.Positioner
      align={align}
      alignItemWithTrigger={alignItemWithTrigger}
      alignOffset={alignOffset}
      anchor={anchor}
      arrowPadding={arrowPadding}
      collisionAvoidance={collisionAvoidance}
      collisionBoundary={collisionBoundary}
      collisionPadding={collisionPadding}
      disableAnchorTracking={disableAnchorTracking}
      positionMethod={positionMethod}
      side={side}
      sideOffset={sideOffset ?? 4}
      sticky={sticky}
      className={positioner()}
    >
      <BaseSelect.Popup data-slot="select-content" className={content({ className })} {...props} />
    </BaseSelect.Positioner>
  );

  return <SelectPortal {...portalProps}>{positionerNode}</SelectPortal>;
}

export type SelectListProps = StyledProps<BaseSelect.List.Props>;

export function SelectList({ className, ...props }: SelectListProps) {
  const { list } = select();
  return <BaseSelect.List data-slot="select-list" className={list({ className })} {...props} />;
}

export type SelectItemProps = StyledProps<BaseSelect.Item.Props>;

export function SelectItem({ className, ...props }: SelectItemProps) {
  const chrome = useSelectChrome();
  const { item } = select({ chrome });
  return <BaseSelect.Item data-slot="select-item" className={item({ className })} {...props} />;
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

export function SelectItemText({ className, ...props }: SelectItemTextProps) {
  const { itemText } = select();
  return (
    <BaseSelect.ItemText
      data-slot="select-item-text"
      className={itemText({ className })}
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
