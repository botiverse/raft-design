import { expect, test } from "vite-plus/test";
import { PHONE_MEDIA_QUERY } from "../../lib/phone-media";
import { preferredListSide } from "./combobox-select.list-side";

test("the phone query is the complement of the desktop query on both axes", () => {
  expect(PHONE_MEDIA_QUERY).toBe("(width < 48rem) and (pointer: coarse)");
});

test("the list opens below unless it fits better above", () => {
  const viewport = { top: 0, height: 800 };
  expect(preferredListSide({ top: 100, bottom: 144 }, viewport, 300, 256)).toBe("bottom");
  // Room for the list below, though there is more above: still below.
  expect(preferredListSide({ top: 500, bottom: 544 }, viewport, 200, 256)).toBe("bottom");
  // Short below, more above: above.
  expect(preferredListSide({ top: 650, bottom: 694 }, viewport, 300, 256)).toBe("top");
  // Short both ways: the bigger side, below on a tie.
  expect(preferredListSide({ top: 100, bottom: 144 }, { top: 0, height: 244 }, 300, 256)).toBe(
    "bottom",
  );
  // The visual viewport is scrolled down: measured from its top.
  expect(preferredListSide({ top: 900, bottom: 944 }, { top: 800, height: 400 }, 300, 256)).toBe(
    "bottom",
  );
});

test("the cap decides how much room the list needs, not only its rows", () => {
  const viewport = { top: 0, height: 844 };
  const field = { top: 500, bottom: 544 };
  // 300px below, 500px above. 14 rows (516px) capped at the default 256px fit below.
  expect(preferredListSide(field, viewport, 516, 256)).toBe("bottom");
  // Capped at 24rem (384px) they don't, and there is more room above.
  expect(preferredListSide(field, viewport, 516, 384)).toBe("top");
  // 120px below, 680px above: a list capped at 120px fits below, one at 256px doesn't.
  const low = { top: 680, bottom: 724 };
  expect(preferredListSide(low, viewport, 516, 120)).toBe("bottom");
  expect(preferredListSide(low, viewport, 516, 256)).toBe("top");
  // Few rows need less than the cap.
  expect(preferredListSide(low, viewport, 84, 384)).toBe("bottom");
});
