import { createContext, use, useCallback, useMemo, useState } from "react";
import type { ComponentPropsWithRef } from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Check, X } from "lucide-react";
import { tv } from "../../lib/tv";
import { useOverflowTitle } from "../../lib/use-overflow-title";
import type { StyledProps } from "../../lib/styled-props";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { Button } from "../button/index";

const combobox = tv({
  slots: {
    trigger: [
      "inline-flex select-none items-center justify-between",
      "outline-none transition-colors",
      "**:data-[slot='button-content']:w-full **:data-[slot='button-content']:justify-between",
      "[&>span[data-slot='combobox-trigger-content']]:min-w-0 [&>span[data-slot='combobox-trigger-content']]:flex-1",
      "[&>span[data-slot='combobox-trigger-content']>svg]:shrink-0",
      "h-8 gap-1.5 rounded-control border-transparent bg-transparent px-2.5",
      "text-control font-semibold text-foreground-muted",
      "inset-ring inset-ring-line-seam hover:bg-transparent",
      "data-has-value:bg-info-soft data-has-value:text-foreground data-has-value:inset-ring-0 data-has-value:hover:bg-info-soft",
      "focus-visible:shadow-focus",
      "disabled:inset-ring-0 aria-disabled:inset-ring-0",
      "[&>span[data-slot='combobox-trigger-content']>svg:not([class*='size-'])]:size-3.5",
      "[&>span[data-slot='combobox-trigger-content']>svg:not([class*='stroke-'])]:stroke-2",
    ],
    triggerCount: [
      "inline-flex shrink-0 items-center justify-center",
      "h-auto min-w-0 px-0 font-mono text-mono-meta font-bold",
    ],
    triggerIndicator: [
      "ml-auto flex shrink-0 items-center justify-center",
      "transition-[background-color,color] duration-100",
      "[&>svg]:shrink-0",
      "rounded-sticker text-foreground-hint opacity-100",
      "hover:bg-transparent hover:text-foreground-hint",
      "[&>svg]:size-3.5 [&>svg]:stroke-2 [&>svg_*]:stroke-2",
    ],
    control: [
      "flex min-w-0 items-center gap-2",
      "outline-none",
      "[&>svg]:pointer-events-none [&>svg]:shrink-0",
      "[&_[data-slot='combobox-clear']]:size-5 [&_[data-slot='combobox-clear']]:min-w-5 **:data-[slot='combobox-clear']:shrink-0",
      "[&_[data-slot='combobox-trigger-indicator']]:size-4",
      "[&_[data-slot='combobox-trigger-indicator']>svg]:shrink-0",
      "min-h-control rounded-control border border-line-field bg-layer-card px-3 py-0",
      "font-sans text-body text-foreground",
      "transition-shadow duration-90 ease-out has-focus-visible:shadow-focus",
      "[&>svg]:text-foreground-hint [&>svg:not([class*='size-'])]:size-4.5",
      "[&>svg:not([class*='stroke-'])]:stroke-2",
      "[&_[data-slot='combobox-trigger-indicator']>svg]:size-4",
    ],
    inputGroup: [
      "flex items-center border-b",
      "h-10 gap-2 border-line-hairline bg-transparent px-3 py-0",
      "text-callout text-foreground-hint",
      "[&>svg]:size-4 [&>svg]:shrink-0",
      "first:rounded-t-container has-focus-visible:keyboard:inset-ring-2 has-focus-visible:keyboard:inset-ring-foreground",
    ],
    input: ["w-full outline-none"],
    positioner: ["isolate z-50 outline-none"],
    content: [
      "h-auto max-h-(--available-height) min-w-[220px] overflow-hidden",
      "max-w-[min(var(--available-width),max(var(--anchor-width),24rem))]",
      "outline-none",
      "rounded-container bg-layer-popover text-foreground",
      "shadow-float ring-1 ring-line-seam",
    ],
    header: ["flex items-center justify-between px-3", "gap-2 py-1.5 pr-1.5 pl-4"],
    separator: ["h-px shrink-0 border-0", "bg-line-hairline"],
    list: ["max-h-64 overflow-y-auto overscroll-contain", "flex flex-col p-1.5 scroll-py-1.5"],
    item: [
      "flex w-full shrink-0 cursor-default select-none items-center justify-between overflow-hidden",
      "text-left outline-none transition-colors",
      "min-h-option gap-2.5 rounded-control px-2.5 py-option-inset",
      "font-sans text-callout font-medium text-foreground wrap-anywhere",
      "bg-transparent hover:bg-brand-soft data-highlighted:bg-brand-soft",
      "data-selected:font-bold",
      "data-disabled:pointer-events-none data-disabled:text-foreground-disabled",
      "[&_svg]:pointer-events-none [&_svg]:shrink-0",
      "[&_svg:not([class*='size-'])]:size-4",
      "[&_svg:not([class*='stroke-'])]:stroke-2",
    ],
    itemIndicator: [
      "pointer-events-none ml-auto flex shrink-0 items-center justify-center",
      "text-foreground [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:stroke-2 [&>svg_*]:stroke-2",
    ],
    label: ["m-0", "font-sans text-caption font-bold text-foreground-hint"],
    clear: [
      "inline-flex items-center justify-center",
      "pointer-events-none opacity-0 outline-none transition-[background-color,color] duration-100",
      "data-visible:pointer-events-auto data-visible:opacity-100",
      "h-7 min-w-0 rounded-control px-2",
      "font-sans text-control font-semibold text-foreground-muted",
      "hover:bg-fill-pressed hover:text-foreground active:bg-fill-pressed",
      "focus-visible:shadow-focus",
      "[&>svg]:size-4 [&>svg]:stroke-2 [&>svg_*]:stroke-2",
    ],
    empty: ["px-4 py-3.5 text-left text-callout text-foreground-hint"],
    groupLabel: ["py-2", "px-2.5 pt-2 pb-1 text-caption font-bold text-foreground-hint"],
    chips: [
      "flex flex-wrap items-center",
      "min-h-control gap-1.5 rounded-control border border-line-field bg-layer-card py-1.5 pr-3 pl-1.5",
      "transition-shadow duration-90 ease-out has-focus-visible:shadow-focus",
    ],
    chip: [
      "inline-flex min-w-0 max-w-full items-center overflow-hidden",
      "[&>:not([data-slot=combobox-chip-remove])]:min-w-0 [&>:not([data-slot=combobox-chip-remove])]:truncate",
      "h-7 gap-1.5 rounded-chip bg-fill-muted pr-0.5 pl-2",
      "text-footnote font-semibold text-foreground",
    ],
    chipRemove: [
      "inline-flex shrink-0 items-center justify-center outline-none transition-colors",
      "size-[22px] rounded-sticker text-foreground-hint",
      "hover:bg-fill-pressed active:bg-fill-pressed focus-visible:shadow-focus",
      "[&>svg]:size-3.5",
    ],
  },
  variants: {
    inputOwner: {
      group: {
        input: [
          "min-w-0 flex-1 border-0 bg-transparent p-0",
          "font-sans text-callout text-foreground placeholder:text-foreground-hint",
        ],
      },
      control: {
        input: [
          "min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 shadow-none",
          "outline-none ring-0 focus:border-transparent focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          "font-sans text-body font-normal text-foreground",
          "placeholder:text-foreground-hint",
        ],
      },
    },
  },
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

  const handleInputValueChange = useCallback<
    NonNullable<ComboboxProps<Value, Multiple>["onInputValueChange"]>
  >(
    (nextInputValue, eventDetails) => {
      if (inputValue === undefined) {
        setUncontrolledInputValue(nextInputValue);
      }

      onInputValueChange?.(nextInputValue, eventDetails);
    },
    [inputValue, onInputValueChange],
  );

  const handleValueChange = useCallback<
    NonNullable<ComboboxProps<Value, Multiple>["onValueChange"]>
  >(
    (nextValue, eventDetails) => {
      if (value === undefined) {
        setUncontrolledValue(nextValue);
      }

      onValueChange?.(nextValue, eventDetails);
    },
    [value, onValueChange],
  );

  return (
    <ComboboxContext.Provider value={contextValue}>
      <BaseCombobox.Root
        data-slot="combobox"
        defaultInputValue={defaultInputValue}
        defaultValue={defaultValue}
        inputValue={inputValue}
        value={value}
        onInputValueChange={handleInputValueChange}
        onValueChange={handleValueChange}
        {...props}
      />
    </ComboboxContext.Provider>
  );
}

export type ComboboxLabelProps = StyledProps<BaseCombobox.Label.Props>;

export function ComboboxLabel({ className, ...props }: ComboboxLabelProps) {
  const { label } = combobox();
  return (
    <BaseCombobox.Label data-slot="combobox-label" className={label({ className })} {...props} />
  );
}

export type ComboboxValueProps = BaseCombobox.Value.Props;

export function ComboboxValue(props: ComboboxValueProps) {
  return <BaseCombobox.Value data-slot="combobox-value" {...props} />;
}

export type ComboboxTriggerProps = StyledProps<BaseCombobox.Trigger.Props>;

export function ComboboxTrigger({ className, children, render, ...props }: ComboboxTriggerProps) {
  const { hasValue } = use(ComboboxContext);
  const { trigger } = combobox();
  return (
    <BaseCombobox.Trigger
      data-slot="combobox-trigger"
      data-has-value={hasValue ? "" : undefined}
      render={render ?? <Button variant="outline" size="md" className={trigger({ className })} />}
      {...props}
    >
      <span
        data-slot="combobox-trigger-content"
        data-picker-trigger-content="combobox"
        className="flex min-w-0 flex-1 items-center gap-1.5"
      >
        {children}
      </span>
    </BaseCombobox.Trigger>
  );
}

export type ComboboxTriggerCountProps = StyledProps<ComponentPropsWithRef<"span">>;

export function ComboboxTriggerCount({ className, ...props }: ComboboxTriggerCountProps) {
  const { triggerCount } = combobox();
  return (
    <span data-slot="combobox-trigger-count" className={triggerCount({ className })} {...props} />
  );
}

export type ComboboxTriggerIndicatorProps = StyledProps<ComponentPropsWithRef<"span">>;

export function ComboboxTriggerIndicator({ className, ...props }: ComboboxTriggerIndicatorProps) {
  const { triggerIndicator } = combobox();
  return (
    <span
      data-slot="combobox-trigger-indicator"
      data-picker-trigger-indicator=""
      className={triggerIndicator({ className })}
      {...props}
    />
  );
}

export type ComboboxInputGroupProps = StyledProps<BaseCombobox.InputGroup.Props>;

export function ComboboxInputGroup({ className, ...props }: ComboboxInputGroupProps) {
  const { inputGroup } = combobox();
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
  const { control } = combobox();
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
  const inputOwner = use(ComboboxInputOwnerContext);
  const { input } = combobox({ inputOwner });
  return (
    <BaseCombobox.Input
      data-slot="combobox-input"
      className={input({
        className: [suppressPasswordManager && "keeper-ignore", className],
      })}
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
  const { content } = combobox();
  return <div data-slot="combobox-content" className={content({ className })} {...props} />;
}

export type ComboboxHeaderProps = ComponentPropsWithRef<"div">;

export function ComboboxHeader({ className, ...props }: ComboboxHeaderProps) {
  const { header } = combobox();
  return <div data-slot="combobox-header" className={header({ className })} {...props} />;
}

export type ComboboxSeparatorProps = StyledProps<ComponentPropsWithRef<"div">>;

export function ComboboxSeparator({ className, ...props }: ComboboxSeparatorProps) {
  const { separator } = combobox();
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
  collisionPadding = 8,
  disableAnchorTracking = true,
  positionMethod = "fixed",
  side = "bottom",
  sideOffset,
  sticky,
  portalProps,
  className,
  initialFocus = false,
  finalFocus = false,
  ...props
}: ComboboxContentProps) {
  const { positioner, content } = combobox();
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
        sideOffset={sideOffset ?? 4}
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
  const { list } = combobox();
  return <BaseCombobox.List data-slot="combobox-list" className={list({ className })} {...props} />;
}

export type ComboboxItemProps = StyledProps<BaseCombobox.Item.Props>;

export function ComboboxItem({ className, ...props }: ComboboxItemProps) {
  const { item } = combobox();
  return <BaseCombobox.Item data-slot="combobox-item" className={item({ className })} {...props} />;
}

export type ComboboxItemIndicatorProps = StyledProps<BaseCombobox.ItemIndicator.Props>;

export function ComboboxItemIndicator({
  className,
  children,
  ...props
}: ComboboxItemIndicatorProps) {
  const { itemIndicator } = combobox();
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
  const { visible } = use(ComboboxContext);
  const { clear } = combobox();
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
  const { empty } = combobox();
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
  const { groupLabel } = combobox();
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
  const { chips } = combobox();
  return (
    <BaseCombobox.Chips data-slot="combobox-chips" className={chips({ className })} {...props} />
  );
}

export type ComboboxChipProps = StyledProps<BaseCombobox.Chip.Props>;

export function ComboboxChip({ className, ref, title, ...props }: ComboboxChipProps) {
  const { chip } = combobox();
  const overflowRef = useOverflowTitle(ref, title);
  return (
    <BaseCombobox.Chip
      ref={overflowRef}
      title={title}
      data-slot="combobox-chip"
      className={chip({ className })}
      {...props}
    />
  );
}

export type ComboboxChipRemoveProps = StyledProps<BaseCombobox.ChipRemove.Props>;

export function ComboboxChipRemove({ className, children, ...props }: ComboboxChipRemoveProps) {
  const { chipRemove } = combobox();
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
