import { expect, test } from "vite-plus/test";
import { PHONE_MEDIA_QUERY } from "../../lib/phone-media";
import { preferredListSide } from "./combobox-select.list-side";

test("the phone query is the complement of the desktop query on both axes", () => {
  expect(PHONE_MEDIA_QUERY).toBe("(width < 48rem) and (pointer: coarse)");
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
