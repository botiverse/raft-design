import "../dialog/dialog.test.css";
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { useRef, useState } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import { Button } from "../button/button";
import { ScrollArea } from "../scroll-area/scroll-area";
import {
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxTitle,
  LightboxToolbar,
  LightboxTrigger,
} from "./lightbox";
import type { LightboxProps } from "./lightbox";

// Document mode (`modal="trap-focus"`, lightbox.md#behavior): a long file
// scrolls in its own body, so the page's scroll stays unlocked, the browser's
// find in page must reach the text, and focus moves in and back out as in any
// dialog. Popups opened inside a lightbox are lightbox.popups' tests.

const it = test.skipIf(typeof window === "undefined");

const frames = async (count = 3) => {
  for (let i = 0; i < count; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
};

afterEach(cleanup);

type Modal = NonNullable<LightboxProps["modal"]>;

const PARAGRAPHS = Array.from({ length: 60 }, (_, i) => `Paragraph ${i + 1} of the report.`);

function DocumentLightbox({ modal }: { modal: Modal }) {
  return (
    <ThemeProvider>
      {/* A page long enough to scroll, under the lightbox. */}
      <div style={{ height: 3000 }}>Page</div>
      <Lightbox open modal={modal}>
        <LightboxContent data-testid="content" aria-label="Report preview">
          <LightboxToolbar>
            <LightboxTitle>report.pdf</LightboxTitle>
            <LightboxActions>
              <Button variant="ghost" size="md">
                Comments
              </Button>
              <LightboxClose aria-label="Close" render={<Button variant="ghost" size="icon-md" />}>
                X
              </LightboxClose>
            </LightboxActions>
          </LightboxToolbar>
          <ScrollArea data-testid="body" className="pointer-events-auto min-h-0 flex-1">
            {PARAGRAPHS.map((text) => (
              <p key={text} className="py-4">
                {text}
              </p>
            ))}
            <p>The needle-in-the-report sentence.</p>
            <button type="button">Last link</button>
          </ScrollArea>
        </LightboxContent>
      </Lightbox>
    </ThemeProvider>
  );
}

/** Neither inert nor hidden from find in page and assistive technology. */
function expectReachable(element: Element) {
  expect(element.closest("[inert]")).toBeNull();
  expect(element.closest("[hidden]")).toBeNull();
  expect(element.closest('[aria-hidden="true"]')).toBeNull();
  expect(element.checkVisibility({ visibilityProperty: true })).toBe(true);
}

function pageScrollLocked() {
  const { documentElement: html, body } = document;
  return (
    html.hasAttribute("data-base-ui-scroll-locked") ||
    /hidden|clip/.test(getComputedStyle(html).overflowY) ||
    /hidden|clip/.test(getComputedStyle(body).overflowY)
  );
}

describe("document mode", () => {
  it("locks the page's scroll only in the default mode", async () => {
    render(<DocumentLightbox modal />);
    await screen.findByTestId("content");
    await waitFor(() => expect(pageScrollLocked()).toBe(true));
    cleanup();
    await frames();

    render(<DocumentLightbox modal="trap-focus" />);
    await screen.findByTestId("content");
    await frames(5);
    expect(pageScrollLocked()).toBe(false);
    // The page under the scrim still scrolls.
    window.scrollTo(0, 200);
    expect(window.scrollY).toBe(200);
    window.scrollTo(0, 0);
  });

  it("keeps focus in the lightbox", async () => {
    render(<DocumentLightbox modal="trap-focus" />);
    const content = await screen.findByTestId("content");
    screen.getByRole("button", { name: "Close" }).focus();
    const { userEvent } = await import("vite-plus/test/browser/context");
    for (let i = 0; i < 6; i += 1) {
      await userEvent.keyboard("{Tab}");
      expect(content.contains(document.activeElement)).toBe(true);
    }
  });

  for (const modal of [true, "trap-focus"] as const) {
    it(`modal=${String(modal)}: find in page reaches the document`, async () => {
      render(<DocumentLightbox modal={modal} />);
      const content = await screen.findByTestId("content");
      await frames();
      expectReachable(content);
      expectReachable(screen.getByText("The needle-in-the-report sentence."));
      // Chromium's window.find walks the text as find in page does, and
      // matches only rendered text. (It doesn't scroll the match into view
      // in the test's frame, so the scroll is focus's test, below.)
      const find = (window as Window & { find?: (text: string) => boolean }).find;
      expect(find?.call(window, "needle-in-the-report")).toBe(true);
      expect(content.contains(window.getSelection()?.anchorNode ?? null)).toBe(true);
      window.getSelection()?.removeAllRanges();
    });
  }

  it("lets focus scroll the document's body to what it lands on", async () => {
    render(<DocumentLightbox modal="trap-focus" />);
    const body = await screen.findByTestId("body");
    await frames();
    expect(body.scrollTop).toBe(0);
    screen.getByRole("button", { name: "Last link" }).focus();
    await frames();
    expect(body.scrollTop).toBeGreaterThan(0);
  });
});

function OpenedFromState() {
  const [open, setOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement>(null);
  return (
    <ThemeProvider>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)}>
        report.pdf
      </button>
      <Lightbox open={open} onOpenChange={setOpen} modal="trap-focus">
        <LightboxContent aria-label="Report preview" initialFocus finalFocus={openerRef}>
          <LightboxClose aria-label="Close">X</LightboxClose>
        </LightboxContent>
      </Lightbox>
    </ThemeProvider>
  );
}

it("returns focus to the opener of a lightbox opened from state when finalFocus names it", async () => {
  render(<OpenedFromState />);
  const { userEvent } = await import("vite-plus/test/browser/context");
  const opener = screen.getByRole("button", { name: "report.pdf" });
  await userEvent.click(opener);
  const close = await screen.findByRole("button", { name: "Close" });
  await waitFor(() => expect(document.activeElement).toBe(close));
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("button", { name: "Close" })).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(opener));
});

function OpenedByTrigger({ modal }: { modal: Modal }) {
  return (
    <ThemeProvider>
      <Lightbox modal={modal}>
        <LightboxTrigger>report.pdf</LightboxTrigger>
        <LightboxContent data-testid="content" aria-label="Report preview">
          <LightboxClose aria-label="Close">X</LightboxClose>
        </LightboxContent>
      </Lightbox>
    </ThemeProvider>
  );
}

it("document mode moves focus in on open and back to LightboxTrigger on close", async () => {
  render(<OpenedByTrigger modal="trap-focus" />);
  const { userEvent } = await import("vite-plus/test/browser/context");
  const trigger = screen.getByRole("button", { name: "report.pdf" });
  await userEvent.click(trigger);
  const content = await screen.findByTestId("content");
  await waitFor(() => expect(content.contains(document.activeElement)).toBe(true));
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByTestId("content")).toBeNull());
  await waitFor(() => expect(document.activeElement).toBe(trigger));
});

it("the default mode leaves focus where it is, as before", async () => {
  render(<OpenedByTrigger modal />);
  const { userEvent } = await import("vite-plus/test/browser/context");
  const trigger = screen.getByRole("button", { name: "report.pdf" });
  await userEvent.click(trigger);
  const content = await screen.findByTestId("content");
  await frames(5);
  expect(content.contains(document.activeElement)).toBe(false);
});
