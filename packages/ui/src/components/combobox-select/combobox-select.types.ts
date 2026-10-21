import type { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import type { ComponentPropsWithRef, CSSProperties, ReactNode } from "react";

export type ComboboxSelectValue = string | number;

export interface ComboboxSelectOption {
  value: ComboboxSelectValue;
  label: string;
  disabled?: boolean;
}

export interface ComboboxSelectGroup<Option = ComboboxSelectOption> {
  type: "group";
  key: string | number;
  label: ReactNode;
  children: readonly Option[];
}

export type ComboboxSelectSelection<Multiple extends boolean | undefined> = Multiple extends true
  ? ComboboxSelectValue[]
  : ComboboxSelectValue | null;

export interface ComboboxSelectMessages {
  clear: string;
  toggle: string;
  selected: string;
  chipDescription: string;
  inputDescription: string;
  remove: (label: string) => string;
}

type RootProps = BaseCombobox.Root.Props<unknown, boolean>;

export type ComboboxSelectProps<
  Option = ComboboxSelectOption,
  Multiple extends boolean | undefined = false,
> = Pick<
  RootProps,
  | "name"
  | "form"
  | "required"
  | "disabled"
  | "readOnly"
  | "open"
  | "defaultOpen"
  | "onOpenChange"
  | "onOpenChangeComplete"
  | "autoHighlight"
  | "autoComplete"
  | "inputValue"
  | "defaultInputValue"
  | "onInputValueChange"
> &
  Pick<
    ComponentPropsWithRef<"input">,
    "id" | "ref" | "aria-label" | "aria-labelledby" | "aria-describedby" | "aria-invalid"
  > & {
    options: readonly (Option | ComboboxSelectGroup<Option>)[];
    multiple?: Multiple;
    value?: ComboboxSelectSelection<Multiple>;
    defaultValue?: ComboboxSelectSelection<Multiple>;
    onValueChange?: (
      value: ComboboxSelectSelection<Multiple>,
      options: Multiple extends true ? (Option | undefined)[] : Option | undefined | null,
      details: BaseCombobox.Root.ChangeEventDetails,
    ) => void;
    labelField?: keyof Option;
    valueField?: keyof Option;
    disabledField?: keyof Option;
    /** Supplies labels for values that have not been loaded yet. */
    fallbackOption?: (value: ComboboxSelectValue) => Option;
    filterable?: boolean;
    filter?: false | ((query: string, option: Option) => boolean);
    /** Display the provided results without local filtering. Requests belong to the caller. */
    remote?: boolean;
    onSearch?: (query: string) => void;
    loading?: boolean;
    create?: boolean;
    /** Alias for create, useful when matching Select libraries that call this mode creatable. */
    creatable?: boolean;
    /** Called only when the creation row is selected. Return null to reject creation. */
    onCreate?: (query: string) => Option | null;
    clearable?: boolean;
    showArrow?: boolean;
    clearFilterAfterSelect?: boolean;
    onClear?: () => void;
    /** Collapse chips when the control is unfocused; all remain reachable when focused. */
    maxTagCount?: number;
    size?: "sm" | "md" | "lg";
    status?: "error" | "warning";
    placeholder?: string;
    renderLabel?: (option: Option) => ReactNode;
    /** Customizes option content while preserving the Base UI option element. */
    renderOption?: (option: Option, info: { selected: boolean }) => ReactNode;
    /** Customizes chip content while preserving keyboard navigation and removal. */
    renderTag?: (option: Option) => ReactNode;
    renderCreateLabel?: (query: string) => ReactNode;
    emptyContent?: ReactNode;
    loadingContent?: ReactNode;
    messages?: Partial<ComboboxSelectMessages>;
    /**
     * The tallest the list gets before it scrolls, its 6px padding above and below
     * included: a CSS length, or a number of pixels. On a phone the list also gets
     * shorter to fit the room on its side, and opens above when that side has more
     * room and below is short of this height.
     * @default "16rem"
     */
    listMaxHeight?: number | string;
    inputProps?: Omit<BaseCombobox.Input.Props, "value" | "defaultValue" | "size" | "children">;
    portalProps?: BaseCombobox.Portal.Props;
    positionerProps?: Omit<BaseCombobox.Positioner.Props, "children">;
    popupProps?: Omit<BaseCombobox.Popup.Props, "children">;
    className?: string;
    style?: CSSProperties;
  };
