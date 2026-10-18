import "./dropdown-menu.test.css";
/**
 * Browser-mode evidence for #301: what the trigger looks like AFTER it is
 * activated, with the popup actually open.
 *
 * The reported symptom was "the … button turns near-white WHEN CLICKED", and a
 * click is hover + press + popup-open. The hover file covers the hover leg; this
 * one opens the menu for real and asserts the open state in each mode, so the
 * popup is verified to have mounted rather than assumed.
 *
 * Writes no files. An earlier revision screenshotted each run, which dropped
 * six untracked PNGs into this source directory on every run — not gitignored,
 * so the next `git add -A` or pre-commit hook would have committed them. The
 * one-off images that evidence carried have already served their purpose in
 * review; the assertions below do not need them.
 *
 * Note on the recipe: the main trigger slot carries no `data-popup-open:`
 * styling at all (the popup-open fill in dropdown-menu.tsx belongs to
 * `submenuTrigger`). So the open state inherits whatever the hover leg
 * resolves to — which is exactly why the removed class governed the click
 * appearance too.
 */
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const MODES = ["light", "dark"] as const;

for (const mode of MODES) {
  const label = mode;
  it(`${label}: the opened menu renders and the trigger keeps the Button's colour`, async () => {
    render(
      <ThemeProvider mode={mode}>
        <div
          data-testid="stage"
          className="bg-layer-page text-foreground"
          style={{ display: "flex", gap: 12, padding: 16, height: 220, alignItems: "flex-start" }}
        >
          <Button variant="primary" data-testid="plain">
            plain primary
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="primary" data-testid="trigger" />}>
              trigger primary
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={6} className="flex w-40 flex-col">
              <DropdownMenuItem>Copy link</DropdownMenuItem>
              <DropdownMenuItem>Follow thread</DropdownMenuItem>
              <DropdownMenuItem>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ThemeProvider>,
    );

    const { page } = await import("vite-plus/test/browser/context");
    const trigger = page.getByTestId("trigger");
    const plain = page.getByTestId("plain");
    const plainEl = plain.query() as unknown as Element;

    // Measure the reference FIRST, while nothing is open: what colour does this
    // same Button take on hover when it is not a trigger? Clicking the trigger
    // leaves the pointer on it, so that is the colour the open trigger must
    // show. Taken before opening because moving the pointer afterwards would
    // disturb the state under test.
    // Warm-up hover first: the first hover on a freshly rendered page was
    // observed to be measured before it took effect.
    await plain.hover();
    await new Promise((r) => setTimeout(r, 300));

    // The control watches the pressed overlay, motion and shadow as well as
    // colour: the primary hover keeps its colour and adds an overlay.
    const reactive = (el: Element) => {
      const cs = getComputedStyle(el);
      return `${cs.backgroundColor}|${cs.backgroundImage}|${cs.translate}|${cs.boxShadow}`;
    };
    const plainResting = reactive(plainEl);
    await page.getByTestId("trigger").hover();
    await new Promise((r) => setTimeout(r, 300));
    const plainUnhovered = reactive(plainEl);
    await plain.hover();
    await new Promise((r) => setTimeout(r, 300));
    expect(
      reactive(plainEl),
      `${label}: the plain Button must react on hover (proves the hover rules landed)`,
    ).not.toBe(plainUnhovered);
    void plainResting;
    const plainHover = getComputedStyle(plainEl).backgroundColor;
    const plainHoverImage = getComputedStyle(plainEl).backgroundImage;

    await trigger.click();

    // Wait for the popup to actually mount before claiming anything about it.
    let opened = false;
    for (let i = 0; i < 60 && !opened; i += 1) {
      await new Promise((r) => setTimeout(r, 50));
      opened = Boolean(document.querySelector('[data-popup-open], [role="menu"]'));
    }
    expect(
      opened,
      `${label}: the menu must actually open (otherwise nothing below is about an open menu)`,
    ).toBe(true);

    // Outwait the 150ms background transition before reading.
    await new Promise((r) => setTimeout(r, 400));

    const triggerEl = trigger.query() as unknown as Element;
    const openBg = getComputedStyle(triggerEl).backgroundColor;
    expect(
      openBg,
      `${label}: with the menu open and the pointer still on it, the trigger shows ${openBg}; the same Button alone hovers to ${plainHover}`,
    ).toBe(plainHover);
    expect(
      getComputedStyle(triggerEl).backgroundImage,
      `${label}: the open trigger's overlay`,
    ).toBe(plainHoverImage);
  });
}
