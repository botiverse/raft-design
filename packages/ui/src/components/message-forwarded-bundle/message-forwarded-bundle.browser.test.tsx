import "./message-forwarded-bundle.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
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

// The vitest browser default viewport is 414px wide; the message gallery row
// layout (md:grid-cols-3, the 448px cap) and the sm+ row heights only exist at
// >= 768px, so the layout assertions pin a desktop viewport. Imported lazily:
// CI also loads this file in the node pool, where the browser context module
// refuses to import and every test is skipped anyway.
beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
});

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

function galleryRows(testid: string) {
  return [
    ...screen
      .getByTestId(testid)
      .querySelectorAll('[data-slot="message-forwarded-bundle-gallery-row"]'),
  ];
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

// Forwarded images use the same component family as images in a message:
// MessageImageGallery surfaces inside message-scale rows. The old three-up
// scroll strip (and its edge cues) is gone, so the behavior is asserted across
// all three theme configurations.
const GALLERY_THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

for (const { key, theme, mode } of GALLERY_THEMES) {
  it(`forwarded images lay out in message rows with no horizontal scroll — ${key}`, () => {
    renderGallery(theme, 5, { mode });
    const gallery = screen.getByTestId("gallery");
    // The gallery composes the shared message image gallery root.
    expect(gallery.querySelector('[data-slot="message-image-gallery"]')).not.toBeNull();
    const rows = galleryRows("gallery");
    expect(rows.length).toBe(2);
    expect(rows[0].children.length).toBe(3);
    expect(rows[1].children.length).toBe(2);
    // Every cell is a message gallery item: one surface for both.
    const tiles = gallery.querySelectorAll('[data-testid^="tile-"]');
    expect(tiles.length).toBe(5);
    for (const tile of tiles) {
      expect(tile.getAttribute("data-slot")).toBe("message-image-gallery-item");
    }
    // The message gallery's md+ width cap — forwarded images inherit it.
    expect(Math.round(gallery.getBoundingClientRect().width)).toBe(448);
    // All five cells fit: nothing hides behind a scroll.
    expect(gallery.scrollWidth - gallery.clientWidth).toBeLessThanOrEqual(2);
    for (const tile of tiles) {
      const tileRect = tile.getBoundingClientRect();
      const galleryRect = gallery.getBoundingClientRect();
      expect(tileRect.right).toBeLessThanOrEqual(galleryRect.right + 1);
    }
  });

  it(`forwarded rows follow the message gallery heights — ${key}`, () => {
    renderGallery(theme, 5, { mode });
    const rows = galleryRows("gallery");
    const [threeUp, twoUp] = rows;
    const height = (el: Element) => el.getBoundingClientRect().height;
    const width = (el: Element) => el.getBoundingClientRect().width;
    // Message gallery rows at sm+: three-up 144×128 (h-28 sm:h-32), two-up
    // 220×144 (h-32 sm:h-36); the forwarded rows carry the same measurements.
    expect(Math.round(width(threeUp.children[0]))).toBe(144);
    expect(Math.round(height(threeUp))).toBe(128);
    expect(Math.round(width(twoUp.children[0]))).toBe(220);
    expect(Math.round(height(twoUp))).toBe(144);
    // Cells fill their row.
    expect(Math.abs(height(threeUp.children[0]) - height(threeUp))).toBeLessThanOrEqual(1);
    expect(Math.abs(height(twoUp.children[0]) - height(twoUp))).toBeLessThanOrEqual(1);
  });
}

it("a lone row of four splits into two rows of two", () => {
  renderGallery("elegant", 4, { mode: "light" });
  const rows = galleryRows("gallery");
  expect(rows.length).toBe(2);
  expect(rows[0].children.length).toBe(2);
  expect(rows[1].children.length).toBe(2);
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
