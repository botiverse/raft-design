import type { ComponentPropsWithRef } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown } from "lucide-react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button/index";

const select = tv({
  slots: {
    trigger: [
      "inline-flex select-none items-center justify-between gap-2",
      "outline-none transition-colors",
      "data-[placeholder]:text-foreground-placeholder",
      "aria-invalid:border-danger-base/45 aria-invalid:hover:border-danger-base/75 aria-invalid:focus-visible:border-danger-base/75 aria-invalid:focus-visible:ring-2 aria-invalid:focus-visible:ring-[color-mix(in_oklch,var(--state-danger-base)_60%,transparent)] aria-invalid:focus-visible:ring-offset-1 aria-invalid:focus-visible:ring-offset-background",
      "[&_[data-slot='button-content']]:w-full [&_[data-slot='button-content']]:justify-between",
      "[&>span[data-slot='select-trigger-content']]:min-w-0 [&>span[data-slot='select-trigger-content']]:flex-1",
      "[&_[data-slot='select-trigger-content']_svg]:!size-3.5 [&_[data-slot='select-trigger-content']_svg]:shrink-0 [&_[data-slot='select-trigger-content']_svg]:!stroke-[1.5] [&_[data-slot='select-trigger-content']_svg_*]:!stroke-[1.5]",
      "[&_[data-slot='select-icon']]:!stroke-[1.5] [&_[data-slot='select-icon']_*]:!stroke-[1.5]",
    ],
    icon: ["ml-auto flex shrink-0 items-center justify-center opacity-80 transition-transform"],
    value: ["flex min-w-0 flex-1 truncate text-left"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "relative max-h-[var(--available-height)] min-w-[max(var(--anchor-width),220px)] overflow-hidden bg-layer-panel",
      "outline-none",
    ],
    list: ["max-h-64 overflow-y-auto overscroll-contain scroll-py-6"],
    item: [
      "flex h-8 w-full shrink-0 cursor-default select-none items-center justify-between gap-2 overflow-hidden px-3",
      "text-left outline-none transition-colors",
    ],
    itemLeading: [
      "flex shrink-0 items-center justify-center",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    ],
    itemIndicator: ["pointer-events-none ml-auto flex shrink-0 items-center justify-center"],
    itemText: ["min-w-0 flex-1 truncate font-normal"],
    label: ["m-0 font-medium"],
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
          "flex w-full items-center justify-between gap-2 border-2 border-line-strong bg-layer-field p-2 text-sm text-foreground shadow-[var(--shadow-brutal-sm)] focus:outline-none",
          "hover:bg-layer-field hover:shadow-[var(--shadow-brutal-sm)]",
          "disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-foreground/50 disabled:opacity-100",
          "[&_[data-slot='select-value']_svg]:!stroke-2 [&_[data-slot='select-value']_svg_*]:!stroke-2",
          "data-[popup-open]:translate-x-0 data-[popup-open]:translate-y-0",
          "data-[popup-open]:hover:translate-x-0 data-[popup-open]:hover:translate-y-0",
          "[&[data-popup-open]_[data-slot='select-icon']]:rotate-180",
        ],
        content: [
          "w-[var(--anchor-width)] min-w-[var(--anchor-width)] border-2 border-line-strong bg-layer-popover shadow-[var(--shadow-brutal)]",
        ],
        item: [
          "h-auto border-b border-ink-10 bg-layer-popover py-1.5 text-xs font-bold leading-6 text-foreground last:border-b-0",
          "[&_[data-slot='select-item-text']]:font-bold",
          "hover:bg-soft-signal/30 data-[highlighted]:bg-soft-signal/30",
          "data-[selected]:bg-layer-popover data-[selected]:hover:bg-soft-signal/30 data-[selected][data-highlighted]:bg-soft-signal/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&_svg:not([class*='size-'])]:size-3",
          "[&>svg]:!stroke-2 [&>svg_*]:!stroke-2",
        ],
        itemLeading: [
          "size-5 text-foreground [&_svg]:size-3.5 [&_svg]:stroke-2 [&_svg_*]:stroke-2",
        ],
        itemIndicator: ["text-foreground [&_svg]:!stroke-[2.25] [&_svg_*]:!stroke-[2.25]"],
        label: [
          "font-sans text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground",
        ],
        groupLabel: [
          "font-sans text-[10px] font-semibold uppercase leading-none tracking-wide text-foreground/60",
        ],
        separator: ["bg-line-strong"],
        scrollArrow: [
          "border-line-strong bg-layer-popover text-foreground",
          "data-[direction=up]:border-b data-[direction=down]:border-t",
        ],
        empty: ["font-sans text-sm font-semibold text-foreground/50"],
      },
      elegant: {
        trigger: [
          "text-sm font-medium tracking-[-0.005em] text-foreground-muted",
          "data-[popup-open]:[--button-focus-outline:transparent]",
          "data-[popup-open]:shadow-[0_0_0_0.5px_oklch(0.21_0.006_285_/_0.14),0_0_0_3px_color-mix(in_oklch,var(--primary-400)_80%,transparent)]",
          "[&_[data-slot='button-content']]:font-medium [&_[data-slot='select-value']]:font-medium",
          "[&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5]",
        ],
        content: ["rounded-md bg-layer-popover", "shadow-lg"],
        list: ["flex flex-col gap-0.5 px-1 py-1"],
        item: [
          "rounded-sm bg-transparent px-2 text-sm font-normal tracking-[-0.005em] text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-foreground/[0.04] hover:text-foreground-strong",
          "data-[highlighted]:bg-foreground/[0.04] data-[highlighted]:text-foreground-strong",
          "data-[selected]:bg-foreground/[0.04] data-[selected]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&_svg:not([class*='size-'])]:size-3.5",
        ],
        itemLeading: [
          "size-4 text-foreground-muted [&_svg]:size-3.5 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5]",
        ],
        itemIndicator: ["text-foreground-strong"],
        label: ["text-[11px] leading-none tracking-[-0.005em] text-foreground-strong"],
        groupLabel: [
          "px-2 text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground/45",
        ],
        separator: ["hidden bg-line-muted"],
        scrollArrow: ["bg-layer-popover text-foreground-placeholder hover:text-foreground-muted"],
        empty: ["text-foreground-muted"],
      },
    },
  },
});

export type SelectProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseSelect.Root.Props<Value, Multiple>;

export function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectProps<Value, Multiple>,
) {
  return <BaseSelect.Root data-slot="select" {...props} />;
}

export type SelectTriggerProps = StyledProps<BaseSelect.Trigger.Props>;

export function SelectTrigger({ className, children, render, ...props }: SelectTriggerProps) {
  const theme = useThemeFamily();
  const { trigger } = select({ theme });
  const defaultRender = theme === "brutal" ? undefined : <Button variant="outline" size="md" />;
  const renderProp = render ?? defaultRender;

  return (
    <BaseSelect.Trigger
      data-slot="select-trigger"
      {...(renderProp ? { render: renderProp } : {})}
      className={trigger({ className })}
      {...props}
    >
      <span data-slot="select-trigger-content" className="flex min-w-0 flex-1 items-center gap-1.5">
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
    <BaseSelect.Icon data-slot="select-icon" className={icon({ className })} {...props}>
      {children ?? <ChevronDown aria-hidden className="size-3.5 shrink-0" />}
    </BaseSelect.Icon>
  );
}

export type SelectPortalProps = BaseSelect.Portal.Props;

export function SelectPortal(props: SelectPortalProps) {
  return <BaseSelect.Portal data-slot="select-portal" {...props} />;
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
  ...props
}: SelectContentProps) {
  const theme = useThemeFamily();
  const { positioner, content } = select({ theme });
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
    >
      <BaseSelect.Popup data-slot="select-content" className={content({ className })} {...props} />
    </BaseSelect.Positioner>
  );

  return <BaseSelect.Portal {...portalProps}>{positionerNode}</BaseSelect.Portal>;
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
  const { item } = select({ theme });
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
      <Check aria-hidden size={12} className="shrink-0 !stroke-[2.25]" />
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
  return <BaseSelect.Group data-slot="select-group" className={className} {...props} />;
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
