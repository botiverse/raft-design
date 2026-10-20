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
  /** The placeholder of the search input at the top of the phone's bottom sheet. */
  search: string;
  /** The button that closes the phone's bottom sheet of a multiple select. */
  done: string;
  /** The close button of the phone's bottom sheet. */
  close: string;
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
     * On a phone (a touch screen under 48rem), more selectable options than this open a
     * bottom sheet instead of the anchored list.
     * @default 10
     */
    sheetThreshold?: number;
    /**
     * The title of the phone's bottom sheet. Defaults to the field's name: `aria-label`,
     * the text of `aria-labelledby`, or the `<label>` whose `for` is the field's `id`.
     */
    sheetTitle?: ReactNode;
    /** The text input: the field on a desktop, the search input of the bottom sheet on a phone. */
    inputProps?: Omit<BaseCombobox.Input.Props, "value" | "defaultValue" | "size" | "children">;
    /** The portal of the list, and of the phone's anchored list and bottom sheet. */
    portalProps?: BaseCombobox.Portal.Props;
    /** The desktop list's positioner. A phone positions its list itself. */
    positionerProps?: Omit<BaseCombobox.Positioner.Props, "children">;
    /** The desktop list's popup. */
    popupProps?: Omit<BaseCombobox.Popup.Props, "children">;
    className?: string;
    style?: CSSProperties;
  };
