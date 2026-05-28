import { toPng } from "html-to-image";
import { useServerStore } from "../store/serverStore";

const TRANSPARENT_GIF =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const API_BASE = typeof import.meta.env?.VITE_API_URL === "string" && import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "/api";

const DEFAULT_CAPTURE_TIMEOUT_MS = 20_000;

export class SelectScreenshotTimeoutError extends Error {
  constructor(timeoutMs: number) {
    super(`Rendering timed out after ${Math.max(1, Math.ceil(timeoutMs / 1000))}s`);
    this.name = "SelectScreenshotTimeoutError";
  }
}

export function withCaptureTimeout<T>(
  promise: Promise<T>,
  timeoutMs = DEFAULT_CAPTURE_TIMEOUT_MS,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => reject(new SelectScreenshotTimeoutError(timeoutMs)), timeoutMs);
  });

  return Promise.race([promise, timeout]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

/**
 * Capture an image of the messages identified by `messageIds`.
 *
 * Pipeline (rewritten 2026-05-01 for v1.5 after huxijin's feedback in
 * #proj-mobile:fd343bd8 — "在 SLOCK 里长什么样，导出就是什么样"):
 *
 *   1. Locate each live `<div id="message-${id}">` row.
 *   2. **Deep-clone the whole row verbatim.** No more avatar/header/body
 *      reconstruction — that rewrites the DOM and drifts from the real
 *      MessageItem (wrong image sizes, dropped attachment previews, bad
 *      markdown alignment on mobile, etc.). Stripping transient UI is
 *      all we do now.
 *   3. Strip the select-indicator circle, bookmark button, and hover-only
 *      thread / download overlays — none of those are "the message",
 *      they're interaction affordances.
 *   4. Append the clones to an off-screen container whose width tracks
 *      the live chat column (so wrapping behaviour matches), then
 *      rasterize via `html-to-image`'s `toPng`. `html-to-image` preserves
 *      `display:flex`, `gap`, CSS variables, and Tailwind-class resolution
 *      far better than canvas-based rasterizers, because it goes through
 *      SVG `foreignObject`.
 *
 * Returns a `data:image/png;base64,...` URL.
 */
export interface CaptureOptions {
  backgroundColor?: string;
  pixelRatio?: number;
  timeoutMs?: number;
  /**
   * Set of message ids that should render with one-step left indent — used
   * for thread replies under their selected parent. Pure padding indent, no
   * connector line, per huxijin's v1.4 spec ("纯 padding 缩紧").
   */
  threadChildIds?: ReadonlySet<string>;
}

/**
 * Selectors for transient / interactive UI that lives inside the
 * MessageItem row but shouldn't appear in the exported image.
 *
 * Kept here as one list so it's easy to audit what we're stripping.
 * Prefer semantic selectors (testid / data-message-affordance / aria-
 * label / title) over visual class tuples — Tailwind class names drift
 * and a Tailwind rename would silently leak a button into the export.
 * Per peng's 2026-05-01 review in #proj-mobile:fd343bd8.
 */
const STRIP_SELECTORS = [
  // The select-mode indicator circle (v1.5 — was `self-center`, now
  // `self-start mt-1.5`). Stable testid — never strip by layout class.
  '[data-testid^="message-select-circle-"]',
  // All hover/static affordances marked with `data-message-affordance`
  // — bookmark, thread button, image download overlay, file download
  // overlay. Attribute is set on the affordance root in MessageItem.tsx
  // so renames of Tailwind chrome don't break the strip pass.
  "[data-message-affordance]",
];

const FREEZE_RENDERED_BOX_SELECTORS = [
  // html-to-image can re-measure compact inline-flex buttons with subtly
  // different text metrics inside the exported foreignObject. The share PNG
  // should preserve the live message chrome, so copy the live chip box.
  '[data-testid="message-thread-replies-badge"]',
];

function queryMatchingElements(root: HTMLElement, selector: string): HTMLElement[] {
  const matches = root.matches(selector) ? [root] : [];
  return matches.concat(Array.from(root.querySelectorAll<HTMLElement>(selector)));
}

function freezeCloneRenderedBoxes(source: HTMLElement, clone: HTMLElement): void {
  for (const selector of FREEZE_RENDERED_BOX_SELECTORS) {
    const sourceElements = queryMatchingElements(source, selector);
    const cloneElements = queryMatchingElements(clone, selector);
    sourceElements.forEach((sourceEl, index) => {
      const cloneEl = cloneElements[index];
      if (!cloneEl) return;
      const rect = sourceEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const width = `${rect.width}px`;
      cloneEl.style.boxSizing = "border-box";
      cloneEl.style.width = width;
      cloneEl.style.minWidth = width;
      cloneEl.style.maxWidth = width;
      cloneEl.style.height = `${rect.height}px`;
      cloneEl.style.flex = "0 0 auto";
    });
  }
}

const TEXT_LINE_BOX_SELECTORS = [
  "[data-message-selectable]",
  "[data-message-selectable] p",
  "[data-message-selectable] li",
  "[data-message-selectable] h1",
  "[data-message-selectable] h2",
  "[data-message-selectable] h3",
  "[data-message-selectable] h4",
  "[data-message-selectable] h5",
  "[data-message-selectable] h6",
  "[data-message-selectable] code",
  "[data-message-selectable] a",
  "[data-message-selectable] span",
  "[data-message-selectable] strong",
  "[data-message-selectable] em",
].join(",");

/**
 * Mutations that must be applied to the cloned message row before it
 * hits the rasterizer. Keeps the clone static (no hover transitions,
 * no cursor changes, no group-hover bleed).
 */
function sanitizeClone(clone: HTMLElement): void {
  // Drop transient UI.
  for (const sel of STRIP_SELECTORS) {
    clone.querySelectorAll(sel).forEach((n) => n.remove());
  }

  // Strip border / shadow / highlight state from the row container so
  // the exported version has a calm, neutral chrome. Drop `group` /
  // `cursor-*` too — they're interactive affordances.
  clone.classList.remove(
    "group",
    "relative",
    "hover:border-black",
    "hover:bg-white",
    "active:bg-white",
    "active:border-black",
  );
  // Border rings vary by selection / hover state; force a clean
  // transparent border so clones stack without double lines.
  clone.style.border = "2px solid transparent";
  clone.style.marginBottom = "4px";
  clone.style.background = "transparent";
}

function freezeTextLineBoxesForScreenshot(root: HTMLElement): void {
  const nodes = root.querySelectorAll<HTMLElement>(TEXT_LINE_BOX_SELECTORS);
  nodes.forEach((node) => {
    const style = window.getComputedStyle(node);
    const fontSize = style.fontSize;
    const lineHeight = style.lineHeight;
    if (fontSize.endsWith("px")) node.style.fontSize = fontSize;
    if (lineHeight.endsWith("px")) node.style.lineHeight = lineHeight;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  const reader = new FileReader();
  return new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
    reader.readAsDataURL(blob);
  });
}

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem("slock_access_token");
  const serverId = useServerStore.getState().current?.id;
  if (token) headers.Authorization = `Bearer ${token}`;
  if (serverId) headers["X-Server-Id"] = serverId;
  return headers;
}

function getImageFetchTarget(img: HTMLImageElement): { url: string; init: RequestInit } | null {
  const attachmentId = img.dataset.selectScreenshotAttachmentId;
  if (attachmentId) {
    return {
      url: `${API_BASE}/attachments/${encodeURIComponent(attachmentId)}?disposition=inline&selectScreenshot=1`,
      init: {
        headers: getAuthHeaders(),
        cache: "no-cache",
      },
    };
  }

  const src = img.currentSrc || img.src || img.getAttribute("src") || "";
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) return null;

  const url = new URL(src, window.location.href);
  const sameOrigin = url.origin === window.location.origin;
  return {
    url: url.toString(),
    init: sameOrigin
      ? {
          headers: getAuthHeaders(),
          cache: "no-cache",
        }
      : {
          credentials: "omit",
          mode: "cors",
          cache: "no-cache",
        },
  };
}

function freezeRenderedImageBox(img: HTMLImageElement): void {
  const rect = img.getBoundingClientRect();
  if (rect.width > 16 && rect.height > 16) {
    img.style.width = `${rect.width}px`;
    img.style.height = `${rect.height}px`;
    return;
  }

  const sourceWidth = Number(img.dataset.selectScreenshotAttachmentWidth);
  const sourceHeight = Number(img.dataset.selectScreenshotAttachmentHeight);
  if (!Number.isFinite(sourceWidth) || !Number.isFinite(sourceHeight) || sourceWidth <= 0 || sourceHeight <= 0) {
    return;
  }

  const maxWidth = Math.min(416, img.parentElement?.parentElement?.getBoundingClientRect().width || 416);
  const maxHeight = 288;
  const scale = Math.min(1, maxWidth / sourceWidth, maxHeight / sourceHeight);
  img.style.width = `${Math.max(1, Math.round(sourceWidth * scale))}px`;
  img.style.height = `${Math.max(1, Math.round(sourceHeight * scale))}px`;
}

async function decodeImage(img: HTMLImageElement): Promise<void> {
  if (img.complete && img.naturalWidth > 0) return;
  try {
    await Promise.race([
      img.decode(),
      new Promise<void>((r) => setTimeout(r, 2000)),
    ]);
  } catch {
    /* image failed to decode; rasterize whatever the browser has */
  }
}

async function inlineImageForScreenshot(img: HTMLImageElement): Promise<void> {
  freezeRenderedImageBox(img);
  const target = getImageFetchTarget(img);
  if (!target) {
    await decodeImage(img);
    return;
  }

  const originalSrc = img.currentSrc || img.src || img.getAttribute("src") || target.url;
  try {
    const response = await fetch(target.url, target.init);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    img.src = await blobToDataUrl(await response.blob());
    await decodeImage(img);
  } catch (err) {
    // Keep the already-frozen rendered dimensions so one bad image cannot
    // collapse the whole message into a tiny placeholder in the export.
    console.warn(
      "captureSelectedMessages: image inlining failed, using placeholder",
      {
        src: originalSrc,
        fetchUrl: target.url,
        error: err,
        errMessage: err instanceof Error ? err.message : String(err),
        errName: err instanceof Error ? err.name : typeof err,
      },
    );
    img.src = TRANSPARENT_GIF;
    await decodeImage(img);
  }
}

export async function captureSelectedMessages(
  messageIds: string[],
  options: CaptureOptions = {},
): Promise<string> {
  return withCaptureTimeout(captureSelectedMessagesUnsafe(messageIds, options), options.timeoutMs);
}

async function captureSelectedMessagesUnsafe(
  messageIds: string[],
  options: CaptureOptions = {},
): Promise<string> {
  if (messageIds.length === 0) {
    throw new Error("captureSelectedMessages: no message ids");
  }

  const nodes: HTMLElement[] = [];
  for (const id of messageIds) {
    const el = document.getElementById(`message-${id}`);
    if (el) nodes.push(el);
  }
  if (nodes.length === 0) {
    throw new Error("captureSelectedMessages: no DOM matches");
  }
  nodes.sort((a, b) => {
    const pos = a.compareDocumentPosition(b);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

  // Default falls through to white per the layout color contract (post-#1272
  // main panel = white). Callers should still pass an explicit value.
  const bg = options.backgroundColor ?? "#FFFFFF";

  // Track the LIVE MESSAGE ROW's own rendered width — not the chat column /
  // parent's. Measuring the parent (chat column) lets the off-screen container
  // become wider than where the row was actually laid out (parent padding,
  // flex-1 sibling siblings, max-w constraints), which causes inline-block
  // children like `<MSG_REF_CHIP>` (`#proj-growth` etc.) to re-layout inside
  // an SVG `<foreignObject>` and overflow because the chip itself has no
  // max-width / truncate. Anchoring container width to the row's own
  // boundingClientRect keeps the clone's content area identical to live, so
  // any chip that fit in-chat continues to fit in the rasterized PNG.
  // tygg #wg-sharing:e1f749f8 2026-05-24 — first-principles root cause for
  // the recurring "share screenshot inconsistency" class of bug (see also
  // the FREEZE_RENDERED_BOX_SELECTORS pattern which is a per-callsite
  // workaround for the same SVG re-layout class).
  const liveWidth = nodes[0]?.getBoundingClientRect().width ?? 760;

  // Container placement: off-screen-left, fully opaque, normal layout.
  //
  // v1.4 used `position: fixed; transform: translateY(100vh)`. That turned
  // out to be the root cause of CI blank PNG output: `html-to-image` reads
  // computed layout via `<foreignObject>`, and fixed-position nodes
  // outside the viewport can resolve `width:auto` → 0, collapsing the
  // whole subtree. We can't use `opacity:0` or `visibility:hidden` as a
  // replacement either — both values are inline-copied into the clone
  // that html-to-image rasterizes, producing a transparent image.
  //
  // The correct first-principles fix is **off-screen-by-offset**: leave
  // the container in normal layout at `position:absolute; left:-99999px`.
  // The browser resolves widths / fonts / image layout identically to
  // on-screen content; the user never sees it because it's scrolled off
  // the left edge. This is the approach taken by modern-screenshot
  // (qq15725's active html-to-image fork) and recommended in the
  // bubkoo/html-to-image issue tracker for the blank-canvas class.
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "-1";
  container.style.width = `${liveWidth}px`;
  container.style.padding = "0";
  container.style.background = bg;
  container.style.fontFamily = getComputedStyle(document.body).fontFamily;
  container.style.color = "#141111";
  container.style.boxSizing = "border-box";
  container.setAttribute("data-select-screenshot-root", "true");

  // Brand header bar — yellow nav-bar style with Slock lockup + slock.ai domain.
  // Replaces bottom-right watermark with a top bar that matches the mobile
  // nav bar visual language (per stdrc in #wg-sharing:7ae7ab16). Header bar
  // spans container full width (no padding) for edge-to-edge visual.
  const headerBar = document.createElement("div");
  headerBar.style.display = "flex";
  headerBar.style.alignItems = "center";
  headerBar.style.justifyContent = "space-between";
  headerBar.style.padding = "8px 16px";
  headerBar.style.background = "#FFD440";
  headerBar.style.borderBottom = "2px solid #141111";
  headerBar.style.fontFamily =
    "'Space Grotesk', 'Space Mono', ui-monospace, sans-serif";


  const lockup = document.createElement("img");
  lockup.src = "/brand/slock-lockup-light.svg";
  lockup.alt = "Slock";
  lockup.style.display = "block";
  lockup.style.width = "86px";
  lockup.style.height = "auto";

  const domain = document.createElement("span");
  domain.textContent = "slock.ai";
  domain.style.fontFamily =
    "'Space Mono', ui-monospace, monospace";
  domain.style.fontSize = "12px";
  domain.style.fontWeight = "700";
  domain.style.color = "#141111";
  domain.style.opacity = "0.7";

  headerBar.appendChild(lockup);
  headerBar.appendChild(domain);
  container.appendChild(headerBar);

  // Message content area with padding (container itself has no padding
  // so the header bar spans edge-to-edge).
  const contentArea = document.createElement("div");
  contentArea.style.padding = "12px 16px 16px";

  const childIds = options.threadChildIds ?? new Set<string>();
  for (const node of nodes) {
    const id = node.getAttribute("id")?.replace(/^message-/, "") ?? "";
    const clone = node.cloneNode(true) as HTMLElement;
    sanitizeClone(clone);
    freezeCloneRenderedBoxes(node, clone);
    if (childIds.has(id)) clone.style.paddingLeft = "32px";
    contentArea.appendChild(clone);
  }
  container.appendChild(contentArea);

  document.body.appendChild(container);
  // Force layout so html-to-image reads resolved styles.
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  container.offsetHeight;
  await new Promise<void>((r) => requestAnimationFrame(() => r()));

  // Wait for web fonts so the SVG/foreignObject rasterizer doesn't
  // serialize text before glyphs are ready. Browsers emit
  // `document.fonts.ready` once every font-face explicitly loaded via
  // CSS has resolved. Without this, CI headless runs occasionally
  // race the rasterizer ahead of Inter/Space Grotesk and produce a
  // PNG with boxes where text should be — the documented second half
  // of the CI blank failure mode.
  if (typeof document.fonts?.ready === "object") {
    try {
      await document.fonts.ready;
    } catch {
      /* noop — fonts.ready rejects are non-fatal */
    }
  }

  // html-to-image serializes the off-screen subtree into SVG foreignObject.
  // Some browser/font combinations re-resolve markdown inline chips against a
  // different line box during that serialization, which can make wrapped text
  // paint over the next line in the exported PNG. Freeze the already-computed
  // text metrics in the clone only; the live message DOM remains unchanged.
  freezeTextLineBoxesForScreenshot(container);

  // Inline image sources inside the clone before rasterization. Attachment
  // thumbnails are commonly CDN URLs; if CDN CORS is missing/stale,
  // `html-to-image` cannot serialize them from the cloned <img>. MessageItem
  // marks attachment images with `data-select-screenshot-attachment-id`, so
  // we can fetch the protected same-origin attachment stream with the current
  // auth/server headers and swap it to a data URL before rendering.
  //
  // We also freeze each image's rendered box before replacing src. If a single
  // image still fails, the export keeps the live message layout instead of
  // collapsing that media slot to a 1x1 broken-image placeholder.
  const imgs = Array.from(container.querySelectorAll("img")) as HTMLImageElement[];
  await Promise.all(imgs.map((img) => inlineImageForScreenshot(img)));

  // Root needs an explicit height so the SVG wrapper knows how tall
  // to make its viewBox. Without it, some browsers clip to content
  // height but leave an uninitialized pixel buffer around the edges,
  // which reads as "blank" on small outputs.
  const liveHeight = container.offsetHeight;

  try {
    return await toPng(container, {
      backgroundColor: bg,
      pixelRatio: options.pixelRatio ?? 2,
      // `cacheBust: true` re-fetches every img/font URL with a unique
      // query string, which defeats the decode() wait above (the new
      // URL gets a fresh pending fetch). Turn it off — we've already
      // waited for the live images to decode.
      cacheBust: false,
      skipAutoScale: true,
      width: liveWidth,
      height: liveHeight,
      // Reset positioning on the cloned root so html-to-image's
      // `<foreignObject>` renders the content at (0, 0) instead of
      // at `left:-99999px` (where rasterization would clip it away).
      // We keep the container off-screen on the *live* DOM to avoid
      // a visible flash, but the rasterized clone must be at origin.
      style: {
        position: "static",
        left: "0",
        top: "0",
      },
    });
  } finally {
    container.remove();
  }
}

/**
 * Trigger a browser download for a `data:image/png;base64,...` URL.
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
