import { createContext, use, useMemo, useState, type ComponentPropsWithRef } from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Check, X } from "lucide-react";
import { tv } from "../../lib/tv";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { Button } from "../button/index";

const combobox = tv({
  slots: {
    trigger: [
      "inline-flex select-none items-center justify-between gap-2",
      "outline-none transition-colors",
      "[&_[data-slot='button-content']]:w-full [&_[data-slot='button-content']]:justify-between",
      "[&>span[data-slot='combobox-trigger-content']]:min-w-0 [&>span[data-slot='combobox-trigger-content']]:flex-1",
      "[&>span[data-slot='combobox-trigger-content']>svg]:shrink-0",
    ],
    triggerCount: [
      "inline-flex h-4 min-w-4 shrink-0 items-center justify-center px-1",
      "font-mono text-[10px] leading-none",
    ],
    triggerIndicator: [
      "ml-auto flex shrink-0 items-center justify-center opacity-60",
      "[&>svg]:size-3 [&>svg]:shrink-0",
    ],
    control: [
      "flex min-w-0 items-center gap-2",
      "outline-none transition-colors",
      "[&>svg]:pointer-events-none [&>svg]:shrink-0",
      "[&>svg:not([class*='size-'])]:size-3.5",
      "[&_[data-slot='combobox-clear']]:size-5 [&_[data-slot='combobox-clear']]:min-w-5 [&_[data-slot='combobox-clear']]:shrink-0",
      "[&_[data-slot='combobox-trigger-indicator']]:size-4",
      "[&_[data-slot='combobox-trigger-indicator']>svg]:size-3.5 [&_[data-slot='combobox-trigger-indicator']>svg]:shrink-0",
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
          "font-sans text-sm font-semibold text-foreground-strong",
          "shadow-none",
          "hover:translate-x-0 hover:translate-y-0 hover:shadow-none",
          "active:translate-x-0 active:translate-y-0 active:shadow-none",
          "data-[has-value]:bg-soft-signal data-[has-value]:text-foreground-strong data-[has-value]:shadow-sm",
          "data-[has-value]:hover:bg-soft-signal data-[has-value]:hover:shadow-sm data-[has-value]:active:shadow-sm",
          "[&>span[data-slot='combobox-trigger-content']>svg:not([class*='size-'])]:size-4",
          "[&>span[data-slot='combobox-trigger-content']>svg:not([class*='stroke-'])]:stroke-2",
        ],
        triggerCount: ["border border-line-strong"],
        inputGroup: ["border-line-strong bg-layer-panel"],
        content: ["border-2 border-line-strong bg-layer-popover shadow-lg"],
        separator: ["bg-line-strong"],
        item: [
          "border-b border-ink-10 bg-layer-popover font-sans text-sm font-semibold leading-6 text-foreground-strong last:border-b-0",
          "hover:bg-brutal-yellow/30 data-[highlighted]:bg-brutal-yellow/30",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-strong/30",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-3",
          "[&_svg:not([class*='stroke-'])]:stroke-2",
        ],
        itemIndicator: [
          "text-foreground-strong [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2",
        ],
        label: [
          "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-foreground-strong",
        ],
        clear: [
          "font-sans text-[10px] font-bold uppercase tracking-wide text-foreground-strong hover:text-foreground-strong",
          "[&>svg]:[stroke-width:2] [&>svg_*]:[stroke-width:2]",
        ],
        triggerIndicator: [
          "text-foreground-strong opacity-100",
          "[&>svg]:stroke-2 [&>svg_*]:stroke-2",
        ],
        control: [
          "border-2 border-line-strong bg-layer-panel px-2 py-1",
          "font-sans text-sm font-semibold text-foreground-strong shadow-sm",
          "focus-within:shadow-md",
          "data-[popup-open]:translate-x-0 data-[popup-open]:translate-y-0",
          "[&>svg:not([class*='stroke-'])]:stroke-[1.5]",
          "[&_[data-slot='combobox-trigger-indicator']>svg]:[stroke-width:1.5] [&_[data-slot='combobox-trigger-indicator']>svg_*]:[stroke-width:1.5] [&_[data-slot='combobox-trigger-indicator']>svg_*]:fill-none",
        ],
        empty: ["font-sans text-sm font-semibold text-foreground-strong/50"],
        groupLabel: [
          "font-sans text-[10px] font-bold uppercase leading-none tracking-wide text-foreground-strong/60",
        ],
        chips: ["border-2 border-line-strong bg-layer-panel px-2 py-1"],
        chip: [
          "border border-line-strong bg-brutal-yellow px-1.5 py-0.5 font-sans text-xs font-bold",
        ],
        chipRemove: ["text-foreground-strong/50 hover:text-foreground-strong"],
      },
      elegant: {
        trigger: [
          "text-sm font-medium tracking-[-0.005em] text-foreground-muted",
          "hover:bg-ink-2",
          "focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
          "[&>span[data-slot='combobox-trigger-content']>svg:not([class*='size-'])]:size-3",
          "[&>span[data-slot='combobox-trigger-content']>svg:not([class*='stroke-'])]:stroke-[1.5]",
        ],
        triggerCount: [
          "rounded-sm bg-primary-400 font-sans font-medium tracking-[0.22px] text-primary-950",
        ],
        inputGroup: ["border-line-faint bg-layer-popover px-1.5 pt-1 pb-2"],
        content: ["rounded-md bg-layer-popover", "shadow-lg"],
        header: ["pl-2 pr-1.5 pt-2.5 pb-0.5"],
        separator: ["hidden bg-line-faint"],
        list: ["flex flex-col gap-0.5 px-1.5 py-1"],
        item: [
          "rounded-sm bg-transparent px-2 text-sm font-normal tracking-[-0.005em] text-foreground-muted",
          "transition-[background-color,color] duration-150",
          "hover:bg-ink-4 hover:text-foreground",
          "data-[highlighted]:bg-ink-4 data-[highlighted]:text-foreground",
          "data-[disabled]:pointer-events-none data-[disabled]:text-foreground-disabled",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0",
          "[&_svg:not([class*='size-'])]:size-3.5",
          "[&_svg:not([class*='stroke-'])]:stroke-[1.5]",
        ],
        itemIndicator: [
          "text-foreground [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:stroke-[1.5] [&>svg_*]:stroke-[1.5]",
        ],
        label: ["text-[11px] leading-none tracking-[-0.005em] text-foreground"],
        clear: [
          "text-[11px] font-medium tracking-[-0.005em] text-foreground-muted hover:text-foreground",
          "[&>svg]:[stroke-width:1.5] [&>svg_*]:[stroke-width:1.5]",
        ],
        triggerIndicator: [
          "text-foreground-muted opacity-100",
          "[&_svg]:stroke-[1.5] [&_svg_*]:stroke-[1.5]",
        ],
        control: [
          "rounded-md border border-line-muted bg-layer-panel px-2.5 py-1.5",
          "text-sm font-normal text-foreground-strong shadow-[0_1px_1px_color-mix(in_oklch,var(--ink)_5%,transparent)]",
          "focus-within:ring-1 focus-within:ring-primary-400 focus-within:ring-offset-2 focus-within:ring-offset-layer-page",
          "[&>svg:not([class*='stroke-'])]:stroke-[1.5]",
        ],
        empty: ["text-foreground-muted"],
        groupLabel: [
          "text-[11px] font-medium leading-none tracking-[-0.005em] text-foreground-strong/45",
        ],
        chips: [
          "rounded-md border border-line-muted bg-layer-panel px-2 py-1",
          "focus-within:ring-1 focus-within:ring-primary-400 focus-within:ring-offset-2 focus-within:ring-offset-layer-page",
        ],
        chip: ["rounded-sm bg-fill-muted px-1.5 py-0.5 text-xs font-medium text-foreground-strong"],
        chipRemove: ["text-foreground-muted hover:text-foreground"],
      },
    },
    inputOwner: {
      group: {},
      control: {
        input: [
          "min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 shadow-none",
          "outline-none ring-0 focus:border-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
        ],
      },
    },
  },
  compoundVariants: [
    {
      theme: "brutal",
      inputOwner: "group",
      class: {
        input: [
          "border-2 border-line-strong bg-layer-panel px-2 py-1 font-mono text-xs",
          "shadow-sm focus:shadow-md",
        ],
      },
    },
    {
      theme: "brutal",
      inputOwner: "control",
      class: {
        input: [
          "font-sans text-sm font-semibold text-foreground-strong",
          "placeholder:text-foreground-strong/40",
        ],
      },
    },
    {
      theme: "elegant",
      inputOwner: "group",
      class: {
        input: [
          "rounded-sm border border-line-muted bg-layer-panel px-2 py-1 text-sm",
          "text-foreground-strong outline-none transition duration-150",
          "placeholder:text-foreground-placeholder/70",
          "focus-visible:ring-1 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-layer-page",
        ],
      },
    },
    {
      theme: "elegant",
      inputOwner: "control",
      class: {
        input: [
          "text-sm font-normal text-foreground-strong",
          "placeholder:text-foreground-placeholder/70",
        ],
      },
    },
  ],
});

type ComboboxContextValue = {
  hasValue: boolean;
  visible: boolean;
};

const ComboboxContext = createContext<ComboboxContextValue>({ hasValue: false, visible: false });
const ComboboxInputOwnerContext = createContext<"control" | "group">("group");

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
  const hasValue = hasClearableValue(resolvedValue);
  const visible = hasValue || hasClearableInputValue(resolvedInputValue);
  const contextValue = useMemo(() => ({ hasValue, visible }), [hasValue, visible]);

  return (
    <ComboboxContext.Provider value={contextValue}>
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
    </ComboboxContext.Provider>
  );
}

export type ComboboxLabelProps = StyledProps<BaseCombobox.Label.Props>;

export function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
  const { hasValue } = use(ComboboxContext);
  const { trigger } = combobox({ theme });
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      data-has-value={hasValue ? "" : undefined}
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

export type ComboboxTriggerCountProps = StyledProps<ComponentPropsWithRef<"span">>;

export function ComboboxTriggerCount({ className, ...props }: ComboboxTriggerCountProps) {
  const theme = useThemeFamily();
  const { triggerCount } = combobox({ theme });
  return (
    <span data-slot="combobox-trigger-count" className={triggerCount({ className })} {...props} />
  );
}

export type ComboboxTriggerIndicatorProps = StyledProps<ComponentPropsWithRef<"span">>;

export function ComboboxTriggerIndicator({ className, ...props }: ComboboxTriggerIndicatorProps) {
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
  const { inputGroup } = combobox({ theme });
  return (
    <ComboboxInputOwnerContext value="group">
      <BaseCombobox.InputGroup
        data-slot="combobox-input-group"
        className={inputGroup({ className })}
        {...props}
      />
    </ComboboxInputOwnerContext>
  );
}

export type ComboboxControlProps = StyledProps<BaseCombobox.InputGroup.Props>;

export function ComboboxControl({ className, ...props }: ComboboxControlProps) {
  const theme = useThemeFamily();
  const { control } = combobox({ theme });
  return (
    <ComboboxInputOwnerContext value="control">
      <BaseCombobox.InputGroup
        data-slot="combobox-control"
        className={control({ className })}
        {...props}
      />
    </ComboboxInputOwnerContext>
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
  const theme = useThemeFamily();
  const inputOwner = use(ComboboxInputOwnerContext);
  const { input } = combobox({ theme, inputOwner });
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
  return <BaseCombobox.Portal data-slot="combobox-portal" {...useThemeScopeProps(props)} />;
}

export type ComboboxPopupProps = ComponentPropsWithRef<"div">;

export function ComboboxPopup({ className, ...props }: ComboboxPopupProps) {
  const theme = useThemeFamily();
  const { content } = combobox({ theme });
  return <div data-slot="combobox-content" className={content({ className })} {...props} />;
}

export type ComboboxHeaderProps = ComponentPropsWithRef<"div">;

export function ComboboxHeader({ className, ...props }: ComboboxHeaderProps) {
  const theme = useThemeFamily();
  const { header } = combobox({ theme });
  return <div data-slot="combobox-header" className={header({ className })} {...props} />;
}

export type ComboboxSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
  const { positioner, content } = combobox({ theme });
  return (
    <ComboboxPortal {...portalProps}>
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
    </ComboboxPortal>
  );
}

export type ComboboxListProps = StyledProps<BaseCombobox.List.Props>;

export function ComboboxList({ className, ...props }: ComboboxListProps) {
  const theme = useThemeFamily();
  const { list } = combobox({ theme });
  return <BaseCombobox.List data-slot="combobox-list" className={list({ className })} {...props} />;
}

export type ComboboxItemProps = StyledProps<BaseCombobox.Item.Props>;

export function ComboboxItem({ className, ...props }: ComboboxItemProps) {
  const theme = useThemeFamily();
  const { item } = combobox({ theme });
  return <BaseCombobox.Item data-slot="combobox-item" className={item({ className })} {...props} />;
}

export type ComboboxItemIndicatorProps = StyledProps<BaseCombobox.ItemIndicator.Props>;

export function ComboboxItemIndicator({
  className,
  children,
  ...props
}: ComboboxItemIndicatorProps) {
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
  const { visible } = use(ComboboxContext);
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
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
  const theme = useThemeFamily();
  const { chips } = combobox({ theme });
  return (
    <BaseCombobox.Chips data-slot="combobox-chips" className={chips({ className })} {...props} />
  );
}

export type ComboboxChipProps = StyledProps<BaseCombobox.Chip.Props>;

export function ComboboxChip({ className, ...props }: ComboboxChipProps) {
  const theme = useThemeFamily();
  const { chip } = combobox({ theme });
  return <BaseCombobox.Chip data-slot="combobox-chip" className={chip({ className })} {...props} />;
}

export type ComboboxChipRemoveProps = StyledProps<BaseCombobox.ChipRemove.Props>;

export function ComboboxChipRemove({ className, children, ...props }: ComboboxChipRemoveProps) {
  const theme = useThemeFamily();
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
