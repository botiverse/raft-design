import type { ComboboxSelectGroup, ComboboxSelectValue } from "./combobox-select.types";

export interface OptionRecord<Option> {
  value: ComboboxSelectValue;
  label: string;
  disabled: boolean;
  option?: Option;
  createQuery?: string;
}

export function isOptionGroup<Option>(
  option: Option | ComboboxSelectGroup<Option>,
): option is ComboboxSelectGroup<Option> {
  return (
    typeof option === "object" &&
    option !== null &&
    "type" in option &&
    option.type === "group" &&
    "children" in option &&
    Array.isArray(option.children)
  );
}

export function normalizeOption<Option>(
  option: Option,
  labelField: PropertyKey,
  valueField: PropertyKey,
  disabledField: PropertyKey,
): OptionRecord<Option> {
  const fields = option as Record<PropertyKey, unknown>;
  const value = fields[valueField];
  const label = fields[labelField];
  if (typeof value !== "string" && typeof value !== "number") {
    throw new Error("ComboboxSelect options must have a string or number value.");
  }
  return {
    value,
    label: typeof label === "string" || typeof label === "number" ? String(label) : String(value),
    disabled: Boolean(fields[disabledField]),
    option,
  };
}

export function optionKey(value: ComboboxSelectValue) {
  return `${typeof value}:${value}`;
}
