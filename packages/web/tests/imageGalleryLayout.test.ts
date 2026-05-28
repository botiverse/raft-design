import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(repoRoot, "src/components/message/MessageItem.tsx"), "utf8");
const inputSource = readFileSync(resolve(repoRoot, "src/components/message/MessageInput.tsx"), "utf8");
const messageStoreSource = readFileSync(resolve(repoRoot, "src/store/messageStore.ts"), "utf8");

test("image gallery layout is ratio-aware instead of count-only", () => {
  assert.match(source, /export function classifyImageAspect/);
  assert.match(source, /ratio >= 2\.2/);
  assert.match(source, /ratio <= 0\.55/);
  assert.match(source, /export function buildImageGalleryRows/);
  assert.match(source, /classifyImageAspect\(attachment\) === "wide"[\s\S]*?pushBufferedRows\(\)/);
  assert.match(source, /getImageGalleryFitClass\(att\)/);
  assert.match(source, /inline-block w-fit max-w-\[26rem\] justify-self-start/);
  assert.doesNotMatch(source, /function getImageGalleryGridClass/);
});

test("single image gallery reserves aspect-ratio space before the image loads", () => {
  assert.match(source, /const SINGLE_IMAGE_MAX_WIDTH = 416;/);
  assert.match(source, /const SINGLE_IMAGE_MAX_HEIGHT = 288;/);
  assert.match(source, /function getSingleImageReserveStyle\(att: MessageImageAttachment\)/);
  assert.match(source, /return \{ width: "min\(11rem, 100%\)", aspectRatio: "4 \/ 3" \};/);
  assert.match(source, /const scale = Math\.min\(SINGLE_IMAGE_MAX_WIDTH \/ att\.width, SINGLE_IMAGE_MAX_HEIGHT \/ att\.height, 1\);/);
  assert.match(source, /const imageReserveStyle = isSingleImage \? getSingleImageReserveStyle\(att\) : undefined;/);
  assert.match(source, /style=\{imageReserveStyle\}/);
  assert.match(source, /width=\{att\.width \?\? undefined\}/);
  assert.match(source, /height=\{att\.height \?\? undefined\}/);
  assert.match(source, /bg-brutal-cream\/60/);
  assert.doesNotMatch(source, /border-2 border-black bg-transparent/);
});

test("optimistic image attachments carry local dimensions when available", () => {
  assert.match(inputSource, /previewWidth\?: number;/);
  assert.match(inputSource, /previewHeight\?: number;/);
  assert.match(inputSource, /function readLocalImageDimensions\(previewUrl: string\)/);
  assert.match(inputSource, /const width = image\.naturalWidth;/);
  assert.match(inputSource, /const height = image\.naturalHeight;/);
  assert.match(inputSource, /readLocalImageDimensions\(pending\.preview\)/);
  assert.match(inputSource, /previewWidth: dimensions\.width/);
  assert.match(inputSource, /previewHeight: dimensions\.height/);
  assert.match(inputSource, /width: pf\.previewWidth \?\? null/);
  assert.match(inputSource, /height: pf\.previewHeight \?\? null/);
});

test("sent image attachments keep local previews across optimistic handoff", () => {
  assert.match(messageStoreSource, /function mergeOptimisticAttachmentPreviews/);
  assert.match(messageStoreSource, /localPreviewUrl: attachment\.localPreviewUrl \?\? local\.localPreviewUrl/);
  assert.match(messageStoreSource, /width: attachment\.width \?\? local\.width \?\? null/);
  assert.match(messageStoreSource, /height: attachment\.height \?\? local\.height \?\? null/);

  const submitStart = inputSource.indexOf("const handleSubmit = async");
  const catchStart = inputSource.indexOf("} catch (err) {", submitStart);
  assert.notEqual(submitStart, -1, "handleSubmit not found");
  assert.notEqual(catchStart, -1, "handleSubmit catch block not found");
  const successfulSubmitPath = inputSource.slice(submitStart, catchStart);
  assert.doesNotMatch(successfulSubmitPath, /URL\.revokeObjectURL/);
});

test("sent image attachments with preserved local previews are no longer optimistic", () => {
  assert.match(source, /function isOptimisticAttachment\(att: NonNullable<Message\["attachments"\]>\[number\]\): boolean \{/);
  assert.match(source, /return att\.id\.startsWith\("optimistic-att-"\);/);
  assert.match(source, /const lightboxImages = imageAttachments\.filter\(\(att\) => !isOptimisticAttachment\(att\)\)/);
  assert.match(source, /const isOptimistic = isOptimisticAttachment\(att\);/);
  assert.doesNotMatch(source, /const isOptimistic = !!att\.localPreviewUrl/);
});

test("image attachments without thumbnails still open the lightbox fallback", () => {
  assert.match(source, /const lightboxImages = imageAttachments\.filter\(\(att\) => !isOptimisticAttachment\(att\)\)/);
  assert.match(source, /if \(isImage && !isOptimistic\) \{[\s\S]*?useImageLightboxStore\.getState\(\)\.open\(lightboxImages, imageIndex >= 0 \? imageIndex : 0\)/);
});
