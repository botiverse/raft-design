import { expect, test } from "vite-plus/test";
import { PHONE_MEDIA_QUERY } from "../../lib/phone-media";
import {
  COMBOBOX_SELECT_SHEET_THRESHOLD,
  countSelectableOptions,
  preferredListSide,
  resolveComboboxSelectMode,
} from "./combobox-select.mode";

test("the phone query is the complement of the desktop query on both axes", () => {
  expect(PHONE_MEDIA_QUERY).toBe("(width < 48rem) and (pointer: coarse)");
});

test("a desktop, or any fine pointer, keeps the text field whatever the options", () => {
  expect(resolveComboboxSelectMode({ phone: false, optionCount: 3 })).toBe("field");
  expect(resolveComboboxSelectMode({ phone: false, optionCount: 400 })).toBe("field");
  expect(resolveComboboxSelectMode({ phone: false, optionCount: 3, create: true })).toBe("field");
});

test("a phone opens the anchored list for up to 10 options and the sheet above", () => {
  expect(COMBOBOX_SELECT_SHEET_THRESHOLD).toBe(10);
  expect(resolveComboboxSelectMode({ phone: true, optionCount: 0 })).toBe("list");
  expect(resolveComboboxSelectMode({ phone: true, optionCount: 10 })).toBe("list");
  expect(resolveComboboxSelectMode({ phone: true, optionCount: 11 })).toBe("sheet");
});

test("the threshold can be moved", () => {
  expect(resolveComboboxSelectMode({ phone: true, optionCount: 6, sheetThreshold: 5 })).toBe(
    "sheet",
  );
  expect(resolveComboboxSelectMode({ phone: true, optionCount: 20, sheetThreshold: 20 })).toBe(
    "list",
  );
});

test("a phone list that typing drives always opens the sheet", () => {
  expect(resolveComboboxSelectMode({ phone: true, optionCount: 2, create: true })).toBe("sheet");
  expect(resolveComboboxSelectMode({ phone: true, optionCount: 2, remote: true })).toBe("sheet");
});

test("counts selectable options across flat and grouped options", () => {
  const enabled = { disabled: false };
  const disabled = { disabled: true };
  expect(countSelectableOptions([])).toBe(0);
  expect(
    countSelectableOptions([
      { items: [enabled] },
      { items: [enabled, enabled, disabled] },
      { items: [enabled] },
    ]),
  ).toBe(4);
});

test("the list opens below unless it fits better above", () => {
  const viewport = { top: 0, height: 800 };
  expect(preferredListSide({ top: 100, bottom: 144 }, viewport, 300)).toBe("bottom");
  // Room for the list below, though there is more above: still below.
  expect(preferredListSide({ top: 500, bottom: 544 }, viewport, 200)).toBe("bottom");
  // Short below, more above: above.
  expect(preferredListSide({ top: 650, bottom: 694 }, viewport, 300)).toBe("top");
  // Short both ways: the bigger side, below on a tie.
  expect(preferredListSide({ top: 100, bottom: 144 }, { top: 0, height: 244 }, 300)).toBe("bottom");
  // The visual viewport is scrolled down: measured from its top.
  expect(preferredListSide({ top: 900, bottom: 944 }, { top: 800, height: 400 }, 300)).toBe(
    "bottom",
  );
});
