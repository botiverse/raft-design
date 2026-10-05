import "./message-forwarded-bundle.test.css";
import { afterEach, beforeAll, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent, ReactElement } from "react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import type { Theme, ThemeMode } from "../../lib/theme/theme-context";
import {
  MessageForwardedBundle,
  MessageForwardedBundleFooter,
  MessageForwardedBundleFooterAction,
  MessageForwardedBundleGallery,
  MessageForwardedBundleGalleryTile,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemContent,
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
    // The gallery element itself is the shared message gallery root.
    expect(gallery.getAttribute("data-slot")).toBe("message-image-gallery");
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

// The component-owned fold: without a `collapsed` prop the items measure their
// item-content slots and fold when the text renders beyond eight lines in
// total (~8 x 20px line height). Rendered lines are deliberate: each child div
// is exactly one line, so the count does not depend on wrapping.
function renderFoldableBundle(
  lines: number,
  options: {
    theme?: Theme;
    mode?: ThemeMode;
    collapsed?: boolean;
    onAction?: (event: MouseEvent<HTMLButtonElement>) => void;
  } = {},
) {
  const { theme = "elegant", mode, collapsed, onAction } = options;
  const lineChildren = Array.from({ length: lines }, (_, index) => (
    <div key={index}>Line {index + 1}</div>
  ));
  return render(
    <ThemeProvider theme={theme} mode={mode}>
      <div style={{ width: 560 }}>
        <MessageForwardedBundle data-testid="bundle">
          <MessageForwardedBundleItems data-testid="items" collapsed={collapsed}>
            <MessageForwardedBundleItem>
              <MessageForwardedBundleItemContent data-testid="content">
                {lineChildren}
              </MessageForwardedBundleItemContent>
            </MessageForwardedBundleItem>
          </MessageForwardedBundleItems>
          <MessageForwardedBundleFooter data-testid="footer">
            <MessageForwardedBundleFooterAction data-testid="action" onClick={onAction}>
              Show all 1 message
            </MessageForwardedBundleFooterAction>
          </MessageForwardedBundleFooter>
        </MessageForwardedBundle>
      </div>
    </ThemeProvider>,
  );
}

for (const { key, theme, mode } of GALLERY_THEMES) {
  it(`nine lines of item text fold the bundle and the action toggles it — ${key}`, () => {
    renderFoldableBundle(9, { theme, mode });
    const items = screen.getByTestId("items");
    // The component measured the content and folded on its own.
    expect(items.getAttribute("data-collapsed")).toBe("true");
    // The footer only exists while the content folds.
    expect(screen.getByTestId("footer")).not.toBeNull();
    // Without a consumer handler the action toggles the component-owned fold.
    fireEvent.click(screen.getByTestId("action"));
    expect(items.getAttribute("data-collapsed")).toBeNull();
  });

  it(`eight lines of item text stay open with no footer — ${key}`, () => {
    renderFoldableBundle(8, { theme, mode });
    expect(screen.getByTestId("items").getAttribute("data-collapsed")).toBeNull();
    expect(screen.queryByTestId("footer")).toBeNull();
  });
}

function renderMultiItemBundle(itemLines: number[]) {
  return render(
    <ThemeProvider theme="elegant" mode="light">
      <div style={{ width: 560 }}>
        <MessageForwardedBundle data-testid="bundle">
          <MessageForwardedBundleItems data-testid="items">
            {itemLines.map((lines, itemIndex) => (
              <MessageForwardedBundleItem key={itemIndex}>
                <MessageForwardedBundleItemContent>
                  {Array.from({ length: lines }, (_, index) => (
                    <div key={index}>
                      Item {itemIndex + 1} line {index + 1}
                    </div>
                  ))}
                </MessageForwardedBundleItemContent>
              </MessageForwardedBundleItem>
            ))}
          </MessageForwardedBundleItems>
          <MessageForwardedBundleFooter data-testid="footer">
            <MessageForwardedBundleFooterAction data-testid="action">
              Show all {itemLines.length} messages
            </MessageForwardedBundleFooterAction>
          </MessageForwardedBundleFooter>
        </MessageForwardedBundle>
      </div>
    </ThemeProvider>,
  );
}

it("multiple short items fold when their text adds up beyond eight lines", () => {
  // Three items of four lines each: no single item is long, the card is.
  renderMultiItemBundle([4, 4, 4]);
  expect(screen.getByTestId("items").getAttribute("data-collapsed")).toBe("true");
  expect(screen.getByTestId("footer")).not.toBeNull();
});

it("multiple short items stay open while their total stays within eight lines", () => {
  renderMultiItemBundle([3, 3, 2]);
  expect(screen.getByTestId("items").getAttribute("data-collapsed")).toBeNull();
  expect(screen.queryByTestId("footer")).toBeNull();
});

it("a consumer handler that calls preventDefault suppresses the toggle", () => {
  renderFoldableBundle(9, {
    theme: "elegant",
    mode: "light",
    onAction: (event) => event.preventDefault(),
  });
  const items = screen.getByTestId("items");
  expect(items.getAttribute("data-collapsed")).toBe("true");
  fireEvent.click(screen.getByTestId("action"));
  // The consumer took the click (e.g. opened a detail view): the fold stays.
  expect(items.getAttribute("data-collapsed")).toBe("true");
});

/** One wrapped paragraph (no explicit line breaks), so the width drives the line count. */
const REFLOW_TEXT = "Rollout notes ".repeat(28);

function reflowJsx(width: number, text: string) {
  return (
    <ThemeProvider theme="elegant" mode="light">
      <div style={{ width }}>
        <MessageForwardedBundle data-testid="bundle">
          <MessageForwardedBundleItems data-testid="items">
            <MessageForwardedBundleItem>
              <MessageForwardedBundleItemContent data-testid="content">
                {text}
              </MessageForwardedBundleItemContent>
            </MessageForwardedBundleItem>
          </MessageForwardedBundleItems>
          <MessageForwardedBundleFooter data-testid="footer">
            <MessageForwardedBundleFooterAction data-testid="action">
              Show all 1 message
            </MessageForwardedBundleFooterAction>
          </MessageForwardedBundleFooter>
        </MessageForwardedBundle>
      </div>
    </ThemeProvider>
  );
}

/** The observers report asynchronously; poll until the assertion holds. */
async function eventually(check: () => void) {
  const deadline = Date.now() + 2000;
  for (;;) {
    try {
      check();
      return;
    } catch (error) {
      if (Date.now() > deadline) throw error;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
}

it("a reflow under the limit reopens a manually collapsed bundle", async () => {
  // Narrow: the paragraph wraps past eight lines and folds.
  const view = render(reflowJsx(300, REFLOW_TEXT));
  const items = screen.getByTestId("items");
  await eventually(() => expect(items.getAttribute("data-collapsed")).toBe("true"));
  fireEvent.click(screen.getByTestId("action"));
  expect(items.getAttribute("data-collapsed")).toBeNull();
  // Manually collapse it again; the reader's choice is in force.
  fireEvent.click(screen.getByTestId("action"));
  expect(items.getAttribute("data-collapsed")).toBe("true");
  // Widen: the text now renders under the limit. The component must reopen
  // unconditionally — otherwise the list stays clipped at the fold height
  // with the footer gone and no way back open.
  view.rerender(reflowJsx(560, REFLOW_TEXT));
  await eventually(() => expect(items.getAttribute("data-collapsed")).toBeNull());
  await eventually(() => expect(screen.queryByTestId("footer")).toBeNull());
});

it("a controlled collapsed prop skips the measurement", () => {
  renderFoldableBundle(9, { theme: "elegant", mode: "light", collapsed: false });
  // Pinned open by the consumer despite the line count; the footer stays
  // caller-owned instead of auto-hiding.
  expect(screen.getByTestId("items").getAttribute("data-collapsed")).toBeNull();
  expect(screen.getByTestId("footer")).not.toBeNull();
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
