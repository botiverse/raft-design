import "./masks.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { Tabs, TabsList, TabsTab } from "./components/tabs/tabs";
import {
  ComposerAttachmentFailedOverlay,
  ComposerAttachmentUploadingOverlay,
} from "./components/composer/composer-attachments";
import {
  MessageImageGalleryItem,
  MessageImageGalleryOverlay,
  MessageImageGalleryPreview,
} from "./components/message-attachment/message-image-gallery";
import { LightboxThumbnail } from "./components/lightbox/lightbox";

// The content fades, the veil and the dimmed opacity, as the browser computes
// them (design/foundations/spacing.md#edges-fade, color.md#surfaces,
// states.md#dimmed).

const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

const maskOf = (element: Element) => {
  const style = getComputedStyle(element);
  return style.maskImage || style.webkitMaskImage;
};

it("mask-fade-b and mask-fade-t fade 48px, their -edge forms 24px, as masks", () => {
  render(
    <div>
      <div data-testid="b" className="mask-fade-b h-40" />
      <div data-testid="t" className="mask-fade-t h-40" />
      <div data-testid="b-edge" className="mask-fade-b-edge h-40" />
      <div data-testid="t-edge" className="mask-fade-t-edge h-40" />
    </div>,
  );
  expect(maskOf(screen.getByTestId("b"))).toMatch(/^linear-gradient\(to top, .*48px\)$/);
  // "to bottom" is the default direction, which the computed value leaves out.
  expect(maskOf(screen.getByTestId("t"))).toMatch(
    /^linear-gradient\(rgba\(0, 0, 0, 0\), .*48px\)$/,
  );
  expect(maskOf(screen.getByTestId("b-edge"))).toMatch(/^linear-gradient\(to top, .*24px\)$/);
  expect(maskOf(screen.getByTestId("t-edge"))).toMatch(
    /^linear-gradient\(rgba\(0, 0, 0, 0\), .*24px\)$/,
  );
  // A mask, so nothing is painted over the content.
  expect(getComputedStyle(screen.getByTestId("b")).backgroundImage).toBe("none");
});

it("mask-fade-x fades 24px on the side data-overflow names, and nowhere without it", () => {
  render(
    <div>
      <div data-testid="none" className="mask-fade-x" />
      <div data-testid="start" className="mask-fade-x" data-overflow="start" />
      <div data-testid="end" className="mask-fade-x" data-overflow="end" />
      <div data-testid="both" className="mask-fade-x" data-overflow="both" />
    </div>,
  );
  expect(maskOf(screen.getByTestId("none"))).toBe("none");
  expect(maskOf(screen.getByTestId("start"))).toMatch(/^linear-gradient\(to right, .*24px\)$/);
  expect(maskOf(screen.getByTestId("end"))).toMatch(/^linear-gradient\(to left, .*24px\)$/);
  expect(maskOf(screen.getByTestId("both"))).toMatch(
    /^linear-gradient\(to right, .*24px.*calc\(100% - 24px\).*\)$/,
  );
});

it("a tab row that overflows fades its hidden side over the 24px edge fade", async () => {
  render(
    <div style={{ width: 200 }}>
      <Tabs defaultValue="t0">
        <TabsList data-testid="row">
          {Array.from({ length: 12 }, (_, n) => (
            <TabsTab key={n} value={`t${n}`}>
              Tab number {n}
            </TabsTab>
          ))}
        </TabsList>
      </Tabs>
    </div>,
  );
  const row = screen.getByTestId("row");
  await waitFor(() => expect(row.getAttribute("data-overflow")).toBe("end"));
  expect(maskOf(row)).toMatch(/^linear-gradient\(to left, .*24px\)$/);
  expect(maskOf(row)).not.toContain("32px");
});

it("the veil is the page at 80% in both modes, under the busy covers", () => {
  render(
    <div>
      <div className="light">
        <ComposerAttachmentUploadingOverlay data-testid="light-uploading" />
        <ComposerAttachmentFailedOverlay data-testid="light-failed" />
      </div>
      <div className="dark">
        <ComposerAttachmentUploadingOverlay data-testid="dark-uploading" />
        <ComposerAttachmentFailedOverlay data-testid="dark-failed" />
        <MessageImageGalleryItem data-testid="dark-pending">
          <MessageImageGalleryOverlay data-testid="dark-overlay" />
        </MessageImageGalleryItem>
      </div>
    </div>,
  );
  const fill = (id: string) => getComputedStyle(screen.getByTestId(id)).backgroundColor;
  expect(fill("light-uploading")).toBe("oklch(1 0 0 / 0.8)");
  expect(fill("light-failed")).toBe("oklch(1 0 0 / 0.8)");
  expect(fill("dark-uploading")).toBe("oklch(0.2213 0.0038 106.71 / 0.8)");
  expect(fill("dark-failed")).toBe("oklch(0.2213 0.0038 106.71 / 0.8)");
  expect(fill("dark-overlay")).toBe("oklch(0.2213 0.0038 106.71 / 0.8)");
  // The pending image is veiled, no longer faded as a whole.
  expect(getComputedStyle(screen.getByTestId("dark-pending")).opacity).toBe("1");
});

it("an image preview hovers with ink-8, a colour wash and not a brightness filter", () => {
  render(
    <MessageImageGalleryItem>
      <MessageImageGalleryPreview data-testid="preview" />
    </MessageImageGalleryItem>,
  );
  const preview = screen.getByTestId("preview");
  expect(preview.className).toContain("hover:bg-ink-8");
  expect(getComputedStyle(preview).backdropFilter).toBe("none");
});

it("lightbox thumbnails dim with the nested scrim, in both modes", () => {
  render(
    <div>
      <div className="light">
        <LightboxThumbnail data-testid="light" />
      </div>
      <div className="dark">
        <LightboxThumbnail data-testid="dark" />
        <LightboxThumbnail data-testid="active" active />
      </div>
    </div>,
  );
  const overlay = (id: string) =>
    getComputedStyle(
      screen.getByTestId(id).querySelector("[data-slot=lightbox-thumbnail-overlay]")!,
    ).backgroundColor;
  expect(overlay("light")).toBe("oklch(0 0 0 / 0.4)");
  expect(overlay("dark")).toBe("oklch(0 0 0 / 0.4)");
  expect(overlay("active")).toBe("rgba(0, 0, 0, 0)");
});

it("opacity-dimmed is 60%; a drag origin keeps its own 40%", () => {
  render(
    <div>
      <div data-testid="dimmed" className="opacity-dimmed" />
      <div data-testid="origin" data-drag-origin="" />
    </div>,
  );
  expect(getComputedStyle(screen.getByTestId("dimmed")).opacity).toBe("0.6");
  expect(getComputedStyle(screen.getByTestId("origin")).opacity).toBe("0.4");
});
