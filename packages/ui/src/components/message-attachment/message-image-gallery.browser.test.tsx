import "./message-image-gallery.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
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

function renderImages(theme: Theme, images: ImageInput[], options: { mode?: ThemeMode } = {}) {
  const rows = buildMessageImageGalleryRows(images);
  return render(
    <ThemeProvider theme={theme} mode={options.mode}>
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

const THEMES: readonly { key: string; theme: Theme; mode?: ThemeMode }[] = [
  { key: "brutal", theme: "brutal" },
  { key: "elegant light", theme: "elegant", mode: "light" },
  { key: "elegant dark", theme: "elegant", mode: "dark" },
];

for (const { key, theme, mode } of THEMES) {
  it(`rows carry the gallery heights for their count — ${key}`, () => {
    renderImages(
      theme,
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
    // sm+: three-up is h-28 sm:h-32 (128), two-up is h-32 sm:h-36 (144).
    expect(height(rows[0])).toBe(128);
    expect(height(rows[1])).toBe(144);
    for (const row of rows) {
      expect(height(row.children[0])).toBe(height(row));
    }
  });

  it(`a single image keeps its proportions and never crops — ${key}`, () => {
    renderImages(theme, [{ width: 800, height: 600 }], { mode });
    const item = screen.getByTestId("item-0");
    expect(item.getAttribute("data-single")).toBe("true");
    expect(item.getAttribute("data-fit")).toBe("contain");
    // The reserved box: min(384px, 100%) wide, 800/600 tall.
    expect(width(item)).toBe(384);
    expect(height(item)).toBe(288);
    expect(getComputedStyle(screen.getByTestId("img-0")).objectFit).toBe("contain");
  });

  it(`wide images stay fully visible on a backdrop while normals crop — ${key}`, () => {
    renderImages(
      theme,
      [
        { width: 220, height: 100 },
        { width: 120, height: 90 },
      ],
      { mode },
    );
    // The wide image takes a row of its own; the normal one crops.
    expect(getComputedStyle(screen.getByTestId("img-0")).objectFit).toBe("contain");
    // The contain backdrop is white in every theme; themes remap `white`, so
    // accept the color spaces browsers report for the mapped value.
    expect(["rgb(255, 255, 255)", "oklch(1 0 0)"]).toContain(
      getComputedStyle(screen.getByTestId("img-0")).backgroundColor,
    );
    expect(getComputedStyle(screen.getByTestId("img-1")).objectFit).toBe("cover");
  });
}

it("a single image without dimensions reserves the 4/3 fallback box", () => {
  renderImages("elegant", [{ width: null, height: null }], { mode: "light" });
  const item = screen.getByTestId("item-0");
  expect(width(item)).toBe(176);
  expect(height(item)).toBe(132);
});
