import "./button.test.css";
import { afterAll, afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { DropdownMenu, DropdownMenuTrigger } from "../dropdown-menu/dropdown-menu";
import { ButtonSplit, ButtonSplitMain, ButtonSplitMenu } from "./button-split";
import type { ButtonSplitSize, ButtonSplitVariant } from "./button-split";

// A split button is one shape in two parts: they touch with no gap, the outer
// corners are rounded and the inner ones square, both parts are as tall, and
// the menu part's start border is the divider. The part under the pointer
// takes its variant's medium tier and its neighbour stays at rest. Tab reaches
// the main part, then the menu part, each with its focus ring above the other.
// Measured in a real browser on a desktop (from 768px with a mouse); jsdom
// has no layout or hover.

const it = test.skipIf(typeof window === "undefined");

const MODES = ["light", "dark"] as const;
const VARIANTS = ["primary", "default"] as const;

beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 800);
});

afterEach(cleanup);

function renderSplit(
  mode: (typeof MODES)[number],
  variant: ButtonSplitVariant,
  size: ButtonSplitSize = "md",
) {
  render(
    <ThemeProvider mode={mode}>
      <div data-testid="stage" className="flex gap-8 bg-layer-canvas p-8 text-foreground">
        <button type="button" data-testid="before">
          Before
        </button>
        <ButtonSplit aria-label="New agent" data-testid="group">
          <ButtonSplitMain data-testid="main" variant={variant} size={size}>
            Create agent
          </ButtonSplitMain>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <ButtonSplitMenu
                  data-testid="menu"
                  variant={variant}
                  size={size}
                  aria-label="More ways to create an agent"
                />
              }
            />
          </DropdownMenu>
        </ButtonSplit>
      </div>
    </ThemeProvider>,
  );
  return {
    group: screen.getByTestId("group"),
    main: screen.getByTestId("main"),
    menu: screen.getByTestId("menu"),
  };
}

const style = (element: Element) => getComputedStyle(element);

/** Poll until `read` stops changing (rules land on demand, fills transition). */
async function settled(read: () => string) {
  let previous = "";
  let next = read();
  for (let i = 0; i < 40 && next !== previous; i += 1) {
    previous = next;
    await new Promise((resolve) => setTimeout(resolve, 50));
    next = read();
  }
  return next;
}

/** Whether a computed box-shadow draws anything: a layer with a visible colour and a size. */
function drawsShadow(value: string) {
  if (value === "none") return false;
  return value.split(/,(?![^(]*\))/).some((layer) => {
    const transparent = /rgba\([^)]*,\s*0\)|\/\s*0\)|transparent/.test(layer);
    const sized = /[1-9][\d.]*px/.test(layer.replace(/\([^)]*\)/g, ""));
    return !transparent && sized;
  });
}

/** The width of a part's hit area: its border box and its ::after, which is placed from inside the border. */
function hitWidth(element: Element) {
  const box = element.getBoundingClientRect();
  const own = style(element);
  const after = getComputedStyle(element, "::after");
  const px = Number.parseFloat;
  const left = Math.min(box.left, box.left + px(own.borderLeftWidth) + px(after.left));
  const right = Math.max(box.right, box.right - px(own.borderRightWidth) - px(after.right));
  return right - left;
}

/** A Button hovers by laying an overlay over its fill: a background image. */
const overlay = (element: Element) => style(element).backgroundImage;

async function hover(testId: string) {
  const { page } = await import("vite-plus/test/browser/context");
  await page.getByTestId(testId).hover();
}

for (const mode of MODES) {
  for (const variant of VARIANTS) {
    it(`${mode} ${variant}: the parts touch and make one shape`, () => {
      const { main, menu } = renderSplit(mode, variant);
      const mainBox = main.getBoundingClientRect();
      const menuBox = menu.getBoundingClientRect();

      expect(menuBox.left).toBe(mainBox.right);
      expect(menuBox.top).toBe(mainBox.top);
      expect(menuBox.height).toBe(mainBox.height);
      expect(menuBox.width).toBe(28);
      expect(menuBox.width).toBeLessThan(mainBox.height);

      const mainStyle = style(main);
      const menuStyle = style(menu);
      const radius = Number.parseFloat(mainStyle.borderTopLeftRadius);
      expect(radius).toBeGreaterThan(0);
      expect(Number.parseFloat(mainStyle.borderBottomLeftRadius)).toBe(radius);
      expect(mainStyle.borderTopRightRadius).toBe("0px");
      expect(mainStyle.borderBottomRightRadius).toBe("0px");
      expect(menuStyle.borderTopLeftRadius).toBe("0px");
      expect(menuStyle.borderBottomLeftRadius).toBe("0px");
      expect(Number.parseFloat(menuStyle.borderTopRightRadius)).toBe(radius);
      expect(Number.parseFloat(menuStyle.borderBottomRightRadius)).toBe(radius);
    });

    it(`${mode} ${variant}: one divider between the parts, the menu part's own border`, () => {
      const { main, menu } = renderSplit(mode, variant);
      const mainStyle = style(main);
      const menuStyle = style(menu);

      expect(mainStyle.borderRightWidth).toBe("0px");
      expect(menuStyle.borderLeftWidth).toBe(menuStyle.borderRightWidth);
      expect(Number.parseFloat(menuStyle.borderLeftWidth)).toBeGreaterThan(0);
      expect(menuStyle.borderLeftColor).toBe(mainStyle.borderTopColor);
      expect(menuStyle.borderLeftColor).not.toBe(menuStyle.backgroundColor);
    });

    it(`${mode} ${variant}: the hovered part takes the medium tier, its neighbour stays at rest`, async () => {
      const { main, menu } = renderSplit(mode, variant);
      await hover("stage");
      const restMain = await settled(() => overlay(main));
      const restMenu = await settled(() => overlay(menu));
      expect(restMain).toBe("none");
      expect(restMenu).toBe("none");

      await hover("main");
      expect(await settled(() => overlay(main))).not.toBe("none");
      expect(overlay(menu)).toBe(restMenu);

      await hover("menu");
      expect(await settled(() => overlay(menu))).not.toBe("none");
      expect(await settled(() => overlay(main))).toBe(restMain);
    });
  }

  if (mode === "dark") {
    it(`${mode}: the primary split's die-cut edge goes around the group, not each part`, () => {
      const { group, main, menu } = renderSplit(mode, "primary");
      expect(drawsShadow(style(main).boxShadow)).toBe(false);
      expect(drawsShadow(style(menu).boxShadow)).toBe(false);
      expect(drawsShadow(style(group).boxShadow)).toBe(true);
    });
  }
}

it("on a desktop the menu part's hit area reaches 44px wide and tall", () => {
  const { menu } = renderSplit("light", "primary");
  const box = menu.getBoundingClientRect();
  const own = style(menu);
  const after = getComputedStyle(menu, "::after");
  const px = Number.parseFloat;
  const insideHeight = box.height - px(own.borderTopWidth) - px(own.borderBottomWidth);
  expect(hitWidth(menu)).toBeGreaterThanOrEqual(44);
  expect(insideHeight - px(after.top) - px(after.bottom)).toBeGreaterThanOrEqual(44);
});

it("Tab reaches the main part, then the menu part, each ring above its neighbour", async () => {
  const { userEvent } = await import("vite-plus/test/browser/context");
  const { main, menu } = renderSplit("light", "primary");
  screen.getByTestId("before").focus();

  await userEvent.tab();
  expect(document.activeElement).toBe(main);
  expect(await settled(() => style(main).zIndex)).toBe("1");
  expect(style(menu).zIndex).toBe("auto");
  expect(drawsShadow(style(main).boxShadow)).toBe(true);

  await userEvent.tab();
  expect(document.activeElement).toBe(menu);
  expect(await settled(() => style(menu).zIndex)).toBe("1");
  expect(style(main).zIndex).toBe("auto");
  expect(drawsShadow(style(menu).boxShadow)).toBe(true);
});

// Touch runs last: turning touch emulation off again leaves Chromium
// reporting `pointer: none`, not `fine` (panel-action.browser.test.tsx).
it("on a touch screen an lg split is 44px tall, with a 36px menu part", async () => {
  const { cdp } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", {
    features: [{ name: "pointer", value: "coarse" }],
  });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  const { main, menu } = renderSplit("light", "primary", "lg");
  const mainBox = main.getBoundingClientRect();
  const menuBox = menu.getBoundingClientRect();
  expect(mainBox.height).toBe(44);
  expect(menuBox.height).toBe(44);
  expect(menuBox.width).toBe(36);
  expect(menuBox.left).toBe(mainBox.right);
  expect(hitWidth(menu)).toBeGreaterThanOrEqual(44);
});

afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
  await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  await page.viewport(414, 896);
});
