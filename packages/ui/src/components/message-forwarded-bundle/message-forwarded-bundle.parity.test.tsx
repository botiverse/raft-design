/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ThemeProvider } from "../../lib/theme/theme-provider";
import {
  MessageForwardedBundle,
  MessageForwardedBundleAttachment,
  MessageForwardedBundleAttachments,
  MessageForwardedBundleGallery,
  MessageForwardedBundleGalleryCue,
  MessageForwardedBundleGalleryTile,
  MessageForwardedBundleGalleryViewport,
  MessageForwardedBundleHeader,
  MessageForwardedBundleHeaderLabel,
  MessageForwardedBundleItem,
  MessageForwardedBundleItemAuthor,
  MessageForwardedBundleItemMeta,
  MessageForwardedBundleItems,
} from "./message-forwarded-bundle";

if (typeof window.matchMedia !== "function") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

function renderBundle(
  theme: "brutal" | "elegant",
  options: { fullWidth?: boolean; collapsed?: boolean; interactive?: boolean } = {},
) {
  const { fullWidth = false, collapsed = false, interactive = false } = options;
  return render(
    <ThemeProvider theme={theme}>
      <MessageForwardedBundle data-testid="bundle" fullWidth={fullWidth}>
        <MessageForwardedBundleHeader>
          <MessageForwardedBundleHeaderLabel data-testid="label">
            Forwarded
          </MessageForwardedBundleHeaderLabel>
        </MessageForwardedBundleHeader>
        <MessageForwardedBundleItems data-testid="items" collapsed={collapsed}>
          <MessageForwardedBundleItem data-testid="item">
            <MessageForwardedBundleItemMeta>
              <MessageForwardedBundleItemAuthor data-testid="author">
                @Developer
              </MessageForwardedBundleItemAuthor>
            </MessageForwardedBundleItemMeta>
            body text
            <MessageForwardedBundleAttachments>
              <MessageForwardedBundleAttachment data-testid="chip" interactive={interactive}>
                release-notes.md
              </MessageForwardedBundleAttachment>
            </MessageForwardedBundleAttachments>
          </MessageForwardedBundleItem>
        </MessageForwardedBundleItems>
      </MessageForwardedBundle>
    </ThemeProvider>,
  );
}

const cls = (testid: string) => screen.getByTestId(testid).className;

afterEach(cleanup);

test("forwarded items carry no divider in either theme (flat surface)", () => {
  renderBundle("brutal");
  expect(cls("items")).not.toMatch(/divide-/);
  cleanup();
  renderBundle("elegant");
  expect(cls("items")).not.toMatch(/divide-/);
});

test("the forwarded label keeps its authored casing in both themes", () => {
  renderBundle("brutal");
  expect(cls("label")).not.toContain("uppercase");
  cleanup();
  renderBundle("elegant");
  expect(cls("label")).not.toContain("uppercase");
});

test("elegant item body reads at message-body scale and colour, not as a caption", () => {
  renderBundle("elegant");
  const item = cls("item");
  expect(item).toContain("text-sm");
  expect(item).toContain("text-foreground-strong");
  expect(item).not.toContain("text-[13px]");
  expect(item).not.toContain("text-foreground-muted");
});

test("elegant author row is emphasised like the app's author row", () => {
  renderBundle("elegant");
  expect(cls("author")).toContain("font-semibold");
  expect(cls("author")).toContain("text-foreground-strong");
});

test("fullWidth releases the 34rem cap; the default keeps it", () => {
  renderBundle("brutal");
  expect(cls("bundle")).toContain("max-w-[min(34rem,100%)]");
  cleanup();
  renderBundle("brutal", { fullWidth: true });
  expect(cls("bundle")).toContain("max-w-none");
  expect(cls("bundle")).toContain("w-full");
});

test("interactive attachments get the pointer + focus affordance, static ones do not", () => {
  renderBundle("elegant", { interactive: true });
  expect(cls("chip")).toContain("cursor-pointer");
  expect(cls("chip")).toContain("hover:border-line-strong");
  cleanup();
  renderBundle("elegant");
  expect(cls("chip")).not.toContain("cursor-pointer");
});

test("collapsed items keep the theme fade after the divider removal", () => {
  renderBundle("elegant", { collapsed: true });
  expect(cls("items")).toContain("after:from-layer-panel");
  cleanup();
  renderBundle("brutal", { collapsed: true });
  expect(cls("items")).toContain("after:from-white");
});

test("gallery layout owns the strip while the media stays consumer-provided", () => {
  render(
    <ThemeProvider theme="elegant">
      <MessageForwardedBundleGallery data-testid="gallery">
        <MessageForwardedBundleGalleryViewport data-testid="viewport">
          <MessageForwardedBundleGalleryTile data-testid="tile">
            <img
              src="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='8'%20height='8'/%3E"
              alt=""
            />
          </MessageForwardedBundleGalleryTile>
        </MessageForwardedBundleGalleryViewport>
        <MessageForwardedBundleGalleryCue data-testid="cue-left" side="left" />
        <MessageForwardedBundleGalleryCue data-testid="cue-right" side="right" />
      </MessageForwardedBundleGallery>
    </ThemeProvider>,
  );
  expect(cls("viewport")).toContain("grid-flow-col");
  expect(cls("viewport")).toContain("snap-x");
  expect(cls("viewport")).toContain("overflow-x-auto");
  expect(cls("tile")).toContain("aspect-square");
  expect(screen.getByTestId("gallery").querySelector("img")).toBeTruthy();
});

test("gallery cues are themed in elegant — never a hardcoded white edge", () => {
  renderBundle("brutal");
  cleanup();
  render(
    <ThemeProvider theme="elegant">
      <MessageForwardedBundleGalleryCue data-testid="cue-left" side="left" />
      <MessageForwardedBundleGalleryCue data-testid="cue-right" side="right" />
    </ThemeProvider>,
  );
  expect(cls("cue-left")).toContain("from-layer-panel");
  expect(cls("cue-right")).toContain("from-layer-panel");
  expect(cls("cue-left")).not.toContain("white");
  expect(cls("cue-right")).not.toContain("white");
  expect(cls("cue-left")).toContain("left-0");
  expect(cls("cue-right")).toContain("right-0");
});
