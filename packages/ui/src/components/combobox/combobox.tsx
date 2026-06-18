import type { ComponentPropsWithRef } from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Check, ChevronDown, X } from "lucide-react";
import { tv } from "tailwind-variants";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";

const combobox = tv({
  slots: {
    trigger: [
      "inline-flex select-none items-center justify-between gap-2",
      "outline-none transition-colors",
    ],
    inputGroup: ["flex items-center gap-2 border-b px-2 py-2"],
    input: ["w-full outline-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "max-h-[var(--available-height)] min-w-[220px] overflow-hidden bg-layer-panel",
      "outline-none",
    ],
    list: ["max-h-64 overflow-y-auto"],
    item: [
      "flex h-9 w-full cursor-default select-none items-center justify-between gap-2 overflow-hidden px-3",
      "text-left outline-none transition-colors",
    ],
    itemIndicator: ["pointer-events-none ml-auto flex shrink-0 items-center justify-center"],
    label: ["m-0"],
    clear: ["outline-none transition-colors"],
    empty: ["px-3 py-4 text-center text-sm"],
    groupLabel: ["px-3 py-2"],
    chips: ["flex min-h-9 flex-wrap items-center gap-1"],
    chip: ["inline-flex items-center gap-1"],
    chipRemove: ["inline-flex items-center justify-center outline-none transition-colors"],
  },
  variants: {
    theme: {
      brutal: {
        trigger: [
          "font-sans text-xs font-bold text-black",
          "data-[popup-open]:translate-x-0 data-[popup-open]:translate-y-0",
          "data-[popup-open]:hover:translate-x-0 data-[popup-open]:hover:translate-y-0",
        ],
        inputGroup: ["border-black bg-white"],
        input: [
          "border-2 border-line-strong bg-layer-panel px-2 py-1 font-mono text-xs",
          "shadow-[var(--shadow)] focus:shadow-[var(--shadow-hover)]",
        ],
        content: [
          "border-2 border-black bg-white shadow-[var(--shadow-hover,4px_4px_0px_var(--color-black))]",
        ],
        item: [
          "border-b border-black/10 bg-white font-sans text-xs font-bold leading-6 text-black last:border-b-0",
          "hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3",
        ],
        itemIndicator: [],
        label: [
          "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-black/60",
        ],
        clear: [
          "font-sans text-[10px] font-bold uppercase tracking-wide text-black/50 hover:text-black",
        ],
        empty: ["font-sans text-xs font-bold text-black/50"],
        groupLabel: [
          "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-black/60",
        ],
        chips: ["border-2 border-line-strong bg-white px-2 py-1"],
        chip: ["border border-black bg-brutal-yellow px-1.5 py-0.5 font-sans text-xs font-bold"],
        chipRemove: ["text-black/50 hover:text-black"],
      },
      elegant: {
        trigger: ["text-sm font-medium tracking-[-0.005em] text-foreground-muted"],
        inputGroup: ["border-line-muted bg-layer-popover"],
        input: [
          "rounded-md border border-line-subtle bg-layer-field px-2 py-1 text-sm",
          "text-foreground outline-none transition duration-150",
          "placeholder:text-foreground-placeholder/70",
          "focus:border-line-strong/25 focus-visible:ring-2 focus-visible:ring-line-strong/8",
        ],
        content: [
          "rounded-md bg-layer-popover",
          "shadow-[0_1px_1px_oklch(0.21_0.006_285_/_0.10),0_0_0_1px_oklch(0.21_0.006_285_/_0.04),0_2px_12px_-4px_oklch(0.21_0.006_285_/_0.16)]",
        ],
        item: [
          "border-b border-line-muted bg-layer-popover text-sm font-medium tracking-[-0.005em] text-foreground-muted last:border-b-0",
          "hover:bg-foreground/[0.04] hover:text-foreground-strong",
          "data-[highlighted]:bg-foreground/[0.04] data-[highlighted]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&_svg:not([class*='size-'])]:size-4",
        ],
        itemIndicator: [],
        label: ["text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground/45"],
        clear: [
          "text-[11px] font-medium tracking-[-0.005em] text-foreground-muted hover:text-foreground-strong",
        ],
        empty: ["text-foreground-muted"],
        groupLabel: ["text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground/45"],
        chips: [
          "rounded-md border border-line-subtle bg-layer-field px-2 py-1",
          "focus-within:border-line-strong/25 focus-within:ring-2 focus-within:ring-line-strong/8",
        ],
        chip: ["rounded-sm bg-layer-muted px-1.5 py-0.5 text-xs font-medium text-foreground"],
        chipRemove: ["text-foreground-muted hover:text-foreground-strong"],
      },
    },
  },
});

export type ComboboxProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple>;

export function Combobox<Value, Multiple extends boolean | undefined = false>(
  props: ComboboxProps<Value, Multiple>,
) {
  return <BaseCombobox.Root data-slot="combobox" {...props} />;
}

export type ComboboxLabelProps = StyledProps<BaseCombobox.Label.Props>;

export function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  const theme = useTheme();
  const { label } = combobox({ theme });
  return (
    <BaseCombobox.Label data-slot="combobox-label" className={label({ className })} {...props} />
  );
}

export type ComboboxValueProps = BaseCombobox.Value.Props;

export function ComboboxValue(props: ComboboxValueProps) {
  return <BaseCombobox.Value data-slot="combobox-value" {...props} />;
}

export type ComboboxTriggerProps = StyledProps<BaseCombobox.Trigger.Props>;

export function ComboboxTrigger({ className, children, ...props }: ComboboxTriggerProps) {
  const theme = useTheme();
  const { trigger } = combobox({ theme });
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      className={trigger({ className })}
      {...props}
    >
      {children}
      <ChevronDown aria-hidden className="size-3.5 shrink-0 opacity-60" />
    </BaseCombobox.Trigger>
  );
}

export type ComboboxInputGroupProps = StyledProps<BaseCombobox.InputGroup.Props>;

export function ComboboxInputGroup({ className, ...props }: ComboboxInputGroupProps) {
  const theme = useTheme();
  const { inputGroup } = combobox({ theme });
  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-input-group"
      className={inputGroup({ className })}
      {...props}
    />
  );
}

export type ComboboxInputProps = StyledProps<BaseCombobox.Input.Props> & {
  suppressPasswordManager?: boolean;
};

export function ComboboxInput({
  suppressPasswordManager,
  className,
  ...props
}: ComboboxInputProps) {
  const theme = useTheme();
  const { input } = combobox({ theme });
  return (
    <BaseCombobox.Input
      data-slot="combobox-input"
      className={input({ className: [suppressPasswordManager && "keeper-ignore", className] })}
      data-1p-ignore={suppressPasswordManager ? "true" : undefined}
      data-bwignore={suppressPasswordManager ? "true" : undefined}
      data-form-type={suppressPasswordManager ? "other" : undefined}
      data-lpignore={suppressPasswordManager ? "true" : undefined}
      {...props}
    />
  );
}

export type ComboboxPortalProps = BaseCombobox.Portal.Props;

export function ComboboxPortal(props: ComboboxPortalProps) {
  return <BaseCombobox.Portal data-slot="combobox-portal" {...props} />;
}

export type ComboboxPopupProps = ComponentPropsWithRef<"div">;

export function ComboboxPopup({ className, ...props }: ComboboxPopupProps) {
  const theme = useTheme();
  const { content } = combobox({ theme });
  return <div data-slot="combobox-content" className={content({ className })} {...props} />;
}

export type ComboboxContentProps = StyledProps<BaseCombobox.Popup.Props> &
  Pick<
    BaseCombobox.Positioner.Props,
    | "align"
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
    portalProps?: ComboboxPortalProps;
  };

export function ComboboxContent({
  align = "start",
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
}: ComboboxContentProps) {
  const theme = useTheme();
  const { positioner, content } = combobox({ theme });
  return (
    <BaseCombobox.Portal {...portalProps}>
      <BaseCombobox.Positioner
        align={align}
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
        <BaseCombobox.Popup
          data-slot="combobox-content"
          className={content({ className })}
          {...props}
        />
      </BaseCombobox.Positioner>
    </BaseCombobox.Portal>
  );
}

export type ComboboxListProps = StyledProps<BaseCombobox.List.Props>;

export function ComboboxList({ className, ...props }: ComboboxListProps) {
  const theme = useTheme();
  const { list } = combobox({ theme });
  return <BaseCombobox.List data-slot="combobox-list" className={list({ className })} {...props} />;
}

export type ComboboxItemProps = StyledProps<BaseCombobox.Item.Props>;

export function ComboboxItem({ className, ...props }: ComboboxItemProps) {
  const theme = useTheme();
  const { item } = combobox({ theme });
  return <BaseCombobox.Item data-slot="combobox-item" className={item({ className })} {...props} />;
}

export type ComboboxItemIndicatorProps = StyledProps<BaseCombobox.ItemIndicator.Props>;

export function ComboboxItemIndicator({
  className,
  children,
  ...props
}: ComboboxItemIndicatorProps) {
  const theme = useTheme();
  const { itemIndicator } = combobox({ theme });
  return (
    <BaseCombobox.ItemIndicator
      data-slot="combobox-item-indicator"
      className={itemIndicator({ className })}
      {...props}
    >
      {children ?? <Check aria-hidden className="size-3 shrink-0" />}
    </BaseCombobox.ItemIndicator>
  );
}

export type ComboboxClearProps = StyledProps<BaseCombobox.Clear.Props>;

export function ComboboxClear({ className, children, ...props }: ComboboxClearProps) {
  const theme = useTheme();
  const { clear } = combobox({ theme });
  return (
    <BaseCombobox.Clear data-slot="combobox-clear" className={clear({ className })} {...props}>
      {children ?? <X aria-hidden className="size-3 shrink-0" />}
    </BaseCombobox.Clear>
  );
}

export type ComboboxEmptyProps = StyledProps<BaseCombobox.Empty.Props>;

export function ComboboxEmpty({ className, ...props }: ComboboxEmptyProps) {
  const theme = useTheme();
  const { empty } = combobox({ theme });
  return (
    <BaseCombobox.Empty data-slot="combobox-empty" className={empty({ className })} {...props} />
  );
}

export type ComboboxGroupProps = StyledProps<BaseCombobox.Group.Props>;

export function ComboboxGroup({ className, ...props }: ComboboxGroupProps) {
  return <BaseCombobox.Group data-slot="combobox-group" className={className} {...props} />;
}

export type ComboboxGroupLabelProps = StyledProps<BaseCombobox.GroupLabel.Props>;

export function ComboboxGroupLabel({ className, ...props }: ComboboxGroupLabelProps) {
  const theme = useTheme();
  const { groupLabel } = combobox({ theme });
  return (
    <BaseCombobox.GroupLabel
      data-slot="combobox-group-label"
      className={groupLabel({ className })}
      {...props}
    />
  );
}

export type ComboboxRowProps = StyledProps<BaseCombobox.Row.Props>;

export function ComboboxRow({ className, ...props }: ComboboxRowProps) {
  return <BaseCombobox.Row data-slot="combobox-row" className={className} {...props} />;
}

export type ComboboxCollectionProps = BaseCombobox.Collection.Props;

export function ComboboxCollection(props: ComboboxCollectionProps) {
  return <BaseCombobox.Collection data-slot="combobox-collection" {...props} />;
}

export type ComboboxChipsProps = StyledProps<BaseCombobox.Chips.Props>;

export function ComboboxChips({ className, ...props }: ComboboxChipsProps) {
  const theme = useTheme();
  const { chips } = combobox({ theme });
  return (
    <BaseCombobox.Chips data-slot="combobox-chips" className={chips({ className })} {...props} />
  );
}

export type ComboboxChipProps = StyledProps<BaseCombobox.Chip.Props>;

export function ComboboxChip({ className, ...props }: ComboboxChipProps) {
  const theme = useTheme();
  const { chip } = combobox({ theme });
  return <BaseCombobox.Chip data-slot="combobox-chip" className={chip({ className })} {...props} />;
}

export type ComboboxChipRemoveProps = StyledProps<BaseCombobox.ChipRemove.Props>;

export function ComboboxChipRemove({ className, children, ...props }: ComboboxChipRemoveProps) {
  const theme = useTheme();
  const { chipRemove } = combobox({ theme });
  return (
    <BaseCombobox.ChipRemove
      data-slot="combobox-chip-remove"
      className={chipRemove({ className })}
      {...props}
    >
      {children ?? <X aria-hidden className="size-3 shrink-0" />}
    </BaseCombobox.ChipRemove>
  );
}
