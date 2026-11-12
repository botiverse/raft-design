import "./select.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, isInaccessible, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { SelectChrome } from "./select";
import { Select, SelectIcon, SelectTrigger, SelectValue } from "./select";

// A settings row's select is as wide as its longest option, 11rem to 20rem,
// and keeps that width whichever value is chosen (design/patterns/forms.md#a-settings-row).
// A trigger that only lays out its current value would shrink to a short one
// and the row's end would jump. Measured in a real browser; jsdom has no layout.

const it = test.skipIf(typeof window === "undefined");

afterEach(cleanup);

type Item = { value: string | null; label: string };

const AWAY: Item[] = [
  { value: "never", label: "Never" },
  { value: "five", label: "After 5 min away" },
  { value: "thirty", label: "After 30 min away, still unread" },
  { value: "hour", label: "After an hour" },
];
const LONGEST = "thirty";

const SHORT: Item[] = [
  { value: "on", label: "On" },
  { value: "off", label: "Off" },
];

const LONG: Item[] = [
  { value: "short", label: "Short" },
  {
    value: "long",
    label: "Only when I'm not active on a computer and the message is still unread",
  },
];

function Fit({
  items,
  value,
  chrome,
  fit = true,
  className,
}: {
  items: Item[];
  value: string | null;
  chrome?: SelectChrome;
  fit?: boolean;
  className?: string;
}) {
  return (
    <ThemeProvider>
      <div style={{ display: "flex", justifyContent: "flex-end", width: 640 }}>
        <Select items={items} value={value} chrome={chrome}>
          <SelectTrigger
            fit={fit}
            className={className}
            aria-label="Remind me"
            data-testid="trigger"
          >
            <SelectValue placeholder="Choose" data-testid="value" />
            <SelectIcon />
          </SelectTrigger>
        </Select>
      </div>
    </ThemeProvider>
  );
}

const widthOf = (id = "trigger") => screen.getByTestId(id).getBoundingClientRect().width;

const CHROMES: SelectChrome[] = ["default", "field"];

it.each(CHROMES)(
  "keeps the longest option's width whichever value is chosen (chrome=%s)",
  (chrome) => {
    // The width a trigger has when it only lays out the longest label.
    const reference = render(
      <Fit items={AWAY} value={LONGEST} chrome={chrome} fit={false} className="w-auto" />,
    );
    const longest = widthOf();
    reference.unmount();
    expect(longest).toBeGreaterThan(176);
    expect(longest).toBeLessThan(320);

    const { rerender } = render(<Fit items={AWAY} value={LONGEST} chrome={chrome} />);
    expect(widthOf()).toBeCloseTo(longest, 0);
    for (const value of [...AWAY.map((item) => item.value), null, LONGEST]) {
      rerender(<Fit items={AWAY} value={value} chrome={chrome} />);
      expect(widthOf(), `with ${String(value)} chosen`).toBeCloseTo(longest, 0);
    }
  },
);

it.each(CHROMES)("is 11rem with only short options (chrome=%s)", (chrome) => {
  expect(getComputedStyle(document.documentElement).fontSize).toBe("16px");
  render(<Fit items={SHORT} value="on" chrome={chrome} />);
  expect(widthOf()).toBeCloseTo(176, 1);
});

it.each(CHROMES)("stops at 20rem and cuts a longer value (chrome=%s)", async (chrome) => {
  render(<Fit items={LONG} value="short" chrome={chrome} />);
  expect(widthOf()).toBeCloseTo(320, 1);
  cleanup();

  render(<Fit items={LONG} value="long" chrome={chrome} />);
  expect(widthOf()).toBeCloseTo(320, 1);
  const value = screen.getByTestId("value");
  expect(value.scrollWidth).toBeGreaterThan(value.clientWidth);
  const trigger = screen.getByTestId("trigger").getBoundingClientRect();
  expect(value.getBoundingClientRect().right).toBeLessThanOrEqual(trigger.right);
  await expect.poll(() => value.title).toBe(LONG[1]!.label);
});

it("keeps the sizer out of the accessibility tree and the tab order", () => {
  render(<Fit items={AWAY} value="never" />);
  const trigger = screen.getByTestId("trigger");
  const sizer = trigger.querySelector<HTMLElement>("[data-slot='select-value-sizer']")!;
  expect(sizer).not.toBeNull();
  expect(sizer.getAttribute("aria-hidden")).toBe("true");
  expect(getComputedStyle(sizer).visibility).toBe("hidden");
  expect(sizer.getBoundingClientRect().height).toBe(0);
  for (const label of sizer.children) expect(isInaccessible(label)).toBe(true);
  expect(sizer.querySelectorAll("[tabindex], a, button, input")).toHaveLength(0);
  // Text labels come from an attribute (::after), so find in page skips them.
  expect(sizer.textContent).toBe("");
  expect(isInaccessible(screen.getByTestId("value"))).toBe(false);
  expect(screen.getByRole("combobox", { name: "Remind me" })).toBe(trigger);
});

it("leaves a trigger without fit as wide as its container, with no sizer", () => {
  render(<Fit items={AWAY} value="never" fit={false} />);
  const trigger = screen.getByTestId("trigger");
  expect(trigger.querySelector("[data-slot='select-value-sizer']")).toBeNull();
  expect(trigger.querySelector("[data-slot='select-value-fit']")).toBeNull();
});
