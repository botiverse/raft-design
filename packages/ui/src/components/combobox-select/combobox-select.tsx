import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { Select as BaseSelect } from "@base-ui/react/select";
import { Check, ChevronDown, LoaderCircle, Plus, Search, X } from "lucide-react";
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent, ReactNode, Ref } from "react";
import { usePhoneMedia } from "../../lib/phone-media";
import { useTheme } from "../../lib/theme/use-theme";
import { useThemeScopeProps } from "../../lib/theme/theme-scope";
import { Button } from "../button/index";
import {
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../drawer/index";
import type { DrawerPortalProps } from "../drawer/index";
import {
  COMBOBOX_SELECT_SHEET_THRESHOLD,
  countSelectableOptions,
  preferredListSide,
  resolveComboboxSelectMode,
} from "./combobox-select.mode";
import { isOptionGroup, normalizeOption, optionKey } from "./combobox-select.options";
import type { OptionRecord } from "./combobox-select.options";
import type {
  ComboboxSelectMessages,
  ComboboxSelectOption,
  ComboboxSelectProps,
  ComboboxSelectSelection,
  ComboboxSelectValue,
} from "./combobox-select.types";
import "./combobox-select.css";

const defaultMessages: ComboboxSelectMessages = {
  clear: "Clear selection",
  toggle: "Toggle options",
  selected: "Selected options",
  chipDescription: "Press Backspace or Delete to remove",
  inputDescription: "From the start of the input, press Left Arrow to focus selected options",
  remove: (label) => `Remove ${label}`,
  search: "Search",
  done: "Done",
  close: "Close",
};

const defaultRenderCreateLabel = (query: string) => `Create “${query}”`;

type ComboboxSelectGroupRecord<Option> = {
  key: string;
  label?: ReactNode;
  items: OptionRecord<Option>[];
};

function recordLabel<Option>(
  record: OptionRecord<Option>,
  renderLabel?: (option: Option) => ReactNode,
) {
  return record.option === undefined
    ? record.label
    : (renderLabel?.(record.option) ?? record.label);
}

function renderOptionContent<Option>({
  record,
  selected,
  renderLabel,
  renderOption,
  renderCreateLabel,
}: {
  record: OptionRecord<Option>;
  selected: boolean;
  renderLabel?: (option: Option) => ReactNode;
  renderOption?: (option: Option, info: { selected: boolean }) => ReactNode;
  renderCreateLabel: (query: string) => ReactNode;
}) {
  if (record.createQuery !== undefined) {
    return (
      <>
        <Plus aria-hidden />
        <span className="r-combobox-select__text">{renderCreateLabel(record.label)}</span>
      </>
    );
  }

  const content =
    record.option === undefined
      ? record.label
      : (renderOption?.(record.option, { selected }) ?? recordLabel(record, renderLabel));

  return (
    <>
      <span className="r-combobox-select__text">{content}</span>
      <BaseCombobox.ItemIndicator className="r-combobox-select__indicator">
        <Check aria-hidden />
      </BaseCombobox.ItemIndicator>
    </>
  );
}

function renderSelectedChip<Option>({
  record,
  index,
  tagLimit,
  strings,
  renderLabel,
  renderTag,
}: {
  record: OptionRecord<Option>;
  index: number;
  tagLimit: number;
  strings: ComboboxSelectMessages;
  renderLabel?: (option: Option) => ReactNode;
  renderTag?: (option: Option) => ReactNode;
}) {
  const label = recordLabel(record, renderLabel);
  const content =
    record.option === undefined ? record.label : (renderTag?.(record.option) ?? label);
  const overflow = index >= tagLimit;

  return (
    <BaseCombobox.Chip
      key={optionKey(record.value)}
      className="r-combobox-select__chip"
      data-overflow={overflow || undefined}
      aria-label={record.label}
      aria-description={strings.chipDescription}
    >
      <span className="r-combobox-select__text">{content}</span>
      <BaseCombobox.ChipRemove
        className="r-combobox-select__remove"
        aria-label={strings.remove(record.label)}
      >
        <X aria-hidden />
      </BaseCombobox.ChipRemove>
    </BaseCombobox.Chip>
  );
}

/** An option of the phone's anchored list: the same content as the field's list. */
function renderSelectOption<Option>({
  record,
  selected,
  loading,
  renderLabel,
  renderOption,
}: {
  record: OptionRecord<Option>;
  selected: boolean;
  loading: boolean;
  renderLabel?: (option: Option) => ReactNode;
  renderOption?: (option: Option, info: { selected: boolean }) => ReactNode;
}) {
  const content =
    record.option === undefined
      ? record.label
      : (renderOption?.(record.option, { selected }) ?? recordLabel(record, renderLabel));

  return (
    <BaseSelect.Item
      key={optionKey(record.value)}
      value={record}
      label={record.label}
      disabled={record.disabled || loading}
      className="r-combobox-select__option"
    >
      <BaseSelect.ItemText className="r-combobox-select__text">{content}</BaseSelect.ItemText>
      <BaseSelect.ItemIndicator className="r-combobox-select__indicator">
        <Check aria-hidden />
      </BaseSelect.ItemIndicator>
    </BaseSelect.Item>
  );
}

/** Change details for the phone's own changes: the clear button outside any Base UI root, the sheet's search emptied as it closes. */
function syntheticDetails(reason: "clear-press" | "input-clear", event: Event) {
  let canceled = false;
  return {
    reason,
    event,
    trigger: undefined,
    cancel() {
      canceled = true;
    },
    allowPropagation() {},
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return false;
    },
  } as unknown as BaseCombobox.Root.ChangeEventDetails;
}

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/** The text that names a field: its `aria-labelledby` elements, else its `<label>`. */
function readFieldLabel(element: HTMLButtonElement | null, labelledBy: string | undefined) {
  if (!element) return "";
  const doc = element.ownerDocument;
  const fromIds = (labelledBy ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((labelId) => doc.getElementById(labelId)?.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
  if (fromIds) return fromIds;
  return [...(element.labels ?? [])]
    .map((label) => label.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

/** The phone's anchored list keeps the side it opened on: it never flips while open. */
const PHONE_LIST_COLLISION = { side: "none", align: "shift", fallbackAxisSide: "none" } as const;

/** The side the phone's anchored list opens on, from the room around the field. */
function measureListSide(
  anchor: HTMLElement | null,
  groups: readonly { label?: ReactNode; items: readonly unknown[] }[],
) {
  const view = anchor?.ownerDocument.defaultView;
  if (!anchor || !view) return "bottom";
  const visual = view.visualViewport;
  const rows = groups.reduce(
    (count, group) => count + group.items.length + (group.label == null ? 0 : 1),
    0,
  );
  return preferredListSide(
    anchor.getBoundingClientRect(),
    visual
      ? { top: visual.offsetTop, height: visual.height }
      : { top: 0, height: view.innerHeight },
    rows * 36 + 12,
  );
}

/** Options-driven composition. The stable compound Combobox API stays unchanged. */
function isItemEqualToValue<Option>(a: OptionRecord<Option>, b: OptionRecord<Option>) {
  return a.createQuery === b.createQuery && a.value === b.value;
}

function itemToStringLabel<Option>(record: OptionRecord<Option>) {
  return record.label;
}

function itemToStringValue<Option>(record: OptionRecord<Option>) {
  return String(record.value);
}

export function ComboboxSelect<
  Option = ComboboxSelectOption,
  Multiple extends boolean | undefined = false,
>({
  options,
  multiple,
  value,
  defaultValue,
  onValueChange,
  labelField = "label" as keyof Option,
  valueField = "value" as keyof Option,
  disabledField = "disabled" as keyof Option,
  fallbackOption,
  filterable = true,
  filter,
  remote = false,
  onSearch,
  loading = false,
  create = false,
  creatable,
  onCreate,
  clearable = false,
  showArrow = true,
  clearFilterAfterSelect = true,
  onClear,
  maxTagCount,
  size = "md",
  status,
  placeholder = "Select an option",
  renderLabel,
  renderOption,
  renderTag,
  renderCreateLabel = defaultRenderCreateLabel,
  emptyContent = "No options found",
  loadingContent = "Loading…",
  messages,
  sheetThreshold = COMBOBOX_SELECT_SHEET_THRESHOLD,
  sheetTitle,
  inputProps,
  portalProps,
  positionerProps,
  popupProps,
  className,
  style,
  id: idProp,
  ref,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  disabled,
  readOnly,
  autoHighlight = true,
  ...rootProps
}: ComboboxSelectProps<Option, Multiple>) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const { resolvedMode } = useTheme();
  const scopedPortalProps = useThemeScopeProps(portalProps ?? {});
  const strings = { ...defaultMessages, ...messages };
  const [uncontrolledValue, setUncontrolledValue] = useState<
    ComboboxSelectValue | ComboboxSelectValue[] | null
  >(defaultValue ?? (multiple ? [] : null));
  const selectedValue = value === undefined ? uncontrolledValue : value;
  const selectedKeys = useMemo(
    () =>
      (Array.isArray(selectedValue)
        ? selectedValue
        : selectedValue == null
          ? []
          : [selectedValue]) as ComboboxSelectValue[],
    [selectedValue],
  );
  const [query, setQuery] = useState(String(defaultInputValue ?? ""));
  const [createdOptions, setCreatedOptions] = useState<Option[]>([]);
  const collator = useMemo(
    () => new Intl.Collator(undefined, { sensitivity: "base", usage: "search" }),
    [],
  );
  const normalized = useMemo(() => {
    const normalize = (option: Option) =>
      normalizeOption(option, labelField, valueField, disabledField);
    const groups: ComboboxSelectGroupRecord<Option>[] = [];
    options.forEach((option, index) => {
      if (isOptionGroup(option)) {
        groups.push({
          key: `group:${optionKey(option.key)}`,
          label: option.label,
          items: option.children.map(normalize),
        });
      } else {
        groups.push({ key: `option:${index}`, items: [normalize(option)] });
      }
    });
    const records = new Map(
      groups.flatMap((group) => group.items.map((record) => [record.value, record] as const)),
    );
    const created = createdOptions.map(normalize).filter((record) => !records.has(record.value));
    created.forEach((record) => records.set(record.value, record));
    if (created.length) groups.push({ key: "created", items: created });
    return { groups, records };
  }, [options, createdOptions, labelField, valueField, disabledField]);

  // Keep only selected records between result windows. This also handles controlled
  // initial values and externally changed options without retaining every search result.
  const [retained, setRetained] = useState<Map<ComboboxSelectValue, OptionRecord<Option>>>(
    () => new Map(),
  );
  const selected = useMemo((): OptionRecord<Option>[] => {
    return selectedKeys.map(
      (key) =>
        normalized.records.get(key) ??
        retained.get(key) ??
        (fallbackOption
          ? normalizeOption(fallbackOption(key), labelField, valueField, disabledField)
          : { value: key, label: String(key), disabled: false }),
    );
  }, [selectedKeys, normalized, retained, fallbackOption, labelField, valueField, disabledField]);
  if (
    retained.size !== selected.length ||
    !selected.every((record) => retained.get(record.value) === record)
  ) {
    setRetained(new Map(selected.map((record) => [record.value, record])));
  }

  const search = String(inputValue ?? query).trim();
  const canCreate =
    (create || creatable) &&
    filterable &&
    !loading &&
    search !== "" &&
    ![...normalized.records.values(), ...selected].some(
      (record) => record.label.trim().toLocaleLowerCase() === search.toLocaleLowerCase(),
    );
  const items = useMemo(() => {
    if (!canCreate) return normalized.groups;
    const candidate: OptionRecord<Option> = {
      value: search,
      label: search,
      disabled: false,
      createQuery: search,
    };
    return [...normalized.groups, { key: "create", items: [candidate] }];
  }, [canCreate, normalized.groups, search]);
  const css = `r-combobox-select r-combobox-select--${size}${resolvedMode === "dark" ? " r-combobox-select--dark" : ""}`;
  const tagLimit = maxTagCount === undefined ? Infinity : Math.max(0, Math.floor(maxTagCount));
  const inputClassName = [
    "r-combobox-select__input",
    typeof inputProps?.className === "string" ? inputProps.className : null,
  ]
    .filter(Boolean)
    .join(" ");
  const controlClassName = [
    css,
    "r-combobox-select__control has-focus-visible:shadow-focus",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  const positionerClassName = [
    "r-combobox-select__positioner",
    typeof positionerProps?.className === "string" ? positionerProps.className : null,
  ]
    .filter(Boolean)
    .join(" ");
  const popupClassName = [
    css,
    "r-combobox-select__popup",
    typeof popupProps?.className === "string" ? popupProps.className : null,
  ]
    .filter(Boolean)
    .join(" ");
  const inputRef = ref ?? inputProps?.ref;
  const inputLabel = ariaLabel ?? inputProps?.["aria-label"];
  const inputLabelledBy = ariaLabelledBy ?? inputProps?.["aria-labelledby"];
  const inputDescribedBy = ariaDescribedBy ?? inputProps?.["aria-describedby"];
  const inputInvalid = ariaInvalid ?? (status === "error" ? true : inputProps?.["aria-invalid"]);
  const inputDescription =
    multiple && selected.length ? strings.inputDescription : inputProps?.["aria-description"];
  const inputPlaceholder = multiple && selected.length ? "" : placeholder;
  const inputReadOnly = readOnly || !filterable;
  const controlValue = multiple ? selected : (selected[0] ?? null);

  const handleValueChange = useCallback(
    (
      next: OptionRecord<Option> | OptionRecord<Option>[] | null,
      details: BaseCombobox.Root.ChangeEventDetails,
    ) => {
      const nextRecords = next === null ? [] : Array.isArray(next) ? next : [next];
      const createRecord = nextRecords.find((record) => record.createQuery !== undefined);
      let newOption: Option | undefined;
      let resolved = nextRecords;
      if (createRecord) {
        const created = onCreate
          ? onCreate(createRecord.label)
          : ({ [labelField]: createRecord.label, [valueField]: createRecord.label } as Option);
        if (created === null) {
          details.cancel();
          return;
        }
        const record = normalizeOption(created, labelField, valueField, disabledField);
        if (record.disabled) {
          details.cancel();
          return;
        }
        newOption = created;
        const existing = normalized.records.get(record.value) ?? retained.get(record.value);
        resolved = nextRecords.map((item) => (item === createRecord ? (existing ?? record) : item));
        resolved = [...new Map(resolved.map((item) => [item.value, item])).values()];
      }
      const nextValue = multiple
        ? resolved.map((record) => record.value)
        : (resolved[0]?.value ?? null);
      const nextOptions = multiple
        ? resolved.map((record) => record.option)
        : (resolved[0]?.option ?? null);
      onValueChange?.(
        nextValue as ComboboxSelectSelection<Multiple>,
        nextOptions as Multiple extends true ? (Option | undefined)[] : Option | undefined | null,
        details,
      );
      if (details.isCanceled) return;
      if (newOption !== undefined) setCreatedOptions((previous) => [...previous, newOption]);
      setRetained(new Map(resolved.map((record) => [record.value, record])));
      if (value === undefined) setUncontrolledValue(nextValue);
      if (details.reason === "clear-press") onClear?.();
    },
    [
      multiple,
      onCreate,
      labelField,
      valueField,
      disabledField,
      normalized.records,
      retained,
      onValueChange,
      value,
      onClear,
    ],
  );

  const handleInputValueChange = useCallback(
    (next: string, details: BaseCombobox.Root.ChangeEventDetails) => {
      onInputValueChange?.(next, details);
      if (details.isCanceled) return;
      const shouldKeepQuery =
        details.reason === "input-change" ||
        (details.reason === "item-press" && !clearFilterAfterSelect);
      setQuery(shouldKeepQuery ? next : "");
      if (details.reason === "input-change" || details.reason === "clear-press") onSearch?.(next);
    },
    [onInputValueChange, clearFilterAfterSelect, onSearch],
  );

  const filterOptions = useCallback(
    (record: OptionRecord<Option>, pattern: string) => {
      if (record.createQuery !== undefined) return true;
      if (remote || !filterable || filter === false) return true;
      return record.option !== undefined && typeof filter === "function"
        ? filter(pattern, record.option)
        : collator.compare(record.label.slice(0, pattern.length), pattern) === 0 ||
            record.label.toLocaleLowerCase().includes(pattern.toLocaleLowerCase());
    },
    [remote, filterable, filter, collator],
  );

  const selectedChips = selected.map((record, index) =>
    renderSelectedChip({ record, index, tagLimit, strings, renderLabel, renderTag }),
  );
  const overflowCount = selected.length > tagLimit ? selected.length - tagLimit : 0;
  const overflowTitle = selected
    .slice(tagLimit)
    .map((record) => record.label)
    .join(", ");
  const overflow = overflowCount ? (
    <span className="r-combobox-select__overflow" title={overflowTitle}>
      +{overflowCount}
    </span>
  ) : null;

  function renderRecord(record: OptionRecord<Option>) {
    const itemKey = record.createQuery !== undefined ? "create" : optionKey(record.value);
    const isSelected = selected.some((item) => item.value === record.value);
    const content = renderOptionContent({
      record,
      selected: isSelected,
      renderLabel,
      renderOption,
      renderCreateLabel,
    });

    return (
      <BaseCombobox.Item
        key={itemKey}
        value={record}
        disabled={record.disabled || loading}
        className="r-combobox-select__option"
      >
        {content}
      </BaseCombobox.Item>
    );
  }

  function renderGroup(group: ComboboxSelectGroupRecord<Option>) {
    const groupLabel =
      group.label == null ? null : (
        <BaseCombobox.GroupLabel className="r-combobox-select__group-label">
          {group.label}
        </BaseCombobox.GroupLabel>
      );

    return (
      <BaseCombobox.Group key={group.key} items={group.items}>
        {groupLabel}
        <BaseCombobox.Collection>{renderRecord}</BaseCombobox.Collection>
      </BaseCombobox.Group>
    );
  }

  const input = (
    <BaseCombobox.Input
      {...inputProps}
      ref={inputRef}
      id={id}
      data-slot="combobox-select-input"
      className={inputClassName}
      aria-label={inputLabel}
      aria-labelledby={inputLabelledBy}
      aria-describedby={inputDescribedBy}
      aria-invalid={inputInvalid}
      aria-description={inputDescription}
      placeholder={inputPlaceholder}
      readOnly={inputReadOnly}
    />
  );
  const controlContent = multiple ? (
    <BaseCombobox.Chips className="r-combobox-select__chips" aria-label={strings.selected}>
      {selectedChips}
      {overflow}
      {input}
    </BaseCombobox.Chips>
  ) : (
    input
  );
  const loadingMessage = loading ? (
    <div className="r-combobox-select__message">{loadingContent}</div>
  ) : null;
  const emptyMessage = !loading ? (
    <div className="r-combobox-select__message">{emptyContent}</div>
  ) : null;
  const loadingIndicator = loading ? (
    <LoaderCircle className="r-combobox-select__spinner" aria-hidden />
  ) : null;
  const clearAction = clearable ? (
    <BaseCombobox.Clear className="r-combobox-select__action" aria-label={strings.clear}>
      <X aria-hidden />
    </BaseCombobox.Clear>
  ) : null;
  const triggerAction = showArrow ? (
    <BaseCombobox.Trigger className="r-combobox-select__action" aria-label={strings.toggle}>
      <ChevronDown aria-hidden />
    </BaseCombobox.Trigger>
  ) : null;
  const actions = (
    <span className="r-combobox-select__actions">
      {loadingIndicator}
      {clearAction}
      {triggerAction}
    </span>
  );
  const valueChange = handleValueChange as never;

  // On a phone the field opens without focusing a text input: the anchored list
  // for a few options, a bottom sheet for many or when typing drives the list.
  const phone = usePhoneMedia();
  const mode = resolveComboboxSelectMode({
    phone,
    optionCount: countSelectableOptions(normalized.groups),
    sheetThreshold,
    create: Boolean(create || creatable),
    remote,
  });
  const fieldRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [uncontrolledPhoneOpen, setUncontrolledPhoneOpen] = useState(
    Boolean(rootProps.defaultOpen),
  );
  const phoneOpen = rootProps.open ?? uncontrolledPhoneOpen;
  const [listSide, setListSide] = useState<"bottom" | "top">("bottom");
  const [fieldLabel, setFieldLabel] = useState("");
  const sheetNamed = sheetTitle != null || Boolean(inputLabel);

  useLayoutEffect(() => {
    if (mode !== "sheet" || !phoneOpen || sheetNamed) return;
    setFieldLabel(readFieldLabel(triggerRef.current, inputLabelledBy));
  }, [mode, phoneOpen, sheetNamed, inputLabelledBy]);

  const setSearchInput = useCallback(
    (element: HTMLInputElement | null) => {
      searchInputRef.current = element;
      assignRef(inputRef, element);
    },
    [inputRef],
  );

  const onOpenChangeProp = rootProps.onOpenChange;
  const openProp = rootProps.open;
  const groups = normalized.groups;
  const handlePhoneOpenChange = useCallback(
    (next: boolean, details: { isCanceled: boolean; event: Event }) => {
      onOpenChangeProp?.(next, details as never);
      if (details.isCanceled) return;
      // Chosen once, as the list opens: it doesn't flip while the viewport changes.
      if (next && mode === "list") setListSide(measureListSide(fieldRef.current, groups));
      // The sheet's search starts empty each time it opens, as the field's does.
      if (!next && mode === "sheet") {
        handleInputValueChange("", syntheticDetails("input-clear", details.event));
      }
      if (openProp === undefined) setUncontrolledPhoneOpen(next);
    },
    [onOpenChangeProp, openProp, mode, groups, handleInputValueChange],
  );

  const handleSheetValueChange = useCallback(
    (
      next: OptionRecord<Option> | OptionRecord<Option>[] | null,
      details: BaseCombobox.Root.ChangeEventDetails,
    ) => {
      handleValueChange(next, details);
      if (!multiple && !details.isCanceled) handlePhoneOpenChange(false, details);
    },
    [handleValueChange, multiple, handlePhoneOpenChange],
  );

  const handlePhoneClear = useCallback(
    (event: ReactMouseEvent<HTMLButtonElement>) => {
      handleValueChange(multiple ? [] : null, syntheticDetails("clear-press", event.nativeEvent));
    },
    [handleValueChange, multiple],
  );

  const focusSearchInput = useCallback(() => searchInputRef.current, []);

  if (mode !== "field") {
    const placeholderText = <span className="r-combobox-select__placeholder">{placeholder}</span>;
    const phoneValue = multiple ? (
      selected.length ? (
        <span className="r-combobox-select__chips">
          {selected.slice(0, tagLimit).map((record) => (
            <span key={optionKey(record.value)} className="r-combobox-select__chip">
              <span className="r-combobox-select__text">
                {record.option === undefined
                  ? record.label
                  : (renderTag?.(record.option) ?? recordLabel(record, renderLabel))}
              </span>
            </span>
          ))}
          {overflow}
        </span>
      ) : (
        placeholderText
      )
    ) : selected[0] ? (
      <span className="r-combobox-select__value">{selected[0].label}</span>
    ) : (
      placeholderText
    );
    const phoneClear =
      clearable && selected.length > 0 && !disabled && !readOnly ? (
        <button
          type="button"
          className="r-combobox-select__action r-combobox-select__clear"
          aria-label={strings.clear}
          onClick={handlePhoneClear}
        >
          <X aria-hidden />
        </button>
      ) : null;
    const phoneArrow = showArrow ? (
      <span className="r-combobox-select__action r-combobox-select__arrow" aria-hidden>
        <ChevronDown />
      </span>
    ) : null;
    const phoneActions = (
      <span className="r-combobox-select__actions">
        {loadingIndicator}
        {phoneClear}
        {phoneArrow}
      </span>
    );
    const phoneControlClassName = [
      css,
      "r-combobox-select__control r-combobox-select__control--trigger has-focus-visible:shadow-focus",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    const triggerProps = {
      ref: triggerRef,
      id,
      "data-slot": "combobox-select-trigger",
      className: "r-combobox-select__trigger",
      "aria-label": inputLabel,
      "aria-labelledby": inputLabelledBy,
      "aria-describedby": inputDescribedBy,
      "aria-invalid": inputInvalid,
    };
    const field = (trigger: ReactNode) => (
      <div
        ref={fieldRef}
        data-slot="combobox-select"
        data-status={status}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-popup-open={phoneOpen || undefined}
        className={phoneControlClassName}
        style={style}
      >
        {trigger}
        {phoneActions}
      </div>
    );

    if (mode === "list") {
      const anchoredPopupClassName = `${popupClassName} r-combobox-select__popup--anchored`;
      const hasOptions = normalized.groups.some((group) => group.items.length > 0);
      return (
        <BaseSelect.Root<OptionRecord<Option>, Multiple>
          multiple={multiple}
          value={controlValue as never}
          onValueChange={valueChange}
          open={phoneOpen}
          onOpenChange={handlePhoneOpenChange}
          onOpenChangeComplete={rootProps.onOpenChangeComplete}
          modal={false}
          name={rootProps.name}
          form={rootProps.form}
          required={rootProps.required}
          autoComplete={rootProps.autoComplete}
          disabled={disabled}
          readOnly={readOnly}
          itemToStringLabel={itemToStringLabel}
          itemToStringValue={itemToStringValue}
          isItemEqualToValue={isItemEqualToValue}
        >
          {field(<BaseSelect.Trigger {...triggerProps}>{phoneValue}</BaseSelect.Trigger>)}
          <BaseSelect.Portal {...(scopedPortalProps as BaseSelect.Portal.Props)}>
            <BaseSelect.Positioner
              anchor={fieldRef}
              side={listSide}
              align="start"
              sideOffset={4}
              alignItemWithTrigger={false}
              collisionAvoidance={PHONE_LIST_COLLISION}
              className={positionerClassName}
            >
              <BaseSelect.Popup
                data-slot="combobox-select-popup"
                className={anchoredPopupClassName}
              >
                {loading ? (
                  <div role="status" className="r-combobox-select__message">
                    {loadingContent}
                  </div>
                ) : null}
                <BaseSelect.List className="r-combobox-select__list" aria-busy={loading}>
                  {normalized.groups.map((group) => (
                    <BaseSelect.Group key={group.key}>
                      {group.label == null ? null : (
                        <BaseSelect.GroupLabel className="r-combobox-select__group-label">
                          {group.label}
                        </BaseSelect.GroupLabel>
                      )}
                      {group.items.map((record) =>
                        renderSelectOption({
                          record,
                          selected: selected.some((item) => item.value === record.value),
                          loading,
                          renderLabel,
                          renderOption,
                        }),
                      )}
                    </BaseSelect.Group>
                  ))}
                </BaseSelect.List>
                {!hasOptions ? emptyMessage : null}
              </BaseSelect.Popup>
            </BaseSelect.Positioner>
          </BaseSelect.Portal>
        </BaseSelect.Root>
      );
    }

    const titleId = `${id}-sheet-title`;
    const sheetCss = `r-combobox-select r-combobox-select--md${resolvedMode === "dark" ? " r-combobox-select--dark" : ""} r-combobox-select__sheet`;
    const hiddenInputs = rootProps.name
      ? selectedKeys.map((key) => (
          <input
            key={optionKey(key)}
            type="hidden"
            name={rootProps.name}
            form={rootProps.form}
            value={String(key)}
            disabled={disabled}
          />
        ))
      : null;

    return (
      <Drawer
        open={phoneOpen}
        onOpenChange={handlePhoneOpenChange}
        onOpenChangeComplete={rootProps.onOpenChangeComplete}
      >
        {field(
          <DrawerTrigger
            {...triggerProps}
            disabled={disabled}
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded={phoneOpen}
            aria-readonly={readOnly || undefined}
            aria-required={rootProps.required || undefined}
          >
            {phoneValue}
          </DrawerTrigger>,
        )}
        {hiddenInputs}
        <DrawerContent
          portalProps={portalProps as DrawerPortalProps}
          data-slot="combobox-select-sheet"
          className="r-combobox-select__sheet-popup"
          // Picking needs no keyboard, so the sheet itself takes focus; creating a
          // value is typing, so the input does.
          initialFocus={create || creatable ? focusSearchInput : undefined}
        >
          <div className={sheetCss}>
            <DrawerHeader className="r-combobox-select__sheet-header">
              <DrawerTitle id={titleId} className="r-combobox-select__sheet-title">
                {sheetTitle ?? inputLabel ?? (fieldLabel || placeholder)}
              </DrawerTitle>
              <DrawerClose aria-label={strings.close} />
            </DrawerHeader>
            <BaseCombobox.Root<OptionRecord<Option>, Multiple>
              inline
              multiple={multiple}
              disabled={disabled}
              readOnly={readOnly}
              items={items as never}
              value={controlValue as never}
              onValueChange={handleSheetValueChange as never}
              inputValue={inputValue}
              defaultInputValue={defaultInputValue}
              onInputValueChange={handleInputValueChange}
              filter={filterOptions}
              itemToStringLabel={itemToStringLabel}
              itemToStringValue={itemToStringValue}
              isItemEqualToValue={isItemEqualToValue}
              autoHighlight={autoHighlight}
            >
              <div className="r-combobox-select__sheet-search">
                <BaseCombobox.InputGroup className="r-combobox-select__control has-focus-visible:shadow-focus">
                  <Search className="r-combobox-select__search-icon" aria-hidden />
                  <BaseCombobox.Input
                    {...inputProps}
                    ref={setSearchInput}
                    id={`${id}-search`}
                    data-slot="combobox-select-input"
                    className={inputClassName}
                    aria-labelledby={titleId}
                    placeholder={strings.search}
                    readOnly={inputReadOnly}
                    enterKeyHint="search"
                  />
                  {loadingIndicator}
                </BaseCombobox.InputGroup>
              </div>
              <DrawerBody className="r-combobox-select__sheet-body">
                <BaseCombobox.Status>{loadingMessage}</BaseCombobox.Status>
                <BaseCombobox.List className="r-combobox-select__list" aria-busy={loading}>
                  {renderGroup}
                </BaseCombobox.List>
                <BaseCombobox.Empty>{emptyMessage}</BaseCombobox.Empty>
              </DrawerBody>
            </BaseCombobox.Root>
            {multiple ? (
              <DrawerFooter>
                <DrawerActions>
                  <DrawerClose render={<Button size="lg" />}>{strings.done}</DrawerClose>
                </DrawerActions>
              </DrawerFooter>
            ) : null}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <BaseCombobox.Root<OptionRecord<Option>, Multiple>
      {...rootProps}
      id={id}
      multiple={multiple}
      disabled={disabled}
      readOnly={readOnly}
      items={items as never}
      value={controlValue as never}
      onValueChange={valueChange}
      inputValue={inputValue}
      defaultInputValue={defaultInputValue}
      onInputValueChange={handleInputValueChange}
      filter={filterOptions}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={itemToStringValue}
      isItemEqualToValue={isItemEqualToValue}
      autoHighlight={autoHighlight}
    >
      <BaseCombobox.InputGroup
        data-slot="combobox-select"
        data-status={status}
        className={controlClassName}
        style={style}
      >
        {controlContent}
        {actions}
      </BaseCombobox.InputGroup>
      <BaseCombobox.Portal {...scopedPortalProps}>
        <BaseCombobox.Positioner
          sideOffset={4}
          align="start"
          {...positionerProps}
          className={positionerClassName}
        >
          <BaseCombobox.Popup
            initialFocus={false}
            finalFocus={false}
            {...popupProps}
            data-slot="combobox-select-popup"
            className={popupClassName}
          >
            <BaseCombobox.Status>{loadingMessage}</BaseCombobox.Status>
            <BaseCombobox.List className="r-combobox-select__list" aria-busy={loading}>
              {renderGroup}
            </BaseCombobox.List>
            <BaseCombobox.Empty>{emptyMessage}</BaseCombobox.Empty>
          </BaseCombobox.Popup>
        </BaseCombobox.Positioner>
      </BaseCombobox.Portal>
    </BaseCombobox.Root>
  );
}
