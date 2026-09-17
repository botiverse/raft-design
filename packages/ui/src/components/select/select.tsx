import { createContext, useContext } from "react";
import type { ComponentPropsWithRef } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import type { DataAttributes } from "../../lib/data-attributes";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button/index";
import { useZIndex, ZIndexScope } from "../../lib/z-index/z-index";

const select = tv({
  slots: {
    trigger: [
      "inline-flex select-none items-center justify-between gap-2",
      "outline-none transition-colors",
      "data-invalid:border-danger/45 data-invalid:hover:border-danger/75 data-invalid:focus-visible:border-danger/75 data-invalid:focus-visible:ring-2 data-invalid:focus-visible:ring-[color-mix(in_oklch,var(--danger)_60%,transparent)]",
      "**:data-[slot='button-content']:w-full **:data-[slot='button-content']:justify-between",
      "[&>span[data-slot='select-trigger-content']]:min-w-0 [&>span[data-slot='select-trigger-content']]:flex-1",
      "[&_[data-slot='select-trigger-content']_svg]:shrink-0",
      "[&_[data-slot='select-trigger-content']_svg:not([class*='size-'])]:size-3.5",
      "[&_[data-slot='select-trigger-content']_svg:not([class*='stroke-'])]:stroke-[1.5]",
    ],
    icon: [
      "ml-auto flex shrink-0 items-center justify-center opacity-80 transition-transform",
      "[&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:stroke-[1.5] [&>svg_*]:stroke-[1.5]",
    ],
    value: ["flex min-w-0 flex-1 truncate text-left"],
    positioner: ["isolate z-dropdown outline-none"],
    content: [
      "relative max-h-(--available-height) min-w-[max(var(--anchor-width),220px)] overflow-hidden bg-layer-panel",
      "outline-none",
    ],
    list: ["max-h-64 overflow-y-auto overscroll-contain scroll-py-6"],
    item: [
      "flex w-full shrink-0 cursor-default select-none items-center justify-between gap-2 overflow-hidden px-3",
      "text-left outline-none transition-colors",
    ],
    itemLeading: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    ],
    itemIndicator: ["pointer-events-none ml-auto flex shrink-0 items-center justify-center"],
    itemText: ["min-w-0 flex-1 truncate"],
    label: ["m-0 font-medium"],
    group: ["flex flex-col"],
    groupLabel: ["px-3 py-2"],
    separator: ["h-px shrink-0 border-0"],
    scrollArrow: [
      "absolute inset-x-0 z-10 flex h-6 w-full cursor-default items-center justify-center",
      "outline-none transition-colors",
      "data-[direction=up]:top-0 data-[direction=down]:bottom-0",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    ],
    empty: ["px-3 py-4 text-center text-sm"],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "w-full",
          "data-popup-open:-translate-y-px data-popup-open:shadow-raft-md",
          "active:translate-x-0 active:-translate-y-px active:shadow-raft-md",
          "[&_[data-slot='select-value']_svg:not([class*='stroke-'])]:stroke-2",
          "[&[data-popup-open]_[data-slot='select-icon']]:rotate-180",
        ],
        content: [
          "w-(--anchor-width) min-w-(--anchor-width) border-2 border-line-strong bg-layer-popover shadow-raft-md",
        ],
        item: [
          "border-b border-ink-10 bg-layer-popover py-1.5 text-xs font-bold leading-6 text-foreground-strong last:border-b-0",
          "**:data-[slot='select-item-text']:font-bold",
          "hover:bg-primary/30 data-highlighted:bg-primary/30",
          "data-selected:bg-layer-popover data-selected:hover:bg-primary/30 data-[selected][data-highlighted]:bg-primary/30",
          "data-disabled:pointer-events-none data-disabled:text-foreground-strong/30",
          "[&>svg]:pointer-events-none [&>svg]:shrink-0",
          "[&>svg:not([class*='size-'])]:size-3",
          "[&>svg:not([class*='stroke-'])]:stroke-2",
        ],
        itemLeading: [
          "size-5 text-foreground-strong",
          "[&>svg]:pointer-events-none [&>svg]:shrink-0",
          "[&>svg:not([class*='size-'])]:size-3.5",
          "[&>svg:not([class*='stroke-'])]:stroke-2",
        ],
        itemIndicator: [
          "text-foreground-strong [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:stroke-[2.25] [&>svg_*]:stroke-[2.25]",
        ],
        label: [
          "font-sans text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground-strong",
        ],
        groupLabel: [
          "font-sans text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground-strong/60",
        ],
        separator: ["bg-line-strong"],
        scrollArrow: [
          "border-line-strong bg-layer-popover text-foreground-strong",
          "data-[direction=up]:border-b data-[direction=down]:border-t",
        ],
        empty: ["font-sans text-sm font-semibold text-foreground-strong/50"],
      },
      elegant: {
        trigger: [
          "text-sm font-medium tracking-[-0.005em] text-foreground-muted",
          "hover:bg-ink-2 active:scale-100",
          "focus-visible:ring-1 focus-visible:ring-primary-400",
          "**:data-[slot='button-content']:font-medium **:data-[slot='select-value']:font-medium",
        ],
        content: ["rounded-md bg-layer-popover", "shadow-raft-lg"],
        list: ["flex flex-col gap-0.5 px-1 py-1"],
        item: [
          "rounded-sm bg-transparent px-2 py-1.5 text-[13px] font-normal leading-5 tracking-[-0.005em] text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-ink-4 hover:text-foreground",
          "data-highlighted:bg-ink-4 data-highlighted:text-foreground",
          "data-selected:bg-ink-4 data-selected:text-foreground",
          "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
          "[&>svg]:pointer-events-none [&>svg]:shrink-0",
          "[&>svg:not([class*='size-'])]:size-3.5",
          "[&>svg:not([class*='stroke-'])]:stroke-[1.5]",
        ],
        itemLeading: [
          "size-4 text-foreground-muted",
          "[&>svg]:pointer-events-none [&>svg]:shrink-0",
          "[&>svg:not([class*='size-'])]:size-3.5",
          "[&>svg:not([class*='stroke-'])]:stroke-[1.5]",
        ],
        itemIndicator: [
          "text-foreground [&>svg]:size-3 [&>svg]:shrink-0 [&>svg]:stroke-[1.5] [&>svg_*]:stroke-[1.5]",
        ],
        label: ["text-[11px] leading-none tracking-[-0.005em] text-foreground"],
        group: ["gap-0.5"],
        groupLabel: [
          "px-2 text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45",
        ],
        separator: ["hidden bg-line-hairline"],
        scrollArrow: ["bg-layer-popover text-foreground-placeholder hover:text-foreground-muted"],
        empty: ["text-foreground-muted"],
      },
    },
    // `field` makes a Select carry the declared field metric axis instead of the
    // Button size scale it is built on. Trigger and options share font-size,
    // weight and line-height so a value does not change size when the list
    // opens; their height and padding stay separate, because a list row is not
    // a control and must not be stretched to the field's height.
    chrome: {
      default: {},
      field: {
        // The theme layers do not keep typography on the trigger/item element
        // alone: elegant pushes weight down onto `button-content` /
        // `select-value`, and brutal pushes it onto `select-item-text`. Those
        // are descendant selectors, so they outrank a plain `font-field` on the
        // ancestor no matter how tailwind-merge resolves. The axis therefore has
        // to restate itself at the same targets to win.
        trigger: [
          "h-auto px-3 py-2 text-field font-field",
          "**:data-[slot='button-content']:font-field **:data-[slot='select-value']:font-field",
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
  const theme = useThemeFamily();
  const chrome = useSelectChrome();
  const { trigger } = select({ theme, chrome });

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
  const theme = useThemeFamily();
  const { value } = select({ theme });
  return <BaseSelect.Value data-slot="select-value" className={value({ className })} {...props} />;
}

export type SelectIconProps = StyledProps<BaseSelect.Icon.Props>;

export function SelectIcon({ className, children, ...props }: SelectIconProps) {
  const theme = useThemeFamily();
  const { icon } = select({ theme });
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
  const theme = useThemeFamily();
  const { content } = select({ theme });
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
  sideOffset = 4,
  sticky,
  portalProps,
  className,
  style,
  children,
  ...props
}: SelectContentProps) {
  const theme = useThemeFamily();
  const { positioner, content } = select({ theme });
  const { style: zIndexStyle } = useZIndex({ tier: "dropdown" });
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
      sideOffset={sideOffset}
      sticky={sticky}
      className={positioner()}
      style={zIndexStyle}
    >
      <ZIndexScope tier="dropdown">
        <BaseSelect.Popup
          data-slot="select-content"
          className={content({ className })}
          style={style}
          {...props}
        >
          {children}
        </BaseSelect.Popup>
      </ZIndexScope>
    </BaseSelect.Positioner>
  );

  return <SelectPortal {...portalProps}>{positionerNode}</SelectPortal>;
}

export type SelectListProps = StyledProps<BaseSelect.List.Props>;

export function SelectList({ className, ...props }: SelectListProps) {
  const theme = useThemeFamily();
  const { list } = select({ theme });
  return <BaseSelect.List data-slot="select-list" className={list({ className })} {...props} />;
}

export type SelectItemProps = StyledProps<BaseSelect.Item.Props>;

export function SelectItem({ className, ...props }: SelectItemProps) {
  const theme = useThemeFamily();
  const chrome = useSelectChrome();
  const { item } = select({ theme, chrome });
  return <BaseSelect.Item data-slot="select-item" className={item({ className })} {...props} />;
}

export type SelectItemLeadingProps = StyledProps<ComponentPropsWithRef<"span">>;

export function SelectItemLeading({ className, ...props }: SelectItemLeadingProps) {
  const theme = useThemeFamily();
  const { itemLeading } = select({ theme });
  return <span data-slot="select-item-leading" className={itemLeading({ className })} {...props} />;
}

export type SelectItemIndicatorProps = StyledProps<BaseSelect.ItemIndicator.Props>;

export function SelectItemIndicator({ className, children, ...props }: SelectItemIndicatorProps) {
  const theme = useThemeFamily();
  const { itemIndicator } = select({ theme });
  const defaultIndicator =
    theme === "brutal" ? (
      <Check aria-hidden size={12} className="shrink-0" />
    ) : (
      <Check aria-hidden className="size-3 shrink-0" />
    );

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
  const theme = useThemeFamily();
  const { itemText } = select({ theme });
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
  const theme = useThemeFamily();
  const { label } = select({ theme });
  return <BaseSelect.Label data-slot="select-label" className={label({ className })} {...props} />;
}

export type SelectGroupProps = StyledProps<BaseSelect.Group.Props>;

export function SelectGroup({ className, ...props }: SelectGroupProps) {
  const theme = useThemeFamily();
  const { group } = select({ theme });
  return <BaseSelect.Group data-slot="select-group" className={group({ className })} {...props} />;
}

export type SelectGroupLabelProps = StyledProps<BaseSelect.GroupLabel.Props>;

export function SelectGroupLabel({ className, ...props }: SelectGroupLabelProps) {
  const theme = useThemeFamily();
  const { groupLabel } = select({ theme });
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
  const theme = useThemeFamily();
  const { separator } = select({ theme });
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
  const theme = useThemeFamily();
  const { scrollArrow } = select({ theme });
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
  const theme = useThemeFamily();
  const { scrollArrow } = select({ theme });
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
