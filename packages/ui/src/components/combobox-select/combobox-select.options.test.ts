import { expect, test } from "vite-plus/test";
import { normalizeOption, optionKey } from "./combobox-select.options";

test("normalizes options with custom field names", () => {
  const option = { id: 42, name: "Design", inactive: true };
  expect(normalizeOption(option, "name", "id", "inactive")).toEqual({
    value: 42,
    label: "Design",
    disabled: true,
    option,
  });
});

test("creates collision-safe keys for primitive values", () => {
  expect(optionKey("42")).toBe("string:42");
  expect(optionKey(42)).toBe("number:42");
});
