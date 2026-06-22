import { createContext, use, useState, type ComponentPropsWithRef } from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Check, X } from "lucide-react";
import { tv } from "../../lib/tv.ts";
import type { StyledProps } from "../../lib/styled-props.ts";
import { useTheme } from "../../lib/theme/use-theme.ts";
import { Button } from "../button/index.ts";

const combobox = tv({
  slots: {
    trigger: [
      "inline-flex select-none items-center justify-between gap-2",
      "outline-none transition-colors",
      "[&_[data-slot='button-content']]:w-full [&_[data-slot='button-content']]:justify-between",
      "[&>span[data-slot='combobox-trigger-content']]:min-w-0 [&>span[data-slot='combobox-trigger-content']]:flex-1",
      "[&_[data-slot='combobox-trigger-content']_svg]:!size-3 [&_[data-slot='combobox-trigger-content']_svg]:shrink-0 [&_[data-slot='combobox-trigger-content']_svg]:!stroke-[1.5] [&_[data-slot='combobox-trigger-content']_svg_*]:!stroke-[1.5]",
      "[&_[data-slot='combobox-trigger-indicator']]:!stroke-[1.5] [&_[data-slot='combobox-trigger-indicator']_*]:!stroke-[1.5]",
    ],
    triggerIndicator: ["ml-auto flex shrink-0 items-center justify-center opacity-60"],
    control: [
      "flex min-w-0 items-center gap-2",
      "outline-none transition-colors",
      "[&_[data-slot='combobox-input']]:min-w-0 [&_[data-slot='combobox-input']]:flex-1",
      "[&_[data-slot='combobox-input']]:border-0 [&_[data-slot='combobox-input']]:bg-transparent [&_[data-slot='combobox-input']]:p-0",
      "[&_[data-slot='combobox-input']]:shadow-none [&_[data-slot='combobox-input']]:outline-none [&_[data-slot='combobox-input']]:ring-0",
      "[&_[data-slot='combobox-input']]:focus:border-transparent [&_[data-slot='combobox-input']]:focus:ring-0 [&_[data-slot='combobox-input']]:focus-visible:ring-0",
      "[&_[data-slot='combobox-clear']]:size-5 [&_[data-slot='combobox-clear']]:min-w-5 [&_[data-slot='combobox-clear']]:shrink-0",
      "[&_[data-slot='combobox-trigger-indicator']]:size-4",
      "[&_[data-slot='combobox-trigger-indicator']_svg]:!size-3.5 [&_[data-slot='combobox-trigger-indicator']_svg]:shrink-0",
    ],
    inputGroup: ["flex items-center gap-2 border-b px-2 py-2"],
    input: ["w-full outline-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "h-auto max-h-[var(--available-height)] min-w-[220px] overflow-hidden bg-layer-panel",
      "outline-none",
    ],
    header: ["flex items-center justify-between px-3 py-2"],
    separator: ["h-px shrink-0 border-0"],
    list: ["max-h-64 overflow-y-auto overscroll-contain scroll-py-1"],
    item: [
      "flex w-full shrink-0 cursor-default select-none items-center justify-between gap-2 overflow-hidden px-3 py-1.5",
      "text-left outline-none transition-colors",
    ],
    itemIndicator: ["pointer-events-none ml-auto flex shrink-0 items-center justify-center"],
    label: ["m-0 font-medium"],
    clear: [
      "inline-flex h-5 min-w-8 items-center justify-center",
      "pointer-events-none opacity-0 outline-none transition-colors",
      "data-[visible]:pointer-events-auto data-[visible]:opacity-100",
    ],
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
        separator: ["bg-black"],
        item: [
          "border-b border-black/10 bg-white font-sans text-xs font-bold leading-6 text-black last:border-b-0",
          "hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-black/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-2 [&_svg_*]:stroke-2 [&_svg:not([class*='size-'])]:size-3",
        ],
        itemIndicator: ["text-black"],
        label: ["font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-black"],
        clear: [
          "font-sans text-[10px] font-bold uppercase tracking-wide text-black hover:text-black",
          "[&_svg]:![stroke-width:2] [&_svg_*]:![stroke-width:2]",
        ],
        triggerIndicator: [
          "text-black opacity-100",
          "[&_svg]:![stroke-width:2] [&_svg_*]:![stroke-width:2]",
        ],
        control: [
          "h-9 border-2 border-line-strong bg-white px-2 py-1",
          "font-mono text-xs font-bold text-black shadow-[var(--shadow)]",
          "focus-within:shadow-[var(--shadow-hover)]",
          "data-[popup-open]:translate-x-0 data-[popup-open]:translate-y-0",
          "[&_svg]:![stroke-width:1.5] [&_svg_*]:![stroke-width:1.5] [&_svg_*]:fill-none",
          "[&_[data-slot='combobox-input']]:font-mono [&_[data-slot='combobox-input']]:text-xs [&_[data-slot='combobox-input']]:font-bold [&_[data-slot='combobox-input']]:text-black",
          "[&_[data-slot='combobox-input']::placeholder]:text-black/40",
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
        trigger: [
          "text-sm font-medium tracking-[-0.005em] text-foreground-muted",
          "[&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5]",
        ],
        inputGroup: ["border-line-muted bg-layer-popover px-1.5 pt-1 pb-2"],
        input: [
          "rounded-sm border border-line-subtle bg-layer-field px-2 py-1 text-sm",
          "text-foreground outline-none transition duration-150",
          "placeholder:text-foreground-placeholder/70",
          "focus:border-line-strong/25 focus-visible:ring-2 focus-visible:ring-line-strong/8",
        ],
        content: [
          "rounded-md bg-layer-popover",
          "shadow-[0_1px_1px_oklch(0.21_0.006_285_/_0.10),0_0_0_1px_oklch(0.21_0.006_285_/_0.04),0_2px_12px_-4px_oklch(0.21_0.006_285_/_0.16)]",
        ],
        header: ["pl-2 pr-1.5 pt-2.5 pb-0.5"],
        separator: ["hidden bg-line-muted"],
        list: ["flex flex-col gap-0.5 px-1.5 py-1"],
        item: [
          "rounded-sm bg-transparent px-2 text-sm font-medium tracking-[-0.005em] text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-foreground/[0.04] hover:text-foreground-strong",
          "data-[highlighted]:bg-foreground/[0.04] data-[highlighted]:text-foreground-strong",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5] [&_svg:not([class*='size-'])]:size-3.5",
        ],
        itemIndicator: ["text-foreground-strong"],
        label: ["text-[11px] leading-none tracking-[-0.005em] text-foreground-strong"],
        clear: [
          "text-[11px] font-medium tracking-[-0.005em] text-foreground-muted hover:text-foreground-strong",
          "[&_svg]:![stroke-width:1.5] [&_svg_*]:![stroke-width:1.5]",
        ],
        triggerIndicator: [
          "text-foreground-muted opacity-100",
          "[&_svg]:![stroke-width:1.5] [&_svg_*]:![stroke-width:1.5]",
        ],
        control: [
          "h-9 rounded-md border border-line-subtle bg-layer-field px-2.5 py-1.5",
          "text-sm text-foreground shadow-[0_1px_1px_oklch(0.21_0.006_285_/_0.05)]",
          "focus-within:border-line-strong/25 focus-within:ring-2 focus-within:ring-line-strong/8",
          "[&_svg]:shrink-0 [&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5]",
          "[&_[data-slot='combobox-input']]:text-sm [&_[data-slot='combobox-input']]:text-foreground",
          "[&_[data-slot='combobox-input']::placeholder]:text-foreground-placeholder/70",
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

type ComboboxClearContextValue = {
  visible: boolean;
};

const ComboboxClearContext = createContext<ComboboxClearContextValue>({ visible: false });

function hasClearableValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value != null;
}

function hasClearableInputValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.length > 0;
  }

  if (typeof value === "number") {
    return true;
  }

  return value != null;
}

export type ComboboxProps<
  Value,
  Multiple extends boolean | undefined = false,
> = BaseCombobox.Root.Props<Value, Multiple>;

export function Combobox<Value, Multiple extends boolean | undefined = false>({
  defaultInputValue,
  defaultValue,
  inputValue,
  onInputValueChange,
  onValueChange,
  value,
  ...props
}: ComboboxProps<Value, Multiple>) {
  const [uncontrolledInputValue, setUncontrolledInputValue] = useState<unknown>(
    defaultInputValue ?? "",
  );
  const [uncontrolledValue, setUncontrolledValue] = useState<unknown>(defaultValue);

  const resolvedInputValue = inputValue === undefined ? uncontrolledInputValue : inputValue;
  const resolvedValue = value === undefined ? uncontrolledValue : value;

  return (
    <ComboboxClearContext.Provider
      value={{
        visible: hasClearableValue(resolvedValue) || hasClearableInputValue(resolvedInputValue),
      }}
    >
      <BaseCombobox.Root
        data-slot="combobox"
        defaultInputValue={defaultInputValue}
        defaultValue={defaultValue}
        inputValue={inputValue}
        value={value}
        onInputValueChange={(nextInputValue, eventDetails) => {
          if (inputValue === undefined) {
            setUncontrolledInputValue(nextInputValue);
          }

          onInputValueChange?.(nextInputValue, eventDetails);
        }}
        onValueChange={(nextValue, eventDetails) => {
          if (value === undefined) {
            setUncontrolledValue(nextValue);
          }

          onValueChange?.(nextValue, eventDetails);
        }}
        {...props}
      />
    </ComboboxClearContext.Provider>
  );
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

export function ComboboxTrigger({
  className,
  children,
  render = <Button variant="outline" size="md" />,
  ...props
}: ComboboxTriggerProps) {
  const theme = useTheme();
  const { trigger } = combobox({ theme });
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      render={render}
      className={trigger({ className })}
      {...props}
    >
      <span
        data-slot="combobox-trigger-content"
        className="flex min-w-0 flex-1 items-center gap-1.5"
      >
        {children}
      </span>
    </BaseCombobox.Trigger>
  );
}

export type ComboboxTriggerIndicatorProps = StyledProps<ComponentPropsWithRef<"span">>;

export function ComboboxTriggerIndicator({ className, ...props }: ComboboxTriggerIndicatorProps) {
  const theme = useTheme();
  const { triggerIndicator } = combobox({ theme });
  return (
    <span
      data-slot="combobox-trigger-indicator"
      className={triggerIndicator({ className })}
      {...props}
    />
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

export type ComboboxControlProps = StyledProps<BaseCombobox.InputGroup.Props>;

export function ComboboxControl({ className, ...props }: ComboboxControlProps) {
  const theme = useTheme();
  const { control } = combobox({ theme });
  return (
    <BaseCombobox.InputGroup
      data-slot="combobox-control"
      className={control({ className })}
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

export type ComboboxHeaderProps = ComponentPropsWithRef<"div">;

export function ComboboxHeader({ className, ...props }: ComboboxHeaderProps) {
  const theme = useTheme();
  const { header } = combobox({ theme });
  return <div data-slot="combobox-header" className={header({ className })} {...props} />;
}

export type ComboboxSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  const theme = useTheme();
  const { separator } = combobox({ theme });
  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      data-slot="combobox-separator"
      className={separator({ className })}
      {...props}
    />
  );
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
  initialFocus = false,
  finalFocus = false,
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
          initialFocus={initialFocus}
          finalFocus={finalFocus}
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
      {children ?? <Check aria-hidden className="size-3.5 shrink-0 stroke-[1.5]" />}
    </BaseCombobox.ItemIndicator>
  );
}

export type ComboboxClearProps = StyledProps<BaseCombobox.Clear.Props>;

export function ComboboxClear({
  className,
  children,
  keepMounted = true,
  ...props
}: ComboboxClearProps) {
  const theme = useTheme();
  const { visible } = use(ComboboxClearContext);
  const { clear } = combobox({ theme });
  return (
    <BaseCombobox.Clear
      data-slot="combobox-clear"
      data-visible={visible ? "" : undefined}
      aria-hidden={visible ? props["aria-hidden"] : true}
      keepMounted={keepMounted}
      className={clear({ className })}
      {...props}
    >
      {children ?? <X aria-hidden className="size-3.5 shrink-0" />}
    </BaseCombobox.Clear>
  );
}

export type ComboboxEmptyProps = StyledProps<BaseCombobox.Empty.Props>;

export function ComboboxEmpty({ className, children, ...props }: ComboboxEmptyProps) {
  const theme = useTheme();
  const { empty } = combobox({ theme });
  return (
    <BaseCombobox.Empty data-slot="combobox-empty" {...props}>
      {children == null ? null : (
        <div data-slot="combobox-empty-content" className={empty({ className })}>
          {children}
        </div>
      )}
    </BaseCombobox.Empty>
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
