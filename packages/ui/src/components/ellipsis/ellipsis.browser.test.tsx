import "./ellipsis.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { TooltipProvider } from "../tooltip/tooltip";
import { Ellipsis, EllipsisToggle } from "./ellipsis";
import type { EllipsisState } from "./ellipsis";

// Ellipsis cuts with CSS; these tests check that it knows when it did, in a
// real browser (jsdom has no layout).

const it = test.skipIf(typeof window === "undefined");

const LONG = "Quarterly planning for the design system and the web client";

let touch = false;
async function setCoarsePointer(enabled: boolean) {
  if (enabled === touch) return;
  touch = enabled;
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled, maxTouchPoints: 1 });
}

let noTransitions: HTMLStyleElement | undefined;
beforeAll(() => {
  if (typeof window === "undefined") return;
  noTransitions = document.createElement("style");
  noTransitions.textContent = "*,*::before,*::after{transition:none!important}";
  document.head.append(noTransitions);
});

afterEach(async () => {
  cleanup();
  if (typeof window === "undefined") return;
  const { userEvent } = await import("vite-plus/test/browser/context");
  await userEvent.unhover(document.body);
});

afterAll(async () => {
  noTransitions?.remove();
  if (typeof window === "undefined") return;
  await setCoarsePointer(false);
});

/** Lets the shared measurer run (one animation frame) and React commit. */
async function settle() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}

function textOf(id: string) {
  const text = screen.getByTestId(id).querySelector<HTMLElement>('[data-slot="ellipsis-text"]');
  if (!text) throw new Error(`no text in ${id}`);
  return text;
}

const truncated = (id: string) => textOf(id).hasAttribute("data-truncated");

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}

/**
 * Renders `text` in an Ellipsis and looks for a box width, `natural + delta`
 * for a delta in `deltas`, at which the whole-pixel compare `wrong` gives the
 * wrong answer. Different texts give different fractions, so it tries a few.
 */
async function findWrongWidth(
  deltas: number[],
  wrong: (text: HTMLElement) => boolean,
): Promise<{ natural: number; width: number } | undefined> {
  for (const suffix of ["", "s", "es", " a", " ok", " fine"]) {
    const value = `${LONG}${suffix}`;
    render(
      <Frame>
        <span data-testid="natural" className="text-footnote whitespace-nowrap">
          {value}
        </span>
        <div data-testid="box" className="text-footnote">
          <Ellipsis data-testid="cut" tooltip={false}>
            {value}
          </Ellipsis>
        </div>
      </Frame>,
    );
    const natural = screen.getByTestId("natural").getBoundingClientRect().width;
    const box = screen.getByTestId("box");
    const text = textOf("cut");
    for (const delta of deltas) {
      box.style.width = `${natural + delta}px`;
      if (wrong(text)) return { natural, width: natural + delta };
    }
    cleanup();
  }
  return undefined;
}

const range = (from: number, to: number) =>
  Array.from({ length: Math.round((to - from) / 0.05) + 1 }, (_, i) => from + i * 0.05);

it("sees a cut that whole pixels hide (scrollWidth > clientWidth + 1)", async () => {
  // The compare the old overflow-title hooks use: a text cut by most of a
  // pixel shows an ellipsis and still reports that it fits.
  const found = await findWrongWidth(
    range(-1.3, -0.6),
    (text) => !(text.scrollWidth > text.clientWidth + 1),
  );
  expect(found, "no width where the compare misses the cut").toBeDefined();
  await settle();
  expect(textOf("cut").getBoundingClientRect().width).toBeLessThan(found!.natural - 0.5);
  expect(truncated("cut")).toBe(true);
});

it("opens the tooltip on a cut text only", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(
    <Frame>
      <div className="w-[120px] text-footnote">
        <Ellipsis data-testid="cut">{LONG}</Ellipsis>
      </div>
      <div className="w-[400px] text-footnote">
        <Ellipsis data-testid="fits">Short name</Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  await userEvent.hover(textOf("fits"));
  await settle();
  expect(document.querySelector('[data-slot="tooltip-content"]')).toBeNull();

  await userEvent.hover(textOf("cut"));
  await settle();
  const tip = document.querySelector('[data-slot="tooltip-content"]');
  expect(tip?.textContent).toBe(LONG);
  // The full text is already in the DOM: the default tooltip is not read twice.
  expect(textOf("cut").hasAttribute("aria-describedby")).toBe(false);
});

it("measures again as the tooltip opens, so a missed change cannot keep it shut", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(
    <Frame>
      <div data-testid="box" className="w-[400px] text-footnote">
        <Ellipsis data-testid="cut">{LONG}</Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  expect(truncated("cut")).toBe(false);
  // Narrow it and hover before the observers have had a frame.
  screen.getByTestId("box").style.width = "120px";
  await userEvent.hover(textOf("cut"));
  expect(document.querySelector('[data-slot="tooltip-content"]')?.textContent).toBe(LONG);
});

it("measures again when its box is resized", async () => {
  render(
    <Frame>
      <div data-testid="box" className="w-[400px] text-footnote">
        <Ellipsis data-testid="cut">{LONG}</Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  expect(truncated("cut")).toBe(false);
  screen.getByTestId("box").style.width = "120px";
  await settle();
  await settle();
  expect(truncated("cut")).toBe(true);
  screen.getByTestId("box").style.width = "600px";
  await settle();
  await settle();
  expect(truncated("cut")).toBe(false);
});

it("measures again when a web font finishes loading, though no box changed size", async () => {
  // Two names for the same file: one loaded now to measure it, one the test
  // text asks for, which loads only once the text is on the page.
  const url = new URL("../../../../../design/fonts/SpaceMono-Regular.woff2", import.meta.url).href;
  const probe = new FontFace("EllipsisProbeMono", `url(${url})`);
  const late = new FontFace("EllipsisLateMono", `url(${url})`);
  document.fonts.add(probe);
  await probe.load();

  const words = "ab cd ef gh ij kl mn op qr st uv wx yz ab cd ef gh ij kl mn op";
  render(
    <Frame>
      <span data-testid="serif" className="text-[16px] whitespace-nowrap font-[serif]">
        {words}
      </span>
      <span data-testid="mono" className="text-[16px] whitespace-nowrap font-[EllipsisProbeMono]">
        {words}
      </span>
    </Frame>,
  );
  const serif = screen.getByTestId("serif").getBoundingClientRect().width;
  const mono = screen.getByTestId("mono").getBoundingClientRect().width;
  cleanup();
  // Two lines are nearly full in the fallback; the web font needs a third.
  const width = serif / 1.85;
  expect(mono / width).toBeGreaterThan(2.2);

  render(
    <Frame>
      <div
        style={{ width }}
        className="text-[16px]/6  font-[EllipsisLateMono,serif] [font-display:swap]"
      >
        <Ellipsis data-testid="cut" lines={2} tooltip={false}>
          {words}
        </Ellipsis>
      </div>
    </Frame>,
  );
  const box = textOf("cut");
  // Measure while the fallback shows: it fits in two lines.
  const fallback = box.getBoundingClientRect();
  await settle();
  expect(truncated("cut")).toBe(false);

  // The face joins the page only now, so the fallback was measured first.
  document.fonts.add(late);
  await late.load();
  await settle();
  await settle();
  // The clamp kept the box the same size, so no ResizeObserver fired.
  expect(box.getBoundingClientRect().height).toBe(fallback.height);
  expect(truncated("cut")).toBe(true);
  document.fonts.delete(probe);
  document.fonts.delete(late);
});

function moreLess({ expanded }: EllipsisState) {
  return <EllipsisToggle>{expanded ? "Show less" : "Show more"}</EllipsisToggle>;
}

it("hides the expand control on a text that fits, where it takes no room", async () => {
  render(
    <Frame>
      <div className="w-[400px] text-footnote">
        <Ellipsis data-testid="fits" lines={2} after={moreLess}>
          A short description.
        </Ellipsis>
      </div>
      <div className="w-[200px] text-footnote">
        <Ellipsis data-testid="cut" lines={2} after={moreLess}>
          {`${LONG}. ${LONG}. ${LONG}.`}
        </Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  expect(screen.getAllByRole("button", { name: "Show more" })).toHaveLength(1);
  const hidden = screen.getByTestId("fits").querySelector('[data-slot="ellipsis-after"]');
  expect(getComputedStyle(hidden!).display).toBe("none");

  const toggle = screen.getByRole("button", { name: "Show more" });
  expect(toggle.getAttribute("aria-expanded")).toBe("false");
  expect(toggle.getAttribute("aria-controls")).toBe(textOf("cut").id);
  await act(async () => toggle.click());
  await settle();
  const less = screen.getByRole("button", { name: "Show less" });
  expect(less.getAttribute("aria-expanded")).toBe("true");
  // The same element: focus stays on the control across the toggle.
  expect(less).toBe(toggle);
  expect(truncated("cut")).toBe(false);
});

/** The width `text` takes on one line, uncut. */
function naturalWidth(text: string) {
  const probe = document.createElement("span");
  probe.className = "text-footnote whitespace-nowrap";
  probe.textContent = text;
  document.body.append(probe);
  const width = probe.getBoundingClientRect().width;
  probe.remove();
  return width;
}

it("shows a text that fits whole, with no ellipsis and no after, however narrow the row", async () => {
  // Room for "Release notes" but not for "Release notes Show more": a text
  // that fits alone is never cut to make room for a control it doesn't need.
  const natural = naturalWidth("Release notes");
  render(
    <Frame>
      <div style={{ width: natural + 4 }} className="flex text-footnote">
        <Ellipsis data-testid="row" after={moreLess}>
          Release notes
        </Ellipsis>
      </div>
      <div style={{ width: natural + 4 }} className="text-footnote">
        <Ellipsis data-testid="two" lines={2} after={moreLess}>
          Release notes
        </Ellipsis>
      </div>
    </Frame>,
  );
  for (let frame = 0; frame < 4; frame += 1) {
    await settle();
    for (const id of ["row", "two"]) {
      expect(truncated(id)).toBe(false);
      const text = textOf(id);
      expect(text.getBoundingClientRect().width).toBeGreaterThanOrEqual(natural - 0.5);
      const after = screen.getByTestId(id).querySelector('[data-slot="ellipsis-after"]')!;
      expect(getComputedStyle(after).display).toBe("none");
    }
  }
  expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
});

it("gives the after's room back when the box grows enough for the text alone", async () => {
  const natural = naturalWidth("Release notes");
  render(
    <Frame>
      <div data-testid="box" style={{ width: 60 }} className="flex text-footnote">
        <Ellipsis data-testid="row" after={moreLess}>
          Release notes
        </Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  expect(truncated("row")).toBe(true);
  expect(screen.getByRole("button", { name: "Show more" })).toBeTruthy();
  // Wide enough for the text, not for the text and the control.
  screen.getByTestId("box").style.width = `${natural + 4}px`;
  await settle();
  await settle();
  expect(truncated("row")).toBe(false);
  expect(screen.queryByRole("button", { name: "Show more" })).toBeNull();
  expect(textOf("row").getBoundingClientRect().width).toBeGreaterThanOrEqual(natural - 0.5);
});

it("never puts a button inside a button: with an after, the text stays text", async () => {
  render(
    <Frame>
      <div className="w-[200px] text-footnote">
        <Ellipsis data-testid="cut" lines={2} expandOnClick after={moreLess}>
          {`${LONG}. ${LONG}. ${LONG}.`}
        </Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  expect(truncated("cut")).toBe(true);
  const buttons = screen.getAllByRole("button");
  expect(buttons.map((button) => button.textContent)).toEqual(["Show more"]);
  for (const button of document.querySelectorAll("[role=button], button")) {
    expect(button.parentElement?.closest("[role=button], button")).toBeNull();
  }
});

it("expands with Enter, keeps focus on the text, and collapses with Enter again", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  render(
    <Frame>
      <div className="w-[120px] text-footnote">
        <Ellipsis data-testid="cut" expandOnClick tooltip={false}>
          {LONG}
        </Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  const text = textOf("cut");
  expect(text.getAttribute("role")).toBe("button");
  expect(text.getAttribute("aria-expanded")).toBe("false");
  text.focus();
  await userEvent.keyboard("{Enter}");
  await settle();
  expect(document.activeElement).toBe(text);
  expect(text.getAttribute("role")).toBe("button");
  expect(text.getAttribute("aria-expanded")).toBe("true");
  expect(text.className).not.toContain("truncate");

  await userEvent.keyboard("{Enter}");
  await settle();
  expect(document.activeElement).toBe(text);
  expect(text.getAttribute("aria-expanded")).toBe("false");
  expect(truncated("cut")).toBe(true);
});

it("makes a cut plain text a button, but never a text with a link in it", async () => {
  render(
    <Frame>
      <div className="w-[120px] text-footnote">
        <Ellipsis data-testid="plain" expandOnClick tooltip={false}>
          {LONG}
        </Ellipsis>
      </div>
      <div className="w-[120px] text-footnote">
        <Ellipsis data-testid="linked" expandOnClick tooltip={false}>
          See <a href="#spec">the spec</a> for the {LONG}
        </Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  expect(truncated("plain")).toBe(true);
  expect(truncated("linked")).toBe(true);
  expect(textOf("plain").getAttribute("role")).toBe("button");
  expect(textOf("linked").hasAttribute("role")).toBe(false);
  expect(textOf("linked").hasAttribute("tabindex")).toBe(false);

  await act(async () => screen.getByRole("link", { name: "the spec" }).click());
  await settle();
  expect(truncated("linked")).toBe(true);

  await act(async () => textOf("plain").click());
  await settle();
  expect(truncated("plain")).toBe(false);
});

// Last: turning touch emulation off again leaves Chromium without hover.
it("never opens the tooltip on a touch screen", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  await setCoarsePointer(true);
  expect(matchMedia("(pointer: coarse)").matches).toBe(true);
  render(
    <Frame>
      <div className="w-[120px] text-footnote">
        <Ellipsis data-testid="cut">{LONG}</Ellipsis>
      </div>
    </Frame>,
  );
  await settle();
  expect(truncated("cut")).toBe(true);
  await userEvent.hover(textOf("cut"));
  await settle();
  expect(document.querySelector('[data-slot="tooltip-content"]')).toBeNull();
});
