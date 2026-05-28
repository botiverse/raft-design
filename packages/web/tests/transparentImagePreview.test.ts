import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import { imageGalleryBackgroundClass, transparentImageBackgroundClass } from "../src/utils/imagePreviewStyles.js";

const repoRoot = resolve(import.meta.dirname, "..");

test("transparent image previews use a shared checkerboard background class", () => {
  const css = readFileSync(resolve(repoRoot, "src/index.css"), "utf8");

  assert.equal(transparentImageBackgroundClass, "image-transparency-bg");
  assert.match(css, /\.image-transparency-bg\s*\{/);
  assert.match(css, /background-image:/);
});

test("image preview surfaces opt into the transparency background", () => {
  const previewSurfaces = [
    "src/components/message/MessageInput.tsx",
    "src/components/ImageLightbox.tsx",
    "src/components/agent/AgentWorkspace.tsx",
  ];

  for (const surface of previewSurfaces) {
    const source = readFileSync(resolve(repoRoot, surface), "utf8");
    assert.match(source, /transparentImageBackgroundClass/, `${surface} should use the transparency preview class`);
  }
});

test("message gallery uses a quiet background instead of checkerboard", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const css = readFileSync(resolve(repoRoot, "src/index.css"), "utf8");

  assert.equal(imageGalleryBackgroundClass, "image-gallery-bg");
  assert.match(source, /imageGalleryBackgroundClass/);
  assert.doesNotMatch(source, /transparentImageBackgroundClass/);
  assert.match(source, /bg-brutal-cream\/60/);
  assert.doesNotMatch(source, /border-2 border-black bg-transparent/);
  assert.match(source, /const imageBackgroundClass = fitClass === "object-contain" \? imageGalleryBackgroundClass : "";/);
  assert.match(css, /\.image-gallery-bg\s*\{[\s\S]*?background:\s*#fff;/);
});

test("image lightbox backdrop and empty image stage close without making image clicks close", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/ImageLightbox.tsx"), "utf8");

  // Lightbox primitive owns the backdrop dismiss (dismissOnBackdrop=true by default).
  // ImageLightbox passes onClose={close} to Lightbox.
  assert.match(source, /data-testid="image-lightbox"/);
  assert.match(source, /<Lightbox[\s\S]{0,200}onClose=\{close\}/);
  // Image stage also closes on click-outside (target === currentTarget)
  assert.match(source, /data-testid="image-lightbox-stage"/);
  assert.match(source, /data-testid="image-lightbox-stage"[\s\S]*?if \(e\.target === e\.currentTarget\) close\(\)/);
  assert.match(source, /data-testid="image-lightbox-image"/);
});

test("SVG attachments use raster previews instead of inline SVG URLs", () => {
  const messageItem = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
  const messageInput = readFileSync(resolve(repoRoot, "src/components/message/MessageInput.tsx"), "utf8");
  const lightbox = readFileSync(resolve(repoRoot, "src/components/ImageLightbox.tsx"), "utf8");

  assert.match(messageItem, /mimeType === "image\/svg\+xml"[\s\S]*?thumbnailUrl && att\.rasterPreviewUrl/);
  assert.match(messageInput, /mimeType !== "image\/svg\+xml"/);
  assert.match(lightbox, /isSvgPreview && current\.rasterPreviewUrl/);
  assert.match(lightbox, /setFullUrl\(current\.rasterPreviewUrl\)/);
});
