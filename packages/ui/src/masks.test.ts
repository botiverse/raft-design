import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { compile } from "tailwindcss";
import { expect, test } from "vite-plus/test";
import { cn } from "./lib/cn";
import { composerAttachment } from "./components/composer/composer-attachment.recipe";
import { messageForwardedBundle } from "./components/message-forwarded-bundle/message-forwarded-bundle.recipe";
import { messageImageGallery } from "./components/message-attachment/message-image-gallery.recipe";
import { messageItem } from "./components/message-item/message-item.recipe";
import { taskCardStatus } from "./components/task-card/task-card-status.recipe";

// Content fades, the veil and the dimmed opacity
// (design/foundations/spacing.md#edges-fade, color.md#surfaces,
// states.md#dimmed): the tokens, the utilities they compile to, and the
// recipes that moved onto them.

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const foundation = readFileSync(join(sourceDirectory, "foundation.css"), "utf8");
const styles = readFileSync(join(sourceDirectory, "styles.css"), "utf8");

async function build(candidates: string[]) {
  const compiler = await compile(`${styles}\n@tailwind utilities;`, {
    loadStylesheet: async (id) => {
      const path = join(sourceDirectory, id);
      return { content: readFileSync(path, "utf8"), path, base: dirname(path) };
    },
  });
  return compiler.build(candidates);
}

/** The declarations of the first block opened by `selector`. */
function block(css: string, selector: string) {
  const start = css.indexOf(`${selector} {`);
  expect(start, `${selector} must exist`).toBeGreaterThan(-1);
  return css.slice(start, css.indexOf("\n}", start));
}

test("the fade lengths and the dimmed opacity are mode-independent tokens", () => {
  const root = block(foundation, ":where(:root)");
  expect(root).toContain("--fade-edge: 24px;");
  expect(root).toContain("--fade-content: 48px;");
  expect(root).toContain("--opacity-dimmed: 0.6;");
});

test("the veil is the page at 80% in both modes", () => {
  const light = block(foundation, ":where(:root),\n.light");
  expect(light).toContain("--layer-canvas: oklch(1 0 0);");
  expect(light).toContain("--layer-veil: oklch(1 0 0 / 0.8);");
  for (const selector of [".dark", ":root:not(.light):not(.dark)"]) {
    const dark = block(foundation, selector);
    const canvas = dark.match(/--layer-canvas: oklch\(([^)]+)\);/)?.[1];
    expect(canvas, selector).toBeDefined();
    expect(dark).toContain(`--layer-veil: oklch(${canvas} / 0.8);`);
  }
});

test("the fade utilities are masks over the fade lengths, never a colour", async () => {
  const css = await build([
    "mask-fade-t",
    "mask-fade-t-edge",
    "mask-fade-b",
    "mask-fade-b-edge",
    "mask-fade-x",
    "opacity-dimmed",
    "bg-layer-veil",
    "data-tight-fold:mask-fade-b-edge",
  ]);
  expect(block(css, ".data-tight-fold\\:mask-fade-b-edge[data-tight-fold]")).toContain(
    "var(--fade-edge)",
  );
  expect(block(css, ".mask-fade-t")).toContain(
    "mask-image: linear-gradient(to bottom, transparent, oklch(0 0 0) var(--fade-content));",
  );
  expect(block(css, ".mask-fade-t-edge")).toContain(
    "mask-image: linear-gradient(to bottom, transparent, oklch(0 0 0) var(--fade-edge));",
  );
  expect(block(css, ".mask-fade-b")).toContain(
    "mask-image: linear-gradient(to top, transparent, oklch(0 0 0) var(--fade-content));",
  );
  expect(block(css, ".mask-fade-b-edge")).toContain(
    "mask-image: linear-gradient(to top, transparent, oklch(0 0 0) var(--fade-edge));",
  );
  // mask-fade-x masks only the side data-overflow names, and nothing without it.
  expect(css).not.toMatch(/\.mask-fade-x \{/);
  expect(block(css, '.mask-fade-x[data-overflow="start"]')).toContain(
    "mask-image: linear-gradient(to right, transparent, oklch(0 0 0) var(--fade-edge));",
  );
  expect(block(css, '.mask-fade-x[data-overflow="end"]')).toContain(
    "mask-image: linear-gradient(to left, transparent, oklch(0 0 0) var(--fade-edge));",
  );
  expect(block(css, '.mask-fade-x[data-overflow="both"]')).toMatch(
    /to right, transparent, oklch\(0 0 0\) var\(--fade-edge\), oklch\(0 0 0\) calc\(100% - var\(--fade-edge\)\), transparent/,
  );
  expect(block(css, ".opacity-dimmed")).toContain("opacity: var(--opacity-dimmed);");
  expect(block(css, ".bg-layer-veil")).toContain("background-color: var(--layer-veil);");
});

test("tailwind-merge sees the fades as mask-image and dimmed as opacity", () => {
  expect(cn("mask-fade-b", "mask-fade-b-edge")).toBe("mask-fade-b-edge");
  // A variant is its own slot: the tight fold's edge fade survives beside the default.
  expect(cn("mask-fade-b", "data-tight-fold:mask-fade-b-edge")).toBe(
    "mask-fade-b data-tight-fold:mask-fade-b-edge",
  );
  expect(cn("mask-[linear-gradient(red,blue)]", "mask-fade-x")).toBe("mask-fade-x");
  expect(cn("opacity-60", "opacity-dimmed")).toBe("opacity-dimmed");
  expect(cn("opacity-dimmed", "opacity-100")).toBe("opacity-100");
});

test("the busy covers take the veil", () => {
  const slots = composerAttachment();
  expect(slots.attachmentUploadingOverlay()).toContain("bg-layer-veil");
  expect(slots.attachmentFailedOverlay()).toContain("bg-layer-veil");
  expect(slots.attachmentUploadingOverlay()).not.toMatch(/bg-layer-card\//);
  expect(slots.attachmentFailedOverlay()).not.toMatch(/bg-layer-card\//);

  const gallery = messageImageGallery({ count: 1 });
  expect(gallery.overlay()).toContain("bg-layer-veil");
  expect(gallery.item()).not.toContain("opacity-70");
  expect(gallery.preview()).toContain("hover:bg-ink-8");
});

test("a folded bundle fades with a mask, not a card-coloured gradient", () => {
  const items = messageForwardedBundle({ collapsed: true }).items();
  expect(items).toContain("mask-fade-b");
  // The canonical spelling of data-[tight-fold]: (the lint's autofix writes it).
  expect(items).toContain("data-tight-fold:mask-fade-b-edge");
  expect(items).not.toMatch(/from-layer-card|after:bg-linear/);
});

test("deleted, busy and pending things dim with opacity-dimmed", () => {
  expect(messageItem().delegatedAvatar()).toContain(
    "data-deleted:*:data-[slot=avatar]:grayscale data-deleted:*:data-[slot=avatar]:opacity-dimmed",
  );
  expect(taskCardStatus()).toContain("data-[busy=true]:opacity-dimmed");
});
