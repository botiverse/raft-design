import "./message-forwarded-bundle.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import {
  MessageForwardedBundle,
  MessageForwardedBundleGallery,
  MessageForwardedBundleGalleryTile,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
} from "./message-forwarded-bundle";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const IMAGE =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='96'%20height='96'%3E%3Crect%20width='96'%20height='96'%20fill='%23dbeafe'/%3E%3C/svg%3E";

function renderBundle(theme: Theme, options: { fullWidth?: boolean; width?: number } = {}) {
  const { fullWidth = false, width = 560 } = options;
  return render(
    <ThemeProvider theme={theme}>
      <div style={{ width }}>
        <MessageForwardedBundle data-testid="bundle" fullWidth={fullWidth}>
          <MessageForwardedBundleHeader>
            <MessageForwardedBundleHeaderLabel data-testid="label">
              Forwarded
            </MessageForwardedBundleHeaderLabel>
          </MessageForwardedBundleHeader>
          <MessageForwardedBundleItems data-testid="items">
            {[0, 1].map((n) => (
              <MessageForwardedBundleItem key={n} data-testid={`item-${n}`}>
                <MessageForwardedBundleItemMeta>
                  <MessageForwardedBundleItemAuthor data-testid={`author-${n}`}>
                    @Developer
                  </MessageForwardedBundleItemAuthor>
                </MessageForwardedBundleItemMeta>
                forward body {n}
              </MessageForwardedBundleItem>
            ))}
          </MessageForwardedBundleItems>
        </MessageForwardedBundle>
      </div>
    </ThemeProvider>,
  );
}

function galleryJsx(
  theme: Theme,
  images: number,
  options: { width?: number; mode?: ThemeMode } = {},
): ReactElement {
  const { width = 560, mode } = options;
  return (
    <ThemeProvider theme={theme} mode={mode}>
      <div style={{ width }}>
        <MessageForwardedBundleGallery data-testid="gallery">
          {Array.from({ length: images }, (_, index) => (
            <MessageForwardedBundleGalleryTile key={index} data-testid={`tile-${index}`}>
              <img src={IMAGE} alt="" />
            </MessageForwardedBundleGalleryTile>
          ))}
        </MessageForwardedBundleGallery>
      </div>
    </ThemeProvider>
  );
}

function renderGallery(
  theme: Theme,
  images: number,
  options: { width?: number; mode?: ThemeMode } = {},
) {
  return render(galleryJsx(theme, images, options));
}

function viewportOf(testid: string) {
  const el = screen
    .getByTestId(testid)
    .querySelector('[data-slot="message-forwarded-bundle-gallery-viewport"]');
  if (!el) throw new Error("gallery viewport missing");
  return el as HTMLElement;
}

function cueOpacity(side: "left" | "right") {
  const cue = screen.getByTestId("gallery").querySelector(`[data-side="${side}"]`);
  if (!cue) throw new Error(`cue ${side} missing`);
  return getComputedStyle(cue).opacity;
}

/** The cue fades with `transition-opacity`; poll until the transition settles. */
async function expectCueOpacity(side: "left" | "right", want: string) {
  const deadline = Date.now() + 2000;
  while (Date.now() < deadline) {
    if (cueOpacity(side) === want) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  expect(cueOpacity(side)).toBe(want);
}

for (const theme of ["brutal", "elegant"] as const) {
  it(`forwarded items carry no divider between entries — ${theme}`, () => {
    renderBundle(theme);
    // The divider used to live on the items container as `divide-y`, which
    // borders the entries themselves (Tailwind v4 draws it as the older
    // entry's BOTTOM border, v3 as the newer entry's TOP — measure both edges
    // on both entries so either implementation going missing fails). The
    // container keeps its own theme frame, so the divider is never measured
    // on the container.
    for (const id of ["item-0", "item-1"]) {
      const style = getComputedStyle(screen.getByTestId(id));
      expect(style.borderTopWidth).toBe("0px");
      expect(style.borderBottomWidth).toBe("0px");
    }
  });
}

it("the forwarded label keeps its authored casing (no text-transform)", () => {
  renderBundle("brutal");
  expect(getComputedStyle(screen.getByTestId("label")).textTransform).toBe("none");
});

it("elegant forwarded body reads at message scale with an emphasised author", () => {
  renderBundle("elegant");
  expect(getComputedStyle(screen.getByTestId("item-0")).fontSize).toBe("14px");
  expect(
    Number(getComputedStyle(screen.getByTestId("author-0")).fontWeight),
  ).toBeGreaterThanOrEqual(600);
});

// The cue hooks live in per-theme recipe entries; a hook missing in one theme
// (which happened in review) passes every Brutal-only assertion, so the
// scroll behavior is asserted across all three theme configurations.
const GALLERY_THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

for (const { key, theme, mode } of GALLERY_THEMES) {
  it(`an exactly-fitting strip shows no edge cues — ${key}`, async () => {
    renderGallery(theme, 3, { mode });
    const viewport = viewportOf("gallery");
    await expectCueOpacity("left", "0");
    await expectCueOpacity("right", "0");
    // Nothing to reveal on either side.
    expect(screen.getByTestId("gallery").getAttribute("data-overflow-right")).toBeNull();
    expect(Math.abs(viewport.scrollWidth - viewport.clientWidth)).toBeLessThanOrEqual(2);
  });

  it(`a scrollable strip reveals only the cue for the side that still has content — ${key}`, async () => {
    renderGallery(theme, 4, { mode });
    const viewport = viewportOf("gallery");
    const max = viewport.scrollWidth - viewport.clientWidth;
    expect(max).toBeGreaterThan(2);
    // At the start: content waits on the right only.
    await expectCueOpacity("left", "0");
    await expectCueOpacity("right", "1");
    // Mid-scroll: content waits on both sides.
    viewport.scrollLeft = Math.round(max / 2);
    viewport.dispatchEvent(new Event("scroll"));
    await expectCueOpacity("left", "1");
    await expectCueOpacity("right", "1");
    // At the end: the right cue retires.
    viewport.scrollLeft = max;
    viewport.dispatchEvent(new Event("scroll"));
    await expectCueOpacity("right", "0");
  });
}

it("tiles arriving after mount surface the trailing cue without a scroll", async () => {
  // Attachment URLs resolve asynchronously in the app: the strip grows while
  // the viewport stays the same size, so the overflow must be recomputed on
  // DOM changes, not only on scroll/resize.
  const view = renderGallery("elegant", 2);
  await expectCueOpacity("right", "0");
  view.rerender(galleryJsx("elegant", 5));
  await expectCueOpacity("right", "1");
  await expectCueOpacity("left", "0");
});

it("fullWidth releases the 34rem cap", () => {
  renderBundle("brutal");
  const capped = screen.getByTestId("bundle").getBoundingClientRect().width;
  cleanup();
  renderBundle("brutal", { fullWidth: true, width: 900 });
  const released = screen.getByTestId("bundle").getBoundingClientRect().width;
  expect(capped).toBeLessThan(560);
  expect(released).toBeGreaterThan(800);
});
