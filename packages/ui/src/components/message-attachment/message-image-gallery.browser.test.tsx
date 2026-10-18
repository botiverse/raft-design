import "./message-image-gallery.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { ThemeMode } from "../../lib/theme/theme-context";
import {
  MessageImageGallery,
  MessageImageGalleryItem,
  MessageImageGalleryRow,
} from "./message-image-gallery";
import { buildMessageImageGalleryRows } from "./message-image-gallery-rows";

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

// The row heights and the md+ three-column layout only exist at >= 768px, so
// the geometry assertions pin a desktop viewport. Imported lazily: CI also
// loads this file in the node pool, where the browser context module refuses
// to import and every test is skipped anyway.
beforeAll(async () => {
  if (typeof window === "undefined") return;
  const { page } = await import("vite-plus/test/browser/context");
  await page.viewport(1280, 900);
});

const IMAGE =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='16'%20height='16'%3E%3Crect%20width='16'%20height='16'%20fill='%23dbeafe'/%3E%3C/svg%3E";

type ImageInput = { width?: number | null; height?: number | null };

function renderImages(images: ImageInput[], options: { mode?: ThemeMode } = {}) {
  const rows = buildMessageImageGalleryRows(images);
  return render(
    <ThemeProvider mode={options.mode}>
      <div style={{ width: 560 }}>
        <MessageImageGallery data-testid="gallery">
          {rows.map((row, rowIndex) => (
            <MessageImageGalleryRow key={rowIndex} data-testid={`row-${rowIndex}`} row={row}>
              {row.items.map((item) => (
                <MessageImageGalleryItem
                  key={item.index}
                  data-testid={`item-${item.index}`}
                  layout={item}
                >
                  <img src={IMAGE} alt="" data-testid={`img-${item.index}`} />
                </MessageImageGalleryItem>
              ))}
            </MessageImageGalleryRow>
          ))}
        </MessageImageGallery>
      </div>
    </ThemeProvider>,
  );
}

function galleryRows() {
  return [
    ...screen.getByTestId("gallery").querySelectorAll('[data-slot="message-image-gallery-row"]'),
  ];
}

const height = (el: Element) => Math.round(el.getBoundingClientRect().height);
const width = (el: Element) => Math.round(el.getBoundingClientRect().width);

const MODES = ["light", "dark"] as const satisfies readonly ThemeMode[];

for (const mode of MODES) {
  it(`rows carry the gallery heights for their count — ${mode}`, () => {
    renderImages(
      [
        { width: 800, height: 600 },
        { width: 400, height: 400 },
        { width: 120, height: 90 },
        { width: 800, height: 600 },
        { width: 400, height: 400 },
      ],
      { mode },
    );
    const rows = galleryRows();
    expect(rows.length).toBe(2);
    expect(rows[0].getAttribute("data-count")).toBe("3");
    expect(rows[1].getAttribute("data-count")).toBe("2");
    // sm+: three-up tiles are 8rem (128), two-up tiles 9rem (144). The
    // gallery column is narrow, so a three-up row lays out two columns wide
    // and folds into two 128 grid rows 4px apart.
    for (const tile of rows[0].children) expect(height(tile)).toBe(128);
    expect(height(rows[0])).toBe(128 * 2 + 4);
    expect(height(rows[1])).toBe(144);
    expect(height(rows[1].children[0])).toBe(144);
  });

  it(`a single image keeps its proportions and never crops — ${mode}`, () => {
    renderImages([{ width: 800, height: 600 }], { mode });
    const item = screen.getByTestId("item-0");
    expect(item.getAttribute("data-single")).toBe("true");
    expect(item.getAttribute("data-fit")).toBe("contain");
    // The reserved box: min(384px, 100%) wide, 800/600 tall — here 100% of
    // the gallery's 360px column.
    expect(width(item)).toBe(360);
    expect(height(item)).toBe(270);
    expect(getComputedStyle(screen.getByTestId("img-0")).objectFit).toBe("contain");
  });

  it(`wide images stay fully visible on the cell's fill while normals crop — ${mode}`, () => {
    renderImages(
      [
        { width: 220, height: 100 },
        { width: 120, height: 90 },
      ],
      { mode },
    );
    // The wide image takes a row of its own; the normal one crops.
    expect(getComputedStyle(screen.getByTestId("img-0")).objectFit).toBe("contain");
    // The image paints no backdrop of its own; the cell's muted fill shows
    // around it.
    expect(getComputedStyle(screen.getByTestId("img-0")).backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(screen.getByTestId("img-1")).objectFit).toBe("cover");
  });
}

it("a single image without dimensions reserves the 4/3 fallback box", () => {
  renderImages([{ width: null, height: null }], { mode: "light" });
  const item = screen.getByTestId("item-0");
  expect(width(item)).toBe(176);
  expect(height(item)).toBe(132);
});

it("a three-up row keeps per-image heights when it wraps on narrow viewports", async () => {
  const { page } = await import("vite-plus/test/browser/context");
  const images = [
    { width: 320, height: 240 },
    { width: 320, height: 240 },
    { width: 320, height: 240 },
  ];
  // Below 768px the three-up rows fold into two grid rows; the height must
  // ride each grid row (auto-rows), not the row box — otherwise both rows
  // squeeze into one fixed height (the regression this pins).
  for (const [viewportWidth, rowHeight] of [
    [390, 112],
    [700, 128],
  ] as const) {
    await page.viewport(viewportWidth, 900);
    renderImages(images);
    const row = galleryRows()[0];
    const tiles = [...row.children] as HTMLElement[];
    expect(tiles.length).toBe(3);
    for (const tile of tiles) {
      expect(Math.round(tile.getBoundingClientRect().height)).toBe(rowHeight);
    }
    expect(Math.round(row.getBoundingClientRect().height)).toBe(rowHeight * 2 + 4);
    cleanup();
  }
  await page.viewport(1280, 900);
});
